// 性能优化和监控 - Tesla Style
(function() {
    'use strict';

    function init() {
        // 图片懒加载增强
        enhanceLazyLoading();
        
        // 代码分割 - 条件加载
        conditionalLoading();
        
        // 性能监控
        performanceMonitoring();
        
        // 优化动画性能
        optimizeAnimations();
    }

    // 增强懒加载
    function enhanceLazyLoading() {
        // 为没有 loading 属性的图片添加
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
            // 跳过 Hero 区域的重要图片
            if (!img.closest('.hero')) {
                img.loading = 'lazy';
            }
        });

        // IntersectionObserver 实现渐进加载
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.style.opacity = '0';
                        img.style.transition = 'opacity 0.5s ease';
                        
                        if (img.complete) {
                            img.style.opacity = '1';
                        } else {
                            img.addEventListener('load', () => {
                                img.style.opacity = '1';
                            });
                        }
                        
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px'
            });

            document.querySelectorAll('img[loading="lazy"]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    // 条件加载
    function conditionalLoading() {
        // Three.js 场景仅在可见时初始化（已在 three-hero.js 中处理）
        
        // Chart.js 延迟加载
        const chartCanvas = document.getElementById('capabilityRadar');
        if (chartCanvas && typeof Chart === 'undefined') {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        loadChartJS();
                        observer.disconnect();
                    }
                });
            }, {
                rootMargin: '200px'
            });
            
            observer.observe(chartCanvas);
        }
    }

    function loadChartJS() {
        // Chart.js 已在 HTML 中加载，这里仅作示例
        console.log('Chart.js ready for use');
    }

    // 性能监控
    function performanceMonitoring() {
        if ('performance' in window && 'PerformanceObserver' in window) {
            // 监控 FCP (First Contentful Paint)
            try {
                const perfObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.name === 'first-contentful-paint') {
                            console.log('FCP:', entry.startTime.toFixed(2), 'ms');
                        }
                    }
                });
                perfObserver.observe({ entryTypes: ['paint'] });
            } catch (e) {
                // 浏览器不支持
            }

            // 监控长任务
            try {
                const longTaskObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 50) {
                            console.warn('Long task detected:', entry.duration.toFixed(2), 'ms');
                        }
                    }
                });
                longTaskObserver.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // 浏览器不支持
            }
        }

        // 页面加载完成后输出性能指标
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (window.performance && window.performance.timing) {
                    const perfData = window.performance.timing;
                    const loadTime = perfData.loadEventEnd - perfData.navigationStart;
                    const domReady = perfData.domContentLoadedEventEnd - perfData.navigationStart;
                    
                    console.log('Page Load Time:', (loadTime / 1000).toFixed(2), 's');
                    console.log('DOM Ready:', (domReady / 1000).toFixed(2), 's');
                }
            }, 0);
        });
    }

    // 优化动画性能
    function optimizeAnimations() {
        // 为动画元素添加 will-change
        const animatedElements = document.querySelectorAll(
            '.hero-content, .feature-card, .product-card, .solution-card, .number-card'
        );

        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 即将进入视口，启用 will-change
                    entry.target.style.willChange = 'transform, opacity';
                } else {
                    // 离开视口，移除 will-change 以节省内存
                    entry.target.style.willChange = 'auto';
                }
            });
        }, {
            rootMargin: '100px'
        });

        animatedElements.forEach(el => {
            animationObserver.observe(el);
        });

        // 检测并优化动画帧率
        let lastTime = performance.now();
        let frames = 0;
        let fps = 60;

        function measureFPS() {
            frames++;
            const currentTime = performance.now();
            
            if (currentTime >= lastTime + 1000) {
                fps = Math.round((frames * 1000) / (currentTime - lastTime));
                frames = 0;
                lastTime = currentTime;
                
                // 如果 FPS 低于 30，降低动画复杂度
                if (fps < 30) {
                    document.body.classList.add('low-performance');
                }
            }
            
            requestAnimationFrame(measureFPS);
        }

        // 仅在开发环境监控 FPS
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            requestAnimationFrame(measureFPS);
        }
    }

    // 节流函数
    function throttle(func, wait) {
        let timeout;
        let previous = 0;
        
        return function executedFunction(...args) {
            const now = Date.now();
            const remaining = wait - (now - previous);
            
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                func.apply(this, args);
            } else if (!timeout) {
                timeout = setTimeout(() => {
                    previous = Date.now();
                    timeout = null;
                    func.apply(this, args);
                }, remaining);
            }
        };
    }

    // 防抖函数
    function debounce(func, wait) {
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

    // 全局导出节流和防抖函数
    window.performanceUtils = {
        throttle,
        debounce
    };

    // 预加载关键资源
    function preloadCriticalResources() {
        // 预加载字体
        const fonts = [
            'Inter',
            'JetBrains Mono'
        ];

        fonts.forEach(font => {
            if (document.fonts && document.fonts.load) {
                document.fonts.load(`1em ${font}`).catch(() => {
                    // 字体加载失败，使用回退字体
                });
            }
        });

        // 预连接到 CDN
        const preconnectLinks = [
            'https://cdnjs.cloudflare.com',
            'https://cdn.jsdelivr.net'
        ];

        preconnectLinks.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = url;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }

    // 内存泄漏检测（开发环境）
    function detectMemoryLeaks() {
        if (performance.memory && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            setInterval(() => {
                const used = performance.memory.usedJSHeapSize / 1048576;
                const limit = performance.memory.jsHeapSizeLimit / 1048576;
                const percent = (used / limit * 100).toFixed(2);
                
                if (percent > 80) {
                    console.warn('High memory usage detected:', used.toFixed(2), 'MB /', limit.toFixed(2), 'MB');
                }
            }, 30000); // 每 30 秒检查一次
        }
    }

    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init();
            preloadCriticalResources();
            detectMemoryLeaks();
        });
    } else {
        init();
        preloadCriticalResources();
        detectMemoryLeaks();
    }

})();
