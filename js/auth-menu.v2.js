import { auth } from "./firebase.js";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const provider = new GoogleAuthProvider();
const menuContent = document.getElementById("menuContent");

/* ========= RENDER MENU ========= */
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
      <button id="loginGoogle">Login Google</button>
    `;

    document.getElementById("loginGoogle").onclick = () => {
      signInWithRedirect(auth, provider);
    };
  }
}

/* ========= FINALIZE REDIRECT (WAJIB) ========= */
getRedirectResult(auth).catch(() => {});

/* ========= AUTH LISTENER ========= */
onAuthStateChanged(auth, (user) => {
  renderMenu(user);
});
