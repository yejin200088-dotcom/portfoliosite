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
        const LiquidFn = window.LiquidBackground || (window.default && window.default.LiquidBackground) || window.default;
        if (typeof LiquidFn === 'function') {
            app = LiquidFn(canvasEl);
            app.loadImage('image/mainpage.jpg');
        }
    } catch (e) { console.error("초기화 에러:", e); }
}
window.onload = initApp;

let stopTimeout;
function playRipple(newPath, seconds = 2) {
    if (!app || !app.liquidPlane) return;
    clearTimeout(stopTimeout);
    canvasEl.style.opacity = '1';
    const maxStrength = 2.5;

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
        const duration = 1200;
        const startTime = performance.now();
        function smoothlyStop(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            if (app && app.liquidPlane) {
                const easeOut = 1 - Math.pow(1 - progress, 3); 
                app.liquidPlane.uniforms.displacementScale.value = maxStrength * (1 - easeOut);
            }
            if (progress < 1) { requestAnimationFrame(smoothlyStop); }
            else { canvasEl.style.opacity = '0'; if (app.liquidPlane) app.liquidPlane.uniforms.displacementScale.value = 0; }
        }
        requestAnimationFrame(smoothlyStop);
    }, seconds * 1000);
}

// [핵심 수정] 캐러셀 초기화 및 이동 로직
function initCarousel(carouselId) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return { reset: () => {}, updateSlide: () => {} };
    const viewport = carousel.querySelector('.carousel__viewport');
    const prevBtn = carousel.querySelector('.prev');
    const nextBtn = carousel.querySelector('.next');
    let currentIdx = 0;

    function updateSlide(idx, isMenuClick = false) {
        const slides = viewport.querySelectorAll('.carousel__slide');
        if (idx < 0 || idx >= slides.length) return;
        
        currentIdx = idx;
        const currentSlide = slides[currentIdx];
        const bgImg = currentSlide.style.backgroundImage.slice(5, -2).replace(/"/g, "");

        // 슬라이드 이동
        viewport.scrollTo({ left: viewport.offsetWidth * currentIdx, behavior: 'smooth' });

        // 메뉴 클릭으로 온 게 아닐 때만(화살표 이동 시에만) 여기서 물결 실행
        // (메뉴 클릭은 아래 별도 이벤트에서 playRipple을 직접 쏘기 때문)
        if (!isMenuClick) {
            const effectDuration = (carouselId === 'aboutCarousel' && currentIdx === 6) ? 5 : 1.5;
            playRipple(bgImg, effectDuration);
        }
    }

    prevBtn.addEventListener('click', () => { if (currentIdx > 0) updateSlide(currentIdx - 1); });
    nextBtn.addEventListener('click', () => { if (currentIdx < slides.length - 1) updateSlide(currentIdx + 1); });

    return {
        reset: () => { 
            currentIdx = 0; 
            if(viewport) viewport.scrollLeft = 0; 
        },
        updateSlide: updateSlide
    };
}

const carouselAbout = initCarousel('aboutCarousel');
const carouselPortfolio = initCarousel('portfolioCarousel');

// ABOUT ME 메뉴 클릭
document.getElementById('goAbout').addEventListener('click', (e) => {
    e.preventDefault();
    portfolioCarousel.style.display = 'none';
    aboutCarousel.style.display = 'block';
    carouselAbout.reset(); // 인덱스 0으로 초기화
    playRipple('image/aboutme1.jpg', 2.5); // 메인 메뉴 클릭 물결 효과 (사라졌던 것 복구!)
    nav.classList.remove('active');
    toggleImg.src = "image/hamburgerin.png";
});

// PORTFOLIO 메뉴 클릭
document.getElementById('goPortfolio').addEventListener('click', (e) => {
    e.preventDefault();
    aboutCarousel.style.display = 'none';
    portfolioCarousel.style.display = 'block';
    carouselPortfolio.reset(); // 인덱스 0으로 초기화
    playRipple('image/portfolio1.jpg', 2.5); // 메인 메뉴 클릭 물결 효과 복구!
    nav.classList.remove('active');
    toggleImg.src = "image/hamburgerin.png";
});

if (toggle) {
    toggle.addEventListener("click", () => {
        nav.classList.toggle("active");
        toggleImg.src = nav.classList.contains("active") ? "image/hamburgerout.png" : "image/hamburgerin.png";
    });
}

window.addEventListener('load', () => playRipple(null, 3));
