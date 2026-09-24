import { prisma } from "../../../lib/prisma";
import { cleanMultiline, cleanText, isSameOrigin, isValidPhone, rateLimit, rateLimitResponse, requestIp } from "../../../lib/security";
export async function POST(req) {
  if (!isSameOrigin(req)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const limited = await rateLimit("service", requestIp(req), 5, 60 * 60);
  if (!limited.ok) return rateLimitResponse(limited.retryAfter);
  try {
    const body = await req.json();
    const name = cleanText(body.name, 100), phone = cleanText(body.phone, 30), projectType = cleanText(body.projectType, 80);
    const location = cleanText(body.location, 150), notes = cleanMultiline(body.notes, 1500);
    if (!name || !isValidPhone(phone) || !projectType) return Response.json({ error: "Name, a valid phone number and project type are required." }, { status: 400 });
    let preferredAt = null;
    if (body.preferredAt) {
      preferredAt = new Date(body.preferredAt);
      if (Number.isNaN(preferredAt.getTime())) return Response.json({ error: "Preferred date is invalid." }, { status: 400 });
    }
    const request = await prisma.serviceRequest.create({ data: { name, phone, projectType, location: location || null, preferredAt, notes: notes || null } });
    return Response.json({ request: { id: request.id, status: request.status } }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Could not save service request." }, { status: 500 });
  }
}
