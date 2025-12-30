import * as THREE from 'three';

export class Car {
    constructor(scene) {
        this.group = new THREE.Group();
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(2, 1, 4),
            new THREE.MeshStandardMaterial({ color: 0xff0000 })
        );
        body.position.y = 0.5;
        this.group.add(body);
        scene.add(this.group);

        this.velocity = 0;
        this.maxSpeed = 2.5; // Más rápido
        this.accel = 0.05;
        this.friction = 0.98;
    }

    update(keys, road) {
        // Aceleración y freno
        if (keys.up) this.velocity += this.accel;
        if (keys.down) this.velocity -= this.accel;
        this.velocity *= this.friction;

        // Movimiento en Z (avance)
        this.group.position.z += this.velocity;

        // Pegar el auto a la carretera (Y y X)
        // Buscamos el punto en la curva basado en la Z actual
        const roadProgress = this.group.position.z / 10000;
        if (roadProgress >= 0 && roadProgress <= 1) {
            const roadPoint = road.curve.getPointAt(roadProgress);
            const tangent = road.curve.getTangentAt(roadProgress);
            
            // Posicionamos el auto sobre la carretera
            this.group.position.y = roadPoint.y + 0.2;
            
            // Si no estamos girando manualmente, seguimos la curva
            if (!keys.left && !keys.right) {
                this.group.position.x = THREE.MathUtils.lerp(this.group.position.x, roadPoint.x, 0.1);
            }

            // Orientación del auto hacia donde va la carretera
            const targetRotation = new THREE.Quaternion().setFromUnitVectors(
                new THREE.Vector3(0, 0, 1), 
                tangent.normalize()
            );
            this.group.quaternion.slerp(targetRotation, 0.1);
        }

        // Giro manual (opcional, para dar sensación de control)
        if (keys.left) this.group.position.x += 0.5;
        if (keys.right) this.group.position.x -= 0.5;
    }
}
