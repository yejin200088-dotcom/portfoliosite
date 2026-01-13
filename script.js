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
    
    const maxStrength = 1.0; // 강도를 조금 더 낮춰서 아주 정적인 느낌으로 수정

    if (newPath) {
        // [수정] 전환 속도를 1.2초로 매우 천천히 설정
        staticImg.style.transition = 'opacity 1.2s ease-in-out';
        staticImg.style.opacity = '0'; // 완전히 투명해졌다가
        
        app.liquidPlane.uniforms.displacementScale.value = 0;
        
        setTimeout(() => {
            staticImg.src = newPath;
            app.loadImage(newPath);
            staticImg.style.opacity = '1'; // 다시 천천히 나타남
            canvasEl.style.opacity = '1';

            let val = 0;
            const fadeIn = setInterval(() => {
                val += 0.05; // 물결이 일어나는 속도도 훨씬 천천히
                if (app.liquidPlane) app.liquidPlane.uniforms.displacementScale.value = val;
                if (val >= maxStrength) clearInterval(fadeIn);
            }, 50);
        }, 600); // 이미지가 교체되는 타이밍 대기시간
    } else {
        canvasEl.style.opacity = '1';
        app.liquidPlane.uniforms.displacementScale.value = maxStrength;
    }

    stopTimeout = setTimeout(() => {
        const duration = 2000; // 멈출 때도 여운이 남도록 2초 동안 천천히 멈춤
        const startTime = performance.now();
        
        function smoothlyStop(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            if (app && app.liquidPlane) {
                const easeOut = 1 - Math.pow(1 - progress, 3); 
                app.liquidPlane.uniforms.displacementScale.value = maxStrength * (1 - easeOut);
            }
            if (progress < 1) requestAnimationFrame(smoothlyStop);
            else {
                canvasEl.style.opacity = '0';
                if (app.liquidPlane) app.liquidPlane.uniforms.displacementScale.value = 0;
            }
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
        
        viewport.scrollTo({ left: viewport.offsetWidth * currentIdx, behavior: 'smooth' });

        // 버튼 숨김/보임 처리
        nextBtn.style.display = (currentIdx === slides.length - 1) ? 'none' : 'flex';

        // 7번 슬라이드 도착 시 메인과 똑같은 잔잔한 물결
        if (carouselId === 'aboutCarousel' && currentIdx === 6) {
            staticImg.style.transition = 'opacity 1.2s ease-in-out';
            staticImg.style.opacity = '0';
            setTimeout(() => {
                staticImg.src = 'image/aboutme7.jpg';
                app.loadImage('image/aboutme7.jpg');
                staticImg.style.opacity = '1';
                setTimeout(() => playRipple(null, 3), 100); 
            }, 600);
        }
    }

    prevBtn.addEventListener('click', () => { if (currentIdx > 0) updateSlide(currentIdx - 1); });
    nextBtn.addEventListener('click', () => {
        const slides = viewport.querySelectorAll('.carousel__slide');
        if (currentIdx < slides.length - 1) updateSlide(currentIdx + 1);
    });

    return { 
        reset: () => { 
            currentIdx = 0; 
            if(viewport) viewport.scrollLeft = 0; 
            nextBtn.style.display = 'flex';
        } 
    };
}

const carouselAbout = initCarousel('aboutCarousel');
const carouselPortfolio = initCarousel('portfolioCarousel');

document.getElementById('goAbout').addEventListener('click', (e) => {
    e.preventDefault();
    portfolioCarousel.style.display = 'none';
    aboutCarousel.style.display = 'block';
    carouselAbout.reset(); 
    playRipple('image/aboutme1.jpg', 2.0); // 전환 시간을 고려해 효과 지속시간 살짝 늘림
    nav.classList.remove('active');
    toggleImg.src = "image/hamburgerin.png";
});

document.getElementById('goPortfolio').addEventListener('click', (e) => {
    e.preventDefault();
    aboutCarousel.style.display = 'none';
    portfolioCarousel.style.display = 'block';
    carouselPortfolio.reset(); 
    playRipple('image/portfolio1.jpg', 2.0);
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