"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SimpleHeader } from "@/components/simple-header";

type TrackResult = { order?: { tracking_code: string; fulfillment_status: string; customer_name: string; delivery_address: { city?: string; state?: string }; created_at: string }; events?: Array<{ status: string; title: string; description?: string; location?: string; created_at: string }>; error?: string };

function Tracking() {
  const initial = useSearchParams().get("code") || "";
  const [code, setCode] = useState(initial);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [loading, setLoading] = useState(false);
  async function find(value: string) { if (!value) return; setLoading(true); const response = await fetch(`/api/orders/track?code=${encodeURIComponent(value)}`); setResult(await response.json()); setLoading(false); }
  useEffect(() => {
    if (initial) queueMicrotask(() => void find(initial));
  }, [initial]);
  function submit(event: FormEvent) { event.preventDefault(); void find(code); }

  return <>
    <div className="page-title track-title"><span>DELIVERY TRACKING</span><h1>Where is my order?</h1><p>Enter the tracking code from your payment confirmation.</p></div>
    <form className="track-search" onSubmit={submit}><input value={code} onChange={event => setCode(event.target.value)} placeholder="e.g. SS12345678901" required /><button className="primary-button">{loading ? "Searching..." : "Track order"}</button></form>
    {result?.error && <div className="track-error">{result.error}</div>}
    {result?.order && <section className="tracking-card"><div className="tracking-head"><div><small>TRACKING CODE</small><strong>{result.order.tracking_code}</strong></div><span>{result.order.fulfillment_status.replaceAll("_", " ")}</span></div><div className="tracking-destination"><p><small>DELIVERING TO</small><b>{result.order.customer_name}</b><span>{result.order.delivery_address.city}, {result.order.delivery_address.state}</span></p><p><small>ORDER DATE</small><b>{new Date(result.order.created_at).toLocaleDateString("en-NG", { dateStyle: "medium" })}</b></p></div><div className="timeline">{result.events?.map((event, index) => <article key={`${event.status}-${index}`} className="timeline-event"><i>✓</i><div><span>{event.title}</span><p>{event.description}</p><small>{new Date(event.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}{event.location ? ` · ${event.location}` : ""}</small></div></article>)}</div></section>}
  </>;
}

export default function TrackPage() { return <><SimpleHeader /><main className="track-page page-shell"><Suspense fallback={null}><Tracking /></Suspense></main></>; }
