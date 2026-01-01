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

// === HERO IMAGES (DENGAN SWIPE HALUS) ===
const hero = document.getElementById("heroSlider");
const heroTrack = document.getElementById("heroTrack");

if (hero && heroTrack && Array.isArray(kost.heroImages) && kost.heroImages.length > 0) {
  heroTrack.innerHTML = "";
  let currentSlide = 0;

  kost.heroImages.forEach((img, index) => {
    const slide = document.createElement("div");
    slide.className = "hero-slide";
    slide.innerHTML = `
      <img src="${img}" alt="${kost.nama} - Gambar ${index + 1}">
      <div class="hero-caption">
        ${index === 0 ? 'Tampak Depan' : 'Interior / Fasilitas'}
      </div>
    `;
    heroTrack.appendChild(slide);
  });

  // Aktifkan transition halus
  heroTrack.style.transition = "transform 0.3s ease";

  let startX = 0;
  let isDragging = false;

  const updateSlide = () => {
    heroTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    updateDots(); // kalau ada dots
  };

  // Drag start
  heroTrack.addEventListener("pointerdown", e => {
    startX = e.clientX;
    isDragging = true;
    heroTrack.style.transition = "none"; // Matikan animasi saat drag
  });

  // Drag move (real-time)
  heroTrack.addEventListener("pointermove", e => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const diff = startX - currentX;
    heroTrack.style.transform = `translateX(calc(-${currentSlide * 100}% - ${diff}px))`;
  });

  // Drag end
  heroTrack.addEventListener("pointerup", e => {
    if (!isDragging) return;
    isDragging = false;
    heroTrack.style.transition = "transform 0.3s ease";

    const endX = e.clientX;
    const diff = startX - endX;

    // Geser cukup jauh (>50px) baru ganti slide
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentSlide < kost.heroImages.length - 1) {
        currentSlide++;
      } else if (diff < 0 && currentSlide > 0) {
        currentSlide--;
      }
    }
    updateSlide();
  });

  heroTrack.addEventListener("pointercancel", () => {
    isDragging = false;
    heroTrack.style.transition = "transform 0.3s ease";
    updateSlide();
  });

  // === INDIKATOR DOT (opsional tapi recommended) ===
  if (kost.heroImages.length > 1) {
    const dotsContainer = document.createElement("div");
    dotsContainer.style.cssText = `
      position: absolute;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      z-index: 3;
    `;

    kost.heroImages.forEach((_, index) => {
      const dot = document.createElement("div");
      dot.style.cssText = `
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${index === 0 ? '#fff' : 'rgba(255,255,255,0.5)'};
        transition: background 0.3s;
      `;
      dotsContainer.appendChild(dot);
    });

    hero.appendChild(dotsContainer);

    window.updateDots = () => {
      dotsContainer.querySelectorAll("div").forEach((dot, i) => {
        dot.style.background = i === currentSlide ? "#fff" : "rgba(255,255,255,0.5)";
      });
    };
    updateDots();
  }

  // Initial position
  updateSlide();
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
