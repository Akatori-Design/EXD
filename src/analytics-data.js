// Analytics data model for the demo artist.
// Builds a daily stream history per release (launch spike, then a long tail), then splits it by
// platform, territory, stream source, age, gender and device with fixed shares. Every view in the
// app (Analytics, Home, album pages) reads from here so the numbers always agree.
import { ALBUMS } from './releases.js';

const DAY = 864e5;
export const START = new Date(2023, 0, 1);
export const END = new Date(2024, 6, 31); // "today" for the demo data
const D = Math.round((END - START) / DAY) + 1;
const dayIndex = (d) => Math.round((d - START) / DAY);
const dateAt = (i) => new Date(START.getTime() + i * DAY);

// ---------- seeded noise ----------
function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(20240731);
const dayMul = Array.from({ length: D }, (_, i) => {
  const dow = dateAt(i).getDay(); // weekend lift
  const week = [1.05, 0.94, 0.95, 0.96, 0.99, 1.06, 1.08][dow];
  return week * (0.93 + rand() * 0.14);
});

// ---------- per-release daily streams ----------
const parseDate = (s) => new Date(s);
export const RELEASED = Object.entries(ALBUMS).filter(([, a]) => a.status === 'released' && a.streams?.all);
const albumDaily = {};
for (const [id, a] of RELEASED) {
  const rel = a.meta.find(([k]) => k === 'Released')?.[1];
  const r0 = Math.max(0, dayIndex(parseDate(rel)));
  const arr = new Float64Array(D);
  let sum = 0;
  for (let i = r0; i < D; i++) {
    const k = i - r0;
    const v = (0.22 + 0.78 * Math.exp(-k / 24) + 0.12 * Math.exp(-k / 120)) * dayMul[i];
    arr[i] = v;
    sum += v;
  }
  const scale = a.streams.all / sum; // all-time total matches the catalogue figure
  for (let i = r0; i < D; i++) arr[i] *= scale;
  albumDaily[id] = arr;
}

// track weights inside a release: lead single + title track carry more
const trackWeights = {};
for (const [id, a] of RELEASED) {
  const w = a.tracks.map(([t], i) => (i === 0 ? 1.35 : 1) * (t.toLowerCase().includes(a.title.toLowerCase()) ? 1.5 : 1) * Math.pow(0.86, i));
  const s = w.reduce((x, y) => x + y, 0);
  trackWeights[id] = w.map((x) => x / s);
}
export const TRACKS = RELEASED.flatMap(([id, a]) => a.tracks.map(([t], i) => ({ album: id, index: i, title: t })));

