"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect
} from "react";

type BoostContextType = {
  boostActive: boolean;
  activateBoost: () => void;
};

const BoostContext = createContext<BoostContextType | null>(null);

const BOOST_DURATION = 10 * 60 * 1000; // 10 min

export function BoostProvider({ children }: { children: ReactNode }) {
  const [boostActive, setBoostActive] = useState(false);
  const [boostEndTime, setBoostEndTime] = useState<number | null>(null);

  // 🔥 ACTIVATE BOOST
  const activateBoost = () => {
    const end = Date.now() + BOOST_DURATION;

    setBoostActive(true);
    setBoostEndTime(end);

    localStorage.setItem("boostEndTime", end.toString());
  };

  // 🔥 RESTORE BOOST ON LOAD
  useEffect(() => {
    const saved = localStorage.getItem("boostEndTime");

    if (!saved) return;

    const endTime = parseInt(saved);

    if (Date.now() < endTime) {
      setBoostActive(true);
      setBoostEndTime(endTime);
    } else {
      localStorage.removeItem("boostEndTime");
    }
  }, []);

  // 🔥 AUTO CHECK EXPIRY
  useEffect(() => {
    const interval = setInterval(() => {
      if (!boostEndTime) return;

      if (Date.now() >= boostEndTime) {
        setBoostActive(false);
        setBoostEndTime(null);
        localStorage.removeItem("boostEndTime");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [boostEndTime]);

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
