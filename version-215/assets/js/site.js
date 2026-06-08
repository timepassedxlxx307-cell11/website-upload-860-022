(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function encodeQuery(value) {
        return encodeURIComponent((value || "").trim());
    }

    function setupNavigation() {
        var toggle = document.querySelector(".mobile-menu-toggle");
        var menu = document.querySelector(".mobile-nav");
        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        Array.prototype.forEach.call(document.querySelectorAll('form[action="./search.html"]'), function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector('input[name="q"]');
                if (input && input.value.trim()) {
                    event.preventDefault();
                    window.location.href = "./search.html?q=" + encodeQuery(input.value);
                }
            });
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        if (!slides.length) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        var index = 0;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
            });
        });
        setInterval(function () {
            show(index + 1);
        }, 6200);
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function setupLocalFilter() {
        var input = document.getElementById("local-filter");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".category-list .movie-card"));
        var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
        if (!input || !cards.length) {
            return;
        }
        var activeChip = "";

        function filterCards() {
            var query = normalize(input.value);
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search"));
                var queryMatch = !query || haystack.indexOf(query) !== -1;
                var chipMatch = !activeChip || haystack.indexOf(normalize(activeChip)) !== -1;
                card.classList.toggle("is-filtered-out", !(queryMatch && chipMatch));
            });
        }

        input.addEventListener("input", filterCards);
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                activeChip = chip.getAttribute("data-filter") || "";
                chips.forEach(function (item) {
                    item.classList.toggle("is-active", item === chip);
                });
                filterCards();
            });
        });
    }

    function escapeHtml(value) {
        return (value || "").toString().replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#039;"
            }[char];
        });
    }

    function renderSearchPage() {
        var results = document.getElementById("search-results");
        var title = document.getElementById("search-result-title");
        var input = document.getElementById("search-page-input");
        if (!results || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = normalize(params.get("q") || "");
        if (input) {
            input.value = params.get("q") || "";
        }
        var list = window.SEARCH_INDEX.filter(function (item) {
            if (!query) {
                return true;
            }
            return normalize([
                item.title,
                item.region,
                item.type,
                item.year,
                item.genre,
                item.category,
                item.tags,
                item.oneLine
            ].join(" ")).indexOf(query) !== -1;
        }).slice(0, 240);
        if (title) {
            title.textContent = query ? "搜索结果" : "精选影片";
        }
        if (!list.length) {
            results.innerHTML = '<div class="story-card"><h2>暂无匹配影片</h2><p>可以尝试更换影片名、年份、地区、类型或标签继续搜索。</p></div>';
            return;
        }
        results.innerHTML = list.map(function (item) {
            var tagHtml = (item.tags || []).slice(0, 3).map(function (tag) {
                return "<span>" + escapeHtml(tag) + "</span>";
            }).join("");
            return '<article class="movie-card" data-search="' + escapeHtml([item.title, item.region, item.type, item.year, item.genre, item.category, item.tags.join(" "), item.oneLine].join(" ")) + '">' +
                '<a class="poster-link" href="./' + escapeHtml(item.url) + '" aria-label="观看' + escapeHtml(item.title) + '">' +
                    '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                    '<span class="play-chip">播放</span>' +
                '</a>' +
                '<div class="movie-info">' +
                    '<a class="movie-title" href="./' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a>' +
                    '<div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.year) + '</span></div>' +
                    '<p>' + escapeHtml(item.oneLine) + '</p>' +
                    '<div class="tag-row">' + tagHtml + '</div>' +
                '</div>' +
            '</article>';
        }).join("");
    }

    window.setupPlayer = function (videoId, overlayId, sourceUrl) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        if (!video || !sourceUrl) {
            return;
        }
        var hlsInstance = null;
        var started = false;

        function bindSource() {
            if (started) {
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }

        function play() {
            bindSource();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var playRequest = video.play();
            if (playRequest && typeof playRequest.catch === "function") {
                playRequest.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (!started) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        setupNavigation();
        setupHero();
        setupLocalFilter();
        renderSearchPage();
    });
})();
