import { db } from "../js/firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const kostId = params.get("kostId");
const roomId = params.get("roomId");
const isEdit = !!roomId;

if (!kostId) {
  alert("kostId tidak ditemukan");
  throw new Error("kostId missing");
}

const formTitle = document.getElementById("formTitle");
const form = document.getElementById("roomForm");

if (isEdit) {
  formTitle.textContent = "Edit Tipe Kamar";
  loadRoom();
}

async function loadRoom() {
  const ref = doc(db, "kost", kostId, "rooms", roomId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const r = snap.data();

  nama.value = r.nama || "";
  fasilitas.value = (r.fasilitas || []).join(", ");
  ukuranKamar.value = r.ukuranKamar || "";
  hargaHarian.value = r.hargaHarian ?? "";
  hargaMingguan.value = r.hargaMingguan ?? "";
  hargaBulanan.value = r.hargaBulanan ?? "";
  jumlahKamar.value = r.jumlahKamar ?? "";
  images.value = (r.images || []).join(", ");
}

form.addEventListener("submit", async e => {
  e.preventDefault();

  const data = {
    nama: nama.value.trim(),
    fasilitas: fasilitas.value
      .split(",")
      .map(v => v.trim())
      .filter(Boolean),

    ukuranKamar: ukuranKamar.value.trim(),

    hargaHarian: Number(hargaHarian.value) || null,
    hargaMingguan: Number(hargaMingguan.value) || null,
    hargaBulanan: Number(hargaBulanan.value) || null,

    jumlahKamar: Number(jumlahKamar.value),

    images: images.value
      .split(",")
      .map(v => v.trim())
      .filter(Boolean)
  };

  if (!data.nama) {
    alert("Nama tipe kamar wajib diisi");
    return;
  }

  if (data.jumlahKamar < 1) {
    alert("Jumlah kamar minimal 1");
    return;
  }

  try {
    if (isEdit) {
      await updateDoc(
        doc(db, "kost", kostId, "rooms", roomId),
        data
      );
      alert("Tipe kamar berhasil diperbarui");
    } else {
      const newRef = doc(
        db,
        "kost",
        kostId,
        "rooms",
        crypto.randomUUID()
      );
      await setDoc(newRef, data);
      alert("Tipe kamar berhasil ditambahkan");
      form.reset();
    }
  } catch (err) {
    console.error(err);
    alert("Gagal menyimpan data tipe kamar");
  }
});
