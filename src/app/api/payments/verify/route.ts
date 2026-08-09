import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference");
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const admin = createAdminClient();
  if (!reference || !secret || !admin) return NextResponse.json({ error: "Payment verification is not configured." }, { status: 400 });

  const { data: order } = await admin.from("checkout_orders").select("reference,tracking_code,amount,payment_status").eq("reference", reference).single();
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` }, cache: "no-store",
  });
  const result = await response.json();
  const paid = response.ok && result.status && result.data?.status === "success" && result.data?.amount === Math.round(Number(order.amount) * 100);

  if (paid && order.payment_status !== "paid") {
    await admin.from("checkout_orders").update({ payment_status: "paid", fulfillment_status: "processing", paid_at: new Date().toISOString() }).eq("reference", reference);
    await admin.from("tracking_events").insert({ order_reference: reference, status: "paid", title: "Payment confirmed", description: "Your order is now being prepared." });
  }

  return NextResponse.json({ paid, reference, trackingCode: order.tracking_code, status: paid ? "paid" : result.data?.status || "pending" });
}
