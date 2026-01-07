// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5YXuylAdRRj5XptsWcfbIzuT8YRf179E",
  authDomain: "kostory-web.firebaseapp.com",
  projectId: "kostory-web",
  storageBucket: "kostory-web.appspot.com",
  messagingSenderId: "139221477956",
  appId: "1:139221477956:web:3df23a79663fa8fa4f2a11"
};

// Init Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
