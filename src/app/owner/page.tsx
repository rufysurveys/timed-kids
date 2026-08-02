"use client";

import { FormEvent, useEffect, useState } from "react";
import { SimpleHeader } from "@/components/simple-header";
import { products as seedProducts, type Product, naira } from "@/lib/catalog";
import { storageKey, store } from "@/config/store";

type LocalOrder = { reference: string; total: number; status: string; createdAt: string };

export default function OwnerPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<LocalOrder[]>([]);

  useEffect(() => {
    const hasSession = window.sessionStorage.getItem(storageKey("owner-session")) === "yes";
    const restoredProducts = JSON.parse(window.localStorage.getItem(storageKey("products")) || JSON.stringify(seedProducts)) as Product[];
    const restoredOrders = JSON.parse(window.localStorage.getItem(storageKey("orders")) || "[]") as LocalOrder[];
    queueMicrotask(() => {
      setUnlocked(hasSession);
      setProducts(restoredProducts);
      setOrders(restoredOrders);
    });
  }, []);

  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const pin = String(new FormData(event.currentTarget).get("pin"));
    if (pin !== store.owner.demoPin) return setMessage("Incorrect owner PIN.");
    window.sessionStorage.setItem(storageKey("owner-session"), "yes");
    setUnlocked(true);
    setMessage("");
  }

  function save(next: Product[]) {
    setProducts(next);
    window.localStorage.setItem(storageKey("products"), JSON.stringify(next));
  }

  function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name"));
    const nextId = Math.max(0, ...products.map(({ id }) => id)) + 1;
    const product: Product = { id: nextId, slug: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${nextId}`, name, category: String(form.get("category")), price: Number(form.get("price")), rating: 5, reviews: 0, image: String(form.get("image")), description: String(form.get("description")) || "Available from our store.", stock: Number(form.get("stock")) };
    save([product, ...products]);
    event.currentTarget.reset();
  }

  function updateStatus(reference: string, status: string) {
    const next = orders.map((order) => order.reference === reference ? { ...order, status } : order);
    setOrders(next);
    window.localStorage.setItem(storageKey("orders"), JSON.stringify(next));
  }

  function editProduct(product: Product) {
    const name = window.prompt("Product name", product.name);
    if (!name) return;
    const price = Number(window.prompt("Price in naira", String(product.price)));
    const stock = Number(window.prompt("Stock quantity", String(product.stock ?? 0)));
    if (!Number.isFinite(price) || !Number.isFinite(stock)) return;
    save(products.map((item) => item.id === product.id ? { ...item, name, price, stock } : item));
  }

  if (!unlocked) return <><SimpleHeader /><main className="owner-login"><form className="auth-card" onSubmit={login}><span>SHOP OWNER</span><h2>Open your dashboard</h2><p>Use the temporary demonstration PIN configured for this shop.</p><label>Owner PIN<input name="pin" type="password" inputMode="numeric" required /></label><button className="primary-button">Continue</button>{message && <p className="form-message">{message}</p>}</form></main></>;

  return <><SimpleHeader /><main className="inner-page page-shell"><div className="page-title"><span>SHOP OWNER</span><h1>Store dashboard</h1><p>Manage the catalogue and orders stored on this demonstration device.</p></div><div className="owner-stats"><article><span>Products</span><b>{products.length}</b></article><article><span>Orders</span><b>{orders.length}</b></article><article><span>Order value</span><b>{naira.format(orders.reduce((sum, order) => sum + order.total, 0))}</b></article></div><section className="owner-section"><h2>Add a product</h2><form className="owner-product-form" onSubmit={addProduct}><input name="name" placeholder="Product name" required /><input name="category" placeholder="Category" required /><input name="price" type="number" min="0" placeholder="Price" required /><input name="stock" type="number" min="0" placeholder="Stock" required /><input name="image" type="url" placeholder="Unsplash image URL" required /><input name="description" placeholder="Short description" /><button className="primary-button">Add product</button></form></section><section className="owner-section"><h2>Products</h2><div className="owner-list">{products.map((product) => <article key={product.id}><div><b>{product.name}</b><small>{product.category} · {naira.format(product.price)} · {product.stock ?? 0} in stock</small></div><div className="owner-row-actions"><button onClick={() => editProduct(product)}>Edit</button><button onClick={() => save(products.filter(({ id }) => id !== product.id))}>Remove</button></div></article>)}</div></section><section className="owner-section"><h2>Recent orders</h2><div className="owner-list">{orders.length ? orders.map((order) => <article key={order.reference}><div><b>{order.reference}</b><small>{new Date(order.createdAt).toLocaleString()} · {naira.format(order.total)}</small></div><select value={order.status} onChange={(event) => updateStatus(order.reference, event.target.value)}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></article>) : <p>No orders on this device yet.</p>}</div></section></main></>;
}
