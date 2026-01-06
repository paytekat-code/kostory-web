// js/app.js
import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/**
 * Ambil data kost dari Firestore
 * (sementara hardcoded Palembang)
 */
async function loadKost() {
  const resultContainer = document.querySelector(".result");
  if (!resultContainer) return;

  resultContainer.innerHTML = "";

  try {
    const q = query(
      collection(db, "kost"),
      where("kota", "==", "Palembang")
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      resultContainer.innerHTML = "<p>Tidak ada kost tersedia.</p>";
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();

      const card = document.createElement("div");
      card.className = "kost-card";

      card.innerHTML = `
        <h4>${data.nama}</h4>
        <p>📍 ${data.kota} • ${data.tipe}</p>
        <a href="https://booking.kostory.id">Lihat & Booking →</a>
      `;

      resultContainer.appendChild(card);
    });

  } catch (err) {
    console.error("Firestore error:", err);
  }
}
async function loadKostorianExperience() {
  const slider = document.getElementById("experienceSlider");
  if (!slider) return;

  slider.innerHTML = "";

  try {
    const q = query(
      collection(db, "kostorian_experience"),
      where("active", "==", true),
      orderBy("order", "asc")
    );

    const snapshot = await getDocs(q);

    snapshot.forEach(doc => {
      const data = doc.data();

      const item = document.createElement("div");
      item.className = "exp-item";

      item.innerHTML = `
        <img src="${data.photoUrl}" alt="${data.nama}">
        <div class="exp-text">
          <strong>${data.nama}</strong><br>
          <small>${data.role}</small>
          <p>"${data.quote}"</p>
        </div>
      `;

      slider.appendChild(item);
    });

  } catch (err) {
    console.error("Experience error:", err);
  }
}

/**
 * Hook tombol "Cari Kamar"
 * TANPA mengubah HTML
 */
function bindSearchButton() {
  const btn = document.querySelector(".search-card button");
  if (!btn) return;

  btn.addEventListener("click", () => {
  const citySelect =
    document.querySelector(".search-card select");
  const durationSelect =
    document.querySelectorAll(".search-card select")[1];
  const checkinInput =
    document.querySelector(".search-card input[type='date']");

  const city = citySelect?.value || "";
  const duration = durationSelect?.value || "";
  const checkin = checkinInput?.value || "";

  if (!city || !duration || !checkin) {
    alert("Lengkapi pencarian terlebih dahulu");
    return;
  }

  window.location.href =
    `/list-kost.html?city=${encodeURIComponent(city)}&duration=${encodeURIComponent(duration)}&checkin=${checkin}`;
});

}

// Init saat halaman siap
document.addEventListener("DOMContentLoaded", () => {
  bindSearchButton();
  loadKostorianExperience();
});

