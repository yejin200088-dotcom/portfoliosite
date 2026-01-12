const canvasEl = document.getElementById('canvas');
const staticImg = document.getElementById('staticImg');
const aboutCarousel = document.getElementById('aboutCarousel');
const portfolioCarousel = document.getElementById('portfolioCarousel');
const nav = document.getElementById("nav");
const toggle = document.getElementById("toggle");
const toggleImg = document.getElementById("toggleImg");

let app;

// 물결 초기화 (안전장치 강화)
function initApp() {
    try {
        // 창이 다 열리고 라이브러리가 로드되었는지 확인
        const LiquidFn = window.LiquidBackground || (window.default && window.default.LiquidBackground);
        
        if (typeof LiquidFn === 'function') {
            app = LiquidFn(canvasEl);
            app.loadImage('image/mainpage.jpg');
            console.log("물결 엔진 가동 성공!");
        } else {
            console.error("물결 라이브러리를 찾을 수 없습니다. HTML 하단에 주소를 확인하세요.");
        }
    } catch (e) {
        console.error("초기화 에러:", e);
    }
}

// 창이 뜨자마자 초기화 실행
window.addEventListener('load', initApp);

let stopTimeout;

function playRipple(newPath, seconds = 2) {
    // app이나 liquidPlane이 없으면 강제로 다시 체크
    if (!app || !app.liquidPlane) {
        initApp(); // 수동 재호출
        if(!app) return;
    }

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
        if (app.liquidPlane) app.liquidPlane.uniforms.displacementScale.value = maxStrength;
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

            if (progress < 1) {
                requestAnimationFrame(smoothlyStop);
            } else {
                canvasEl.style.opacity = '0';
                if (app && app.liquidPlane) app.liquidPlane.uniforms.displacementScale.value = 0;
            }
        }
        requestAnimationFrame(smoothlyStop);
    }, seconds * 1000);
}

// 캐러셀 로직
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
        
        // 이미지 경로 자동 추출
        const bgImg = currentSlide.style.backgroundImage.slice(5, -2).replace(/"/g, "");

        // 슬라이드 이동
        viewport.scrollTo({ left: viewport.offsetWidth * currentIdx, behavior: 'smooth' });

        // [효과] 어바웃미 7번(idx 6)은 5초, 나머지는 1.5초
        const duration = (carouselId === 'aboutCarousel' && currentIdx === 6) ? 5 : 1.5;
        playRipple(bgImg, duration);
    }

    prevBtn.addEventListener('click', () => { if (currentIdx > 0) updateSlide(currentIdx - 1); });
    nextBtn.addEventListener('click', () => { 
        const slides = viewport.querySelectorAll('.carousel__slide');
        if (currentIdx < slides.length - 1) updateSlide(currentIdx + 1); 
    });

    return { reset: () => { currentIdx = 0; if(viewport) viewport.scrollLeft = 0; } };
}

const carouselAbout = initCarousel('aboutCarousel');
const carouselPortfolio = initCarousel('portfolioCarousel');

document.getElementById('goAbout').addEventListener('click', (e) => {
    e.preventDefault();
    portfolioCarousel.style.display = 'none';
    aboutCarousel.style.display = 'block';
    carouselAbout.reset();
    playRipple('image/aboutme1.jpg', 2.5); // 메뉴 클릭 물결!
    nav.classList.remove('active');
    toggleImg.src = "image/hamburgerin.png";
});

document.getElementById('goPortfolio').addEventListener('click', (e) => {
    e.preventDefault();
    aboutCarousel.style.display = 'none';
    portfolioCarousel.style.display = 'block';
    carouselPortfolio.reset();
    playRipple('image/portfolio1.jpg', 2.5); // 메뉴 클릭 물결!
    nav.classList.remove('active');
    toggleImg.src = "image/hamburgerin.png";
});

if (toggle) {
    toggle.addEventListener("click", () => {
        nav.classList.toggle("active");
        toggleImg.src = nav.classList.contains("active") ? "image/hamburgerout.png" : "image/hamburgerin.png";
    });
}

// 첫 화면 물결
window.addEventListener('load', () => setTimeout(() => playRipple(null, 3), 500));
