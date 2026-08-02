"use client";

import { FormEvent, useState } from "react";
import { SimpleHeader } from "@/components/simple-header";
import { store } from "@/config/store";

export default function SellPage() {
  const [submitted, setSubmitted] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      <SimpleHeader />
      <main className="seller-page">
        <section className="seller-intro">
          <div className="page-shell">
            <span>{store.shortName} FOR SELLERS</span>
            <h1>Reach more customers.<br />Grow your business.</h1>
            <p>List your products on a marketplace designed to help businesses in {store.country} sell confidently.</p>
            <div className="seller-points">
              <div><b>01</b><span><strong>Create your shop</strong><small>Tell us about your business</small></span></div>
              <div><b>02</b><span><strong>List your products</strong><small>Add pricing and inventory</small></span></div>
              <div><b>03</b><span><strong>Start earning</strong><small>Receive secure payouts</small></span></div>
            </div>
          </div>
        </section>
        <section className="seller-form-wrap">
          <form className="seller-form" onSubmit={submit}>
            <span>SELLER APPLICATION</span>
            <h2>Tell us about your business</h2>
            <p>We&apos;ll use these details to prepare your seller profile.</p>
            {submitted ? (
              <div className="success-state"><b>✓</b><h3>Application saved</h3><p>Your form works locally. It will submit to the seller database once Supabase is connected.</p></div>
            ) : (
              <>
                <div className="form-grid">
                  <label>Full name<input required placeholder="Your full name" /></label>
                  <label>Business name<input required placeholder="Your shop name" /></label>
                  <label>Email address<input required type="email" placeholder="business@example.com" /></label>
                  <label>Phone number<input required type="tel" placeholder="+234" /></label>
                  <label>Product category<select required defaultValue=""><option value="" disabled>Select a category</option><option>Phones & electronics</option><option>Fashion</option><option>Home & living</option><option>Beauty</option><option>Groceries</option><option>Other</option></select></label>
                  <label>Business location<input required placeholder="City, State" /></label>
                </div>
                <label>About your products<textarea rows={4} placeholder="Briefly describe what you sell" /></label>
                <label className="check-label"><input type="checkbox" required /> I confirm that the information supplied is correct.</label>
                <button className="primary-button">Submit application</button>
              </>
            )}
          </form>
        </section>
      </main>
    </>
  );
}
