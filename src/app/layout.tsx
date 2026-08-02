import type { Metadata } from "next";
import { CartProvider } from "@/components/cart-provider";
import "./globals.css";
import { store } from "@/config/store";

export const metadata: Metadata = {
  title: `${store.name} — ${store.tagline}`,
  description: store.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ "--green": store.theme.primary, "--green-dark": store.theme.primaryDark, "--lime": store.theme.accent } as React.CSSProperties}>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
