import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const COOKIE_NAME = "ap_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 घंटे तक login रहेगा

function adminPassword() {
  return process.env.ADMIN_PASSWORD || "akelwa123";
}

function secret() {
  return process.env.ADMIN_SESSION_SECRET || `akelwa-session-${adminPassword()}`;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/** password सही है या नहीं (timing-safe) */
export function checkPassword(input: string) {
  const a = Buffer.from(input ?? "", "utf8");
  const b = Buffer.from(adminPassword(), "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + MAX_AGE_SECONDS * 1000 }), "utf8").toString(
    "base64url"
  );
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token?: string | null) {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = sign(payload);
  if (sig.length !== expected.length) return false;
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp: number };
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

/** इस request के लिए admin logged-in है या नहीं */
export function isAdmin() {
  return verifyToken(cookies().get(COOKIE_NAME)?.value);
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE_SECONDS,
    // HTTPS न हो (सिर्फ़ http://IP) तो .env.local में ALLOW_INSECURE_COOKIE=1 रखें, वरना login नहीं चलेगा
    secure: process.env.NODE_ENV === "production" && process.env.ALLOW_INSECURE_COOKIE !== "1",
  };
}

export function usingDefaultPassword() {
  return !process.env.ADMIN_PASSWORD;
}
