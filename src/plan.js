// Settings › Account › Change Plan: "Manage Your Plan" (Figma 2121-2540) and the
// cancel / downgrade steps (Figma 2140-1661), one full page per step, routed by #hash.
// Nothing is billed: the chosen plan is kept in localStorage.
import { ORDER, PLANS, SUBSCRIBED_SINCE, PERIOD_END, currentPlan, setPlan } from './plan-data.js';

const $ = (s) => document.querySelector(s);
const steps = [...document.querySelectorAll('.pl[data-step]')];
const back = $('#pl-back');
const BACK = { '': '/settings.html#account', help: '#', lose: '#help', confirm: '#lose', done: '/settings.html#account' };

// The flow remembers where it started and where it is going (survives reloads within the tab).
const flow = {
  get() {
    try {
      return JSON.parse(sessionStorage.getItem('exd-plan-flow')) || null;
    } catch {
      return null;
    }
  },
  set(v) {
    try {
      sessionStorage.setItem('exd-plan-flow', JSON.stringify(v));
    } catch {}
  },
};

const rank = (p) => ORDER.indexOf(p);
const check = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 8.3l2.4 2.4 4.6-5" /></svg>';

function renderCards() {
  const cur = currentPlan();
  const shown = cur === 'basic' ? ORDER : ORDER.filter((p) => p !== 'basic');
  $('#pl-cards').innerHTML = shown
    .map((id) => {
      const p = PLANS[id];
      const isCur = id === cur;
      let btn;
      if (isCur) btn = id === 'basic' ? '<button class="plcard__btn plcard__btn--muted" type="button" disabled>Current Plan</button>' : `<button class="plcard__btn plcard__btn--muted" type="button" data-target="basic">Cancel Plan</button>`;
      else if (rank(id) < rank(cur)) btn = `<button class="solid plcard__btn" type="button" data-target="${id}">Switch to ${p.name}</button>`;
      else btn = `<button class="solid plcard__btn" type="button" data-upgrade="${id}">Upgrade to ${p.name}</button>`;
      return `<li class="plcard${isCur ? ' is-current' : ''}" style="--c:${p.color}">
        ${isCur && id !== 'basic' ? `<p class="plcard__since">Subscribed since ${SUBSCRIBED_SINCE}</p>` : isCur ? '<p class="plcard__since">Current plan</p>' : ''}
        <div class="plcard__body">
          <span class="plcard__star" aria-hidden="true">${p.star}</span>
          <h2>${p.name}</h2>
          <p class="plcard__for">${p.for}</p>
          <p class="plcard__price">${p.price}${p.price === 'Free' ? '' : ' <small>/ year</small>'}</p>
          <ul>${p.features.map((f) => `<li>${check}${f}</li>`).join('')}</ul>
          ${btn}
        </div>
      </li>`;
    })
    .join('');
}

$('#pl-cards').addEventListener('click', (e) => {
  const down = e.target.closest('[data-target]');
  const up = e.target.closest('[data-upgrade]');
  if (down) {
    flow.set({ from: currentPlan(), to: down.dataset.target });
    location.hash = 'help';
  } else if (up) {
    const id = up.dataset.upgrade;
    setPlan(id);
    renderCards();
    $('#pl-note').textContent = `You're now on EXD ${PLANS[id].name}. Your new features are available right away.`;
  }
});

function fillFlow(f) {
  const from = PLANS[f.from];
  const to = PLANS[f.to];
  const cancel = f.to === 'basic';
  const lost = ORDER.slice(rank(f.to) + 1, rank(f.from) + 1)
    .reverse()
    .flatMap((id) => PLANS[id].loses || []);

  document.querySelector('[data-flow-opt]').firstChild.textContent = cancel ? 'Cancel or pause your plan' : `Switch to ${to.name} or cancel`;
  $('#pl-lose-t').textContent = cancel ? 'Cancel Plan' : `Switch to ${to.name}`;
  $('#pl-lose-sub').textContent = cancel ? "If you cancel, you'll lose these features:" : `If you switch to ${to.name}, you'll lose these features:`;
  $('#pl-lose').innerHTML = lost.map((l) => `<li><i aria-hidden="true">!</i>${l}</li>`).join('');

  $('#pl-confirm-t').textContent = cancel ? 'Confirm Cancellation' : 'Confirm Plan Change';
  $('#pl-confirm-sub').innerHTML = cancel
    ? `If you confirm and end your subscription now, you can still access the ${from.name} perks until <b>${PERIOD_END}</b>. After your membership expires, you'll still enjoy access to all the free plan features.`
    : `If you confirm, you can still access the ${from.name} perks until <b>${PERIOD_END}</b>. After that, your membership moves to ${to.name} at ${to.price} / year.`;
  $('#pl-why legend').textContent = cancel ? 'Before you cancel, could you tell us why?' : 'Before you switch, could you tell us why?';
  $('#pl-final').textContent = cancel ? 'Finalize Cancellation' : `Confirm Switch to ${to.name}`;

  $('#pl-done-t').textContent = cancel ? 'Your plan has been canceled.' : 'Your plan has been changed.';
  $('#pl-done-box').innerHTML = cancel
    ? `You'll continue to have access to your ${from.name} features until <b>${PERIOD_END}</b>, after which you'll be moved to the Basic (free) plan.`
    : `You'll keep your ${from.name} features until <b>${PERIOD_END}</b>, after which you'll be moved to the ${to.name} plan (${to.price} / year).`;
  $('#pl-done-sub').textContent = `You can ${cancel ? 'restart' : 'switch back to'} your ${from.name} plan anytime from your Account Settings — all your data and uploads will stay saved.`;
}

// Reasons: the final button unlocks once at least one is ticked.
const why = $('#pl-why');
const whyText = $('#why-text');
why.addEventListener('change', () => {
  const any = why.querySelector('input[name="why"]:checked');
  $('#pl-final').disabled = !any;
  $('#pl-hint').hidden = !!any;
  whyText.hidden = !$('#why-other').checked;
});
why.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = flow.get();
  if (!f) return;
  setPlan(f.to);
  f.done = true;
  flow.set(f);
  location.hash = 'done';
});

function show() {
  let step = location.hash.slice(1);
  const f = flow.get();
  if (!steps.some((s) => s.dataset.step === step)) step = '';
  if (step && !f) step = ''; // a step without a flow (e.g. a bookmarked link) falls back to the plan page
  if (step === 'done' && !f?.done) step = 'confirm';
  if (step !== 'done' && f?.done) flow.set(null);
  if (step && f) fillFlow(f);
  if (!step) renderCards();
  steps.forEach((s) => (s.hidden = s.dataset.step !== step));
  back.href = BACK[step];
  window.scrollTo(0, 0);
  steps.find((s) => !s.hidden)?.querySelector('h1')?.focus({ preventScroll: true });
}
steps.forEach((s) => s.querySelector('h1').setAttribute('tabindex', '-1'));
window.addEventListener('hashchange', show);
show();
