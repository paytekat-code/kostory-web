/* =========================
   KOSTORY MEKAR HERO SLIDER
   ========================= */

const slides = document.querySelectorAll('.hero-slider img');
let currentIndex = 0;

function showSlide(index){
  slides.forEach((img,i)=>{
    img.classList.toggle('active', i === index);
  });
}

/* SWIPE (MOBILE) */
let startX = 0;
const slider = document.querySelector('.hero-slider');

if(slider){
  slider.addEventListener('touchstart', e=>{
    startX = e.touches[0].clientX;
  });

  slider.addEventListener('touchend', e=>{
    const endX = e.changedTouches[0].clientX;
    if(startX - endX > 50){
      currentIndex = (currentIndex + 1) % slides.length;
    } else if(endX - startX > 50){
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    }
    showSlide(currentIndex);
  });
}

/* ZOOM */
slides.forEach(img=>{
  img.addEventListener('click', ()=>{
    document.getElementById('zoomedImage').src = img.src;
    document.getElementById('imageModal').style.display = 'flex';
  });
});

function closeZoom(){
  document.getElementById('imageModal').style.display = 'none';
}
