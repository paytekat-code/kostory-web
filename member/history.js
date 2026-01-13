import { db, auth } from "../js/firebase.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const historyList = document.getElementById("historyList");

onAuthStateChanged(auth, async user => {
  if (!user) {
    const currentUrl = window.location.href;
    const loginUrl =
      "https://kostory.id/member/login-member.html?redirect=" +
      encodeURIComponent(currentUrl);
    location.href = loginUrl;
    return;
  }
  
 console.log("USER LOGIN UID:", user.uid);
  
  loadHistory(user.uid);
});

async function loadHistory(uid) {

    console.log("QUERY UID:", uid); // 👈 TAMBAH DI SINI
  
  historyList.innerHTML = renderLoading();

  try {
    const q = query(
      collection(db, "orders"),
      where("uid", "==", uid),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      historyList.innerHTML = renderEmpty();
      return;
    }

    let html = "";

    snap.forEach(doc => {
      const d = doc.data();
      html += renderItem(d);
    });

    historyList.innerHTML = html;

  } catch (err) {
    console.error("History error:", err);
    historyList.innerHTML = renderError();
  }
}

/* =========================
   UI RENDERING
========================= */

function renderItem(d) {
  const typeLabel = d.type === "survey" ? "Survey" : "Booking";
  const badgeClass = d.type === "survey" ? "survey" : "booking";

  const statusLabel = formatStatus(d.status);
  const statusClass = getStatusClass(d.status);

  const createdAt = d.createdAt?.toDate
    ? formatDate(d.createdAt.toDate())
    : "-";

  return `
    <div class="history-item">
      <div class="history-header">
        <h4>${typeLabel} - ${d.bookingCode ?? "-"}</h4>
        <span class="badge ${badgeClass}">
          ${typeLabel}
        </span>
      </div>

      <div class="history-meta">
        <div><strong>Kost:</strong> ${d.kostId ?? "-"}</div>
        <div><strong>Tipe Kamar:</strong> ${d.roomTypeId ?? "-"}</div>
        <div><strong>Durasi:</strong> ${d.durasi ?? "-"}</div>
        <div><strong>Tanggal:</strong> ${createdAt}</div>
      </div>

      <div class="history-footer">
        <span class="status ${statusClass}">
          ${statusLabel}
        </span>
      </div>
    </div>
  `;
}

function renderLoading() {
  return `
    <div class="history-loading">
      Memuat riwayat kamu...
    </div>
  `;
}

function renderEmpty() {
  return `
    <div class="history-empty">
      <p>Kamu belum punya riwayat booking.</p>
    </div>
  `;
}

function renderError() {
  return `
    <div class="history-error">
      <p>Gagal memuat data. Silakan refresh.</p>
    </div>
  `;
}

/* =========================
   HELPERS
========================= */

function formatDate(date) {
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function formatStatus(status) {
  if (!status) return "-";

  const map = {
    booking: "Menunggu Pembayaran",
    paid: "Sudah Dibayar",
    confirmed: "Dikonfirmasi",
    cancelled: "Dibatalkan",
    completed: "Selesai"
  };
  
  return map[status] || status;
}

function getStatusClass(status) {
  if (!status) return "default";

  const map = {
    booking: "yellow",
    paid: "blue",
    confirmed: "green",
    cancelled: "red",
    completed: "gray"
  };

  return map[status] || "default";
}

