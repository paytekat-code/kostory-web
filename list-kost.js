// 1️⃣ IMPORT HARUS PALING ATAS
import { db } from "./js/firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 2️⃣ BARU BOLEH BACA URL PARAMS
const params = new URLSearchParams(window.location.search);
const city = params.get("city");
const duration = params.get("duration");
const checkin = params.get("checkin");

// 3️⃣ VALIDASI SETELAH SEMUA ADA
if (!city || !duration || !checkin) {
  alert("Durasi atau tanggal check-in tidak ditemukan. Silakan ulangi dari halaman awal.");
  location.href = "/index.html";
  throw new Error("missing params");
}

const kostList = document.getElementById("kostList");
const summary = document.getElementById("summary");

summary.textContent =
  `Menampilkan kost di ${city} untuk durasi ${duration}`;

async function getHargaBulananTerendah(kostId) {
  const snap = await getDocs(collection(db, "kost", kostId, "rooms"));
  let harga = null;

  snap.forEach(r => {
    const d = r.data();
    if (!d.aktif || !d.hargaBulanan) return;
    if (harga === null || d.hargaBulanan < harga) {
      harga = d.hargaBulanan;
    }
  });

  return harga;
}

async function loadKost() {
  const snap = await getDocs(collection(db, "kost"));

  for (const doc of snap.docs) {
    const k = doc.data();

    if (k.kota !== city) continue;
    if (!k.durasiTersedia?.includes(duration)) continue;

    const harga = await getHargaBulananTerendah(doc.id);
    const foto = k.heroImages?.[0] || "img/default-kost.jpg";

    const card = document.createElement("div");
    card.className = "kost-card";

    card.innerHTML = `
      <div class="kost-img">
        <img src="${foto}">
      </div>

      <div class="kost-info">
        <h3>${k.nama}</h3>

        <div class="rating">⭐ ${k.rating ?? 4.8} (${k.reviewCount ?? 0})</div>
        <div class="location">📍 ${k.kota}</div>
        <div class="landmark">
            🗺️ ${k.landmark ?? "-"}
        </div>

        <div class="jenis-kost">
            ${k.jenisKost ?? ""}
        </div>

        <div class="price-row">
          <div class="price">
            IDR ${harga ? harga.toLocaleString("id-ID") : "-"}
            <span>/bulan</span>
          </div>
          <button class="btn-detail">Lihat Detail</button>
        </div>
      </div>
    `;

    card.querySelector(".btn-detail").onclick = () => {
      location.href =
  `/detail-kost.html?id=${doc.id}&duration=${duration}&checkin=${checkin}`;

    };

    kostList.appendChild(card);
  }
}

loadKost();
