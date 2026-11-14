// Money › Wallet: transaction Filter dropdown (Money Figma 71-1326) and
// transaction details dialog (Money Figma 71-1625). Front-end only.

import { renderChart, fmtUSD } from './charts.js';
import { query } from './analytics-data.js';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

const tx = $('.tx');

/* ───────── transfers made in the Send Money flow (transfer.html) ───────── */
const read = (k, d) => {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? d;
  } catch {
    return d;
  }
};
const usd = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const savedBal = read('exd-balance', null);
if (savedBal != null) $('.balance b').firstChild.textContent = `$${usd(savedBal)} `;
const recent = $('.tx ul');
for (const t of read('exd-transfers', []).slice().reverse()) {
  const li = document.createElement('li');
  const when = new Date(t.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  li.innerHTML = `<span class="tx__ico">◷</span><div><b></b><small><span class="pend">Pending to send</span> · ${when}</small></div><span class="amt amt--out">−$${usd(t.amount)}</span>`;
  li.querySelector('b').textContent = t.name;
  recent.prepend(li);
}

const rows = $$('.tx li', tx);
const months = { January: 0, February: 1, March: 2, April: 3, May: 4, June: 5, July: 6, August: 7, September: 8, October: 9, November: 10, December: 11 };

// Read each row once: kind, date, title, amount.
const data = rows.map((li, i) => {
  const sub = $('small', li).textContent;
  const m = sub.match(/([A-Z][a-z]+) (\d{1,2}), (\d{4})/);
  const date = m ? new Date(+m[3], months[m[1]], +m[2]) : null;
  const title = $('b', li).textContent.trim();
  const status = sub.split('·')[0].trim();
  // type filters: Received, Sent (anything sent out), Deposited to bank (sent/pending to a bank account)
  const types = new Set();
  if (/received/i.test(status)) types.add('received');
  if (/sent|send/i.test(status)) types.add('sent');
  if (/sent|send/i.test(status) && /checking|bank|union|savings/i.test(title)) types.add('bank');
  return { li, i, date, title, status, types, amt: $('.amt', li).textContent.trim(), in: $('.amt', li).classList.contains('amt--in'), ico: $('.tx__ico', li).textContent };
});

/* ───────── Filter dropdown ───────── */
const btn = $('#tx-filter-btn');
const form = $('#tx-filter');
const apply = $('[type="submit"]', form);
const custom = $('.txf__custom', form);
const none = $('.tx__none', tx);

const open = (on) => {
  form.hidden = !on;
  btn.setAttribute('aria-expanded', on);
  if (on) $('input', form).focus();
};
btn.addEventListener('click', () => open(form.hidden));
document.addEventListener('click', (e) => {
  if (!form.hidden && !form.contains(e.target) && !btn.contains(e.target)) open(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !form.hidden) {
    open(false);
    btn.focus();
  }
});

const choice = () => ({
  type: form.type.value,
  range: form.range.value,
  from: form.from.value,
  to: form.to.value,
});
form.addEventListener('change', () => {
  const c = choice();
  custom.hidden = c.range !== 'custom';
  apply.disabled = !c.type && !c.range;
});

// Ranges count back from the newest transaction (the sample data is from 2024).
const newest = Math.max(...data.filter((d) => d.date).map((d) => +d.date));
function run({ type, range, from, to }) {
  let shown = 0;
  for (const d of data) {
    let ok = !type || d.types.has(type);
    if (ok && range && d.date) {
      if (range === 'custom') {
        if (from) ok = d.date >= new Date(`${from}T00:00`);
        if (ok && to) ok = d.date <= new Date(`${to}T23:59`);
      } else ok = newest - d.date <= +range * 864e5;
    }
    d.li.hidden = !ok;
    if (ok) shown++;
  }
  $$('h3, ul', tx).forEach((el) => {
    if (el.tagName === 'UL') el.hidden = !$$('li', el).some((li) => !li.hidden);
  });
  $$('h3', tx).forEach((h) => (h.hidden = h.nextElementSibling.hidden));
  none.hidden = shown > 0;
  btn.classList.toggle('is-on', !!(type || range));
}
form.addEventListener('submit', (e) => {
  e.preventDefault();
  run(choice());
  open(false);
});
$('.txf__clear', form).addEventListener('click', () => {
  form.reset();
  custom.hidden = true;
  apply.disabled = true;
  run({});
});

/* ───────── Transaction details ───────── */
const dlg = $('#txd');
$('#txd-copy').addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  try {
    await navigator.clipboard.writeText($('[data-f="id"]', dlg).textContent);
  } catch {}
  btn.classList.add('is-copied');
  btn.setAttribute('aria-label', 'Copied');
  setTimeout(() => {
    btn.classList.remove('is-copied');
    btn.setAttribute('aria-label', 'Copy transaction ID');
  }, 1400);
});
// Sample details for the prototype: a time of day and an ID derived from the row.
const times = ['8:15 pm', '10:42 am', '3:07 pm', '9:30 am', '6:55 pm', '1:12 pm', '11:48 am'];
rows.forEach((li, i) => {
  li.tabIndex = 0;
  li.setAttribute('role', 'button');
  li.setAttribute('aria-haspopup', 'dialog');
  const show = () => {
    const d = data[i];
    const pending = /pending/i.test(d.status);
    $('.txd__ico', dlg).textContent = d.ico;
    $('.txd__ico', dlg).classList.toggle('is-pending', pending);
    $('#txd-title').textContent = d.title;
    const amt = $('.txd__amt', dlg);
    amt.textContent = d.amt;
    amt.className = `txd__amt ${d.in ? 'amt--in' : 'amt--out'}`;
    $('[data-f="time"]', dlg).textContent = d.date
      ? `${d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${times[i % times.length]} PST`
      : '—';
    const bank = !d.in;
    $('#txd-kind').textContent = d.in ? 'Royalty payout' : 'Bank transfer';
    $('[data-f="party-l"]', dlg).textContent = d.in ? 'From' : 'To';
    $('[data-f="party"]', dlg).textContent = d.in ? 'EXD Royalties' : `${d.title} ••••4821`;
    $('[data-f="dest"]', dlg).textContent = bank ? 'Standard ACH · 1–3 business days' : 'EXD Wallet';
    const status = $('#txd-status');
    status.textContent = pending ? 'Pending' : d.in ? 'Received' : 'Completed';
    status.className = `txd__status ${pending ? 'is-pending' : d.in ? 'is-in' : 'is-done'}`;
    $('[data-f="id"]', dlg).textContent = `TX-${391482052 + i * 7919}`;
    $('#txd-copy').classList.remove('is-copied');
    dlg.showModal();
  };
  li.addEventListener('click', show);
  li.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      show();
    }
  });
});
dlg.addEventListener('click', (e) => {
  if (e.target === dlg || e.target.closest('[data-close]')) dlg.close();
});

