/**
 * TouchHandler - 处理触摸逻辑
 */
export default class TouchHandler {
    constructor(visualizer, onGestureData) {
        this.visualizer = visualizer;
        this.onGestureData = onGestureData; // 回调发送数据
        
        // 使用专门的触摸层，避免 UI 遮挡
        this.container = document.getElementById('touch-layer') || visualizer.container;

        this.touchStartMap = new Map(); // id -> {startX, startY, startTime}

        this.initEvents();
    }

    initEvents() {
        const el = this.container;
        
        // 触摸事件
        el.addEventListener('touchstart', this.handleStart.bind(this), { passive: false });
        el.addEventListener('touchmove', this.handleMove.bind(this), { passive: false });
        el.addEventListener('touchend', this.handleEnd.bind(this));
        el.addEventListener('touchcancel', this.handleEnd.bind(this));

        // 鼠标事件（用于调试）
        el.addEventListener('mousedown', this.handleMouseStart.bind(this));
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('mouseup', this.handleMouseEnd.bind(this));
    }

    handleStart(e) {
        e.preventDefault();
        // 隐藏提示
        const guide = document.getElementById('guide');
        if(guide) guide.classList.add('hidden');

        // 收集所有触摸点（安全检查）
        const touchPoints = [];
        if (e.touches && e.touches.length > 0) {
            for (let i = 0; i < e.touches.length; i++) {
                const t = e.touches[i];
                if (t) {
                    touchPoints.push({
                        id: t.identifier,
                        x: t.clientX / window.innerWidth,
                        y: t.clientY / window.innerHeight
                    });
                }
            }
        }

        if (!e.changedTouches || e.changedTouches.length === 0) return;
        
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            const x = t.clientX / window.innerWidth;
            const y = t.clientY / window.innerHeight;
            
            this.visualizer.addTouch(t.identifier, x, y);
            
            this.touchStartMap.set(t.identifier, {
                startX: x, startY: y, startTime: Date.now()
            });

            // 🎹 touchstart 时也需要传递完整参数（特别是屏幕键盘需要）
            this.emitGesture(t.identifier, x, y, 'start', { 
                touchPoints,
                intensity: 1.0,      // touchstart 默认强度为 1（按下即触发）
                velocity: 0,         // 刚开始没有速度
                distance: 0,         // 刚开始没有距离
                gesture: 'tap'       // 初始手势为点击
            });
        }
    }

    handleMove(e) {
        e.preventDefault();
        
        // 收集所有当前触摸点的位置（用于多指手势，安全检查）
        const touchPoints = [];
        if (e.touches && e.touches.length > 0) {
            for (let i = 0; i < e.touches.length; i++) {
                const t = e.touches[i];
                if (t) {
                    touchPoints.push({
                        id: t.identifier,
                        x: t.clientX / window.innerWidth,
                        y: t.clientY / window.innerHeight
                    });
                }
            }
        }
        
        if (!e.changedTouches || e.changedTouches.length === 0) return;
        
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            const x = t.clientX / window.innerWidth;
            const y = t.clientY / window.innerHeight;

            this.visualizer.updateTouch(t.identifier, x, y);
            this.processGesture(t.identifier, x, y, touchPoints);
        }
    }

    handleEnd(e) {
        // e.preventDefault(); // 有时会让点击失效
        for (let i = 0; i < e.changedTouches.length; i++) {
            const t = e.changedTouches[i];
            this.visualizer.removeTouch(t.identifier);
            this.touchStartMap.delete(t.identifier);
            
            // 发送结束
            if (this.onGestureData) {
                this.onGestureData({
                    gesture: 'idle',
                    intensity: 0
                });
            }
        }
        
        // 如果没有触摸点了，显示提示
        if (e.touches.length === 0) {
            // setTimeout(() => {
            //     const guide = document.getElementById('guide');
            //     if(guide) guide.classList.remove('hidden');
            // }, 1000);
        }
    }

    // 简单的鼠标模拟
    handleMouseStart(e) {
        this.isMouseDown = true;
        const touchObj = { identifier: 999, clientX: e.clientX, clientY: e.clientY };
        this.handleStart({ 
            preventDefault: () => {}, 
            changedTouches: [touchObj],
            touches: [touchObj]  // ✅ 修复：传递完整的触摸对象数组
        });
    }
    handleMouseMove(e) {
        if (!this.isMouseDown) return;
        const touchObj = { identifier: 999, clientX: e.clientX, clientY: e.clientY };
        this.handleMove({
            preventDefault: () => {}, 
            changedTouches: [touchObj],
            touches: [touchObj]  // ✅ 修复：添加 touches 属性
        });
    }
    handleMouseEnd(e) {
        if (!this.isMouseDown) return;
        this.isMouseDown = false;
        this.handleEnd({
            changedTouches: [{ identifier: 999 }],
            touches: []
        });
    }

    processGesture(id, x, y, touchPoints = []) {
        const start = this.touchStartMap.get(id);
        if (!start) return;

        const dx = (x - start.startX) * window.innerWidth;
        const dy = (y - start.startY) * window.innerHeight;
        
        const dist = Math.sqrt(dx*dx + dy*dy);
        // 归一化强度
        const intensity = Math.min(dist / 300, 1.0);

        // 计算方向角度
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

        // 判断方向
        let gesture = 'unknown';
        const absAngle = Math.abs(angle);
        if (absAngle < 45) gesture = 'swipe_right';
        else if (absAngle > 135) gesture = 'swipe_left';
        else if (angle > 0) gesture = 'swipe_down';
        else gesture = 'swipe_up';

        // 速度粗略估算
        const dt = Date.now() - start.startTime;
        const velocity = dist / Math.max(dt, 1);

        this.emitGesture(id, x, y, 'move', {
            gesture, intensity, velocity, dx, dy, touchPoints
        });
    }

    emitGesture(id, x, y, phase, data = {}) {
        if (this.onGestureData) {
            this.onGestureData({
                phase,
                position: { x, y },
                fingerCount: this.touchStartMap.size,
                touchPoints: data.touchPoints || [],  // 传递触摸点数据
                ...data
            });
        }
    }
}
