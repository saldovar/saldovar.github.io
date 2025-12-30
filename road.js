import * as THREE from 'three';

export class Road {
    constructor(scene) {
        this.scene = scene;
        this.curve = null;
        this.width = 12; // Ancho de la carretera
        
        this.generateRoad();
    }

    generateRoad() {
        const points = [];
        // Generamos 200 puntos para un viaje largo y suave
        for (let i = 0; i < 200; i++) {
            points.push(new THREE.Vector3(
                Math.sin(i * 0.15) * 15, // Curvas suaves
                Math.cos(i * 0.1) * 3,   // Altibajos suaves
                i * 40                   // Longitud
            ));
        }

        this.curve = new THREE.CatmullRomCurve3(points);

        // Creamos el perfil de la carretera (un rectángulo muy delgado/plano)
        const shape = new THREE.Shape();
        shape.moveTo(-this.width / 2, 0);
        shape.lineTo(this.width / 2, 0);
        shape.lineTo(this.width / 2, 0.2); // Un poco de grosor para que no desaparezca
        shape.lineTo(-this.width / 2, 0.2);
        shape.lineTo(-this.width / 2, 0);

        const extrudeSettings = {
            steps: 400,            // Resolución a lo largo del camino
            bevelEnabled: false,
            extrudePath: this.curve
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        
        // Material de asfalto con texturizado simple
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x222222, 
            roughness: 0.8 
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        // Añadir línea central (segmentada visualmente)
        this.addCenterLine();
    }

    addCenterLine() {
        // Creamos una línea amarilla que sigue el mismo camino un poco más arriba
        const lineShape = new THREE.Shape();
        lineShape.moveTo(-0.2, 0);
        lineShape.lineTo(0.2, 0);
        lineShape.lineTo(0.2, 0.05);
        lineShape.lineTo(-0.2, 0.05);

        const lineGeometry = new THREE.ExtrudeGeometry(lineShape, {
            steps: 400,
            bevelEnabled: false,
            extrudePath: this.curve
        });

        const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
        const lineMesh = new THREE.Mesh(lineGeometry, lineMaterial);
        lineMesh.position.y = 0.25; // Justo encima del asfalto
        this.scene.add(lineMesh);
    }
}
