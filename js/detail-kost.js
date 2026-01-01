import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

console.log("detail-kost.js loaded");

// ambil ID kost dari URL
const params = new URLSearchParams(window.location.search);
const kostId = params.get("id");

if (!kostId) {
  alert("ID kost tidak ditemukan");
}

// =======================
// LOAD DATA KOST
// =======================
async function loadKost() {
  const ref = doc(db, "kost", kostId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    alert("Data kost tidak ditemukan");
    return;
  }

  const data = snap.data();
  console.log("DATA KOST:", data);

  // BASIC INFO
  document.getElementById("kostNama").textContent = data.nama || "-";
  document.getElementById("kostRating").textContent = data.rating ?? "-";
  document.getElementById("kostReview").textContent = data.reviewCount ?? 0;
  document.getElementById("kostAlamat").textContent =
    data.alamat ? `${data.alamat}, ${data.kota}` : data.kota;

  // BADGES
  document.getElementById("badgeJenisKost").textContent =
    `Kost ${data.jenisKost || "-"}`;

  document.getElementById("badgeDurasi").textContent =
    Array.isArray(data.durasiTersedia)
      ? `Durasi: ${data.durasiTersedia.join(", ")}`
      : "Durasi: -";

  document.getElementById("badgePasutri").textContent =
    data.bolehSuamiIstri ? "Boleh Suami Istri" : "Tidak menerima Suami Istri";

  // MAPS
  if (data.location?.lat && data.location?.lng) {
    document.getElementById("btnMaps").href =
      `https://www.google.com/maps?q=${data.location.lat},${data.location.lng}`;
  }

  // WA
  if (data.kontak?.wa) {
    const text = encodeURIComponent(
      `Halo, saya tertarik dengan ${data.nama}`
    );
    document.getElementById("btnWa").href =
      `https://wa.me/${data.kontak.wa}?text=${text}`;
  }

  // FASILITAS
  document.getElementById("fasilitasUmum").textContent =
    Array.isArray(data.fasilitasUmum)
      ? data.fasilitasUmum.join(" • ")
      : "-";

  // KEBIJAKAN
  const kebijakanList = document.getElementById("kebijakanList");
  kebijakanList.innerHTML = "";
  (data.kebijakan || []).forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    kebijakanList.appendChild(li);
  });

  // HERO SLIDER (FIX TOTAL)
  const heroSlider = document.getElementById("heroSlider");
  heroSlider.innerHTML = "";

  (data.heroImages || []).forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    if (i === 0) img.classList.add("active");
    heroSlider.appendChild(img);
  });
}

// =======================
// LOAD ROOMS
// =======================
async function loadRooms() {
  const ref = collection(db, "kost", kostId, "rooms");
  const snap = await getDocs(ref);

  const container = document.getElementById("roomList");
  container.innerHTML = "";

  snap.forEach(docSnap => {
    const room = docSnap.data();
    if (!room.aktif) return;

    const card = document.createElement("div");
    card.className = "kost-card";

    card.innerHTML = `
      <h4>${room.nama}</h4>
      <p>${(room.fasilitas || []).join(" • ")}</p>
      <p style="font-size:13px;color:#666">
        Kamar tersedia: <strong>${room.tersedia ?? 0}</strong>
      </p>
      <p>
        <strong>Rp ${room.hargaBulanan.toLocaleString("id-ID")}</strong> / bulan
      </p>
      <a href="#" style="color:#ff8a00;font-weight:600">
        Pilih Tipe Ini →
      </a>
    `;

    container.appendChild(card);
  });
}

// =======================
// INIT
// =======================
document.addEventListener("DOMContentLoaded", async () => {
  await loadKost();
  await loadRooms();
});
