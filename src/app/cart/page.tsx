"use client";

import Image from "next/image";
import Link from "next/link";
import { SimpleHeader } from "@/components/simple-header";
import { useCart } from "@/components/cart-provider";
import { deliveryFee, store } from "@/config/store";

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const delivery = deliveryFee(subtotal);

  return (
    <>
      <SimpleHeader />
      <main className="inner-page page-shell">
        <div className="page-title">
          <span>YOUR BAG</span>
          <h1>Shopping cart</h1>
          <p>{items.length ? `${items.length} product${items.length > 1 ? "s" : ""} ready for checkout.` : "Your cart is waiting for something special."}</p>
        </div>

        {items.length === 0 ? (
          <section className="empty-cart">
            <div>🛍️</div>
            <h2>Your cart is empty</h2>
            <p>Explore the latest products and add your favourites.</p>
            <Link className="primary-button" href="/">Start shopping</Link>
          </section>
        ) : (
          <div className="cart-layout">
            <section className="cart-list">
              {items.map((item) => (
                <article className="cart-item" key={item.id}>
                  <div className="cart-thumb">
                    <Image src={item.image} alt={item.name} fill sizes="120px" />
                  </div>
                  <div className="cart-details">
                    <small>{item.category}</small>
                    <h2>{item.name}</h2>
                    <button onClick={() => removeItem(item.id)}>Remove</button>
                  </div>
                  <div className="quantity-control">
                    <button aria-label="Decrease quantity" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button aria-label="Increase quantity" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <strong>{naira.format(item.price * item.quantity)}</strong>
                </article>
              ))}
            </section>

            <aside className="order-summary">
              <span>ORDER SUMMARY</span>
              <h2>Your total</h2>
              <dl>
                <div><dt>Subtotal</dt><dd>{naira.format(subtotal)}</dd></div>
                <div><dt>Delivery</dt><dd>{delivery ? naira.format(delivery) : "Free"}</dd></div>
                <div className="summary-total"><dt>Total</dt><dd>{naira.format(subtotal + delivery)}</dd></div>
              </dl>
              {subtotal < store.delivery.freeAbove && <p>Add {naira.format(store.delivery.freeAbove - subtotal)} more for free delivery.</p>}
              <Link className="primary-button" href="/checkout">Proceed to checkout</Link>
              <small>Secure checkout powered by trusted payment providers.</small>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}
