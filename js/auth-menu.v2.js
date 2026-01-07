import { auth } from "./firebase.js";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const menuContent = document.getElementById("menuContent");
const loginBtn = document.getElementById("loginGoogle");

const provider = new GoogleAuthProvider();

// LOGIN
loginBtn?.addEventListener("click", () => {
  signInWithRedirect(auth, provider);
});

// HANDLE REDIRECT RESULT
getRedirectResult(auth).catch(() => {});

// AUTH STATE
onAuthStateChanged(auth, (user) => {
  console.log("AUTH STATE:", user);

  if (!menuContent) return;

  if (user) {
    menuContent.innerHTML = `
      <a href="/member/profile.html">Profile</a>
      <a href="#" id="logoutBtn">Logout</a>
    `;

    document.getElementById("logoutBtn").onclick = async () => {
      await signOut(auth);
      location.reload();
    };
  } else {
    menuContent.innerHTML = `
      <button id="loginGoogle">Login Google</button>
    `;
  }
});