// ---------- dimension shares ----------
export const DIMS = {
  DSP: {
    Spotify: 0.69, 'YouTube Music': 0.03, 'YouTube Content ID': 0.122, 'Apple Music': 0.101, iTunes: 0.0002, 'Amazon Music': 0.024,
    Deezer: 0.0105, TIDAL: 0.0049, TikTok: 0.006, 'Instagram / Facebook': 0.003, SoundCloud: 0.002, Pandora: 0.0018, Audiomack: 0.0012,
    Anghami: 0.0004, Boomplay: 0.0004, JioSaavn: 0.0003, 'NetEase Cloud Music': 0.0078, 'Tencent Music': 0.0011, 'Kakao / MelOn': 0.0046, 'LINE MUSIC': 0.0007,
  },
  Territory: {
    'United States': 0.31, 'United Kingdom': 0.09, Germany: 0.08, 'South Korea': 0.07, Japan: 0.05, France: 0.05, Canada: 0.045, Brazil: 0.045,
    Mexico: 0.04, Netherlands: 0.035, Australia: 0.03, Indonesia: 0.03, Philippines: 0.025, Poland: 0.02, Sweden: 0.02, 'Rest of world': 0.06,
  },
  'Stream source': { 'Algorithmic playlists': 0.34, 'User library & playlists': 0.27, 'Editorial playlists': 0.12, 'Artist profile & catalogue': 0.15, Search: 0.07, Other: 0.05 },
  'Age group': { '18–24': 0.31, '25–34': 0.39, '35–44': 0.17, '45–54': 0.08, '55+': 0.05 },
  Gender: { Female: 0.46, Male: 0.49, 'Non-binary / not specified': 0.05 },
  Device: { Mobile: 0.71, Desktop: 0.14, 'Smart speaker': 0.06, 'TV / console': 0.05, Car: 0.04 },
};
// every dimension's shares add up to exactly 1
for (const dim of Object.values(DIMS)) {
  const sum = Object.values(dim).reduce((a, b) => a + b, 0);
  for (const k in dim) dim[k] /= sum;
}
// payout per stream (USD) and download share
const RATE = { Spotify: 0.0035, 'Apple Music': 0.006, 'YouTube Music': 0.002, 'YouTube Content ID': 0.0007, 'Amazon Music': 0.004, Deezer: 0.003, TIDAL: 0.009, TikTok: 0.0004, 'Instagram / Facebook': 0.0003, SoundCloud: 0.0025, Pandora: 0.0013, iTunes: 0.0035 };
const rate = (dsp) => RATE[dsp] ?? 0.0018;
const AVG_RATE = Object.entries(DIMS.DSP).reduce((s, [k, v]) => s + v * rate(k), 0);
const DL_SHARE = { iTunes: 0.78, 'Amazon Music': 0.22 };
const DL_PER_STREAM = 112 / 611127;

export const METRICS = ['Streams', 'Listeners', 'Saves', 'Downloads', 'Revenue'];
function metricFactor(metric, dsp) {
  switch (metric) {
    case 'Listeners':
      return 1 / 3.1;
    case 'Saves':
      return 0.045;
    case 'Downloads':
      return dsp ? ((DL_SHARE[dsp] || 0) * DL_PER_STREAM) / (DIMS.DSP[dsp] || 1) : DL_PER_STREAM;
    case 'Revenue':
      return dsp ? rate(dsp) : AVG_RATE;
    default:
      return 1;
  }
}

