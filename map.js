class MapGenerator {
    constructor() {
        this.seed = 1234;
        this.tileSize = 200; // Tamaño de cada celda en px
        this.types = { GRASS: '#2d5a27', ROAD: '#333', WATER: '#006994' };
    }

    setSeed(val) { this.seed = parseInt(val) || 1234; }

    // Función pseudo-aleatoria determinista
    hash(x, y) {
        let h = Math.sin(x * 12.9898 + y * 78.233 + this.seed) * 43758.5453;
        return h - Math.floor(h);
    }

    getTileAt(worldX, worldY) {
        const gridX = Math.floor(worldX / this.tileSize);
        const gridY = Math.floor(worldY / this.tileSize);
        
        const val = this.hash(gridX, gridY);

        // Lógica simple: 60% grass, 30% road, 10% water
        if (val < 0.1) return { type: 'WATER', color: this.types.WATER, speedMult: 0 };
        if (val < 0.4) return { type: 'ROAD', color: this.types.ROAD, speedMult: 1.2 };
        return { type: 'GRASS', color: this.types.GRASS, speedMult: 0.6 };
    }

    draw(ctx, camera, canvasWidth, canvasHeight) {
        const startX = Math.floor(camera.x / this.tileSize);
        const startY = Math.floor(camera.y / this.tileSize);
        const endX = startX + Math.ceil(canvasWidth / this.tileSize) + 1;
        const endY = startY + Math.ceil(canvasHeight / this.tileSize) + 1;

        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                const tile = this.getTileAt(x * this.tileSize, y * this.tileSize);
                ctx.fillStyle = tile.color;
                ctx.fillRect(
                    x * this.tileSize - camera.x, 
                    y * this.tileSize - camera.y, 
                    this.tileSize + 1, this.tileSize + 1
                );
            }
        }
    }
}
