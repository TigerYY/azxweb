// 自定义光标效果 - Tesla Style
(function() {
    'use strict';

    // 仅在桌面端启用
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile || window.innerWidth < 1024) {
        return;
    }

    let cursor, cursorDot, cursorOutline;
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let isHovering = false;

    function init() {
        createCursor();
        addEventListeners();
        animate();
    }

    function createCursor() {
        // 隐藏默认光标
        document.body.style.cursor = 'none';

        // 创建光标容器
        cursor = document.createElement('div');
        cursor.id = 'custom-cursor';
        cursor.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 9999;
        `;
        document.body.appendChild(cursor);

        // 光标点
        cursorDot = document.createElement('div');
        cursorDot.className = 'cursor-dot';
        cursorDot.style.cssText = `
            width: 8px;
            height: 8px;
            background: #64ffda;
            border-radius: 50%;
            position: absolute;
            transform: translate(-50%, -50%);
            transition: transform 0.15s ease, background 0.3s ease;
            box-shadow: 0 0 10px rgba(100, 255, 218, 0.8);
        `;
        cursor.appendChild(cursorDot);

        // 光标外圈
        cursorOutline = document.createElement('div');
        cursorOutline.className = 'cursor-outline';
        cursorOutline.style.cssText = `
            width: 40px;
            height: 40px;
            border: 2px solid #64ffda;
            border-radius: 50%;
            position: absolute;
            transform: translate(-50%, -50%);
            transition: width 0.3s ease, height 0.3s ease, border-color 0.3s ease;
            opacity: 0.5;
        `;
        cursor.appendChild(cursorOutline);
    }

    function addEventListeners() {
        // 跟踪鼠标移动
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // 监听可交互元素
        const interactiveElements = document.querySelectorAll(
            'a, button, .btn, input, textarea, select, [role="button"], .product-card, .solution-card, .feature-card'
        );

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                isHovering = true;
                cursorOutline.style.width = '60px';
                cursorOutline.style.height = '60px';
                cursorOutline.style.borderColor = '#3B82F6';
                cursorOutline.style.opacity = '0.8';
                cursorDot.style.transform = 'translate(-50%, -50%) scale(1.5)';
                cursorDot.style.background = '#3B82F6';
                
                // 为按钮添加箭头
                if (el.classList.contains('btn') || el.tagName === 'BUTTON') {
                    cursorOutline.style.borderStyle = 'dashed';
                }
            });

            el.addEventListener('mouseleave', () => {
                isHovering = false;
                cursorOutline.style.width = '40px';
                cursorOutline.style.height = '40px';
                cursorOutline.style.borderColor = '#64ffda';
                cursorOutline.style.opacity = '0.5';
                cursorOutline.style.borderStyle = 'solid';
                cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
                cursorDot.style.background = '#64ffda';
            });
        });

        // 点击效果
        document.addEventListener('mousedown', () => {
            cursorDot.style.transform = 'translate(-50%, -50%) scale(0.5)';
            cursorOutline.style.width = '50px';
            cursorOutline.style.height = '50px';
        });

        document.addEventListener('mouseup', () => {
            if (isHovering) {
                cursorDot.style.transform = 'translate(-50%, -50%) scale(1.5)';
                cursorOutline.style.width = '60px';
                cursorOutline.style.height = '60px';
            } else {
                cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
                cursorOutline.style.width = '40px';
                cursorOutline.style.height = '40px';
            }
        });

        // 离开页面时隐藏
        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
        });

        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
        });
    }

    function animate() {
        // 平滑跟随
        const speed = 0.15;
        cursorX += (mouseX - cursorX) * speed;
        cursorY += (mouseY - cursorY) * speed;

        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';

        cursorOutline.style.left = cursorX + 'px';
        cursorOutline.style.top = cursorY + 'px';

        requestAnimationFrame(animate);
    }

    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
