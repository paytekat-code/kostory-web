import { db } from "../js/firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const kostId = params.get("kostId");
const roomTypeId = params.get("roomTypeId");

if (!kostId || !roomTypeId) {
  alert("Parameter tidak lengkap");
  throw new Error("missing param");
}

const title = document.getElementById("title");
const subtitle = document.getElementById("subtitle");
const grid = document.getElementById("grid");
const summary = document.getElementById("summary");

title.textContent = "Kostory Mekar";
subtitle.textContent = `Tipe Kamar: ${roomTypeId}`;

async function loadUnits() {
  const snap = await getDocs(
    collection(db, "kost", kostId, "rooms", roomTypeId, "units")
  );

  let total = 0;
  let terisi = 0;

  grid.innerHTML = "";

  snap.forEach(docSnap => {
    const unit = docSnap.data();
    total++;

    const isKosong = unit.status === "kosong";
    if (!isKosong) terisi++;

    const box = document.createElement("div");
    box.style.padding = "16px";
    box.style.borderRadius = "16px";
    box.style.textAlign = "center";
    box.style.fontWeight = "600";
    box.style.color = "#fff";
    box.style.background =
      isKosong ? "#6cc36c" : "#5b7cfa";

    box.innerHTML = `
      <div style="font-size:20px">${unit.nomor}</div>
      <div style="font-size:12px;opacity:.9">
        ${isKosong ? "KOSONG" : "TERISI"}
      </div>
    `;

    grid.appendChild(box);
  });

  summary.textContent = `Terisi : ${terisi} / ${total}`;
}

loadUnits();
