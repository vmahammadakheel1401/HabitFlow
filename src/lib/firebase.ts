import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
const firebaseConfig = {
  apiKey: "AIzaSyD5wAj8s1Qa-7pM38dXWqDIAkSvx2mi-gc",
  authDomain: "gen-lang-client-0475076286.firebaseapp.com",
  projectId: "gen-lang-client-0475076286",
  storageBucket: "gen-lang-client-0475076286.firebasestorage.app",
  messagingSenderId: "459077580378",
  appId: "1:459077580378:web:a0424f476b926b13e70a63"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app, "ai-studio-materialpure-9edc7e14-8756-40f9-bdb5-a20f2bb78de1");
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
