/** Change this file when onboarding a new shop. */
export const store = {
  name: "Timed Kids",
  shortName: "TIMED KIDS",
  initials: "TK",
  tagline: "Little looks. Big moments.",
  description: "Comfortable, colourful clothing for babies and children, delivered with care.",
  locale: "en-NG",
  currency: "NGN",
  country: "Nigeria",
  contact: {
    phone: "+234 800 000 0000",
    whatsapp: "2348087655000",
    email: "hello@timedkids.com",
    address: "Your shop address",
  },
  delivery: {
    standardFee: 2500,
    freeAbove: 50000,
    coverage: "Delivery across Nigeria",
  },
  payments: {
    payOnDelivery: true,
    bankTransfer: false,
    paystack: false,
  },
  features: {
    sellerOnboarding: false,
    customerAccounts: true,
  },
  owner: {
    /** Prototype-only PIN. Replace with Supabase authentication before production. */
    demoPin: "1234",
  },
  theme: {
    primary: "#8b4b80",
    primaryDark: "#51304c",
    accent: "#ffd166",
  },
  orderPrefix: "TK",
  storageNamespace: "timed-kids",
} as const;

export function storageKey(key: string) {
  return `${store.storageNamespace}-${key}`;
}

export function deliveryFee(subtotal: number) {
  return subtotal === 0 || subtotal >= store.delivery.freeAbove
    ? 0
    : store.delivery.standardFee;
}
