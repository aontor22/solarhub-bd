import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";
import { createSession } from "../../../../lib/auth";
import { cleanText, isSameOrigin, isValidEmail, isValidPhone, normalizeEmail, rateLimit, rateLimitResponse, requestIp } from "../../../../lib/security";

export async function POST(req) {
  if (!isSameOrigin(req)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  try {
    const body = await req.json();
    const name = cleanText(body.name, 100);
    const email = normalizeEmail(body.email);
    const phone = cleanText(body.phone, 30);
    const password = typeof body.password === "string" ? body.password : "";

    const limited = await rateLimit("register", requestIp(req), 5, 60 * 60);
    if (!limited.ok) return rateLimitResponse(limited.retryAfter);

    if (name.length < 2 || !isValidEmail(email)) return Response.json({ error: "Enter a valid name and email address." }, { status: 400 });
    if (phone && !isValidPhone(phone)) return Response.json({ error: "Enter a valid phone number." }, { status: 400 });
    if (password.length < 10 || password.length > 128 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return Response.json({ error: "Password must be 10–128 characters and include at least one letter and one number." }, { status: 400 });
    }
    if (await prisma.user.findUnique({ where: { email } })) return Response.json({ error: "An account with this email already exists." }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { name, email, phone: phone || null, passwordHash } });
    await createSession(user);
    return Response.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not create account." }, { status: 500 });
  }
}
