// Static site generator for mohammedridwan.com — run `npm run build` after editing
// essays.js or anything in here. Outputs real routes with full content in the HTML.
import fs from 'node:fs';
import path from 'node:path';
import { essays } from './essays.js';

const SITE = 'https://mohammedridwan.com';
const OUT = path.dirname(new URL(import.meta.url).pathname);
const TOPIC_ORDER = ['Startups & Product', 'AI & Machine Learning', 'People & Ideas', 'VR'];

const BOOKS = [
  { title: 'Domain-Driven Design', author: 'Eric Evans', cover: 'domain-driven-design' },
  { title: 'Amp It Up', author: 'Frank Slootman', cover: 'amp-it-up' },
  { title: 'Anatomy of the Swipe', author: 'Ahmed Siddiqui', cover: 'anatomy-of-the-swipe' },
  { title: 'A More Beautiful Question', author: 'Warren Berger', cover: 'a-more-beautiful-question' },
  { title: 'Under the Hood', author: 'Ramchand Kumaresan', cover: 'under-the-hood' },
  { title: 'Continuous Discovery Habits', author: 'Teresa Torres', cover: 'continuous-discovery-habits' },
  { title: 'Scaling People', author: 'Claire Hughes Johnson', cover: 'scaling-people' },
  { title: 'Reality Transurfing', author: 'Vadim Zeland', cover: 'reality-transurfing' },
  { title: 'The Lessons of History', author: 'Will & Ariel Durant', cover: 'the-lessons-of-history' },
  { title: 'Working Backwards', author: 'Colin Bryar & Bill Carr', cover: 'working-backwards' },
  { title: 'Age of Ambition', author: 'Evan Osnos', cover: 'age-of-ambition' },
  { title: 'The Great CEO Within', author: 'Matt Mochary', cover: 'the-great-ceo-within' },
  { title: 'The Mom Test', author: 'Rob Fitzpatrick', cover: 'the-mom-test' },
  { title: 'Obviously Awesome', author: 'April Dunford', cover: 'obviously-awesome' },
  { title: 'Flashes of Thought', author: 'Mohammed bin Rashid Al Maktoum', cover: 'flashes-of-thought' },
];

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const slugify = (t) => t.replace(/[^a-z0-9]+/gi, '-').toLowerCase().replace(/(^-|-$)/g, '');
const inline = (t) => esc(String(t || ''))
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/\*([^*]+)\*/g, '<em>$1</em>');
const stripMd = (t) => String(t || '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');

const favicon = (domain) => `<img src="/assets/icons/${domain}.png" alt="" width="14" height="14" class="inline-fav">`;
const extArrow = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="ext"><path d="M7 17L17 7"></path><path d="M9 7h8v8"></path></svg>';

