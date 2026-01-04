import { db } from "../js/firebase.js";
import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const kostId = params.get("kostId");

if (!kostId) {
  alert("kostId tidak ditemukan");
  throw new Error("missing kostId");
}

const kostNamaEl = document.getElementById("kostNama");
const roomListEl = document.getElementById("roomList");
const addonListEl = document.getElementById("addonList");
const summaryEl = document.getElementById("summary");
const btnLanjut = document.getElementById("btnLanjut");

let selectedRoom = null;
let selectedDurasi = "Bulanan";
let selectedAddons = [];

/* ===== ADDON SESUAI DOKUMEN ===== */
const ADDONS = [
  { id:"motor", nama:"Garasi Sepeda Motor", harga:0 },
  { id:"mobil", nama:"Carport Mobil", harga:150000 },
  { id:"laundry", nama:"Laundry Unlimited", harga:200000 },
  { id:"listrik", nama:"Token Listrik Unlimited", harga:450000 },
  { id:"pasangan", nama:"Kost Bersama Pasangan", harga:350000 },
  { id:"housekeeping", nama:"Housekeeping Ekstra", harga:300000 }
];

async function loadKost() {
  const snap = await getDoc(doc(db, "kost", kostId));
  if (snap.exists()) {
    kostNamaEl.textContent = snap.data().nama;
  }
}

async function loadRooms() {
  const snap = await getDocs(collection(db, "kost", kostId, "rooms"));
  roomListEl.innerHTML = "";

  snap.forEach(docSnap => {
    const r = docSnap.data();

    if (!r.aktif) return;

    const card = document.createElement("div");
    card.className = "card room";

    card.innerHTML = `
      <strong>${r.nama}</strong>
      <div class="help">
        Bulanan: Rp ${r.hargaBulanan?.toLocaleString("id-ID") ?? "-"}<br>
        Mingguan: Rp ${r.hargaMingguan?.toLocaleString("id-ID") ?? "-"}<br>
        Harian: Rp ${r.hargaHarian?.toLocaleString("id-ID") ?? "-"}
      </div>
    `;

    card.onclick = () => {
      document.querySelectorAll(".room").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");

      selectedRoom = {
        id: docSnap.id,
        nama: r.nama,
        harga: {
          Bulanan: r.hargaBulanan || 0,
          Mingguan: r.hargaMingguan || 0,
          Harian: r.hargaHarian || 0
        }
      };
      updateSummary();
    };

    roomListEl.appendChild(card);
  });
}

function loadDurasi() {
  document.querySelectorAll("input[name='durasi']").forEach(r => {
    r.onchange = () => {
      selectedDurasi = r.value;
      updateSummary();
    };
  });
}

function loadAddons() {
  addonListEl.innerHTML = "";

  ADDONS.forEach(a => {
    const row = document.createElement("label");
    row.innerHTML = `
      <input type="checkbox">
      ${a.nama}
      <span>Rp ${a.harga.toLocaleString("id-ID")}</span>
    `;

    const cb = row.querySelector("input");
    cb.onchange = () => {
      if (cb.checked) selectedAddons.push(a);
      else selectedAddons = selectedAddons.filter(x => x.id !== a.id);
      updateSummary();
    };

    addonListEl.appendChild(row);
  });
}

function updateSummary() {
  if (!selectedRoom) {
    summaryEl.textContent = "Pilih kamar terlebih dahulu";
    btnLanjut.disabled = true;
    return;
  }

  let total = selectedRoom.harga[selectedDurasi];
  let html = `
    <div>Harga Kamar (${selectedDurasi}): Rp ${total.toLocaleString("id-ID")}</div>
  `;

  if (selectedAddons.length) {
    html += "<div><b>Layanan Tambahan:</b></div>";
    selectedAddons.forEach(a => {
      total += a.harga;
      html += `<div>+ ${a.nama}: Rp ${a.harga.toLocaleString("id-ID")}</div>`;
    });
  }

  html += `<hr><b>Total: Rp ${total.toLocaleString("id-ID")}</b>`;
  summaryEl.innerHTML = html;
  btnLanjut.disabled = false;
}

btnLanjut.onclick = () => {
  localStorage.setItem("bookingDraft", JSON.stringify({
    kostId,
    roomId: selectedRoom.id,
    durasi: selectedDurasi,
    addons: selectedAddons
  }));

  location.href = "/booking/booking-form.html";
};

loadKost();
loadRooms();
loadDurasi();
loadAddons();
