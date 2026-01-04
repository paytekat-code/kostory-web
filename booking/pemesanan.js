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
    desc: "Kamu bisa parkir motor di garasi khusus tanpa biaya tambahan. Pastikan saja motor dikunci ganda ya, biar aman. Kalau ada apa-apa, tanggung jawabnya tetap di pemilik kendaraan.."
  },
  {
    id: "mobil",
    nama: "Carport Mobil",
    harga: 150000,
    hargaLabel: "Rp 150.000 / bulan",
    desc: "Parkir mobil di carport yang sudah disediakan. Ikuti petunjuk dari pengurus kost supaya semua nyaman bareng-bareng. Jangan lupa nyalakan alarm dan pakai kunci stang untuk keamanan ekstra. Kehilangan tetap jadi tanggung jawab pemilik kendaraan"
  },
  {
    id: "laundry",
    nama: "Laundry Kiloan Unlimited",
    harga: 200000,
    hargaLabel: "Rp 200.000 / orang / bulan",
    desc: "Nggak perlu ribet mikirin cucian menumpuk. Pakaian kotor kamu bakal dijemput, dicuci di laundry profesional yang kerja sama sama Kostory, lalu dikembalikan sudah wangi dan rapi banget.."
  },
  {
    id: "listrik",
    nama: "Token Listrik Unlimited",
    harga: 450000,
    hargaLabel: "Rp 450.000 / bulan",
    desc: "Listrik selalu full, nggak perlu deg-degan kehabisan token pas tengah malam hujan deras. Santai aja, kayak semangat kamu yang nggak pernah padam."
  },
  {
    id: "pasangan",
    nama: "Kost Bersama Pasangan",
    harga: 350000,
    hargaLabel: "Rp 350.000 / bulan",
    desc: "Mau tinggal bareng pasangan di Kostory? Bisa banget, satu kamar cukup. Pilih double bed atau twin bed sesuai kebutuhan. Layanan ini hanya untuk pasangan yang sudah resmi menikah (tunjukkan surat nikah) atau bersama saudara kandung/orang tua (tunjukkan Kartu Keluarga)."
  },
  {
    id: "housekeeping",
    nama: "Housekeeping Ekstra",
    harga: 300000,
    hargaLabel: "Rp 300.000 / bulan",
    desc: "Pulang kerja atau kuliah langsung bisa selonjoran di kamar yang rapi dan bersih? Enak banget kan. Setiap 3 hari kamar dibersihkan dan dirapikan seperti baru check-in. Plus, kalau butuh bantuan ekstra untuk bersih-bersih, tinggal bilang aja."
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
