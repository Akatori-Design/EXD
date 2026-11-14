import { gsap, ScrollTrigger, $, $$, REDUCED, FINE, clamp, lenis, scrollVelocity, split, splits, mulberry, start, t } from './core.js';
import { landDots } from './worldmap.js';

/* ───────────────────────── Hero ───────────────────────── */
const hero = (() => {
  const el = $('.hero');
  const slides = $$('.hero__slide');
  const dots = $$('.hero__dots button');
  const HOLD = 6;
  let index = 0;
  let timer = null;
  let busy = false;
  let playing = false;

  const progress = (i) => {
    timer?.kill();
    gsap.set(dots.map((d) => d.firstElementChild), { scaleX: 0 });
    if (REDUCED) return;
    timer = gsap.to(dots[i].firstElementChild, { scaleX: 1, duration: HOLD, ease: 'none', paused: !playing, onComplete: () => go((i + 1) % slides.length) });
  };

  function go(next) {
    if (busy || next === index) return;
    busy = true;
    const from = slides[index];
    const to = slides[next];
    dots.forEach((d, i) => d.classList.toggle('is-active', i === next));
    gsap.set(to, { zIndex: 2, opacity: 1, clipPath: 'inset(0 0 0 100%)' });
    gsap.set(from, { zIndex: 1 });
    const tl = gsap.timeline({
      onComplete: () => {
        from.classList.remove('is-active');
        to.classList.add('is-active');
        gsap.set(from, { clearProps: 'opacity,clipPath,zIndex' });
        gsap.set(to, { clearProps: 'opacity,clipPath,zIndex' });
        gsap.set(from.firstElementChild, { clearProps: 'transform' });
        index = next;
        busy = false;
      },
    });
    tl.to(to, { clipPath: 'inset(0 0 0 0%)', duration: 1.5, ease: 'power4.inOut' }, 0)
      .fromTo(to.firstElementChild, { scale: 1.3, xPercent: 8 }, { scale: 1.06, xPercent: 0, duration: 2.4, ease: 'power3.out' }, 0)
      .to(from.firstElementChild, { xPercent: -8, scale: 1.12, duration: 1.5, ease: 'power4.inOut' }, 0);
    gsap.to(to.firstElementChild, { scale: 1, duration: HOLD + 2, ease: 'none', delay: 2.4 });
    progress(next);
  }

  dots.forEach((d, i) => d.addEventListener('click', () => go(i)));

  ScrollTrigger.create({
    trigger: el,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      playing = self.isActive && !document.hidden;
      timer?.paused(!playing);
    },
  });
  document.addEventListener('visibilitychange', () => {
    playing = !document.hidden && ScrollTrigger.isInViewport(el);
    timer?.paused(!playing);
  });

  if (!REDUCED) {
    gsap.to('.hero__media', { yPercent: 50, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__content', { y: -70, opacity: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: '25% top', end: 'bottom top', scrub: true } });
  }

  return {
    intro(tl) {
      tl.fromTo(slides[0].firstElementChild, { scale: 1.35 }, { scale: 1.06, duration: 2.6, ease: 'power3.out' }, 0)
        .to(splits.get($('.hero__title')), { yPercent: 0, duration: 1.3, stagger: 0.09 }, 0.35)
        .to(splits.get($('.hero__sub')), { yPercent: 0, duration: 1, stagger: 0.03 }, 0.7)
        .from('.hero__body', { y: 24, opacity: 0, duration: 1 }, 1)
        .from('.hero .btn', { y: 24, opacity: 0, duration: 1 }, 1.12)
        .from('.hero .btn__frame', { inset: 14, opacity: 0, duration: 1.2 }, 1.2)
        .from('.hero__dots button', { scaleX: 0, transformOrigin: 'left', duration: 0.8, stagger: 0.08 }, 1.3)
        .add(() => {
          playing = true;
          progress(0);
        }, 1.4);
      return tl;
    },
  };
})();

/* ───────────────────────── Map ───────────────────────── */
{
  const section = $('.reach');
  const canvas = $('.reach__map');
  const ctx = canvas.getContext('2d');
  const COLS = 128;
  const { dots, rows } = landDots(COLS);
  const rnd = mulberry(42);
  dots.forEach((d) => {
    d.j = rnd();
    d.glow = 0;
  });
  let W = 0;
  let H = 0;
  let pitch = 8;
  const mouse = { x: -999, y: -999 };
  const state = { reveal: REDUCED ? 2 : 0 };
  const pings = [];
  let lastPing = 0;

  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    pitch = W / COLS;
  }
  let now = 0;
  function draw(time = now) {
    now = time;
    const t = time * 0.001;
    ctx.clearRect(0, 0, W, H);
    const r0 = pitch * 0.37;
    if (!REDUCED && t - lastPing > 0.55 && state.reveal > 1) {
      lastPing = t;
      const d = dots[(Math.random() * dots.length) | 0];
      pings.push({ x: (d.c + 0.5) * pitch, y: (d.r + 0.5) * pitch, t });
    }
    const sweep = ((t * 0.16) % 1.4) * COLS - COLS * 0.2;
    for (const d of dots) {
      const x = (d.c + 0.5) * pitch;
      const y = (d.r + 0.5) * pitch;
      const local = clamp((state.reveal * 1.5 - d.c / COLS - d.j * 0.35) * 3, 0, 1);
      if (local <= 0) continue;
      const near = clamp(1 - Math.hypot(x - mouse.x, y - mouse.y) / 110, 0, 1);
      d.glow += (near - d.glow) * 0.14;
      const wave = clamp(1 - Math.abs(d.c - sweep) / 7, 0, 1);
      const g = Math.max(d.glow, wave * 0.55);
      const r = r0 * (0.4 + 0.6 * local) * (1 + g * 0.75);
      ctx.beginPath();
      ctx.arc(x, y - g * 3, r, 0, 6.2832);
      ctx.fillStyle = g > 0.02 ? `rgba(${244 + 11 * g},${127 + 110 * g},${164 + 80 * g},${local})` : `rgba(244,127,164,${local * (0.82 + 0.18 * Math.sin(t * 1.4 + d.j * 20))})`;
      ctx.fill();
    }
    for (let i = pings.length - 1; i >= 0; i--) {
      const p = pings[i];
      const k = (t - p.t) / 1.8;
      if (k >= 1) {
        pings.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3 + Math.max(k, 0) * 30, 0, 6.2832);
      ctx.strokeStyle = `rgba(255,255,255,${(1 - k) * 0.7})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(p.x, p.y, pitch * 0.42, 0, 6.2832);
      ctx.fillStyle = `rgba(255,255,255,${1 - k})`;
      ctx.fill();
    }
  }
  size();
  draw(0);
  window.addEventListener('resize', () => {
    size();
    draw();
  });
  section.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  section.addEventListener('pointerleave', () => (mouse.x = mouse.y = -999));
  if (!REDUCED) {
    gsap.to(state, { reveal: 2, duration: 2.6, ease: 'power2.out', scrollTrigger: { trigger: section, start: 'top 80%' } });
    gsap.ticker.add((t) => {
      if (ScrollTrigger.isInViewport(section)) draw(t * 1000);
    });
    gsap.fromTo(canvas, { yPercent: -6 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true } });
  }
  void rows;
}

/* ───────────────────────── Marquee ───────────────────────── */
{
  const marquee = $('.marquee');
  const track = $('.marquee__track');
  const clone = track.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  marquee.append(clone);
  let x = 0;
  const dir = -1; // always travels left, so logos enter from the right
  let hover = 1;
  let boost = 0;
  marquee.addEventListener('pointerenter', () => gsap.to({ v: hover }, { v: 0.15, duration: 0.6, onUpdate() { hover = this.targets()[0].v; } }));
  marquee.addEventListener('pointerleave', () => gsap.to({ v: hover }, { v: 1, duration: 0.8, onUpdate() { hover = this.targets()[0].v; } }));
  if (!REDUCED) {
    gsap.ticker.add((t, dt) => {
      const w = track.offsetWidth;
      if (!w) return;
      const v = scrollVelocity();
      boost += (Math.abs(v) * 0.9 - boost) * 0.1;
      x += dir * (70 * hover + boost * 60) * (dt / 1000);
      x = ((x % w) - w) % w;
      const skew = clamp(v * 0.25, -8, 8);
      gsap.set([track, clone], { x, skewX: -skew });
    });
  }
  gsap.from(marquee, { opacity: 0, duration: 1.2, scrollTrigger: { trigger: marquee, start: 'top 95%' } });
}

/* ───────────────────────── Service cards ───────────────────────── */
{
  const cards = $$('.card');
  if (!REDUCED) {
    gsap.from(cards, {
      y: 90,
      opacity: 0,
      rotateX: -14,
      transformOrigin: '50% 100%',
      duration: 1.3,
      ease: 'power4.out',
      stagger: 0.12,
      scrollTrigger: { trigger: '.cards', start: 'top 85%' },
    });
    cards.forEach((card, i) => {
      gsap.fromTo($('.card__media', card), { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } });
      if (!FINE) return;
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', `${px * 100}%`);
        card.style.setProperty('--my', `${py * 100}%`);
        gsap.to(card, { rotateY: (px - 0.5) * 12, rotateX: (0.5 - py) * 10, y: -8, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
      });
      card.addEventListener('pointerleave', () => gsap.to(card, { rotateY: 0, rotateX: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.6)', overwrite: 'auto' }));
      void i;
    });
  }
}

/* ───────────────────────── What is EXD ───────────────────────── */
{
  const eq = $('.eq');
  const N = 24;
  const bars = Array.from({ length: N }, () => eq.appendChild(document.createElement('i')));
  const gate = { v: 0 };
  if (REDUCED) {
    bars.forEach((b, i) => (b.style.transform = `scaleY(${0.3 + 0.7 * Math.abs(Math.sin(i * 0.9))})`));
  } else {
    gsap.to(gate, { v: 1, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: eq, start: 'top 90%' } });
    gsap.ticker.add((t) => {
      if (!ScrollTrigger.isInViewport(eq)) return;
      const energy = 1 + Math.min(Math.abs(scrollVelocity()) * 0.03, 0.6);
      for (let i = 0; i < N; i++) {
        const env = 0.35 + 0.65 * Math.sin((i / (N - 1)) * Math.PI);
        const h = Math.abs(Math.sin(t * 3.1 + i * 0.55) * Math.sin(t * 1.7 + i * 1.9)) * 0.85 + 0.15;
        bars[i].style.transform = `scaleY(${clamp(h * env * energy, 0.08, 1) * gate.v})`;
      }
    });
    gsap.from('.slashes i', { scaleY: 0, rotate: 0, duration: 1.1, ease: 'power4.out', stagger: 0.12, scrollTrigger: { trigger: '.what__head', start: 'top 85%' } });
    gsap.fromTo('.what__glyphs', { y: 160 }, { y: -160, ease: 'none', scrollTrigger: { trigger: '.what', start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
    gsap.from('.what__panel', { xPercent: 12, opacity: 0, duration: 1.4, ease: 'power4.out', scrollTrigger: { trigger: '.what__feature', start: 'top 75%' } });
    // offset column drifts at a different speed
    $$('.feature--offset').forEach((f) => gsap.fromTo(f, { y: 50 }, { y: -50, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: 0.6 } }));
  }
}

/* ───────────────────────── Team ───────────────────────── */
{
  const rect = $('.team__border rect');
  rect.setAttribute('pathLength', '1');
  const lines = $$('.team__title .line > span');
  if (!REDUCED) {
    gsap.set(rect, { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 });
    gsap.set(lines, { yPercent: 115 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.team__box', start: 'top 72%' } });
    tl.to(rect, { strokeDashoffset: 0, duration: 2, ease: 'power3.inOut' }).to(rect, { fillOpacity: 1, duration: 1 }, 0.8).to(lines, { yPercent: 0, duration: 1.2, ease: 'power4.out', stagger: 0.14 }, 0.5);
    gsap.fromTo('.team__bg img', { yPercent: -7, scale: 1.12 }, { yPercent: 7, scale: 1, ease: 'none', scrollTrigger: { trigger: '.team', start: 'top bottom', end: 'bottom top', scrub: true } });
  }
}

/* ───────────────────────── Artists carousel ───────────────────────── */
{
  const data = [
    { name: 'Jay Park', role: 'Artist & Singer', quote: '"Using EXD is like having a whole studio in your pocket. It gives me the freedom to experiment with sounds anytime, anywhere, turning inspiration into reality in an instant. It\'s revolutionized the way I create, making the creative process more fluid and intuitive."' },
    { name: 'DJ Khaled', role: 'Artist & Producer', quote: '"With EXD, I\'ve got endless possibilities right at my fingertips. It\'s made collaboration and creativity so much more accessible, allowing me to fine-tune every beat and melody on the go. The best part is how it breaks down barriers, letting anyone with a passion for music dive straight into producing."' },
    { name: 'Jessi', role: 'Singer', quote: '"EXD is like having a portable studio that adapts to my creative flow. I can capture ideas in the moment, layer sounds, and shape tracks with precision, all from my phone. It\'s given me the power to bring my musical vision to life, no matter where I am."' },
    { name: 'Koala', role: 'Artist', quote: '"EXD has unlocked a new level of spontaneity in my creative process. I can lay down ideas in real-time and refine them as they evolve, without being tied to a traditional studio setup. It\'s allowed me to push boundaries and work with total freedom."' },
  ];
  const section = $('.artists');
  const imgs = $$('.artists__photo img');
  const photo = $('.artists__photo');
  const wipe = $('.artists__wipe');
  const ghost = $('.artists__ghost span');
  const name = $('.artists__name span');
  const role = $('.artists__role span');
  const quote = $('.artists__quote');
  const bar = $('.artists__progress span');
  const num = $('.artists__index b');
  const HOLD = 7;
  let index = 0;
  let busy = false;
  let auto = null;
  let inView = false;
  let hovered = false;

  const setQuote = (text) => {
    quote.textContent = t(text);
    return split(quote);
  };
  const fill = (d) => {
    ghost.textContent = d.name;
    name.textContent = d.name;
    role.textContent = t(d.role);
  };
  fill(data[0]);
  setQuote(data[0].quote);

  const restart = () => {
    auto?.kill();
    gsap.set(bar, { scaleX: 0 });
    if (REDUCED) return;
    auto = gsap.to(bar, { scaleX: 1, duration: HOLD, ease: 'none', paused: !inView || hovered, onComplete: () => go(1) });
  };

  function go(dir) {
    if (busy) return;
    busy = true;
    const next = (index + dir + data.length) % data.length;
    const d = data[next];
    const from = imgs[index];
    const to = imgs[next];
    auto?.kill();
    if (REDUCED) {
      from.classList.remove('is-active');
      to.classList.add('is-active');
      fill(d);
      setQuote(d.quote);
      num.textContent = String(next + 1).padStart(2, '0');
      index = next;
      busy = false;
      return;
    }
    const oldWords = $$('.w > span', quote);
    const tl = gsap.timeline({
      onComplete: () => {
        index = next;
        busy = false;
        restart();
      },
    });
    tl.set(wipe, { transformOrigin: dir > 0 ? 'left' : 'right' })
      .to(wipe, { scaleX: 1, duration: 0.55, ease: 'power4.inOut' }, 0)
      .to(from, { scale: 1.15, xPercent: dir * 6, duration: 0.55, ease: 'power4.inOut' }, 0)
      .to(ghost, { xPercent: -dir * 30, opacity: 0, duration: 0.5, ease: 'power3.in' }, 0)
      .to([name, role], { yPercent: -115, duration: 0.45, ease: 'power3.in', stagger: 0.05 }, 0)
      .to(oldWords, { yPercent: -110, opacity: 0, duration: 0.35, ease: 'power2.in', stagger: { amount: 0.15 } }, 0)
      .to(bar, { scaleX: 0, transformOrigin: 'right', duration: 0.5, ease: 'power3.inOut' }, 0)
      .add(() => {
        from.classList.remove('is-active');
        to.classList.add('is-active');
        gsap.set(from, { clearProps: 'transform' });
        fill(d);
        num.textContent = String(next + 1).padStart(2, '0');
        const words = setQuote(d.quote);
        gsap.fromTo(words, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: { amount: 0.5 } });
        gsap.set(bar, { transformOrigin: 'left' });
      }, 0.56)
      .set(wipe, { transformOrigin: dir > 0 ? 'right' : 'left' }, 0.56)
      .to(wipe, { scaleX: 0, duration: 0.7, ease: 'power4.inOut' }, 0.58)
      .fromTo(to, { scale: 1.25, xPercent: -dir * 6 }, { scale: 1, xPercent: 0, duration: 1.3, ease: 'power3.out' }, 0.58)
      .fromTo(ghost, { xPercent: dir * 30, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 1.1, ease: 'power4.out' }, 0.6)
      .fromTo([name, role], { yPercent: 115 }, { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.08 }, 0.62);
  }

  $$('.arrow-btn', section).forEach((b) => b.addEventListener('click', () => go(+b.dataset.dir)));
  section.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  });

  // drag / swipe on the photo
  let startX = null;
  photo.addEventListener('pointerdown', (e) => {
    startX = e.clientX;
    photo.setPointerCapture(e.pointerId);
  });
  photo.addEventListener('pointermove', (e) => {
    if (startX === null || busy) return;
    gsap.to(imgs[index], { xPercent: clamp((e.clientX - startX) / 8, -8, 8), duration: 0.3, overwrite: 'auto' });
  });
  let swiped = false;
  const release = (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    swiped = Math.abs(dx) > 6;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    else gsap.to(imgs[index], { xPercent: 0, duration: 0.6, ease: 'power3.out' });
  };
  photo.addEventListener('pointerup', release);
  photo.addEventListener('pointercancel', release);

  const stage = $('.artists__stage');
  // clicking anywhere on the card is the same as the next arrow (a swipe isn't a click)
  stage.dataset.cursor = t('Next');
  stage.addEventListener('click', (e) => {
    if (swiped) {
      swiped = false;
      return;
    }
    if (e.target.closest('a, button') || String(getSelection()).length) return;
    go(1);
  });
  stage.addEventListener('pointerenter', () => {
    hovered = true;
    auto?.pause();
  });
  stage.addEventListener('pointerleave', () => {
    hovered = false;
    if (inView) auto?.play();
  });

  ScrollTrigger.create({
    trigger: section,
    start: 'top 70%',
    end: 'bottom 20%',
    onToggle: (self) => {
      inView = self.isActive;
      if (!auto) restart();
      if (inView && !hovered) auto?.play();
      else auto?.pause();
    },
  });

  if (!REDUCED) {
    const words = $$('.w > span', quote);
    gsap.set([name, role], { yPercent: 115 });
    gsap.set(words, { yPercent: 110, opacity: 0 });
    gsap.set(wipe, { scaleX: 1, transformOrigin: 'right' });
    const tl = gsap.timeline({ scrollTrigger: { trigger: stage, start: 'top 95%' } });
    tl.to(wipe, { scaleX: 0, duration: 0.6, ease: 'power3.out' })
      .from(imgs[0], { scale: 1.3, duration: 1.6, ease: 'power3.out' }, 0.1)
      .from(ghost, { xPercent: 25, opacity: 0, duration: 1.4, ease: 'power4.out' }, 0.2)
      .to([name, role], { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.1 }, 0.35)
      .to(words, { yPercent: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: { amount: 0.5 } }, 0.5)
      .from('.artists .dashes i', { scaleX: 0, transformOrigin: 'left', duration: 0.9, ease: 'power3.out', stagger: 0.1 }, 0.8)
      .from('.artists__progress', { scaleX: 0, transformOrigin: 'left', duration: 1.2, ease: 'power4.inOut' }, 0.4);
    gsap.fromTo('.artists__ghost', { x: 60 }, { x: -60, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
  }
}

/* ───────────────────────── Freedom ───────────────────────── */
if (!REDUCED) {
  gsap.fromTo('.freedom__bg img', { yPercent: -9, scale: 1.12 }, { yPercent: 9, scale: 1.02, ease: 'none', scrollTrigger: { trigger: '.freedom', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.faq__flower', { rotate: -8, y: 60 }, { rotate: 6, y: -40, ease: 'none', scrollTrigger: { trigger: '.faq', start: 'top bottom', end: 'bottom top', scrub: 1 } });
}

/* ───────────────────────── FAQ ───────────────────────── */
$$('.faq__item').forEach((item, _, all) => {
  const q = $('.faq__q', item);
  q.addEventListener('click', () => {
    const open = !item.classList.contains('is-open');
    all.forEach((other) => {
      other.classList.toggle('is-open', other === item && open);
      $('.faq__q', other).setAttribute('aria-expanded', other === item && open);
    });
    setTimeout(() => ScrollTrigger.refresh(), 750);
  });
});


start((tl) => hero.intro(tl));
