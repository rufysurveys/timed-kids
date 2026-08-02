import { store } from "@/config/store";

export type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  description: string;
  stock?: number;
};

export const products: Product[] = [
  { id: 1, slug: "sunshine-cotton-party-dress", name: "Sunshine Cotton Party Dress", category: "Girls", price: 18500, oldPrice: 22000, rating: 4.9, reviews: 34, image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=900&q=85", badge: "Best seller", description: "A soft, cheerful cotton dress made for birthdays, outings and picture-perfect family moments.", stock: 14 },
  { id: 2, slug: "little-explorer-shirt-set", name: "Little Explorer Shirt Set", category: "Boys", price: 16500, rating: 4.8, reviews: 27, image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=85", badge: "New", description: "A smart matching shirt and shorts set with an easy fit for active days and special visits.", stock: 18 },
  { id: 3, slug: "cosy-baby-romper-pack", name: "Cosy Baby Romper Pack", category: "Baby", price: 12900, oldPrice: 15000, rating: 4.9, reviews: 51, image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=900&q=85", badge: "14% OFF", description: "Breathable everyday rompers with gentle seams and convenient fastening for quick changes.", stock: 25 },
  { id: 4, slug: "weekend-denim-jacket", name: "Weekend Denim Jacket", category: "Boys", price: 21500, rating: 4.7, reviews: 19, image: "https://images.unsplash.com/photo-1607453998774-d533f65dac99?auto=format&fit=crop&w=900&q=85", badge: "Popular", description: "A lightweight denim layer that works with tees, dresses and school-run outfits.", stock: 9 },
  { id: 5, slug: "rainbow-everyday-tee", name: "Rainbow Everyday Tee", category: "Girls", price: 7500, oldPrice: 9000, rating: 4.8, reviews: 42, image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=900&q=85", badge: "17% OFF", description: "A bright, comfortable cotton T-shirt designed for play dates and relaxed weekends.", stock: 31 },
  { id: 6, slug: "smart-occasion-suit-set", name: "Smart Occasion Suit Set", category: "Boys", price: 29500, oldPrice: 34000, rating: 4.9, reviews: 16, image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=85", badge: "Limited", description: "A polished coordinated set for weddings, celebrations and other memorable occasions.", stock: 7 },
  { id: 7, slug: "soft-knit-cardigan", name: "Soft Knit Cardigan", category: "Girls", price: 14500, rating: 4.7, reviews: 23, image: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=900&q=85", badge: "New", description: "A cosy button-up cardigan for cool mornings, evening outings and layered looks.", stock: 12 },
  { id: 8, slug: "tiny-steps-baby-set", name: "Tiny Steps Baby Gift Set", category: "Baby", price: 19800, oldPrice: 23500, rating: 5, reviews: 38, image: "https://images.unsplash.com/photo-1617331140180-e8262094733a?auto=format&fit=crop&w=900&q=85", badge: "Gift pick", description: "A coordinated newborn clothing set thoughtfully packed for baby showers and new arrivals.", stock: 11 },
  { id: 9, slug: "play-all-day-joggers", name: "Play-All-Day Joggers", category: "Unisex", price: 9800, rating: 4.8, reviews: 29, image: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=900&q=85", description: "Flexible pull-on joggers with a soft waistband for school breaks, travel and play.", stock: 22 },
  { id: 10, slug: "classic-school-polo", name: "Classic School Polo", category: "Unisex", price: 8500, rating: 4.6, reviews: 47, image: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=900&q=85", badge: "School ready", description: "A durable, breathable polo that stays neat through busy school and activity days.", stock: 36 },
  { id: 11, slug: "floral-twirl-skirt-set", name: "Floral Twirl Skirt Set", category: "Girls", price: 17200, rating: 4.9, reviews: 21, image: "https://images.unsplash.com/photo-1560785496-3c9d27877182?auto=format&fit=crop&w=900&q=85", badge: "Trending", description: "A playful top-and-skirt combination with an easy waistband and plenty of movement.", stock: 13 },
  { id: 12, slug: "everyday-canvas-sneakers", name: "Everyday Canvas Sneakers", category: "Footwear", price: 13900, oldPrice: 16500, rating: 4.7, reviews: 33, image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=85", badge: "16% OFF", description: "Lightweight lace-up sneakers made to complement casual outfits and active weekends.", stock: 20 },
];

export const categories = ["Girls", "Boys", "Baby", "Unisex", "Footwear"];

export const naira = new Intl.NumberFormat(store.locale, { style: "currency", currency: store.currency, maximumFractionDigits: 0 });

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
