import { auth, db } from "../js/firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const form = document.getElementById("profileForm");

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "/";
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

  form.addEventListener("submit", async e => {
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
