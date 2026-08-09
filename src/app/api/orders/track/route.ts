import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim();
  const admin = createAdminClient();
  if (!code || !admin) return NextResponse.json({ error: "Tracking is not configured or the code is missing." }, { status: 400 });

  const { data: order } = await admin.from("checkout_orders").select("reference,tracking_code,customer_name,fulfillment_status,payment_status,delivery_address,created_at").or(`tracking_code.eq.${code},reference.eq.${code}`).single();
  if (!order) return NextResponse.json({ error: "We could not find an order with that tracking code." }, { status: 404 });
  const { data: events } = await admin.from("tracking_events").select("status,title,description,location,created_at").eq("order_reference", order.reference).order("created_at", { ascending: true });
  return NextResponse.json({ order, events: events || [] });
}
