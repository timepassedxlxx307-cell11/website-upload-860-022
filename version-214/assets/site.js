(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        document.querySelectorAll('[data-mobile-toggle]').forEach(function (button) {
            button.addEventListener('click', function () {
                var target = document.querySelector(button.getAttribute('data-mobile-toggle'));
                if (target) {
                    target.classList.toggle('is-open');
                }
            });
        });

        document.querySelectorAll('[data-hero]').forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
            var previous = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === index);
                });
            }

            function restart() {
                if (timer) {
                    clearInterval(timer);
                }
                if (slides.length > 1) {
                    timer = setInterval(function () {
                        show(index + 1);
                    }, 5000);
                }
            }

            if (previous) {
                previous.addEventListener('click', function () {
                    show(index - 1);
                    restart();
                });
            }
            if (next) {
                next.addEventListener('click', function () {
                    show(index + 1);
                    restart();
                });
            }
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener('click', function () {
                    show(dotIndex);
                    restart();
                });
            });
            show(0);
            restart();
        });

        var catalog = document.querySelector('[data-catalog]');
        if (catalog) {
            var input = document.querySelector('[data-catalog-search]');
            var cards = Array.prototype.slice.call(catalog.querySelectorAll('[data-card-text]'));
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q') || '';
            if (input) {
                input.value = query;
            }
            function applyFilter() {
                var value = input ? input.value.trim().toLowerCase() : query.toLowerCase();
                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-card-text') || '').toLowerCase();
                    card.classList.toggle('filter-hidden', value && text.indexOf(value) === -1);
                });
            }
            if (input) {
                input.addEventListener('input', applyFilter);
            }
            applyFilter();
        }
    });
})();

function initMoviePlayer(playerId, source) {
    var shell = document.getElementById(playerId);
    if (!shell) {
        return;
    }
    var video = shell.querySelector('video');
    var start = shell.querySelector('[data-player-start]');
    var playToggle = shell.querySelector('[data-player-toggle]');
    var muteToggle = shell.querySelector('[data-player-mute]');
    var fullscreen = shell.querySelector('[data-player-fullscreen]');
    var initialized = false;
    var hls = null;

    function load() {
        if (initialized || !video) {
            return;
        }
        initialized = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function play() {
        load();
        if (start) {
            start.classList.add('is-hidden');
        }
        shell.classList.add('is-playing');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    function toggle() {
        if (!initialized || video.paused) {
            play();
        } else {
            video.pause();
            shell.classList.remove('is-playing');
        }
    }

    if (start) {
        start.addEventListener('click', play);
    }
    if (playToggle) {
        playToggle.addEventListener('click', toggle);
    }
    if (video) {
        video.addEventListener('click', toggle);
        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
            if (start) {
                start.classList.add('is-hidden');
            }
        });
        video.addEventListener('pause', function () {
            shell.classList.remove('is-playing');
        });
    }
    if (muteToggle) {
        muteToggle.addEventListener('click', function () {
            video.muted = !video.muted;
        });
    }
    if (fullscreen) {
        fullscreen.addEventListener('click', function () {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (shell.requestFullscreen) {
                shell.requestFullscreen();
            }
        });
    }

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
