// Analytics page: every filter re-queries the data model and redraws the chart, stat cards and table.
import { renderChart, fmtK, fmtNum, fmtUSD } from './charts.js';
import { ALBUMS } from './releases.js';
import { query, DIMS, TRACKS, RELEASED, recentStreams } from './analytics-data.js';

const $ = (s) => document.querySelector(s);
const sel = (label) => document.querySelector(`select[aria-label="${label}"]`);
const opt = (v, t = v) => `<option value="${v}">${t}</option>`;
const fill = (label, options) => (sel(label).innerHTML = options.join(''));

/* ───────── options (modelled on FUGA's analytics filters; ISRC/UPC are sample codes) ───────── */
fill('View', ['Streams', 'Listeners', 'Saves', 'Downloads', 'Revenue'].map((v) => opt(v)));
fill('Group by', ['DSP', 'Territory', 'Product', 'Asset', 'Stream source', 'Age group', 'Gender', 'Device'].map((v) => opt(v)));
fill('Asset', [opt('', 'Asset'), ...TRACKS.map((t, i) => opt(`${t.album}:${t.index}`, `${t.title} · USEXD24${String(i + 1).padStart(5, '0')}`))]);
fill('Label', [opt('', 'Label'), opt('J.A.C'), opt('J.A.C / EXD Distribution')]);
fill('Product', [opt('', 'Product'), ...RELEASED.map(([id, a], i) => opt(id, `${a.title} (${a.meta.find(([k]) => k === 'Format')?.[1] || 'Album'}) · UPC 19${8640012000 + i * 137}`))]);
fill('DSP', [opt('', 'DSP'), ...Object.keys(DIMS.DSP).map((v) => opt(v))]);
fill('Artist', [opt('', 'Artist'), opt('Rion Hale'), opt('Rion Hale feat. Joey Newman')]);
fill('Territory', [opt('', 'Territory'), opt('Worldwide'), ...Object.keys(DIMS.Territory).filter((t) => t !== 'Rest of world').map((v) => opt(v))]);
fill('Date range', ['Last 12 months', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'Year to date', 'All time', 'Custom range…'].map((v) => opt(v)));

/* ───────── helpers ───────── */
const COLORS = { Spotify: '#3fd38a', 'YouTube Content ID': '#ff5f5f', 'YouTube Music': '#ff9a7a', 'Apple Music': '#9b8cff', 'Amazon Music': '#5ccfe6', Deezer: '#f0b232', TIDAL: '#e9eef5' };
const PALETTE = ['#9b8cff', '#3fd38a', '#ff7aa8', '#5ccfe6', '#f0b232'];
const color = (name, i, group) => (group === 'DSP' && COLORS[name]) || PALETTE[i % PALETTE.length];
const releaseDays = RELEASED.map(([, a]) => ({ title: a.title, date: new Date(a.meta.find(([k]) => k === 'Released')[1]) }));
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// which release (if any) landed in the bucket with this label
function releaseNote(label, range) {
  const m = label.match(/^([A-Z][a-z]{2}) (\d{2})$/); // "May 24"
  const q = label.match(/^Q(\d) (\d{2})$/);
  const d = label.match(/^([A-Z][a-z]{2}) (\d{1,2})$/); // "Jul 25" (day)
  const hit = releaseDays.filter(({ date }) => {
    if (q) return date.getFullYear() % 100 === +q[2] && Math.floor(date.getMonth() / 3) + 1 === +q[1];
    if (m && !/days/.test(range)) return date.getFullYear() % 100 === +m[2] && MONTHS[date.getMonth()] === m[1];
    if (d) return date.getFullYear() === 2024 && MONTHS[date.getMonth()] === d[1] && date.getDate() === +d[2];
    return false;
  });
  return hit.length ? ` · ${hit.map((h) => h.title).join(', ')} out` : '';
}
const pctChange = (now, prev) => (prev > 0 ? ((now - prev) / prev) * 100 : null);
const changeHTML = (c) => (c == null ? '<span class="muted">—</span>' : `<span class="${c >= 0 ? 'up' : 'down'}">${c >= 0 ? '▲ +' : '▼ '}${c.toFixed(1)}%</span>`);

/* ───────── render ───────── */
const plot = $('#plot');
let chartType = 'line';
let sortKey = 'value';
let sortDir = -1;
let last = null;

function state() {
  const range = sel('Date range').value.replace('Custom range…', 'Last 12 months');
  const filters = {};
  for (const k of ['Asset', 'Product', 'DSP', 'Artist', 'Territory', 'Label']) {
    const v = sel(k).value;
    if (v && v !== 'Worldwide') filters[k] = v;
  }
  return { metric: sel('View').value, group: sel('Group by').value, range, filters };
}

