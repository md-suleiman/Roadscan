import { initializeApp } from 'firebase/app'

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAO9_MvfIgJlho_4uZmYAR0Bl82yLVmB1M",
  authDomain: "roadscan-project.firebaseapp.com",
  projectId: "roadscan-project",
  storageBucket: "roadscan-project.firebasestorage.app",
  messagingSenderId: "54499287539",
  appId: "1:54499287539:web:ba26ea9838b1de50337286"
}

const app =
  initializeApp(firebaseConfig)

const db = getFirestore(app)

export {
  db,
  collection,
  addDoc,
  onSnapshot,
}