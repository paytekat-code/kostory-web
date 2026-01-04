import { db } from "./js/firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const city = params.get("city");
const duration = params.get("duration");

if (!city || !duration) {
  alert("Parameter pencarian tidak lengkap");
  throw new Error("missing param");
}

const kostList = document.getElementById("kostList");
const summary = document.getElementById("summary");

summary.textContent =
  `Menampilkan kost di ${city} untuk durasi ${duration}`;

async function loadKost() {
  const snap = await getDocs(collection(db, "kost"));

  kostList.innerHTML = "";

  snap.forEach(docSnap => {
    const k = docSnap.data();

    // FILTER KOTA
   if (k.kota !== city) return;


    // FILTER DURASI
    if (!k.durasiTersedia?.includes(duration)) return;

    const card = document.createElement("div");
    card.className = "card";
    card.style.marginBottom = "12px";

    card.innerHTML = `
      <strong>${k.nama}</strong><br>
      <span class="help">${k.alamat}</span><br><br>
      <span class="help">
        Mulai dari Rp ${k.hargaMulai?.toLocaleString("id-ID") ?? "-"}
      </span><br><br>

      <button>Lihat Detail</button>
    `;

    card.querySelector("button").onclick = () => {
      location.href = `/detail-kost.html?id=${docSnap.id}`;
    };

    kostList.appendChild(card);
  });
}

loadKost();
