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
  {
    id: "motor",
    nama: "Garasi Sepeda Motor",
    harga: 0,
    hargaLabel: "Gratis",
    desc: "Parkir motor di garasi khusus tanpa biaya tambahan. Gunakan kunci ganda. Kehilangan menjadi tanggung jawab pemilik."
  },
  {
    id: "mobil",
    nama: "Carport Mobil",
    harga: 150000,
    hargaLabel: "Rp 150.000 / bulan",
    desc: "Kuota terbatas. Parkir di carport sesuai arahan pengurus. Gunakan alarm & kunci stang."
  },
  {
    id: "laundry",
    nama: "Laundry Kiloan Unlimited",
    harga: 200000,
    hargaLabel: "Rp 200.000 / orang / bulan",
    desc: "Laundry profesional rekanan Kostory. Pakaian dijemput, dicuci, dan dikembalikan bersih & wangi."
  },
  {
    id: "listrik",
    nama: "Token Listrik Unlimited",
    harga: 450000,
    hargaLabel: "Rp 450.000 / bulan",
    desc: "Tidak perlu isi token. Listrik selalu aktif tanpa khawatir kehabisan."
  },
  {
    id: "pasangan",
    nama: "Kost Bersama Pasangan",
    harga: 350000,
    hargaLabel: "Rp 350.000 / bulan",
    desc: "Untuk pasangan resmi / keluarga inti. Wajib menunjukkan dokumen pendukung."
  },
  {
    id: "housekeeping",
    nama: "Housekeeping Ekstra",
    harga: 300000,
    hargaLabel: "Rp 300.000 / bulan",
    desc: "Kamar dibersihkan setiap 3 hari. Cocok untuk kamu yang super sibuk."
  }
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
  const pills = document.querySelectorAll(".pill input");

  pills.forEach(input => {
    // INIT STATE (INI YANG KURANG SEBELUMNYA)
    if (input.checked) {
      input.closest(".pill").classList.add("active");
      selectedDurasi = input.value;
    }

    input.addEventListener("change", () => {
      document.querySelectorAll(".pill")
        .forEach(p => p.classList.remove("active"));

      input.closest(".pill").classList.add("active");
      selectedDurasi = input.value;
      updateSummary();
    });
  });
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
