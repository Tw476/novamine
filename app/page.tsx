"use client"

import { showRewardedAd } from "./lib/rewardedAd"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./context/AuthContext"
import { useBoost } from "./context/BoostContext"


import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from "firebase/firestore"

import { db } from "./lib/firebase"
import { getMiningRewardPerSecond } from "./lib/miningService"
import { generateReferralCode } from "./lib/referral"

import { addTransaction } from "./lib/transactionService"

export default function Home() {

  const router = useRouter()
const { user, loading } = useAuth()

const {
  boostActive,
  activateBoost
} = useBoost()
  
  const [coins, setCoins] = useState(0)
  const [miningActive, setMiningActive] = useState(false)

  const [activeReferrals, setActiveReferrals] = useState(0)
  

  const [ready, setReady] = useState(false)

  const [totalMinedToday, setTotalMinedToday] = useState(0)
  const [remainingToday, setRemainingToday] = useState(0.5)
  const [timeLeft, setTimeLeft] = useState("24h 0m")

  const [offlineReward, setOfflineReward] = useState(0)

  const [myCode, setMyCode] = useState("")
  const [transactions, setTransactions] = useState<any[]>([])
  const [referralInput, setReferralInput] = useState("")

  // STEP 13
  const [dailyClaimed, setDailyClaimed] = useState(false)
  const [dailyCountdown, setDailyCountdown] = useState("24h 0m")

  const DAILY_CAP = 0.5
  const ONE_DAY = 86400000

  // AUTH GUARD
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

      if (!snap.exists()) {

        const generatedCode =
  generateReferralCode(user.uid)
  await setDoc(ref, {

          coins: 0,
          miningActive: false,
          activeReferrals: 0,

          totalMinedToday: 0,
          lastClaimReset: Date.now(),

          lastOnline: Date.now(),


referralCode: generatedCode,
referredBy: null,

          // STEP 13
          lastDailyClaim: 0

        })

      } else {

        const data = snap.data()

        setMyCode(data.referralCode || generateReferralCode(user.uid))

        // DAILY CHECK
        const lastClaim =
          data.lastDailyClaim || 0

        if (
          Date.now() - lastClaim <
          ONE_DAY
        ) {
          setDailyClaimed(true)
        }

        // OFFLINE REWARD
        if (data.miningActive) {

          const now = Date.now()

          const lastOnline =
            data.lastOnline || now

          const secondsOffline =
            Math.floor(
              (now - lastOnline) / 1000
            )

          const rewardPerSecond =
           getMiningRewardPerSecond(
  data.activeReferrals || 0,
  boostActive
)

          let offlineCoins =
            rewardPerSecond *
            secondsOffline

          const minedToday =
            data.totalMinedToday || 0

          if (
            minedToday + offlineCoins >
            DAILY_CAP
          ) {

            offlineCoins =
              DAILY_CAP - minedToday
          }

          if (offlineCoins > 0) {

            const newCoins =
              (data.coins || 0) +
              offlineCoins

            const newMined =
              minedToday +
              offlineCoins

            await setDoc(ref, {

              coins: newCoins,

              totalMinedToday:
                newMined,

              lastOnline: now

            }, { merge: true })

            setOfflineReward(
              offlineCoins
            )

            setCoins(newCoins)

            setTotalMinedToday(
              newMined
            )
          }
        }

        setCoins(data.coins || 0)

        setMiningActive(
          data.miningActive || false
        )

        setActiveReferrals(
          data.activeReferrals || 0
        )

        setTotalMinedToday(
          data.totalMinedToday || 0
        )

        const remaining =
          DAILY_CAP -
          (data.totalMinedToday || 0)

        setRemainingToday(
          Math.max(0, remaining)
        )
      }

      setReady(true)
    }

    loadUser()

  }, [user])

  // DAILY TIMER
  useEffect(() => {

    if (!user?.uid) return

    const interval = setInterval(async () => {

      const ref = doc(db, "users", user.uid)
      const snap = await getDoc(ref)

      if (!snap.exists()) return

      const data = snap.data()

      const lastClaim =
        data.lastDailyClaim || 0

      const elapsed =
        Date.now() - lastClaim

      if (elapsed >= ONE_DAY) {
        setDailyClaimed(false)
      }

      const remaining =
        ONE_DAY - elapsed

      const hours = Math.floor(
        remaining / (1000 * 60 * 60)
      )

      const minutes = Math.floor(
        (remaining % (1000 * 60 * 60)) /
        (1000 * 60)
      )

      setDailyCountdown(
        `${hours}h ${minutes}m`
      )

    }, 1000)

    return () => clearInterval(interval)

  }, [user])

  // CLAIM DAILY
  const claimDailyReward = async () => {

    if (!user?.uid) return

    if (dailyClaimed) {
      alert("Already claimed today")
      return
    }

    const reward = 0.1

    const newCoins = coins + reward

    setCoins(newCoins)
    setDailyClaimed(true)

    const ref = doc(db, "users", user.uid)

    await setDoc(ref, {

      coins: newCoins,
      lastDailyClaim: Date.now()

    }, { merge: true })

    await addTransaction(
  user.uid,
  "Daily Reward",
  reward
)

    alert("Daily reward claimed")
  }

  // ACTIVE REFERRALS
  useEffect(() => {

  if (!user?.uid) return

  const loadReferrals = async () => {

    const userRef = doc(db, "users", user.uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) return

    const userData = userSnap.data()

    const code =
      userData?.referralCode || ""

    const q = query(
      collection(db, "users"),
      where("referredBy", "==", code),
      where("miningActive", "==", true)
    )

   try {

  const snap = await getDocs(q)

  const total = snap.size

  setActiveReferrals(total)

  await setDoc(userRef, {
    activeReferrals: total
  }, { merge: true })

} catch (error) {

  console.log(error)
}

  }

  loadReferrals()

  const interval =
    setInterval(loadReferrals, 5000)

  return () => clearInterval(interval)

}, [user?.uid])

