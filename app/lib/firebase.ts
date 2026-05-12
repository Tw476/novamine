import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyANYmy-GBRlWSCPp8QekA4_c_pYtZznZSE",
  authDomain: "novamine-f34e8.firebaseapp.com",
  projectId: "novamine-f34e8",
  storageBucket: "novamine-f34e8.appspot.com",
  messagingSenderId: "724891142841",
  appId: "1:724891142841:web:3ea7a73e6c11af1c5a2968"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)