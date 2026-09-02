// Runtime interactions only — all content is pre-rendered by build.js.

/* mobile device detection (width is handled by the CSS media query) */
(function () {
  var deviceMobile = (navigator.userAgentData && navigator.userAgentData.mobile) ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && window.matchMedia('(pointer: coarse)').matches);
  if (deviceMobile) document.documentElement.classList.add('is-mobile');
})();

/* dropdown menus */
document.querySelectorAll('.menu').forEach(function (menu) {
  var toggle = menu.querySelector('[data-menu-toggle]');
  var panel = menu.querySelector('.dropdown');
  toggle.addEventListener('click', function (ev) {
    ev.preventDefault();
    var open = menu.classList.toggle('open');
    panel.hidden = !open;
  });
});

/* topic chips: smooth scroll with offset */
document.querySelectorAll('[data-jump]').forEach(function (a) {
  a.addEventListener('click', function (ev) {
    ev.preventDefault();
    var el = document.getElementById(a.dataset.jump);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 40, behavior: 'smooth' });
  });
});

/* tap sound + click ripple */
var audioCtx;
function tapSound() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    var ac = audioCtx;
    if (ac.state === 'suspended') ac.resume();
    var t = ac.currentTime;
    var osc = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(170, t);
    osc.frequency.exponentialRampToValueAtTime(75, t + 0.07);
    f.type = 'lowpass'; f.frequency.value = 420;
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.0005, t + 0.09);
    osc.connect(f); f.connect(g); g.connect(ac.destination);
    osc.start(t); osc.stop(t + 0.1);
  } catch (e) {}
}
function burst(x, y) {
  if (!isFinite(x) || !isFinite(y)) return;
  [0, 110].forEach(function (delay, i) {
    var r = document.createElement('div');
    r.style.cssText = 'position:fixed;left:' + x + 'px;top:' + y + 'px;width:' + (i ? 90 : 64) + 'px;height:' + (i ? 90 : 64) + 'px;border-radius:999px;background:radial-gradient(circle, rgba(255,65,0,' + (i ? 0.16 : 0.3) + ') 0%, rgba(255,65,0,' + (i ? 0.06 : 0.1) + ') 45%, rgba(255,65,0,0) 70%);pointer-events:none;z-index:9999;opacity:0;animation:tapRipple 0.55s ease-out ' + delay + 'ms forwards;';
    r.addEventListener('animationend', function () { r.remove(); });
    document.body.appendChild(r);
  });
}
document.addEventListener('pointerdown', function (e) {
  burst(e.clientX, e.clientY);
  if (e.target && e.target.closest && e.target.closest('a')) tapSound();
  document.querySelectorAll('.menu.open').forEach(function (menu) {
    if (!menu.contains(e.target)) {
      menu.classList.remove('open');
      menu.querySelector('.dropdown').hidden = true;
    }
  });
});

/* footer: deterministic pixel mosaic — chiffon fading into mahogany, sparse flame/fawn accents */
(function () {
  var footer = document.getElementById('footer');
  if (!footer) return;
  var rows = 13, cols = 44;
  var seed = 42;
  var rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  var html = '';
  for (var r = 0; r < rows; r++) {
    html += '<div class="mosaic-row">';
    for (var c = 0; c < cols; c++) {
      var depth = (r + rnd() * 2.2) / rows;
      var color;
      if (depth < 0.35) color = rnd() < 0.12 ? '#D5BF86' : '#F1F0CC';
      else if (depth < 0.7) color = rnd() < 0.5 ? '#D5BF86' : (rnd() < 0.12 ? '#FF4100' : '#F1F0CC');
      else color = rnd() < 0.14 ? '#FF4100' : (rnd() < 0.3 ? '#D5BF86' : (rnd() < 0.5 ? '#193627' : '#3F0D12'));
      html += '<div class="mosaic-cell" style="background:' + color + '"></div>';
    }
    html += '</div>';
  }
  footer.innerHTML = html;
})();