// LOAD TRANSACTIONS
useEffect(() => {

  if (!user?.uid) return

  const loadTransactions = async () => {

    const q = query(

      collection(
        db,
        "users",
        user.uid,
        "transactions"
      ),

      orderBy("createdAt", "desc"),
      limit(10)

    )

    try {

  const snap = await getDocs(q)

  const history: any[] = []

  snap.forEach((doc) => {

    history.push({

      id: doc.id,
      ...doc.data()

    })
  })

  setTransactions(history)

} catch (error) {

  console.log(error)
}

  }

  loadTransactions()

}, [user?.uid])

  // CONNECT REF
  const connectReferral = async () => {

    if (!user?.uid) return

    if (!referralInput) {
      alert("Enter referral code")
      return
    }

    const ref = doc(db, "users", user.uid)

    const cleanCode =
  referralInput.toUpperCase()

const myReferralCode =
  generateReferralCode(user.uid)

if (cleanCode === myReferralCode) {

  alert("You cannot refer yourself")

  return
}

const snap = await getDoc(ref)

const userData =
  snap.exists() ? snap.data() : null

if (userData?.referredBy) {

  alert("Referral already connected")

  return
}

await setDoc(ref, {

  referredBy: cleanCode

}, { merge: true })

// FIND REFERRAL OWNER
const q = query(
  collection(db, "users"),
  where("referralCode", "==", cleanCode)
)

try {

  const referralSnap =
    await getDocs(q)

  if (!referralSnap.empty) {

    const referralOwner =
      referralSnap.docs[0]

    const referralData =
      referralOwner.data()

    const bonus =
      (referralData.coins || 0) + 0.05

    await setDoc(
      referralOwner.ref,

      {
        coins: bonus
      },

      { merge: true }
    )
  }

} catch (error) {

  console.log(error)
}

alert("Referral connected")

    alert("Referral connected")
  }

  // RESET TIMER
  useEffect(() => {

    if (!user?.uid) return

    const timer = setInterval(async () => {

      const ref = doc(db, "users", user.uid)
      const snap = await getDoc(ref)

      if (!snap.exists()) return

      const data = snap.data()

      const lastReset =
        data.lastClaimReset || Date.now()

      const elapsed =
        Date.now() - lastReset

      const remaining =
        ONE_DAY - elapsed

      if (elapsed >= ONE_DAY) {

        await setDoc(ref, {

          totalMinedToday: 0,
          lastClaimReset: Date.now()

        }, { merge: true })

        setTotalMinedToday(0)
        setRemainingToday(DAILY_CAP)

        return
      }

      const hours = Math.floor(
        remaining / (1000 * 60 * 60)
      )

      const minutes = Math.floor(
        (remaining % (1000 * 60 * 60)) /
        (1000 * 60)
      )

      setTimeLeft(`${hours}h ${minutes}m`)

    }, 1000)

    return () => clearInterval(timer)

  }, [user])

  // START MINING
  const startMining = async () => {

    if (!user?.uid) return

    if (remainingToday <= 0) {

      alert(
        "Daily mining limit reached"
      )

      return
    }

    setMiningActive(true)

    const ref = doc(db, "users", user.uid)

    await setDoc(ref, {

      miningActive: true,
      lastOnline: Date.now()

    }, { merge: true })
  }

  // MINING LOOP
  useEffect(() => {

    if (!miningActive || !user?.uid)
      return

      let isMining = false  

const interval = setInterval(async () => {

  try {     
        if (isMining) return

      isMining = true
      const ref = doc(db, "users", user.uid)
      const snap = await getDoc(ref)

      if (!snap.exists()) return

      const data = snap.data()

      const minedToday =
        data.totalMinedToday || 0

      if (minedToday >= DAILY_CAP) {

        setMiningActive(false)

        await setDoc(ref, {
          miningActive: false
        }, { merge: true })

        return
      }

      const reward =
       getMiningRewardPerSecond(
  data.activeReferrals || 0,
  boostActive
)
      const allowedReward =
        Math.min(
          reward,
          DAILY_CAP - minedToday
        )

      const newCoins =
        (data.coins || 0) +
        allowedReward

      const newMined =
        minedToday +
        allowedReward

      await setDoc(ref, {

        coins: newCoins,

        miningActive: true,

        activeReferrals:
          data.activeReferrals || 0,

        totalMinedToday:
          newMined,

        lastOnline: Date.now()

      }, { merge: true })

      setCoins(newCoins)

      setTotalMinedToday(
        newMined
      )

      setRemainingToday(
        Math.max(
          0,
          DAILY_CAP - newMined
        )
      )

      isMining = false

  } catch (error) {

    console.log(error)

  } finally {

    isMining = false

  }

}, 5000)

    return () => clearInterval(interval)

  }, [miningActive, boostActive, user])

  // BOOST
