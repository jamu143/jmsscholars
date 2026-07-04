document.addEventListener('DOMContentLoaded', function () {
  var header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 8) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
  }

  var accordions = document.querySelectorAll('.faq-item');
  accordions.forEach(function (item) {
    var q = item.querySelector('.faq-question');
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      accordions.forEach(function (i) { i.classList.remove('open'); });
      if (!isOpen) item.classList.add('open');
    });
  });

  var togglePills = document.querySelectorAll('.toggle-pill');
  togglePills.forEach(function (pill) {
    var buttons = pill.querySelectorAll('button');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var target = document.querySelector(pill.dataset.target);
        if (target) {
          if (btn.dataset.mode === 'cf') {
            target.classList.add('show-cf');
            target.classList.remove('show-ca');
          } else {
            target.classList.add('show-ca');
            target.classList.remove('show-cf');
          }
        }
      });
    });
  });

  // Courses page: year + course dual-toggle
  var yearPill = document.getElementById('year-pill');
  var coursePick = document.getElementById('course-pick');
  if (yearPill && coursePick) {
    var currentYear = '11';
    var currentCourse = 'specialist';

    function updateCourseBlocks() {
      document.querySelectorAll('.course-block').forEach(function (block) {
        var match = block.dataset.year === currentYear && block.dataset.course === currentCourse;
        block.classList.toggle('active', match);
      });
    }

    yearPill.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        yearPill.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentYear = btn.dataset.year;
        updateCourseBlocks();
      });
    });

    coursePick.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        coursePick.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentCourse = btn.dataset.course;
        updateCourseBlocks();
      });
    });
  }

  // Scroll-reveal animation for sections and cards
  var revealTargets = document.querySelectorAll(
    '.card, .credential-card, .trust-item, .how-step, .timeline-item, ' +
    '.section-head, .course-block, .contact-info-item, .faq-item, ' +
    '.paper-panel, .about-photo-frame, .philosophy-quote'
  );

  if ('IntersectionObserver' in window && revealTargets.length) {
    revealTargets.forEach(function (el, i) {
      el.classList.add('reveal-init');
      el.style.transitionDelay = (i % 6) * 0.06 + 's';
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach(function (el) { observer.observe(el); });
  }

  // ---------- Ambient symbol background (hero) ----------
  var symbolField = document.getElementById('symbol-field');
  if (symbolField) {
    var mathSymbols = [
      '∑', '∫', '∮', '∏', '√', '∞', '∂', '∇',
      'π', 'Δ', 'θ', 'λ', 'μ', 'σ', 'Ω', 'φ',
      'x²', 'xⁿ', '≠', '≤', '≥', '≈', '±', '÷',
      '∈', '⊂', '∀', '∃', '→', '⇒', 'lim', 'dx'
    ];

    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var symbolItems = [];
    var symbolCount = window.innerWidth < 700 ? 14 : 24;

    for (var s = 0; s < symbolCount; s++) {
      var outer = document.createElement('div');
      outer.className = 'symbol-outer';
      outer.style.left = Math.random() * 96 + '%';
      outer.style.top = Math.random() * 100 + '%';

      var inner = document.createElement('span');
      inner.className = 'symbol-inner' + (prefersReducedMotion ? '' : ' floating');
      inner.textContent = mathSymbols[Math.floor(Math.random() * mathSymbols.length)];
      var size = 16 + Math.random() * 28;
      inner.style.fontSize = size + 'px';
      inner.style.setProperty('--dur', (16 + Math.random() * 14) + 's');
      inner.style.animationDelay = (-Math.random() * 20) + 's';

      outer.appendChild(inner);
      symbolField.appendChild(outer);

      symbolItems.push({ el: outer, speed: 0.04 + Math.random() * 0.15, dir: Math.random() > 0.5 ? 1 : -1 });
    }

    if (!prefersReducedMotion) {
      var tickingSymbols = false;
      function updateSymbolParallax() {
        var scrollY = window.scrollY;
        symbolItems.forEach(function (it) {
          it.el.style.transform = 'translateY(' + (scrollY * it.speed * it.dir) + 'px)';
        });
        tickingSymbols = false;
      }
      window.addEventListener('scroll', function () {
        if (!tickingSymbols) {
          requestAnimationFrame(updateSymbolParallax);
          tickingSymbols = true;
        }
      });
    }
  }

  // ---------- Graph-drawing divider ----------
  var graphDividers = document.querySelectorAll('.graph-divider-path');
  if (graphDividers.length && 'IntersectionObserver' in window) {
    var graphObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('draw-in');
          graphObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    graphDividers.forEach(function (path) { graphObserver.observe(path); });
  }

  // ---------- Card tilt (pointer devices only, static fallback on touch) ----------
  var supportsHoverTilt = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (supportsHoverTilt) {
    document.querySelectorAll('.tilt-ready').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -5;
        var rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 5;
        card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-3px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
      });
    });
  }
  // On touch/no-hover devices, .tilt-ready cards simply render with their default
  // .card styling and no transform logic runs — no broken half-tilted state possible.
});
