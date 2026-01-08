import { auth, db } from "../js/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

function normalizePhoneNumber(input) {
  if (!input) return "";

  let phone = input.replace(/\D/g, ""); // buang selain angka

  // 08xxxx → 628xxxx
  if (phone.startsWith("08")) {
    phone = "62" + phone.slice(1);
  }

  // +628xxx → 628xxx
  if (phone.startsWith("628")) {
    return phone;
  }

  // 8xxx → 628xxx (user ketik tanpa 0)
  if (phone.startsWith("8")) {
    phone = "62" + phone;
  }

  return phone;
}


const form = document.getElementById("profileForm");

const email = document.getElementById("email");
const nama = document.getElementById("nama");
const wa = document.getElementById("wa");
const dob = document.getElementById("dob");
const gender = document.getElementById("gender");
const instansi = document.getElementById("instansi");
const alamat = document.getElementById("alamat");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // belum login → tendang balik
    window.location.href = "login-member.html";
    return;
  }

  email.value = user.email;

  const ref = doc(db, "members", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const d = snap.data();
    nama.value = d.nama || "";
    wa.value = d.wa || "";
    dob.value = d.dob || "";
    instansi.value = d.instansi || "";
    alamat.value = d.alamat || "";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    await setDoc(ref, {
      email: user.email,
      nama: nama.value,
      wa: wa.value,
      dob: dob.value,
      instansi: instansi.value,
      alamat: alamat.value,
      updatedAt: serverTimestamp()
    }, { merge: true });

    alert("Profile berhasil disimpan");
  });
});
