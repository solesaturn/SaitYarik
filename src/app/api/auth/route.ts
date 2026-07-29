import { NextRequest, NextResponse } from "next/server";
import { authenticate, setSession, clearSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const action = body.action as string;

  if (action === "logout") {
    await clearSession();
    return NextResponse.json({ ok: true });
  }

  if (action === "login") {
    const user = await authenticate(String(body.email), String(body.password));
    if (!user) return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
    await setSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      customerType: user.customerType,
      b2bApproved: user.b2bApproved,
      companyName: user.companyName,
    });
    return NextResponse.json({ ok: true, role: user.role });
  }

  if (action === "register") {
    const email = String(body.email || "").toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "E-mail уже зарегистрирован" }, { status: 400 });
    const isB2B = body.customerType === "B2B";
    const user = await prisma.user.create({
      data: {
        email,
        phone: body.phone || null,
        name: body.name || null,
        passwordHash: await bcrypt.hash(String(body.password), 10),
        role: isB2B ? "B2B" : "RETAIL",
        customerType: isB2B ? "B2B" : "B2C",
        b2bApproved: false,
        companyName: body.companyName || null,
        inn: body.inn || null,
        kpp: body.kpp || null,
        legalAddress: body.legalAddress || null,
      },
    });
    if (isB2B) {
      await prisma.b2BRequest.create({
        data: {
          userId: user.id,
          companyName: body.companyName || "Без названия",
          inn: body.inn || "",
          contactName: body.name || email,
          phone: body.phone || "",
          email,
          type: "REGISTRATION",
          message: "Заявка на B2B-регистрацию",
        },
      });
    }
    await setSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      customerType: user.customerType,
      b2bApproved: user.b2bApproved,
      companyName: user.companyName,
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