function nav(current) {
  const cur = (k) => (current === k ? ' current' : '');
  return `<nav class="nav">
    <a href="/writing/" class="pill${cur('writing')}">Writing</a>
    <a href="/reading/" class="pill${cur('reading')}">Reading</a>
    <div class="menu">
      <a href="#" class="pill menu-toggle" data-menu-toggle>Operating <span class="chev">▾</span></a>
      <div class="dropdown" hidden>
        <span class="dropdown-label">Mission</span>
        <a class="dropdown-item" href="https://www.getpluto.com" target="_blank" rel="noopener">Pluto ${extArrow}</a>
        <div class="dropdown-sep"></div>
        <span class="dropdown-label">Experiments</span>
        <span class="dropdown-item static">Counterposition Labs</span>
        <div class="dropdown-sep"></div>
        <span class="dropdown-label">Community</span>
        <a class="dropdown-item" href="https://majlis.to" target="_blank" rel="noopener">Majlis ${extArrow}</a>
      </div>
    </div>
    <div class="menu">
      <a href="#" class="pill menu-toggle" data-menu-toggle>Investing <span class="chev">▾</span></a>
      <div class="dropdown dropdown-wide" hidden>
        <span class="dropdown-label">Angel investments</span>
        <a class="dropdown-item row" href="https://www.endorhealth.com/" target="_blank" rel="noopener"><img src="/assets/icons/endorhealth.com.png" alt="" width="18" height="18" class="fav"><span class="grow">Endor Health</span>${extArrow}</a>
        <span class="dropdown-item row redacted"><span class="swatch"></span>[Redacted]</span>
        <span class="dropdown-item row redacted"><span class="swatch"></span>[Redacted]</span>
        <span class="dropdown-label tail">+ a few others</span>
        <div class="dropdown-sep"></div>
        <p class="dropdown-note">If you are a founder building in the AI, Fintech, Healthtech, Manufacturing, Luxury Goods or B2B SaaS space and think I can be helpful &mdash; text me at <a href="mailto:hi@ridwan.io">hi@ridwan.io</a></p>
      </div>
    </div>
    <span class="spacer"></span>
    <span class="nav-break"></span>
    <div class="pill-group">
      <a href="/" class="seg${cur('letter')}">About Mo</a>
      <a href="https://x.com/themoridwan" title="X" class="seg icon glyph">𝕏</a>
      <a href="https://www.linkedin.com/in/mohammedri/" title="LinkedIn" class="seg icon glyph">in</a>
      <a href="https://www.instagram.com/themoridwan/" title="Instagram" class="seg icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"></circle></svg></a>
      <a href="https://github.com/mohammedri" title="GitHub" class="seg icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49 0-.24-.01-.89-.01-1.74-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.05 10.05 0 0 0 22 12.25C22 6.58 17.52 2 12 2z"></path></svg></a>
    </div>
  </nav>`;
}

