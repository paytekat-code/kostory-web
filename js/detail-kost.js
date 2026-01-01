import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

console.log("DETAIL-KOST.JS JALAN");

// =======================
// HELPER AMAN (ANTI NULL)
// =======================
function $(id) {
  return document.getElementById(id);
}

// =======================
// AMBIL ID DARI URL
// =======================
const params = new URLSearchParams(window.location.search);
const kostId = params.get("id");

if (!kostId) {
  alert("ID kost tidak ditemukan");
  throw new Error("ID kost kosong");
}

// =======================
// LOAD DATA KOST
// =======================
async function loadKost() {
  try {
    // ===== AMBIL DATA KOST =====
    const kostRef = doc(db, "kost", kostId);
    const kostSnap = await getDoc(kostRef);

    if (!kostSnap.exists()) {
      alert("Data kost tidak ditemukan");
      return;
    }

    const kost = kostSnap.data();

    // ===== HERO IMAGES =====
    if ($("heroSlider") && Array.isArray(kost.heroImages)) {
      $("heroSlider").innerHTML = "";
      kost.heroImages.forEach(src => {
        const img = document.createElement("img");
        img.src = src;
        img.alt = kost.nama || "Kost";
        $("heroSlider").appendChild(img);
      });
    }

    // ===== INFO UTAMA =====
    if ($("kostNama")) $("kostNama").textContent = kost.nama || "-";
    if ($("kostRating")) $("kostRating").textContent = kost.rating || "-";
    if ($("kostReview")) $("kostReview").textContent = kost.reviewCount || "0";
    if ($("kostAlamat")) $("kostAlamat").textContent = kost.alamat || "-";

    // ===== GOOGLE MAPS =====
    if ($("mapsLink") && kost.location?.lat && kost.location?.lng) {
      $("mapsLink").href =
        `https://www.google.com/maps?q=${kost.location.lat},${kost.location.lng}`;
    }

    // ===== FASILITAS UMUM =====
    if ($("fasilitasUmum")) {
      $("fasilitasUmum").innerHTML = "";
      (kost.fasilitasUmum || []).forEach(item => {
        $("fasilitasUmum").innerHTML += `<li>${item}</li>`;
      });
    }

    // ===== KEBIJAKAN =====
    if ($("kebijakanKost")) {
      $("kebijakanKost").innerHTML = "";
      (kost.kebijakan || []).forEach(item => {
        $("kebijakanKost").innerHTML += `<li>${item}</li>`;
      });
    }

    // ===== KONTAK WA =====
    if ($("waPengurus") && kost.kontak?.wa) {
      $("waPengurus").href = `https://wa.me/${kost.kontak.wa}`;
    }

    // =======================
    // LOAD ROOMS
    // =======================
    if ($("roomList")) {
      $("roomList").innerHTML = "";

      const roomsRef = collection(db, "kost", kostId, "rooms");
      const roomsSnap = await getDocs(roomsRef);

      roomsSnap.forEach(docu => {
        const r = docu.data();

        $("roomList").innerHTML += `
          <div class="room-card">
            <img src="${r.images?.[0] || ""}" alt="${r.nama}">
            <h4>${r.nama}</h4>
            <p class="price">Rp ${Number(r.hargaBulanan).toLocaleString("id-ID")}/bulan</p>
            <p class="available">Tersedia: ${r.tersedia}</p>
          </div>
        `;
      });
    }

  } catch (err) {
    console.error("DETAIL KOST ERROR:", err);
    alert("Terjadi kesalahan saat memuat data kost");
  }
}

// =======================
// EKSEKUSI
// =======================
loadKost();
