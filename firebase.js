import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB59pIwY4L61--bMcLmJR8X9L42val96q0",
  authDomain: "vybe-automate.firebaseapp.com",
  projectId: "vybe-automate",
  storageBucket: "vybe-automate.firebasestorage.app",
  messagingSenderId: "790445872896",
  appId: "1:790445872896:web:63aa9d69cf7d825f8505e5",
  measurementId: "G-7314NVBGTT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;