function render() {
  const s = state();
  const r = query(s);
  last = { s, r };
  const isMoney = s.metric === 'Revenue';
  const fmt = isMoney ? fmtUSD : (v) => (s.metric === 'Downloads' && v < 10 ? v.toFixed(1) : fmtNum(v));
  const axis = isMoney ? (v) => `$${v >= 1000 ? fmtK(v) : Math.round(v)}` : (v) => (v < 10 ? v.toFixed(1) : fmtK(v));

  // stat cards
  $('#st-now-l').textContent = `${s.metric} · ${s.range.replace('Last ', 'last ')}`;
  $('#st-now').textContent = isMoney ? fmtUSD(r.total) : fmtNum(r.total);
  $('#st-now-c').innerHTML = changeHTML(pctChange(r.total, r.prevTotal));
  $('#st-all-l').textContent = `${s.metric} · all time`;
  $('#st-all').textContent = isMoney ? fmtUSD(r.allTime) : fmtNum(r.allTime);

  // chart
  const series = r.series.map((x, i) => ({ name: x.name, values: x.values, color: color(x.name, i, s.group) }));
  $('#chart-title').textContent = `${s.metric} by ${s.group === 'DSP' ? 'platform' : s.group.toLowerCase()}`;
  $('#legend').innerHTML = series.map((x) => `<span><i style="--c:${x.color}"></i>${x.name}</span>`).join('') + (r.rows.length > 5 ? `<span class="legend2__more">Top 5 of ${r.rows.length}</span>` : '');
  if (!series.length) {
    plot.innerHTML = '<p class="chart__empty">No data for this selection.</p>';
  } else {
    const chart = renderChart(plot, {
      labels: r.labels,
      series,
      type: chartType,
      ticks: 3,
      format: fmt,
      axisFormat: axis,
      xEvery: r.labels.length > 14 ? 5 : 0,
      tooltipTitle: (l) => `${l}${releaseNote(l, s.range)}`,
      label: `${s.metric} by ${s.group}, ${s.range}`,
    });
    plot._chart = chart;
  }
  renderTable();
}

function renderTable() {
  const { s, r } = last;
  const isMoney = s.metric === 'Revenue';
  const fmt = isMoney ? fmtUSD : (v) => (s.metric === 'Downloads' && v < 10 ? v.toFixed(1) : fmtNum(v));
  const head = [
    ['name', s.group === 'DSP' ? 'Platform' : s.group],
    ['value', `${s.metric} · ${s.range.replace('Last ', 'last ')}`],
    ['share', 'Share'],
    ['change', 'Change'],
  ];
  const rows = r.rows.map((x) => ({ ...x, share: r.total ? (x.value / r.total) * 100 : 0, change: pctChange(x.value, x.prev) }));
  rows.sort((a, b) => {
    const x = a[sortKey] ?? -Infinity;
    const y = b[sortKey] ?? -Infinity;
    return (typeof x === 'string' ? x.localeCompare(y) : x - y) * sortDir;
  });
  $('#an-table thead').innerHTML = `<tr>${head
    .map(([k, t]) => `<th${k === sortKey ? ` aria-sort="${sortDir < 0 ? 'descending' : 'ascending'}"` : ''}><button class="sort" type="button" data-k="${k}">${t} <i>${k === sortKey ? (sortDir < 0 ? '▼' : '▲') : '⇅'}</i></button></th>`)
    .join('')}</tr>`;
  $('#an-table tbody').innerHTML = rows.length
    ? rows
        .map((x) => `<tr><td>${x.name}</td><td>${fmt(x.value)}</td><td><span class="sharebar"><i style="width:${x.share.toFixed(1)}%"></i></span>${x.share.toFixed(1)}%</td><td>${changeHTML(x.change)}</td></tr>`)
        .join('')
    : '<tr><td colspan="4" class="muted">No data for this selection.</td></tr>';
}

$('#an-table').addEventListener('click', (e) => {
  const b = e.target.closest('[data-k]');
  if (!b) return;
  if (sortKey === b.dataset.k) sortDir *= -1;
  else {
    sortKey = b.dataset.k;
    sortDir = sortKey === 'name' ? 1 : -1;
  }
  renderTable();
});
document.querySelectorAll('.an-top select, .an-filters select').forEach((s) =>
  s.addEventListener('change', () => {
    // picking an asset implies its product
    if (s === sel('Asset') && s.value) sel('Product').value = s.value.split(':')[0];
    if (s === sel('Product') && sel('Asset').value && !sel('Asset').value.startsWith(`${s.value}:`)) sel('Asset').value = '';
    render();
  }),
);
document.querySelector('.viewtoggle').addEventListener('change', (e) => {
  chartType = e.detail;
  plot._chart?.setType(chartType);
});
document.querySelector('[data-clear]').addEventListener('click', (e) => {
  e.preventDefault();
  document.querySelectorAll('.an-filters select').forEach((s) => (s.selectedIndex = 0));
  render();
});

// monthly listeners / followers cards (artist-level, not filtered)
$('#st-listeners').textContent = fmtNum(Math.round(recentStreams(null, 30) / 3.15));
render();
