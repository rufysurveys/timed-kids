import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const signature = request.headers.get("x-paystack-signature");
  if (!secret || !signature) return new NextResponse("Unauthorized", { status: 401 });

  const rawBody = await request.text();
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  const valid = signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) return new NextResponse("Invalid signature", { status: 401 });

  const event = JSON.parse(rawBody);
  if (event.event === "charge.success") {
    const reference = event.data?.reference;
    const admin = createAdminClient();
    if (admin && reference) {
      const { data: order } = await admin.from("checkout_orders").select("amount,payment_status").eq("reference", reference).single();
      if (order && event.data.status === "success" && event.data.amount === Math.round(Number(order.amount) * 100) && order.payment_status !== "paid") {
        await admin.from("checkout_orders").update({ payment_status: "paid", fulfillment_status: "processing", paid_at: new Date().toISOString() }).eq("reference", reference);
        await admin.from("tracking_events").insert({ order_reference: reference, status: "paid", title: "Payment confirmed", description: "Your order is now being prepared." });
      }
    }
  }
  return NextResponse.json({ received: true });
}
