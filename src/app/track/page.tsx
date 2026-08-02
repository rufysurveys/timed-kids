"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { SimpleHeader } from "@/components/simple-header";
import { naira } from "@/lib/catalog";
import { storageKey, store } from "@/config/store";

type TrackedOrder = { reference: string; total: number; status: string; createdAt: string };

export default function TrackPage() {
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [searched, setSearched] = useState(false);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const reference = String(new FormData(event.currentTarget).get("reference")).trim().toUpperCase();
    const orders = JSON.parse(window.localStorage.getItem(storageKey("orders")) || "[]") as TrackedOrder[];
    setOrder(orders.find((item) => item.reference.toUpperCase() === reference) || null);
    setSearched(true);
  }

  return <><SimpleHeader /><main className="inner-page page-shell track-page"><div className="page-title"><span>ORDER TRACKING</span><h1>Where is my order?</h1><p>Enter the reference shown after checkout.</p></div><form className="track-form" onSubmit={search}><input name="reference" placeholder={`${store.orderPrefix}-XXXX`} required /><button className="primary-button">Track order</button></form>{order ? <section className="tracking-result"><span className={`status-badge status-${order.status}`}>{order.status}</span><h2>{order.reference}</h2><p>Placed {new Date(order.createdAt).toLocaleString()} · Total {naira.format(order.total)}</p><div className="tracking-steps"><i className="done" /><span>Order received</span><i className={order.status !== "pending" ? "done" : ""} /><span>Confirmed</span><i className={order.status === "delivered" ? "done" : ""} /><span>Delivered</span></div><a className="primary-button whatsapp-button" href={`https://wa.me/${store.contact.whatsapp}?text=${encodeURIComponent(`Hello ${store.name}, please help me with order ${order.reference}.`)}`}>Ask on WhatsApp</a></section> : searched && <section className="empty-state"><h3>Order not found</h3><p>Check the reference and try again. Orders are currently available only on the device used for checkout.</p></section>}<Link className="back-shop" href="/">← Continue shopping</Link></main></>;
}
