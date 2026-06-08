(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-main-nav]');

    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            if (value) {
                event.preventDefault();
                window.location.href = './search.html?q=' + encodeURIComponent(value);
            }
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;
    var heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
        });
    }

    function startHero() {
        if (heroTimer || slides.length < 2) {
            return;
        }
        heroTimer = window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5000);
    }

    function resetHero() {
        if (heroTimer) {
            window.clearInterval(heroTimer);
            heroTimer = null;
        }
        startHero();
    }

    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(currentSlide - 1);
            resetHero();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(currentSlide + 1);
            resetHero();
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            resetHero();
        });
    });

    startHero();

    document.querySelectorAll('[data-url-search]').forEach(function (scope) {
        var query = new URLSearchParams(window.location.search).get('q') || '';
        var input = scope.querySelector('[data-global-search-field]');
        if (input && query) {
            input.value = query;
        }
    });

    document.querySelectorAll('[data-search-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-card-search]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search]'));
        var active = { field: 'all', value: 'all' };

        function matchesText(card, value) {
            if (!value) {
                return true;
            }
            var haystack = (card.getAttribute('data-search') || '').toLowerCase();
            return haystack.indexOf(value.toLowerCase()) !== -1;
        }

        function matchesFilter(card) {
            if (active.field === 'all') {
                return true;
            }
            return (card.getAttribute('data-' + active.field) || '') === active.value;
        }

        function update() {
            var value = input ? input.value.trim() : '';
            cards.forEach(function (card) {
                card.hidden = !(matchesText(card, value) && matchesFilter(card));
            });
        }

        if (input) {
            input.addEventListener('input', update);
        }

        scope.querySelectorAll('[data-filter-field]').forEach(function (button) {
            button.addEventListener('click', function () {
                scope.querySelectorAll('[data-filter-field]').forEach(function (item) {
                    item.classList.remove('is-active');
                });
                button.classList.add('is-active');
                active.field = button.getAttribute('data-filter-field') || 'all';
                active.value = button.getAttribute('data-filter-value') || 'all';
                update();
            });
        });

        update();
    });
})();
