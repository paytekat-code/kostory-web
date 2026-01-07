import { auth } from "../js/firebase.js";
import {
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const googleBtn = document.querySelector(".google-btn");

googleBtn.addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();

  try {
    await signInWithPopup(auth, provider);

    // ✅ LOGIN BERHASIL → LANGSUNG KE PROFILE
    window.location.href = "profile.html";

  } catch (error) {
    console.error("Google login error:", error);
    alert("Login gagal, coba lagi");
  }
});
