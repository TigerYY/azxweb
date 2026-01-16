// 磁吸按钮和卡片效果 - Tesla Style
(function() {
    'use strict';

    // 仅在桌面端启用
    const isMobile = window.innerWidth < 1024;
    if (isMobile) return;

    function init() {
        setupMagneticButtons();
        setupMagneticCards();
        setupGlowingBorders();
    }

    // 磁吸按钮
    function setupMagneticButtons() {
        const buttons = document.querySelectorAll('.btn');

        buttons.forEach(button => {
            button.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const deltaX = (x - centerX) / centerX;
                const deltaY = (y - centerY) / centerY;
                
                const maxMove = 8;
                const moveX = deltaX * maxMove;
                const moveY = deltaY * maxMove;
                
                this.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });

            button.addEventListener('mouseleave', function() {
                this.style.transform = 'translate(0, 0)';
            });
        });
    }

    // 磁吸卡片
    function setupMagneticCards() {
        const cards = document.querySelectorAll('.feature-card, .product-card, .solution-card');

        cards.forEach(card => {
            card.style.transition = 'transform 0.3s ease';

            card.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const deltaX = (x - centerX) / centerX;
                const deltaY = (y - centerY) / centerY;
                
                // 3D 倾斜效果
                const rotateX = deltaY * -10;
                const rotateY = deltaX * 10;
                
                this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
            });
        });
    }

    // 发光边框效果
    function setupGlowingBorders() {
        const cards = document.querySelectorAll('.feature-card, .product-card, .solution-card');

        cards.forEach(card => {
            // 创建发光边框容器
            const glowBorder = document.createElement('div');
            glowBorder.className = 'glow-border';
            glowBorder.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border-radius: inherit;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
                background: linear-gradient(45deg, 
                    #64ffda, 
                    #3B82F6, 
                    #64ffda
                );
                background-size: 200% 200%;
                animation: gradient-flow 3s ease infinite;
                -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                -webkit-mask-composite: xor;
                mask-composite: exclude;
                padding: 2px;
            `;

            // 确保卡片有 position relative
            if (getComputedStyle(card).position === 'static') {
                card.style.position = 'relative';
            }

            card.appendChild(glowBorder);

            card.addEventListener('mouseenter', () => {
                glowBorder.style.opacity = '0.8';
            });

            card.addEventListener('mouseleave', () => {
                glowBorder.style.opacity = '0';
            });
        });

        // 添加渐变动画
        const style = document.createElement('style');
        style.textContent = `
            @keyframes gradient-flow {
                0%, 100% {
                    background-position: 0% 50%;
                }
                50% {
                    background-position: 100% 50%;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 节流函数
    function throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 响应式处理
    window.addEventListener('resize', throttle(() => {
        const nowMobile = window.innerWidth < 1024;
        if (nowMobile) {
            // 移除所有磁吸效果
            document.querySelectorAll('.btn, .feature-card, .product-card, .solution-card').forEach(el => {
                el.style.transform = '';
            });
        }
    }, 250));

})();
