import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

console.log("DETAIL-KOST.JS JALAN");

const params = new URLSearchParams(window.location.search);
const kostId = params.get("id");

if (!kostId) {
  alert("ID kost tidak ditemukan");
  throw new Error("ID kosong");
}

async function loadKost() {
  try {
    const kostRef = doc(db, "kost", kostId);
    const kostSnap = await getDoc(kostRef);

    if (!kostSnap.exists()) {
      alert("Data kost tidak ditemukan");
      return;
    }

    const data = kostSnap.data();

    // HERO
    const hero = document.getElementById("hero");
    hero.innerHTML = `
      <img src="${data.heroImages?.[0] || ""}" alt="${data.nama}">
    `;

    document.getElementById("nama-kost").innerText = data.nama;
    document.getElementById("rating").innerText =
      `⭐ ${data.rating} (${data.reviewCount} reviews)`;
    document.getElementById("alamat").innerText = data.alamat;

    document.getElementById("maps-link").href =
      `https://www.google.com/maps?q=${data.location.lat},${data.location.lng}`;

    // FASILITAS
    const fasilitas = document.getElementById("fasilitas-umum");
    fasilitas.innerHTML = "";
    data.fasilitasUmum?.forEach(f =>
      fasilitas.innerHTML += `<li>${f}</li>`
    );

    // KEBIJAKAN
    const kebijakan = document.getElementById("kebijakan");
    kebijakan.innerHTML = "";
    data.kebijakan?.forEach(k =>
      kebijakan.innerHTML += `<li>${k}</li>`
    );

    // WA
    document.getElementById("wa-link").href =
      `https://wa.me/${data.kontak.wa}`;

    // ROOMS
    const roomsWrap = document.getElementById("rooms");
    roomsWrap.innerHTML = "";

    const roomsSnap = await getDocs(collection(db, "kost", kostId, "rooms"));

    roomsSnap.forEach(docu => {
      const r = docu.data();
      roomsWrap.innerHTML += `
        <div class="room-card">
          <img src="${r.images?.[0] || ""}">
          <h4>${r.nama}</h4>
          <p>Rp ${r.hargaBulanan.toLocaleString()}</p>
          <p>Tersedia: ${r.tersedia}</p>
        </div>
      `;
    });

  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan saat memuat data kost");
  }
}

loadKost();
