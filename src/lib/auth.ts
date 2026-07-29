import { cookies } from "next/headers";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
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

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  try {
    const data = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as SessionUser;
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
  const value = Buffer.from(JSON.stringify(user), "utf8").toString("base64url");
  jar.set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function authenticate(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return user;
}

export function isStaff(role: string) {
  return role === "ADMIN" || role === "MANAGER" || role === "CONTENT";
}
