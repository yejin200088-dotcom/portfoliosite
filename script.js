import LiquidBackground from 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.27/build/backgrounds/liquid1.min.js'

const canvasEl = document.getElementById('canvas');
const staticImg = document.getElementById('staticImg');
const aboutCarousel = document.getElementById('aboutCarousel');
const portfolioCarousel = document.getElementById('portfolioCarousel');
const nav = document.getElementById("nav");
const toggle = document.getElementById("toggle");
const toggleImg = document.getElementById("toggleImg");

let app;
function initApp() {
    try {
        app = LiquidBackground(canvasEl);
        app.loadImage('image/mainpage.jpg');
    } catch (e) {
        console.error("초기화 에러:", e);
    }
}
initApp();

let stopTimeout;

function playRipple(newPath, seconds = 2) {
    if (!app || !app.liquidPlane) return;
    clearTimeout(stopTimeout);
    
    canvasEl.style.opacity = '1';
    const maxStrength = 2.5; // 강도 약하게 수정

    if (newPath) {
        app.liquidPlane.uniforms.displacementScale.value = 0;
        staticImg.src = newPath;
        app.loadImage(newPath);

        setTimeout(() => {
            let val = 0;
            const fadeIn = setInterval(() => {
                val += 0.2; 
                if (app.liquidPlane) app.liquidPlane.uniforms.displacementScale.value = val;
                if (val >= maxStrength) clearInterval(fadeIn);
            }, 20);
        }, 100); 
    } else {
        app.liquidPlane.uniforms.displacementScale.value = maxStrength;
    }

    stopTimeout = setTimeout(() => {
        const duration = 1200; // 정지 속도 2/3로 단축
        const startTime = performance.now();
        
        function smoothlyStop(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            if (app && app.liquidPlane) {
                const easeOut = 1 - Math.pow(1 - progress, 3); 
                app.liquidPlane.uniforms.displacementScale.value = maxStrength * (1 - easeOut);
            }

            if (progress < 1) {
                requestAnimationFrame(smoothlyStop);
            } else {
                canvasEl.style.opacity = '0';
                if (app.liquidPlane) app.liquidPlane.uniforms.displacementScale.value = 0;
            }
        }
        requestAnimationFrame(smoothlyStop);
    }, seconds * 1000);
}

function initCarousel(carouselId) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return () => {};
    const viewport = carousel.querySelector('.carousel__viewport');
    const prevBtn = carousel.querySelector('.prev');
    const nextBtn = carousel.querySelector('.next');
    let currentIdx = 0;

    prevBtn.addEventListener('click', () => {
        const slides = viewport.querySelectorAll('.carousel__slide');
        currentIdx = (currentIdx <= 0) ? slides.length - 1 : currentIdx - 1;
        viewport.scrollTo({ left: viewport.offsetWidth * currentIdx, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
        const slides = viewport.querySelectorAll('.carousel__slide');
        currentIdx = (currentIdx >= slides.length - 1) ? 0 : currentIdx + 1;
        viewport.scrollTo({ left: viewport.offsetWidth * currentIdx, behavior: 'smooth' });
    });

    return () => {
        currentIdx = 0;
        if(viewport) viewport.scrollLeft = 0;
    };
}

const resetAbout = initCarousel('aboutCarousel');
const resetPortfolio = initCarousel('portfolioCarousel');

document.getElementById('goAbout').addEventListener('click', (e) => {
    e.preventDefault();
    portfolioCarousel.style.display = 'none';
    aboutCarousel.style.display = 'block';
    resetAbout(); 
    playRipple('image/aboutme1.jpg', 1.5);
    nav.classList.remove('active');
    toggleImg.src = "image/hamburgerin.png";
});

document.getElementById('goPortfolio').addEventListener('click', (e) => {
    e.preventDefault();
    aboutCarousel.style.display = 'none';
    portfolioCarousel.style.display = 'block';
    resetPortfolio(); 
    playRipple('image/portfolio1.jpg', 1.5);
    nav.classList.remove('active');
    toggleImg.src = "image/hamburgerin.png";
});

if (toggle) {
    toggle.addEventListener("click", () => {
        nav.classList.toggle("active");
        if (nav.classList.contains("active")) {
            toggleImg.src = "image/hamburgerout.png";
        } else {
            toggleImg.src = "image/hamburgerin.png";
        }
    });
}

window.addEventListener('load', () => playRipple(null, 3));
