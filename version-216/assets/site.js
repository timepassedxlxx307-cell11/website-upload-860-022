(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(i);
        start();
      });
    });
    start();
  }

  function setupSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));
    var panel = document.querySelector("[data-search-panel]");
    var list = window.SITE_MOVIES || [];
    if (!inputs.length || !panel || !list.length) {
      return;
    }
    function render(query) {
      var q = query.trim().toLowerCase();
      if (!q) {
        panel.classList.remove("is-open");
        panel.innerHTML = "";
        return;
      }
      var results = list.filter(function (item) {
        return [item.title, item.year, item.region, item.category, item.genre].join(" ").toLowerCase().indexOf(q) !== -1;
      }).slice(0, 10);
      panel.innerHTML = results.map(function (item) {
        return '<a class="search-result" href="' + item.url + '">' +
          '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, "&quot;") + '" onerror="this.style.display=\'none\'">' +
          '<span><strong>' + item.title + '</strong><span>' + item.category + ' · ' + item.year + ' · ' + item.region + '</span></span>' +
          '</a>';
      }).join("");
      panel.classList.toggle("is-open", Boolean(results.length));
    }
    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        render(input.value);
      });
      input.addEventListener("focus", function () {
        render(input.value);
      });
    });
    document.addEventListener("click", function (event) {
      if (!panel.contains(event.target) && !inputs.some(function (input) { return input.contains(event.target); })) {
        panel.classList.remove("is-open");
      }
    });
  }

  function setupLocalFilter() {
    var input = document.querySelector("[data-local-filter]");
    var yearSelect = document.querySelector("[data-local-year]");
    var categorySelect = document.querySelector("[data-local-category]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    if (!cards.length) {
      return;
    }
    var years = [];
    var categories = [];
    cards.forEach(function (card) {
      var year = card.getAttribute("data-year") || "";
      var category = card.getAttribute("data-category") || "";
      if (year && years.indexOf(year) === -1) {
        years.push(year);
      }
      if (category && categories.indexOf(category) === -1) {
        categories.push(category);
      }
    });
    years.sort().reverse();
    categories.sort();
    if (yearSelect) {
      years.forEach(function (year) {
        var option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
      });
    }
    if (categorySelect) {
      categories.forEach(function (category) {
        var option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
      });
    }
    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var category = categorySelect ? categorySelect.value : "";
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-category"),
          card.getAttribute("data-genre")
        ].join(" ").toLowerCase();
        var ok = (!query || text.indexOf(query) !== -1) &&
          (!year || card.getAttribute("data-year") === year) &&
          (!category || card.getAttribute("data-category") === category);
        card.style.display = ok ? "" : "none";
      });
    }
    [input, yearSelect, categorySelect].forEach(function (element) {
      if (element) {
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      }
    });
  }

  window.initMoviePlayer = function (streamUrl) {
    ready(function () {
      var video = document.querySelector("[data-player-video]");
      var layer = document.querySelector("[data-player-layer]");
      var button = document.querySelector("[data-player-button]");
      var attached = false;
      if (!video) {
        return;
      }
      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }
      function play() {
        attach();
        video.controls = true;
        if (layer) {
          layer.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }
      if (layer) {
        layer.addEventListener("click", play);
      }
      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          play();
        });
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupLocalFilter();
  });
})();
