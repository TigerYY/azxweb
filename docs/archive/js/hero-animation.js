// 电网物联网Hero区域动画
(function() {
    'use strict';

    const hero = document.querySelector('.hero');
    if (!hero) return;

    // 创建动画容器
    const animationContainer = document.createElement('div');
    animationContainer.className = 'hero-animation';
    hero.appendChild(animationContainer);

    // 创建SVG画布
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'hero-svg');
    svg.setAttribute('viewBox', '0 0 1200 800');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    animationContainer.appendChild(svg);

    // 定义节点和连接
    const nodes = [
        { id: 1, x: 200, y: 150, type: 'power' },
        { id: 2, x: 400, y: 200, type: 'sensor' },
        { id: 3, x: 600, y: 150, type: 'power' },
        { id: 4, x: 800, y: 200, type: 'sensor' },
        { id: 5, x: 1000, y: 150, type: 'power' },
        { id: 6, x: 300, y: 400, type: 'hub' },
        { id: 7, x: 600, y: 400, type: 'hub' },
        { id: 8, x: 900, y: 400, type: 'hub' },
        { id: 9, x: 200, y: 600, type: 'device' },
        { id: 10, x: 500, y: 600, type: 'device' },
        { id: 11, x: 800, y: 600, type: 'device' },
        { id: 12, x: 1000, y: 600, type: 'device' }
    ];

    const connections = [
        { from: 1, to: 2 },
        { from: 2, to: 3 },
        { from: 3, to: 4 },
        { from: 4, to: 5 },
        { from: 1, to: 6 },
        { from: 3, to: 7 },
        { from: 5, to: 8 },
        { from: 6, to: 9 },
        { from: 6, to: 10 },
        { from: 7, to: 10 },
        { from: 7, to: 11 },
        { from: 8, to: 11 },
        { from: 8, to: 12 }
    ];

    // 创建连接线
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.appendChild(defs);

    // 创建渐变定义
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'lineGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '0%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#00d4ff');
    stop1.setAttribute('stop-opacity', '0');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '50%');
    stop2.setAttribute('stop-color', '#00d4ff');
    stop2.setAttribute('stop-opacity', '1');
    
    const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop3.setAttribute('offset', '100%');
    stop3.setAttribute('stop-color', '#00d4ff');
    stop3.setAttribute('stop-opacity', '0');
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    gradient.appendChild(stop3);
    defs.appendChild(gradient);

    // 创建连接线组
    const linesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    linesGroup.setAttribute('class', 'connection-lines');
    svg.appendChild(linesGroup);

    // 绘制连接线
    connections.forEach((conn, index) => {
        const fromNode = nodes.find(n => n.id === conn.from);
        const toNode = nodes.find(n => n.id === conn.to);
        
        if (!fromNode || !toNode) return;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', fromNode.x);
        line.setAttribute('y1', fromNode.y);
        line.setAttribute('x2', toNode.x);
        line.setAttribute('y2', toNode.y);
        line.setAttribute('stroke', 'url(#lineGradient)');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('opacity', '0.3');
        line.setAttribute('class', 'connection-line');
        
        // 添加动画
        const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animate.setAttribute('attributeName', 'stroke-dashoffset');
        animate.setAttribute('values', '1000;0');
        animate.setAttribute('dur', '3s');
        animate.setAttribute('repeatCount', 'indefinite');
        animate.setAttribute('begin', (index * 0.2) + 's');
        
        line.setAttribute('stroke-dasharray', '1000');
        line.setAttribute('stroke-dashoffset', '1000');
        line.appendChild(animate);
        
        linesGroup.appendChild(line);
    });

    // 创建节点组
    const nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    nodesGroup.setAttribute('class', 'network-nodes');
    svg.appendChild(nodesGroup);

    // 绘制节点
    nodes.forEach((node, index) => {
        const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        nodeGroup.setAttribute('class', `node node-${node.type}`);
        nodeGroup.setAttribute('transform', `translate(${node.x}, ${node.y})`);

        // 外圈光晕
        const outerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        outerCircle.setAttribute('r', '15');
        outerCircle.setAttribute('fill', 'none');
        outerCircle.setAttribute('stroke', '#00d4ff');
        outerCircle.setAttribute('stroke-width', '2');
        outerCircle.setAttribute('opacity', '0.5');
        
        const pulseAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        pulseAnim.setAttribute('attributeName', 'r');
        pulseAnim.setAttribute('values', '15;25;15');
        pulseAnim.setAttribute('dur', '2s');
        pulseAnim.setAttribute('repeatCount', 'indefinite');
        pulseAnim.setAttribute('begin', (index * 0.15) + 's');
        outerCircle.appendChild(pulseAnim);
        
        const opacityAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        opacityAnim.setAttribute('attributeName', 'opacity');
        opacityAnim.setAttribute('values', '0.5;0;0.5');
        opacityAnim.setAttribute('dur', '2s');
        opacityAnim.setAttribute('repeatCount', 'indefinite');
        opacityAnim.setAttribute('begin', (index * 0.15) + 's');
        outerCircle.appendChild(opacityAnim);
        
        nodeGroup.appendChild(outerCircle);

        // 内圈节点
        const innerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        innerCircle.setAttribute('r', '8');
        innerCircle.setAttribute('fill', '#00d4ff');
        
        const blinkAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        blinkAnim.setAttribute('attributeName', 'opacity');
        blinkAnim.setAttribute('values', '1;0.3;1');
        blinkAnim.setAttribute('dur', '1.5s');
        blinkAnim.setAttribute('repeatCount', 'indefinite');
        blinkAnim.setAttribute('begin', (index * 0.1) + 's');
        innerCircle.appendChild(blinkAnim);
        
        nodeGroup.appendChild(innerCircle);

        // 中心点
        const centerDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        centerDot.setAttribute('r', '3');
        centerDot.setAttribute('fill', '#ffffff');
        nodeGroup.appendChild(centerDot);

        nodesGroup.appendChild(nodeGroup);
    });

    // 创建数据流动画（沿着连接线移动的点）
    connections.forEach((conn, index) => {
        const fromNode = nodes.find(n => n.id === conn.from);
        const toNode = nodes.find(n => n.id === conn.to);
        
        if (!fromNode || !toNode) return;

        // 创建多个数据点，形成流动效果
        for (let i = 0; i < 3; i++) {
            const dataPoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            dataPoint.setAttribute('r', '3');
            dataPoint.setAttribute('fill', '#00d4ff');
            dataPoint.setAttribute('opacity', '0.9');
            dataPoint.setAttribute('class', 'data-point');
            
            // 添加光晕效果
            const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            glow.setAttribute('r', '6');
            glow.setAttribute('fill', '#00d4ff');
            glow.setAttribute('opacity', '0.3');
            
            const glowGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            glowGroup.appendChild(glow);
            glowGroup.appendChild(dataPoint);
            
            const animateMotion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
            animateMotion.setAttribute('dur', '2.5s');
            animateMotion.setAttribute('repeatCount', 'indefinite');
            animateMotion.setAttribute('begin', (index * 0.3 + i * 0.8) + 's');
            
            const mpath = document.createElementNS('http://www.w3.org/2000/svg', 'mpath');
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', `M ${fromNode.x} ${fromNode.y} L ${toNode.x} ${toNode.y}`);
            path.setAttribute('id', `path-${index}-${i}`);
            defs.appendChild(path);
            mpath.setAttribute('href', `#path-${index}-${i}`);
            animateMotion.appendChild(mpath);
            glowGroup.appendChild(animateMotion);
            
            // 添加闪烁动画
            const blinkAnim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            blinkAnim.setAttribute('attributeName', 'opacity');
            blinkAnim.setAttribute('values', '0.9;0.2;0.9');
            blinkAnim.setAttribute('dur', '1s');
            blinkAnim.setAttribute('repeatCount', 'indefinite');
            dataPoint.appendChild(blinkAnim);
            
            svg.appendChild(glowGroup);
        }
    });

    // 响应式调整
    function resizeAnimation() {
        const rect = hero.getBoundingClientRect();
        const scaleX = rect.width / 1200;
        const scaleY = rect.height / 800;
        const scale = Math.max(scaleX, scaleY);
        
        svg.style.transform = `scale(${scale})`;
    }

    window.addEventListener('resize', resizeAnimation);
    resizeAnimation();

    // 添加鼠标交互效果
    nodesGroup.addEventListener('mouseenter', function(e) {
        if (e.target.classList.contains('node')) {
            e.target.style.cursor = 'pointer';
        }
    }, true);

})();

