import { prisma } from "../../../../../lib/prisma";
import { requireAdmin } from "../../../../../lib/auth";
import { cleanText, isSameOrigin } from "../../../../../lib/security";
const STATUSES = ["PENDING","CONFIRMED","PROCESSING","SHIPPED","DELIVERED","CANCELLED"];
const PAYMENT_STATUSES = ["UNPAID","PENDING","PAID","FAILED","REFUNDED"];
export async function PATCH(req, { params }) {
  if (!isSameOrigin(req)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const status = cleanText(body.status, 30);
  const paymentStatus = cleanText(body.paymentStatus, 30);
  if (status && !STATUSES.includes(status)) return Response.json({ error: "Invalid order status." }, { status: 400 });
  if (paymentStatus && !PAYMENT_STATUSES.includes(paymentStatus)) return Response.json({ error: "Invalid payment status." }, { status: 400 });
  try {
    const order = await prisma.$transaction(async tx => {
      const current = await tx.order.findUnique({ where: { id }, include: { items: true } });
      if (!current) throw new Error("NOT_FOUND");
      if (current.status === "CANCELLED" && status && status !== "CANCELLED") throw new Error("CANCELLED_FINAL");
      if (status === "CANCELLED" && current.status !== "CANCELLED" && !current.stockRestoredAt) {
        for (const item of current.items) {
          await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
        }
      }
      const data = {};
      if (status) data.status = status;
      if (paymentStatus) data.paymentStatus = paymentStatus;
      if (status === "CANCELLED" && !current.stockRestoredAt) data.stockRestoredAt = new Date();
      const updated = await tx.order.update({ where: { id }, data, include: { items: true, user: { select: { email: true, name: true } } } });
      await tx.auditLog.create({ data: { actorId: admin.sub, action: "ORDER_UPDATE", entityType: "Order", entityId: id, meta: { status: status || current.status, paymentStatus: paymentStatus || current.paymentStatus } } });
      return updated;
    });
    return Response.json({ order });
  } catch (error) {
    if (error.message === "NOT_FOUND") return Response.json({ error: "Order not found." }, { status: 404 });
    if (error.message === "CANCELLED_FINAL") return Response.json({ error: "Cancelled orders are final because stock has already been restored." }, { status: 409 });
    console.error(error); return Response.json({ error: "Could not update order." }, { status: 500 });
  }
}
