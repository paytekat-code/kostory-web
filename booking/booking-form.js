import { db, auth } from "../js/firebase.js";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ===== PARAM =====
const params = new URLSearchParams(window.location.search);
const kostId = params.get("kostId");
const roomTypeId = params.get("roomTypeId");

if (!kostId || !roomTypeId) {
  alert("Parameter booking tidak lengkap");
  throw new Error("missing param");
}

// ===== ELEMENT =====
const kostNamaEl = document.getElementById("kostNama");
const roomTypeNamaEl = document.getElementById("roomTypeNama");
const bookerNama = document.getElementById("bookerNama");
const bookerEmail = document.getElementById("bookerEmail");

const untukSiapa = document.getElementById("untukSiapa");
const penghuniBox = document.getElementById("penghuniBox");
const penghuniNama = document.getElementById("penghuniNama");
const penghuniHp = document.getElementById("penghuniHp");

const hargaBox = document.getElementById("hargaBox");
const agreeTnc = document.getElementById("agreeTnc");
const submitBtn = document.getElementById("submitBtn");

const form = document.getElementById("bookingForm");

// ===== LOAD INFO KOST =====
async function loadInfo() {
  const kostSnap = await getDoc(doc(db, "kost", kostId));
  const roomSnap = await getDoc(
    doc(db, "kost", kostId, "rooms", roomTypeId)
  );

  if (kostSnap.exists()) {
    kostNamaEl.textContent = kostSnap.data().nama;
  }

  if (roomSnap.exists()) {
    const room = roomSnap.data();
    roomTypeNamaEl.textContent = room.nama;

    if (room.hargaBulanan) {
      hargaBox.innerHTML =
        `Harga Bulanan: Rp ${room.hargaBulanan.toLocaleString("id-ID")}`;
    }
  }
}

loadInfo();

// ===== AUTH =====
onAuthStateChanged(auth, user => {
  if (!user) {
    alert("Silakan login terlebih dahulu");
    location.href = "/login.html";
    return;
  }

  bookerNama.value = user.displayName || "";
  bookerEmail.value = user.email;
});

// ===== UNTUK SIAPA =====
untukSiapa.addEventListener("change", () => {
  penghuniBox.style.display =
    untukSiapa.value === "orang_lain" ? "block" : "none";
});

// ===== T&C CHECK =====
agreeTnc.addEventListener("change", () => {
  submitBtn.disabled = !agreeTnc.checked;
});

// ===== SUBMIT =====
form.addEventListener("submit", async e => {
  e.preventDefault();

  if (!agreeTnc.checked) {
    alert("Anda harus menyetujui Syarat & Ketentuan.");
    return;
  }

  const user = auth.currentUser;
  if (!user) return;

  const data = {
    booker: {
      uid: user.uid,
      email: user.email,
      nama: bookerNama.value
    },

    untuk: {
      tipe: untukSiapa.value
    },

    calonPenghuni: {
      nama:
        untukSiapa.value === "orang_lain"
          ? penghuniNama.value
          : bookerNama.value,
      noHp:
        untukSiapa.value === "orang_lain"
          ? penghuniHp.value
          : ""
    },

    kostId,
    roomTypeId,

    status: "submitted",

    termsAccepted: true,
    termsAcceptedAt: new Date().toISOString(),

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    await addDoc(collection(db, "bookings"), data);
    alert("Booking berhasil dikirim");
    location.href = "/booking/success.html";
  } catch (err) {
    console.error(err);
    alert("Gagal mengirim booking");
  }
});
