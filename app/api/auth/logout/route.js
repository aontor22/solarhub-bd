import { clearSession } from "../../../../lib/auth";
import { isSameOrigin } from "../../../../lib/security";
export async function POST(req) {
  if (!isSameOrigin(req)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  await clearSession();
  return Response.redirect(new URL("/", req.url), 303);
}
