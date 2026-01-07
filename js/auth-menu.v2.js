function renderMenu(user) {
  if (!menuContent) return;

  if (user) {
    menuContent.innerHTML = `
      <a href="/member/profile.html">Profile</a>
      <a href="/admin/kost-dashboard.html">Admin</a>
      <button id="logoutBtn">Logout</button>
    `;

    document.getElementById("logoutBtn").onclick = async () => {
      await signOut(auth);
      location.reload();
    };

  } else {
    menuContent.innerHTML = `
      <button id="loginGoogle" class="login-google">
        Login (via Google)
      </button>
    `;

    document.getElementById("loginGoogle").onclick = async () => {
      await signInWithPopup(auth, provider);
      location.reload();
    };
  }
}
