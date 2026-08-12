import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
const firebaseConfig = {
  apiKey: "AIzaSyD6zKhAQGfnMDayzk0MP-o3Bh-ULonjK-U",
  authDomain: "material-pure-habits.firebaseapp.com",
  projectId: "material-pure-habits",
  storageBucket: "material-pure-habits.appspot.com",
  messagingSenderId: "347566039767",
  appId: "1:347566039767:web:646b7a6d210a15173d8692"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
