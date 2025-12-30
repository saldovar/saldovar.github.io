// Simplificación de un generador de ruido para caminos coherentes
class MapGenerator {
    constructor() {
        this.seed = 1234;
        this.tileSize = 100;
        this.colors = { ROAD: '#3b3b3b', GRASS: '#2d5a27', DIRT: '#6b4f31', WATER: '#1a4e66' };
    }

    // Función de ruido suave para coherencia espacial
    noise(x, y) {
        let n = Math.sin(x * 0.1 + this.seed) + Math.sin(y * 0.1 + this.seed);
        return (n + 2) / 4; // Retorna valor entre 0 y 1
    }

    getTileAt(worldX, worldY) {
        const x = Math.floor(worldX / this.tileSize);
        const y = Math.floor(worldY / this.tileSize);
        const val = this.noise(x, y);

        // Lógica de capas:
        // 1. Si el valor está en el "centro" del rango, es carretera (camino continuo)
        if (val > 0.45 && val < 0.55) return { type: 'ROAD', color: this.colors.ROAD, speed: 1.2 };
        
        // 2. Terrenos adyacentes
        if (val < 0.15) return { type: 'WATER', color: this.colors.WATER, speed: 0.1 };
        if (val < 0.35) return { type: 'DIRT', color: this.colors.DIRT, speed: 0.7 };
        
        return { type: 'GRASS', color: this.colors.GRASS, speed: 0.6 };
    }
}

