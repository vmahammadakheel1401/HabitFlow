import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import aiStudioConfig from '../../firebase-applet-config.json';

const getEnv = (key: string) => {
  let val = import.meta.env[key];
  if (typeof val === 'string') {
    val = val.replace(/^["']|["']$/g, ''); // Strip surrounding quotes
  }
  return (val && val !== 'undefined' && val !== 'null' && val.trim() !== '') ? val : undefined;
};

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY') || aiStudioConfig.apiKey,
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN') || aiStudioConfig.authDomain,
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID') || aiStudioConfig.projectId,
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET') || aiStudioConfig.storageBucket,
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || aiStudioConfig.messagingSenderId,
  appId: getEnv('VITE_FIREBASE_APP_ID') || aiStudioConfig.appId
};

const app = initializeApp(firebaseConfig);

const dbId = getEnv('VITE_FIREBASE_DATABASE_ID') || aiStudioConfig.firestoreDatabaseId;
export const db = dbId ? getFirestore(app, dbId) : getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
