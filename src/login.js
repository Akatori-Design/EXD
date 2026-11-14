import { gsap, $, $$, REDUCED, FINE, splits, start, t } from './core.js';

/* ───────────────────────── Art panel ───────────────────────── */
// Soft colour fields drifting over each other, standing in for the gradient artwork.
{
  const art = $('.auth__art');
  const canvas = $('.auth__canvas');
  const ctx = canvas.getContext('2d');
  const blobs = [
    { c: [240, 84, 60], x: 0.25, y: 0.2, r: 0.6, sx: 0.11, sy: 0.07, p: 0 },
    { c: [38, 30, 190], x: 0.85, y: 0.15, r: 0.55, sx: 0.08, sy: 0.1, p: 1.7 },
    { c: [226, 60, 150], x: 0.55, y: 0.6, r: 0.6, sx: 0.09, sy: 0.12, p: 3.1 },
    { c: [255, 170, 80], x: 0.75, y: 0.4, r: 0.4, sx: 0.13, sy: 0.08, p: 4.4 },
    { c: [20, 26, 150], x: 0.15, y: 0.85, r: 0.5, sx: 0.07, sy: 0.09, p: 5.2 },
    { c: [80, 170, 240], x: 0.9, y: 0.75, r: 0.35, sx: 0.1, sy: 0.11, p: 2.3 },
  ];
  const mouse = { x: 0.5, y: 0.5 };
  let W = 0;
  let H = 0;
  function size() {
    // drawn small and scaled up by CSS: the blur makes extra resolution pointless
    W = canvas.width = Math.max(2, Math.round(canvas.clientWidth / 6));
    H = canvas.height = Math.max(2, Math.round(canvas.clientHeight / 6));
  }
  function draw(t) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#2a1650';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    const R = Math.max(W, H);
    for (const b of blobs) {
      const x = (b.x + Math.sin(t * b.sx + b.p) * 0.18 + (mouse.x - 0.5) * 0.12) * W;
      const y = (b.y + Math.cos(t * b.sy + b.p) * 0.18 + (mouse.y - 0.5) * 0.12) * H;
      const g = ctx.createRadialGradient(x, y, 0, x, y, b.r * R);
      g.addColorStop(0, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0.95)`);
      g.addColorStop(1, `rgba(${b.c[0]},${b.c[1]},${b.c[2]},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
  }
  size();
  draw(0);
  window.addEventListener('resize', () => {
    size();
    draw(0);
  });
  if (!REDUCED) {
    gsap.ticker.add((t) => draw(t * 1.4));
    if (FINE) {
      art.addEventListener('pointermove', (e) => {
        const r = art.getBoundingClientRect();
        gsap.to(mouse, { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, duration: 1.2, ease: 'power3.out', overwrite: true });
      });
      const mark = $('.auth__mark');
      art.addEventListener('pointermove', (e) => {
        const r = art.getBoundingClientRect();
        gsap.to(mark, { x: ((e.clientX - r.left) / r.width - 0.5) * 24, y: ((e.clientY - r.top) / r.height - 0.5) * 18, duration: 1, ease: 'power3.out', overwrite: 'auto' });
      });
      art.addEventListener('pointerleave', () => gsap.to(mark, { x: 0, y: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' }));
    }
  }
}

/* ───────────────────────── Form ───────────────────────── */
// Log in and Sign up share this. There is no backend: the form validates, plays its
// states, and then goes to the dashboard page. Nothing is stored or sent.
{
  const form = $('.auth__form');
  const signup = form.dataset.mode === 'signup';
  const email = $('#email');
  const password = $('#password');
  const confirm = $('#confirm');
  const submit = $('.auth__submit');

  $('#sent-retry')?.addEventListener('click', () => {
    $('#sent').hidden = true;
    form.hidden = false;
    email.select();
  });

  $$('.field__eye', form).forEach((eye) => {
    const input = $('input', eye.closest('.field__box'));
    eye.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      eye.setAttribute('aria-pressed', show);
      eye.setAttribute('aria-label', t(show ? 'Hide password' : 'Show password'));
      eye.classList.toggle('is-open', show);
    });
  });

  const setError = (input, message) => {
    const field = input.closest('.field');
    field.classList.toggle('is-invalid', !!message);
    $('.field__error', field).textContent = t(message);
    const hint = $('.field__hint', field);
    const ids = [hint?.id, message && `${input.id}-error`].filter(Boolean).join(' ');
    if (ids) input.setAttribute('aria-describedby', ids);
    else input.removeAttribute('aria-describedby');
    input.setAttribute('aria-invalid', !!message);
    return !message;
  };
  const checkEmail = () => setError(email, !email.value.trim() ? 'Enter your email address.' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()) ? '' : 'That email address looks incomplete.');
  const checkPassword = () => {
    const v = password.value;
    if (!v) return setError(password, signup ? 'Create a password.' : 'Enter your password.');
    if (signup && v.length < 8) return setError(password, 'Use at least 8 characters.');
    if (signup && !/[\d\W_]/.test(v)) return setError(password, 'Add a number or symbol.');
    return setError(password, '');
  };
  const checkConfirm = () => (confirm ? setError(confirm, !confirm.value ? 'Re-enter your password.' : confirm.value === password.value ? '' : "Passwords don't match.") : true);

  const forgot = form.dataset.mode === 'forgot';
  const checks = [[email, checkEmail]];
  if (password) checks.push([password, checkPassword]);
  if (confirm) checks.push([confirm, checkConfirm]);
  checks.forEach(([input, check]) => {
    input.addEventListener('blur', () => input.value && check());
    input.addEventListener('input', () => {
      if (input.closest('.field').classList.contains('is-invalid')) check();
      if (input === password && confirm?.value) checkConfirm();
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = checks.map(([, check]) => check()).every(Boolean);
    if (!ok) {
      const first = $('.field.is-invalid input', form);
      first?.focus();
      if (!REDUCED) gsap.fromTo($$('.field.is-invalid .field__box', form), { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
      return;
    }
    submit.classList.add('is-busy');
    submit.disabled = true;
    setTimeout(() => {
      submit.classList.remove('is-busy');
      submit.disabled = false;
      if (password) password.value = '';
      if (confirm) confirm.value = '';
      if (forgot) {
        // "Check your email" (Figma 598-23410); nothing is actually sent
        $('#sent-to').textContent = email.value.trim();
        form.hidden = true;
        $('#sent').hidden = false;
        $('#sent .auth__title').focus();
      } else if (signup) {
        // continue to the plan step on the same page (src/signup.js)
        try {
          sessionStorage.setItem('exd-signup', JSON.stringify({ email: email.value.trim() }));
        } catch {}
        location.hash = 'plans';
      } else location.href = '/dashboard.html';
    }, 900);
  });
}

/* ───────────────────────── Intro ───────────────────────── */
start((tl) => {
  tl.from('.auth__art', { clipPath: 'inset(0% 0% 0% 100% round 40px 0px 0px 0px)', duration: 1.4, ease: 'power4.inOut' }, 0)
    .from('.auth__canvas', { scale: 1.3, duration: 2.4, ease: 'power3.out' }, 0)
    .from('.auth__mark .l', { strokeDashoffset: 120, strokeDasharray: 120, duration: 1.5, ease: 'power3.inOut', stagger: 0.15 }, 0.6)
    .from('.auth__logo', { y: -16, opacity: 0, duration: 0.8 }, 0.3)
    .to(splits.get($('.auth__title')), { yPercent: 0, duration: 1.2, stagger: 0.08 }, 0.4)
    .from('.auth__sub, .field, .auth__row, .auth__terms, .auth__submit, .auth__alt', { y: 22, opacity: 0, duration: 0.9, stagger: 0.07 }, 0.6);
});
