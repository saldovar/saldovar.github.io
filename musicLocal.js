const localAudioElement = new Audio();
localAudioElement.loop = true;

function handleLocalFile(e) {
    const file = e.target.files[0];
    if (file) {
        localAudioElement.src = URL.createObjectURL(file);
        localAudioElement.play();
    }
}
