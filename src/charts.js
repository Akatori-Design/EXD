// Small dependency-free SVG chart: line / area / grouped bars, with a hover crosshair
// that snaps to the nearest x position and shows every series' value in a tooltip.
//
//   const chart = renderChart(el, { labels, series: [{ name, color, values }], yMax, ticks, format, type, area });
//   chart.setType('bar' | 'line');

const NS = 'http://www.w3.org/2000/svg';
const W = 1000;
const H = 300;

export function renderChart(root, opts) {
  const { labels, series, ticks = 4, format = (v) => String(v), tooltipTitle = (l) => l } = opts;
  let type = opts.type || 'line';
  const max = opts.yMax || niceMax(Math.max(...series.flatMap((s) => s.values)));
  root.classList.add('chart');
  root.innerHTML = `
    <div class="chart__plot">
      <div class="chart__y"></div>
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img"></svg>
      <div class="chart__guide" hidden></div>
      <div class="chart__dots"></div>
      <div class="chart__tip" role="status" hidden></div>
    </div>
    <div class="chart__x">${labels.map((l, i) => `<span>${opts.xEvery && i % opts.xEvery && i !== labels.length - 1 ? '' : l}</span>`).join('')}</div>`;
  const plot = root.querySelector('.chart__plot');
  const svg = root.querySelector('svg');
  const guide = root.querySelector('.chart__guide');
  const dotsEl = root.querySelector('.chart__dots');
  const tip = root.querySelector('.chart__tip');
  svg.setAttribute('aria-label', opts.label || series.map((s) => s.name).join(', '));

  // y axis labels + grid
  root.querySelector('.chart__y').innerHTML = Array.from({ length: ticks + 1 }, (_, i) => {
    const v = max - (max / ticks) * i;
    return `<span style="top:${(i / ticks) * 100}%">${opts.axisFormat ? opts.axisFormat(v) : format(v)}</span>`;
  }).join('');

  const n = labels.length;
  const x = (i) => (n === 1 ? W / 2 : (i / (n - 1)) * W);
  const y = (v) => H - (v / max) * H;
  const pct = (i) => (n === 1 ? 50 : (i / (n - 1)) * 100);

  function draw() {
    const grid = Array.from({ length: ticks + 1 }, (_, i) => `<line class="chart__grid" x1="0" x2="${W}" y1="${(H / ticks) * i}" y2="${(H / ticks) * i}"/>`).join('');
    let marks = '';
    if (type === 'bar') {
      const slot = W / n;
      const bw = Math.min(28, (slot * 0.7) / series.length);
      series.forEach((s, k) => {
        marks += s.values
          .map((v, i) => {
            const cx = slot * i + slot / 2 - (bw * series.length) / 2 + bw * k;
            return `<rect x="${cx.toFixed(1)}" y="${y(v).toFixed(1)}" width="${bw.toFixed(1)}" height="${(H - y(v)).toFixed(1)}" rx="2" fill="${s.color}"/>`;
          })
          .join('');
      });
    } else {
      series.forEach((s, k) => {
        const pts = s.values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
        if (opts.area) {
          const id = `cg${Math.random().toString(36).slice(2, 8)}${k}`;
          marks += `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.color}" stop-opacity=".45"/><stop offset="1" stop-color="${s.color}" stop-opacity=".02"/></linearGradient></defs>`;
          marks += `<polygon points="0,${H} ${pts} ${W},${H}" fill="url(#${id})"/>`;
        }
        marks += `<polyline points="${pts}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`;
      });
    }
    svg.innerHTML = grid + marks;
    // pixel-perfect dots (not stretched by the SVG's non-uniform scale)
    dotsEl.innerHTML = series.map((s) => `<i style="--c:${s.color}" hidden></i>`).join('');
  }

  function show(i) {
    const left = type === 'bar' ? ((i + 0.5) / n) * 100 : pct(i);
    guide.hidden = false;
    guide.style.left = `${left}%`;
    [...dotsEl.children].forEach((d, k) => {
      d.hidden = type === 'bar';
      d.style.left = `${left}%`;
      d.style.top = `${(y(series[k].values[i]) / H) * 100}%`;
    });
    tip.hidden = false;
    tip.innerHTML =
      `<b>${tooltipTitle(labels[i], i)}</b>` +
      series.map((s) => `<span><i style="--c:${s.color}"></i>${s.name}<em>${format(s.values[i])}</em></span>`).join('') +
      (series.length > 1 && opts.total !== false ? `<span class="chart__tot">Total<em>${format(series.reduce((a, s) => a + s.values[i], 0))}</em></span>` : '');
    // keep the tooltip inside the plot
    const pw = plot.clientWidth;
    const tw = tip.offsetWidth;
    const px = (left / 100) * pw;
    tip.style.left = `${Math.min(Math.max(px + 12, 0), pw - tw) - (px + 12 > pw - tw ? tw + 24 : 0)}px`;
    [...root.querySelectorAll('.chart__x span')].forEach((s, k) => s.classList.toggle('is-on', k === i));
  }
  function hide() {
    guide.hidden = true;
    tip.hidden = true;
    [...dotsEl.children].forEach((d) => (d.hidden = true));
    root.querySelectorAll('.chart__x span').forEach((s) => s.classList.remove('is-on'));
  }
  function nearest(clientX) {
    const r = plot.getBoundingClientRect();
    const f = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
    return type === 'bar' ? Math.min(n - 1, Math.floor(f * n)) : Math.round(f * (n - 1));
  }
  plot.addEventListener('pointermove', (e) => show(nearest(e.clientX)));
  plot.addEventListener('pointerleave', hide);
  // keyboard: arrow keys move through points
  plot.tabIndex = 0;
  let kb = -1;
  plot.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    kb = Math.min(n - 1, Math.max(0, (kb < 0 ? (e.key === 'ArrowRight' ? -1 : n) : kb) + (e.key === 'ArrowRight' ? 1 : -1)));
    show(kb);
  });
  plot.addEventListener('blur', () => {
    kb = -1;
    hide();
  });

  draw();
  return {
    setType(t) {
      type = t;
      draw();
      hide();
    },
  };
}

function niceMax(v) {
  const p = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= v * 1.08) return m * p;
  return 10 * p;
}

export const fmtK = (v) => (v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : String(Math.round(v)));
export const fmtNum = (v) => Math.round(v).toLocaleString('en-US');
export const fmtUSD = (v) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
