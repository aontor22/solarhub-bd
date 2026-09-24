import { prisma } from "../../../../../lib/prisma";
import { requireAdmin } from "../../../../../lib/auth";
import { cleanMultiline, cleanText, isSameOrigin, safeInt, safeUrl } from "../../../../../lib/security";
export async function PATCH(req, { params }) {
  if (!isSameOrigin(req)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params; const body = await req.json(); const data = {};
  if (body.name !== undefined) { const v = cleanText(body.name, 140); if (!v) return Response.json({ error: "Product name is required." }, { status: 400 }); data.name = v; }
  if (body.description !== undefined) data.description = cleanMultiline(body.description, 4000);
  if (body.brand !== undefined) data.brand = cleanText(body.brand, 100) || null;
  if (body.imageUrl !== undefined) { const raw = cleanText(body.imageUrl, 1000); const url = raw ? safeUrl(raw) : null; if (raw && !url) return Response.json({ error: "Image URL must be http(s)." }, { status: 400 }); data.imageUrl = url; }
  if (body.price !== undefined) { const v = safeInt(body.price, { min: 0, max: 100000000 }); if (v === null) return Response.json({ error: "Invalid price." }, { status: 400 }); data.price = v; }
  if (body.stock !== undefined) { const v = safeInt(body.stock, { min: 0, max: 1000000 }); if (v === null) return Response.json({ error: "Invalid stock." }, { status: 400 }); data.stock = v; }
  if (body.lowStockThreshold !== undefined) { const v = safeInt(body.lowStockThreshold, { min: 0, max: 10000 }); if (v === null) return Response.json({ error: "Invalid low-stock threshold." }, { status: 400 }); data.lowStockThreshold = v; }
  if (body.featured !== undefined) data.featured = Boolean(body.featured);
  if (body.active !== undefined) data.active = Boolean(body.active);
  if (body.warranty !== undefined) data.warranty = cleanText(body.warranty, 300) || null;
  try {
    const product = await prisma.product.update({ where: { id }, data, include: { category: true } });
    await prisma.auditLog.create({ data: { actorId: admin.sub, action: "PRODUCT_UPDATE", entityType: "Product", entityId: id, meta: { fields: Object.keys(data) } } });
    return Response.json({ product });
  } catch (error) { console.error(error); return Response.json({ error: "Could not update product." }, { status: 500 }); }
}
