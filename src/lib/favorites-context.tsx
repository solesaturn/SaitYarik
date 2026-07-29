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

export type FavoriteItem = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  priceRetail: number;
  priceWholesale: number;
  imageUrl: string | null;
  brandName?: string | null;
};

export type FavoriteToast = {
  id: number;
  name: string;
  added: boolean;
};

type FavoritesContextValue = {
  items: FavoriteItem[];
  ids: Set<string>;
  toggle: (item: FavoriteItem) => void;
  remove: (id: string) => void;
  isFavorite: (id: string) => boolean;
  count: number;
  toast: FavoriteToast | null;
  dismissToast: () => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);
const KEY = "sy_fav_v2";

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<FavoriteToast | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        setItems(JSON.parse(raw) as FavoriteItem[]);
      } else {
        // migrate old id-only list if present
        const legacy = localStorage.getItem("sy_fav");
        if (legacy) {
          const ids = JSON.parse(legacy) as string[];
          if (Array.isArray(ids) && ids.length) {
            setItems(ids.map((id) => ({ id, slug: "", name: "Товар", sku: "", priceRetail: 0, priceWholesale: 0, imageUrl: null })));
          }
        }
      }
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
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const dismissToast = useCallback(() => setToast(null), []);

  const toggle = useCallback((item: FavoriteItem) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === item.id);
      setToast({ id: Date.now(), name: item.name, added: !exists });
      if (exists) return prev.filter((p) => p.id !== item.id);
      return [...prev, item];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const ids = useMemo(() => new Set(items.map((i) => i.id)), [items]);

  const isFavorite = useCallback((id: string) => ids.has(id), [ids]);

  const value = useMemo(
    () => ({
      items,
      ids,
      toggle,
      remove,
      isFavorite,
      count: items.length,
      toast,
      dismissToast,
    }),
    [items, ids, toggle, remove, isFavorite, toast, dismissToast]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
