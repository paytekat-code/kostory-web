console.log("DETAIL-KOST.JS JALAN");
import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* =================================================
   UTIL
================================================= */
function qs(id) {
  return document.getElementById(id);
}

/* =================================================
   AMBIL ID DARI URL
================================================= */
const params = new URLSearchParams(window.location.search);
const kostId = params.get("id");

if (!kostId) {
  alert("ID kost tidak ditemukan di URL");
}

/* =================================================
   LOAD DETAIL KOST
================================================= */
async function loadKost() {
  const ref = doc(db, "kost", kostId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    alert("Data kost tidak ditemukan");
    return;
  }

  const data = snap.data();

  /* ===== BASIC INFO ===== */
  qs("kostNama").textContent = data.nama || "-";
  qs("kostRating").textContent = data.rating ?? "-";
  qs("kostReview").textContent = data.reviewCount ?? 0;

  qs("kostAlamat").textContent = data.alamat
    ? `${data.alamat}, ${data.kota}`
    : data.kota || "-";

  /* ===== BADGE ===== */
  qs("badgeJenisKost").textContent = data.jenisKost
    ? `Kost ${data.jenisKost}`
    : "Kost";

  qs("badgeDurasi").textContent = Array.isArray(data.durasiTersedia)
    ? `Durasi: ${data.durasiTersedia.join(", ")}`
    : "Durasi: -";

  qs("badgePasutri").textContent =
    data.bolehSuamiIstri === true
      ? "Boleh Suami Istri"
      : "Tidak menerima Suami Istri";

  /* ===== MAPS ===== */
  if (data.location?.lat && data.location?.lng) {
    qs("btnMaps").href =
      `https://www.google.com/maps?q=${data.location.lat},${data.location.lng}`;
  }

  /* ===== WHATSAPP ===== */
  if (data.kontak?.wa) {
    const text = encodeURIComponent(
      `Halo, saya tertarik dengan ${data.nama}`
    );
    qs("btnWa").href =
      `https://wa.me/${data.kontak.wa}?text=${text}`;
  }

  /* ===== FASILITAS UMUM ===== */
  qs("fasilitasUmum").textContent = Array.isArray(data.fasilitasUmum)
    ? data.fasilitasUmum.join(" • ")
    : "-";

  /* ===== KEBIJAKAN ===== */
  const kebijakanList = qs("kebijakanList");
  kebijakanList.innerHTML = "";

  if (Array.isArray(data.kebijakan)) {
    data.kebijakan.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      kebijakanList.appendChild(li);
    });
  }

  /* ===== HERO SLIDER ===== */
  const heroSlider = qs("heroSlider");
  heroSlider.innerHTML = "";

  if (Array.isArray(data.heroImages)) {
    data.heroImages.forEach((src, index) => {
      const img = document.createElement("img");
      img.src = src;
      if (index === 0) img.classList.add("active");
      heroSlider.appendChild(img);
    });
  }

  // caption (WAJIB, CSS kamu pakai ini)
  const caption = document.createElement("div");
  caption.className = "hero-caption";
  caption.textContent = data.nama || "";
  heroSlider.appendChild(caption);
}

/* =================================================
   LOAD ROOMS
================================================= */
async function loadRooms() {
  const ref = collection(db, "kost", kostId, "rooms");
  const snap = await getDocs(ref);

  const container = qs("roomList");
  container.innerHTML = "";

  if (snap.empty) {
    container.innerHTML = "<p>Tidak ada tipe kamar tersedia.</p>";
    return;
  }

  snap.forEach(roomSnap => {
    const room = roomSnap.data();
    if (room.aktif === false) return;

    const card = document.createElement("div");
    card.className = "kost-card";

    /* ===== ROOM HTML ===== */
    card.innerHTML = `
      <div class="room-slider"></div>

      <h4>${room.nama || "-"}</h4>

      <p>
        ${Array.isArray(room.fasilitas)
          ? room.fasilitas.join(" • ")
          : "-"}
      </p>

      <p style="font-size:13px;color:#666">
        Kamar tersedia:
        <strong>${room.tersedia ?? 0}</strong>
      </p>

      <p>
        <strong>
          Rp ${Number(room.hargaBulanan || 0).toLocaleString("id-ID")}
        </strong> / bulan
      </p>

      <a href="#" style="color:#ff8a00;font-weight:600">
        Pilih Tipe Ini →
      </a>
    `;

    /* ===== ROOM SLIDER ===== */
    const slider = card.querySelector(".room-slider");

    if (Array.isArray(room.images)) {
      room.images.forEach((src, index) => {
        const img = document.createElement("img");
        img.src = src;
        if (index === 0) img.classList.add("active");
        slider.appendChild(img);
      });
    }

    const roomCaption = document.createElement("div");
    roomCaption.className = "room-caption";
    roomCaption.textContent = room.nama || "";
    slider.appendChild(roomCaption);

    container.appendChild(card);
  });
}

/* =================================================
   INIT
================================================= */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadKost();
    await loadRooms();
  } catch (err) {
    console.error("ERROR DETAIL KOST:", err);
    alert("Terjadi kesalahan saat memuat data kost");
  }
});
