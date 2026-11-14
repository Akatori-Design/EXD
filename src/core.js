import { LANG, setLang, t } from './i18n.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger, t, LANG };

export const VIEW = document.body.dataset.view || 'home';

export const $ = (s, c = document) => c.querySelector(s);
export const $$ = (s, c = document) => [...c.querySelectorAll(s)];
export const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

document.documentElement.classList.add('js');
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

/* ───────────────────────── Smooth scroll ───────────────────────── */
export let lenis = null;
if (!REDUCED) {
  lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4) });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}
export const scrollVelocity = () => (lenis ? lenis.velocity : 0);

/* ───────────────────────── Text splitting ───────────────────────── */
export function split(el) {
  const out = [];
  const wrap = (node) => {
    const w = document.createElement('span');
    w.className = 'w';
    const inner = document.createElement('span');
    inner.append(node);
    w.append(inner);
    out.push(inner);
    return w;
  };
  [...el.childNodes].forEach((node) => {
    if (node.nodeType === 3) {
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        frag.append(/^\s+$/.test(part) ? document.createTextNode(' ') : wrap(document.createTextNode(part)));
      });
      node.replaceWith(frag);
    } else if (node.nodeName !== 'BR') {
      const holder = document.createComment('');
      node.replaceWith(holder);
      holder.replaceWith(wrap(node));
    }
  });
  return out;
}

export const splits = new Map();
$$('[data-split]').forEach((el) => {
  const words = split(el);
  splits.set(el, words);
  gsap.set(words, { yPercent: 115 });
});

