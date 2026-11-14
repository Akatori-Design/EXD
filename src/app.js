// Small, quiet behaviours shared by the dashboard pages. No animation: state changes only.

const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* Sub-tabs (Money, Settings): buttons with role=tab control role=tabpanel, synced to #hash */
$$('[role="tablist"]').forEach((list) => {
  const tabs = $$('[role="tab"]', list);
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
  const select = (i, push) => {
    tabs.forEach((t, j) => {
      t.setAttribute('aria-selected', i === j);
      t.tabIndex = i === j ? 0 : -1;
      panels[j].hidden = i !== j;
    });
    if (push) history.replaceState(null, '', `#${tabs[i].dataset.hash}`);
  };
  tabs.forEach((t, i) => t.addEventListener('click', () => select(i, true)));
  list.addEventListener('keydown', (e) => {
    const i = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    const n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!n) return;
    const next = (i + n + tabs.length) % tabs.length;
    select(next, true);
    tabs[next].focus();
  });
  const fromHash = () => {
    const i = tabs.findIndex((t) => `#${t.dataset.hash}` === location.hash);
    return i >= 0 ? i : 0;
  };
  select(fromHash(), false);
  window.addEventListener('hashchange', () => select(fromHash(), false));
});

/* Toggle groups: one pressed button at a time (chart range, view mode, chips) */
$$('[data-toggle-group]').forEach((group) => {
  const buttons = $$('button', group);
  buttons.forEach((b) =>
    b.addEventListener('click', () => {
      buttons.forEach((o) => o.setAttribute('aria-pressed', o === b));
      group.dispatchEvent(new CustomEvent('change', { detail: b.dataset.value }));
    }),
  );
});

/* Sortable tables: click a header button to sort by that column */
$$('table[data-sortable]').forEach((table) => {
  const body = table.tBodies[0];
  const heads = $$('th', table);
  const value = (cell) => {
    const n = parseFloat(cell.textContent.replace(/[^0-9.-]/g, ''));
    return Number.isNaN(n) ? cell.textContent.trim().toLowerCase() : n;
  };
  heads.forEach((th, col) => {
    const btn = th.querySelector('.sort');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const desc = th.getAttribute('aria-sort') !== 'descending';
      heads.forEach((h) => h.removeAttribute('aria-sort'));
      th.setAttribute('aria-sort', desc ? 'descending' : 'ascending');
      heads.forEach((h) => {
        const i = h.querySelector('.sort i');
        if (i) i.textContent = h === th ? (desc ? '▼' : '▲') : '⇅';
      });
      const rows = [...body.rows].sort((a, b) => {
        const x = value(a.cells[col]);
        const y = value(b.cells[col]);
        return (x > y ? 1 : x < y ? -1 : 0) * (desc ? -1 : 1);
      });
      body.append(...rows);
    });
  });
});

/* Forms: the primary button stays disabled until something changes */
$$('form[data-dirty]').forEach((form) => {
  const submit = form.querySelector('[type="submit"]');
  const start = new FormData(form);
  const changed = () => [...new FormData(form)].some(([k, v]) => start.get(k) !== v);
  form.addEventListener('input', () => (submit.disabled = !changed()));
  form.addEventListener('change', () => (submit.disabled = !changed()));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submit.disabled = true;
    submit.textContent = submit.dataset.done || 'Saved';
    setTimeout(() => (submit.textContent = submit.dataset.label), 1600);
    // remember the new values as the saved state
    for (const [k, v] of new FormData(form)) start.set(k, v);
  });
  submit.dataset.label = submit.textContent;
  submit.disabled = true;
});
