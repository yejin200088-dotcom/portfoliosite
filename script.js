const canvasEl = document.getElementById('canvas');
const staticImg = document.getElementById('staticImg');
const aboutCarousel = document.getElementById('aboutCarousel');
const portfolioCarousel = document.getElementById('portfolioCarousel');
const nav = document.getElementById("nav");
const toggle = document.getElementById("toggle");
const toggleImg = document.getElementById("toggleImg");

let app;

// 초기화 함수
function initApp() {
    try {
        // 라이브러리가 로드되었는지 확인 후 실행
        const LiquidFn = window.LiquidBackground || (window.default && window.default.LiquidBackground);
        if (LiquidFn) {
            app = LiquidFn(canvasEl);
            app.loadImage('image/mainpage.jpg');
        }
    } catch (e) { console.error("초기화 에러:", e); }
}
window.addEventListener('load', initApp);

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

function initCarousel(carouselId) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return { reset: () => {} };
    const viewport = carousel.querySelector('.carousel__viewport');
    const prevBtn = carousel.querySelector('.prev');
    const nextBtn = carousel.querySelector('.next');
    let currentIdx = 0;

    function updateSlide(idx) {
        const slides = viewport.querySelectorAll('.carousel__slide');
        currentIdx = idx;
        const currentSlide = slides[currentIdx];
        
        // 이미지 경로 추출
        const bgImg = currentSlide.style.backgroundImage.slice(5, -2).replace(/"/g, "");

        // 슬라이드 이동
        viewport.scrollTo({ left: viewport.offsetWidth * currentIdx, behavior: 'smooth' });

        // 효과 실행 (어바웃미 7번은 5초, 나머지는 1.5초)
        const duration = (carouselId === 'aboutCarousel' && currentIdx === 6) ? 5 : 1.5;
        playRipple(bgImg, duration);
    }

    prevBtn.addEventListener('click', () => { if (currentIdx > 0) updateSlide(currentIdx - 1); });
    nextBtn.addEventListener('click', () => { 
        const slides = viewport.querySelectorAll('.carousel__slide');
        if (currentIdx < slides.length - 1) updateSlide(currentIdx + 1); 
    });

    return {
        reset: () => { currentIdx = 0; if(viewport) viewport.scrollLeft = 0; }
    };
}

const carouselAbout = initCarousel('aboutCarousel');
const carouselPortfolio = initCarousel('portfolioCarousel');

// 메뉴 클릭 이벤트 (기존 물결 효과 살림)
document.getElementById('goAbout').addEventListener('click', (e) => {
    e.preventDefault();
    portfolioCarousel.style.display = 'none';
    aboutCarousel.style.display = 'block';
    carouselAbout.reset();
    playRipple('image/aboutme1.jpg', 2.5); // 세 번 나타나던 그 효과 복구!
    nav.classList.remove('active');
    toggleImg.src = "image/hamburgerin.png";
});

document.getElementById('goPortfolio').addEventListener('click', (e) => {
    e.preventDefault();
    aboutCarousel.style.display = 'none';
    portfolioCarousel.style.display = 'block';
    carouselPortfolio.reset();
    playRipple('image/portfolio1.jpg', 2.5); // 세 번 나타나던 그 효과 복구!
    nav.classList.remove('active');
    toggleImg.src = "image/hamburgerin.png";
});

if (toggle) {
    toggle.addEventListener("click", () => {
        nav.classList.toggle("active");
        toggleImg.src = nav.classList.contains("active") ? "image/hamburgerout.png" : "image/hamburgerin.png";
    });
}

// 첫 로딩 시 효과
window.addEventListener('load', () => setTimeout(() => playRipple(null, 3), 500));
