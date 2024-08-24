// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBLs4aj5_J646IADdNdyntYPxr9pDdchMg",
  authDomain: "msa-hub.firebaseapp.com",
  projectId: "msa-hub",
  storageBucket: "msa-hub.appspot.com",
  messagingSenderId: "740030208782",
  appId: "1:740030208782:web:46c08ea4e1ab2e3efc955f",
  measurementId: "G-56WCPFGPQC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };