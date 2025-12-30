class Car {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.angle = 0;
        this.speed = 0;
        this.maxSpeed = 8;
        this.accel = 0.2;
        this.friction = 0.98;
        this.turnSpeed = 0.05;
        this.width = 40;
        this.height = 20;
        
        this.controls = { up: false, down: false, left: false, right: false };
    }

    update(map) {
        const tile = map.getTileAt(this.x, this.y);
        const currentMaxSpeed = this.maxSpeed * (tile.speedMult || 0.1);

        // Aceleración
        if (this.controls.up) this.speed += this.accel;
        if (this.controls.down) this.speed -= this.accel;

        // Fricción e Inercia
        this.speed *= this.friction;

        // Rotación suave basada en velocidad
        if (Math.abs(this.speed) > 0.1) {
            const dir = this.speed > 0 ? 1 : -1;
            if (this.controls.left) this.angle -= this.turnSpeed * (this.speed / 5) * dir;
            if (this.controls.right) this.angle += this.turnSpeed * (this.speed / 5) * dir;
        }

        // Límites
        if (this.speed > currentMaxSpeed) this.speed = currentMaxSpeed;
        if (this.speed < -currentMaxSpeed / 2) this.speed = -currentMaxSpeed / 2;

        // Movimiento
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }

    draw(ctx, camera) {
        ctx.save();
        ctx.translate(this.x - camera.x, this.y - camera.y);
        ctx.rotate(this.angle);
        
        // Cuerpo del auto
        ctx.fillStyle = "#ff3300";
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        // Luces (delantera)
        ctx.fillStyle = "yellow";
        ctx.fillRect(this.width/2 - 5, -this.height/2, 5, 5);
        ctx.fillRect(this.width/2 - 5, this.height/2 - 5, 5, 5);
        
        ctx.restore();
    }
}
