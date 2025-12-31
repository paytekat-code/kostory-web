/* =================================
   KOSTORY MEKAR - HERO SLIDER & ZOOM
   ================================= */

document.addEventListener('DOMContentLoaded', function () {

  // ambil elemen
const slider = document.querySelector('.hero-slider');
const slides = document.querySelectorAll('.hero-slider img');
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('zoomedImage');
const heroCaption = document.getElementById('heroCaption'); // ⬅️ INI YANG KURANG

if (!slider || slides.length === 0 || !modal || !modalImg || !heroCaption) {
  return;
}

let currentIndex = 0;
showSlide(currentIndex);
let startX = 0;

function showSlide(index) {
  slides.forEach((img, i) => {
    img.classList.toggle('active', i === index);
  });

  const caption = slides[index].dataset.caption || '';
  heroCaption.textContent = caption;
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
