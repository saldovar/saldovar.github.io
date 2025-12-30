class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.lerp = 0.1; // Suavizado
    }

    follow(targetX, targetY, width, height) {
        const centerX = targetX - width / 2;
        const centerY = targetY - height / 2;
        
        this.x += (centerX - this.x) * this.lerp;
        this.y += (centerY - this.y) * this.lerp;
    }
}
