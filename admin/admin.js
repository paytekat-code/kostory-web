import { auth } from "../js/firebase.js";
import { signOut } from
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

document.getElementById("logoutBtn").onclick = async () => {
  await signOut(auth);
  location.href = "/login.html";
};
