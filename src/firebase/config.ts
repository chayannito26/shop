import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Replace with your Firebase configuration
// You'll need to create a Firebase project and get these values
const firebaseConfig = {
  apiKey: "AIzaSyDsI5v9okHOdxbEw8k8hXwzPzZMpDrirbM",
  authDomain: "chayannito-26.firebaseapp.com",
  projectId: "chayannito-26",
  storageBucket: "chayannito-26.firebasestorage.app",
  messagingSenderId: "127749935084",
  appId: "1:127749935084:web:8bf6df50ce2cbc96cdbac9",
  measurementId: "G-CRHHT66GTQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);