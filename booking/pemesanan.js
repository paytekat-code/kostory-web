import { db } from "../js/firebase.js";
import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ===== PARAM =====
const params = new URLSearchParams(window.location.search);
const kostId = params.get("kostId");

if (!kostId) {
  alert("kostId tidak ditemukan");
  throw new Error("missing kostId");
}

// ===== ELEMENT =====
const kostNamaEl = document.getElementById("kostNama");
const roomListEl = document.getElementById("roomList");
const addonListEl = document.getElementById("addonList");
const summaryEl = document.getElementById("summary");
const btnLanjut = document.getElementById("btnLanjut");

// ===== STATE =====
let selectedRoom = null;
let selectedAddons = [];

// ===== DATA ADDON (V1 – statis dulu) =====
const ADDONS = [
  { id: "listrik", nama: "Listrik", harga: 150000 },
  { id: "laundry", nama: "Laundry", harga: 100000 },
  { id: "parkir", nama: "Parkir Motor", harga: 50000 }
];

// ===== LOAD KOST =====
async function loadKost() {
  const snap = await getDoc(doc(db, "kost", kostId));
  if (snap.exists()) {
    kostNamaEl.textContent = snap.data().nama;
  }
}

// ===== LOAD ROOM TYPES =====
async function loadRooms() {
  const snap = await getDocs(
    collection(db, "kost", kostId, "rooms")
  );

  roomListEl.innerHTML = "";

  snap.forEach(docSnap => {
    const r = docSnap.data();
    const roomTypeId = docSnap.id;

    const card = document.createElement("div");
    card.className = "card";
    card.style.marginBottom = "12px";
    card.style.cursor = "pointer";

    card.innerHTML = `
      <strong>${r.nama}</strong><br>
      <span class="help">
        Bulanan: Rp ${r.hargaBulanan?.toLocaleString("id-ID")}
      </span>
    `;

    card.onclick = () => {
      document
        .querySelectorAll("#roomList .card")
        .forEach(c => c.style.border = "1px solid #e5e7eb");

      card.style.border = "2px solid #6366f1";

      selectedRoom = {
        roomTypeId,
        nama: r.nama,
        harga: r.hargaBulanan || 0
      };

      updateSummary();
    };

    roomListEl.appendChild(card);
  });
}

// ===== LOAD ADDONS =====
function loadAddons() {
  addonListEl.innerHTML = "";

  ADDONS.forEach(a => {
    const row = document.createElement("label");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "8px";
    row.style.marginBottom = "8px";

    row.innerHTML = `
      <input type="checkbox" value="${a.id}">
      ${a.nama} (+Rp ${a.harga.toLocaleString("id-ID")})
    `;

    const checkbox = row.querySelector("input");
    checkbox.onchange = () => {
      if (checkbox.checked) {
        selectedAddons.push(a);
      } else {
        selectedAddons =
          selectedAddons.filter(x => x.id !== a.id);
      }
      updateSummary();
    };

    addonListEl.appendChild(row);
  });
}

// ===== UPDATE SUMMARY =====
function updateSummary() {
  if (!selectedRoom) {
    summaryEl.innerHTML = "Pilih tipe kamar terlebih dahulu";
    btnLanjut.disabled = true;
    return;
  }

  let total = selectedRoom.harga;
  let html = `
    <div>Harga Kamar: Rp ${selectedRoom.harga.toLocaleString("id-ID")}</div>
  `;

  if (selectedAddons.length) {
    html += `<div style="margin-top:6px"><b>Add-on:</b></div>`;
    selectedAddons.forEach(a => {
      total += a.harga;
      html += `<div>+ ${a.nama}: Rp ${a.harga.toLocaleString("id-ID")}</div>`;
    });
  }

  html += `
    <hr style="margin:8px 0">
    <div><b>Total: Rp ${total.toLocaleString("id-ID")}</b></div>
  `;

  summaryEl.innerHTML = html;
  btnLanjut.disabled = false;
}

// ===== LANJUT BOOKING =====
btnLanjut.onclick = () => {
  const draft = {
    kostId,
    roomTypeId: selectedRoom.roomTypeId,
    roomNama: selectedRoom.nama,
    hargaKamar: selectedRoom.harga,
    addons: selectedAddons,
    total:
      selectedRoom.harga +
      selectedAddons.reduce((s, a) => s + a.harga, 0)
  };

  localStorage.setItem("bookingDraft", JSON.stringify(draft));

  location.href =
    `/booking/booking-form.html?kostId=${kostId}&roomTypeId=${selectedRoom.roomTypeId}`;
};

// INIT
loadKost();
loadRooms();
loadAddons();
updateSummary();
