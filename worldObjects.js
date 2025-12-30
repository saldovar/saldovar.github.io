class WorldDecoration {
    constructor(map) {
        this.map = map;
    }

    draw(ctx, camera, canvas) {
        const startX = Math.floor(camera.x / this.map.tileSize);
        const startY = Math.floor(camera.y / this.map.tileSize);
        // ... (iteración similar al mapa)

        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                const tile = this.map.getTileAt(x * this.map.tileSize, y * this.map.tileSize);
                
                // Solo decorar si no es carretera o agua
                if (tile.type === 'GRASS' || tile.type === 'DIRT') {
                    const localSeed = Math.sin(x * 12.98 + y * 78.23) * 43758;
                    if (localSeed - Math.floor(localSeed) > 0.85) { // 15% de probabilidad
                        this.drawTree(ctx, x * this.map.tileSize + 50 - camera.x, y * this.map.tileSize + 50 - camera.y);
                    }
                }
            }
        }
    }

    drawTree(ctx, x, y) {
        ctx.fillStyle = '#1a3317'; // Sombra del árbol
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
    }
}
