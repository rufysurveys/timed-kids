"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { products as catalogProducts } from "@/lib/catalog";
import { storageKey, store } from "@/config/store";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  stock?: number;
};

const categories = [
  { name: "Girls", icon: "🎀", color: "#fcebf4" },
  { name: "Boys", icon: "🧢", color: "#eef0ff" },
  { name: "Baby", icon: "🧸", color: "#fff7dc" },
  { name: "Unisex", icon: "🌈", color: "#e7f6f1" },
  { name: "Footwear", icon: "👟", color: "#fff0e8" },
];

const seedProducts: Product[] = [
  {
    id: 1,
    name: "Oraimo FreePods 4 Wireless Earbuds",
    category: "Phones",
    price: 28900,
    oldPrice: 38000,
    rating: 4.8,
    reviews: 241,
    image:
      "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=700&q=85",
    badge: "24% OFF",
  },
  {
    id: 2,
    name: "Minimal Everyday Leather Backpack",
    category: "Fashion",
    price: 24500,
    oldPrice: 31500,
    rating: 4.7,
    reviews: 118,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=85",
    badge: "Best seller",
  },
  {
    id: 3,
    name: "Smart Watch Series 9 Fitness Edition",
    category: "Phones",
    price: 43200,
    oldPrice: 52000,
    rating: 4.6,
    reviews: 89,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85",
    badge: "17% OFF",
  },
  {
    id: 4,
    name: "Portable Bluetooth Speaker",
    category: "Computing",
    price: 18900,
    rating: 4.9,
    reviews: 315,
    image:
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=85",
    badge: "Top rated",
  },
  {
    id: 5,
    name: "Premium Coffee Maker 1.5L",
    category: "Home",
    price: 35750,
    oldPrice: 44000,
    rating: 4.5,
    reviews: 64,
    image:
      "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=700&q=85",
    badge: "19% OFF",
  },
  {
    id: 6,
    name: "Classic White Street Sneakers",
    category: "Fashion",
    price: 31900,
    oldPrice: 39000,
    rating: 4.7,
    reviews: 172,
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=700&q=85",
    badge: "18% OFF",
  },
  {
    id: 7,
    name: "Hydrating Skincare Essentials Set",
    category: "Beauty",
    price: 22400,
    rating: 4.8,
    reviews: 93,
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=700&q=85",
    badge: "New",
  },
  {
    id: 8,
    name: "Wireless Mechanical Keyboard",
    category: "Computing",
    price: 46500,
    oldPrice: 55000,
    rating: 4.6,
    reviews: 77,
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=85",
    badge: "15% OFF",
  },
];

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

