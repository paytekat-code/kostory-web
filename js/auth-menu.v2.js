import { auth, provider } from "./firebase.js";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const menuContent = document.getElementById("menuContent");

function renderMenu(user) {
  if (!menuContent) return;

  if (user) {
    // Pakai menu dari HTML (tidak ditimpa)
  } else {
    menuContent.innerHTML = `
      <button id="loginGoogle" class="login-google">
        Login (via Google)
      </button>
    `;

    const loginBtn = document.getElementById("loginGoogle");
    if (loginBtn) {
      loginBtn.onclick = async () => {
        await signInWithPopup(auth, provider);
        location.reload();
      };
    }
  }
}

// Aktifkan tombol logout dari HTML
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.onclick = async (e) => {
      e.preventDefault();
      await signOut(auth);
      location.reload();
    };
  }
});

// Pantau status login
onAuthStateChanged(auth, (user) => {
  renderMenu(user);
});
