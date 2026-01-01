// js/detail-kost.js
import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ambil ID dari URL
const params = new URLSearchParams(window.location.search);
const kostId = params.get("id");

if (!kostId) {
  alert("ID kost tidak ditemukan");
  throw new Error("ID kosong");
}

async function loadKost() {
  try {
    // ===== KOST =====
    const kostRef = doc(db, "kost", kostId);
    const kostSnap = await getDoc(kostRef);

    if (!kostSnap.exists()) {
      alert("Data kost tidak ditemukan");
      return;
    }

    const kost = kostSnap.data();

    // === TITLE ===
    document.getElementById("kostNama").textContent = kost.nama;
    document.getElementById("kostAlamat").textContent = kost.alamat;
    document.getElementById("kostRating").textContent =
      `⭐ ${kost.rating} (${kost.reviewCount} reviews)`;

    // === MAP ===
    if (kost.location) {
      const mapUrl = `https://www.google.com/maps?q=${kost.location.lat},${kost.location.lng}`;
      document.getElementById("mapLink").href = mapUrl;
    }

   // === HERO IMAGES (AMAN) ===
const hero = document.getElementById("heroSlider");
const heroTrack = document.getElementById("heroTrack");

if (hero && heroTrack && Array.isArray(kost.heroImages)) {
  heroTrack.innerHTML = "";
  let currentSlide = 0;

  kost.heroImages.forEach(img => {
    const slide = document.createElement("div");
    slide.className = "hero-slide";
    slide.innerHTML = `
      <img src="${img}" alt="${kost.nama}">
      <div class="hero-caption">Tampak Depan</div>
    `;
    heroTrack.appendChild(slide);
  });

 let startX = 0;
let isPointerDown = false;

heroTrack.style.touchAction = "pan-y"; // biar scroll vertikal tetap jalan

heroTrack.addEventListener("pointerdown", e => {
  startX = e.clientX;
  isPointerDown = true;
  heroTrack.setPointerCapture(e.pointerId);
});

heroTrack.addEventListener("pointerup", e => {
  if (!isPointerDown) return;

  const diff = startX - e.clientX;

  if (diff > 60 && currentSlide < kost.heroImages.length - 1) {
    currentSlide++;
  } else if (diff < -60 && currentSlide > 0) {
    currentSlide--;
  }

  heroTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
  isPointerDown = false;
});
}

    // === FASILITAS UMUM ===
    const fasilitas = document.getElementById("fasilitasUmum");
    fasilitas.innerHTML = "";
    kost.fasilitasUmum.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f;
      fasilitas.appendChild(li);
    });

    // === KEBIJAKAN ===
    const kebijakan = document.getElementById("kebijakan");
    kebijakan.innerHTML = "";
    kost.kebijakan.forEach(k => {
      const li = document.createElement("li");
      li.textContent = k;
      kebijakan.appendChild(li);
    });

    // === WHATSAPP ===
    document.getElementById("waLink").href =
      `https://wa.me/${kost.kontak.wa}`;

    // ===== ROOMS =====
    const roomList = document.getElementById("roomList");
    roomList.innerHTML = "";

    const roomRef = collection(db, "kost", kostId, "rooms");
    const roomSnap = await getDocs(roomRef);

    roomSnap.forEach(docSnap => {
      const room = docSnap.data();

      const card = document.createElement("div");
      card.className = "room-card";

      const img = document.createElement("img");
      img.src = room.images[0];
      img.alt = room.nama;

      const info = document.createElement("div");
      info.className = "room-info";

      info.innerHTML = `
        <h3>${room.nama}</h3>
        <p>Rp ${room.hargaBulanan.toLocaleString("id-ID")} / bulan</p>
        <p>Tersedia: ${room.tersedia}</p>
      `;

      card.appendChild(img);
      card.appendChild(info);
      roomList.appendChild(card);
    });

  } catch (err) {
    console.error("DETAIL KOST ERROR:", err);
    alert("Terjadi kesalahan saat memuat data kost");
  }
}

loadKost();

// === MENU ===
const menuBtn = document.querySelector(".menu-btn");
const menu = document.getElementById("menu");

window.openMenu = function () {
  menu.style.display = "block";
};

window.closeMenu = function (e) {
  if (e.target === menu) {
    menu.style.display = "none";
  }
};

if (menuBtn && menu) {
  menuBtn.addEventListener("click", window.openMenu);
}
