"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { SimpleHeader } from "@/components/simple-header";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";
import { store } from "@/config/store";

export default function AccountPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const configured = hasSupabaseConfig();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!configured) {
      setMessage("Account services are in setup mode. Add the Supabase project keys to activate them.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const fullName = String(form.get("fullName") || "");
    const supabase = createClient();
    setLoading(true);

    const result =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName, role: "customer" } },
          })
        : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    setMessage(
      result.error
        ? result.error.message
        : mode === "signup"
          ? "Account created. Check your email to confirm your address."
          : "Welcome back. You are now signed in.",
    );
  }

  return (
    <>
      <SimpleHeader />
      <main className="auth-page">
        <section className="auth-aside">
          <div>
            <span>WELCOME TO {store.shortName}</span>
            <h1>Shopping feels better when it&apos;s yours.</h1>
            <p>Save favourite products, follow every delivery and enjoy a faster checkout.</p>
            <ul><li>✓ Secure account</li><li>✓ Order tracking</li><li>✓ Exclusive offers</li></ul>
          </div>
        </section>
        <section className="auth-panel">
          <div className="auth-card">
            <span>{mode === "login" ? "WELCOME BACK" : `JOIN ${store.shortName}`}</span>
            <h2>{mode === "login" ? "Sign in to your account" : "Create your account"}</h2>
            <p>{mode === "login" ? "Enter your details to continue." : "It only takes a minute to get started."}</p>

            {!configured && <div className="setup-notice"><b>Setup mode</b> Authentication UI is ready. Supabase keys are required before accounts can be created.</div>}

            <form onSubmit={submit}>
              {mode === "signup" && <label>Full name<input name="fullName" placeholder="Your full name" required /></label>}
              <label>Email address<input name="email" type="email" placeholder="you@example.com" required /></label>
              <label>Password<input name="password" type="password" minLength={8} placeholder="At least 8 characters" required /></label>
              <button className="primary-button" disabled={loading}>{loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}</button>
            </form>
            {message && <p className="form-message">{message}</p>}
            <div className="auth-switch">
              {mode === "login" ? `New to ${store.name}?` : "Already have an account?"}
              <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>
                {mode === "login" ? "Create an account" : "Sign in"}
              </button>
            </div>
            {store.features.sellerOnboarding && <Link className="seller-account-link" href="/sell">Want to sell products? Open a seller account →</Link>}
          </div>
        </section>
      </main>
    </>
  );
}
