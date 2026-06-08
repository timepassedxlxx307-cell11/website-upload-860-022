(function () {
    var currentHero = 0;
    var heroTimer = null;

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function setupMenu() {
        var button = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var isOpen = panel.hasAttribute('hidden') === false;
            if (isOpen) {
                panel.setAttribute('hidden', '');
                document.body.classList.remove('menu-open');
                button.setAttribute('aria-expanded', 'false');
            } else {
                panel.removeAttribute('hidden');
                document.body.classList.add('menu-open');
                button.setAttribute('aria-expanded', 'true');
            }
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var previous = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        if (slides.length === 0) {
            return;
        }

        function activate(index) {
            currentHero = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === currentHero);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === currentHero);
            });
        }

        function restart() {
            window.clearInterval(heroTimer);
            heroTimer = window.setInterval(function () {
                activate(currentHero + 1);
            }, 6200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                activate(index);
                restart();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                activate(currentHero - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                activate(currentHero + 1);
                restart();
            });
        }

        activate(0);
        restart();
    }

    function setupFilters() {
        var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.site-search'));
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
        var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
        var url = new URL(window.location.href);
        var initialQuery = url.searchParams.get('q') || '';

        function activeFilter() {
            var active = document.querySelector('.filter-chip.is-active');
            return active ? normalize(active.getAttribute('data-filter-value')) : 'all';
        }

        function applyFilter() {
            var query = normalize(searchInputs.length ? searchInputs[0].value : '');
            var filter = activeFilter();
            scopes.forEach(function (scope) {
                var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search'));
                    var facet = normalize([
                        card.getAttribute('data-year'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-genre')
                    ].join(' '));
                    var queryMatches = !query || text.indexOf(query) !== -1;
                    var filterMatches = filter === 'all' || text.indexOf(filter) !== -1 || facet.indexOf(filter) !== -1;
                    var shouldShow = queryMatches && filterMatches;
                    card.hidden = !shouldShow;
                    if (shouldShow) {
                        visible += 1;
                    }
                });
                var counter = document.querySelector('.result-count');
                if (counter) {
                    counter.textContent = '当前显示 ' + visible + ' 部影片';
                }
                var empty = document.querySelector('.empty-state');
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            });
        }

        searchInputs.forEach(function (input) {
            if (initialQuery) {
                input.value = initialQuery;
            }
            input.addEventListener('input', function () {
                searchInputs.forEach(function (other) {
                    if (other !== input) {
                        other.value = input.value;
                    }
                });
                applyFilter();
            });
            input.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' && scopes.length === 0) {
                    var query = input.value.trim();
                    if (query) {
                        window.location.href = './movies.html?q=' + encodeURIComponent(query);
                    }
                }
            });
        });

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (item) {
                    item.classList.remove('is-active');
                });
                chip.classList.add('is-active');
                applyFilter();
            });
        });

        applyFilter();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.player-card'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('.play-overlay');
            var source = player.getAttribute('data-hls');
            var attached = false;
            var hls = null;

            if (!video || !source) {
                return;
            }

            function attachSource() {
                if (attached) {
                    return true;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    attached = true;
                    return true;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    attached = true;
                    return true;
                }
                return false;
            }

            function playNow() {
                if (attachSource()) {
                    player.classList.add('is-playing');
                    var promise = video.play();
                    if (promise && promise.catch) {
                        promise.catch(function () {});
                    }
                } else {
                    window.addEventListener('hls-ready', function () {
                        attachSource();
                        player.classList.add('is-playing');
                        var promise = video.play();
                        if (promise && promise.catch) {
                            promise.catch(function () {});
                        }
                    }, { once: true });
                }
            }

            if (button) {
                button.addEventListener('click', playNow);
            }

            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });

            video.addEventListener('pause', function () {
                if (!video.currentTime) {
                    player.classList.remove('is-playing');
                }
            });

            window.addEventListener('beforeunload', function () {
                if (hls && hls.destroy) {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
