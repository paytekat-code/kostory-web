import { db } from "../js/firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const kostId = params.get("kostId");
const roomTypeId = params.get("roomTypeId");

if (!kostId || !roomTypeId) {
  alert("kostId / roomTypeId tidak ditemukan");
  throw new Error("missing param");
}

const info = document.getElementById("info");
const form = document.getElementById("unitForm");
const unitList = document.getElementById("unitList");

info.textContent =
  `Kost: ${kostId} • Tipe: ${roomTypeId}`;

// ===== LOAD UNIT =====
async function loadUnits() {
  unitList.innerHTML = "";

  const snap = await getDocs(
    collection(db, "kost", kostId, "rooms", roomTypeId, "units")
  );

  if (snap.empty) {
    unitList.innerHTML = "<p class='help'>Belum ada unit.</p>";
    return;
  }

  snap.forEach(d => {
    const u = d.data();

    const box = document.createElement("div");
    box.style.display = "inline-block";
    box.style.padding = "12px 16px";
    box.style.margin = "6px";
    box.style.borderRadius = "10px";
    box.style.background =
      u.status === "kosong" ? "#6cc36c" : "#5b7cfa";
    box.style.color = "#fff";
    box.style.fontWeight = "600";

    box.innerHTML = `
      ${u.nomor}
      <span style="margin-left:8px;cursor:pointer">✕</span>
    `;

    box.querySelector("span").onclick = async () => {
      if (!confirm(`Hapus kamar ${u.nomor}?`)) return;
      await deleteDoc(
        doc(db, "kost", kostId, "rooms", roomTypeId, "units", d.id)
      );
      loadUnits();
    };

    unitList.appendChild(box);
  });
}

// ===== SIMPAN =====
form.addEventListener("submit", async e => {
  e.preventDefault();

  const nomor = document.getElementById("nomor").value.trim();

  if (!nomor) return;

  const ref = doc(
    db,
    "kost",
    kostId,
    "rooms",
    roomTypeId,
    "units",
    nomor
  );

  const exist = await getDoc(ref);
  if (exist.exists()) {
    alert("Nomor kamar sudah ada");
    return;
  }

  await setDoc(ref, {
    nomor,
    status: "kosong",
    penghuniId: null
  });

  form.reset();
  loadUnits();
});

// INIT
loadUnits();
