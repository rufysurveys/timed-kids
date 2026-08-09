import { NextResponse } from "next/server";
import { calculateOrder } from "@/lib/catalog";
import { createAdminClient } from "@/lib/supabase/admin";

type CheckoutBody = {
  email?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  items?: Array<{ id: number; quantity: number; name?: string }>;
};

export async function POST(request: Request) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const admin = createAdminClient();
    if (!secret || !admin) {
      return NextResponse.json(
        { error: "Payments are in setup mode. Paystack and Supabase server keys are required." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as CheckoutBody;
    if (!body.email || !body.fullName || !body.phone || !body.address || !body.city || !body.state || !body.items?.length) {
      return NextResponse.json({ error: "Complete all delivery and contact details." }, { status: 400 });
    }

    const order = calculateOrder(body.items);
    const reference = `STP-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const trackingCode = `SS${Date.now().toString().slice(-8)}${Math.floor(100 + Math.random() * 900)}`;
    const deliveryAddress = { address: body.address, city: body.city, state: body.state };
    const cartSnapshot = body.items.map((item) => ({
      id: item.id,
      name: String(item.name || "Product").slice(0, 160),
      quantity: Math.floor(Number(item.quantity)),
    }));

    const { error: orderError } = await admin.from("checkout_orders").insert({
      reference,
      tracking_code: trackingCode,
      email: body.email.toLowerCase(),
      customer_name: body.fullName,
      phone: body.phone,
      amount: order.total,
      subtotal: order.subtotal,
      delivery_fee: order.deliveryFee,
      delivery_address: deliveryAddress,
      cart_snapshot: cartSnapshot,
    });
    if (orderError) throw new Error(`Could not save order: ${orderError.message}`);

    await admin.from("tracking_events").insert({
      order_reference: reference,
      status: "pending_payment",
      title: "Order created",
      description: "Waiting for payment confirmation.",
    });

    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: body.email,
        amount: order.total * 100,
        currency: "NGN",
        reference,
        callback_url: `${origin}/payment/callback`,
        metadata: { order_reference: reference, tracking_code: trackingCode },
      }),
      cache: "no-store",
    });
    const result = await response.json();
    if (!response.ok || !result.status) throw new Error(result.message || "Paystack initialization failed.");

    return NextResponse.json({ authorizationUrl: result.data.authorization_url, reference });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to start payment." },
      { status: 500 },
    );
  }
}
