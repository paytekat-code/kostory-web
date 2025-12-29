// js/app.js
import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// TEST koneksi Firestore (silent, tidak ganggu UI)
async function testFirestore() {
  try {
    await addDoc(collection(db, "system_logs"), {
      type: "page_load",
      page: "landing",
      createdAt: serverTimestamp()
    });
    console.log("🔥 Firestore connected");
  } catch (e) {
    console.error("❌ Firestore error:", e);
  }
}

// Jalan otomatis saat halaman dibuka
testFirestore();