function Icon({
  name,
  size = 22,
}: {
  name: "search" | "user" | "heart" | "cart" | "menu" | "arrow";
  size?: number;
}) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
    cart: <><circle cx="9" cy="20" r="1" /><circle cx="19" cy="20" r="1" /><path d="M3 4h2l2.4 10.4a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 7H6" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    arrow: <><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></>,
  };

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width={size}
    >
      {paths[name]}
    </svg>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [wishList, setWishList] = useState<number[]>([]);
  const [products, setProducts] = useState<Product[]>(catalogProducts.length ? catalogProducts : seedProducts);
  const { addItem, count: cartCount } = useCart();

  useEffect(() => {
    let restored: Product[] | null = null;
    try {
      const saved = window.localStorage.getItem(storageKey("products"));
      if (saved) restored = JSON.parse(saved) as Product[];
    } catch {
      window.localStorage.removeItem(storageKey("products"));
    }
    if (restored) queueMicrotask(() => setProducts(restored));
  }, []);

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;
      const matchesQuery = product.name
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, products, query]);

  const toggleWish = (id: number) => {
    setWishList((current) =>
      current.includes(id)
        ? current.filter((productId) => productId !== id)
        : [...current, id],
    );
  };

  return (
    <main>
      <div className="announcement">
        <p>Free delivery on orders above {naira.format(store.delivery.freeAbove)}</p>
        <div>{store.features.sellerOnboarding && <span>Sell with us</span>}<Link href="/track">Track order</Link><a href={`https://wa.me/${store.contact.whatsapp}`}>WhatsApp</a></div>
      </div>

      <header className="site-header">
        <div className="header-main page-shell">
          <button className="mobile-menu" aria-label="Open menu"><Icon name="menu" /></button>
          <a className="logo" href="#" aria-label={`${store.name} home`}>
            <span className="logo-mark">{store.initials}</span>
            <span>{store.shortName}</span>
          </a>
          <label className="search-box">
            <Icon name="search" size={20} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search products, brands and categories"
              aria-label="Search products"
            />
            <button>Search</button>
          </label>
          <nav className="header-actions" aria-label="Account actions">
            <Link className="header-action" href="/account"><Icon name="user" /><span>Account</span></Link>
            <button><Icon name="heart" /><span>Wishlist</span>{wishList.length > 0 && <i>{wishList.length}</i>}</button>
            <Link className="header-action" href="/cart"><Icon name="cart" /><span>Cart</span>{cartCount > 0 && <i>{cartCount}</i>}</Link>
          </nav>
        </div>
        <div className="category-nav page-shell">
          <button className="all-category"><Icon name="menu" size={18} /> All categories</button>
          {categories.map(({ name: category }) => (
            <button key={category} onClick={() => setActiveCategory(category)}>{category}</button>
          ))}
          <button className="deals-link">Today&apos;s deals</button>
        </div>
      </header>

      <section className="hero-wrap page-shell">
        <div className="hero">
          <div className="hero-copy">
            <span className="eyebrow">NEW SEASON COLLECTION</span>
            <h1>{store.tagline}</h1>
            <p>{store.description}</p>
            <a href="#products">Shop the collection <Icon name="arrow" size={19} /></a>
            <div className="hero-trust">
              <span><b>100%</b> secure payment</span>
              <span><b>7-day</b> easy returns</span>
              <span><b>Local</b> support</span>
            </div>
          </div>
          <div className="hero-visual" aria-label="Featured children’s clothing">
            <div className="discount-bubble"><strong>30%</strong><span>OFF</span></div>
            <Image
              src="https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=950&q=90"
              alt="Colourful children’s clothing from Timed Kids"
              fill
              priority
              sizes="(max-width: 700px) 100vw, 50vw"
            />
            <div className="floating-card"><span>Soft cotton styles</span><b>New arrival</b></div>
          </div>
        </div>
        <div className="benefits">
          <div><span>🚚</span><p><b>Fast delivery</b><small>{store.delivery.coverage}</small></p></div>
          <div><span>🛡️</span><p><b>Secure payment</b><small>Protected checkout</small></p></div>
          <div><span>↩</span><p><b>Easy returns</b><small>7-day return policy</small></p></div>
          <div><span>💬</span><p><b>Customer support</b><small>We&apos;re here to help</small></p></div>
        </div>
      </section>

      <section className="section page-shell">
        <div className="section-heading">
          <div><span>EXPLORE</span><h2>Shop by category</h2></div>
          <button onClick={() => setActiveCategory("All")}>View all <Icon name="arrow" size={18} /></button>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <button
              className={activeCategory === category.name ? "category-card active" : "category-card"}
              key={category.name}
              onClick={() => setActiveCategory(category.name)}
            >
              <span style={{ background: category.color }}>{category.icon}</span>
              <b>{category.name}</b>
              <small>Shop now</small>
            </button>
          ))}
        </div>
      </section>

      <section className="section products-section page-shell" id="products">
        <div className="section-heading">
          <div><span>HANDPICKED FOR YOU</span><h2>{activeCategory === "All" ? "Trending right now" : activeCategory}</h2></div>
          <div className="product-tabs">
            {["All", "Girls", "Boys", "Baby"].map((tab) => (
              <button className={activeCategory === tab ? "active" : ""} onClick={() => setActiveCategory(tab)} key={tab}>{tab}</button>
            ))}
          </div>
        </div>

        {visibleProducts.length > 0 ? (
          <div className="product-grid">
            {visibleProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image">
                  {product.badge && <span className="badge">{product.badge}</span>}
                  <button
                    className={wishList.includes(product.id) ? "wish active" : "wish"}
                    onClick={() => toggleWish(product.id)}
                    aria-label={`Add ${product.name} to wishlist`}
                  ><Icon name="heart" size={19} /></button>
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 700px) 50vw, (max-width: 950px) 33vw, 25vw"
                  />
                  <button
                    className="quick-add"
                    onClick={() =>
                      addItem({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        category: product.category,
                      })
                    }
                  >
                    Add to cart
                  </button>
                </div>
                <div className="product-info">
                  <small>{product.category}</small>
                  <h3>{catalogProducts.find((item) => item.id === product.id) ? <Link href={`/products/${catalogProducts.find((item) => item.id === product.id)?.slug}`}>{product.name}</Link> : product.name}</h3>
                  <div className="rating"><span>★</span> {product.rating} <small>({product.reviews})</small></div>
                  <div className="price"><b>{naira.format(product.price)}</b>{product.oldPrice && <del>{naira.format(product.oldPrice)}</del>}</div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state"><span>🔎</span><h3>No products found</h3><p>Try another search or category.</p></div>
        )}
      </section>

      {store.features.sellerOnboarding && <section className="seller-banner page-shell">
        <div>
          <span>SELL WITH US</span>
          <h2>Turn your products into profit.</h2>
          <p>Join local sellers growing their businesses on {store.name}. We provide the tools—you bring the products.</p>
          <Link className="seller-button" href="/sell">Start selling <Icon name="arrow" size={18} /></Link>
        </div>
        <div className="seller-stats">
          <p><b>0%</b><span>setup fee</span></p>
          <p><b>24/7</b><span>seller support</span></p>
          <p><b>₦</b><span>secure payouts</span></p>
        </div>
      </section>}

      <footer>
        <div className="footer-main page-shell">
          <div className="footer-brand">
            <a className="logo light" href="#"><span className="logo-mark">{store.initials}</span><span>{store.shortName}</span></a>
            <p>{store.description}</p>
            <p>{store.contact.phone}<br />{store.contact.email}</p>
          </div>
          <div><h4>Shop</h4><a href="#products">Girls</a><a href="#products">Boys</a><a href="#products">Baby</a><a href="#products">Footwear</a></div>
          <div><h4>Customer care</h4><a href="#">Help center</a><a href="#">Track an order</a><a href="#">Returns</a><a href="#">Contact us</a></div>
          <div><h4>Visit us</h4><a href={`https://wa.me/${store.contact.whatsapp}`}>WhatsApp</a><a href={`mailto:${store.contact.email}`}>Email us</a><a href="#">{store.contact.address}</a></div>
        </div>
        <div className="footer-bottom page-shell"><span>© {new Date().getFullYear()} {store.name}. All rights reserved.</span><span>Shopping in {store.country}</span></div>
      </footer>
    </main>
  );
}
