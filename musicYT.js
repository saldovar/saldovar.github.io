let ytPlayer;
function onYouTubeIframeAPIReady() {
    // Se inicializa pero el video es invisible
    ytPlayer = new YT.Player('youtube-player', {
        height: '0', width: '0',
        videoId: '', 
        events: { 'onReady': (event) => console.log("YT Ready") }
    });
}

function loadYTVideo(url) {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
    if (ytPlayer && videoId) {
        ytPlayer.loadVideoById(videoId);
        ytPlayer.playVideo();
    }
}