function page({ title, desc, urlPath, current, content, headExtra = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}${urlPath}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${SITE}${urlPath}">
<meta property="og:type" content="${urlPath.startsWith('/writing/') && urlPath !== '/writing/' ? 'article' : 'website'}">
<link rel="preload" href="/assets/fonts/et-book-roman.woff" as="font" type="font/woff" crossorigin>
<link rel="preload" href="/assets/fonts/et-book-italic.woff" as="font" type="font/woff" crossorigin>
<link rel="stylesheet" href="/css/styles.css">
${headExtra}</head>
<body>
<div class="frame">
  ${nav(current)}
  <main class="content">
${content}
  </main>
  <div class="footer-wrap"><div id="footer" class="mosaic"></div></div>
</div>
<script src="/js/site.js" defer></script>
</body>
</html>
`;
}

/* ---------- About (home) ---------- */
const link = (href, domain, label) => `<a href="${href}" target="_blank" rel="noopener" class="flame nowrap">${favicon(domain)}${label}</a>`;
const letterContent = `    <section class="letter">
      <p class="greeting">Hi there,</p>
      <img src="/assets/about-photo-bw.jpg" alt="Mohammed Ridwan under cherry blossoms in Tokyo" class="about-photo" width="1840" height="773">
      <p>I am Ridwan &mdash; Co-founder &amp; CEO @ ${link('https://www.getpluto.com', 'getpluto.com', 'Pluto')}.</p>
      <p>For the past 10+ years, I&rsquo;ve been an operator at high-growth, venture-backed businesses &mdash; filling most roles from engineering to product, marketing, and sales, and now as CEO.</p>
      <p>I started as a Data Platform Engineer at ${link('https://www.shopify.com', 'shopify.com', 'Shopify')}, where I helped scale Shopify&rsquo;s petabyte-scale infra; then as a Product Lead at ${link('https://squareup.com/us/en/press/dessa-joins-square', 'squareup.com', 'Dessa')} (acquired by ${link('https://cash.app', 'cash.app', 'Cash App')}), helping transform the company into a product-led business; and finally at Cash App, post acquisition.</p>
      <p>At Cash App, I was a member of the product team. My team primarily focused on <a href="https://cash.app/pay" target="_blank" rel="noopener" class="flame">Cash App Pay</a> and exploring new lines of business for Cash App through strategic development.</p>
      <p>I studied Electrical &amp; Computer Engineering at ${link('https://uwaterloo.ca', 'uwaterloo.ca', 'uWaterloo')}, where I was also part of the varsity Dragon Boat team.</p>
      <p>But my career started early, before university, in Ad &amp; Game Design &mdash; which is when I wrote my first line of code in C#, all to get pocket money to buy guitars.</p>
      <p>People, Code &amp; Design are the things I love the most.</p>
      <p><strong class="on-people">On People.</strong></p>
      <p>I care deeply about my people. My work philosophy has changed over the years; these days I operate somewhere between the approaches of <a href="https://en.wikipedia.org/wiki/Frank_Slootman" target="_blank" rel="noopener" class="flame nowrap"><img src="/assets/faces/frank-slootman.jpg" alt="" width="16" height="16" class="inline-face" onerror="this.style.display='none'">Frank Slootman</a> &amp; <a href="https://en.wikipedia.org/wiki/Mark_Pincus" target="_blank" rel="noopener" class="flame nowrap"><img src="/assets/faces/mark-pincus.jpg" alt="" width="16" height="16" class="inline-face" onerror="this.style.display='none'">Mark Pincus</a>.</p>
      <p>We work on tough problems, often at incredible speed. Regardless of the ups and downs that come with operating at this cadence, my goal is to create an environment people love coming back to every day.</p>
      <p>Some folks have worked with me for 8+ years across multiple companies; this is the metric I am proudest of. I love my people &amp; I love how they drive me to do better every day.</p>
      <p>Besides work, I am a father, musician &amp; small-scale goods designer &mdash; I design my own clothes &amp; watches.</p>
      <p>If you love solving hard problems, in tough markets, with people who will push you to grow &mdash; you will love working with my team.</p>
      <p>Curious about our mission? Reach out to me on <a href="https://www.linkedin.com/in/mohammedri/" target="_blank" rel="noopener" class="flame">LinkedIn</a>.</p>
      <p class="signature">&mdash; Mohammed Ridwan</p>
    </section>`;

// Legacy hash-route redirect (old site was an SPA at /#/writing etc.)
const hashRedirect = `<script>(function(){var m=location.hash.match(/^#\\/(writing|reading|essay\\/([a-z0-9-]+))/);if(m){location.replace(m[1]==='writing'?'/writing/':m[1]==='reading'?'/reading/':'/writing/'+m[2]+'/');}})();</script>
`;

/* ---------- Writing index ---------- */
const topics = TOPIC_ORDER.map((label) => ({
  label,
  slug: 'topic-' + label.replace(/[^a-z]+/gi, '-').toLowerCase(),
  items: essays.filter((e) => e.topic === label),
})).filter((t) => t.items.length);

const writingContent = `    <h1 class="page-title">Writing</h1>
    <div class="topic-chips">
${topics.map((t) => `      <a href="#${t.slug}" class="chip" data-jump="${t.slug}">${esc(t.label)}</a>`).join('\n')}
    </div>
    <div class="topic-sections">
${topics.map((t) => `      <div id="${t.slug}">
        <h2 class="topic-heading">${esc(t.label)}</h2>
        <div class="essay-list">
${t.items.map((e) => `          <a href="/writing/${slugify(e.title)}/" class="essay-row"><span class="essay-title">${esc(e.title)}${e.popular ? '<span class="badge-popular">Popular</span>' : ''}</span><span class="essay-date">${esc(e.date)}</span></a>`).join('\n')}
        </div>
      </div>`).join('\n')}
    </div>`;

/* ---------- Articles ---------- */
function articleContent(e) {
  const blocks = (e.blocks || []).map((b) => {
    if (b.k === 'yt') return `      <div class="blk-video"><iframe src="https://www.youtube.com/embed/${esc(b.id)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="Video" loading="lazy"></iframe></div>`;
    if (b.k === 'img') return `      <div class="blk-image" role="img" style="background-image: url('${esc(b.src)}')"></div>`;
    if (b.k === 'li') return `      <div class="blk-li"><span class="dot"></span><p>${inline(b.t)}</p></div>`;
    if (b.k === 'h') return `      <p class="blk-h">${inline(b.t)}</p>`;
    if (b.k === 'q') return `      <p class="blk-q">${inline(b.t)}</p>`;
    if (b.k === 'note') return `      <p class="blk-note">${inline(b.t)}</p>`;
    return `      <p class="blk-p">${inline(b.t)}</p>`;
  }).join('\n');
  return `    <a href="/writing/" class="back-link">← Writing</a>
    <h1 class="article-title">${esc(e.title)}</h1>
    <div class="article-date">${esc(e.date)}</div>
    <div class="article-body">
${blocks}
    </div>`;
}

function articleDesc(e) {
  const p = (e.blocks || []).find((b) => b.k === 'p' || b.k === undefined);
  const t = stripMd(p ? p.t : e.title);
  return t.length > 155 ? t.slice(0, 152).trimEnd() + '…' : t;
}

/* ---------- Reading ---------- */
const readingContent = `    <h1 class="page-title tight">Reading</h1>
    <p class="page-sub">Personal recommendations that I keep coming back to.</p>
    <div class="book-grid">
${BOOKS.map((b) => `      <div class="book-card">
        <div class="book-stage"><div class="book">
          <div class="book-back"></div><div class="book-pages"></div><div class="book-top"></div>
          <div class="book-front">
            <span class="spine-title">${esc(b.title)}</span><span class="spine-author">${esc(b.author)}</span>
            <div class="book-cover-img" style="background-image: url('/assets/covers/${b.cover}.jpg')"></div>
            <div class="book-gloss"></div>
          </div>
        </div></div>
        <div class="book-meta"><span class="b-title">${esc(b.title)}</span><span class="b-author">${esc(b.author)}</span></div>
      </div>`).join('\n')}
    </div>`;

/* ---------- Emit ---------- */
const write = (rel, s) => {
  const p = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, s);
  console.log('wrote', rel);
};

