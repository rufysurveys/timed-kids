"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { SimpleHeader } from "@/components/simple-header";
import { naira, productFromRow, type Product, type StoreProductRow } from "@/lib/catalog";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";

type StoreOrder = { id: string; reference: string; total: number; status: string; created_at: string };

export default function OwnerPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [signup, setSignup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const configured = hasSupabaseConfig();

  const loadDashboard = useCallback(async () => {
    const supabase = createClient();
    const [productResult, orderResult] = await Promise.all([
      supabase.from("store_products").select("*").order("created_at", { ascending: false }),
      supabase.from("store_orders").select("id,reference,total,status,created_at").order("created_at", { ascending: false }),
    ]);
    if (productResult.error || orderResult.error) setMessage(productResult.error?.message || orderResult.error?.message || "Unable to load dashboard.");
    setProducts(((productResult.data || []) as StoreProductRow[]).map(productFromRow));
    setOrders((orderResult.data || []) as StoreOrder[]);
  }, []);

  useEffect(() => {
    if (!configured) return queueMicrotask(() => setLoading(false));
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setAuthenticated(Boolean(data.session));
      if (data.session) loadDashboard();
      setLoading(false);
    });
  }, [configured, loadDashboard]);

  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(""); setLoading(true);
    const form = new FormData(event.currentTarget); const email = String(form.get("email")); const password = String(form.get("password"));
    const supabase = createClient();
    const result = signup ? await supabase.auth.signUp({ email, password }) : await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (result.error) return setMessage(result.error.message);
    if (signup && !result.data.session) return setMessage("Account created. Confirm the email, then return and sign in.");
    setAuthenticated(true); await loadDashboard();
  }

  async function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const formElement = event.currentTarget; const form = new FormData(formElement); const file = form.get("image") as File; const supabase = createClient();
    const slug = `${String(form.get("name")).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now().toString(36)}`;
    const path = `${slug}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`;
    const upload = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
    if (upload.error) { setLoading(false); return setMessage(upload.error.message); }
    const { data: publicImage } = supabase.storage.from("product-images").getPublicUrl(path);
    const result = await supabase.from("store_products").insert({ slug, name: String(form.get("name")), category: String(form.get("category")), description: String(form.get("description")), price: Number(form.get("price")), old_price: form.get("oldPrice") ? Number(form.get("oldPrice")) : null, stock: Number(form.get("stock")), image_url: publicImage.publicUrl, badge: String(form.get("badge") || "") || null }).select().single();
    setLoading(false);
    if (result.error) return setMessage(result.error.message);
    formElement.reset(); setMessage("Product published successfully."); await loadDashboard();
  }

  async function editProduct(product: Product) {
    const name = window.prompt("Product name", product.name); if (!name) return;
    const price = Number(window.prompt("Price in naira", String(product.price))); const stock = Number(window.prompt("Stock quantity", String(product.stock ?? 0)));
    if (!Number.isFinite(price) || !Number.isFinite(stock)) return setMessage("Enter valid numbers for price and stock.");
    const { error } = await createClient().from("store_products").update({ name, price, stock, updated_at: new Date().toISOString() }).eq("id", product.id);
    if (error) return setMessage(error.message); await loadDashboard();
  }

  async function removeProduct(product: Product) {
    if (!window.confirm(`Remove ${product.name}?`)) return;
    const { error } = await createClient().from("store_products").delete().eq("id", product.id);
    if (error) return setMessage(error.message); await loadDashboard();
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await createClient().from("store_orders").update({ status }).eq("id", id);
    if (error) return setMessage(error.message); await loadDashboard();
  }

  async function logout() { await createClient().auth.signOut(); setAuthenticated(false); }

  if (!configured) return <><SimpleHeader /><main className="owner-login"><div className="auth-card"><h2>Supabase setup required</h2><p>Add the project URL and publishable key to activate this dashboard.</p></div></main></>;
  if (!authenticated) return <><SimpleHeader /><main className="owner-login"><form className="auth-card" onSubmit={authenticate}><span>TIMED KIDS OWNER</span><h2>{signup ? "Create owner account" : "Owner sign in"}</h2><p>Only the authorized Timed Kids email can manage the store.</p><label>Email<input name="email" type="email" required /></label><label>Password<input name="password" type="password" minLength={8} required /></label><button className="primary-button" disabled={loading}>{loading ? "Please wait..." : signup ? "Create account" : "Sign in"}</button>{message && <p className="form-message">{message}</p>}<button className="text-button" type="button" onClick={() => { setSignup(!signup); setMessage(""); }}>{signup ? "Already registered? Sign in" : "First time? Create owner account"}</button></form></main></>;

  return <><SimpleHeader /><main className="inner-page page-shell"><div className="owner-heading"><div className="page-title"><span>SHOP OWNER</span><h1>Store dashboard</h1><p>Products and orders are shared securely across every device.</p></div><button className="text-button" onClick={logout}>Sign out</button></div>{message && <p className="form-message dashboard-message">{message}</p>}<div className="owner-stats"><article><span>Products</span><b>{products.length}</b></article><article><span>Orders</span><b>{orders.length}</b></article><article><span>Order value</span><b>{naira.format(orders.reduce((sum, order) => sum + Number(order.total), 0))}</b></article></div><section className="owner-section"><h2>Publish a product</h2><form className="owner-product-form" onSubmit={addProduct}><input name="name" placeholder="Product name" required /><input name="category" placeholder="Category" required /><input name="price" type="number" min="0" placeholder="Price" required /><input name="oldPrice" type="number" min="0" placeholder="Old price (optional)" /><input name="stock" type="number" min="0" placeholder="Stock" required /><input name="badge" placeholder="Badge (optional)" /><input name="description" placeholder="Product description" required /><label className="file-input">Product image<input name="image" type="file" accept="image/jpeg,image/png,image/webp" required /></label><button className="primary-button" disabled={loading}>{loading ? "Publishing..." : "Publish product"}</button></form></section><section className="owner-section"><h2>Products</h2><div className="owner-list">{products.map((product) => <article key={product.id}><div><b>{product.name}</b><small>{product.category} · {naira.format(product.price)} · {product.stock ?? 0} in stock</small></div><div className="owner-row-actions"><button onClick={() => editProduct(product)}>Edit</button><button onClick={() => removeProduct(product)}>Remove</button></div></article>)}</div></section><section className="owner-section"><h2>Recent orders</h2><div className="owner-list">{orders.length ? orders.map((order) => <article key={order.id}><div><b>{order.reference}</b><small>{new Date(order.created_at).toLocaleString()} · {naira.format(Number(order.total))}</small></div><select value={order.status} onChange={(event) => updateStatus(order.id, event.target.value)}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="processing">Processing</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></article>) : <p>No orders yet.</p>}</div></section></main></>;
}
