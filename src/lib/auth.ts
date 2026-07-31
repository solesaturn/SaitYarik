import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { getSessionSecret, isProductionLike } from "./secrets";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  customerType: string;
  b2bApproved: boolean;
  companyName: string | null;
};

const COOKIE = "sy_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 дней

type SessionPayload = {
  id: string;
  exp: number;
};

function sign(payloadB64: string): string {
  return createHmac("sha256", getSessionSecret()).update(payloadB64).digest("base64url");
}

function encodeSession(userId: string): string {
  const payload: SessionPayload = {
    id: userId,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SEC,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${payloadB64}.${sign(payloadB64)}`;
}

function decodeSession(raw: string): SessionPayload | null {
  const [payloadB64, sig] = raw.split(".");
  if (!payloadB64 || !sig) return null;
  const expected = sign(payloadB64);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const data = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as SessionPayload;
    if (!data?.id || typeof data.exp !== "number") return null;
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  try {
    const data = decodeSession(raw);
    if (!data) return null;
    const user = await prisma.user.findUnique({ where: { id: data.id } });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      customerType: user.customerType,
      b2bApproved: user.b2bApproved,
      companyName: user.companyName,
    };
  } catch {
    return null;
  }
}

export async function setSession(user: SessionUser) {
  const jar = await cookies();
  jar.set(COOKIE, encodeSession(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
    secure: isProductionLike(),
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function authenticate(email: string, password: string) {
  const normalized = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalized } });
  if (!user) return null;

  // Реальный прод: ALLOW_DEMO_LOGIN=0 отключает сидовые учётки
  if (
    process.env.ALLOW_DEMO_LOGIN === "0" &&
    ["admin@saityarik.ru", "demo@saityarik.ru", "opt@saityarik.ru"].includes(normalized)
  ) {
    return null;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return user;
}

export function isStaff(role: string) {
  return role === "ADMIN" || role === "MANAGER" || role === "CONTENT";
}

export function canApproveB2B(role: string) {
  return role === "ADMIN" || role === "MANAGER";
}
