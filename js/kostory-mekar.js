/* =================================
   KOSTORY MEKAR - HERO SLIDER & ZOOM
   ================================= */

document.addEventListener('DOMContentLoaded', function () {

  // ambil elemen
  const slider = document.querySelector('.hero-slider');
  const slides = document.querySelectorAll('.hero-slider img');
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('zoomedImage');

  // pengaman
  if (!slider || slides.length === 0 || !modal || !modalImg) {
    return;
  }

  let currentIndex = 0;
  let startX = 0;

  // tampilkan slide aktif
  function showSlide(index) {
    slides.forEach((img, i) => {
      img.classList.toggle('active', i === index);
    });
  }

  // ===== SWIPE (HP) =====
  slider.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
  });

  slider.addEventListener('touchend', function (e) {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        currentIndex = (currentIndex + 1) % slides.length;
      } else {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      }
      showSlide(currentIndex);
    }
  });

  // ===== ZOOM =====
  slides.forEach(img => {
    img.addEventListener('click', function () {
      modalImg.src = img.src;
      modal.style.display = 'flex';
    });
  });

  // expose ke HTML
  window.closeZoom = function () {
    modal.style.display = 'none';
  };

});
