"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { store } from "@/config/store";

export function SimpleHeader() {
  const { count } = useCart();

  return (
    <header className="simple-header">
      <div className="page-shell simple-header-inner">
        <Link className="logo" href="/">
          <span className="logo-mark">{store.initials}</span>
          <span>{store.shortName}</span>
        </Link>
        <nav>
          <Link href="/">Continue shopping</Link>
          <Link href="/account">Account</Link>
          <Link href="/owner">Owner</Link>
          <Link className="cart-pill" href="/cart">Cart <span>{count}</span></Link>
        </nav>
      </div>
    </header>
  );
}
