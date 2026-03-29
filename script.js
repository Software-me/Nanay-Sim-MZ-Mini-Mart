(function () {
  "use strict";

  var THEME_KEY = "nanay-sim-theme";

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function initYear() {
    var el = $("#year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function initTheme() {
    var btn = $("#theme-toggle");
    if (!btn) return;

    var stored = localStorage.getItem(THEME_KEY);
    if (stored === "light") {
      document.body.classList.add("theme-light");
      btn.setAttribute("aria-pressed", "true");
      btn.setAttribute("aria-label", "Toggle dark mode");
    }

    btn.addEventListener("click", function () {
      var light = document.body.classList.toggle("theme-light");
      localStorage.setItem(THEME_KEY, light ? "light" : "dark");
      btn.setAttribute("aria-pressed", light ? "true" : "false");
      btn.setAttribute("aria-label", light ? "Toggle dark mode" : "Toggle light mode");
    });
  }

  function initNav() {
    var toggle = $(".nav-toggle");
    var nav = $("#site-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    nav.querySelectorAll("a.nav__link").forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 768px)").matches) {
          nav.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.setAttribute("aria-label", "Open menu");
        }
      });
    });
  }

  function setActiveNavFromPage() {
    var page = document.body.getAttribute("data-active-nav");
    if (!page) return;
    var expected = page === "home" ? "home.html" : page + ".html";
    document.querySelectorAll(".nav__link").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      var file = href.split("/").pop() || href;
      a.classList.toggle("is-active", file === expected);
    });
  }

  function typeWriter(el, phrases, opts) {
    if (!el) return;
    var iPhrase = 0;
    var iChar = 0;
    var deleting = false;
    var pause = opts.pause || 2200;
    var typeSpeed = opts.typeSpeed || 85;
    var deleteSpeed = opts.deleteSpeed || 45;

    function tick() {
      var phrase = phrases[iPhrase % phrases.length];
      if (!deleting) {
        iChar++;
        el.textContent = phrase.slice(0, iChar);
        if (iChar === phrase.length) {
          deleting = true;
          return window.setTimeout(tick, pause);
        }
        return window.setTimeout(tick, typeSpeed);
      }
      iChar--;
      el.textContent = phrase.slice(0, iChar);
      if (iChar === 0) {
        deleting = false;
        iPhrase++;
        return window.setTimeout(tick, 400);
      }
      return window.setTimeout(tick, deleteSpeed);
    }

    tick();
  }

  function initTyped() {
    typeWriter(
      $("#typed-text"),
      [
        "neighborhood mini-mart",
        "daily essentials stop",
        "snacks & grocery hub",
        "family-friendly store",
      ],
      { pause: 2600, typeSpeed: 72, deleteSpeed: 40 }
    );
  }

  function initStats() {
    var items = document.querySelectorAll(".stats__num[data-target]");
    if (!items.length) return;

    var started = false;

    function animate() {
      items.forEach(function (node) {
        var target = parseInt(node.getAttribute("data-target"), 10);
        if (isNaN(target)) return;
        var duration = 1400;
        var start = null;

        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          node.textContent = String(Math.round(target * eased));
          if (p < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
      });
    }

    var statsEl = document.querySelector(".stats");
    if (!statsEl) return;

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !started) {
            started = true;
            animate();
            io.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );

    io.observe(statsEl);
  }

  function initBackTop() {
    var btn = $("#back-top");
    if (!btn) return;

    function toggle() {
      btn.classList.toggle("is-visible", window.scrollY > 500);
    }

    window.addEventListener("scroll", toggle, { passive: true });
    toggle();

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function initCatalog() {
    var listEl = $("#catalog-list");
    if (!listEl) return;

    var searchEl = $("#catalog-search");
    var categoryEl = $("#catalog-category");
    var countEl = $("#catalog-count");
    var items = [
      { name: "Premium Rice 5kg", category: "Pantry" },
      { name: "Jasmine Rice 10kg", category: "Pantry" },
      { name: "Cooking Oil 1L", category: "Pantry" },
      { name: "Soy Sauce 500ml", category: "Pantry" },
      { name: "Vinegar 500ml", category: "Pantry" },
      { name: "Canned Sardines", category: "Pantry" },
      { name: "Corned Beef", category: "Pantry" },
      { name: "Instant Noodles", category: "Snacks" },
      { name: "Biscuits Assorted", category: "Snacks" },
      { name: "Potato Chips", category: "Snacks" },
      { name: "Chocolate Wafer", category: "Snacks" },
      { name: "Soft Drinks 1.5L", category: "Drinks" },
      { name: "Bottled Water", category: "Drinks" },
      { name: "Coffee Sachets", category: "Drinks" },
      { name: "Powdered Milk", category: "Drinks" },
      { name: "Dishwashing Liquid", category: "Household" },
      { name: "Laundry Detergent", category: "Household" },
      { name: "Bleach Cleaner", category: "Household" },
      { name: "Toilet Tissue", category: "Household" },
      { name: "Shampoo Sachets", category: "Personal Care" },
      { name: "Bath Soap", category: "Personal Care" },
      { name: "Toothpaste", category: "Personal Care" },
    ];

    function render() {
      var term = searchEl ? searchEl.value.trim().toLowerCase() : "";
      var category = categoryEl ? categoryEl.value : "all";
      var filtered = items.filter(function (item) {
        var nameMatch = !term || item.name.toLowerCase().indexOf(term) !== -1;
        var catMatch = category === "all" || item.category === category;
        return nameMatch && catMatch;
      });

      listEl.innerHTML = "";

      if (!filtered.length) {
        listEl.innerHTML =
          '<li class="card"><h3 class="card__title">No matching products</h3><p class="card__text">Try a different keyword or category.</p></li>';
      } else {
        filtered.forEach(function (item) {
          var li = document.createElement("li");
          li.className = "card";
          li.innerHTML =
            '<h3 class="card__title">' +
            item.name +
            '</h3><p class="card__text">Category: ' +
            item.category +
            "</p>";
          listEl.appendChild(li);
        });
      }

      if (countEl) {
        countEl.textContent = filtered.length + " product(s) shown";
      }
    }

    if (searchEl) searchEl.addEventListener("input", render);
    if (categoryEl) categoryEl.addEventListener("change", render);
    render();
  }

  function initOrderForm() {
    var form = $("#order-form");
    if (!form) return;
    var note = $("#order-form-note");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var data = new FormData(form);
      var summary =
        "Thanks! We received your request for " +
        (data.get("items") || "items") +
        ". Preferred payment: " +
        (data.get("payment") || "not selected") +
        ".";
      if (note) note.textContent = summary;
      form.reset();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initYear();
    initTheme();
    initNav();
    setActiveNavFromPage();
    initTyped();
    initStats();
    initBackTop();
    initCatalog();
    initOrderForm();
  });
})();
