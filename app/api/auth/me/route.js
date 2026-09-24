import { requireUser } from "../../../../lib/auth";
export async function GET() {
  const session = await requireUser();
  return Response.json({ user: session?.user || null });
}
