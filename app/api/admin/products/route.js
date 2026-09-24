import { prisma } from "../../../../lib/prisma";
import { requireAdmin } from "../../../../lib/auth";
import { cleanMultiline, cleanText, isSameOrigin, safeInt, safeUrl } from "../../../../lib/security";
export async function POST(req) {
  if (!isSameOrigin(req)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const admin = await requireAdmin(); if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const name = cleanText(b.name, 140), slug = cleanText(b.slug, 160).toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,""), sku = cleanText(b.sku, 80).toUpperCase();
  const categoryId = cleanText(b.categoryId, 80), description = cleanMultiline(b.description, 4000);
  const price = safeInt(b.price, { min: 0, max: 100000000 }), stock = safeInt(b.stock, { min: 0, max: 1000000 });
  if (!name || !slug || !sku || !categoryId || !description || price === null || stock === null) return Response.json({ error: "Name, slug, SKU, category, description, price and stock are required." }, { status: 400 });
  const imageRaw = cleanText(b.imageUrl, 1000), imageUrl = imageRaw ? safeUrl(imageRaw) : null;
  if (imageRaw && !imageUrl) return Response.json({ error: "Image URL must be http(s)." }, { status: 400 });
  try {
    const product = await prisma.product.create({ data: { name, slug, sku, categoryId, description, price, stock, brand: cleanText(b.brand,100)||null, imageUrl, warranty: cleanText(b.warranty,300)||null, specs: [], featured: Boolean(b.featured), active: b.active !== false } });
    await prisma.auditLog.create({ data: { actorId: admin.sub, action: "PRODUCT_CREATE", entityType: "Product", entityId: product.id } });
    return Response.json({ product }, { status: 201 });
  } catch (error) {
    console.error(error); if (String(error.code)==="P2002") return Response.json({ error: "Slug or SKU already exists." }, { status: 409 });
    return Response.json({ error: "Could not create product." }, { status: 500 });
  }
}
