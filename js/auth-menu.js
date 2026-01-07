import { auth } from "./firebase.js";
import {
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

getRedirectResult(auth)
  .then((result) => {
    if (result?.user) {
      renderMenu(result.user);
    }
  })
  .catch((err) => {
    console.error("Redirect error:", err);
  });


const provider = new GoogleAuthProvider();
const menuContent = document.getElementById("menuContent");

function renderMenu(user) {
  if (!menuContent) return;

  if (!user) {
    menuContent.innerHTML = `
      <button id="loginGoogle" type="button">Login Google</button>
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
  e.stopPropagation();
  await signInWithRedirect(auth, provider);
}


async function logout(e) {
  e.preventDefault();
  await signOut(auth);
  window.location.reload();
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    renderMenu(user);
  }
});

