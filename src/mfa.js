// Settings › Security › Enable / Disable MFA (MFA Setup Figma 1-459, 1-476, 1-629).
// Front-end only: no email is sent, and any 6 digits complete the step.
const dlg = document.getElementById('mfa');
const btn = document.getElementById('mfa-btn');
const note = document.getElementById('mfa-note');
const views = [...dlg.querySelectorAll('[data-v]')];
const title = document.getElementById('mfa-title');
const boxes = [...dlg.querySelectorAll('.mfa__code input')];
const TITLES = {
  intro: 'Setup Multi-Factor Authentication',
  verify: 'Verify Your Identity',
  code: () => (enabled ? 'Enter Verification Code' : 'Enter the Access Code'),
  done: 'You’re all set!',
  confirm: 'Disable MFA?',
  off: 'MFA Disabled',
};

let enabled = false;
try {
  enabled = localStorage.getItem('exd-mfa') === '1';
} catch {}
let history = [];

// Masked email from the Account tab, e.g. a**@gmail.com
const email = document.getElementById('email')?.value || 'abc@gmail.com';
const [user, domain] = email.split('@');
dlg.querySelectorAll('.mfa__email').forEach((el) => (el.textContent = `${user[0]}${'*'.repeat(Math.max(user.length - 1, 6))}@${domain}`));

function renderState() {
  btn.textContent = enabled ? 'Disable MFA' : 'Enable MFA';
  note.textContent = `${enabled ? 'Activate' : 'Setup'} MFA (Multi-Factor Authentication) to enhance your security with multiple layers of protection.`;
}
function show(v, push = true) {
  if (push && history.at(-1) !== v) history.push(v);
  views.forEach((el) => (el.hidden = el.dataset.v !== v));
  const t = TITLES[v];
  title.textContent = typeof t === 'function' ? t() : t;
  if (v === 'code') resetCode();
  if (v === 'done') setEnabled(true);
  if (v === 'off') setEnabled(false);
  const first = v === 'code' ? boxes[0] : dlg.querySelector(`[data-v="${v}"] button`);
  first?.focus();
}
function setEnabled(on) {
  enabled = on;
  try {
    localStorage.setItem('exd-mfa', on ? '1' : '0');
  } catch {}
  renderState();
}

btn.addEventListener('click', () => {
  history = [];
  show(enabled ? 'verify' : 'intro');
  dlg.showModal();
});
dlg.addEventListener('click', (e) => {
  if (e.target === dlg || e.target.closest('[data-close]')) return dlg.close();
  const to = e.target.closest('[data-to]');
  if (to) return show(to.dataset.to);
  if (e.target.closest('[data-back]')) {
    history.pop();
    const prev = history.at(-1);
    if (prev) show(prev, false);
    else dlg.close();
    return;
  }
  if (e.target.closest('[data-resend]')) resend();
});

/* ───────── 6-digit code ───────── */
function resetCode() {
  boxes.forEach((b) => (b.value = ''));
  dlg.querySelector('.mfa__code').classList.remove('is-bad');
}
function codeComplete() {
  if (boxes.every((b) => /^\d$/.test(b.value))) {
    // demo: any 6 digits verify
    setTimeout(() => show(enabled ? 'confirm' : 'done'), 250);
  }
}
boxes.forEach((b, i) => {
  b.addEventListener('input', () => {
    const digits = b.value.replace(/\D/g, '');
    if (digits.length > 1) {
      // pasted or autofilled code
      digits.split('').slice(0, 6 - i).forEach((d, k) => (boxes[i + k].value = d));
      boxes[Math.min(i + digits.length, 5)].focus();
    } else {
      b.value = digits;
      if (digits && i < 5) boxes[i + 1].focus();
    }
    codeComplete();
  });
  b.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !b.value && i > 0) boxes[i - 1].focus();
    if (e.key === 'ArrowLeft' && i > 0) boxes[i - 1].focus();
    if (e.key === 'ArrowRight' && i < 5) boxes[i + 1].focus();
  });
});

/* ───────── Resend code (Figma 1-629) ───────── */
let timer;
function resend() {
  const ask = dlg.querySelector('.mfa__resend');
  const sent = dlg.querySelector('.mfa__sent');
  const sec = sent.querySelector('[data-sec]');
  ask.hidden = true;
  sent.hidden = false;
  let left = 30;
  sec.textContent = left;
  clearInterval(timer);
  timer = setInterval(() => {
    left -= 1;
    sec.textContent = left;
    if (left <= 0) {
      clearInterval(timer);
      sent.hidden = true;
      ask.hidden = false;
    }
  }, 1000);
}
dlg.addEventListener('close', () => {
  clearInterval(timer);
  dlg.querySelector('.mfa__sent').hidden = true;
  dlg.querySelector('.mfa__resend').hidden = false;
});

renderState();
