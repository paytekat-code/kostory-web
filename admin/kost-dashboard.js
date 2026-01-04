import { db } from "../js/firebase.js";
import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const kostId = params.get("kostId");

if (!kostId) {
  alert("kostId tidak ditemukan");
  throw new Error("missing kostId");
}

const kostNamaEl = document.getElementById("kostNama");
const summaryEl = document.getElementById("summary");
const content = document.getElementById("content");

async function loadDashboard() {
  // ===== LOAD KOST =====
  const kostSnap = await getDoc(doc(db, "kost", kostId));
  if (kostSnap.exists()) {
    kostNamaEl.textContent = kostSnap.data().nama;
  }

  let totalUnit = 0;
  let totalTerisi = 0;

  // ===== LOAD ALL ROOM TYPES =====
  const roomSnap = await getDocs(
    collection(db, "kost", kostId, "rooms")
  );

  for (const roomDoc of roomSnap.docs) {
    const room = roomDoc.data();
    const roomTypeId = roomDoc.id;

    // SECTION TIPE KAMAR
    const section = document.createElement("div");
    section.style.marginBottom = "32px";

    section.innerHTML = `
      <h3>${room.nama}</h3>
      <div class="unit-grid"
           style="
             display:grid;
             grid-template-columns:repeat(auto-fill,minmax(120px,1fr));
             gap:14px;
             margin-top:12px
           ">
      </div>
    `;

    const grid = section.querySelector(".unit-grid");

    // ===== LOAD UNITS =====
    const unitSnap = await getDocs(
      collection(db, "kost", kostId, "rooms", roomTypeId, "units")
    );

    unitSnap.forEach(uDoc => {
      const unit = uDoc.data();
      totalUnit++;

      const isKosong = unit.status === "kosong";
      if (!isKosong) totalTerisi++;

      const box = document.createElement("div");
      box.style.padding = "14px";
      box.style.borderRadius = "14px";
      box.style.textAlign = "center";
      box.style.fontWeight = "600";
      box.style.color = "#fff";
      box.style.background =
        isKosong ? "#6cc36c" : "#5b7cfa";

      box.innerHTML = `
        <div style="font-size:18px">${unit.nomor}</div>
        <div style="font-size:12px;opacity:.9">
          ${isKosong ? "KOSONG" : "TERISI"}
        </div>
      `;

      grid.appendChild(box);
    });

    content.appendChild(section);
  }

  summaryEl.textContent = `Terisi ${totalTerisi} / ${totalUnit}`;
}

loadDashboard();
