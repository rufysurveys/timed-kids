"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { SimpleHeader } from "@/components/simple-header";
import { naira } from "@/lib/catalog";
import { storageKey, store } from "@/config/store";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";

type TrackedOrder = { reference: string; total: number; status: string; createdAt: string };

export default function TrackPage() {
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [searched, setSearched] = useState(false);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reference = String(new FormData(event.currentTarget).get("reference")).trim().toUpperCase();
    let result: TrackedOrder | null = null;
    if (hasSupabaseConfig()) {
      const response = await createClient().rpc("track_store_order", { order_reference: reference });
      if (response.data?.[0]) result = response.data[0] as TrackedOrder;
    }
    if (!result) {
      const orders = JSON.parse(window.localStorage.getItem(storageKey("orders")) || "[]") as TrackedOrder[];
      result = orders.find((item) => item.reference.toUpperCase() === reference) || null;
    }
    setOrder(result);
    setSearched(true);
  }

  return <><SimpleHeader /><main className="inner-page page-shell track-page"><div className="page-title"><span>ORDER TRACKING</span><h1>Where is my order?</h1><p>Enter the reference shown after checkout.</p></div><form className="track-form" onSubmit={search}><input name="reference" placeholder={`${store.orderPrefix}-XXXX`} required /><button className="primary-button">Track order</button></form>{order ? <section className="tracking-result"><span className={`status-badge status-${order.status}`}>{order.status}</span><h2>{order.reference}</h2><p>Placed {new Date(order.createdAt || (order as TrackedOrder & { created_at?: string }).created_at || "").toLocaleString()} · Total {naira.format(Number(order.total))}</p><div className="tracking-steps"><i className="done" /><span>Order received</span><i className={order.status !== "pending" ? "done" : ""} /><span>Confirmed</span><i className={order.status === "delivered" ? "done" : ""} /><span>Delivered</span></div><a className="primary-button whatsapp-button" href={`https://wa.me/${store.contact.whatsapp}?text=${encodeURIComponent(`Hello ${store.name}, please help me with order ${order.reference}.`)}`}>Ask on WhatsApp</a></section> : searched && <section className="empty-state"><h3>Order not found</h3><p>Check the reference and try again, or contact us on WhatsApp.</p></section>}<Link className="back-shop" href="/">← Continue shopping</Link></main></>;
}
