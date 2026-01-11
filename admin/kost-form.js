import { db } from "../js/firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const kostId = params.get("id");
const isEdit = !!kostId;

const formTitle = document.getElementById("formTitle");
const form = document.getElementById("kostForm");

if (isEdit) {
  formTitle.textContent = "Edit Kostory";
  loadData();
}

async function loadData() {
  const ref = doc(db, "kost", kostId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const d = snap.data();

  nama.value = d.nama || "";
  alamat.value = d.alamat || "";
  landmark.value = d.landmark || "";
  jenisKost.value = d.jenisKost || "";
  kota.value = d.kota || "";
  parkirMobil.value = d.parkirMobil ?? "";
  aktif.checked = d.aktif !== false;
  bolehSuamiIstri.checked = d.bolehSuamiIstri === true;
  deskripsi.value = d.deskripsi || "";
  fasilitasUmum.value = (d.fasilitasUmum || []).join(", ");
  kebijakan.value = (d.kebijakan || []).join(", ");
  lat.value = d.location?.lat ?? "";
  lng.value = d.location?.lng ?? "";
  heroImages.value = (d.heroImages || []).join(", ");
const durasiCheckboxes = document.querySelectorAll('input[name="durasiTersedia"]');
durasiCheckboxes.forEach(cb => {
  cb.checked = (d.durasiTersedia || []).includes(cb.value);
});
}

form.addEventListener("submit", async e => {
  e.preventDefault();

  const durasiTersedia = Array.from(
  document.querySelectorAll('input[name="durasiTersedia"]:checked')
).map(cb => cb.value);

const data = {
  nama: nama.value.trim(),
  kota: kota.value.trim(),
  alamat: alamat.value.trim(),
  landmark: landmark.value.trim(),
  jenisKost: jenisKost.value,
  durasiTersedia: durasiTersedia,
  bolehSuamiIstri: bolehSuamiIstri.checked,
  deskripsi: deskripsi.value.trim(),
  fasilitasUmum: fasilitasUmum.value.split(",").map(v => v.trim()).filter(Boolean),
  kebijakan: kebijakan.value.split(",").map(v => v.trim()).filter(Boolean),
  heroImages: heroImages.value.split(",").map(v => v.trim()).filter(Boolean),
  parkirMobil: Number(parkirMobil.value) || 0,
  aktif: aktif.checked,
  location: {
    lat: Number(lat.value),
    lng: Number(lng.value)
  },
  rating: 0,
  reviewCount: 0
};


  try {
    if (isEdit) {
      await updateDoc(doc(db, "kost", kostId), data);
      alert("Kostory berhasil diperbarui");
    } else {
      const newRef = doc(db, "kost", crypto.randomUUID());
      await setDoc(newRef, data);
      alert("Kostory berhasil ditambahkan");
      form.reset();
    }
  } catch (err) {
    console.error(err);
    alert("Gagal menyimpan data");
  }
});
