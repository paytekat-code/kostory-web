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

// ===== AMBIL DRAFT DARI LOCALSTORAGE =====
const draftRaw = localStorage.getItem("bookingDraft");

if (!draftRaw) {
  alert("Data pemesanan tidak ditemukan. Silakan ulangi dari awal.");
  window.location.href = "/index.html";
  throw new Error("missing bookingDraft");
}

const draft = JSON.parse(draftRaw);

const kostId = draft.kostId;
const roomTypeId = draft.roomId;
const selectedAddons = draft.addons || [];
const selectedDurasi = draft.durasi;

// ===== DEFAULT LABEL UNTUK YANG TIDAK DIPILIH =====
const DEFAULT_ADDON_LABELS = {
  autoRenew: "Tidak Aktif, kamar di-open di periode berikutnya",
  mobil: "Tidak membawa mobil",
  laundry: "Kiloan (minimal 3Kg)",
  listrik: "Mengisi Token Sendiri",
  pasangan: "Tinggal Sendiri",
  housekeeping: "Standard (Setiap 14 Hari)"
};

// ===== DAFTAR SEMUA ADDON =====
const ALL_ADDONS = [
  { id: "autoRenew", nama: "Perpanjangan Otomatis" },
  { id: "motor", nama: "Garasi Motor" },
  { id: "mobil", nama: "Parkir Mobil" },
  { id: "laundry", nama: "Laundry" },
  { id: "listrik", nama: "Token Listrik" },
  { id: "pasangan", nama: "Pasangan Kost" },
  { id: "housekeeping", nama: "Layanan Housekeeping" }
];

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

  let hargaKamar = 0;

  if (kostSnap.exists()) {
    kostNamaEl.textContent = kostSnap.data().nama;
  }

  if (roomSnap.exists()) {
    const room = roomSnap.data();
    roomTypeNamaEl.textContent = room.nama;

    hargaKamar = room[`harga${selectedDurasi}`] || 0;
  }

  renderRingkasanHarga(hargaKamar);
}

loadInfo();

// ===== RENDER RINGKASAN =====
function renderRingkasanHarga(hargaKamar) {
  let total = hargaKamar;

  selectedAddons.forEach(a => {
    total += a.harga || 0;
  });

  const includedIds = selectedAddons.map(a => a.id);

  let html = `
    <div style="font-size:18px;font-weight:600;margin-bottom:8px">
      Total: Rp ${total.toLocaleString("id-ID")} / ${selectedDurasi}
    </div>
  `;

  // === SUDAH TERMASUK ===
  html += `<div class="addon-section"><div class="addon-title">Sudah Termasuk</div>`;

  if (includedIds.length === 0) {
    html += `<div class="addon-item excluded">Tidak ada tambahan</div>`;
  } else {
    ALL_ADDONS.forEach(a => {
      if (includedIds.includes(a.id)) {
        html += `<div class="addon-item included">✅ ${a.nama}</div>`;
      }
    });
  }

  html += `</div>`;

  // === TIDAK TERMASUK ===
  html += `<div class="addon-section"><div class="addon-title">Tidak Termasuk</div>`;

  ALL_ADDONS.forEach(a => {
    if (!includedIds.includes(a.id)) {
      const label = DEFAULT_ADDON_LABELS[a.id] || "";
      html += `<div class="addon-item excluded">❌ ${a.nama}${label ? ": " + label : ""}</div>`;
    }
  });

  html += `</div>`;

  hargaBox.innerHTML = html;
}

// ===== AUTH =====
onAuthStateChanged(auth, user => {
  if (!user) {
    const currentUrl = window.location.href;
    const loginUrl =
      "https://kostory.id/member/login-member.html?redirect=" +
      encodeURIComponent(currentUrl);
    location.href = loginUrl;
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

    durasi: draft.durasi,
    checkin: draft.checkin,
    checkout: draft.checkout,
    addons: selectedAddons,
    autoRenew: draft.autoRenew || false,

    status: "submitted",

    termsAccepted: true,
    termsAcceptedAt: new Date().toISOString(),

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    await addDoc(collection(db, "bookings"), data);
    alert("Booking berhasil dikirim");
    localStorage.removeItem("bookingDraft");
    location.href = "/booking/success.html";
  } catch (err) {
    console.error(err);
    alert("Gagal mengirim booking");
  }
});