// ---------- ranges ----------
const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const short = (d) => `${M[d.getMonth()]} ${d.getDate()}`;
const monthLabel = (d) => `${M[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
// returns [{label, from, to}] bucket day-index windows
export function buckets(range) {
  const last = D - 1;
  const days = (n) => Array.from({ length: n }, (_, k) => last - n + 1 + k).map((i) => ({ label: short(dateAt(i)), from: i, to: i }));
  const months = (fromDate) => {
    const out = [];
    const d = new Date(fromDate);
    while (d <= END) {
      const a = dayIndex(d);
      const e = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      out.push({ label: monthLabel(d), from: Math.max(0, a), to: Math.min(last, dayIndex(e)) });
      d.setMonth(d.getMonth() + 1);
    }
    return out;
  };
  switch (range) {
    case 'Last 7 days':
      return days(7);
    case 'Last 30 days':
      return days(30);
    case 'Last 90 days':
      return Array.from({ length: 13 }, (_, k) => {
        const to = last - (12 - k) * 7;
        return { label: short(dateAt(to - 6)), from: to - 6, to };
      });
    case 'Year to date':
      return months(new Date(2024, 0, 1));
    case 'All time': {
      const out = [];
      for (let y = 2023; y <= 2024; y++)
        for (let q = 0; q < 4; q++) {
          const a = dayIndex(new Date(y, q * 3, 1));
          if (a > last) continue;
          out.push({ label: `Q${q + 1} ${String(y).slice(2)}`, from: a, to: Math.min(last, dayIndex(new Date(y, q * 3 + 3, 0))) });
        }
      return out;
    }
    default: // Last 12 months, Custom range
      return months(new Date(2023, 7, 1));
  }
}
const previousWindow = (bs) => {
  const len = bs.at(-1).to - bs[0].from + 1;
  return { from: Math.max(0, bs[0].from - len), to: bs[0].from - 1 };
};

// ---------- core ----------
// filters: { DSP, Territory, Product (album id), Asset ('albumId:index'), Artist, Label, 'Stream source', 'Age group', Gender, Device }
function baseDaily(f) {
  const out = new Float64Array(D);
  for (const [id] of RELEASED) {
    if (f.Product && f.Product !== id) continue;
    let w = 1;
    if (f.Asset) {
      const [aid, idx] = f.Asset.split(':');
      if (aid !== id) continue;
      w = trackWeights[id][+idx];
    } else if (f.Artist === 'Rion Hale feat. Joey Newman') {
      const idx = ALBUMS[id].tracks.findIndex(([t]) => t.includes('Joey Newman'));
      if (idx < 0) continue;
      w = trackWeights[id][idx];
    }
    const arr = albumDaily[id];
    for (let i = 0; i < D; i++) out[i] += arr[i] * w;
  }
  return out;
}
const sumRange = (arr, from, to) => {
  let s = 0;
  for (let i = Math.max(0, from); i <= to; i++) s += arr[i];
  return s;
};
function dimMultiplier(f, except) {
  let m = 1;
  for (const dim of ['DSP', 'Territory', 'Stream source', 'Age group', 'Gender', 'Device']) {
    if (dim === except || !f[dim]) continue;
    m *= DIMS[dim][f[dim]] ?? 0;
  }
  return m;
}

/**
 * query({ metric, group, range, filters }) →
 *   { labels, series:[{name, values}], rows:[{name, value, prev}], total, prevTotal, allTime }
 */
export function query({ metric = 'Streams', group = 'DSP', range = 'Last 12 months', filters = {} }) {
  const bs = buckets(range);
  const pw = previousWindow(bs);
  let groups; // [{name, daily, factor}]
  if (group === 'Product') {
    groups = RELEASED.filter(([id]) => !filters.Product || filters.Product === id).map(([id, a]) => ({ name: a.title, daily: baseDaily({ ...filters, Product: id }), m: 1, dsp: filters.DSP }));
  } else if (group === 'Asset') {
    groups = TRACKS.filter((t) => (!filters.Product || filters.Product === t.album) && (!filters.Asset || filters.Asset === `${t.album}:${t.index}`)).map((t) => ({
      name: t.title,
      daily: baseDaily({ ...filters, Product: t.album, Asset: `${t.album}:${t.index}` }),
      m: 1,
      dsp: filters.DSP,
    }));
  } else {
    const base = baseDaily(filters);
    const dim = DIMS[group];
    groups = Object.entries(dim)
      .filter(([k]) => !filters[group] || filters[group] === k)
      .map(([k, share]) => ({ name: k, daily: base, m: share, dsp: group === 'DSP' ? k : filters.DSP }));
  }
  const allTimeBase = baseDaily(filters);
  const outer = (g) => dimMultiplier(filters, group) * g.m * metricFactor(metric, g.dsp);
  const rows = groups.map((g) => {
    const k = outer(g);
    return {
      name: g.name,
      values: bs.map((b) => sumRange(g.daily, b.from, b.to) * k),
      value: sumRange(g.daily, bs[0].from, bs.at(-1).to) * k,
      prev: sumRange(g.daily, pw.from, pw.to) * k,
    };
  });
  rows.sort((a, b) => b.value - a.value);
  const total = rows.reduce((s, r) => s + r.value, 0);
  const prevTotal = rows.reduce((s, r) => s + r.prev, 0);
  const allK = dimMultiplier(filters, null) * metricFactor(metric, filters.DSP);
  return {
    labels: bs.map((b) => b.label),
    series: rows.slice(0, 5).filter((r) => r.value > 0),
    rows,
    total,
    prevTotal,
    allTime: sumRange(allTimeBase, 0, D - 1) * allK,
  };
}

/** Streams for one release over the last n days (for album pages / Home). */
export function recentStreams(albumId, days) {
  const arr = albumId ? albumDaily[albumId] : baseDaily({});
  return arr ? Math.round(sumRange(arr, D - days, D - 1)) : 0;
}
