import { t } from './i18n.js';
// Sign up flow after the account form (All Flows prototype 433-6960 → 795-7377 plans →
// 823-4760 / 984-9879 payment → 2677-10278 role → dashboard). Steps are routed by #hash.
// Front end only: no card data is stored or sent anywhere, and nothing is charged.
const $ = (s) => document.querySelector(s);
const steps = [...document.querySelectorAll('[data-step]')];
const PRICES = { basic: 0, plus: 19.99, pro: 49.99 };
const NAMES = { basic: 'Basic', plus: 'Plus', pro: 'Premier' };

const state = {
  get() {
    try {
      return JSON.parse(sessionStorage.getItem('exd-signup')) || {};
    } catch {
      return {};
    }
  },
  set(patch) {
    try {
      sessionStorage.setItem('exd-signup', JSON.stringify({ ...state.get(), ...patch }));
    } catch {}
  },
};
const go = (step) => (location.hash = step);

function show() {
  let step = location.hash.slice(1);
  const st = state.get();
  if (!steps.some((s) => s.dataset.step === step)) step = '';
  // later steps need the account form first; payment needs a paid plan
  if (step && !st.email) step = '';
  if (step === 'payment' && !PRICES[st.plan]) step = 'plans';
  if (step === 'role' && !st.plan) step = 'plans';
  steps.forEach((s) => (s.hidden = s.dataset.step !== step));
  document.body.dataset.step = step || 'account';
  if (step === 'payment') fillSummary(st.plan);
  if (step === 'role') $('#role-email').value = st.email || '';
  window.scrollTo(0, 0);
  if (step) document.querySelector(`[data-step="${step}"] [tabindex="-1"]`)?.focus({ preventScroll: true });
}
window.addEventListener('hashchange', show);

/* plans */
document.querySelectorAll('[data-plan]').forEach((b) =>
  b.addEventListener('click', () => {
    const plan = b.dataset.plan;
    state.set({ plan });
    go(PRICES[plan] ? 'payment' : 'role');
  }),
);
document.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => go(b.dataset.go)));

/* payment */
const usd = (v) => `$${v.toFixed(2)}`;
function fillSummary(plan) {
  $('#pay-item').textContent = t(`EXD ${NAMES[plan]} · Annual Subscription`);
  ['#pay-price', '#pay-sub', '#pay-total'].forEach((id) => ($(id).textContent = usd(PRICES[plan])));
}
const num = $('#cc-num');
const exp = $('#cc-exp');
const cvv = $('#cc-cvv');
const submit = $('#pay-submit');
const method = () => document.querySelector('input[name="method"]:checked').value;
const digits = (v) => v.replace(/\D/g, '');
const luhn = (d) => {
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = +d[d.length - 1 - i];
    if (i % 2) n = n * 2 > 9 ? n * 2 - 9 : n * 2;
    sum += n;
  }
  return d.length >= 13 && sum % 10 === 0;
};
const expOk = (v) => {
  const m = /^(\d{2})\/(\d{2})$/.exec(v);
  if (!m || +m[1] < 1 || +m[1] > 12) return false;
  const end = new Date(2000 + +m[2], +m[1], 1);
  return end > new Date();
};
function validate() {
  if (method() !== 'card') return (submit.disabled = false);
  submit.disabled = !(luhn(digits(num.value)) && expOk(exp.value) && /^\d{3,4}$/.test(cvv.value));
}
num.addEventListener('input', () => {
  num.value = digits(num.value).slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
  validate();
});
exp.addEventListener('input', (e) => {
  let d = digits(exp.value).slice(0, 4);
  if (d.length >= 3 || (d.length === 2 && e.inputType !== 'deleteContentBackward')) d = `${d.slice(0, 2)}/${d.slice(2)}`;
  exp.value = d;
  validate();
});
cvv.addEventListener('input', () => {
  cvv.value = digits(cvv.value).slice(0, 4);
  validate();
});
document.querySelectorAll('input[name="method"]').forEach((r) =>
  r.addEventListener('change', () => {
    const card = method() === 'card';
    $('#pay-card').hidden = !card;
    $('#pay-alt').hidden = card;
    $('#pay-alt').textContent = card ? '' : t(`You'll confirm the payment with ${method() === 'paypal' ? 'PayPal' : 'Apple Pay'} after you submit.`);
    validate();
  }),
);
$('#pay-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (submit.disabled) return;
  submit.classList.add('is-busy');
  submit.disabled = true;
  setTimeout(() => {
    // clear the card fields right away: nothing about the card is kept
    num.value = exp.value = cvv.value = '';
    submit.classList.remove('is-busy');
    validate();
    state.set({ paid: true });
    go('role');
  }, 900);
});

/* role */
const first = $('#role-first');
const last = $('#role-last');
const country = $('#role-country');
const roleGo = $('#role-go');
const roleOk = () => (roleGo.disabled = !(first.value.trim() && last.value.trim() && country.value));
[first, last, country].forEach((el) => el.addEventListener('input', roleOk));
country.addEventListener('change', roleOk);
$('#role-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (roleGo.disabled) return;
  const st = state.get();
  try {
    localStorage.setItem('exd-plan', st.plan || 'basic');
    sessionStorage.removeItem('exd-signup');
  } catch {}
  location.href = '/dashboard.html';
});

show();
