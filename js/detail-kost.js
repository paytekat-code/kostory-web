// js/detail-kost.js
import { db } from "/js/firebase.js";
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
  return;
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

// ===========================
// HERO SLIDER + DOT INDICATOR
// ===========================
const heroTrack = document.getElementById("heroTrack");
const heroDots = document.getElementById("heroDots");

const images =
  Array.isArray(kost.heroImages) && kost.heroImages.length
    ? kost.heroImages
    : ["/img/placeholder-hero.jpg"];

heroTrack.innerHTML = "";
heroDots.innerHTML = "";

images.forEach((img, index) => {
  const slide = document.createElement("div");
  slide.className = "hero-slide";

  const image = document.createElement("img");
  image.src = img;
  image.alt = kost.nama;

  // ⬇️ INI KUNCI UTAMA (IKUT CSS GLOBAL)
  if (index === 0) {
    image.classList.add("active");
  }

  slide.appendChild(image);
  heroTrack.appendChild(slide);

  const dot = document.createElement("div");
  dot.className = "hero-dot";
  if (index === 0) dot.classList.add("active");

  dot.addEventListener("click", () => {
    heroTrack.scrollTo({
      left: index * heroTrack.clientWidth,
      behavior: "smooth"
    });
  });

  heroDots.appendChild(dot);
});

// sync dot saat scroll
heroTrack.addEventListener("scroll", () => {
  const slideWidth = heroTrack.querySelector(".hero-slide")?.offsetWidth;
if (!slideWidth) return;

const index = Math.round(heroTrack.scrollLeft / slideWidth);


  // sync dot
  [...heroDots.children].forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });

  // sync image (WAJIB, IKUT CSS GLOBAL)
  [...heroTrack.querySelectorAll("img")].forEach((img, i) => {
    img.classList.toggle("active", i === index);
  });
});

    // ===========================
// HERO IMAGE ZOOM (FINAL, HP AMAN)
// ===========================
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImage");

if (modal && modalImg) {

  // TAP GAMBAR (KHUSUS IMG, BUKAN DOCUMENT)
  let startX = 0;
let startY = 0;
let moved = false;

heroTrack.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  startX = touch.clientX;
  startY = touch.clientY;
  moved = false;
}, { passive: true });

heroTrack.addEventListener("touchmove", (e) => {
  const touch = e.touches[0];
  const dx = Math.abs(touch.clientX - startX);
  const dy = Math.abs(touch.clientY - startY);

  if (dx > 12 || dy > 12) {
    moved = true; // 👉 dianggap swipe
  }
}, { passive: true });

heroTrack.addEventListener("touchend", (e) => {
  if (moved) return; // ❌ swipe → JANGAN zoom

  const img = e.target.closest(".hero-slide img");
  if (!img) return;

  modalImg.src = img.src;
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
});

  // DESKTOP / MOUSE
  heroTrack.addEventListener("click", (e) => {
    const img = e.target.closest(".hero-slide img");
    if (!img) return;

    modalImg.src = img.src;
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  });

  // TUTUP MODAL
  modal.addEventListener("click", () => {
    modal.style.display = "none";
    modalImg.src = "";
    document.body.style.overflow = "";
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
