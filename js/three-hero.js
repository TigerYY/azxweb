// Three.js 3D Hero - Tesla Style Power Grid IoT Network
(function() {
    'use strict';

    // 检查设备类型
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
        // 移动端不加载 Three.js，使用 CSS 渐变背景
        console.log('Mobile device detected - Three.js disabled for performance');
        return;
    }

    const container = document.getElementById('three-hero-container');
    if (!container || typeof THREE === 'undefined') return;

    // 场景设置
    let scene, camera, renderer, particles, lines;
    let mouse = { x: 0, y: 0 };
    let targetMouse = { x: 0, y: 0 };
    const particleCount = 80;
    const particleData = [];

    function init() {
        // 创建场景
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.0008);

        // 创建相机
        camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            1,
            3000
        );
        camera.position.z = 500;

        // 创建渲染器
        renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true 
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // 创建粒子系统
        createParticles();
        
        // 创建连线
        createLines();

        // 事件监听
        window.addEventListener('resize', onWindowResize);
        document.addEventListener('mousemove', onMouseMove);

        // 开始动画
        animate();
    }

    function createParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const sizes = [];

        // 生成粒子位置和数据
        for (let i = 0; i < particleCount; i++) {
            const x = (Math.random() - 0.5) * 1000;
            const y = (Math.random() - 0.5) * 1000;
            const z = (Math.random() - 0.5) * 1000;

            positions.push(x, y, z);

            // 颜色 - 青色到蓝色渐变
            const color = new THREE.Color();
            color.setHSL(Math.random() * 0.1 + 0.5, 1, 0.7);
            colors.push(color.r, color.g, color.b);

            // 大小
            sizes.push(Math.random() * 3 + 2);

            // 存储粒子数据
            particleData.push({
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.5,
                    (Math.random() - 0.5) * 0.5,
                    (Math.random() - 0.5) * 0.5
                ),
                position: new THREE.Vector3(x, y, z),
                connections: []
            });
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        // 粒子材质
        const material = new THREE.PointsMaterial({
            size: 8,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });

        particles = new THREE.Points(geometry, material);
        scene.add(particles);
    }

    function createLines() {
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.LineBasicMaterial({
            color: 0x64ffda,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending
        });

        lines = new THREE.LineSegments(geometry, material);
        scene.add(lines);
    }

    function updateLines() {
        const positions = [];
        const maxDistance = 200;

        // 重置连接
        particleData.forEach(p => p.connections = []);

        // 检测粒子间的距离并创建连线
        for (let i = 0; i < particleCount; i++) {
            const particleI = particleData[i];

            for (let j = i + 1; j < particleCount; j++) {
                const particleJ = particleData[j];
                const distance = particleI.position.distanceTo(particleJ.position);

                if (distance < maxDistance) {
                    particleI.connections.push(particleJ);
                    
                    positions.push(
                        particleI.position.x,
                        particleI.position.y,
                        particleI.position.z
                    );
                    positions.push(
                        particleJ.position.x,
                        particleJ.position.y,
                        particleJ.position.z
                    );
                }
            }
        }

        lines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        lines.geometry.attributes.position.needsUpdate = true;
    }

    function onMouseMove(event) {
        targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    function onWindowResize() {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

    function animate() {
        requestAnimationFrame(animate);

        // 平滑鼠标移动
        mouse.x += (targetMouse.x - mouse.x) * 0.05;
        mouse.y += (targetMouse.y - mouse.y) * 0.05;

        // 相机跟随鼠标
        camera.position.x += (mouse.x * 50 - camera.position.x) * 0.05;
        camera.position.y += (mouse.y * 50 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        // 更新粒子位置
        const positions = particles.geometry.attributes.position.array;
        const bounds = 500;

        for (let i = 0; i < particleCount; i++) {
            const particle = particleData[i];
            
            // 更新位置
            particle.position.add(particle.velocity);

            // 边界检测
            if (Math.abs(particle.position.x) > bounds) {
                particle.velocity.x = -particle.velocity.x;
            }
            if (Math.abs(particle.position.y) > bounds) {
                particle.velocity.y = -particle.velocity.y;
            }
            if (Math.abs(particle.position.z) > bounds) {
                particle.velocity.z = -particle.velocity.z;
            }

            // 更新几何体位置
            positions[i * 3] = particle.position.x;
            positions[i * 3 + 1] = particle.position.y;
            positions[i * 3 + 2] = particle.position.z;
        }

        particles.geometry.attributes.position.needsUpdate = true;

        // 更新连线
        updateLines();

        // 整体旋转
        particles.rotation.y += 0.0002;
        lines.rotation.y += 0.0002;

        renderer.render(scene, camera);
    }

    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
