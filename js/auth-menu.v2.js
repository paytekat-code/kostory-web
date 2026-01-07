import { auth } from "./firebase.js";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const menuContent = document.getElementById("menuContent");
const provider = new GoogleAuthProvider();

/* SAFETY */
if (!menuContent) {
  console.error("menuContent NOT FOUND");
}

/* HANDLE REDIRECT RESULT (INI YANG KAMU BELUM PUNYA) */
getRedirectResult(auth)
  .then((result) => {
    if (result?.user) {
      console.log("REDIRECT LOGIN SUCCESS:", result.user.email);
    }
  })
  .catch((error) => {
    console.error("REDIRECT ERROR:", error);
  });

/* RENDER MENU */
function renderMenu(user) {
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
      <button id="loginGoogleBtn" class="login-btn">Login Google</button>
    `;

    document.getElementById("loginGoogleBtn").onclick = () => {
      signInWithRedirect(auth, provider);
    };
  }
}

/* AUTH STATE */
onAuthStateChanged(auth, (user) => {
  console.log("AUTH STATE:", user);
  renderMenu(user);
});
