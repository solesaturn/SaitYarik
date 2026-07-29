"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PriceMode } from "./pricing";

type ModeContextValue = {
  mode: PriceMode;
  setMode: (mode: PriceMode) => void;
};

const ModeContext = createContext<ModeContextValue | null>(null);
const KEY = "sy_price_mode";

export function PriceModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<PriceMode>("b2c");

  useEffect(() => {
    const saved = localStorage.getItem(KEY) as PriceMode | null;
    if (saved === "b2c" || saved === "b2b") setModeState(saved);
  }, []);

  const setMode = (next: PriceMode) => {
    setModeState(next);
    localStorage.setItem(KEY, next);
  };

  const value = useMemo(() => ({ mode, setMode }), [mode]);
  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function usePriceMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error("usePriceMode must be used within PriceModeProvider");
  return ctx;
}
