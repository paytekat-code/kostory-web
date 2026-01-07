import { auth } from "./firebase.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const provider = new GoogleAuthProvider();

document.getElementById("loginGoogle").onclick = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    alert("Login gagal");
    console.error(e);
  }
};

onAuthStateChanged(auth, user => {
  if (user) {
    console.log("Login sukses:", user.email);
    location.href = "/admin.html"; // arahkan ke dashboard kamu
  }
});
