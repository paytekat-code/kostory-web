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

// ===========================
// HERO SLIDER + DOT INDICATOR
// ===========================
const heroTrack = document.getElementById("heroTrack");
const heroDots = document.getElementById("heroDots");

if (heroTrack && heroDots && Array.isArray(kost.heroImages)) {
  heroTrack.innerHTML = "";
  heroDots.innerHTML = "";

  const slideCount = kost.heroImages.length;

  kost.heroImages.forEach((img, index) => {
    // slide
    const slide = document.createElement("div");
    slide.className = "hero-slide";
    slide.innerHTML = `<img src="${img}" alt="${kost.nama}">`;
    heroTrack.appendChild(slide);

    // dot
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
    const index = Math.round(
      heroTrack.scrollLeft / heroTrack.clientWidth
    );

    [...heroDots.children].forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });
  });
}
    // ===========================
// HERO IMAGE ZOOM (FULLSCREEN)
// ===========================
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImage");

if (modal && modalImg) {
  // delegate click ke semua gambar hero
  document.addEventListener("click", (e) => {
    const img = e.target.closest(".hero-slide img");
    if (!img) return;

    modalImg.src = img.src;
    modal.style.display = "flex";
    document.body.style.overflow = "hidden"; // lock scroll
  });

  // tutup modal saat tap/click
  modal.addEventListener("click", () => {
    modal.style.display = "none";
    modalImg.src = "";
    document.body.style.overflow = ""; // unlock scroll
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
