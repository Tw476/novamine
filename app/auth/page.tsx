"use client"

export const dynamic = "force-dynamic"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth"

import { auth } from "../lib/firebase"

import {
  doc,
  setDoc
} from "firebase/firestore"

import { db } from "../lib/firebase"
import { generateReferralCode } from "../lib/referral"

export default function AuthPage() {

  const router = useRouter()
  const searchParams = useSearchParams()

  const referralFromUrl =
    searchParams.get("ref") || ""

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  // SIGNUP
  const signup = async () => {

    try {

      setLoading(true)

      const userCred =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        )

      const user = userCred.user

      const referralCode =
        generateReferralCode(user.uid)

      await setDoc(
        doc(db, "users", user.uid),
        {
          email,
          coins: 0,
          miningActive: false,

          referralCode,
          referredBy: referralFromUrl || null,

          activeReferrals: 0,
          createdAt: Date.now()
        }
      )

      alert("Account created")

      router.push("/")

    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  // LOGIN
  const login = async () => {

    try {

      setLoading(true)

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      )

      router.push("/")

    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">

      <div className="bg-zinc-900 p-8 rounded-3xl w-full max-w-md">

        <h1 className="text-3xl font-bold mb-6 text-center">
          NovaMine
        </h1>

        <input
          placeholder="Email"
          className="w-full p-3 mb-3 bg-black rounded-xl"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          className="w-full p-3 mb-4 bg-black rounded-xl"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={signup}
          className="w-full bg-green-500 text-black font-bold p-3 rounded-xl mb-3"
        >
          Create Account
        </button>

        <button
          onClick={login}
          className="w-full bg-blue-500 font-bold p-3 rounded-xl"
        >
          Login
        </button>

        {referralFromUrl && (
          <p className="text-xs text-zinc-400 mt-4 text-center">
            Referral detected: {referralFromUrl}
          </p>
        )}

      </div>
    </main>
  )
}
