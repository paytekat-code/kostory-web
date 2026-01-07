import { auth } from "./firebase.js";
import {
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const provider = new GoogleAuthProvider();
const menuContent = document.getElementById("menuContent");

/* RENDER MENU */
function renderMenu(user) {
  if (!menuContent) return;

  if (user) {
    menuContent.innerHTML = `
      <a href="/member/profile.html">Profile</a>
      <a href="#" id="logoutBtn">Logout</a>
    `;

    document.getElementById("logoutBtn").onclick = async (e) => {
      e.preventDefault();
      await signOut(auth);
      location.reload();
    };

  } else {
    menuContent.innerHTML = `
      <button id="loginGoogle" type="button">Login Google</button>
    `;

    document.getElementById("loginGoogle").onclick = async (e) => {
      e.preventDefault();
      await signInWithRedirect(auth, provider);
    };
  }
}

/* SATU-SATUNYA AUTH LISTENER */
onAuthStateChanged(auth, (user) => {
  renderMenu(user);
});
