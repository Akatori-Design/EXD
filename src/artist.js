import { gsap, ScrollTrigger, $, $$, REDUCED, FINE, splits, pixelField, start, t, t as tr } from './core.js';

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
  gsap.to('.hero__media', { yPercent: 50, ease: 'none', scrollTrigger: { trigger: heroEl, start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__content', { y: -70, opacity: 0.1, ease: 'none', scrollTrigger: { trigger: heroEl, start: '25% top', end: 'bottom top', scrub: true } });
}

/* ───────────────────────── Four steps ───────────────────────── */
{
  const section = $('.steps');
  const steps = $$('.step');
  const shots = $$('.shot');
  const dots = $$('.steps__dots i');
  const HOLD = 7;
  let index = 0;
  let auto = null;
  let inView = false;
  let hovered = false;

  // chart (step 3) pieces
  const reveal = $('.chart__reveal');
  const nums = $$('[data-num]');
  const bars = $$('.bars i');
  const barHeights = [0.55, 0.8, 0.45, 0.7, 0.95, 0.6];
  function playChart() {
    if (REDUCED) {
      nums.forEach((n) => (n.textContent = Number(n.dataset.num).toLocaleString('en-US')));
      bars.forEach((b, i) => (b.style.setProperty('--h', barHeights[i])));
      return;
    }
    // the lines are uncovered left to right by widening their clip rectangle
    gsap.fromTo(reveal, { attr: { width: 0 } }, { attr: { width: 500 }, duration: 2, ease: 'power2.inOut', delay: 0.3 });
    nums.forEach((n) => {
      const state = { v: 0 };
      gsap.to(state, { v: +n.dataset.num, duration: 1.6, ease: 'power3.out', delay: 0.4, onUpdate: () => (n.textContent = Math.round(state.v).toLocaleString('en-US')) });
    });
    gsap.fromTo(bars, { '--h': 0 }, { '--h': (i) => barHeights[i], duration: 0.9, ease: 'power3.out', stagger: 0.07, delay: 0.5 });
    gsap.fromTo('.chart__top, .chart__x, .mini', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.08 });
  }

  const restart = () => {
    auto?.kill();
    gsap.set($$('.step__bar'), { scaleX: 0 });
    if (REDUCED) return;
    auto = gsap.to($('.step__bar', steps[index]), { scaleX: 1, duration: HOLD, ease: 'none', paused: !inView || hovered, onComplete: () => go((index + 1) % steps.length) });
  };

  function go(next) {
    if (next === index) return;
    const prev = index;
    index = next;
    steps.forEach((s, i) => {
      s.classList.toggle('is-active', i === next);
      s.setAttribute('aria-selected', i === next);
    });
    dots.forEach((d, i) => d.classList.toggle('is-active', i === next));
    const from = shots[prev];
    const to = shots[next];
    const dir = next > prev ? 1 : -1;
    to.classList.add('is-active');
    if (REDUCED) {
      from.classList.remove('is-active');
    } else {
      gsap.killTweensOf([from, to]);
      gsap.to(from, { opacity: 0, yPercent: -6 * dir, scale: 0.96, duration: 0.5, ease: 'power3.in', onComplete: () => from.classList.remove('is-active') });
      gsap.fromTo(to, { opacity: 0, yPercent: 8 * dir, scale: 1.04 }, { opacity: 1, yPercent: 0, scale: 1, duration: 0.9, ease: 'power4.out', delay: 0.25 });
    }
    if (to.classList.contains('shot--chart')) playChart();
    restart();
    setTimeout(() => ScrollTrigger.refresh(), 700);
  }

  steps.forEach((s, i) => s.addEventListener('click', () => go(i)));
  $('.steps__list').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') go((index + 1) % steps.length);
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') go((index + steps.length - 1) % steps.length);
  });
  const body = $('.steps__body');
  body.addEventListener('pointerenter', () => {
    hovered = true;
    auto?.pause();
  });
  body.addEventListener('pointerleave', () => {
    hovered = false;
    if (inView) auto?.play();
  });
  ScrollTrigger.create({
    trigger: body,
    start: 'top 75%',
    end: 'bottom 20%',
    onToggle: (self) => {
      inView = self.isActive;
      if (!auto) restart();
      if (inView && !hovered) auto?.play();
      else auto?.pause();
    },
  });

  if (!REDUCED) {
    gsap.from('.slashes--red i', { scaleY: 0, duration: 1, ease: 'power4.out', stagger: 0.12, scrollTrigger: { trigger: '.steps__head', start: 'top 85%' } });
    gsap.from(steps, { x: -40, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.1, scrollTrigger: { trigger: body, start: 'top 80%' } });
    gsap.from('.steps__stage', { y: 80, opacity: 0, rotateX: -8, transformOrigin: '50% 100%', duration: 1.4, ease: 'power4.out', scrollTrigger: { trigger: body, start: 'top 80%' } });
    gsap.fromTo('.steps__shapes i', { y: 140, rotate: -24 }, { y: -140, rotate: -34, ease: 'none', stagger: 0.05, scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
    // the stage leans toward the cursor
    if (FINE) {
      const stage = $('.steps__stage');
      stage.addEventListener('pointermove', (e) => {
        const r = stage.getBoundingClientRect();
        gsap.to(stage, { rotateY: ((e.clientX - r.left) / r.width - 0.5) * 7, rotateX: (0.5 - (e.clientY - r.top) / r.height) * 6, duration: 0.7, ease: 'power3.out', overwrite: 'auto' });
      });
      stage.addEventListener('pointerleave', () => gsap.to(stage, { rotateY: 0, rotateX: 0, duration: 1, ease: 'elastic.out(1, 0.6)', overwrite: 'auto' }));
    }
  }
}

/* ───────────────────────── Plans ───────────────────────── */
{
  const plans = [
    { name: 'N3RVOUS', tag: 'Turn your music into your career with us', color: '#e2622b', items: ['Stream on 35+ platforms including Facebook, Instagram, and TikTok', 'Access to Artist Verification', 'All local DSPs', '2 tracks annually', 'Basic education', 'Keep 80% of royalties'] },
    { name: 'EXD', tag: 'Escalate your music journey', color: '#c06de8', items: ['Keep 100% of your royalties', 'Release on 150+ DSPs', 'Insights & analytics', 'Royalty statement', 'Pre-save link on major DSPs', 'Access to Promote tools'] },
    { name: 'EXD Premier', tag: 'Expand your artistic horizons.', color: '#8fe3df', items: ['Includes all EXD benefits', 'Promotional tools', 'Eligibility to submit your work to EXD music partners', 'Lyrics Video service', 'Exclusive publishing and Sync service', 'ArtistPages website to build your brand', 'Eligible to be invited to PARTNER'] },
    { name: 'N3XUS', tag: 'Embrace the global rhythms.', color: '#cdb083', items: ['Includes all Premier benefits', 'Custom distribution strategy', 'Scheduled release dates', 'Dedicated customer support', 'Advanced streaming analytics', 'Playlist pitching', 'Global business consulting'] },
  ];
  const root = $('.plan');
  const tabs = $$('.plans__tabs button');
  const name = $('.plan__name span');
  const tag = $('.plan__tag span');
  const list = $('.plan__list');
  const imgs = $$('.plan__photo img');
  const wipe = $('.plan__wipe');
  let index = 0;
  let busy = false;

  const check = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9"/><path d="M6 10.4l2.700 2.600L14 7.400"/></svg>';
  const fill = (p) => {
    root.style.setProperty('--plan', p.color);
    name.textContent = p.name;
    tag.textContent = t(p.tag);
    list.innerHTML = p.items.map((t) => `<li>${check}<span>${tr(t).replace(/&/g, '&amp;')}</span></li>`).join('');
    list.style.setProperty('--rows', Math.ceil(p.items.length / 2));
  };
  fill(plans[0]);

  function go(next) {
    if (busy || next === index) return;
    const dir = next > index ? 1 : -1;
    const p = plans[next];
    tabs.forEach((t, i) => {
      t.classList.toggle('is-active', i === next);
      t.setAttribute('aria-selected', i === next);
    });
    const from = imgs[index];
    const to = imgs[next];
    if (REDUCED) {
      from.classList.remove('is-active');
      to.classList.add('is-active');
      fill(p);
      index = next;
      return;
    }
    busy = true;
    const tl = gsap.timeline({
      onComplete: () => {
        index = next;
        busy = false;
      },
    });
    tl.set(wipe, { transformOrigin: dir > 0 ? 'left' : 'right', background: p.color })
      .to(wipe, { scaleX: 1, duration: 0.5, ease: 'power4.inOut' }, 0)
      .to([name, tag], { yPercent: -115, duration: 0.4, ease: 'power3.in', stagger: 0.05 }, 0)
      .to($$('li', list), { x: -18 * dir, opacity: 0, duration: 0.3, ease: 'power2.in', stagger: 0.025 }, 0)
      .add(() => {
        from.classList.remove('is-active');
        to.classList.add('is-active');
        fill(p);
        gsap.fromTo($$('li', list), { x: 22 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.05 });
      }, 0.5)
      .set(wipe, { transformOrigin: dir > 0 ? 'right' : 'left' }, 0.5)
      .to(wipe, { scaleX: 0, duration: 0.7, ease: 'power4.inOut' }, 0.52)
      .fromTo(to, { scale: 1.25 }, { scale: 1, duration: 1.3, ease: 'power3.out' }, 0.52)
      .fromTo([name, tag], { yPercent: 115 }, { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.08 }, 0.55);
  }

  tabs.forEach((t, i) => t.addEventListener('click', () => go(i)));
  // clicking anywhere on the plan card moves to the next plan (wrapping around)
  root.dataset.cursor = t('Next');
  root.style.cursor = 'pointer';
  root.addEventListener('click', (e) => {
    if (e.target.closest('a, button') || String(getSelection()).length) return;
    go((index + 1) % plans.length);
  });
  $('.plans__tabs').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') go((index + 1) % plans.length);
    if (e.key === 'ArrowLeft') go((index + plans.length - 1) % plans.length);
  });

  if (!REDUCED) {
    gsap.set([name, tag], { yPercent: 115 });
    gsap.set(wipe, { scaleX: 1, transformOrigin: 'right', background: plans[0].color });
    const tl = gsap.timeline({ scrollTrigger: { trigger: root, start: 'top 95%' } });
    tl.to(wipe, { scaleX: 0, duration: 0.6, ease: 'power3.out' })
      .from(imgs[0], { scale: 1.3, duration: 1.6, ease: 'power3.out' }, 0.1)
      .to([name, tag], { yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.1 }, 0.25)
      .from($$('li', list), { x: 24, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06 }, 0.45)
      .from('.plan__frame', { '--corner': '0px', duration: 1, ease: 'power3.out' }, 0.2);
    gsap.fromTo('.plan__photo', { yPercent: 5 }, { yPercent: -5, ease: 'none', scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
  }
}

/* ───────────────────────── Mastery + why ───────────────────────── */
$$('.lesson').forEach((lesson) => ScrollTrigger.create({ trigger: lesson, start: 'top 85%', once: true, onEnter: () => lesson.classList.add('is-in') }));

if (!REDUCED) {
  gsap.fromTo('.why__bg img', { yPercent: -8, scale: 1.15 }, { yPercent: 8, scale: 1.02, ease: 'none', scrollTrigger: { trigger: '.why', start: 'top bottom', end: 'bottom top', scrub: true } });
  $$('.why__list li').forEach((li, i) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 88%' } });
    tl.from(li, { '--line': 0, duration: 1.2, ease: 'power4.inOut' }, 0).from([$('h3', li), $('p', li)], { y: 26, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 }, 0.1);
    void i;
  });
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
