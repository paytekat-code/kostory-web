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

  // === HERO IMAGES (SWIPE HALUS + AMAN, TIDAK BIKIN SCRIPT MATI) ===
  const hero = document.getElementById("heroSlider");
  const heroTrack = document.getElementById("heroTrack");

  if (hero && heroTrack && kost.heroImages && Array.isArray(kost.heroImages) && kost.heroImages.length > 0) {
    heroTrack.innerHTML = "";
    let currentSlide = 0;

    // Buat slide-slide
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

    // Tambah transition halus
    heroTrack.style.transition = "transform 0.3s ease";

    let startX = 0;
    let isDragging = false;

    const updateSlide = () => {
      heroTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    };

    // Touch/Mouse start
    heroTrack.addEventListener("pointerdown", e => {
      startX = e.clientX || e.touches[0].clientX;
      isDragging = true;
      heroTrack.style.transition = "none";
    });

    // Touch/Mouse move
    heroTrack.addEventListener("pointermove", e => {
      if (!isDragging) return;
      e.preventDefault(); // biar tidak scroll halaman saat swipe
      const currentX = e.clientX || (e.touches && e.touches[0].clientX);
      if (currentX === undefined) return;
      const diff = startX - currentX;
      heroTrack.style.transform = `translateX(calc(-${currentSlide * 100}% - ${diff}px))`;
    });

    // Touch/Mouse end
    const endDrag = (e) => {
      if (!isDragging) return;
      isDragging = false;
      heroTrack.style.transition = "transform 0.3s ease";

      let endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const diff = startX - endX;

      if (Math.abs(diff) > 50) {
        if (diff > 0 && currentSlide < kost.heroImages.length - 1) {
          currentSlide++;
        } else if (diff < 0 && currentSlide > 0) {
          currentSlide--;
        }
      }
      updateSlide();
    };

    heroTrack.addEventListener("pointerup", endDrag);
    heroTrack.addEventListener("pointercancel", endDrag);
    heroTrack.addEventListener("touchend", endDrag); // extra safety untuk touch

    // Initial
    updateSlide();

    // === DOT INDIKATOR (opsional, tapi bagus) ===
    if (kost.heroImages.length > 1) {
      const dots = document.createElement("div");
      dots.style.cssText = "position:absolute;bottom:12px;left:50%;transform:translateX(-50%);display:flex;gap:8px;z-index:3;";
      
      kost.heroImages.forEach((_, i) => {
        const dot = document.createElement("div");
        dot.style.cssText = `width:8px;height:8px;border-radius:50%;background:${i===0?'#fff':'rgba(255,255,255,0.5)'};transition:background 0.3s;`;
        dots.appendChild(dot);
      });
      
      hero.appendChild(dots);

      // Update dots saat slide berubah
      const updateDots = () => {
        dots.querySelectorAll("div").forEach((dot, i) => {
          dot.style.background = i === currentSlide ? "#fff" : "rgba(255,255,255,0.5)";
        });
      };

      // Override updateSlide supaya dots ikut update
      const originalUpdate = updateSlide;
      updateSlide = () => {
        originalUpdate();
        updateDots();
      };
      updateDots(); // pertama kali
    }
  }
  // === AKHIR HERO IMAGES ===
    
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
