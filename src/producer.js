import { gsap, ScrollTrigger, $, $$, REDUCED, FINE, splits, pixelField, start } from './core.js';

/* ───────────────────────── Hero ───────────────────────── */
const heroEl = $('.hero');
const heroImg = $('.page-hero__img img');
pixelField($('.hero__pixels'), heroEl);
if (!REDUCED) {
  if (FINE) {
    const xTo = gsap.quickTo(heroImg, 'xPercent', { duration: 1.2, ease: 'power3' });
    const yTo = gsap.quickTo(heroImg, 'yPercent', { duration: 1.2, ease: 'power3' });
    heroEl.addEventListener('pointermove', (e) => {
      xTo((e.clientX / innerWidth - 0.5) * -2.5);
      yTo((e.clientY / innerHeight - 0.5) * -2.5);
    });
  }
  gsap.to('.hero__media', { yPercent: 16, ease: 'none', scrollTrigger: { trigger: heroEl, start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__content', { y: -70, opacity: 0.1, ease: 'none', scrollTrigger: { trigger: heroEl, start: '25% top', end: 'bottom top', scrub: true } });
}

/* ───────────────────────── Feature rows ───────────────────────── */
// The photos reveal through the shared [data-media] handler; here the text side
// slides in from its own edge and the accents draw themselves.
$$('.row').forEach((row) => {
  if (REDUCED) return;
  const flip = row.classList.contains('row--flip');
  const text = $('.row__text', row);
  const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 80%' } });
  tl.from($('h3', text), { x: flip ? -40 : 40, opacity: 0, duration: 1, ease: 'power3.out' }, 0.15)
    .from($('.row__ticks', text), { scaleY: 0, transformOrigin: 'bottom', duration: 0.7, ease: 'power4.out' }, 0.2)
    .from($('.row__panel', text), { '--open': 0, duration: 1.2, ease: 'power4.inOut' }, 0.25)
    .from($('.row__icon', text), { rotate: -180, scale: 0, duration: 0.9, ease: 'back.out(2)' }, 0.6)
    .from($('p', text), { y: 18, opacity: 0, duration: 0.8, ease: 'power3.out' }, 0.75)
    .from($('.row__line', text), { scaleX: 0, duration: 1.1, ease: 'power4.inOut' }, 0.8);
  // text and photo drift at slightly different speeds
  gsap.fromTo(text, { y: 30 }, { y: -30, ease: 'none', scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
});

if (!REDUCED) {
  gsap.fromTo('.rows .what__glyphs', { y: 200 }, { y: -200, ease: 'none', scrollTrigger: { trigger: '.rows', start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
  gsap.fromTo('.rows__flower', { rotate: -10, y: 80 }, { rotate: 8, y: -60, ease: 'none', scrollTrigger: { trigger: '.rows', start: 'top bottom', end: 'bottom top', scrub: 1 } });

  /* ─────────────────────── Why producers ─────────────────────── */
  gsap.fromTo('.whyp__flower', { rotate: -8, y: 60 }, { rotate: 6, y: -40, ease: 'none', scrollTrigger: { trigger: '.whyp', start: 'top bottom', end: 'bottom top', scrub: 1 } });
  $$('.why__list li').forEach((li) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 88%' } });
    tl.from(li, { '--line': 0, duration: 1.2, ease: 'power4.inOut' }, 0).from([$('h3', li), $('p', li)], { y: 26, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 }, 0.1);
  });

  /* ─────────────────────── Closing banner ─────────────────────── */
  gsap.fromTo('.freedom__bg img', { yPercent: -9, scale: 1.14 }, { yPercent: 9, scale: 1.02, ease: 'none', scrollTrigger: { trigger: '.freedom', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.freedom .marks i', { scaleX: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, scrollTrigger: { trigger: '.freedom .marks', start: 'top 92%' } });
}

/* ───────────────────────── Intro ───────────────────────── */
start((tl) => {
  tl.fromTo(heroImg, { scale: 1.35 }, { scale: 1.08, duration: 2.6, ease: 'power3.out' }, 0)
    .from('.hero__pixels', { opacity: 0, duration: 1.6, ease: 'none' }, 0.4)
    .from('.tag', { y: 20, opacity: 0, duration: 0.9 }, 0.3)
    .to(splits.get($('.hero__title')), { yPercent: 0, duration: 1.3, stagger: 0.08 }, 0.4)
    .to(splits.get($('.hero__sub')), { yPercent: 0, duration: 1, stagger: 0.04 }, 0.75)
    .from('.hero__body', { y: 24, opacity: 0, duration: 1 }, 1)
    .from('.hero .btn', { y: 24, opacity: 0, duration: 1 }, 1.12)
    .from('.hero .btn__frame', { inset: 14, opacity: 0, duration: 1.2 }, 1.2)
    .from('.hero .marks i', { scaleX: 0, duration: 0.8, stagger: 0.08 }, 1.3)
    .add(() => gsap.to(heroImg, { scale: 1.16, duration: 14, ease: 'sine.inOut', yoyo: true, repeat: -1 }), 2.6);
});
