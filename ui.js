const UI = {
    init(car, map, musicLocal) {
        // Detección Mobile
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile) document.getElementById('mobile-controls').classList.remove('hidden');

        // Inputs
        document.getElementById('seed-input').addEventListener('change', (e) => map.setSeed(e.target.value));
        document.getElementById('btn-load-yt').addEventListener('click', () => {
            const url = document.getElementById('yt-input').value;
            loadYTVideo(url);
        });
        document.getElementById('local-audio').addEventListener('change', handleLocalFile);
        document.getElementById('vol-slider').addEventListener('input', (e) => {
            const v = e.target.value / 100;
            localAudioElement.volume = v;
            if (ytPlayer && ytPlayer.setVolume) ytPlayer.setVolume(e.target.value);
        });

        // Controles Táctiles
        this.setupTouchBtn('btn-up', 'up', car);
        this.setupTouchBtn('btn-down', 'down', car);
        this.setupTouchBtn('btn-left', 'left', car);
        this.setupTouchBtn('btn-right', 'right', car);
    },

    setupTouchBtn(id, key, car) {
        const btn = document.getElementById(id);
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); car.controls[key] = true; });
        btn.addEventListener('touchend', (e) => { e.preventDefault(); car.controls[key] = false; });
    }
};
