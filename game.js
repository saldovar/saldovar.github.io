const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const speedText = document.getElementById('speed-val');

const car = new Car();
const map = new MapGenerator();
const camera = new Camera();

function init() {
    window.addEventListener('resize', resize);
    resize();
    UI.init(car, map);
    
    // Teclado PC
    window.addEventListener('keydown', (e) => handleKey(e, true));
    window.addEventListener('keyup', (e) => handleKey(e, false));

    requestAnimationFrame(loop);
}

function handleKey(e, isPressed) {
    if (e.key.toLowerCase() === 'w') car.controls.up = isPressed;
    if (e.key.toLowerCase() === 's') car.controls.down = isPressed;
    if (e.key.toLowerCase() === 'a') car.controls.left = isPressed;
    if (e.key.toLowerCase() === 'd') car.controls.right = isPressed;
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    car.update(map);
    camera.follow(car.x, car.y, canvas.width, canvas.height);
    
    map.draw(ctx, camera, canvas.width, canvas.height);
    car.draw(ctx, camera);

    speedText.innerText = Math.abs(Math.round(car.speed * 20));
    
    requestAnimationFrame(loop);
}

init();
