"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { SimpleHeader } from "@/components/simple-header";
import { useCart } from "@/components/cart-provider";

function PaymentResult() {
  const reference = useSearchParams().get("reference");
  const { clearCart } = useCart();
  const [result, setResult] = useState<{ paid?: boolean; trackingCode?: string; error?: string } | null>(null);
  useEffect(() => {
    if (!reference) { queueMicrotask(() => setResult({ error: "Missing payment reference." })); return; }
    fetch(`/api/payments/verify?reference=${encodeURIComponent(reference)}`).then(res => res.json()).then(data => { setResult(data); if (data.paid) clearCart(); }).catch(() => setResult({ error: "Could not verify payment." }));
  }, [reference, clearCart]);
  if (!result) return <div className="payment-state"><div className="status-spinner" /><h1>Confirming your payment</h1><p>Please keep this page open.</p></div>;
  if (!result.paid) return <div className="payment-state"><b className="status-icon failed">!</b><h1>Payment not confirmed</h1><p>{result.error || "The payment may still be pending. You have not been marked as paid."}</p><Link className="primary-button" href="/cart">Return to cart</Link></div>;
  return <div className="payment-state"><b className="status-icon">✓</b><span>PAYMENT SUCCESSFUL</span><h1>Thank you for your order</h1><p>We have received your payment and started preparing your items.</p><div className="tracking-code"><small>YOUR TRACKING CODE</small><strong>{result.trackingCode}</strong></div><Link className="primary-button" href={`/track?code=${result.trackingCode}`}>Track your delivery</Link></div>;
}

export default function CallbackPage() { return <><SimpleHeader /><main className="payment-page page-shell"><Suspense fallback={<div className="payment-state">Loading...</div>}><PaymentResult /></Suspense></main></>; }
