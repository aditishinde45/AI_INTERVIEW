import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-788a1.firebaseapp.com",
  projectId: "interviewiq-788a1",
  storageBucket: "interviewiq-788a1.firebasestorage.app",
  messagingSenderId: "818294667405",
  appId: "1:818294667405:web:db81409dcd02f6a719cac4",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });