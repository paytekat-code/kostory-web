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

  loadHistory(user.uid);
});

async function loadHistory(uid) {
  historyList.innerHTML = "Loading...";

  const q = query(
    collection(db, "orders"),
    where("booker.uid", "==", uid),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    historyList.innerHTML = "<p>Kamu belum punya riwayat booking.</p>";
    return;
  }

  let html = "";

  snap.forEach(doc => {
    const d = doc.data();

    const typeLabel = d.type === "survey" ? "Survey" : "Booking";
    const badgeClass = d.type === "survey" ? "survey" : "booking";

    html += `
      <div class="history-item">
        <h4>${typeLabel} - ${d.bookingCode}</h4>
        <div class="history-meta">
          Status: ${d.status}
        </div>
        <span class="badge ${badgeClass}">
          ${typeLabel}
        </span>
      </div>
    `;
  });

  historyList.innerHTML = html;
}
