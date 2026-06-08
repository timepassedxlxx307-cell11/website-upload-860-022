(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function setHero(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        setHero(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setHero(index);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        setHero(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setHero(current + 1);
        startTimer();
      });
    }

    setHero(0);
    startTimer();
  }

  var filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    var queryInput = filterPanel.querySelector('[data-search-input]');
    var categoryFilter = filterPanel.querySelector('[data-category-filter]');
    var typeFilter = filterPanel.querySelector('[data-type-filter]');
    var resetButton = filterPanel.querySelector('[data-filter-reset]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (queryInput) {
      queryInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function filterCards() {
      var query = normalize(queryInput && queryInput.value);
      var category = normalize(categoryFilter && categoryFilter.value);
      var type = normalize(typeFilter && typeFilter.value);

      cards.forEach(function (card) {
        var content = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.textContent
        ].join(' '));
        var cardCategory = normalize(card.getAttribute('data-category'));
        var cardType = normalize(card.getAttribute('data-type'));
        var matchQuery = !query || content.indexOf(query) !== -1;
        var matchCategory = !category || cardCategory === category;
        var matchType = !type || cardType === type;

        card.classList.toggle('search-hidden', !(matchQuery && matchCategory && matchType));
      });
    }

    [queryInput, categoryFilter, typeFilter].forEach(function (field) {
      if (field) {
        field.addEventListener('input', filterCards);
        field.addEventListener('change', filterCards);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (queryInput) {
          queryInput.value = '';
        }
        if (categoryFilter) {
          categoryFilter.value = '';
        }
        if (typeFilter) {
          typeFilter.value = '';
        }
        filterCards();
      });
    }

    filterCards();
  }

  var player = document.querySelector('[data-player]');

  if (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var videoUrl = video ? video.getAttribute('data-video-url') : '';
    var initialized = false;
    var pendingPlay = false;
    var hlsInstance = null;

    function playVideo() {
      if (!video) {
        return;
      }

      var playRequest = video.play();

      if (playRequest && typeof playRequest.catch === 'function') {
        playRequest.catch(function () {
          if (overlay && video.paused) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    function initializeVideo() {
      if (!video || initialized || !videoUrl) {
        return;
      }

      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (pendingPlay) {
            playVideo();
          }
        });
      } else {
        video.src = videoUrl;
      }
    }

    function activatePlayer() {
      if (!video) {
        return;
      }

      pendingPlay = true;
      initializeVideo();
      video.controls = true;

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      window.setTimeout(playVideo, 80);
    }

    if (overlay) {
      overlay.addEventListener('click', activatePlayer);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          activatePlayer();
        }
      });

      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  }
})();
