import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAKzG4sMvhUSyQYApwYAJwfYI_h7HIOnx4",
  authDomain: "habit-tracker-app-38d6c.firebaseapp.com",
  projectId: "habit-tracker-app-38d6c",
  storageBucket: "habit-tracker-app-38d6c.firebasestorage.app",
  messagingSenderId: "842137784530",
  appId: "1:842137784530:web:d564290535c137ff105d0b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);