/* ───────────────────────── Decorative pixels ───────────────────────── */
export function mulberry(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

$$('[data-deco]').forEach((section, si) => {
  const type = section.dataset.deco;
  if (type === 'hero') return;
  const rnd = mulberry(si * 97 + 13);
  const deco = document.createElement('div');
  deco.className = 'deco';
  deco.setAttribute('aria-hidden', 'true');
  const items = [];
  const add = (cls, style, speed) => {
    const i = document.createElement('i');
    i.className = cls;
    Object.assign(i.style, style);
    i._speed = speed;
    deco.append(i);
    items.push(i);
  };
  ['left', 'right'].forEach((side) => {
    const edge = (min, max) => `${(min + rnd() * (max - min)).toFixed(2)}%`;
    for (let n = 0; n < 9; n++) {
      const red = type === 'sides-red' && rnd() > 0.45;
      add(`dot${red ? ' red' : ''}`, { [side]: edge(1, 7.5), top: edge(6, 92), animationDelay: `${(-rnd() * 4).toFixed(2)}s`, animationDuration: `${(2.5 + rnd() * 4).toFixed(2)}s` }, 0.3 + rnd() * 1.2);
    }
    for (let n = 0; n < 3; n++) add('dash', { [side]: edge(2, 6), top: edge(10, 88), width: `${8 + Math.round(rnd() * 16)}px` }, 0.6 + rnd());
    for (let n = 0; n < 2; n++) add('vline', { [side]: edge(2.5, 8), top: edge(8, 70), height: `${50 + Math.round(rnd() * 110)}px` }, 0.2 + rnd() * 0.5);
  });
  section.prepend(deco);
  if (!REDUCED) {
    gsap.fromTo(items, { y: (i, el) => el._speed * 90 }, { y: (i, el) => el._speed * -90, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    gsap.from($$('.vline', deco), { scaleY: 0, duration: 1.4, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: section, start: 'top 75%' } });
  }
});

/* ───────────────────────── Cursor & magnetic ───────────────────────── */
if (FINE && !REDUCED) {
  const cursor = $('.cursor');
  const label = $('.cursor__label');
  const xTo = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
  window.addEventListener('pointermove', (e) => {
    cursor.classList.add('is-on');
    xTo(e.clientX);
    yTo(e.clientY);
  });
  document.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
  document.addEventListener('pointerover', (e) => {
    const labelled = e.target.closest('[data-cursor]');
    const link = e.target.closest('a, button, [role="menuitem"], [role="menuitemradio"], .artists__photo');
    cursor.classList.toggle('is-label', !!labelled);
    cursor.classList.toggle('is-link', !!link && !labelled);
    if (labelled) label.textContent = labelled.dataset.cursor;
  });

  $$('[data-magnetic]').forEach((el) => {
    const inner = $('.btn__label', el);
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      gsap.to(el, { x: dx * 14, y: dy * 12, duration: 0.5, ease: 'power3.out' });
      if (inner) gsap.to(inner, { x: dx * 10, y: dy * 6, duration: 0.5, ease: 'power3.out' });
    });
    el.addEventListener('pointerleave', () => {
      gsap.to([el, inner].filter(Boolean), { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)' });
    });
  });
}

/* ───────────────────────── Header ───────────────────────── */
export const header = $('.header');
{
  let last = 0;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    if (y > 420 && y > last + 4) header.classList.add('is-hidden');
    else if (y < last - 4 || y <= 420) header.classList.remove('is-hidden');
    last = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // sliding hover pill
  const nav = $('.nav');
  const pill = $('.nav__pill');
  let shown = false;
  const current = $(`a[data-nav="${VIEW}"]`, nav);
  const rest = () => {
    if (!current) return gsap.to(pill, { opacity: 0, duration: 0.3, overwrite: true });
    gsap.to(pill, { x: current.offsetLeft, width: current.offsetWidth, opacity: 1, duration: 0.5, ease: 'power3.out', overwrite: true });
    shown = true;
  };
  if (current) {
    current.setAttribute('aria-current', 'page');
    gsap.set(pill, { x: current.offsetLeft, width: current.offsetWidth, opacity: 1 });
    shown = true;
    document.fonts?.ready.then(rest);
    window.addEventListener('resize', rest);
  }
  $$('a', nav).forEach((a) => {
    a.addEventListener('pointerenter', () => {
      const vars = { x: a.offsetLeft, width: a.offsetWidth, opacity: 1 };
      if (!shown) gsap.set(pill, { x: vars.x, width: vars.width });
      gsap.to(pill, { ...vars, duration: shown ? 0.5 : 0.25, ease: 'power3.out', overwrite: true });
      shown = true;
    });
  });
  nav.addEventListener('pointerleave', () => {
    shown = false;
    rest();
  });

  // language menu
  const lang = $('.lang');
  const langBtn = $('.lang__btn');
  langBtn.addEventListener('click', () => {
    const open = lang.classList.toggle('is-open');
    langBtn.setAttribute('aria-expanded', open);
  });
  $$('.lang__menu li').forEach((li) => {
    li.classList.toggle('is-active', li.dataset.lang === LANG);
    li.setAttribute('aria-checked', li.dataset.lang === LANG);
    const choose = () => {
      lang.classList.remove('is-open');
      langBtn.setAttribute('aria-expanded', false);
      setLang(li.dataset.lang);
    };
    li.addEventListener('click', choose);
    li.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), choose()));
  });
  document.addEventListener('click', (e) => {
    if (!lang.contains(e.target)) lang.classList.remove('is-open');
  });
}

/* ───────────────────────── Mobile menu ───────────────────────── */
const burger = $('.burger');
const mobileMenu = $('.mobile-menu');
function setMenu(open) {
  burger.setAttribute('aria-expanded', open);
  mobileMenu.setAttribute('aria-hidden', !open);
  gsap.killTweensOf(mobileMenu);
  if (open) {
    lenis?.stop();
    gsap.set(mobileMenu, { visibility: 'visible' });
    gsap.to(mobileMenu, { clipPath: 'inset(0 0 0% 0)', duration: 0.7, ease: 'power4.inOut' });
    gsap.fromTo($$('nav a, .pill', mobileMenu), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, delay: 0.25, ease: 'power3.out' });
  } else {
    lenis?.start();
    gsap.to(mobileMenu, { clipPath: 'inset(0 0 100% 0)', duration: 0.6, ease: 'power4.inOut', onComplete: () => gsap.set(mobileMenu, { visibility: 'hidden' }) });
  }
}
burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));

