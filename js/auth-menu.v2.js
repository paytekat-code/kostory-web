import { auth } from "./firebase.js";
import {
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const provider = new GoogleAuthProvider();
const menuContent = document.getElementById("menuContent");

/* =========================
   RENDER MENU
   ========================= */
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

    document.getElementById("loginGoogle").onclick = async () => {
      await signInWithRedirect(auth, provider);
    };
  }
}

/* =========================
   INIT AUTH (URUTAN BENAR)
   ========================= */
(async () => {
  // 1️⃣ pastikan session disimpan
  await setPersistence(auth, browserLocalPersistence);

  // 2️⃣ dengarkan status auth
  onAuthStateChanged(auth, (user) => {
    console.log("AUTH STATE:", user);
    renderMenu(user);
  });
})();
