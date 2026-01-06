import { db } from "./firebase.js";
import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const form = document.getElementById("experienceForm");
const statusText = document.getElementById("status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    nama: document.getElementById("nama").value.trim(),
    role: document.getElementById("role").value.trim(),
    quote: document.getElementById("quote").value.trim(),
    photoUrl: document.getElementById("photoUrl").value.trim(),
    order: Number(document.getElementById("order").value),
    active: document.getElementById("active").checked
  };

  try {
    await addDoc(collection(db, "kostorian_experience"), data);
    statusText.textContent = "✅ Data berhasil disimpan";
    statusText.style.color = "green";
    form.reset();
  } catch (err) {
    console.error(err);
    statusText.textContent = "❌ Gagal menyimpan data";
    statusText.style.color = "red";
  }
});