write('index.html', page({
  title: 'Mohammed Ridwan', desc: 'Mohammed Ridwan — Co-founder & CEO at Pluto. Writing on startups, product, AI and people.',
  urlPath: '/', current: 'letter', content: letterContent, headExtra: hashRedirect,
}));
write('writing/index.html', page({
  title: 'Writing — Mohammed Ridwan', desc: 'Essays on startups & product, AI & machine learning, people & ideas, and VR.',
  urlPath: '/writing/', current: 'writing', content: writingContent,
}));
for (const e of essays) {
  write(`writing/${slugify(e.title)}/index.html`, page({
    title: `${e.title} — Mohammed Ridwan`, desc: articleDesc(e),
    urlPath: `/writing/${slugify(e.title)}/`, current: 'writing', content: articleContent(e),
  }));
}
write('reading/index.html', page({
  title: 'Reading — Mohammed Ridwan', desc: 'Personal book recommendations that I keep coming back to.',
  urlPath: '/reading/', current: 'reading', content: readingContent,
}));
write('404.html', page({
  title: 'Not found — Mohammed Ridwan', desc: 'Page not found.',
  urlPath: '/404.html', current: '', content: `    <h1 class="page-title">Not found</h1>
    <p class="page-sub">That page doesn&rsquo;t exist (any more). Try the <a href="/" class="flame">About letter</a> or <a href="/writing/" class="flame">Writing</a>.</p>`,
}));

const urls = ['/', '/writing/', '/reading/', ...essays.map((e) => `/writing/${slugify(e.title)}/`)];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
console.log('done:', 5 + essays.length, 'pages');
