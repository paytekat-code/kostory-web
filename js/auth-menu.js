import { auth } from "./firebase.js";
import {
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const provider = new GoogleAuthProvider();
const menuContent = document.getElementById("menuContent");

/* ===== RENDER MENU ===== */
function renderMenu(user) {
  if (!menuContent) return;

  if (!user) {
    menuContent.innerHTML = `
      <button id="loginGoogle" type="button">Login Google</button>
    `;

    document
      .getElementById("loginGoogle")
      .onclick = loginGoogle;

  } else {
    menuContent.innerHTML = `
      <a href="/member/profile.html">Profile</a>
      <a href="#" id="logoutBtn">Logout</a>
    `;

    document
      .getElementById("logoutBtn")
      .onclick = logout;
  }
}

/* ===== LOGIN ===== */
async function loginGoogle(e) {
  e.preventDefault();
  await signInWithRedirect(auth, provider);
}

/* ===== LOGOUT ===== */
async function logout(e) {
  e.preventDefault();
  await signOut(auth);
  location.reload();
}

/* ===== INIT AUTH (INI KUNCI NYA) ===== */
getRedirectResult(auth)
  .then((result) => {
    if (result?.user) {
      renderMenu(result.user);
    } else {
      onAuthStateChanged(auth, (user) => {
        renderMenu(user);
      });
    }
  })
  .catch(() => {
    onAuthStateChanged(auth, (user) => {
      renderMenu(user);
    });
  });
