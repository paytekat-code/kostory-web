import { auth } from "./firebase.js";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/* ELEMENT */
const menuContent = document.getElementById("menuContent");
const loginBtn = document.getElementById("loginGoogleBtn");

/* GUARD */
if (!menuContent) {
  console.error("menuContent NOT FOUND");
}

/* PROVIDER */
const provider = new GoogleAuthProvider();

/* LOGIN */
if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    signInWithRedirect(auth, provider);
  });
}

/* LOGOUT */
function bindLogout() {
  const btn = document.getElementById("logoutBtn");
  if (btn) {
    btn.addEventListener("click", async () => {
      await signOut(auth);
      location.reload();
    });
  }
}

/* RENDER MENU */
function renderMenu(user) {
  if (!menuContent) return;

  if (user) {
    menuContent.innerHTML = `
      <a href="/member/profile.html">Profile</a>
      <a href="#" id="logoutBtn">Logout</a>
    `;
    bindLogout();
  } else {
    menuContent.innerHTML = `
      <button id="loginGoogleBtn" class="login-btn">Login Google</button>
    `;
    document
      .getElementById("loginGoogleBtn")
      .addEventListener("click", () => {
        signInWithRedirect(auth, provider);
      });
  }
}

/* AUTH LISTENER */
onAuthStateChanged(auth, (user) => {
  console.log("AUTH STATE:", user);
  renderMenu(user);
});