/* ───────────────────────── Generic reveals ───────────────────────── */
splits.forEach((words, el) => {
  if (el.closest('.hero')) return;
  ScrollTrigger.create({
    trigger: el,
    start: 'top 88%',
    once: true,
    onEnter: () => gsap.to(words, { yPercent: 0, duration: 0.75, ease: 'power4.out', stagger: 0.03 }),
  });
});

ScrollTrigger.batch('[data-reveal]', {
  start: 'top 90%',
  once: true,
  onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out', stagger: 0.05, overwrite: true }),
});

$$('[data-media]').forEach((media) => {
  const img = $('img', media);
  ScrollTrigger.create({
    trigger: media,
    start: 'top 98%', // as soon as it comes into view, so it's never sitting blank
    once: true,
    onEnter: () => {
      media.closest('.feature')?.classList.add('is-in');
      if (REDUCED) return;
      gsap.to(media, { clipPath: 'inset(0 0% 0 0)', duration: 0.75, ease: 'power3.out' });
      gsap.to(img, { scale: 1, duration: 1.1, ease: 'power3.out' });
    },
  });
  if (!REDUCED) {
    gsap.fromTo(img, { yPercent: 0 }, { yPercent: -13.5, ease: 'none', scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: true } });
  }
});

$$('[data-rule]').forEach((rule) => {
  gsap.to(rule, { scaleX: 1, duration: 1.4, ease: 'power4.inOut', scrollTrigger: { trigger: rule, start: 'top 88%' } });
});

$$('[data-counter]').forEach((el) => {
  const end = +el.dataset.counter;
  const state = { v: 0 };
  ScrollTrigger.create({
    trigger: el,
    start: 'top 92%',
    once: true,
    onEnter: () => gsap.to(state, { v: end, duration: 1.4, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(state.v)) }),
  });
});

/* ───────────────────────── Route overlay (stub pages) ───────────────────────── */
{
  const route = $('.route');
  const title = $('.route__title');
  const curtains = $$('.route__curtain');
  const content = $('.route__content');
  let open = false;
  let tl = null;

  function show(name) {
    if (open) return;
    open = true;
    if (burger.getAttribute('aria-expanded') === 'true') setMenu(false);
    lenis?.stop();
    title.textContent = name;
    const words = split(title);
    route.classList.add('is-open');
    route.setAttribute('aria-hidden', 'false');
    tl?.kill();
    tl = gsap.timeline();
    tl.set(route, { visibility: 'visible' })
      .set(curtains, { transformOrigin: 'bottom', scaleY: 0 })
      .to(curtains, { scaleY: 1, duration: REDUCED ? 0 : 0.8, ease: 'power4.inOut', stagger: 0.12 })
      .set(content, { opacity: 1 })
      .fromTo(words, { yPercent: 115 }, { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.08 }, '-=0.15')
      .fromTo($$('.eyebrow, .route__note, .route__back', content), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.08 }, '-=0.8');
    $('.route__back').focus({ preventScroll: true });
  }
  function hide() {
    if (!open) return;
    tl?.kill();
    tl = gsap.timeline({
      onComplete: () => {
        open = false;
        route.classList.remove('is-open');
        route.setAttribute('aria-hidden', 'true');
        gsap.set(route, { visibility: 'hidden' });
        lenis?.start();
      },
    });
    tl.to(content, { opacity: 0, y: -20, duration: 0.35, ease: 'power2.in' })
      .set(curtains, { transformOrigin: 'top' })
      .to([...curtains].reverse(), { scaleY: 0, duration: REDUCED ? 0 : 0.8, ease: 'power4.inOut', stagger: 0.12 })
      .set(content, { y: 0 });
  }

  // Links to pages that aren't built yet (data-page) stay clickable but do nothing.
  $$('[data-page]').forEach((el) => el.setAttribute('aria-disabled', 'true'));
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-page]');
    if (link) {
      e.preventDefault();
      return;
    }
    const anchor = e.target.closest('a[href]');
    if (!anchor || e.metaKey || e.ctrlKey || e.shiftKey || anchor.target === '_blank') return;
    const url = new URL(anchor.href, location.href);
    if (url.origin !== location.origin) return;
    const page = (p) => p.replace(/index\.html$/, '');
    e.preventDefault();
    if (page(url.pathname) === page(location.pathname)) {
      // already on this page: close anything open and glide back to the top
      hide();
      if (burger.getAttribute('aria-expanded') === 'true') setMenu(false);
      if (lenis) lenis.scrollTo(0, { duration: 1.4 });
      else window.scrollTo({ top: 0 });
      return;
    }
    leave(url.href);
  });

  // Page-to-page transition: blur this page behind a small spinner, then go.
  // The next page starts under the same blur (html.nav-quick) and clears it once it's ready.
  const pageload = $('.pageload');
  let leaving = false;
  function leave(href) {
    if (leaving) return;
    leaving = true;
    lenis?.stop();
    try {
      sessionStorage.setItem('exd-nav', '1');
    } catch {
      /* private mode: the next page just shows its full loader */
    }
    if (!pageload) {
      location.href = href;
      return;
    }
    pageload.classList.remove('is-off');
    pageload.classList.add('is-on');
    setTimeout(() => (location.href = href), REDUCED ? 60 : 320);
  }
  // Returning through the browser's back/forward cache: clear the blur.
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    leaving = false;
    open = false;
    pageload?.classList.remove('is-on');
    pageload?.classList.add('is-off');
    gsap.set(route, { visibility: 'hidden' });
    gsap.set(curtains, { scaleY: 0 });
    route.classList.remove('is-open');
    lenis?.start();
  });
  $('.route__back').addEventListener('click', hide);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hide();
      if (burger.getAttribute('aria-expanded') === 'true') setMenu(false);
    }
  });
}

