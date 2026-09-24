import crypto from "node:crypto";
import { prisma } from "./prisma";

export function cleanText(value, max = 500) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export function cleanMultiline(value, max = 2000) {
  if (typeof value !== "string") return "";
  return value.replace(/\u0000/g, "").trim().slice(0, max);
}

export function normalizeEmail(value) {
  return cleanText(value, 254).toLowerCase();
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export function isValidPhone(value) {
  const phone = cleanText(value, 30).replace(/[\s()-]/g, "");
  return /^(?:\+?8801|01)[3-9]\d{8}$/.test(phone) || /^\+?[1-9]\d{7,14}$/.test(phone);
}

export function safeInt(value, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) return null;
  return n;
}

export function safeUrl(value) {
  const raw = cleanText(value, 1000);
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return ["http:", "https:"].includes(u.protocol) ? u.toString() : null;
  } catch { return null; }
}

export function requestIp(req) {
  return cleanText((req.headers.get("x-forwarded-for") || "").split(",")[0] || req.headers.get("x-real-ip") || "unknown", 80);
}

export function isSameOrigin(req) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host;
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    return Boolean(host && originHost === host);
  } catch { return false; }
}

export async function rateLimit(scope, identifier, limit, windowSeconds) {
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000));
  const hash = crypto.createHash("sha256").update(String(identifier)).digest("hex").slice(0, 24);
  const id = `${scope}:${hash}:${bucket}`;
  const expiresAt = new Date((bucket + 1) * windowSeconds * 1000);
  try {
    const row = await prisma.rateLimit.upsert({
      where: { id },
      create: { id, count: 1, expiresAt },
      update: { count: { increment: 1 } }
    });
    if (Math.random() < 0.02) prisma.rateLimit.deleteMany({ where: { expiresAt: { lt: new Date() } } }).catch(() => {});
    return { ok: row.count <= limit, retryAfter: Math.max(1, Math.ceil((expiresAt.getTime() - Date.now()) / 1000)) };
  } catch (error) {
    console.error("Rate limiter error", error);
    return { ok: true, retryAfter: 0 };
  }
}

export function rateLimitResponse(retryAfter) {
  return Response.json({ error: "Too many requests. Please try again shortly." }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
}
