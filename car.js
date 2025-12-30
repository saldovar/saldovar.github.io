import * as THREE from 'three';

export class Car {
    constructor(scene) {
        this.group = new THREE.Group();
        
        // Carrocería simple
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(2, 1, 4),
            new THREE.MeshStandardMaterial({ color: 0xff0000 })
        );
        body.position.y = 0.5;
        this.group.add(body);

        // Techo
        const roof = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 0.8, 2),
            new THREE.MeshStandardMaterial({ color: 0xffffff })
        );
        roof.position.y = 1.3;
        this.group.add(roof);

        scene.add(this.group);

        this.speed = 0;
        this.maxSpeed = 1.5;
        this.acceleration = 0.01;
        this.friction = 0.96;
        this.rotationSpeed = 0.04;
    }

    update(keys) {
        // Controles de aceleración
        if (keys.up) this.speed += this.acceleration;
        if (keys.down) this.speed -= this.acceleration;

        this.speed *= this.friction;

        // Movimiento básico
        this.group.translateZ(this.speed);

        // Rotación
        if (Math.abs(this.speed) > 0.01) {
            const dir = this.speed > 0 ? 1 : -1;
            if (keys.left) this.group.rotation.y += this.rotationSpeed * dir;
            if (keys.right) this.group.rotation.y -= this.rotationSpeed * dir;
        }
    }
}

