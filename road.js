import * as THREE from 'three';

export class Road {
    constructor(scene) {
        this.scene = scene;
        this.width = 10;
        this.length = 10000; // Longitud total
        this.curve = this.createCurve();
        this.createMesh();
    }

    createCurve() {
        const points = [];
        for (let i = 0; i < 200; i++) {
            points.push(new THREE.Vector3(
                Math.sin(i * 0.2) * 20, // Curvas laterales
                Math.cos(i * 0.1) * 5,  // Subidas y bajadas
                i * 50                  // Avance constante
            ));
        }
        return new THREE.CatmullRomCurve3(points);
    }

    createMesh() {
        // Creamos una cinta plana siguiendo la curva
        const segments = 400;
        const geometry = new THREE.PlaneGeometry(this.width, this.length, 1, segments);
        
        // Modificamos los vértices del plano para que sigan la curva
        const pos = geometry.attributes.position;
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const point = this.curve.getPointAt(t);
            const tangent = this.curve.getTangentAt(t);
            const normal = new THREE.Vector3(0, 1, 0).cross(tangent).normalize();

            // Vértice izquierdo
            pos.setXYZ(i * 2, point.x + normal.x * (this.width/2), point.y, point.z + normal.z * (this.width/2));
            // Vértice derecho
            pos.setXYZ(i * 2 + 1, point.x - normal.x * (this.width/2), point.y, point.z - normal.z * (this.width/2));
        }

        const material = new THREE.MeshStandardMaterial({ 
            color: 0x333333, 
            side: THREE.DoubleSide,
            flatShading: true 
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.y = Math.PI; // Corregir orientación
        this.scene.add(this.mesh);

        // Línea central amarilla
        const lineGeom = new THREE.PlaneGeometry(0.4, this.length, 1, segments);
        const linePos = lineGeom.attributes.position;
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const point = this.curve.getPointAt(t);
            linePos.setXYZ(i * 2, point.x, point.y + 0.1, point.z);
            linePos.setXYZ(i * 2 + 1, point.x, point.y + 0.1, point.z);
        }
        const lineMat = new THREE.MeshStandardMaterial({ color: 0xffff00 });
        const lineMesh = new THREE.Mesh(lineGeom, lineMat);
        this.scene.add(lineMesh);
    }
}
