import { cookies } from "next/headers";

export type CartCurrency = "TRY" | "EUR";
export type CartProduct = {
  id: string;
  slug?: string;
  title: string;
  brand?: string;
  price?: number; // minor units (kuruş/cent)
  currency?: CartCurrency;
  image?: string;
};
export type CartItem = { productId: string; qty: number; product?: CartProduct };
export type Cart = { items: CartItem[] };

const COOKIE_KEY = "cart";

export async function readCart(): Promise<Cart> {
  const c = (await cookies()).get(COOKIE_KEY)?.value;
  if (!c) return { items: [] };
  try { return JSON.parse(c) as Cart; } catch { return { items: [] }; }
}

export async function writeCart(cart: Cart) {
  (await cookies()).set(COOKIE_KEY, JSON.stringify(cart), { httpOnly: false, sameSite: "lax", path: "/" });
}


