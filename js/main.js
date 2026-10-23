/* Visual effects: interactive 3D hero globe, card tilt, cursor spotlight, scroll progress.
   Pure JavaScript, no libraries. Reads colors from the CSS theme, so dark/light stay in sync. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var root = document.documentElement;

  function cssVar(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }
  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  /* ---- Scroll progress ---- */
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? window.scrollY / h : 0) + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Cursor spotlight ---- */
  if (fine && !reduce) {
    window.addEventListener('mousemove', function (e) {
      root.style.setProperty('--cx', e.clientX + 'px');
      root.style.setProperty('--cy', e.clientY + 'px');
    }, { passive: true });
  }

  /* ---- 3D card tilt + glare ---- */
  if (fine && !reduce) {
    var cards = document.querySelectorAll('.about-card, .skill-group, .project-card, .hero-photo');
    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--ry', ((px - 0.5) * 12).toFixed(2) + 'deg');
        card.style.setProperty('--rx', ((0.5 - py) * 12).toFixed(2) + 'deg');
        card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });
      card.addEventListener('mouseleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---- Hero: interactive 3D constellation globe ---- */
  var hero = document.querySelector('.hero');
  if (!hero) return;
  var canvas = document.createElement('canvas');
  canvas.id = 'hero-canvas';
  hero.insertBefore(canvas, hero.firstChild);
  var ctx = canvas.getContext('2d');
  var photo = hero.querySelector('.hero-photo');

  var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var N = window.innerWidth < 700 ? 90 : 170;
  var pts = [];
  var golden = Math.PI * (3 - Math.sqrt(5));
  for (var i = 0; i < N; i++) {
    var y = 1 - (i / (N - 1)) * 2;
    var rad = Math.sqrt(1 - y * y);
    var th = golden * i;
    pts.push({ x: Math.cos(th) * rad, y: y, z: Math.sin(th) * rad });
  }

  function resize() {
    var r = hero.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  var tx = 0, ty = 0, mx = 0, my = 0, rotY = 0, rotX = 0.35;
  hero.addEventListener('mousemove', function (e) {
    var r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });
  hero.addEventListener('mouseleave', function () { tx = 0; ty = 0; });

  var accent = hexToRgb(cssVar('--accent') || '#d4b06a');
  var accent2 = hexToRgb(cssVar('--accent-2') || '#8b7bd8');
  var isLight = false, frame = 0;

  function draw() {
    frame++;
    if (frame % 20 === 0) {
      accent = hexToRgb(cssVar('--accent') || '#d4b06a');
      accent2 = hexToRgb(cssVar('--accent-2') || '#8b7bd8');
      isLight = root.getAttribute('data-theme') === 'light' ||
                document.body.getAttribute('data-theme') === 'light';
    }
    mx += (tx - mx) * 0.05;
    my += (ty - my) * 0.05;
    rotY += reduce ? 0 : 0.0028;
    var ay = rotY + mx * 0.9;
    var ax = rotX + my * 0.5;

    ctx.clearRect(0, 0, W, H);

    var size = Math.min(W * 0.42, H * 0.62, 340);
    var cx = W > 900 ? W * 0.74 : W * 0.5;
    var cy = H * 0.5;
    if (photo) {
      // center the globe on the portrait
      var pr = photo.getBoundingClientRect(), hr = hero.getBoundingClientRect();
      cx = pr.left - hr.left + pr.width / 2;
      cy = pr.top - hr.top + pr.height / 2;
      size = Math.min(pr.width * 0.8, 300);
    }
    var cosY = Math.cos(ay), sinY = Math.sin(ay), cosX = Math.cos(ax), sinX = Math.sin(ax);
    var persp = 3;

    var proj = new Array(N);
    for (var i = 0; i < N; i++) {
      var p = pts[i];
      var x1 = p.x * cosY + p.z * sinY;
      var z1 = -p.x * sinY + p.z * cosY;
      var y2 = p.y * cosX - z1 * sinX;
      var z2 = p.y * sinX + z1 * cosX;
      var s = persp / (persp - z2);
      proj[i] = { x: cx + x1 * size * s, y: cy + y2 * size * s, z: z2, s: s };
    }

    var maxD = 0.55;
    ctx.lineWidth = 1;
    for (var a = 0; a < N; a++) {
      for (var b = a + 1; b < N; b++) {
        var dx = pts[a].x - pts[b].x, dy = pts[a].y - pts[b].y, dz = pts[a].z - pts[b].z;
        var d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d < maxD) {
          var depth = (proj[a].z + proj[b].z) / 2;
          var alpha = (1 - d / maxD) * (0.12 + 0.38 * (depth + 1) / 2) * (isLight ? 1.1 : 1);
          ctx.strokeStyle = 'rgba(' + accent[0] + ',' + accent[1] + ',' + accent[2] + ',' + alpha.toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(proj[a].x, proj[a].y);
          ctx.lineTo(proj[b].x, proj[b].y);
          ctx.stroke();
        }
      }
    }
    for (var k = 0; k < N; k++) {
      var q = proj[k];
      var front = (q.z + 1) / 2;
      var col = k % 9 === 0 ? accent2 : accent;
      ctx.fillStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + (0.25 + 0.7 * front).toFixed(3) + ')';
      ctx.beginPath();
      ctx.arc(q.x, q.y, (1 + 1.8 * front) * q.s, 0, 6.2832);
      ctx.fill();
    }

    if (!reduce && running) requestAnimationFrame(draw);
  }

  // Pause the animation when the hero is off-screen to save battery
  var running = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var vis = entries[0].isIntersecting;
      if (vis && !running && !reduce) { running = true; requestAnimationFrame(draw); }
      if (!vis) running = false;
    }).observe(hero);
  }
  requestAnimationFrame(draw);
})();
// Dark / Light Theme Toggle
(function () {
  const button = document.getElementById("theme-toggle");
  if (!button) return;

  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    button.textContent = theme === "dark" ? "☀️" : "🌙";
    button.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
    );
    localStorage.setItem("theme", theme);
  }

  applyTheme(localStorage.getItem("theme") || "dark");

  button.addEventListener("click", function () {
    const current = root.getAttribute("data-theme") || "dark";
    applyTheme(current === "dark" ? "light" : "dark");
  });
})();