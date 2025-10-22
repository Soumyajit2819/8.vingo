// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "vingos-44847.firebaseapp.com",
  projectId: "vingos-44847",
  storageBucket: "vingos-44847.firebasestorage.app",
  messagingSenderId: "94174517319",
  appId: "1:94174517319:web:53ecb9bc7feec9e96f3962"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app)
export {app,auth}