/* ───────────────────────── Pixel field ───────────────────────── */
export function pixelField(canvas, el) {
  const ctx = canvas.getContext('2d');
  let cells = [];
  let blocks = [];
  let W = 0;
  let H = 0;
  const mouse = { x: -999, y: -999 };
  function build() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const rnd = mulberry(7);
    const G = 24;
    cells = [];
    const zone = Math.max(90, W * 0.11);
    for (let x = G / 2; x < W; x += G) {
      const edge = Math.min(x, W - x);
      if (edge > zone) continue;
      for (let y = 100; y < H - 20; y += G) {
        if (rnd() < 0.13 * (1 - edge / zone) + 0.03) cells.push({ x, y, p: rnd() * 6.28, s: 0.6 + rnd() * 1.6, w: rnd() < 0.2 ? 12 : 4 });
      }
    }
    blocks = [];
    const B = Math.round(clamp(W / 20, 40, 76));
    for (let i = 0; i < 26; i++) {
      const left = rnd() < 0.5;
      const col = Math.floor(rnd() * 4);
      const row = Math.floor(rnd() * 3);
      blocks.push({ x: left ? col * B : W - (col + 1) * B, y: H - (row + 1) * B, s: B, a: 0.12 + rnd() * 0.5, p: rnd() * 6.28, light: rnd() < 0.25 });
    }
  }
  function draw(time) {
    ctx.clearRect(0, 0, W, H);
    const t = time * 0.001;
    for (const b of blocks) {
      const a = b.a * (0.65 + 0.35 * Math.sin(t * 0.7 + b.p));
      ctx.fillStyle = b.light ? `rgba(255,255,255,${a * 0.16})` : `rgba(14,14,17,${a})`;
      ctx.fillRect(b.x, b.y, b.s, b.s);
    }
    for (const c of cells) {
      const d = Math.hypot(c.x - mouse.x, c.y - mouse.y);
      const near = clamp(1 - d / 140, 0, 1);
      const tw = Math.sin(t * c.s + c.p);
      const a = clamp((tw > 0.1 ? 0.9 : 0.22) + near, 0, 1);
      const size = 4 + near * 4;
      ctx.fillStyle = near > 0.3 ? `rgba(244,127,164,${a})` : `rgba(255,255,255,${a})`;
      ctx.fillRect(c.x - size / 2, c.y - size / 2, c.w > 4 ? c.w + near * 4 : size, c.w > 4 ? 3 : size);
    }
  }
  build();
  draw(0);
  window.addEventListener('resize', () => {
    build();
    draw(0);
  });
  if (!REDUCED) {
    el.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
    el.addEventListener('pointerleave', () => (mouse.x = mouse.y = -999));
    gsap.ticker.add((t) => {
      if (ScrollTrigger.isInViewport(el)) draw(t * 1000);
    });
  }
}

