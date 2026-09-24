import { randomUUID } from "node:crypto";
import { prisma } from "../../../lib/prisma";
import { requireUser } from "../../../lib/auth";
import { cleanMultiline, cleanText, isSameOrigin, isValidPhone, rateLimit, rateLimitResponse, safeInt } from "../../../lib/security";

function orderNo() {
  return `SHBD-${Date.now().toString(36).toUpperCase()}-${randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
}

function paymentConfig(method) {
  if (method === "BKASH") return process.env.MANUAL_PAYMENT_BKASH_NUMBER || "";
  if (method === "NAGAD") return process.env.MANUAL_PAYMENT_NAGAD_NUMBER || "";
  if (method === "BANK_TRANSFER") return process.env.MANUAL_PAYMENT_BANK_INFO || "";
  return "COD";
}

async function resolveCoupon(tx, code, subtotal) {
  const normalized = cleanText(code, 40).toUpperCase();
  if (!normalized) return { discount: 0, couponCode: null };
  const coupon = await tx.coupon.findUnique({ where: { code: normalized } });
  const now = new Date();
  if (!coupon || !coupon.active || (coupon.startsAt && coupon.startsAt > now) || (coupon.endsAt && coupon.endsAt < now)) throw new Error("COUPON_INVALID");
  if (coupon.minOrder && subtotal < coupon.minOrder) throw new Error(`COUPON_MIN:${coupon.minOrder}`);
  const percent = coupon.percentOff ? Math.floor(subtotal * coupon.percentOff / 100) : 0;
  const flat = coupon.flatOff || 0;
  return { discount: Math.min(subtotal, Math.max(percent, flat)), couponCode: coupon.code };
}

export async function POST(req) {
  if (!isSameOrigin(req)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const session = await requireUser();
  if (!session) return Response.json({ error: "Please sign in before placing an order." }, { status: 401 });
  const limited = await rateLimit("order", session.sub, 20, 60 * 60);
  if (!limited.ok) return rateLimitResponse(limited.retryAfter);

  try {
    const body = await req.json();
    const recipient = cleanText(body.recipient, 100);
    const phone = cleanText(body.phone, 30);
    const addressLine = cleanText(body.addressLine, 250);
    const area = cleanText(body.area, 100);
    const district = cleanText(body.district, 100);
    const postcode = cleanText(body.postcode, 20);
    const notes = cleanMultiline(body.notes, 1000);
    const paymentMethod = cleanText(body.paymentMethod, 30) || "CASH_ON_DELIVERY";
    const paymentSenderAccount = cleanText(body.paymentSenderAccount, 60);
    const paymentTransactionId = cleanText(body.paymentTransactionId, 100);
    const allowedPaymentMethods = ["CASH_ON_DELIVERY", "BKASH", "NAGAD", "BANK_TRANSFER"];

    if (!recipient || !isValidPhone(phone) || !addressLine || !district || !Array.isArray(body.items) || !body.items.length) {
      return Response.json({ error: "Valid delivery details and at least one cart item are required." }, { status: 400 });
    }
    if (!allowedPaymentMethods.includes(paymentMethod)) return Response.json({ error: "Unsupported payment method." }, { status: 400 });
    if (paymentMethod !== "CASH_ON_DELIVERY") {
      if (!paymentConfig(paymentMethod)) return Response.json({ error: "That manual payment method is not configured yet." }, { status: 400 });
      if (!paymentSenderAccount || !paymentTransactionId) return Response.json({ error: "Sender account and transaction/reference ID are required for manual payment." }, { status: 400 });
      if (["BKASH", "NAGAD"].includes(paymentMethod) && !isValidPhone(paymentSenderAccount)) return Response.json({ error: "Enter a valid sender phone number for mobile financial service payment." }, { status: 400 });
    }

    const qtyMap = new Map();
    for (const item of body.items) {
      const q = safeInt(item.quantity, { min: 1, max: 20 });
      const id = cleanText(item.productId, 80);
      if (id && q) qtyMap.set(id, Math.min(20, (qtyMap.get(id) || 0) + q));
    }
    const ids = [...qtyMap.keys()];
    if (!ids.length) return Response.json({ error: "Cart is empty." }, { status: 400 });

    const result = await prisma.$transaction(async tx => {
      const dbProducts = await tx.product.findMany({ where: { id: { in: ids }, active: true } });
      if (dbProducts.length !== ids.length) throw new Error("PRODUCT_MISSING");
      let subtotal = 0;
      const itemData = [];
      for (const product of dbProducts) {
        const quantity = qtyMap.get(product.id);
        if (product.stock < quantity) throw new Error(`STOCK:${product.name}`);
        subtotal += product.price * quantity;
        itemData.push({ productId: product.id, name: product.name, sku: product.sku, unitPrice: product.price, quantity });
      }
      const { discount, couponCode } = await resolveCoupon(tx, body.couponCode, subtotal);
      const freeShippingMin = Math.max(0, Number(process.env.FREE_SHIPPING_MIN || 50000));
      const baseShipping = Math.max(0, Number(process.env.SHIPPING_FEE || 150));
      const shippingFee = subtotal - discount >= freeShippingMin ? 0 : baseShipping;
      const total = Math.max(0, subtotal + shippingFee - discount);
      const isManual = paymentMethod !== "CASH_ON_DELIVERY";

      const order = await tx.order.create({
        data: {
          orderNo: orderNo(), userId: session.sub, paymentMethod,
          paymentStatus: isManual ? "PENDING" : "UNPAID",
          paymentSenderAccount: isManual ? paymentSenderAccount : null,
          paymentTransactionId: isManual ? paymentTransactionId : null,
          paymentSubmittedAt: isManual ? new Date() : null,
          subtotal, shippingFee, discount, couponCode, total,
          recipient, phone, addressLine, area: area || null, district, postcode: postcode || null, notes: notes || null,
          items: { create: itemData }
        }, include: { items: true }
      });

      for (const product of dbProducts) {
        const quantity = qtyMap.get(product.id);
        const updated = await tx.product.updateMany({ where: { id: product.id, stock: { gte: quantity } }, data: { stock: { decrement: quantity } } });
        if (updated.count !== 1) throw new Error(`STOCK:${product.name}`);
      }
      return order;
    }, { isolationLevel: "Serializable" });

    return Response.json({ order: result }, { status: 201 });
  } catch (error) {
    console.error(error);
    const msg = String(error?.message || "");
    if (msg.startsWith("STOCK:")) return Response.json({ error: `Not enough stock for ${msg.split(":").slice(1).join(":")}.` }, { status: 409 });
    if (msg === "PRODUCT_MISSING") return Response.json({ error: "One or more cart products are no longer available." }, { status: 409 });
    if (msg === "COUPON_INVALID") return Response.json({ error: "Coupon code is invalid or expired." }, { status: 400 });
    if (msg.startsWith("COUPON_MIN:")) return Response.json({ error: `This coupon requires a minimum order of ৳${Number(msg.split(":")[1]).toLocaleString("en-BD")}.` }, { status: 400 });
    if (error?.code === "P2034" || msg.includes("could not serialize") || msg.includes("Transaction failed")) return Response.json({ error: "Inventory changed while you were checking out. Please try again." }, { status: 409 });
    if (error?.code === "P2002") return Response.json({ error: "That payment reference or order identifier has already been used. Please verify the transaction details." }, { status: 409 });
    return Response.json({ error: "Could not create order." }, { status: 500 });
  }
}

export async function GET() {
  const session = await requireUser();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const orders = await prisma.order.findMany({ where: { userId: session.sub }, orderBy: { createdAt: "desc" }, include: { items: true } });
  return Response.json({ orders });
}
