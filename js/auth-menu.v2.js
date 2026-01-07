import { auth } from "./firebase.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const menuContent = document.getElementById("menuContent");
const provider = new GoogleAuthProvider();

if (!menuContent) {
  console.error("menuContent TIDAK DITEMUKAN");
}

/* ========== RENDER MENU ========== */
function renderMenu(user) {
  if (!menuContent) return;

  if (user) {
    menuContent.innerHTML = `
      <a href="/member/profile.html">Profile</a>
      <button id="logoutBtn">Logout</button>
    `;

    document.getElementById("logoutBtn").onclick = async () => {
      await signOut(auth);
      location.reload();
    };

  } else {
    menuContent.innerHTML = `
      <button id="loginGoogle" class="login-google">
        Login Google
      </button>
    `;

    document.getElementById("loginGoogle").onclick = async () => {
      try {
        await signInWithPopup(auth, provider);
        location.reload();
      } catch (err) {
        console.error("LOGIN ERROR:", err);
      }
    };
  }
}

/* ========== AUTH LISTENER ========== */
onAuthStateChanged(auth, (user) => {
  console.log("AUTH STATE:", user);
  renderMenu(user);
});
