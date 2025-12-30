class Particle {
    constructor() { this.active = false; }
    init(x, y, color) {
        this.x = x; this.y = y; this.color = color;
        this.life = 1.0;
        this.size = Math.random() * 5 + 2;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.active = true;
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        this.life -= 0.02;
        if (this.life <= 0) this.active = false;
    }
}

class ParticleSystem {
    constructor(maxParticles = 100) {
        this.pool = Array.from({length: maxParticles}, () => new Particle());
    }

    emit(x, y, color) {
        const p = this.pool.find(p => !p.active);
        if (p) p.init(x, y, color);
    }

    updateAndDraw(ctx, camera) {
        this.pool.forEach(p => {
            if (p.active) {
                p.update();
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x - camera.x, p.y - camera.y, p.size, p.size);
            }
        });
        ctx.globalAlpha = 1.0;
    }
}
