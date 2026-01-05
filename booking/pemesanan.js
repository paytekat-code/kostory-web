
import { db } from "../js/firebase.js";
import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);

const kostId = params.get("kostId");
const roomId = params.get("roomId"); // ⬅️ TAMBAH INI
const durasi = params.get("durasi");
const checkin = params.get("checkin");

if (!kostId || !roomId || !durasi || !checkin) {
  alert("Durasi atau tanggal check-in tidak ditemukan. Silakan ulangi dari halaman awal.");
  window.location.href = "/index.html";
}

const kostNamaEl = document.getElementById("kostNama");
const roomListEl = document.getElementById("roomList");
const addonListEl = document.getElementById("addonList");
const summaryEl = document.getElementById("summary");
const btnLanjut = document.getElementById("btnLanjut");

let selectedRoom = null;
let selectedDurasi = durasi;
let selectedAddons = [];

/* ===== ADDON SESUAI DOKUMEN ===== */
const ADDONS = [
  {
    id: "motor",
    nama: "Garasi Sepeda Motor",
    harga: 0,
    hargaLabel: "Gratis",
    desc: "Pakai garasi motor tanpa tambahan biaya, jangan lupa dikunci ganda, tanggung jawabnya tetap di pemilik kendaraan."
  },
  {
    id: "mobil",
    nama: "Carport Mobil",
    harga: 150000,
    hargaLabel: "Rp 150.000 / bulan",
    desc: "Jika kamu bawa mobil, jangan lupa amankan slot parkirmu, karena slot parkir mobil terbatas."
  },
  {
    id: "laundry",
    nama: "Laundry Kiloan Unlimited",
    harga: 200000,
    hargaLabel: "Rp 200.000 / orang / bulan",
    desc: "Pakean kotormu akan diambil dan dicuciin oleh laundry Profesional, cukup tarok aja, besok lusa udah wangi."
  },
  {
    id: "listrik",
    nama: "Token Listrik Unlimited",
    harga: 450000,
    hargaLabel: "Rp 450.000 / bulan",
    desc: "Listrik selalu nyala, kayak semangat kamu yang nggak pernah padam."
  },
  {
    id: "pasangan",
    nama: "Kost Bersama Pasangan",
    harga: 350000,
    hargaLabel: "Rp 350.000 / bulan",
    desc: "Tinggal bareng sama yang tersayang (suami, istri, anak, kakak, adik, orangtua) cukup tunjukan dokumen pendukung."
  },
  {
    id: "housekeeping",
    nama: "Housekeeping Ekstra",
    harga: 300000,
    hargaLabel: "Rp 300.000 / bulan",
    desc: "Kamar kamu dibersihin dan dirawat 5x lebih sering ketimbang yang biasanya, bersih sampe kinclong"
  }
];


async function loadKost() {
  // ambil data kost
  const kostSnap = await getDoc(doc(db, "kost", kostId));
  if (kostSnap.exists()) {
    document.getElementById("sumKost").textContent = kostSnap.data().nama;
  }

  // ambil data kamar (INI YANG SEBELUMNYA HILANG)
  const roomSnap = await getDoc(
    doc(db, "kost", kostId, "rooms", roomId)
  );

  if (!roomSnap.exists()) {
    alert("Data kamar tidak ditemukan");
    throw new Error("room not found");
  }

  const r = roomSnap.data();

  // ⬇️ ISI selectedRoom SECARA OTOMATIS
  selectedRoom = {
    id: roomId,
    nama: r.nama,
    harga: {
      Bulanan: r.hargaBulanan || 0,
      Mingguan: r.hargaMingguan || 0,
      Harian: r.hargaHarian || 0
    }
  };

  // tampilkan ke ringkasan
  document.getElementById("sumRoom").textContent = r.nama;
  document.getElementById("sumDurasi").textContent = durasi;
  document.getElementById("sumCheckin").textContent = checkin;
const checkout = hitungCheckout(checkin, durasi);
document.getElementById("sumCheckout").textContent = checkout;

  updateSummary(); // ⬅️ WAJIB
}

function loadAddons() {
  addonListEl.innerHTML = "";

  ADDONS.forEach(a => {
    const card = document.createElement("div");
    card.className = "addon-card";

    card.innerHTML = `
      <div class="addon-left">
        <div class="addon-title">${a.nama}</div>
        <div class="addon-price">${a.hargaLabel}</div>
        <div class="addon-desc">${a.desc}</div>
      </div>

      <div class="addon-right">
        <input type="checkbox">
      </div>
    `;

    const checkbox = card.querySelector("input");

    card.onclick = () => {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event("change"));
    };

    checkbox.onchange = () => {
      if (checkbox.checked) {
        card.classList.add("selected");
        selectedAddons.push(a);
      } else {
        card.classList.remove("selected");
        selectedAddons =
          selectedAddons.filter(x => x.id !== a.id);
      }
      updateSummary();
    };

    addonListEl.appendChild(card);
  });
}

function updateSummary() {
  if (!selectedRoom) {
  btnLanjut.disabled = true;
  return;
}
  
  const checkout = hitungCheckout(checkin, selectedDurasi);

let total = selectedRoom.harga[selectedDurasi];
let html = `
  <div style="margin-top:6px">
    <b>Harga Kamar</b>: Rp ${total.toLocaleString("id-ID")}
  </div>
`;


  if (selectedAddons.length) {
    html += "<div><b>Layanan Tambahan:</b></div>";
    selectedAddons.forEach(a => {
      total += a.harga;
      html += `<div>+ ${a.nama}: Rp ${a.harga.toLocaleString("id-ID")}</div>`;
    });
  }

  html += `<hr><b>Total: Rp ${total.toLocaleString("id-ID")}</b>`;

  const autoRenewEl = document.getElementById("autoRenew");
const autoRenew = autoRenewEl ? autoRenewEl.checked : false;

html += `
  <div style="margin-top:8px">
    <b>Perpanjangan Otomatis</b> :
    ${autoRenew ? "Aktif" : "Tidak Aktif"}
  </div>
`;

  summaryEl.innerHTML = html;
  btnLanjut.disabled = false;
}

btnLanjut.onclick = () => {
  localStorage.setItem("bookingDraft", JSON.stringify({
  kostId,
  roomId: selectedRoom.id,
  roomNama: selectedRoom.nama,
  durasi: selectedDurasi,
  checkin,
  checkout: hitungCheckout(checkin, selectedDurasi),
  autoRenew: document.getElementById("autoRenew")?.checked || false,
  addons: selectedAddons
}));


  location.href = "/booking/booking-form.html";
};

loadKost();

loadAddons();

function hitungCheckout(checkin, durasi) {
  const d = new Date(checkin);

  if (durasi === "Harian") d.setDate(d.getDate() + 1);
  if (durasi === "Mingguan") d.setDate(d.getDate() + 7);
  if (durasi === "Bulanan") d.setMonth(d.getMonth() + 1);

  return d.toISOString().split("T")[0];
}
