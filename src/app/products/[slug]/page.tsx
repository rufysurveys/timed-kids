import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SimpleHeader } from "@/components/simple-header";
import { ProductActions } from "@/components/product-actions";
import { getProduct, naira, products } from "@/lib/catalog";

export function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <>
      <SimpleHeader />
      <main className="inner-page page-shell">
        <nav className="breadcrumbs"><Link href="/">Shop</Link><span>/</span><span>{product.category}</span></nav>
        <section className="product-detail">
          <div className="product-detail-image"><Image src={product.image} alt={product.name} fill priority sizes="(max-width: 700px) 100vw, 50vw" /></div>
          <div className="product-detail-copy">
            <span>{product.category}</span>
            <h1>{product.name}</h1>
            <p className="detail-rating"><b>★ {product.rating}</b> from {product.reviews} verified reviews</p>
            <div className="detail-price"><strong>{naira.format(product.price)}</strong>{product.oldPrice && <del>{naira.format(product.oldPrice)}</del>}</div>
            <p>{product.description}</p>
            <ul><li>Delivery available nationwide</li><li>Secure payment processing</li><li>Seven-day return window</li></ul>
            <ProductActions product={product} />
          </div>
        </section>
      </main>
    </>
  );
}
