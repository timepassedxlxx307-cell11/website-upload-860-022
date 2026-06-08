(function () {
  var header = document.querySelector('[data-header]');
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function updateHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuButton && mobileNav && header) {
    menuButton.addEventListener('click', function () {
      var opened = mobileNav.classList.toggle('is-open');
      header.classList.toggle('is-open', opened);
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    restart();
  });

  document.querySelectorAll('[data-rail]').forEach(function (wrap) {
    var rail = wrap.querySelector('.movie-rail');
    var prev = wrap.querySelector('[data-rail-prev]');
    var next = wrap.querySelector('[data-rail-next]');

    function move(direction) {
      if (!rail) {
        return;
      }
      rail.scrollBy({ left: direction * Math.max(260, rail.clientWidth * 0.82), behavior: 'smooth' });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        move(-1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        move(1);
      });
    }
  });

  var pageSearch = document.querySelector('[data-page-search]');
  var searchList = document.querySelector('[data-search-list]');

  function filterCards(value) {
    if (!searchList) {
      return;
    }
    var keyword = String(value || '').trim().toLowerCase();
    var cards = Array.prototype.slice.call(searchList.querySelectorAll('.movie-card'));
    cards.forEach(function (card) {
      var text = String(card.getAttribute('data-search') || '').toLowerCase();
      card.classList.toggle('is-filtered', keyword.length > 0 && text.indexOf(keyword) === -1);
    });
  }

  if (pageSearch) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    pageSearch.value = initial;
    filterCards(initial);
    pageSearch.addEventListener('input', function () {
      filterCards(pageSearch.value);
    });
  }

  function setupPlayer() {
    var player = document.querySelector('[data-video-player]');
    if (!player) {
      return;
    }

    var video = player.querySelector('video');
    var button = player.querySelector('.play-cover');
    var source = player.getAttribute('data-video-src');
    var initialized = false;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (initialized) {
        return Promise.resolve();
      }
      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        return Promise.resolve();
      }

      video.src = source;
      return Promise.resolve();
    }

    function beginPlay() {
      attachSource().then(function () {
        if (button) {
          button.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      });
    }

    if (button) {
      button.addEventListener('click', beginPlay);
    }

    video.addEventListener('click', function () {
      if (!initialized) {
        beginPlay();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (button && video.currentTime === 0) {
        button.classList.remove('is-hidden');
      }
    });
  }

  setupPlayer();
})();
