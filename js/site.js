import { essays } from './essays.js';

// 'mosaic' | 'shader' — the design ships both footers; mosaic is the default
const FOOTER_STYLE = 'mosaic';
const SHOW_DATES = true;
const TOPIC_ORDER = ['Startups & Product', 'AI & Machine Learning', 'People & Ideas', 'VR'];

const BOOKS = [
  { title: 'Domain-Driven Design', author: 'Eric Evans', isbn: '9780321125217' },
  { title: 'Amp It Up', author: 'Frank Slootman', isbn: '9781119836117' },
  { title: 'Anatomy of the Swipe', author: 'Ahmed Siddiqui', isbn: '9781641374477' },
  { title: 'A More Beautiful Question', author: 'Warren Berger', isbn: '9781620401453' },
  { title: 'Under the Hood', author: 'Ramchand Kumaresan' },
  { title: 'Continuous Discovery Habits', author: 'Teresa Torres', coverUrl: 'assets/covers/continuous-discovery-habits.png' },
  { title: 'Scaling People', author: 'Claire Hughes Johnson', isbn: '9781953953216' },
  { title: 'Reality Transurfing', author: 'Vadim Zeland', coverUrl: 'assets/covers/reality-transurfing.jpg' },
  { title: 'The Lessons of History', author: 'Will & Ariel Durant', isbn: '9781439149959' },
  { title: 'Working Backwards', author: 'Colin Bryar & Bill Carr', isbn: '9781250267597' },
  { title: 'Age of Ambition', author: 'Evan Osnos', isbn: '9780374535278' },
  { title: 'The Great CEO Within', author: 'Matt Mochary', isbn: '9780578599281' },
  { title: 'The Mom Test', author: 'Rob Fitzpatrick', isbn: '9781492180746' },
  { title: 'Obviously Awesome', author: 'April Dunford', isbn: '9781999023003' },
  { title: 'Flashes of Thought', author: 'Mohammed bin Rashid Al Maktoum', coverUrl: 'assets/covers/flashes-of-thought.jpg' },
];

const $ = (sel, el = document) => el.querySelector(sel);
const frame = $('#frame');
const views = {
  letter: $('#view-letter'),
  writing: $('#view-writing'),
  reading: $('#view-reading'),
  article: $('#view-article'),
};

const slugify = (t) => t.replace(/[^a-z0-9]+/gi, '-').toLowerCase().replace(/(^-|-$)/g, '');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const inline = (t) => esc(String(t || ''))
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/\*([^*]+)\*/g, '<em>$1</em>');

/* ---- writing ---- */
function renderWriting() {
  const topics = TOPIC_ORDER.map((label) => ({
    label,
    slug: 'topic-' + label.replace(/[^a-z]+/gi, '-').toLowerCase(),
    items: essays.filter((e) => e.topic === label),
  })).filter((t) => t.items.length);

  views.writing.innerHTML =
    '<h1 class="page-title">Writing</h1>' +
    '<div class="topic-chips">' +
    topics.map((t) => `<a href="#" class="chip" data-jump="${t.slug}">${esc(t.label)}</a>`).join('') +
    '</div>' +
    '<div class="topic-sections">' +
    topics.map((t) =>
      `<div id="${t.slug}">` +
      `<h2 class="topic-heading">${esc(t.label)}</h2>` +
      '<div class="essay-list">' +
      t.items.map((e) =>
        `<a href="#/essay/${slugify(e.title)}" class="essay-row">` +
        `<span class="essay-title">${esc(e.title)}${e.popular ? '<span class="badge-popular">Popular</span>' : ''}</span>` +
        `<span class="essay-date">${SHOW_DATES ? esc(e.date) : ''}</span>` +
        '</a>'
      ).join('') +
      '</div></div>'
    ).join('') +
    '</div>';

  views.writing.querySelectorAll('[data-jump]').forEach((a) => {
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      const el = document.getElementById(a.dataset.jump);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 40, behavior: 'smooth' });
    });
  });
}

/* ---- reading ---- */
function renderReading() {
  views.reading.innerHTML =
    '<h1 class="page-title tight">Reading</h1>' +
    '<p class="page-sub">Personal recommendations that I keep coming back to.</p>' +
    '<div class="book-grid">' +
    BOOKS.map((b, i) =>
      '<div class="book-card">' +
      '<div class="book-stage"><div class="book">' +
      '<div class="book-back"></div>' +
      '<div class="book-pages"></div>' +
      '<div class="book-top"></div>' +
      '<div class="book-front">' +
      `<span class="spine-title">${esc(b.title)}</span>` +
      `<span class="spine-author">${esc(b.author)}</span>` +
      `<div class="book-cover-img" data-book="${i}"></div>` +
      '<div class="book-gloss"></div>' +
      '</div></div></div>' +
      '<div class="book-meta">' +
      `<span class="b-title">${esc(b.title)}</span>` +
      `<span class="b-author">${esc(b.author)}</span>` +
      (b.review ? `<p class="b-review">${esc(b.review)}</p>` : '') +
      '</div></div>'
    ).join('') +
    '</div>';

  BOOKS.forEach((b, i) => {
    const url = b.coverUrl || (b.isbn ? `https://covers.openlibrary.org/b/isbn/${b.isbn}-L.jpg?default=false` : '');
    if (!url) return;
    const im = new Image();
    im.onload = () => {
      if (im.naturalWidth > 1) {
        const el = views.reading.querySelector(`.book-cover-img[data-book="${i}"]`);
        if (el) el.style.backgroundImage = `url('${url}')`;
      }
    };
    im.src = url;
  });
}

