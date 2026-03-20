import { initializeApp } from "firebase/app";
import { getAuth ,GoogleAuthProvider } from "firebase/auth";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "prepsense-eb1c6.firebaseapp.com",
  projectId: "prepsense-eb1c6",
  storageBucket: "prepsense-eb1c6.firebasestorage.app",
  messagingSenderId: "475918532561",
  appId: "1:475918532561:web:87ca61aea86eef636a2af0",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export { auth, provider };
