import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma";

const cookieName = "solarhub_session";

function secretKey() {
  const value = process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production" && (!value || value.length < 32)) {
    throw new Error("AUTH_SECRET must be configured with at least 32 characters in production.");
  }
  return new TextEncoder().encode(value || "development-only-secret-change-me-please-32chars");
}

export async function createSession(user) {
  const token = await new SignJWT({ sub: user.id, email: user.email, role: user.role, name: user.name })
    .setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secretKey());
  const store = await cookies();
  store.set(cookieName, token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/", maxAge: 60 * 60 * 24 * 7, priority: "high"
  });
}

export async function clearSession() {
  const store = await cookies();
  store.set(cookieName, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
}

export async function getSession() {
  const store = await cookies();
  const token = store.get(cookieName)?.value;
  if (!token) return null;
  try { return (await jwtVerify(token, secretKey())).payload; } catch { return null; }
}

export async function requireUser() {
  const session = await getSession();
  if (!session?.sub) return null;
  const user = await prisma.user.findUnique({ where: { id: String(session.sub) }, select: { id: true, name: true, email: true, phone: true, role: true } });
  return user ? { ...session, sub: user.id, role: user.role, user } : null;
}

export async function requireAdmin() {
  const session = await requireUser();
  return session?.role === "ADMIN" ? session : null;
}
