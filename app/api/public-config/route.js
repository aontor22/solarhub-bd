export const dynamic = "force-dynamic";
export async function GET() {
  return Response.json({
    payments: {
      bkash: process.env.MANUAL_PAYMENT_BKASH_NUMBER || "",
      nagad: process.env.MANUAL_PAYMENT_NAGAD_NUMBER || "",
      bank: process.env.MANUAL_PAYMENT_BANK_INFO || ""
    },
    shippingFee: Number(process.env.SHIPPING_FEE || 150),
    freeShippingMin: Number(process.env.FREE_SHIPPING_MIN || 50000)
  });
}
