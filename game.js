const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const speedText = document.getElementById('speed-val');

const car = new Car();
const map = new MapGenerator();
const camera = new Camera();
const decoration = new WorldDecoration(map);
const particles = new ParticleSystem();

function init() {
    window.addEventListener('resize', resize);
    resize();
    UI.init(car, map);
    
    window.addEventListener('keydown', (e) => handleKey(e, true));
    window.addEventListener('keyup', (e) => handleKey(e, false));

    requestAnimationFrame(loop);
}

function handleKey(e, isPressed) {
    const key = e.key.toLowerCase();
    if (key === 'w') car.controls.up = isPressed;
    if (key === 's') car.controls.down = isPressed;
    if (key === 'a') car.controls.left = isPressed;
    if (key === 'd') car.controls.right = isPressed;
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function loop() {
    // 1. Actualización
    car.update(map);
    camera.follow(car.x, car.y, canvas.width, canvas.height);

    // Lógica de partículas: si el auto se mueve en tierra o gira rápido
    const currentTile = map.getTileAt(car.x, car.y);
    if (Math.abs(car.speed) > 2) {
        if (currentTile.type === 'DIRT' || currentTile.type === 'GRASS') {
            particles.emit(car.x, car.y, currentTile.type === 'DIRT' ? '#8b5a2b' : '#3e5e3e');
        }
    }

    // 2. Dibujado (EL ORDEN IMPORTA)
    ctx.fillStyle = "#111"; // Fondo por si falla algo
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    map.draw(ctx, camera, canvas.width, canvas.height);
    particles.draw(ctx, camera);
    decoration.draw(ctx, camera, canvas.width, canvas.height);
    car.draw(ctx, camera);

    speedText.innerText = Math.abs(Math.round(car.speed * 20));
    requestAnimationFrame(loop);
}

init();

