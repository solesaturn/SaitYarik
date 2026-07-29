"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  sku: string;
  price: number;
  imageUrl: string | null;
  packQty: number;
  quantity: number;
  stock: number;
};

export type CartToast = {
  id: number;
  name: string;
  quantity: number;
};

type CartContextValue = {
  items: CartLine[];
  addItem: (item: Omit<CartLine, "quantity">, qty?: number) => void;
  setQty: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  toast: CartToast | null;
  dismissToast: () => void;
  justAdded: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);
const KEY = "sy_cart_v1";

function normalizeQty(qty: number, packQty: number) {
  if (packQty <= 1) return Math.max(1, qty);
  return Math.max(packQty, Math.ceil(qty / packQty) * packQty);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<CartToast | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw) as CartLine[]);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, ready]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!justAdded) return;
    const t = window.setTimeout(() => setJustAdded(false), 900);
    return () => window.clearTimeout(t);
  }, [justAdded]);

  const dismissToast = useCallback(() => setToast(null), []);

  const addItem = useCallback((item: Omit<CartLine, "quantity">, qty = 1) => {
    const addedQty = normalizeQty(qty, item.packQty);
    setItems((prev) => {
      const existing = prev.find((p) => p.productId === item.productId);
      const nextQty = normalizeQty((existing?.quantity ?? 0) + qty, item.packQty);
      if (existing) {
        return prev.map((p) =>
          p.productId === item.productId ? { ...p, quantity: Math.min(nextQty, item.stock || nextQty) } : p
        );
      }
      return [...prev, { ...item, quantity: normalizeQty(qty, item.packQty) }];
    });
    setJustAdded(true);
    setToast({
      id: Date.now(),
      name: item.name,
      quantity: addedQty,
    });
  }, []);

  const setQty = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((p) =>
        p.productId === productId
          ? { ...p, quantity: normalizeQty(quantity, p.packQty) }
          : p
      )
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((p) => p.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      addItem,
      setQty,
      removeItem,
      clear,
      count: items.reduce((s, i) => s + i.quantity, 0),
      subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
      toast,
      dismissToast,
      justAdded,
    }),
    [items, addItem, setQty, removeItem, clear, toast, dismissToast, justAdded]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
