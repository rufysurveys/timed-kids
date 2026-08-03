"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductActions } from "@/components/product-actions";
import { naira, productFromRow, type Product, type StoreProductRow } from "@/lib/catalog";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";

export function ProductDetailClient({ slug, initialProduct }: { slug: string; initialProduct?: Product }) {
  const [product, setProduct] = useState<Product | undefined>(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);

  useEffect(() => {
    if (initialProduct || !hasSupabaseConfig()) return;
    createClient().from("store_products").select("*").eq("slug", slug).eq("is_active", true).maybeSingle().then(({ data }) => {
      if (data) setProduct(productFromRow(data as StoreProductRow));
      setLoading(false);
    });
  }, [initialProduct, slug]);

  if (loading) return <div className="empty-state"><h3>Loading product…</h3></div>;
  if (!product) return <div className="empty-state"><h3>Product not found</h3><p>This item may no longer be available.</p><Link className="primary-button" href="/">Return to shop</Link></div>;

  return <section className="product-detail"><div className="product-detail-image"><Image src={product.image} alt={product.name} fill priority sizes="(max-width: 700px) 100vw, 50vw" /></div><div className="product-detail-copy"><span>{product.category}</span><h1>{product.name}</h1><p className="detail-rating"><b>★ {product.rating}</b>{product.reviews ? ` from ${product.reviews} verified reviews` : " New arrival"}</p><div className="detail-price"><strong>{naira.format(product.price)}</strong>{product.oldPrice && <del>{naira.format(product.oldPrice)}</del>}</div><p>{product.description}</p><ul><li>{product.stock ?? 0} currently in stock</li><li>Delivery available across Nigeria</li><li>Seven-day return window</li></ul><ProductActions product={product} /></div></section>;
}
