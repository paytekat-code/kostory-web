import { db } from "../js/firebase.js";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const kostId = params.get("kostId");

if (!kostId) {
  alert("kostId tidak ditemukan");
  throw new Error("kostId missing");
}

const pageTitle = document.getElementById("pageTitle");
const kostNamaEl = document.getElementById("kostNama");
const roomListEl = document.getElementById("roomList");
const btnTambah = document.getElementById("btnTambah");

// ===== LOAD KOST INFO =====
async function loadKost() {
  const ref = doc(db, "kost", kostId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    alert("Data kost tidak ditemukan");
    return;
  }

  const kost = snap.data();
  pageTitle.textContent = "Tipe Kamar";
  kostNamaEl.textContent = `Kost: ${kost.nama}`;
}

// ===== LOAD ROOMS =====
async function loadRooms() {
  roomListEl.innerHTML = "";

  const snap = await getDocs(
    collection(db, "kost", kostId, "rooms")
  );

  if (snap.empty) {
    roomListEl.innerHTML = "<p class='help'>Belum ada tipe kamar.</p>";
    return;
  }

  snap.forEach(docSnap => {
    const room = docSnap.data();
    const roomId = docSnap.id;

    const card = document.createElement("div");
    card.style.border = "1px solid #e3e6ea";
    card.style.borderRadius = "12px";
    card.style.padding = "16px";
    card.style.marginBottom = "14px";
    card.style.background = "#fff";

    card.innerHTML = `
      <strong>${room.nama}</strong><br>
      <span class="help">
        Total: ${room.totalKamar} • Tersedia: ${room.tersedia}
      </span><br><br>

      <button data-edit>Edit</button>
      <button data-delete style="margin-left:8px; background:#e11d48">
        Hapus
      </button>
    `;

    // EDIT
    card.querySelector("[data-edit]").onclick = () => {
      location.href =
        `room-form.html?kostId=${kostId}&roomId=${roomId}`;
    };

    // DELETE
    card.querySelector("[data-delete]").onclick = async () => {
      if (!confirm("Hapus tipe kamar ini?")) return;
      await deleteDoc(
        doc(db, "kost", kostId, "rooms", roomId)
      );
      loadRooms();
    };

    roomListEl.appendChild(card);
  });
}

// ===== BUTTON TAMBAH =====
btnTambah.onclick = () => {
  location.href = `room-form.html?kostId=${kostId}`;
};

// INIT
loadKost();
loadRooms();
