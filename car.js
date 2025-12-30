import * as THREE from 'three';

export class Car {
    // Dentro de la clase Car en car.js
adjustToRoad(road) {
    // Calculamos en qué punto de la carretera estamos según la Z del auto
    // 0.0001 es un factor de escala basado en la longitud total (200 puntos * 40 dist = 8000)
    const t = (this.group.position.z / 8000) % 1; 
    if (t >= 0 && t <= 1) {
        const roadPoint = road.curve.getPointAt(t);
        // Suavizamos el movimiento vertical
        this.group.position.y = THREE.MathUtils.lerp(this.group.position.y, roadPoint.y + 0.5, 0.1);
        
        // Opcional: Que el auto se incline según la curva
        const tangent = road.curve.getTangentAt(t);
        const targetRotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1), tangent);
        this.group.quaternion.slerp(targetRotation, 0.1);
    }
}
    
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

