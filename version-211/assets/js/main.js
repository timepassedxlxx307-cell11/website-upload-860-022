(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");

        if (menuButton && mobileMenu) {
            menuButton.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                var active = slideIndex === current;
                slide.classList.toggle("is-active", active);
                slide.setAttribute("aria-hidden", active ? "false" : "true");
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startHero() {
            if (timer) {
                window.clearInterval(timer);
            }
            if (slides.length > 1) {
                timer = window.setInterval(function () {
                    showSlide(current + 1);
                }, 5200);
            }
        }

        if (slides.length) {
            showSlide(0);
            startHero();

            if (prev) {
                prev.addEventListener("click", function () {
                    showSlide(current - 1);
                    startHero();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    showSlide(current + 1);
                    startHero();
                });
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    showSlide(index);
                    startHero();
                });
            });
        }

        Array.prototype.slice.call(document.querySelectorAll("[data-movie-filter]")).forEach(function (input) {
            var scope = input.closest("[data-filter-scope]") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-card]"));

            input.addEventListener("input", function () {
                var value = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-filter-text") || card.textContent || "").toLowerCase();
                    card.hidden = value.length > 0 && text.indexOf(value) === -1;
                });
            });
        });
    });
}());
