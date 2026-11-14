// Money › Royalties: all-time totals and the breakdown table, computed from the analytics model.
import { query, DIMS, RELEASED } from './analytics-data.js';
import { fmtNum } from './charts.js';

const DL_PRICE = 0.7; // artist share per download (USD)
const $ = (s) => document.querySelector(s);
const usd = (v) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const selDSP = document.querySelector('#p-roy select[aria-label="DSP"]');
const selTer = document.querySelector('#p-roy select[aria-label="Territory"]');
const selSale = document.querySelector('#p-roy select[aria-label="Sale type"]');
const group = $('#roy-group');

selDSP.innerHTML = '<option value="">DSP</option>' + Object.keys(DIMS.DSP).map((k) => `<option>${k}</option>`).join('');
selTer.innerHTML = '<option value="">Territory</option>' + Object.keys(DIMS.Territory).map((k) => `<option>${k}</option>`).join('');
selSale.innerHTML = '<option value="">Sale Type</option><option>Streams</option><option>Downloads</option>';

let rows = [];
function render() {
  const filters = {};
  if (selDSP.value) filters.DSP = selDSP.value;
  if (selTer.value) filters.Territory = selTer.value;
  const g = group.value;
  const args = { group: g, range: 'All time', filters };
  const st = query({ ...args, metric: 'Streams' });
  const dl = query({ ...args, metric: 'Downloads' });
  const rv = query({ ...args, metric: 'Revenue' });
  const sale = selSale.value;
  rows = st.rows.map((r) => {
    const d = dl.rows.find((x) => x.name === r.name)?.value || 0;
    const streamRev = rv.rows.find((x) => x.name === r.name)?.value || 0;
    const streams = sale === 'Downloads' ? 0 : r.value;
    const downloads = sale === 'Streams' ? 0 : Math.round(d);
    return { name: r.name, streams, downloads, royalties: (sale === 'Downloads' ? 0 : streamRev) + downloads * DL_PRICE };
  });
  rows = rows.filter((r) => r.streams >= 0.5 || r.downloads > 0).sort((a, b) => b.royalties - a.royalties);
  const sum = (k) => rows.reduce((s, r) => s + r[k], 0);
  $('#roy-streams').textContent = fmtNum(sum('streams'));
  $('#roy-dl').textContent = fmtNum(sum('downloads'));
  const rev = usd(sum('royalties'));
  $('#roy-rev').innerHTML = `${rev.slice(0, -3)}<small>${rev.slice(-3)} USD</small>`;
  $('#roy-col').textContent = g;
  const table = $('#roy-table');
  table.querySelectorAll('th').forEach((th) => th.removeAttribute('aria-sort'));
  table.querySelector('th:last-child').setAttribute('aria-sort', 'descending');
  table.tBodies[0].innerHTML = rows.map((r) => `<tr><td>${r.name}</td><td>${fmtNum(r.streams)}</td><td>${fmtNum(r.downloads)}</td><td>${usd(r.royalties)}</td></tr>`).join('');
}
[selDSP, selTer, selSale, group].forEach((s) => s.addEventListener('change', render));
document.querySelector('#p-roy .mfilters .ghost')?.addEventListener('click', () => {
  selDSP.value = selTer.value = selSale.value = '';
  render();
});

// Download CSV of the current table
$('#roy-csv').addEventListener('click', (e) => {
  e.preventDefault();
  const head = [group.value, 'Streams', 'Downloads', 'Royalties (USD)'];
  const lines = [head, ...rows.map((r) => [r.name, Math.round(r.streams), r.downloads, r.royalties.toFixed(2)])].map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `royalties-by-${group.value.toLowerCase()}.csv` });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

render();
export { RELEASED };
