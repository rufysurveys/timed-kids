"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import type { Product } from "@/lib/catalog";

export function ProductActions({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="product-actions">
      <button
        className="primary-button"
        disabled={product.stock === 0}
        onClick={() => addItem({ id: product.id, name: product.name, price: product.price, image: product.image, category: product.category })}
      >
        {product.stock === 0 ? "Out of stock" : "Add to cart"}
      </button>
      <Link href="/cart">View cart</Link>
    </div>
  );
}
