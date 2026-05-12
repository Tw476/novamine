import {
  addDoc,
  collection,
  serverTimestamp
} from "firebase/firestore"

import { db } from "./firebase"

export const addTransaction = async (
  userId: string,
  type: string,
  amount: number
) => {

  try {

    await addDoc(
      collection(db, "users", userId, "transactions"),
      {

        type,
        amount,

        createdAt:
          serverTimestamp()

      }
    )

  } catch (error) {

    console.log(
      "Transaction Error:",
      error
    )
  }
}