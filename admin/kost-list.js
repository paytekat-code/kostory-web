import { db } from "../js/firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const kostListEl = document.getElementById("kostList");
const btnTambah = document.getElementById("btnTambah");

btnTambah.onclick = () => {
  location.href = "kost-form.html";
};

async function loadKost() {
  kostListEl.innerHTML = "";

  const snap = await getDocs(collection(db, "kost"));

  if (snap.empty) {
    kostListEl.innerHTML =
      "<p class='help'>Belum ada data kost.</p>";
    return;
  }

  snap.forEach(docSnap => {
    const kost = docSnap.data();
    const kostId = docSnap.id;

    const card = document.createElement("div");
    card.style.background = "#fff";
    card.style.border = "1px solid #e3e6ea";
    card.style.borderRadius = "14px";
    card.style.padding = "18px";
    card.style.marginBottom = "16px";

    card.innerHTML = `
      <strong style="font-size:16px">${kost.nama}</strong><br>
      <span class="help">${kost.alamat || "-"}</span><br><br>

      <button data-edit>Edit Kost</button>
      <button data-room style="margin-left:8px">
        Kelola Kamar
      </button>
    `;

    // EDIT KOST
    card.querySelector("[data-edit]").onclick = () => {
      location.href = `kost-form.html?id=${kostId}`;
    };

    // KE ROOM LIST
    card.querySelector("[data-room]").onclick = () => {
      location.href = `room-list.html?kostId=${kostId}`;
    };

    kostListEl.appendChild(card);
  });
}

loadKost();
