import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAU6I21qHfD-YS2i8PCu2nMJxMWgKC6Sj4",
  authDomain: "ccbadmitba.firebaseapp.com",
  projectId: "ccbadmitba",
  storageBucket: "ccbadmitba.firebasestorage.app",
  messagingSenderId: "60371542427",
  appId: "1:60371542427:web:4fa20e76aaef21d538813e",
  measurementId: "G-PHK2V24RF9",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
