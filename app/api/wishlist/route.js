import { prisma } from "../../../lib/prisma";
import { requireUser } from "../../../lib/auth";
import { cleanText, isSameOrigin } from "../../../lib/security";
export async function GET() {
  const session = await requireUser();
  if (!session) return Response.json({ items: [] });
  const items = await prisma.wishlistItem.findMany({ where: { userId: session.sub }, select: { productId: true } });
  return Response.json({ items: items.map(x => x.productId) });
}
export async function POST(req) {
  if (!isSameOrigin(req)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const session = await requireUser();
  if (!session) return Response.json({ error: "Sign in to use your wishlist." }, { status: 401 });
  const { productId } = await req.json();
  const id = cleanText(productId, 80);
  const product = await prisma.product.findFirst({ where: { id, active: true }, select: { id: true } });
  if (!product) return Response.json({ error: "Product not found." }, { status: 404 });
  await prisma.wishlistItem.upsert({ where: { userId_productId: { userId: session.sub, productId: id } }, create: { userId: session.sub, productId: id }, update: {} });
  return Response.json({ ok: true });
}
export async function DELETE(req) {
  if (!isSameOrigin(req)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const session = await requireUser();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { productId } = await req.json();
  await prisma.wishlistItem.deleteMany({ where: { userId: session.sub, productId: cleanText(productId, 80) } });
  return Response.json({ ok: true });
}
