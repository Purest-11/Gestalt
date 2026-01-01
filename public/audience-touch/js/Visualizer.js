import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

/**
 * Visualizer - 负责所有 Three.js 视觉效果
 * 风格：赛博朋克/科技感，包含发光粒子、能量轨迹、动态网格
 */
export default class Visualizer {
    constructor(container) {
        this.container = container;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        // 场景基础
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x050510, 0.002); // 迷雾效果
        
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
        this.camera.position.z = 50;

        this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false }); // Post-processing 不需要 antialias
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 性能优化
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        this.container.appendChild(this.renderer.domElement);

        // 初始化后期处理 (Bloom 发光)
        this.initPostProcessing();

        // 初始化场景物体
        this.particles = [];
        this.initBackground();
        
        // 交互数据
        this.touchPoints = new Map(); // id -> { mesh, trail, life }

        // 性能优化：限制帧率以降低 CPU 占用（避免 MaxMSP 音频卡顿）
        this.targetFPS = 30; // 30fps 足够流畅，CPU 占用降低 50%
        this.frameInterval = 1000 / this.targetFPS;
        this.lastFrameTime = 0;

        // 监听调整大小
        window.addEventListener('resize', this.onResize.bind(this));

        // 启动动画循环
        this.animate();
    }

    initPostProcessing() {
        const renderScene = new RenderPass(this.scene, this.camera);

        // 泛光效果参数：分辨率, 强度, 半径, 阈值
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(this.width, this.height), 1.5, 0.4, 0.85);
        bloomPass.threshold = 0;
        bloomPass.strength = 2.0; // 发光强度
        bloomPass.radius = 0.5;

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(bloomPass);
    }

    initBackground() {
        // 1. 动态网格地面 (Retro-wave style) - 优化：降低复杂度
        const planeGeometry = new THREE.PlaneGeometry(200, 200, 30, 30); // 从 40x40 降到 30x30
        const planeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ffff, 
            wireframe: true,
            transparent: true,
            opacity: 0.1
        });
        this.gridPlane = new THREE.Mesh(planeGeometry, planeMaterial);
        this.gridPlane.rotation.x = -Math.PI / 2;
        this.gridPlane.position.y = -20;
        this.scene.add(this.gridPlane);

        // 2. 悬浮环境粒子 (Starfield) - 优化：减少粒子数量
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 200; // 从 300 降到 200
        const posArray = new Float32Array(particlesCount * 3);

        for(let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 150;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.5,
            color: 0xffffff,
            transparent: true,
            opacity: 0.5
        });

        this.starField = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.starField);
    }

    /**
     * 处理触摸开始
     * @param {number} id 触摸点唯一ID
     * @param {number} x 归一化坐标 0-1
     * @param {number} y 归一化坐标 0-1
     */
    addTouch(id, x, y) {
        const pos = this.getWorldPosition(x, y);

        // 创建发光球体
        const geometry = new THREE.SphereGeometry(1.5, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.copy(pos);
        this.scene.add(sphere);

        // 记录
        this.touchPoints.set(id, {
            mesh: sphere,
            history: [], // 用于绘制拖尾
            lastPos: pos.clone()
        });

        // 产生爆发粒子
        this.spawnExplosion(pos, 0x00ffff);
    }

    /**
     * 处理触摸移动
     */
    updateTouch(id, x, y) {
        const point = this.touchPoints.get(id);
        if (!point) return;

        const newPos = this.getWorldPosition(x, y);
        
        // 移动球体
        point.mesh.position.lerp(newPos, 0.5); // 平滑插值
        
        // 生成拖尾粒子
        this.spawnTrailParticle(point.mesh.position);

        point.lastPos.copy(newPos);
    }

    /**
     * 处理触摸结束
     */
    removeTouch(id) {
        const point = this.touchPoints.get(id);
        if (!point) return;

        // 移除球体
        this.scene.remove(point.mesh);
        point.mesh.geometry.dispose();
        point.mesh.material.dispose();

        // 爆发消失效果
        this.spawnExplosion(point.mesh.position, 0xbd00ff);

        this.touchPoints.delete(id);
    }

    /**
     * 将屏幕 2D 坐标转换为 3D 世界坐标
     * 我们假设操作平面在 z=0 处
     */
    getWorldPosition(x, y) {
        // x, y 是 0-1
        // 重新校准映射范围
        // 当相机 z=50, fov=75 时，视野高度约为 2 * 50 * tan(75/2) ≈ 76
        // 视野宽度 = 高度 * aspect
        const visibleHeight = 2 * Math.tan((this.camera.fov * Math.PI / 180) / 2) * this.camera.position.z;
        const visibleWidth = visibleHeight * this.camera.aspect;

        const vec = new THREE.Vector3();
        vec.x = (x - 0.5) * visibleWidth; 
        vec.y = -(y - 0.5) * visibleHeight;
        vec.z = 0;
        return vec;
    }

    spawnExplosion(pos, color) {
        // 优化：减少爆炸粒子数量
        for (let i = 0; i < 10; i++) { // 从 15 降到 10
            this.particles.push({
                mesh: this.createParticleMesh(pos, color),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 1,
                    (Math.random() - 0.5) * 1,
                    (Math.random() - 0.5) * 1
                ),
                life: 1.0
            });
        }
    }

    spawnTrailParticle(pos) {
        // 随机颜色：青色到紫色
        const color = Math.random() > 0.5 ? 0x00ffff : 0xbd00ff;
        this.particles.push({
            mesh: this.createParticleMesh(pos, color, 0.5),
            velocity: new THREE.Vector3(0, 0, 0), // 拖尾静止或微动
            life: 0.8, // 寿命短
            decay: 0.05
        });
    }

    createParticleMesh(pos, color, size = 0.8) {
        const geometry = new THREE.BoxGeometry(size, size, size); // 方块更有科技感
        const material = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 1
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(pos);
        // 随机旋转
        mesh.rotation.set(Math.random(), Math.random(), Math.random());
        this.scene.add(mesh);
        return mesh;
    }

    onResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
        this.composer.setSize(this.width, this.height);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        // 性能优化：限制帧率，跳过不必要的帧
        const now = Date.now();
        const elapsed = now - this.lastFrameTime;
        
        if (elapsed < this.frameInterval) {
            return; // 跳过此帧，降低 CPU 占用
        }
        
        this.lastFrameTime = now - (elapsed % this.frameInterval);

        // 1. 动画背景
        // 网格波动
        const time = now * 0.001;
        this.gridPlane.position.z = (time * 5) % 10 - 20; // 产生向前移动的错觉
        this.starField.rotation.y += 0.001;
        this.starField.rotation.x += 0.0005;

        // 2. 更新粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // 运动
            p.mesh.position.add(p.velocity);
            p.mesh.rotation.x += 0.1;
            p.mesh.rotation.y += 0.1;
            
            // 生命衰减
            p.life -= p.decay || 0.02;
            p.mesh.material.opacity = p.life;
            
            // 缩小
            const scale = p.life;
            p.mesh.scale.set(scale, scale, scale);

            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                p.mesh.geometry.dispose();
                p.mesh.material.dispose();
                this.particles.splice(i, 1);
            }
        }

        // 3. 渲染
        this.composer.render();
    }
}
