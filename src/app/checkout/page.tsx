"use client";

import { FormEvent, useState } from "react";
import { useCart } from "@/components/cart-provider";
import { SimpleHeader } from "@/components/simple-header";

const naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const delivery = subtotal >= 50000 ? 0 : 2500;

  async function pay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/payments/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, items }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error || "Could not start payment.");
      setLoading(false);
      return;
    }
    window.location.assign(result.authorizationUrl);
  }

  return <><SimpleHeader /><main className="checkout-page page-shell">
    <div className="page-title"><span>SECURE CHECKOUT</span><h1>Delivery & payment</h1><p>Enter the destination details before continuing to Paystack.</p></div>
    <div className="checkout-layout"><form className="checkout-form" onSubmit={pay}>
      <h2>Contact information</h2><div className="form-grid">
        <label>Full name<input name="fullName" required placeholder="Recipient's full name" /></label>
        <label>Email address<input name="email" type="email" required placeholder="you@example.com" /></label>
        <label>Phone number<input name="phone" type="tel" required placeholder="+234" /></label>
        <label>State<input name="state" required placeholder="Lagos" /></label>
      </div>
      <label>City / area<input name="city" required placeholder="Ikeja" /></label>
      <label>Full delivery address<textarea name="address" rows={4} required placeholder="House number, street and nearest landmark" /></label>
      {error && <div className="checkout-error">{error}</div>}
      <button className="primary-button" disabled={loading || !items.length}>{loading ? "Connecting to Paystack..." : `Pay ${naira.format(subtotal + delivery)} securely`}</button>
      <small>Your card details are entered on Paystack and never touch Stop Shop servers.</small>
    </form><aside className="checkout-summary"><span>YOUR ORDER</span><h2>{items.length} item{items.length === 1 ? "" : "s"}</h2>
      {items.map(item => <div className="checkout-line" key={item.id}><span>{item.name}<small>Qty {item.quantity}</small></span><b>{naira.format(item.price * item.quantity)}</b></div>)}
      <dl><div><dt>Subtotal</dt><dd>{naira.format(subtotal)}</dd></div><div><dt>Delivery</dt><dd>{delivery ? naira.format(delivery) : "Free"}</dd></div><div><dt>Total</dt><dd>{naira.format(subtotal + delivery)}</dd></div></dl>
    </aside></div>
  </main></>;
}
