import { createHash } from "crypto";

/** Секреты приложения. Предпочтительно SESSION_SECRET в env (≥16 символов). */

export function isProductionLike() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET;
  if (secret && secret !== "change-me-in-production" && secret.length >= 16) {
    return secret;
  }

  // На Vercel без явного секрета — производный ключ из project id (не лежит в git)
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (projectId) {
    return createHash("sha256").update(`saityarik-session:${projectId}`).digest("hex");
  }

  if (isProductionLike()) {
    throw new Error(
      "SESSION_SECRET (или NEXTAUTH_SECRET) должен быть задан в окружении (≥16 символов)"
    );
  }

  return "dev-only-insecure-session-secret";
}
