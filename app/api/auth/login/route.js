import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";
import { createSession } from "../../../../lib/auth";
import { isSameOrigin, normalizeEmail, rateLimit, rateLimitResponse, requestIp } from "../../../../lib/security";

export async function POST(req) {
  if (!isSameOrigin(req)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  try {
    const body = await req.json();
    const email = normalizeEmail(body.email);
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) return Response.json({ error: "Email and password are required." }, { status: 400 });

    const limited = await rateLimit("login", `${requestIp(req)}:${email}`, 10, 15 * 60);
    if (!limited.ok) return rateLimitResponse(limited.retryAfter);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return Response.json({ error: "Invalid email or password." }, { status: 401 });
    }
    await createSession(user);
    return Response.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not sign in." }, { status: 500 });
  }
}
