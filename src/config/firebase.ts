// Import the functions you need from the SDKs you need
import { getFirestore } from "firebase/firestore";
import { getAuth, signInWithCustomToken } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBl8tSAxQ9JCn0JQkRpjU-v3RK9LwHi_6Y",
  authDomain: "healthcare-63d1c.firebaseapp.com",
  projectId: "healthcare-63d1c",
  storageBucket: "healthcare-63d1c.firebasestorage.app",
  messagingSenderId: "979486368193",
  appId: "1:979486368193:web:3ccc3ff33a999d2c110f40"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Function to authenticate Clerk user with Firebase
export const authenticateWithFirebase = async (clerkUser: any) => {
  try {
    const response = await fetch('http://localhost:3000/auth/firebase-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clerkId: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get Firebase token');
    }

    const { customToken } = await response.json();
    await signInWithCustomToken(auth, customToken);
    console.log('Successfully authenticated with Firebase');
  } catch (error) {
    console.error('Error authenticating with Firebase:', error);
  }
};