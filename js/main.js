document.addEventListener('DOMContentLoaded', function () {
  // Stagger the locked-topics panel rows in true top-to-bottom order,
  // regardless of what other elements sit alongside them in the markup.
  document.querySelectorAll('.paper-panel').forEach(function (panel) {
    var rows = panel.querySelectorAll('.paper-row');
    rows.forEach(function (row, i) {
      row.style.animationDelay = (0.15 + i * 0.15) + 's';
    });
  });

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
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close the menu once a link inside it is tapped, so it doesn't
    // linger open behind the page that's about to load.
    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close the menu if the person taps anywhere outside it.
    document.addEventListener('click', function (e) {
      if (links.classList.contains('open') && !links.contains(e.target) && e.target !== toggle) {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ---------- Magnetic hover (pointer devices only) ----------
  // Applies a smooth, lerp-based magnetic pull to clickable elements as the
  // cursor nears them. Runs on top of each element's existing hover effect
  // (colour change, tilt, background swap) since it only ever touches
  // `transform`, and — for cards — is layered via a separate wrapper so it
  // never collides with the tilt transform.
  //
  // All magnetic elements across the whole page share a single animation
  // loop (rather than one loop per group) to keep the per-frame cost to one
  // requestAnimationFrame callback regardless of how many element groups
  // are registered.
  var supportsMagnetic = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var magneticItems = [];

  function registerMagneticGroup(elements, strength, radius, ease) {
    Array.prototype.forEach.call(elements, function (el) {
      var item = { el: el, strength: strength, radius: radius, ease: ease, mouseX: null, mouseY: null, targetX: 0, targetY: 0, currentX: 0, currentY: 0 };
      el.addEventListener('mousemove', function (e) {
        item.mouseX = e.clientX;
        item.mouseY = e.clientY;
      });
      el.addEventListener('mouseleave', function () {
        item.mouseX = null;
        item.mouseY = null;
      });
      magneticItems.push(item);
    });
  }

  function magneticTick() {
    magneticItems.forEach(function (item) {
      if (item.mouseX !== null) {
        var rect = item.el.getBoundingClientRect();
        var centerX = rect.left + rect.width / 2;
        var centerY = rect.top + rect.height / 2;
        var dx = item.mouseX - centerX;
        var dy = item.mouseY - centerY;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 1) {
          var normalizedDist = Math.min(dist / item.radius, 1);
          var pull = Math.sin((1 - normalizedDist) * Math.PI / 2) * item.strength * Math.min(dist / 8, 1);
          item.targetX = (dx / dist) * pull;
          item.targetY = (dy / dist) * pull;
        } else {
          item.targetX = 0;
          item.targetY = 0;
        }
      } else {
        item.targetX = 0;
        item.targetY = 0;
      }

      var diffX = item.targetX - item.currentX;
      var diffY = item.targetY - item.currentY;

      if (Math.abs(diffX) < 0.05 && Math.abs(diffY) < 0.05) {
        item.currentX = item.targetX;
        item.currentY = item.targetY;
      } else {
        item.currentX += diffX * item.ease;
        item.currentY += diffY * item.ease;
      }

      item.el.style.setProperty('--magnetic-x', item.currentX.toFixed(2) + 'px');
      item.el.style.setProperty('--magnetic-y', item.currentY.toFixed(2) + 'px');
    });

    requestAnimationFrame(magneticTick);
  }

  if (supportsMagnetic) {
    // Nav links: small pull, mouse must be fairly close (they sit close together)
    registerMagneticGroup(document.querySelectorAll('.nav-links a'), 6, 40, 0.18);

    // Footer and inline text links: same small, precise pull
    registerMagneticGroup(document.querySelectorAll('footer .footer-col a, .sample-note a, .back-link'), 5, 32, 0.18);

    // Buttons: bigger elements, slightly larger pull and radius to feel proportionate
    registerMagneticGroup(document.querySelectorAll('.btn-primary, .btn-ghost, .nav-cta'), 8, 55, 0.18);

    // Toggle pills / course-pick buttons: small radius so tightly-packed
    // neighbours in the same pill don't pull toward each other's cursor
    registerMagneticGroup(document.querySelectorAll('.toggle-pill button, .course-pick button'), 5, 30, 0.2);

    // Logo: its own gentle pull
    registerMagneticGroup(document.querySelectorAll('.logo'), 6, 50, 0.18);

    if (magneticItems.length) {
      requestAnimationFrame(magneticTick);
    }
  }

  var accordions = document.querySelectorAll('.faq-item');
  accordions.forEach(function (item) {
    var q = item.querySelector('.faq-question');
    if (!q) return;
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      accordions.forEach(function (i) { i.classList.remove('open'); });
      if (!isOpen) item.classList.add('open');
    });
  });

  var togglePills = document.querySelectorAll('.toggle-pill:not(#year-pill)');
  togglePills.forEach(function (pill) {
    var buttons = pill.querySelectorAll('button');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        buttons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
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

  // Scroll-reveal animation for sections and cards — repeats every time
  // the element enters or leaves the viewport, in either scroll direction,
  // and the entrance direction matches the direction the user is scrolling.
  var revealTargets = document.querySelectorAll(
    '.card, .credential-card, .trust-item, .how-step, .timeline-item, ' +
    '.section-head, .course-block, .contact-info-item, .faq-item, ' +
    '.paper-panel, .about-photo-frame, .philosophy-quote'
  );

  var prefersReducedMotionGlobal = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window && revealTargets.length && !prefersReducedMotionGlobal) {
    var lastScrollY = window.scrollY;
    var scrollDirection = 'down';

    window.addEventListener('scroll', function () {
      var currentY = window.scrollY;
      if (currentY > lastScrollY + 2) {
        scrollDirection = 'down';
      } else if (currentY < lastScrollY - 2) {
        scrollDirection = 'up';
      }
      lastScrollY = currentY;
    }, { passive: true });

    revealTargets.forEach(function (el, i) {
      el.classList.add('reveal-init');
      el.style.transitionDelay = (i % 6) * 0.06 + 's';
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.remove('reveal-from-up', 'reveal-from-down');
          entry.target.classList.add(scrollDirection === 'down' ? 'reveal-from-down' : 'reveal-from-up');
          // force reflow so the browser registers the starting position before animating in
          void entry.target.offsetWidth;
          entry.target.classList.add('reveal-in');
        } else {
          entry.target.classList.remove('reveal-in');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

    revealTargets.forEach(function (el) { observer.observe(el); });
  }

  // ---------- Ambient background (whole page) ----------
  // Mixes plain symbols, short equations, and small graph/curve shapes.
  var symbolField = document.getElementById('symbol-field');
  if (symbolField) {
    var plainSymbols = [
      '∑', '∫', '∮', '∏', '√', '∞', '∂', '∇',
      'π', 'Δ', 'θ', 'λ', 'μ', 'σ', 'Ω', 'φ',
      'x²', 'xⁿ', '≠', '≤', '≥', '≈', '±', '÷',
      '∈', '⊂', '∀', '∃', '→', '⇒'
    ];

    // Single-form equations (shown static, still float)
    var equations = [
      'dy/dx', '∫f(x)dx', 'lim x→∞', 'sin²θ + cos²θ = 1',
      'e^iπ + 1 = 0', 'Δy/Δx', 'y = sin x', 'y = cos x',
      'y = tan x', 'y = eˣ', 'y = ln x', 'y = a^x',
      'd/dx[xⁿ] = nxⁿ⁻¹', '∫₀^∞ e⁻ˣ dx', 'P(A∩B)',
      'tan θ = sin θ/cos θ', 'f′(x)', 'Σ 1/n²', 'nCr',
      'y = 1/x', 'log(ab) = log a + log b', 'θ = πr²',
      'v = u + at', 'y = |x|'
    ];

    // Equations that rearrange — each is a set of equivalent forms the
    // element cycles through (Option 3A). Kept short so they read at a glance.
    var rearrangingEquations = [
      ['y = mx + c', 'y − c = mx', 'x = (y−c)/m'],
      ['a² + b² = c²', 'c² − a² = b²', 'c = √(a²+b²)'],
      ['x² + y² = r²', 'y² = r² − x²', 'r = √(x²+y²)'],
      ['2x + 6 = 10', '2x = 10 − 6', 'x = 2'],
      ['ax² + bx + c = 0', 'x = −b ± √(b²−4ac)', 'over 2a'],
      ['E = mc²', 'm = E/c²', 'c = √(E/m)']
    ];

    var graphShapeSVGs = {
      parabola: '<svg width="60" height="45" viewBox="0 0 60 45"><line x1="0" y1="40" x2="60" y2="40" stroke="currentColor" stroke-width="1"/><line x1="5" y1="45" x2="5" y2="0" stroke="currentColor" stroke-width="1"/><path class="anim-draw" d="M5 40 Q30 -5 55 40" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
      sine: '<svg width="72" height="34" viewBox="0 0 72 34"><line x1="0" y1="17" x2="72" y2="17" stroke="currentColor" stroke-width="0.75"/><path class="anim-draw" d="M2 17 Q11 1 20 17 T38 17 T56 17 T72 17" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
      cosine: '<svg width="72" height="34" viewBox="0 0 72 34"><line x1="0" y1="17" x2="72" y2="17" stroke="currentColor" stroke-width="0.75"/><path class="anim-draw" d="M2 3 Q11 3 16 17 T30 31 Q39 31 44 17 T58 3 Q65 3 70 10" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
      tangent: '<svg width="58" height="50" viewBox="0 0 58 50"><line x1="0" y1="25" x2="58" y2="25" stroke="currentColor" stroke-width="0.75"/><path class="anim-draw" d="M10 48 C16 40 16 10 22 2" fill="none" stroke="currentColor" stroke-width="1.8"/><path class="anim-draw" d="M36 48 C42 40 42 10 48 2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
      cubic: '<svg width="54" height="50" viewBox="0 0 54 50"><line x1="0" y1="25" x2="54" y2="25" stroke="currentColor" stroke-width="0.75"/><line x1="27" y1="0" x2="27" y2="50" stroke="currentColor" stroke-width="0.75"/><path class="anim-draw" d="M6 46 C18 46 18 4 27 25 C36 46 36 4 48 4" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
      exponential: '<svg width="50" height="48" viewBox="0 0 50 48"><line x1="0" y1="44" x2="50" y2="44" stroke="currentColor" stroke-width="0.75"/><path class="anim-draw" d="M4 43 Q30 42 44 4" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
      normal: '<svg width="64" height="40" viewBox="0 0 64 40"><line x1="0" y1="36" x2="64" y2="36" stroke="currentColor" stroke-width="0.75"/><path class="anim-draw" d="M2 36 C18 36 22 6 32 6 C42 6 46 36 62 36" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
      circle: '<svg width="46" height="46" viewBox="0 0 46 46"><line x1="0" y1="23" x2="46" y2="23" stroke="currentColor" stroke-width="0.75"/><line x1="23" y1="0" x2="23" y2="46" stroke="currentColor" stroke-width="0.75"/><circle class="anim-draw" cx="23" cy="23" r="15" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
      axes: '<svg width="40" height="40" viewBox="0 0 40 40"><line x1="0" y1="20" x2="40" y2="20" stroke="currentColor" stroke-width="1.5"/><line x1="20" y1="0" x2="20" y2="40" stroke="currentColor" stroke-width="1.5"/><circle class="anim-trace-dot" cx="28" cy="12" r="2" fill="currentColor"/></svg>',
      bars: '<svg width="50" height="35" viewBox="0 0 50 35"><rect class="anim-bar" x="4" y="20" width="8" height="15" fill="currentColor"/><rect class="anim-bar" x="18" y="10" width="8" height="25" fill="currentColor"/><rect class="anim-bar" x="32" y="15" width="8" height="20" fill="currentColor"/></svg>',
      triangle: '<svg width="40" height="35" viewBox="0 0 40 35"><path class="anim-draw" d="M20 2 L38 32 L2 32 Z" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
      line: '<svg width="52" height="40" viewBox="0 0 52 40"><line x1="0" y1="36" x2="52" y2="36" stroke="currentColor" stroke-width="0.75"/><line x1="26" y1="0" x2="26" y2="40" stroke="currentColor" stroke-width="0.75"/><path class="anim-draw" d="M6 34 L46 6" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
    };
    var graphTypes = ['parabola', 'sine', 'cosine', 'tangent', 'cubic', 'exponential', 'normal', 'circle', 'axes', 'bars', 'triangle', 'line'];

    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var symbolItems = [];
    var symbolCount = window.innerWidth < 700 ? 16 : 30;

    // Placement with spacing: keep a running list of chosen positions and
    // reject any new spot that lands too close to an existing one, so the
    // symbols spread across the page instead of clumping/overlapping.
    var placed = [];
    // Minimum gap between symbol centres, in percentage-of-viewport units.
    // Smaller on mobile (fewer symbols, tighter screen) than desktop.
    var minGap = window.innerWidth < 700 ? 14 : 12;

    function choosePosition() {
      var best = null;
      var bestDist = -1;
      // Try several candidate spots; keep the one furthest from its nearest
      // neighbour (a "best candidate" sampling — reliably well-spread without
      // ever failing to place, even when the page is fairly full).
      for (var attempt = 0; attempt < 12; attempt++) {
        var cx = Math.random() * 92;
        var cy = Math.random() * 100;
        var nearest = Infinity;
        for (var p = 0; p < placed.length; p++) {
          var dx = cx - placed[p].x;
          var dy = cy - placed[p].y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < nearest) nearest = d;
        }
        if (placed.length === 0) { best = { x: cx, y: cy }; break; }
        if (nearest > bestDist) { bestDist = nearest; best = { x: cx, y: cy }; }
        // Good enough — comfortably spaced, stop early
        if (nearest >= minGap) break;
      }
      placed.push(best);
      return best;
    }

    for (var s = 0; s < symbolCount; s++) {
      var outer = document.createElement('div');
      outer.className = 'symbol-outer';
      var pos = choosePosition();
      outer.style.left = pos.x + '%';
      outer.style.top = pos.y + '%';

      var roll = Math.random();
      var inner;
      var floatingClass = prefersReducedMotion ? '' : ' floating';

      if (roll < 0.4) {
        // plain symbol
        inner = document.createElement('span');
        inner.className = 'symbol-inner' + floatingClass;
        inner.textContent = plainSymbols[Math.floor(Math.random() * plainSymbols.length)];
        inner.style.fontSize = (16 + Math.random() * 28) + 'px';
      } else if (roll < 0.58) {
        // static equation
        inner = document.createElement('span');
        inner.className = 'symbol-inner equation' + floatingClass;
        inner.textContent = equations[Math.floor(Math.random() * equations.length)];
        inner.style.fontSize = (13 + Math.random() * 8) + 'px';
      } else if (roll < 0.72 && !prefersReducedMotion) {
        // rearranging equation — cycles through equivalent forms (Option 3A)
        inner = document.createElement('span');
        inner.className = 'symbol-inner equation eq-rearrange floating';
        inner.style.fontSize = (13 + Math.random() * 7) + 'px';
        var forms = rearrangingEquations[Math.floor(Math.random() * rearrangingEquations.length)];
        forms.forEach(function (formText, fi) {
          var formSpan = document.createElement('span');
          formSpan.className = 'eq-form';
          formSpan.textContent = formText;
          formSpan.style.animationDelay = (fi * 2.6) + 's';
          inner.appendChild(formSpan);
        });
      } else {
        // graph/curve shape (self-drawing / animated — Options 1 & 2)
        inner = document.createElement('div');
        inner.className = 'symbol-inner graph-shape' + floatingClass;
        inner.innerHTML = graphShapeSVGs[graphTypes[Math.floor(Math.random() * graphTypes.length)]];
      }

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

  // ---------- Card tilt (pointer devices only, static fallback on touch) ----------
  var supportsHoverTilt = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (supportsHoverTilt) {
    document.querySelectorAll('.tilt-ready').forEach(function (card) {
      card.style.transition = 'transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease';
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -5;
        var rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 5;
        card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-3px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }
  // On touch/no-hover devices, .tilt-ready cards simply render with their default
  // .card styling and no transform logic runs — no broken half-tilted state possible.
});
