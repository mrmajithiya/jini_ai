import { initializeApp, getApps } from 'firebase/app';
import { getAuth,GithubAuthProvider,GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { isSupported, getAnalytics } from 'firebase/analytics';
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: 'AIzaSyBjHl2W22_fjCr2cLikVwYx1JDLJhj30Xs',
  authDomain: 'jiniai-8db3b.firebaseapp.com',
  projectId: 'jiniai-8db3b',
  storageBucket: 'jiniai-8db3b.appspot.com',
  messagingSenderId: '296211205224',
  appId: '1:296211205224:web:6ec8bda94e910bcf933fdd',
  measurementId: 'G-WVDS9Y1WSK',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

import type { Analytics } from 'firebase/analytics';

export let analytics: Analytics | null = null;

if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export default app;
