import { gsap, ScrollTrigger, $, $$, REDUCED, FINE, clamp, splits, pixelField, start } from './core.js';

/* ───────────────────────── Hero ───────────────────────── */
const heroEl = $('.hero');
const heroImg = $('.about-hero__img img');
pixelField($('.hero__pixels'), heroEl);

// A field of dots riding two sine waves, drawn over the photo so the wave feels alive.
{
  const canvas = $('.about-hero__wave');
  const ctx = canvas.getContext('2d');
  const COLS = 120;
  const ROWS = 20;
  let W = 0;
  let H = 0;
  const mouse = { x: -999, y: -999, k: 0 };

  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function draw(time) {
    const t = time * 0.001;
    ctx.clearRect(0, 0, W, H);
    for (let r = 0; r < ROWS; r++) {
      const depth = r / (ROWS - 1);
      for (let c = 0; c <= COLS; c++) {
        const x = (c / COLS) * W;
        let y = H * (0.3 + depth * 0.5);
        y += Math.sin(x * 0.0042 + t * 0.55 + depth * 2.4) * H * 0.085;
        y += Math.sin(x * 0.0016 - t * 0.32 + depth * 1.1) * H * 0.12;
        const d = Math.hypot(x - mouse.x, y - mouse.y);
        const near = clamp(1 - d / 220, 0, 1) * mouse.k;
        y -= near * near * 34;
        const crest = (Math.sin(x * 0.0042 + t * 0.55 + depth * 2.4) + 1) / 2;
        const a = (0.08 + crest * 0.42) * (0.35 + depth * 0.65) + near * 0.5;
        const rad = 0.8 + depth * 1.1 + near * 1.6;
        ctx.fillStyle = near > 0.05 ? `rgba(244,160,190,${clamp(a, 0, 1)})` : `rgba(120,232,236,${clamp(a, 0, 1)})`;
        ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      }
    }
  }
  size();
  draw(0);
  window.addEventListener('resize', () => {
    size();
    draw(0);
  });
  if (!REDUCED) {
    heroEl.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      gsap.to(mouse, { k: 1, duration: 0.6, overwrite: true });
    });
    heroEl.addEventListener('pointerleave', () => gsap.to(mouse, { k: 0, duration: 1, overwrite: true }));
    gsap.ticker.add((t) => {
      if (ScrollTrigger.isInViewport(heroEl)) draw(t * 1000);
    });

    // photo leans away from the cursor (its slow breathing starts after the intro)
    if (FINE) {
      const xTo = gsap.quickTo(heroImg, 'xPercent', { duration: 1.2, ease: 'power3' });
      const yTo = gsap.quickTo(heroImg, 'yPercent', { duration: 1.2, ease: 'power3' });
      heroEl.addEventListener('pointermove', (e) => {
        xTo((e.clientX / innerWidth - 0.5) * -3);
        yTo((e.clientY / innerHeight - 0.5) * -3);
      });
    }
    gsap.to('.hero__media', { yPercent: 50, ease: 'none', scrollTrigger: { trigger: heroEl, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__content', { y: -70, opacity: 0.1, ease: 'none', scrollTrigger: { trigger: heroEl, start: '25% top', end: 'bottom top', scrub: true } });
  }
}

/* ───────────────────────── Family ───────────────────────── */
if (!REDUCED) {
  const media = $('.family__media');
  gsap.fromTo(media, { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.family', start: 'top 95%' } });
  gsap.fromTo($('img', media), { scale: 1.3 }, { scale: 1.08, duration: 2.2, ease: 'power3.out', scrollTrigger: { trigger: '.family', start: 'top 75%' } });
  gsap.fromTo($('img', media), { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.family', start: 'top bottom', end: 'bottom top', scrub: true } });
}

/* ───────────────────────── How we started ───────────────────────── */
if (!REDUCED) {
  const section = $('.started');
  gsap.fromTo('.started__bg img', { scale: 1.25, xPercent: -4 }, { scale: 1.05, xPercent: 4, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true } });
  const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 70%' } });
  tl.from('.started .ln--v', { scaleY: 0, duration: 1.6, ease: 'power4.inOut', stagger: 0.15 })
    .from('.started .ln--h', { scaleX: 0, duration: 1.4, ease: 'power4.inOut' }, 0.2)
    .from('.started .squares i', { scale: 0, duration: 0.6, ease: 'back.out(3)', stagger: 0.12 }, 0.5)
    .from('.started .specks i', { opacity: 0, duration: 0.4, stagger: { amount: 0.8, from: 'random' } }, 0.6);
  gsap.to('.started .squares i', { opacity: 0.35, duration: 0.9, ease: 'steps(1)', repeat: -1, yoyo: true, stagger: 0.3 });
  gsap.fromTo('.started__inner', { y: 40 }, { y: -40, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
}

/* ───────────────────────── Stats + values ───────────────────────── */
{
  const cells = $$('.value');
  if (!REDUCED) {
    gsap.from('.values__ticks i', { scaleY: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: '.values__ticks', start: 'top 90%' } });
    cells.forEach((cell, i) => {
      gsap.from([$('h3', cell), $('p', cell)], {
        y: 36,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.08,
        delay: (i % 2) * 0.12,
        scrollTrigger: { trigger: cell, start: 'top 88%' },
      });
      gsap.from(cell, { '--line': 0, duration: 1.3, ease: 'power4.inOut', delay: (i % 2) * 0.12, scrollTrigger: { trigger: cell, start: 'top 92%' } });
    });
    gsap.fromTo('.values__glow', { opacity: 0.5, yPercent: 12 }, { opacity: 1, yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.values', start: 'top bottom', end: 'bottom top', scrub: true } });
  }
  // spotlight follows the cursor inside each cell
  if (FINE) {
    cells.forEach((cell) => {
      cell.addEventListener('pointermove', (e) => {
        const r = cell.getBoundingClientRect();
        cell.style.setProperty('--mx', `${e.clientX - r.left}px`);
        cell.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }
}

/* ───────────────────────── Partners ───────────────────────── */
if (!REDUCED) {
  // starts as the section comes into view; the band and logos land within about a second
  const tl = gsap.timeline({ scrollTrigger: { trigger: '.partners__mark', start: 'top 98%' } });
  tl.from('.partners__mark .l', { strokeDashoffset: 120, strokeDasharray: 120, duration: 0.9, ease: 'power3.inOut', stagger: 0.08 })
    .from('.partners__stem', { scaleY: 0, duration: 0.6, ease: 'power3.out' }, 0.15)
    .fromTo('.partners__band', { clipPath: 'inset(0% 50% 0% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.75, ease: 'power3.out' }, 0.2)
    .fromTo('.partner', { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 0.92, duration: 0.6, ease: 'power3.out', stagger: 0.08, clearProps: 'all' }, 0.35);
}

/* ───────────────────────── Intro ───────────────────────── */
start((tl) => {
  tl.fromTo(heroImg, { scale: 1.4 }, { scale: 1.08, duration: 2.6, ease: 'power3.out' }, 0)
    .from('.about-hero__wave, .hero__pixels', { opacity: 0, duration: 1.8, ease: 'none' }, 0.3)
    .to(splits.get($('.hero__title')), { yPercent: 0, duration: 1.3, stagger: 0.07 }, 0.35)
    .from('.hero__body', { y: 26, opacity: 0, duration: 1.1 }, 0.85)
    .from('.marks i', { scaleX: 0, duration: 0.8, stagger: 0.1 }, 1.1)
    .add(() => gsap.to(heroImg, { scale: 1.18, duration: 14, ease: 'sine.inOut', yoyo: true, repeat: -1 }), 2.6);
});
