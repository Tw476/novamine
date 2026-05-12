"use client";

import { useBoost } from "../context/BoostContext";

export default function BoostButton() {
  const { boostActive, activateBoost } = useBoost();

  const handleWatchAd = () => {
    // TEMP: simulate reward activation
    activateBoost();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleWatchAd}
        className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold"
      >
        Watch Ad for 2x Boost
      </button>

      {boostActive && (
        <p className="text-green-400 font-semibold">
          🔥 2x Boost Active
        </p>
      )}
    </div>
  );
}
