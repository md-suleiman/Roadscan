import { initializeApp } from 'firebase/app'

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  updateDoc,
  doc,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey:
    'YOUR_API_KEY',

  authDomain:
    'YOUR_PROJECT.firebaseapp.com',

  projectId:
    'YOUR_PROJECT_ID',

  storageBucket:
    'YOUR_PROJECT.appspot.com',

  messagingSenderId:
    'YOUR_SENDER_ID',

  appId:
    'YOUR_APP_ID',
}

const app =
  initializeApp(
    firebaseConfig
  )

const db =
  getFirestore(app)

export {
  db,
  collection,
  addDoc,
  getDocs,
  query,
  updateDoc,
  doc,
}