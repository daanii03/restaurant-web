import crypto from "node:crypto";

const ADMIN_SECRET = import.meta.env.ADMIN_SECRET;

export function verifySession(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return false;
  const [sessionId, hmac] = parts;
  if (!sessionId || !hmac) return false;
  const expected = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(sessionId)
    .digest("hex");
  return hmac === expected;
}

export function createSessionCookieValue(): string {
  const sessionId = crypto.randomUUID();
  const hmac = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(sessionId)
    .digest("hex");
  return `${sessionId}.${hmac}`;
}
