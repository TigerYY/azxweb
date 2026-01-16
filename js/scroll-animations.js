// GSAP ScrollTrigger 滚动动画系统 - Tesla Style
(function() {
    'use strict';

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP or ScrollTrigger not loaded');
        return;
    }

    // 注册 ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    function init() {
        // 滚动进度条
        createScrollProgress();

        // Section 视差效果
        createSectionParallax();

        // 卡片进入动画
        createCardAnimations();

        // 文字渐显动画
        createTextAnimations();

        // 统计数字动画
        createStatsAnimations();
    }

    // 创建滚动进度条
    function createScrollProgress() {
        // 创建进度条元素
        const progressBar = document.createElement('div');
        progressBar.id = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, #64ffda, #3B82F6);
            z-index: 9999;
            box-shadow: 0 0 10px rgba(100, 255, 218, 0.5);
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);

        // 滚动动画
        gsap.to(progressBar, {
            width: '100%',
            ease: 'none',
            scrollTrigger: {
                trigger: document.body,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.3
            }
        });
    }

    // Section 视差效果
    function createSectionParallax() {
        const sections = document.querySelectorAll('.section-padding');

        sections.forEach((section, index) => {
            // 背景视差
            if (section.classList.contains('bg-dark') || section.classList.contains('bg-black')) {
                gsap.to(section, {
                    backgroundPosition: '50% 100px',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true
                    }
                });
            }

            // Section 淡入
            gsap.from(section, {
                opacity: 0.3,
                y: 50,
                duration: 1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    end: 'top 20%',
                    scrub: 1
                }
            });
        });
    }

    // 卡片动画
    function createCardAnimations() {
        const cards = document.querySelectorAll(
            '.feature-card, .product-card, .solution-card, .contact-info-card'
        );

        cards.forEach((card, index) => {
            // 移除旧的内联样式
            card.style.opacity = '';
            card.style.transform = '';

            // GSAP 动画
            gsap.from(card, {
                opacity: 0,
                y: 60,
                rotationX: -15,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                },
                delay: (index % 3) * 0.1
            });

            // 3D 翻转效果
            card.addEventListener('mouseenter', function() {
                gsap.to(this, {
                    rotationY: 5,
                    rotationX: 5,
                    scale: 1.05,
                    duration: 0.4,
                    ease: 'power2.out'
                });
            });

            card.addEventListener('mouseleave', function() {
                gsap.to(this, {
                    rotationY: 0,
                    rotationX: 0,
                    scale: 1,
                    duration: 0.4,
                    ease: 'power2.out'
                });
            });
        });
    }

    // 文字动画
    function createTextAnimations() {
        const headers = document.querySelectorAll('.section-header');

        headers.forEach(header => {
            const title = header.querySelector('.section-title');
            const subtitle = header.querySelector('.section-subtitle');

            if (title) {
                gsap.from(title, {
                    opacity: 0,
                    y: 30,
                    duration: 0.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: header,
                        start: 'top 80%',
                        toggleActions: 'play none none reverse'
                    }
                });
            }

            if (subtitle) {
                gsap.from(subtitle, {
                    opacity: 0,
                    y: 20,
                    duration: 0.8,
                    delay: 0.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: header,
                        start: 'top 80%',
                        toggleActions: 'play none none reverse'
                    }
                });
            }
        });

        // 段落动画
        const paragraphs = document.querySelectorAll('.about-text p, .hero-subtitle');
        paragraphs.forEach((p, index) => {
            gsap.from(p, {
                opacity: 0,
                x: -30,
                duration: 0.8,
                delay: index * 0.1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: p,
                    start: 'top 90%',
                    toggleActions: 'play none none reverse'
                }
            });
        });
    }

    // 统计数字动画
    function createStatsAnimations() {
        const stats = document.querySelectorAll('.stat-number');

        stats.forEach(stat => {
            const text = stat.textContent;
            const number = parseInt(text);
            
            if (!isNaN(number)) {
                gsap.from(stat, {
                    textContent: 0,
                    duration: 2,
                    ease: 'power1.out',
                    snap: { textContent: 1 },
                    scrollTrigger: {
                        trigger: stat,
                        start: 'top 80%',
                        toggleActions: 'play none none reverse'
                    },
                    onUpdate: function() {
                        stat.textContent = Math.ceil(this.targets()[0].textContent) + (text.includes('+') ? '+' : '');
                    }
                });
            }
        });
    }

    // 视差速度控制
    function setupParallax() {
        // Hero 背景视差
        const heroOverlay = document.querySelector('.hero-overlay');
        if (heroOverlay) {
            gsap.to(heroOverlay, {
                y: 200,
                opacity: 0,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                }
            });
        }

        // 图片视差
        const images = document.querySelectorAll('.product-image img, .solution-image img');
        images.forEach(img => {
            gsap.to(img, {
                y: 30,
                ease: 'none',
                scrollTrigger: {
                    trigger: img,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1
                }
            });
        });
    }

    // 页面加载完成后初始化
    function onReady() {
        init();
        setupParallax();

        // 刷新 ScrollTrigger
        ScrollTrigger.refresh();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
    } else {
        onReady();
    }

    // 窗口大小改变时刷新
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 250);
    });

})();
