"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import {
  doc,
  getDoc,
  setDoc
} from "firebase/firestore"

import { db } from "../lib/firebase"
import { useAuth } from "../context/AuthContext"

export default function SpinPage() {

  const router = useRouter()
  const { user, loading } = useAuth()

  const [coins, setCoins] = useState(0)

  const [spinning, setSpinning] = useState(false)

  const [lastSpin, setLastSpin] = useState(0)

  const [countdown, setCountdown] =
    useState("Ready")

  const rewards = [
    0.01,
    0.02,
    0.03,
    0.05,
    0.1
  ]

  const SPIN_COOLDOWN =
    4 * 60 * 60 * 1000

  // AUTH
  useEffect(() => {

    if (!loading && !user) {
      router.push("/auth")
    }

  }, [user, loading])

  // LOAD USER
  useEffect(() => {

    const loadUser = async () => {

      if (!user?.uid) return

      const ref = doc(db, "users", user.uid)

      const snap = await getDoc(ref)

      if (!snap.exists()) return

      const data = snap.data()

      setCoins(data.coins || 0)

      setLastSpin(data.lastSpin || 0)
    }

    loadUser()

  }, [user])

  // TIMER
  useEffect(() => {

    const timer = setInterval(() => {

      const elapsed =
        Date.now() - lastSpin

      const remaining =
        SPIN_COOLDOWN - elapsed

      if (remaining <= 0) {

        setCountdown("Ready")

        return
      }

      const hours = Math.floor(
        remaining / (1000 * 60 * 60)
      )

      const minutes = Math.floor(
        (remaining % (1000 * 60 * 60)) /
        (1000 * 60)
      )

      setCountdown(
        `${hours}h ${minutes}m`
      )

    }, 1000)

    return () => clearInterval(timer)

  }, [lastSpin])

  // SPIN
  const spinWheel = async () => {

    if (!user?.uid) return

    const elapsed =
      Date.now() - lastSpin

    if (elapsed < SPIN_COOLDOWN) {

      alert(
        "Spin not ready yet"
      )

      return
    }

    setSpinning(true)

    setTimeout(async () => {

      const reward =
        rewards[
          Math.floor(
            Math.random() *
            rewards.length
          )
        ]

      const newCoins =
        coins + reward

      setCoins(newCoins)

      setLastSpin(Date.now())

      const ref = doc(
        db,
        "users",
        user.uid
      )

      await setDoc(ref, {

        coins: newCoins,
        lastSpin: Date.now()

      }, { merge: true })

      alert(
        `You won ${reward} coins`
      )

      setSpinning(false)

    }, 3000)
  }

  // LOADING
  if (loading) {

    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">

      <div className="bg-zinc-900 p-8 rounded-3xl w-full max-w-md text-center">

        <h1 className="text-4xl font-bold mb-2">
          🎡 Lucky Spin
        </h1>

        <p className="text-zinc-400 mb-6">
          Spin every 4 hours to win bonus coins
        </p>

        {/* COINS */}
        <div className="bg-black p-6 rounded-2xl mb-6">

          <p className="text-zinc-400 mb-2">
            Your Coins
          </p>

          <h2 className="text-5xl font-bold text-green-400">
            {coins.toFixed(5)}
          </h2>

        </div>

        {/* WHEEL */}
        <div className="bg-black rounded-full w-52 h-52 mx-auto flex items-center justify-center mb-6 border-4 border-green-500">

          <div
            className={`text-6xl transition-all duration-3000 ${
              spinning
              ? "animate-spin"
                : ""
            }`}
          >
            🎡
          </div>

        </div>

        {/* BUTTON */}
        <button
          onClick={spinWheel}
          disabled={
            spinning ||
            countdown !== "Ready"
          }
          className={`w-full py-4 rounded-2xl font-bold mb-4 ${
            countdown === "Ready"
              ? "bg-green-500 text-black"
              : "bg-zinc-700"
          }`}
        >

          {spinning
            ? "Spinning..."
            : countdown === "Ready"
            ? "Spin Now"
            : `Next Spin: ${countdown}`}

        </button>

        {/* REWARDS */}
        <div className="bg-black p-4 rounded-2xl text-left">

          <p className="font-bold mb-3">
            Possible Rewards
          </p>

          <div className="space-y-2 text-zinc-300">

            <p>0.01 Coins</p>
            <p>0.02 Coins</p>
            <p>0.03 Coins</p>
            <p>0.05 Coins</p>
            <p>0.10 Coins</p>

          </div>

        </div>

        {/* BACK */}
        <button
          onClick={() => router.push("/")}
          className="w-full py-3 rounded-2xl bg-blue-500 font-bold mt-4"
        >
          Back Home
        </button>

      </div>
    </main>
  )
}