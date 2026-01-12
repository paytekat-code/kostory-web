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

function generateCode(prefix = "BK") {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${code}`;
}

// ===== DEFAULT LABEL UNTUK YANG TIDAK DIPILIH =====
const DEFAULT_ADDON_LABELS = {
  autoRenew: "Perpanjangan otomatis tidak aktif, kamar bisa di-book orang lain di periode berikutnya",
  motor: "Tidak membawa Sepeda Motor",
  mobil: "Tidak membawa Mobil",
  laundry: "Laundry sendiri atau Kiloan by Kostory (min 3kg)",
  listrik: "Token listrik mengisi sendiri",
  pasangan: "Tinggal sendiri / Tidak membawa pasangan",
  housekeeping: "Layanan Housekeeping Standard (setiap 14 hari)"
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
 html += `<div class="addon-section"><div class="addon-title">Catatan</div>`;


  ALL_ADDONS.forEach(a => {
    if (!includedIds.includes(a.id)) {
      const label = DEFAULT_ADDON_LABELS[a.id] || "";
      html += `<div class="addon-item excluded">- ${label}</div>`;
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
  const enabled = agreeTnc.checked;
  btnBooking.disabled = !enabled;
  btnSurvey.disabled = !enabled;
});


const btnBooking = document.getElementById("btnBooking");
const btnSurvey = document.getElementById("btnSurvey");

const surveyModal = document.getElementById("surveyModal");
const cancelSurvey = document.getElementById("cancelSurvey");
const confirmSurvey = document.getElementById("confirmSurvey");

btnBooking.disabled = true;
btnSurvey.disabled = true;

// ===== LOGIC BOOKING & SURVEY =====

btnBooking.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  if (!agreeTnc.checked) {
    alert("Anda harus menyetujui Syarat & Ketentuan.");
    return;
  }

  const bookingCode = generateCode("BK");

  const data = {
    type: "booking",
    status: "booking",
    bookingCode,

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

    termsAccepted: true,
    termsAcceptedAt: new Date().toISOString(),

    createdAt: serverTimestamp()
  };

  try {
    await addDoc(collection(db, "orders"), data);
    localStorage.removeItem("bookingDraft");
    location.href = "/member/history.html";
  } catch (err) {
    console.error(err);
    alert("Gagal menyimpan booking");
  }
});

// ===== SURVEY =====

btnSurvey.addEventListener("click", () => {
  if (!agreeTnc.checked) {
    alert("Anda harus menyetujui Syarat & Ketentuan.");
    return;
  }

  surveyModal.style.display = "flex";
});

cancelSurvey.addEventListener("click", () => {
  surveyModal.style.display = "none";
});

confirmSurvey.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const date = document.getElementById("surveyDate").value;
  const time = document.getElementById("surveyTime").value;

  if (!date || !time) {
    alert("Pilih tanggal dan jam survey");
    return;
  }

  const surveyCode = generateCode("SV");

  const data = {
    type: "survey",
    status: "survey",
    bookingCode: surveyCode,

    booker: {
      uid: user.uid,
      email: user.email,
      nama: bookerNama.value
    },

    kostId,
    roomTypeId,

    tanggalSurvey: date,
    jamSurvey: time,

    createdAt: serverTimestamp()
  };

  try {
    await addDoc(collection(db, "orders"), data);

    const waText = encodeURIComponent(
`Halo Kak, saya ingin melakukan Survey

Kode: ${surveyCode}
Tanggal : ${date}
Jam : ${time}

Mohon konfirmasinya ya kak, terima kasih.`
    );

    // TODO: ganti dengan nomor WA dari data kost
    window.open(`https://wa.me/62XXXXXXXXXX?text=${waText}`, "_blank");

    surveyModal.style.display = "none";
  } catch (err) {
    console.error(err);
    alert("Gagal menyimpan survey");
  }
});
