import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import { isProductionLike } from "@/lib/secrets";

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/** Basic-auth для CommerceML. В проде без CML_LOGIN/PASSWORD — отказ. */
export function authorizeCml(req: NextRequest): boolean {
  const login = process.env.CML_LOGIN || process.env.ONE_C_LOGIN;
  const password = process.env.CML_PASSWORD || process.env.ONE_C_PASSWORD;

  let expectedUser = login;
  let expectedPass = password;

  if (!expectedUser || !expectedPass) {
    if (isProductionLike() && process.env.ALLOW_DEMO_1C !== "1") {
      return false;
    }
    expectedUser = "1c";
    expectedPass = "1c";
  }

  const header = req.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return false;
  try {
    const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
    const i = decoded.indexOf(":");
    if (i < 0) return false;
    const user = decoded.slice(0, i);
    const pass = decoded.slice(i + 1);
    return safeEqual(user, expectedUser) && safeEqual(pass, expectedPass);
  } catch {
    return false;
  }
}
