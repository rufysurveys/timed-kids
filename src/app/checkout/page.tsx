"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { SimpleHeader } from "@/components/simple-header";
import { useCart } from "@/components/cart-provider";
import { naira } from "@/lib/catalog";
import { deliveryFee, storageKey, store } from "@/config/store";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";

type Receipt = { reference: string; total: number; whatsappUrl: string };

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const delivery = deliveryFee(subtotal);

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length) return;
    const customer = Object.fromEntries(new FormData(event.currentTarget));
    const order = { reference: `${store.orderPrefix}-${Math.round(event.timeStamp).toString(36).toUpperCase()}`, total: subtotal + delivery, items, status: "pending", createdAt: new Date().toISOString(), customer };
    const saved = JSON.parse(window.localStorage.getItem(storageKey("orders")) || "[]") as unknown[];
    window.localStorage.setItem(storageKey("orders"), JSON.stringify([order, ...saved]));
    if (hasSupabaseConfig()) {
      const { error } = await createClient().from("store_orders").insert({ reference: order.reference, status: "pending", customer, items, subtotal, delivery_fee: delivery, total: order.total });
      if (error) return window.alert(`The order could not be submitted: ${error.message}`);
    }
    const lines = items.map((item) => `${item.quantity}× ${item.name} — ${naira.format(item.price * item.quantity)}`).join("\n");
    const whatsappMessage = `Hello ${store.name}, I have placed order ${order.reference}.\n\n${lines}\nDelivery: ${naira.format(delivery)}\nTotal: ${naira.format(order.total)}\n\nCustomer: ${customer.fullName}\nPhone: ${customer.phone}\nAddress: ${customer.address}, ${customer.city}, ${customer.state}`;
    setReceipt({ reference: order.reference, total: order.total, whatsappUrl: `https://wa.me/${store.contact.whatsapp}?text=${encodeURIComponent(whatsappMessage)}` });
    clearCart();
  }

  if (receipt) return <><SimpleHeader /><main className="inner-page page-shell"><section className="checkout-success"><b>✓</b><span>ORDER RECEIVED</span><h1>Thank you for your order.</h1><p>Your reference is <strong>{receipt.reference}</strong>. You will pay {naira.format(receipt.total)} when your order arrives.</p><div className="success-actions"><a className="primary-button whatsapp-button" href={receipt.whatsappUrl} target="_blank" rel="noreferrer">Send order on WhatsApp</a><Link href="/">Continue shopping</Link></div></section></main></>;
  if (!items.length) return <><SimpleHeader /><main className="inner-page page-shell"><section className="empty-cart"><h2>There is nothing to check out</h2><p>Add a product to your cart before continuing.</p><Link className="primary-button" href="/">Browse products</Link></section></main></>;

  return <><SimpleHeader /><main className="inner-page page-shell">
    <div className="page-title"><span>SECURE CHECKOUT</span><h1>Delivery details</h1><p>Confirm where you would like your order delivered.</p></div>
    <form className="checkout-layout" onSubmit={placeOrder}>
      <section className="checkout-form"><h2>Contact information</h2><div className="form-grid"><label>Full name<input name="fullName" required autoComplete="name" /></label><label>Phone number<input name="phone" required type="tel" autoComplete="tel" /></label></div><label>Email address<input name="email" required type="email" autoComplete="email" /></label><h2>Delivery address</h2><label>Street address<input name="address" required autoComplete="street-address" /></label><div className="form-grid"><label>City<input name="city" required autoComplete="address-level2" /></label><label>State<input name="state" required autoComplete="address-level1" /></label></div><label>Delivery note (optional)<textarea name="note" rows={3} placeholder="Landmark or helpful directions" /></label>{store.payments.payOnDelivery && <div className="payment-choice"><input type="radio" defaultChecked readOnly /><span><b>Pay on delivery</b><small>Pay when your order reaches you.</small></span></div>}<p className="setup-notice"><b>Online payment setup</b> Enable Paystack in the store configuration after adding verified server keys.</p></section>
      <aside className="order-summary"><span>ORDER SUMMARY</span><h2>{items.length} item{items.length > 1 ? "s" : ""}</h2><dl><div><dt>Subtotal</dt><dd>{naira.format(subtotal)}</dd></div><div><dt>Delivery</dt><dd>{delivery ? naira.format(delivery) : "Free"}</dd></div><div className="summary-total"><dt>Total</dt><dd>{naira.format(subtotal + delivery)}</dd></div></dl><button className="primary-button" type="submit">Place order</button><small>Your order is saved on this device in prototype mode.</small></aside>
    </form>
  </main></>;
}
