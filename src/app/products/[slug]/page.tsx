import Link from "next/link";
import { SimpleHeader } from "@/components/simple-header";
import { ProductDetailClient } from "@/components/product-detail-client";
import { getProduct, products } from "@/lib/catalog";

export function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);

  return (
    <>
      <SimpleHeader />
      <main className="inner-page page-shell">
        <nav className="breadcrumbs"><Link href="/">Shop</Link><span>/</span><span>{product?.category || "Product"}</span></nav>
        <ProductDetailClient slug={slug} initialProduct={product} />
      </main>
    </>
  );
}