/* ───────────────────────── Loader → intro ───────────────────────── */
// Each page calls start() once its own modules are set up. `pageIntro` receives the
// shared intro timeline so the page's hero can join it.
// Scroll reveals should be finished by the time their content reaches the middle of the
// screen: every play-once reveal fires as its content enters the bottom of the window and
// plays faster. Scrubbed (scroll-linked) effects and in-view toggles keep their settings.
function tuneReveals() {
  ScrollTrigger.getAll().forEach((st) => {
    const v = st.vars;
    if (v.scrub || v.onToggle || v.end) return;
    const m = typeof v.start === 'string' && /^top (\d+)%$/.exec(v.start);
    if (m && +m[1] < 97) v.start = 'top 97%';
    if (st.animation && !st.animation._tuned) {
      st.animation.timeScale(1.6);
      st.animation._tuned = true;
    }
  });
}

export function start(pageIntro) {
  tuneReveals();
  const pre = $('.preloader');
  const count = $('[data-count]', pre);
  const bar = $('.preloader__bar span', pre);
  const state = { v: 0 };
  let quick = false;
  try {
    quick = sessionStorage.getItem('exd-nav') === '1';
    sessionStorage.removeItem('exd-nav');
  } catch {
    /* storage unavailable: use the full loader */
  }
  const firstImage = $('.hero img');
  const ready = Promise.all([
    document.fonts?.ready ?? Promise.resolve(),
    !firstImage || firstImage.complete ? Promise.resolve() : new Promise((res) => firstImage.addEventListener('load', res, { once: true })),
  ]);
  const timeout = new Promise((res) => setTimeout(res, 4000));
  const wait = (ms) => new Promise((res) => setTimeout(res, ms));
  const paint = () => {
    count.textContent = Math.round(state.v);
    bar.style.transform = `scaleX(${state.v / 100})`;
  };
  const finish = () => {
    document.body.classList.remove('is-loading');
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
    lenis?.start();
  };
  const intro = () => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.fromTo(header, { yPercent: -100, y: 0 }, { yPercent: 0, y: 0, duration: 1.1, clearProps: 'transform' }, 0.1)
      .from('.logo .l', { strokeDashoffset: 120, strokeDasharray: 120, duration: 1.4, stagger: 0.12, ease: 'power3.inOut' }, 0.2)
      .from('.nav a, .header__actions > *, .burger', { y: -18, opacity: 0, duration: 0.8, stagger: 0.05 }, 0.35);
    pageIntro?.(tl);
  };

  // the blur loader a page arrives under (see leave())
  const clearBlur = () => {
    $('.pageload')?.classList.add('is-off');
    document.documentElement.classList.remove('nav-quick');
  };

  if (REDUCED) {
    Promise.race([ready, timeout]).then(() => {
      pre.style.display = 'none';
      splits.forEach((w) => gsap.set(w, { yPercent: 0 }));
      clearBlur();
      finish();
    });
    return;
  }

  if (quick) {
    // Arriving from another page: no counter; the blur fades off as the page comes in.
    pre.style.display = 'none';
    Promise.all([Promise.race([ready, timeout]), wait(150)]).then(() => {
      clearBlur();
      finish();
      intro();
    });
    return;
  }

  const load = gsap.to(state, { v: 90, duration: 1.3, ease: 'power2.out', onUpdate: paint });
  Promise.all([Promise.race([ready, timeout]), wait(1100)]).then(() => {
    load.kill();
    gsap
      .timeline()
      .to(state, { v: 100, duration: 0.4, ease: 'power2.out', onUpdate: paint })
      .to('.preloader__inner', { y: -30, opacity: 0, duration: 0.5, ease: 'power3.in' })
      .to(pre, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'power4.inOut' }, '-=0.1')
      .add(() => {
        finish();
        intro();
      }, '-=0.75')
      .set(pre, { display: 'none' });
  });
}

window.addEventListener('load', () => ScrollTrigger.refresh());

