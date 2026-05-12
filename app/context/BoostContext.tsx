"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type BoostContextType = {
  boostActive: boolean;
  activateBoost: () => void;
};

const BoostContext = createContext<BoostContextType | null>(null);

export function BoostProvider({ children }: { children: ReactNode }) {
  const [boostActive, setBoostActive] = useState(false);

  const activateBoost = () => {
    setBoostActive(true);

    // 10 minute boost
    setTimeout(() => {
      setBoostActive(false);
    }, 10 * 60 * 1000);
  };

  return (
    <BoostContext.Provider value={{ boostActive, activateBoost }}>
      {children}
    </BoostContext.Provider>
  );
}

export function useBoost() {
  const ctx = useContext(BoostContext);
  if (!ctx) throw new Error("useBoost must be used inside BoostProvider");
  return ctx;
}
