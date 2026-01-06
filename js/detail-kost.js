// ===== HELPER GLOBAL =====
function rupiah(nominal) {
  if (nominal === null || nominal === undefined) return "-";
  return "Rp. " + nominal.toLocaleString("id-ID");
}

// js/detail-kost.js
import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ambil ID
// ===== URL PARAMS (WAJIB DI ATAS) =====
const params = new URLSearchParams(window.location.search);
const kostId = params.get("id");
const duration = params.get("duration");
const checkin = params.get("checkin");

if (!kostId) {
  alert("ID kost tidak ditemukan");
  location.href = "/index.html";
  throw new Error("missing kostId");
}

if (!duration || !checkin) {
  alert("Durasi atau tanggal check-in tidak ditemukan. Silakan ulangi dari halaman awal.");
  location.href = "/index.html";
  throw new Error("missing duration/checkin");
}

if (!kostId) {
  alert("ID kost tidak ditemukan");
} else {
  
window.onerror = (msg, src, line, col) => {
  console.error("JS ERROR:", msg, "at", line + ":" + col);
};
  
  loadKost();
}
const kostNama = document.getElementById("kostNama");
const kostJenis = document.getElementById("kostJenis");
const kostAlamat = document.getElementById("kostAlamat");
const kostRating = document.getElementById("kostRating");
const mapLink = document.getElementById("mapLink");
const kostLandmark = document.getElementById("kostLandmark");

const fasilitasUmum = document.getElementById("fasilitasUmum");
const kebijakan = document.getElementById("kebijakan");

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

// ===== JENIS KOST =====
let jenis = "";
if (kost.jenisKost === "Pria") jenis = "Kost Pria";
else if (kost.jenisKost === "Wanita") jenis = "Kost Wanita";
else if (kost.jenisKost === "Campur") jenis = "Kost Campur";

// ===== STATUS SUAMI ISTRI (TEGAS) =====
let statusSI = "";
if (kost.bolehSuamiIstri === true) {
  statusSI = "Bisa Suami Istri";
} else if (kost.bolehSuamiIstri === false) {
  statusSI = "Tidak Bisa Suami Istri";
}

// ===== GABUNGKAN =====
let teks = jenis;
if (jenis && statusSI) teks += " · " + statusSI;
else if (statusSI) teks = statusSI;

kostJenis.textContent = teks;
    
    kostAlamat.textContent = kost.alamat;
    kostRating.textContent =
      `⭐⭐⭐⭐⭐ ${kost.rating} (${kost.reviewCount} Google reviews)`;

    if (kost.location) {
      mapLink.href =
        `https://www.google.com/maps?q=${kost.location.lat},${kost.location.lng}`;
    }
document.getElementById("deskripsi").innerHTML =
  (kost.deskripsi || "").replace(/\n/g, "<br><br>");

const toggle = document.getElementById("toggleDeskripsi");
const d = document.getElementById("deskripsi");

toggle.onclick = () => {
  d.style.display = d.style.display === "none" ? "block" : "none";
};

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

if (Array.isArray(kost.fasilitasUmum)) {
  kost.fasilitasUmum.forEach(f => {
    const li = document.createElement("li");
    li.textContent = f;
    fasilitasUmum.appendChild(li);
  });
}


    kebijakan.innerHTML = "";

if (Array.isArray(kost.kebijakan)) {
  kost.kebijakan.forEach(k => {
    const li = document.createElement("li");
    li.textContent = k;
    kebijakan.appendChild(li);
  });
}
// TOGGLE KEBIJAKAN
const toggleKebijakan = document.getElementById("toggleKebijakan");
const toggleKebijakanIcon = document.getElementById("toggleKebijakanIcon");

if (toggleKebijakan && toggleKebijakanIcon) {
  toggleKebijakan.onclick = () => {
    const show = kebijakan.style.display === "none";
    kebijakan.style.display = show ? "block" : "none";
    toggleKebijakanIcon.textContent = show ? "▲" : "▼";
  };
}



    // ===== ROOMS =====
    roomList.innerHTML = "";
    const roomSnap = await getDocs(
      collection(db, "kost", kostId, "rooms")
    );

    roomSnap.forEach(r => {
  const room = r.data();

  const card = document.createElement("div");
  card.className = "room-card";
      
// JUDUL KAMAR (DI ATAS GAMBAR)
const title = document.createElement("h3");
title.className = "room-title";
title.textContent = room.nama;

  /* HERO FOTO KAMAR (SWIPE) */
  const hero = document.createElement("div");
  hero.className = "room-hero";

  const track = document.createElement("div");
  track.className = "room-hero-track";

  (room.images || []).forEach(src => {
    const slide = document.createElement("div");
    slide.className = "room-hero-slide";

    const img = document.createElement("img");
    img.src = src;
    img.alt = room.nama;

    // zoom pakai modal yg sudah ada
    img.onclick = () => {
      modalImage.src = src;
      imageModal.style.display = "flex";
      document.body.style.overflow = "hidden";
    };

    slide.appendChild(img);
    track.appendChild(slide);
  });

  hero.appendChild(track);

  /* INFO KAMAR */
  const info = document.createElement("div");
  info.className = "room-info";

  const fasilitasInline = Array.isArray(room.fasilitas)
    ? room.fasilitas.join(" · ")
    : "";
const ukuranKamar = room.ukuranKamar || "-";
// ===== HARGA (MULTI PERIODE) =====
const hargaHarian   = room.hargaHarian ?? null;
const hargaMingguan = room.hargaMingguan ?? null;
const hargaBulanan  = room.hargaBulanan ?? null;
  
    info.innerHTML = `

  <div class="room-fasilitas">
    ${fasilitasInline}
  </div>

  <div class="room-ukuran">
    Ukuran Kamar : ${room.ukuranKamar || "-"}
  </div>

  <div class="room-harga-list">
    ${hargaHarian   !== null ? `<div>Harian : ${rupiah(hargaHarian)}</div>` : ""}
    ${hargaMingguan !== null ? `<div>Mingguan : ${rupiah(hargaMingguan)}</div>` : ""}
    ${hargaBulanan  !== null ? `<div>Bulanan : ${rupiah(hargaBulanan)}</div>` : ""}
  </div>

  <div class="room-tersedia">
    Sisa Kamar : ${room.tersedia ?? 0}
  </div>

  <button class="btn-book full">Pilih Kamar Ini</button>
`;

  card.appendChild(title);
card.appendChild(hero);
card.appendChild(info);   // ⬅️ WAJIB sebelum query button

const btnBook = card.querySelector(".btn-book");

if (btnBook) {
  btnBook.addEventListener("click", () => {
   window.location.href =
  `/booking/pemesanan.html` +
  `?kostId=${kostId}` +
  `&roomId=${r.id}` +
  `&durasi=${duration}` +
  `&checkin=${checkin}`;

  });
}


roomList.appendChild(card);
});


  } catch (err) {
    console.error("DETAIL KOST ERROR:", err);
    alert("Terjadi kesalahan saat memuat data kost");
  }
}


// ===== MENU (TIDAK DIUBAH) =====
const menuBtn = document.querySelector(".menu-btn");
const menu = document.getElementById("menu");

window.openMenu = () => menu.style.display = "block";
window.closeMenu = e => {
  if (e.target === menu) menu.style.display = "none";
};

menuBtn?.addEventListener("click", window.openMenu);


