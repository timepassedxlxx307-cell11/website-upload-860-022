(function () {
    function initMoviePlayer(sourceUrl) {
        var video = document.getElementById("movie-player");
        var cover = document.getElementById("player-cover");
        var status = document.getElementById("player-status");
        var attached = false;
        var hls = null;

        if (!video || !sourceUrl) {
            return;
        }

        function showStatus(text) {
            if (!status) {
                return;
            }
            status.textContent = text;
            status.classList.add("is-visible");
            window.setTimeout(function () {
                status.classList.remove("is-visible");
            }, 1800);
        }

        function attachSource() {
            if (attached) {
                return;
            }
            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal && hls) {
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                            return;
                        }
                    }
                });
                return;
            }

            video.src = sourceUrl;
        }

        function startPlayback() {
            attachSource();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.controls = true;
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    showStatus("点击视频开始播放");
                });
            }
        }

        if (cover) {
            cover.addEventListener("click", startPlayback);
        }

        video.addEventListener("click", function () {
            if (!attached || video.paused) {
                startPlayback();
                return;
            }
            video.pause();
        });

        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
}());
