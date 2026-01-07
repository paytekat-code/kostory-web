import { auth } from "./firebase.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const provider = new GoogleAuthProvider();

window.login = async () => {
  await signInWithPopup(auth, provider);
};

window.logout = async () => {
  await signOut(auth);
};

onAuthStateChanged(auth, (user) => {
  console.clear();
  console.log("AUTH STATE:", user);
});