/* ───────── "Your transfer has been initiated." after Send Money ───────── */
const ok = $('#txok');
if (new URLSearchParams(location.search).has('sent')) {
  history.replaceState(null, '', `${location.pathname}#wallet`);
  ok.showModal();
}
ok.addEventListener('click', (e) => {
  if (e.target === ok || e.target.closest('[data-close]')) ok.close();
});

/* ───────── Earnings chart (hover shows the nearest point) ───────── */
// earnings come from the analytics model (stream royalties + downloads)
const DL_PRICE = 0.7;
const revSeries = (range) => {
  const r = query({ metric: 'Revenue', range });
  const d = query({ metric: 'Downloads', range });
  const sum = (q, i) => q.rows.reduce((s, row) => s + row.values[i], 0);
  return { labels: r.labels.map((l) => (range === 'Year to date' ? l.slice(0, 3) : l)), values: r.labels.map((_, i) => Math.round((sum(r, i) + sum(d, i) * DL_PRICE) * 100) / 100) };
};
const ytd = revSeries('Year to date');
const EARN = {
  week: revSeries('Last 7 days'),
  month: { labels: ytd.labels.slice(-6), values: ytd.values.slice(-6) },
  all: revSeries('All time'),
};
{
  const all = query({ metric: 'Revenue', range: 'All time' });
  const dl = query({ metric: 'Downloads', range: 'All time' });
  const allTime = all.total + Math.round(dl.total) * DL_PRICE;
  document.getElementById('earn-all').textContent = `${fmtUSD(allTime)} USD all time`;
  document.getElementById('earn-month').firstChild.textContent = `${fmtUSD(EARN.month.values.at(-1))} `;
}
const earnEl = document.getElementById('earn-chart');
function drawEarn(range) {
  const d = EARN[range] || EARN.month;
  renderChart(earnEl, {
    labels: d.labels,
    series: [{ name: 'Earnings', color: '#9aa2ff', values: d.values }],
    area: true,
    ticks: 4,
    format: fmtUSD,
    axisFormat: (v) => `$${Math.round(v)}`,
    label: 'Royalty earnings',
  });
}
drawEarn('month');
document.querySelector('.earn .seg2').addEventListener('change', (e) => drawEarn(e.detail));
