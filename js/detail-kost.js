import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ambil id kost dari URL
const params = new URLSearchParams(window.location.search);
const kostId = params.get("id");

if (!kostId) {
  alert("Kost tidak ditemukan");
}

// load data kost
async function loadKost() {
  const ref = doc(db, "kost", kostId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    alert("Data kost tidak tersedia");
    return;
  }

  const data = snap.data();

  // info utama
  document.getElementById("kostNama").textContent = data.nama;
  document.getElementById("kostRating").textContent = data.rating ?? "-";
  document.getElementById("kostReview").textContent = data.reviewCount ?? 0;
  document.getElementById("kostAlamat").textContent =
    `${data.alamat}, ${data.kota}`;

  // badge kebijakan
  document.getElementById("badgeJenisKost").textContent =
    `Kost ${data.jenisKost}`;
  document.getElementById("badgeDurasi").textContent =
    `Durasi: ${data.durasiTersedia.join(", ")}`;
  document.getElementById("badgePasutri").textContent =
    data.bolehSuamiIstri ? "Boleh Suami Istri" : "Tidak menerima Suami Istri";

  // google maps
  document.getElementById("btnMaps").href =
    `https://www.google.com/maps?q=${data.location.lat},${data.location.lng}`;

  // whatsapp
  const waText = encodeURIComponent(
    `Halo, saya tertarik dengan ${data.nama}. Apakah masih tersedia?`
  );
  document.getElementById("btnWa").href =
    `https://wa.me/${data.kontak.wa}?text=${waText}`;

  // fasilitas umum
  document.getElementById("fasilitasUmum").textContent =
    data.fasilitasUmum.join(" • ");

  // kebijakan
  const kebijakanList = document.getElementById("kebijakanList");
  kebijakanList.innerHTML = "";
  (data.kebijakan || []).forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    kebijakanList.appendChild(li);
  });

  // hero slider
  const heroSlider = document.getElementById("heroSlider");
  data.heroImages.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    if (i === 0) img.classList.add("active");
    heroSlider.appendChild(img);
  });

  initHeroSlider();
}

// load kamar
async function loadRooms() {
  const ref = collection(db, "kost", kostId, "rooms");
  const snap = await getDocs(ref);

  const container = document.getElementById("roomList");
  container.innerHTML = "";

  snap.forEach(docSnap => {
    const room = docSnap.data();
    if (!room.aktif) return;

    const card = document.createElement("div");
    card.className = "kost-card";

    card.innerHTML = `
      <div class="room-slider">
        ${room.images.map((img, i) =>
          `<img src="${img}" class="${i === 0 ? "active" : ""}">`
        ).join("")}
        <div class="room-caption">${room.nama}</div>
      </div>

      <h4>${room.nama}</h4>
      <p>${room.fasilitas.join(" • ")}</p>

      <p style="font-size:13px;color:#666">
        Kamar tersedia: <strong>${room.tersedia}</strong>
      </p>

      <p>
        <strong>Rp ${room.hargaBulanan.toLocaleString("id-ID")}</strong> / bulan
      </p>

      <a href="booking.html?kost=${kostId}&room=${docSnap.id}"
         style="color:#ff8a00;font-weight:600">
        Pilih Tipe Ini →
      </a>
    `;

    container.appendChild(card);
  });
}

// slider hero otomatis
function initHeroSlider() {
  const slides = document.querySelectorAll(".hero-slider img");
  let index = 0;

  if (slides.length <= 1) return;

  setInterval(() => {
    slides[index].classList.remove("active");
    index = (index + 1) % slides.length;
    slides[index].classList.add("active");
  }, 4000);
}

// init
document.addEventListener("DOMContentLoaded", async () => {
  await loadKost();
  await loadRooms();
});
