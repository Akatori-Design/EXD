// Album page: fills the Figma album layout from the album id in the URL (?id=dont-waste|vivid|new).
import { albumById } from './releases.js';
import { recentStreams } from './analytics-data.js';

const id = new URLSearchParams(location.search).get('id') || 'dont-waste';
const album = albumById(id) || albumById('dont-waste');
const $ = (s) => document.querySelector(s);

document.title = `${album.title} — EXD`;
$('#crumb-title').textContent = album.title;
$('.ainfo__kind').textContent = album.meta.find(([k]) => k === 'Format')?.[1] || 'Album';
$('#title').textContent = album.title;
$('#cover').src = album.cover;
$('#cover').alt = `${album.title} cover art`;

const status = $('#status');
status.textContent = album.status;
status.classList.add(`is-${album.status}`);

$('#meta').innerHTML = album.meta.map(([k, v]) => `<div><dt>${k}:</dt><dd>${escape(v)}</dd></div>`).join('');

const body = $('#tracks');
// 60-second instrumental previews live in /assets/music/<album-id>-<n>.mp3
const hasAudio = id !== 'new';
const src = (i) => `/assets/music/${id}-${i + 1}.mp3`;
body.innerHTML = album.tracks
  .map(
    ([name, dur], i) => `<tr data-i="${i}">
      <td>${i + 1}.</td>
      <td><span class="tname">${escape(name)}</span><span class="tprog" aria-hidden="true"><i></i></span></td>
      <td>${escape(album.meta[0][1])}</td>
      <td class="tdur" data-dur="${escape(dur)}">${escape(dur)}</td>
      <td><button class="playbtn" type="button" aria-label="Play preview of ${escape(name)}" aria-pressed="false"${hasAudio ? '' : ' disabled title="Preview available after release"'}><svg viewBox="0 0 16 16"><use href="#i-play" /></svg></button></td>
    </tr>`,
  )
  .join('');

/* ───────── preview player: one track at a time, auto-advances ───────── */
const audio = new Audio();
audio.preload = 'none';
let current = -1;
const rows = [...body.rows];
const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;

function setRow(i, playing) {
  rows.forEach((r, k) => {
    const on = k === i;
    const btn = r.querySelector('.playbtn');
    r.classList.toggle('is-current', on);
    r.classList.toggle('is-playing', on && playing);
    btn.setAttribute('aria-pressed', String(on && playing));
    btn.querySelector('use').setAttribute('href', on && playing ? '#i-pause' : '#i-play');
    if (!on) {
      r.querySelector('.tdur').textContent = r.querySelector('.tdur').dataset.dur;
      r.querySelector('.tprog i').style.width = '0';
    }
  });
}
function play(i) {
  if (i !== current) {
    current = i;
    audio.src = src(i);
  }
  audio.play().catch(() => setRow(current, false));
}
body.addEventListener('click', (e) => {
  const btn = e.target.closest('.playbtn');
  if (!btn || btn.disabled) return;
  const i = +btn.closest('tr').dataset.i;
  if (i === current && !audio.paused) audio.pause();
  else play(i);
});
audio.addEventListener('play', () => setRow(current, true));
audio.addEventListener('pause', () => setRow(current, false));
audio.addEventListener('timeupdate', () => {
  const r = rows[current];
  if (!r || !audio.duration) return;
  r.querySelector('.tprog i').style.width = `${(audio.currentTime / audio.duration) * 100}%`;
  r.querySelector('.tdur').textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
});
audio.addEventListener('ended', () => {
  if (current < rows.length - 1) play(current + 1);
  else {
    setRow(-1, false);
    current = -1;
  }
});
// Space toggles playback when focus isn't in a form field
document.addEventListener('keydown', (e) => {
  if (e.code !== 'Space' || e.target.closest('input, textarea, button, select') || current < 0) return;
  e.preventDefault();
  audio.paused ? audio.play() : audio.pause();
});

/* ───────── stream stats: 1 WK / 1 MO / ALL ───────── */
const statNum = document.querySelector('.astats__num');
const statNote = document.querySelector('.astats__note');
const streams = album.streams?.all ? { wk: recentStreams(id, 7), mo: recentStreams(id, 30), all: album.streams.all } : { wk: 0, mo: 0, all: 0 };
const showStat = (k) => (statNum.textContent = (streams[k] || 0).toLocaleString('en-US'));
statNote.textContent = album.status === 'released' ? 'Streams across all platforms' : 'Stats start about 48 hours after release';
showStat('wk');
document.querySelector('.rangetabs').addEventListener('change', (e) => showStat(e.detail));

function escape(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}
