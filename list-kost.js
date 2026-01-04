import { db } from "./js/firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const city = params.get("city");
const duration = params.get("duration");

const kostList = document.getElementById("kostList");
const summary = document.getElementById("summary");

summary.textContent =
  `Menampilkan kost di ${city} untuk durasi ${duration}`;

async function getHargaBulananTerendah(kostId) {
  const roomSnap = await getDocs(
    collection(db, "kost", kostId, "rooms")
  );

  let hargaTerendah = null;

  roomSnap.forEach(r => {
    const room = r.data();
    if (!room.aktif) return;
    if (!room.hargaBulanan) return;

    if (hargaTerendah === null || room.hargaBulanan < hargaTerendah) {
      hargaTerendah = room.hargaBulanan;
    }
  });

  return hargaTerendah;
}

async function loadKost() {
  const snap = await getDocs(collection(db, "kost"));
  kostList.innerHTML = "";

  for (const docSnap of snap.docs) {
    const k = docSnap.data();

    if (k.kota !== city) continue;
    if (!k.durasiTersedia?.includes(duration)) continue;

    const hargaMulai = await getHargaBulananTerendah(docSnap.id);
    const foto = k.heroImages?.[0] ?? "img/default-kost.jpg";

    const card = document.createElement("div");
    card.className = "kost-card";

    card.innerHTML = `
      <div class="kost-img">
        <img src="${foto}" alt="${k.nama}">
      </div>

      <div class="kost-info">
        <h3>${k.nama}</h3>

        <div class="rating">
          ⭐ ${k.rating ?? "4.8"}
          <span>(${k.reviewCount ?? 0})</span>
        </div>

        <div class="location">
          📍 ${k.kota}
        </div>

        <div class="facility">
          ${(k.fasilitasUmum ?? []).slice(0,3).join(" · ")}
        </div>

        <div class="price-row">
          <div class="price">
            IDR ${hargaMulai
              ? hargaMulai.toLocaleString("id-ID")
              : "-"}
            <span>/bulan</span>
          </div>

          <button class="btn-detail">
            Lihat Detail
          </button>
        </div>
      </div>
    `;

    card.querySelector(".btn-detail").onclick = () => {
      location.href = `/detail-kost.html?id=${docSnap.id}`;
    };

    kostList.appendChild(card);
  }
}

loadKost();