const watchAd = async () => {

  const watched = await showRewardedAd()

  if (!watched) return

  activateBoost()

  alert("🔥 2x Boost unlocked after ad")
}
  
}

  // LOADING
  if (loading || !ready) {

    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading mining system...
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white px-4">

      <div className="bg-zinc-900 p-8 rounded-3xl w-full max-w-md text-center">

        <h1 className="text-4xl font-bold mb-4">
          NovaMine
        </h1>

        {/* DAILY BONUS */}
        <div className="bg-yellow-500 text-black p-4 rounded-2xl mb-4">

          <p className="font-bold mb-2">
            🎁 Daily Reward
          </p>

          <p className="text-sm mb-3">
            Claim 0.1 bonus coins every 24 hours
          </p>

          <button
            onClick={claimDailyReward}
            disabled={dailyClaimed}
            className={`w-full py-3 rounded-xl font-bold ${
              dailyClaimed
                ? "bg-zinc-700 text-white"
                : "bg-black text-white"
            }`}
          >

            {dailyClaimed
              ? `Next reward in ${dailyCountdown}`
              : "Claim Daily Reward"}

          </button>

        </div>

        {/* OFFLINE */}
        {offlineReward > 0 && (

          <div className="bg-green-500 text-black p-3 rounded-2xl mb-4 font-bold">

            You earned
            {" "}
            {offlineReward.toFixed(5)}
            {" "}
            coins while offline

          </div>
        )}

        {/* COINS */}
        <div className="text-green-400 text-5xl font-bold mb-4">
          {coins.toFixed(5)}
        </div>

        {/* PROGRESS */}
        <div className="bg-black p-4 rounded-2xl mb-4">

          <p className="text-zinc-400 mb-2">
            Mining Progress
          </p>

          <p className="text-green-400 font-bold text-lg">
            {totalMinedToday.toFixed(5)} / 0.5 mined today
          </p>

          <p className="text-xs text-zinc-500 mt-2">
            Resets in: {timeLeft}
          </p>

        </div>

        {/* INFO */}
<div className="bg-black p-4 rounded-2xl text-sm mb-4">

  <p className="text-green-400 font-bold text-base">
    Base Rate: 0.5 every 24 hours
  </p>

  <p className="text-blue-400 mt-2">
    +0.005 per ACTIVE referral miner
  </p>

  <div className="mt-4">

    <p className="text-zinc-400 text-xs mb-2">
      Live Mining Speed
    </p>

    <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">

      <div
        className="h-full bg-green-500 transition-all duration-1000"
        style={{
          width: `${(totalMinedToday / DAILY_CAP) * 100}%`
        }}
      />

    </div>

    <p className="text-green-400 text-xs mt-2">
      {(
        getMiningRewardPerSecond(
          activeReferrals,
          boostActive
        ) * 60
      ).toFixed(8)}
      {" "}
      coins/min
    </p>

  </div>

</div>

        {/* START */}
        <button
          onClick={startMining}
          disabled={remainingToday <= 0}
          className={`w-full py-4 rounded-2xl font-bold mb-4 ${
            miningActive
              ? "bg-zinc-700"
              : "bg-green-500 text-black"
          }`}
        >

          {remainingToday <= 0
            ? "Daily Limit Reached"
            : miningActive
            ? "Mining Active"
            : "Start Mining"}

        </button>

        {/* BOOST */}
<button
  onClick={watchAd}
  className="w-full py-3 rounded-2xl bg-purple-500 font-bold mb-4"
>
  Watch Ad → 2x Boost
</button>

{/* LUCKY SPIN */}
<button
  onClick={() => router.push("/spin")}
  className="w-full py-3 rounded-2xl bg-yellow-500 text-black font-bold mb-4"
>
  🎡 Lucky Spin
</button>

        {/* REFERRAL */}
        <div className="bg-black p-4 rounded-2xl mb-4 text-left">

          <p className="font-bold text-white mb-2">
            👥 Referral System
          </p>

          <div className="bg-zinc-800 p-3 rounded-xl mb-3">

            <p className="text-xs text-zinc-400">
              Your Referral Code
            </p>

            <p className="text-green-400 font-bold text-lg">
              {myCode}
            </p>

          </div>

          <input
            type="text"
            placeholder="Enter referral code"
            value={referralInput}
            onChange={(e) =>
              setReferralInput(e.target.value)
            }
            className="w-full p-3 rounded-xl bg-zinc-800 mb-3 outline-none"
          />

          <button
            onClick={connectReferral}
            className="w-full py-3 rounded-xl bg-blue-500 font-bold"
          >
            Connect Referral
          </button>

        </div>

        <p className="text-zinc-400 text-sm mt-3">
          Active Referrals: {activeReferrals}
        </p>

        <p className="text-yellow-400 text-sm mt-2">
          Remaining Today:
          {" "}
          {remainingToday.toFixed(5)}
        </p>

      </div>
    </main>
  )
}
