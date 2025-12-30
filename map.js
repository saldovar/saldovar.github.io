class MapGenerator {
    constructor() {
        this.seed = 1234;
        this.tileSize = 120; // Tamaño de cada celda
        this.colors = { 
            ROAD: '#333333', 
            GRASS: '#2d5a27', 
            DIRT: '#6b4f31', 
            WATER: '#1a4e66' 
        };
    }

    setSeed(val) { this.seed = parseInt(val) || 1234; }

    // Generador de ruido simple para coherencia
    noise(x, y) {
        let n = Math.sin(x * 0.12 + y * 0.08 + this.seed) + 
                Math.sin(x * 0.05 - y * 0.15 + this.seed);
        return (n + 2) / 4; 
    }

    getTileAt(worldX, worldY) {
        const gridX = Math.floor(worldX / this.tileSize);
        const gridY = Math.floor(worldY / this.tileSize);
        const val = this.noise(gridX, gridY);

        // Definición de biomas por rangos
        if (val > 0.46 && val < 0.54) return { type: 'ROAD', color: this.colors.ROAD, speedMult: 1.3 };
        if (val < 0.20) return { type: 'WATER', color: this.colors.WATER, speedMult: 0.2 };
        if (val < 0.38) return { type: 'DIRT', color: this.colors.DIRT, speedMult: 0.8 };
        return { type: 'GRASS', color: this.colors.GRASS, speedMult: 0.6 };
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
                    Math.floor(x * this.tileSize - camera.x), 
                    Math.floor(y * this.tileSize - camera.y), 
                    this.tileSize + 1, this.tileSize + 1
                );
            }
        }
    }
}

