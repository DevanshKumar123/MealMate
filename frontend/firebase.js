import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "mealmate-775ff.firebaseapp.com",
  projectId: "mealmate-775ff",
  storageBucket: "mealmate-775ff.firebasestorage.app",
  messagingSenderId: "87961919352",
  appId: "1:87961919352:web:164541a516ed05c5e4b28d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)

export {app,auth}