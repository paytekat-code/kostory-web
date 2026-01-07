import { auth } from "./firebase.js";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const provider = new GoogleAuthProvider();
const menuContent = document.getElementById("menuContent");

function renderMenu(user) {
  if (!menuContent) return;

  if (!user) {
    menuContent.innerHTML = `
      <a href="#" id="loginGoogle">Login Google</a>
    `;

    document
      .getElementById("loginGoogle")
      .addEventListener("click", loginGoogle);

  } else {
    menuContent.innerHTML = `
      <a href="/member/profile.html">Profile</a>
      <a href="#" id="logoutBtn">Logout</a>
    `;

    document
      .getElementById("logoutBtn")
      .addEventListener("click", logout);
  }
}

async function loginGoogle(e) {
  e.preventDefault();
  try {
    await signInWithPopup(auth, provider);
    closeMenu(); // pakai fungsi menu yang sudah ada
  } catch (err) {
    alert("Login Google gagal");
    console.error(err);
  }
}

async function logout(e) {
  e.preventDefault();
  await signOut(auth);
  window.location.reload();
}

onAuthStateChanged(auth, user => {
  renderMenu(user);
});
