// Money › Send Money flow (Money Figma 71-2268 → 71-2019 → 71-2284 → 71-2381 → Wallet 71-2127).
// Front-end only: recipients keep just a name and the last 4 digits; nothing is sent anywhere.
import './app.js';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const store = {
  get(k, d) {
    try {
      return JSON.parse(localStorage.getItem(k)) ?? d;
    } catch {
      return d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
};
const money = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

let recipients = store.get('exd-recipients', []);
let selected = recipients.length ? 0 : -1;
const balance = store.get('exd-balance', 412.38);

/* ───────── steps ───────── */
const steps = Object.fromEntries($$('.sm__step').map((s) => [s.dataset.step, s]));
let current = 'recipient';
let addReturn = 'recipient';
function show(step) {
  current = step;
  for (const [k, el] of Object.entries(steps)) el.hidden = k !== step;
  window.scrollTo(0, 0);
  const first = $('input, button:not([hidden])', steps[step]);
  first?.focus({ preventScroll: true });
}
document.addEventListener('click', (e) => {
  const go = e.target.closest('[data-go]');
  if (!go) return;
  if (go.dataset.go === 'add') {
    addReturn = current;
    closeMenu();
  }
  show(go.dataset.go);
});
$('#sm-back').addEventListener('click', () => {
  if (current === 'recipient') location.href = '/money.html#wallet';
  else show(current === 'add' ? addReturn : 'recipient');
});

/* ───────── step 1: recipient picker ───────── */
const pick = $('#rpick');
const pickBtn = $('#rpick-btn');
const menu = $('#rpick-menu');
const list = $('#rpick-list');
const label = (r) => `<b>${r.name.replace(/</g, '&lt;')}</b><small>••• ${r.last4}</small>`;
function renderPicker() {
  const has = recipients.length > 0;
  pick.hidden = !has;
  $('#add-first').hidden = has;
  $('#to-next').disabled = selected < 0;
  if (!has) return;
  $('#rpick-cur').innerHTML = label(recipients[selected]);
  list.innerHTML = recipients
    .map(
      (r, i) =>
        `<li role="option" tabindex="-1" aria-selected="${i === selected}" data-i="${i}">${label(r)}<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.4l3 3 6-6.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg></li>`,
    )
    .join('');
}
function closeMenu() {
  menu.hidden = true;
  pickBtn.setAttribute('aria-expanded', 'false');
  pick.classList.remove('is-open');
}
pickBtn.addEventListener('click', () => {
  const open = menu.hidden;
  menu.hidden = !open;
  pickBtn.setAttribute('aria-expanded', open);
  pick.classList.toggle('is-open', open);
  if (open) $('[aria-selected="true"]', list)?.focus();
});
list.addEventListener('click', (e) => {
  const li = e.target.closest('[data-i]');
  if (!li) return;
  selected = +li.dataset.i;
  closeMenu();
  renderPicker();
  pickBtn.focus();
});
list.addEventListener('keydown', (e) => {
  const items = $$('[data-i]', list);
  const i = items.indexOf(document.activeElement);
  if (e.key === 'ArrowDown') items[Math.min(i + 1, items.length - 1)]?.focus();
  else if (e.key === 'ArrowUp') items[Math.max(i - 1, 0)]?.focus();
  else if (e.key === 'Enter' || e.key === ' ') document.activeElement.click();
  else return;
  e.preventDefault();
});
document.addEventListener('click', (e) => {
  if (!menu.hidden && !pick.contains(e.target)) closeMenu();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !menu.hidden) {
    closeMenu();
    pickBtn.focus();
  }
});
$('#manage').addEventListener('click', () => {
  // Manage = remove the selected recipient (the only management the prototype needs).
  if (selected < 0) return;
  if (!confirm(`Remove ${recipients[selected].name} from your recipients?`)) return;
  recipients.splice(selected, 1);
  store.set('exd-recipients', recipients);
  selected = recipients.length ? 0 : -1;
  closeMenu();
  renderPicker();
});
$('#to-next').addEventListener('click', () => {
  if (selected >= 0) show('amount');
});

/* ───────── add recipient ───────── */
const add = $('#add-form');
const rules = {
  name: (v) => !!v.trim(),
  routing: (v) => /^\d{9}$/.test(v.trim()),
  acct: (v) => /^\d{4,17}$/.test(v.trim()),
  acct2: (v) => !!v.trim() && v.trim() === add.acct.value.trim(),
};
const touched = new Set();
function check() {
  let ok = true;
  for (const [k, test] of Object.entries(rules)) {
    const input = add[k];
    const good = test(input.value);
    ok &&= good;
    const showErr = touched.has(k) && !good;
    input.classList.toggle('is-bad', showErr);
    input.setAttribute('aria-invalid', showErr);
    input.nextElementSibling.hidden = !showErr;
  }
  $('#add-save').disabled = !ok;
  return ok;
}
add.addEventListener('input', (e) => {
  if (e.target.name) e.target.value = e.target.name === 'name' ? e.target.value : e.target.value.replace(/\D/g, '');
  if (e.target.name === 'acct' && add.acct2.value) touched.add('acct2');
  check();
});
add.addEventListener('focusout', (e) => {
  if (e.target.name && e.target.value) touched.add(e.target.name);
  check();
});
let toastTimer;
add.addEventListener('submit', (e) => {
  e.preventDefault();
  Object.keys(rules).forEach((k) => touched.add(k));
  if (!check()) return;
  recipients.push({ name: add.name.value.trim(), last4: add.acct.value.trim().slice(-4) });
  store.set('exd-recipients', recipients);
  selected = recipients.length - 1;
  add.reset();
  touched.clear();
  check();
  renderPicker();
  show('recipient');
  const toast = $('#toast');
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.hidden = true), 4000);
});
$('#toast button').addEventListener('click', () => ($('#toast').hidden = true));

/* ───────── step 2: amount ───────── */
const amtForm = $('#amt-form');
const amt = $('#amt');
const send = $('#send');
const balNote = $('#bal-note');
balNote.textContent = `Your EXD balance is ${money(balance)}.`;
const value = () => Math.round(parseFloat(amt.value.replace(/[^0-9.]/g, '')) * 100) / 100 || 0;
amt.addEventListener('input', () => {
  amt.value = amt.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1').replace(/(\.\d{2})\d+/, '$1');
  const v = value();
  const over = v > balance;
  send.disabled = !v || over;
  send.textContent = v && !over ? `Send ${money(v)}` : 'Send';
  balNote.textContent = over ? `That’s more than your EXD balance of ${money(balance)}.` : `Your EXD balance is ${money(balance)}.`;
  balNote.classList.toggle('is-bad', over);
});
amt.addEventListener('blur', () => {
  if (value()) amt.value = value().toFixed(2);
});
amtForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const v = value();
  if (!v || v > balance || selected < 0) return;
  const r = recipients[selected];
  const transfers = store.get('exd-transfers', []);
  transfers.unshift({ name: r.name, last4: r.last4, amount: v, note: $('#note').value.trim(), date: new Date().toISOString() });
  store.set('exd-transfers', transfers);
  store.set('exd-balance', Math.round((balance - v) * 100) / 100);
  location.href = '/money.html?sent=1#wallet';
});

renderPicker();
check();
