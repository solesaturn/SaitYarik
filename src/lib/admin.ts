import { NextResponse } from "next/server";
import { getSession, isStaff } from "@/lib/auth";

export async function requireStaff() {
  const session = await getSession();
  if (!session || !isStaff(session.role)) {
    return { session: null, error: NextResponse.json({ error: "Нет доступа" }, { status: 401 }) };
  }
  return { session, error: null };
}
