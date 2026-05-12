"use client"

import { useEffect, useState } from "react"
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore"

import { db } from "../lib/firebase"

export default function Leaderboard() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(
          collection(db, "users"),
          orderBy("coins", "desc"),
          limit(10)
        )

        const snap = await getDocs(q)

        const list: any[] = []

        snap.forEach((doc) => {
          list.push({
            id: doc.id,
            ...doc.data()
          })
        })

        setUsers(list)
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">

      <div className="bg-zinc-900 p-8 rounded-3xl w-full max-w-md shadow-2xl">

        <h1 className="text-3xl font-bold text-center mb-6">
          🏆 Leaderboard
        </h1>

        {loading ? (
          <p className="text-center text-zinc-400">Loading...</p>
        ) : (
          <div className="space-y-4">

            {users.map((user, index) => (
              <div
                key={user.id}
                className="bg-black p-4 rounded-2xl flex justify-between items-center"
              >
                <div>
                  <p className="text-zinc-400 text-sm">
                    #{index + 1}
                  </p>

                  <p className="font-bold">
                    User {user.id.slice(0, 6)}
                  </p>
                </div>

                <p className="text-green-400 font-bold">
                  {user.coins || 0}
                </p>
              </div>
            ))}

          </div>
        )}

      </div>
    </main>
  )
}