/* ---- article ---- */
function renderArticle(idx) {
  const art = essays[idx] || essays[0];
  views.article.innerHTML =
    '<a href="#/writing" class="back-link">← Writing</a>' +
    `<h1 class="article-title">${esc(art.title)}</h1>` +
    `<div class="article-date">${SHOW_DATES ? esc(art.date) : ''}</div>` +
    '<div class="article-body">' +
    (art.blocks || []).map((b) => {
      if (b.k === 'yt') return `<div class="blk-video"><iframe src="https://www.youtube.com/embed/${esc(b.id)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="Video"></iframe></div>`;
      if (b.k === 'img') return `<div class="blk-image" role="img" style="background-image: url('${esc(b.src)}')"></div>`;
      if (b.k === 'li') return `<div class="blk-li"><span class="dot"></span><p>${inline(b.t)}</p></div>`;
      if (b.k === 'h') return `<p class="blk-h">${inline(b.t)}</p>`;
      if (b.k === 'q') return `<p class="blk-q">${inline(b.t)}</p>`;
      if (b.k === 'note') return `<p class="blk-note">${inline(b.t)}</p>`;
      return `<p class="blk-p">${inline(b.t)}</p>`;
    }).join('') +
    '</div>';
}

/* ---- routing ---- */
function parseRoute() {
  const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  if (h === 'writing') return { view: 'writing' };
  if (h === 'reading') return { view: 'reading' };
  const m = h.match(/^essay\/(.+)$/);
  if (m) {
    const idx = essays.findIndex((e) => slugify(e.title) === m[1]);
    if (idx >= 0) return { view: 'article', idx };
  }
  return { view: 'letter' };
}

let fadeTimer;
function applyRoute() {
  frame.classList.remove('entered');
  clearTimeout(fadeTimer);
  fadeTimer = setTimeout(() => {
    const r = parseRoute();
    if (r.view === 'article') renderArticle(r.idx);
    Object.entries(views).forEach(([name, el]) => { el.hidden = name !== r.view; });
    document.querySelectorAll('[data-nav]').forEach((a) => {
      const nav = a.dataset.nav;
      const current = nav === r.view || (nav === 'writing' && r.view === 'article');
      a.classList.toggle('current', current);
    });
    window.scrollTo(0, 0);
    frame.classList.add('entered');
  }, 60);
}
window.addEventListener('hashchange', applyRoute);

/* ---- dropdown menus ---- */
document.querySelectorAll('.menu').forEach((menu) => {
  const toggle = menu.querySelector('[data-menu-toggle]');
  const panel = menu.querySelector('.dropdown');
  toggle.addEventListener('click', (ev) => {
    ev.preventDefault();
    const open = menu.classList.toggle('open');
    panel.hidden = !open;
  });
});

/* ---- tap ripple + click sound ---- */
let audioCtx;
function tapSound() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const ac = audioCtx;
    if (ac.state === 'suspended') ac.resume();
    const t = ac.currentTime;
    const osc = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter();
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
  [0, 110].forEach((delay, i) => {
    const r = document.createElement('div');
    r.style.cssText = 'position:fixed;left:' + x + 'px;top:' + y + 'px;width:' + (i ? 90 : 64) + 'px;height:' + (i ? 90 : 64) + 'px;border-radius:999px;background:radial-gradient(circle, rgba(255,65,0,' + (i ? 0.16 : 0.3) + ') 0%, rgba(255,65,0,' + (i ? 0.06 : 0.1) + ') 45%, rgba(255,65,0,0) 70%);pointer-events:none;z-index:9999;opacity:0;animation:tapRipple 0.55s ease-out ' + delay + 'ms forwards;';
    r.addEventListener('animationend', () => r.remove());
    document.body.appendChild(r);
  });
}
document.addEventListener('pointerdown', (e) => {
  burst(e.clientX, e.clientY);
  if (e.target && e.target.closest && e.target.closest('a')) tapSound();
  document.querySelectorAll('.menu.open').forEach((menu) => {
    if (!menu.contains(e.target)) {
      menu.classList.remove('open');
      menu.querySelector('.dropdown').hidden = true;
    }
  });
});

/* ---- footer ---- */
function renderFooter() {
  const footer = $('#footer');
  if (FOOTER_STYLE === 'shader') {
    import('./shader-footer.js').then(() => {
      footer.outerHTML = '<shader-footer></shader-footer>';
    });
    return;
  }
  // deterministic pixel mosaic: chiffon fading into mahogany, sparse flame/fawn accents
  const rows = 13, cols = 44;
  let seed = 42;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  footer.className = 'mosaic';
  footer.innerHTML = Array.from({ length: rows }, (_, r) =>
    '<div class="mosaic-row">' +
    Array.from({ length: cols }, () => {
      const depth = (r + rnd() * 2.2) / rows;
      let color;
      if (depth < 0.35) color = rnd() < 0.12 ? '#D5BF86' : '#F1F0CC';
      else if (depth < 0.7) color = rnd() < 0.5 ? '#D5BF86' : (rnd() < 0.12 ? '#FF4100' : '#F1F0CC');
      else color = rnd() < 0.14 ? '#FF4100' : (rnd() < 0.3 ? '#D5BF86' : (rnd() < 0.5 ? '#193627' : '#3F0D12'));
      return `<div class="mosaic-cell" style="background:${color}"></div>`;
    }).join('') +
    '</div>'
  ).join('');
}

/* ---- boot ---- */
renderWriting();
renderReading();
renderFooter();
applyRoute();
