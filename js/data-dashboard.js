// 数据看板 - 数字动画和雷达图 - Tesla Style
(function() {
    'use strict';

    let chart = null;
    let numbersAnimated = false;

    function init() {
        setupNumberCounters();
        setupRadarChart();
    }

    // 数字计数动画
    function setupNumberCounters() {
        const numberCards = document.querySelectorAll('.number-card');
        
        if (!numberCards.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !numbersAnimated) {
                    numbersAnimated = true;
                    animateNumbers();
                }
            });
        }, {
            threshold: 0.3
        });

        numberCards.forEach(card => observer.observe(card));
    }

    function animateNumbers() {
        const cards = document.querySelectorAll('.number-card');

        cards.forEach((card, index) => {
            const valueEl = card.querySelector('.number-value');
            const target = parseInt(card.dataset.target);
            const duration = 2000;
            const start = 0;
            const startTime = Date.now() + (index * 100);

            function update() {
                const now = Date.now();
                const elapsed = now - startTime;
                
                if (elapsed < 0) {
                    requestAnimationFrame(update);
                    return;
                }

                const progress = Math.min(elapsed / duration, 1);
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const current = Math.floor(start + (target - start) * easeOutQuart);

                valueEl.textContent = current.toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    valueEl.textContent = target.toLocaleString();
                }
            }

            requestAnimationFrame(update);
        });
    }

    // 雷达图
    function setupRadarChart() {
        const canvas = document.getElementById('capabilityRadar');
        if (!canvas || typeof Chart === 'undefined') return;

        const ctx = canvas.getContext('2d');

        // 等待图表容器可见
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !chart) {
                    createRadarChart(ctx);
                    observer.disconnect();
                }
            });
        }, {
            threshold: 0.1
        });

        observer.observe(canvas);
    }

    function createRadarChart(ctx) {
        chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: [
                    '研发能力',
                    '产品质量',
                    '技术创新',
                    '服务质量',
                    '行业经验',
                    '市场口碑'
                ],
                datasets: [{
                    label: '安智信科技',
                    data: [95, 92, 90, 93, 88, 90],
                    fill: true,
                    backgroundColor: 'rgba(100, 255, 218, 0.1)',
                    borderColor: '#64ffda',
                    borderWidth: 3,
                    pointBackgroundColor: '#64ffda',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#64ffda',
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleColor: '#64ffda',
                        bodyColor: '#fff',
                        borderColor: '#64ffda',
                        borderWidth: 1,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return context.parsed.r + ' 分';
                            }
                        }
                    }
                },
                scales: {
                    r: {
                        min: 0,
                        max: 100,
                        beginAtZero: true,
                        ticks: {
                            stepSize: 20,
                            color: '#666666',
                            backdropColor: 'transparent',
                            font: {
                                size: 11
                            },
                            callback: function(value) {
                                return value === 0 ? '' : value;
                            }
                        },
                        grid: {
                            color: 'rgba(100, 255, 218, 0.1)',
                            circular: true
                        },
                        angleLines: {
                            color: 'rgba(100, 255, 218, 0.1)'
                        },
                        pointLabels: {
                            color: '#E5E5E5',
                            font: {
                                size: 14,
                                weight: '600'
                            },
                            padding: 15
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                },
                interaction: {
                    mode: 'nearest',
                    intersect: false
                }
            }
        });

        // 添加动画效果
        animateRadarChart();
    }

    function animateRadarChart() {
        if (!chart) return;

        const originalData = [...chart.data.datasets[0].data];
        chart.data.datasets[0].data = originalData.map(() => 0);
        chart.update();

        setTimeout(() => {
            chart.data.datasets[0].data = originalData;
            chart.update();
        }, 500);
    }

    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 窗口大小改变时重绘图表
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (chart) {
                chart.resize();
            }
        }, 250);
    });

})();
