(function () {
    var holder = document.querySelector('[data-player]');

    if (!holder) {
        return;
    }

    var video = holder.querySelector('video');
    var startButton = holder.querySelector('[data-player-start]');
    var streamUrl = video ? video.getAttribute('data-url') : '';
    var hls = null;

    function loadStream() {
        if (!video || !streamUrl || video.getAttribute('data-ready') === '1') {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        }

        video.setAttribute('data-ready', '1');
    }

    function playVideo() {
        loadStream();
        holder.classList.add('is-started');
        var result = video.play();
        if (result && typeof result.catch === 'function') {
            result.catch(function () {});
        }
    }

    function toggleVideo() {
        if (!video.getAttribute('data-ready')) {
            playVideo();
            return;
        }
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    }

    if (startButton) {
        startButton.addEventListener('click', playVideo);
    }

    if (video) {
        video.addEventListener('click', toggleVideo);
        video.addEventListener('play', function () {
            holder.classList.add('is-started');
        });
    }

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
})();
