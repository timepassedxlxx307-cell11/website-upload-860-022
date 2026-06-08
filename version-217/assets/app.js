(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function makeCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-frame" href="' + item.url + '" aria-label="' + escapeHtml(item.title) + '">',
      '    <img src="' + item.img + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '    <span class="poster-type">' + escapeHtml(item.type) + '</span>',
      '    <span class="poster-year">' + escapeHtml(item.year) + '</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
      '    <h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
      '    <p>' + escapeHtml(item.oneLine || '') + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  ready(function () {
    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-missing');
      });
    });

    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');
    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', function () {
        mobileMenu.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-carousel-slide]'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-carousel-dot]'));
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

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-carousel-dot')) || 0);
          start();
        });
      });

      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
      show(0);
      start();
    });

    document.querySelectorAll('[data-local-filter]').forEach(function (bar) {
      var section = bar.closest('.content-section');
      var list = section ? section.querySelector('[data-filter-list]') : null;
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];
      var input = bar.querySelector('.local-filter-input');
      var year = bar.querySelector('.local-year-filter');
      var region = bar.querySelector('.local-region-filter');
      var empty = section ? section.querySelector('.filter-empty') : null;

      function apply() {
        var keyword = normalize(input && input.value);
        var yearValue = normalize(year && year.value);
        var regionValue = normalize(region && region.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year')
          ].join(' '));
          var matched = true;
          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) {
            matched = false;
          }
          if (regionValue && normalize(card.getAttribute('data-region')) !== regionValue) {
            matched = false;
          }
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });

    var searchResults = document.querySelector('[data-search-results]');
    var searchInput = document.querySelector('[data-search-input]');
    if (searchResults && window.SITE_SEARCH_ITEMS) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';
      if (searchInput) {
        searchInput.value = query;
      }

      function renderSearch(value) {
        var keyword = normalize(value);
        var items = window.SITE_SEARCH_ITEMS;
        var results = keyword ? items.filter(function (item) {
          return normalize(item.text).indexOf(keyword) !== -1;
        }).slice(0, 96) : items.slice(0, 24);

        searchResults.innerHTML = '<div class="movie-grid compact-grid">' + results.map(makeCard).join('') + '</div>';
        searchResults.querySelectorAll('img').forEach(function (image) {
          image.addEventListener('error', function () {
            image.classList.add('is-missing');
          });
        });
      }

      renderSearch(query);
      if (searchInput) {
        searchInput.addEventListener('input', function () {
          renderSearch(searchInput.value);
        });
      }
    }

    document.querySelectorAll('.player-block').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.player-button');
      var stream = player.getAttribute('data-stream');
      var fallback = player.getAttribute('data-fallback');
      var hls = null;

      function startVideo() {
        if (!video) {
          return;
        }

        if (window.location.protocol === 'file:' && fallback) {
          if (!video.getAttribute('src')) {
            video.setAttribute('src', fallback);
          }
        } else if (window.Hls && window.Hls.isSupported() && stream) {
          if (!hls) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
            hls.loadSource(stream);
            hls.attachMedia(video);
          }
        } else if (video.canPlayType('application/vnd.apple.mpegurl') && stream) {
          if (!video.getAttribute('src')) {
            video.setAttribute('src', stream);
          }
        } else if (fallback) {
          if (!video.getAttribute('src')) {
            video.setAttribute('src', fallback);
          }
        }

        player.classList.add('is-playing');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', startVideo);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            startVideo();
          }
        });
      }
    });
  });
})();
