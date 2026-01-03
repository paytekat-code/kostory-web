// js/detail-kost.js
import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ambil ID
const params = new URLSearchParams(window.location.search);
const kostId = params.get("id");
if (!kostId) {
  alert("ID kost tidak ditemukan");
} else {
  loadKost();
}
const kostNama = document.getElementById("kostNama");
const kostAlamat = document.getElementById("kostAlamat");
const kostRating = document.getElementById("kostRating");
const mapLink = document.getElementById("mapLink");

const fasilitasUmum = document.getElementById("fasilitasUmum");
const kebijakan = document.getElementById("kebijakan");
const waLink = document.getElementById("waLink");
const roomList = document.getElementById("roomList");

const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");


async function loadKost() {
  try {
    const kostRef = doc(db, "kost", kostId);
    const kostSnap = await getDoc(kostRef);
    if (!kostSnap.exists()) {
      alert("Data kost tidak ditemukan");
      return;
    }

    const kost = kostSnap.data();

    // ===== BASIC INFO =====
    kostNama.textContent = kost.nama;
    kostAlamat.textContent = kost.alamat;
    kostRating.textContent =
      `⭐ ${kost.rating} (${kost.reviewCount} reviews)`;

    if (kost.location) {
      mapLink.href =
        `https://www.google.com/maps?q=${kost.location.lat},${kost.location.lng}`;
    }
document.getElementById("deskripsi").innerHTML =
  (kost.deskripsi || "").replace(/\n/g, "<br><br>");


    // =========================
    // DETAIL HERO (BERSIH)
    // =========================
    const track = document.getElementById("detailHeroTrack");
    const dotsWrap = document.getElementById("detailHeroDots");

    track.innerHTML = "";
    dotsWrap.innerHTML = "";

    const images = Array.isArray(kost.heroImages) && kost.heroImages.length
      ? kost.heroImages
      : ["/img/placeholder-hero.jpg"];

    images.forEach((src, index) => {
      const slide = document.createElement("div");
      slide.className = "detail-hero-slide";

      const img = document.createElement("img");
      img.src = src;
      img.alt = kost.nama;

      slide.appendChild(img);
      track.appendChild(slide);

      const dot = document.createElement("div");
      dot.className = "detail-hero-dot";
      if (index === 0) dot.classList.add("active");

      dot.addEventListener("click", () => {
        track.scrollTo({
          left: index * track.clientWidth,
          behavior: "smooth"
        });
      });

      dotsWrap.appendChild(dot);
    });

    // sync dot
    track.addEventListener("scroll", () => {
      const width = track.querySelector(".detail-hero-slide")?.offsetWidth;
      if (!width) return;
      const index = Math.round(track.scrollLeft / width);

      [...dotsWrap.children].forEach((d, i) => {
        d.classList.toggle("active", i === index);
      });
    });

    // =========================
    // IMAGE ZOOM (TAP ≠ SWIPE)
    // =========================
    const modal = imageModal;
    const modalImg = modalImage;

    let sx = 0, sy = 0, moved = false;

    track.addEventListener("touchstart", e => {
      const t = e.touches[0];
      sx = t.clientX;
      sy = t.clientY;
      moved = false;
    }, { passive: true });

    track.addEventListener("touchmove", e => {
      const t = e.touches[0];
      if (Math.abs(t.clientX - sx) > 12 || Math.abs(t.clientY - sy) > 12) {
        moved = true;
      }
    }, { passive: true });

    track.addEventListener("touchend", e => {
      if (moved) return;
      const img = e.target.closest("img");
      if (!img) return;

      modalImg.src = img.src;
      modal.style.display = "flex";
      document.body.style.overflow = "hidden";
    });

    track.addEventListener("click", e => {
      const img = e.target.closest("img");
      if (!img) return;

      modalImg.src = img.src;
      modal.style.display = "flex";
      document.body.style.overflow = "hidden";
    });

    modal.addEventListener("click", () => {
      modal.style.display = "none";
      modalImg.src = "";
      document.body.style.overflow = "";
    });

    // ===== FASILITAS =====
    fasilitasUmum.innerHTML = "";
    kost.fasilitasUmum.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f;
      fasilitasUmum.appendChild(li);
    });

    kebijakan.innerHTML = "";
    kost.kebijakan.forEach(k => {
      const li = document.createElement("li");
      li.textContent = k;
      kebijakan.appendChild(li);
    });

    waLink.href = `https://wa.me/${kost.kontak.wa}`;

    // ===== ROOMS =====
    roomList.innerHTML = "";
    const roomSnap = await getDocs(
      collection(db, "kost", kostId, "rooms")
    );

    roomSnap.forEach(r => {
      const room = r.data();

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
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggleDeskripsi");
  const d = document.getElementById("deskripsi");

  if (!toggle || !d) return;

  toggle.onclick = () => {
    d.style.display = d.style.display === "none" ? "block" : "none";
  };
});


// ===== MENU (TIDAK DIUBAH) =====
const menuBtn = document.querySelector(".menu-btn");
const menu = document.getElementById("menu");

window.openMenu = () => menu.style.display = "block";
window.closeMenu = e => {
  if (e.target === menu) menu.style.display = "none";
};

menuBtn?.addEventListener("click", window.openMenu);
