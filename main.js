import * as THREE from 'three';
import { Road } from './road.js';
import { Car } from './car.js';

let scene, camera, renderer, road, car;
const keys = { up: false, down: false, left: false, right: false };

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 50, 150);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // Iluminación
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 20, 10);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    // Suelo (Terreno simple)
    const groundGeo = new THREE.PlaneGeometry(1000, 1000);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    scene.add(ground);

    road = new Road(scene);
    car = new Car(scene);

    // Posición inicial
    car.group.position.set(0, 0, 0);

    setupControls();
    animate();
}

function setupControls() {
    // Teclado
    window.addEventListener('keydown', (e) => handleKey(e.code, true));
    window.addEventListener('keyup', (e) => handleKey(e.code, false));

    // Touch (Mobile)
    const bindTouch = (id, key) => {
        const el = document.getElementById(id);
        el.addEventListener('touchstart', (e) => { e.preventDefault(); keys[key] = true; });
        el.addEventListener('touchend', () => keys[key] = false);
    };
    bindTouch('btn-up', 'up'); bindTouch('btn-down', 'down');
    bindTouch('btn-left', 'left'); bindTouch('btn-right', 'right');
}

function handleKey(code, isPressed) {
    if (code === 'KeyW' || code === 'ArrowUp') keys.up = isPressed;
    if (code === 'KeyS' || code === 'ArrowDown') keys.down = isPressed;
    if (code === 'KeyA' || code === 'ArrowLeft') keys.left = isPressed;
    if (code === 'KeyD' || code === 'ArrowRight') keys.right = isPressed;
}

function animate() {
    requestAnimationFrame(animate);

    car.update(keys, road); // Pasamos road aquí

    // Seguimiento de cámara mejorado
    const camOffset = new THREE.Vector3(0, 6, -15);
    camOffset.applyQuaternion(car.group.quaternion);
    const targetCamPos = car.group.position.clone().add(camOffset);
    camera.position.lerp(targetCamPos, 0.1);
    camera.lookAt(car.group.position);

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();

