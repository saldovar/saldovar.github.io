import * as THREE from 'three';

export class Road {
    constructor(scene) {
        this.scene = scene;
        this.points = [];
        this.curve = null;
        this.width = 10;
        this.segments = 200;
        
        this.generatePoints();
        this.createMesh();
    }

    generatePoints() {
        // Generamos puntos determinísticos usando Seno para curvas suaves y elevación
        for (let i = 0; i < 100; i++) {
            const z = i * 50; // Avanza cada 50 unidades
            const x = Math.sin(i * 0.3) * 20; // Curvas laterales suaves
            const y = Math.cos(i * 0.2) * 5;  // Elevaciones suaves
            this.points.push(new THREE.Vector3(x, y, z));
        }
        this.curve = new THREE.CatmullRomCurve3(this.points);
    }

    createMesh() {
        // TubeGeometry sigue la curva perfectamente
        const geometry = new THREE.TubeGeometry(this.curve, this.segments, this.width / 2, 8, false);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x333333, 
            flatShading: true 
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        // Línea central
        const lineGeom = new THREE.TubeGeometry(this.curve, this.segments, 0.2, 4, false);
        const lineMat = new THREE.MeshStandardMaterial({ color: 0xffff00 });
        const lineMesh = new THREE.Mesh(lineGeom, lineMat);
        lineMesh.position.y += 0.1; 
        this.scene.add(lineMesh);
    }

    // Retorna la posición y dirección en un punto T (0 a 1)
    getPointAt(t) {
        return this.curve.getPointAt(t % 1);
    }
}

