// Release Music flow (Figma: Add your Music → Uploaded → Add Cover Art → Add Release Details →
// Add Track Details → Royalty Sharing → Release Date → Review and Submit → Submitted).
// Everything stays in the browser; nothing is uploaded anywhere.
import './app.js';
import { saveRelease } from './releases.js';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const ARTIST = 'Rion Hale';

const state = {
  tracks: [], // {id, file, duration, title, artists, contrib, pub, lyrics, audio, meta, explicit}
  cover: null, // data URL
  splits: {}, // trackId -> [{name, email, pct, you}]
  royaltyTrack: null,
  date: '',
};
let nextId = 1;

/* ───────── steps ───────── */
const ORDER = ['upload', 'uploaded', 'cover', 'details', 'tracks', 'royalty', 'date', 'review'];
const steps = Object.fromEntries($$('.step').map((s) => [s.dataset.step, s]));

function reachable(step) {
  const i = ORDER.indexOf(step);
  if (i < 0) return 'upload';
  if (i >= 1 && !state.tracks.length) return 'upload';
  if (i >= 3 && !state.cover) return 'cover';
  if (i >= 4 && !detailsValid()) return 'details';
  if (i >= 5 && !tracksDone()) return 'tracks';
  if (i >= 6 && !splitsValid()) return 'royalty';
  if (i >= 7 && !state.date) return 'date';
  return step;
}

function show(step, push = true) {
  step = reachable(step);
  for (const [k, el] of Object.entries(steps)) el.hidden = k !== step;
  if (step === 'royalty') renderRoyalty();
  if (step === 'review') renderReview();
  if (step === 'tracks') renderTracks();
  if (push && location.hash !== `#${step}`) history.pushState(null, '', `#${step}`);
  window.scrollTo(0, 0);
  $('.step__title', steps[step]).focus({ preventScroll: true });
  refresh();
}
$$('.step__title').forEach((h) => (h.tabIndex = -1));
window.addEventListener('popstate', () => show(location.hash.slice(1) || 'upload', false));
document.addEventListener('click', (e) => {
  const go = e.target.closest('[data-go]');
  if (go && !go.disabled) show(go.dataset.go);
});

/* ───────── files: audio + cover ───────── */
function fmt(sec) {
  if (!Number.isFinite(sec)) return '';
  const s = Math.round(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
function addAudio(files) {
  const audio = [...files].filter((f) => f.type.startsWith('audio/') || /\.(wav|m4a|mp3|flac|aiff?)$/i.test(f.name));
  if (!audio.length) return;
  for (const f of audio) {
    const t = {
      id: nextId++,
      file: f.name,
      blob: f,
      duration: '',
      title: '',
      artists: [{ name: ARTIST, primary: true }],
      contrib: [],
      pub: [],
      lyrics: '',
      audio: 'English',
      meta: 'English',
      explicit: 'Not explicit',
    };
    state.tracks.push(t);
    state.splits[t.id] = [{ name: `${ARTIST} (You)`, pct: 100, you: true }];
    // read the duration from the file's metadata
    const url = URL.createObjectURL(f);
    const a = new Audio();
    a.preload = 'metadata';
    a.onloadedmetadata = () => {
      t.duration = fmt(a.duration);
      URL.revokeObjectURL(url);
      renderFiles();
    };
    a.onerror = () => URL.revokeObjectURL(url);
    a.src = url;
  }
  renderFiles();
  renderTracks();
  const cur = ORDER.find((k) => !steps[k].hidden);
  if (cur === 'upload') show('uploaded');
}

function setCover(file) {
  if (!file || !/^image\/(jpeg|png)$/.test(file.type)) return;
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = () => {
    // keep a 600px square copy (small enough to remember for My Music)
    const size = 600;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    c.getContext('2d').drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size);
    state.cover = c.toDataURL('image/jpeg', 0.82);
    URL.revokeObjectURL(url);
    renderCover();
  };
  img.src = url;
}

function renderCover() {
  const has = !!state.cover;
  $$('[data-cover-img], [data-cover-thumb]').forEach((img) => {
    if (has) img.src = state.cover;
    img.hidden = !has;
  });
  $$('[data-cover-done]').forEach((el) => (el.hidden = !has));
  $('[data-cover-hint]').hidden = has;
  $('[data-cover-empty]').hidden = has;
  $('.drop--cover').classList.toggle('has-img', has);
  refresh();
}

document.addEventListener('change', (e) => {
  const input = e.target.closest('[data-input]');
  if (!input) return;
  if (input.dataset.input === 'audio') addAudio(input.files);
  else setCover(input.files[0]);
  input.value = '';
});
$$('[data-drop]').forEach((zone) => {
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('is-over');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('is-over'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('is-over');
    if (zone.dataset.drop === 'audio') addAudio(e.dataTransfer.files);
    else setCover(e.dataTransfer.files[0]);
  });
});

function renderFiles() {
  $('#file-list').innerHTML = state.tracks
    .map(
      (t, i) => `<li><span>${i + 1}. ${esc(t.file)}</span><span>${esc(t.duration)}</span><button class="violet" type="button" data-remove="${t.id}">Remove</button></li>`,
    )
    .join('');
}
document.addEventListener('click', (e) => {
  const rm = e.target.closest('[data-remove]');
  if (!rm) return;
  const id = Number(rm.dataset.remove);
  state.tracks = state.tracks.filter((t) => t.id !== id);
  delete state.splits[id];
  renderFiles();
  renderTracks();
  if (!state.tracks.length) show('upload');
  refresh();
});

/* ───────── release details ───────── */
const details = $('#details');
const year = String(new Date().getFullYear());
details.cyear.value = details.pyear.value = year;
details.ctext.value = details.ptext.value = `${ARTIST}, All rights reserved.`;

$$('.advtoggle').forEach((btn) => {
  const adv = btn.parentElement.querySelector('.adv');
  btn.addEventListener('click', () => {
    if (!adv) return;
    const open = adv.hidden;
    adv.hidden = !open;
    btn.setAttribute('aria-expanded', open);
    btn.textContent = open ? 'Hide advanced fields' : 'Advanced fields';
  });
  if (!adv) btn.disabled = true;
});
$$('.switch').forEach((sw) => sw.addEventListener('click', () => sw.setAttribute('aria-checked', sw.getAttribute('aria-checked') !== 'true')));

function detailsValid() {
  return $$('[required]', details).every((el) => el.value.trim());
}
details.addEventListener('input', refresh);
details.addEventListener('change', refresh);

/* ───────── tracks + Track Details dialog ───────── */
const trackDone = (t) => !!t.title.trim();
const tracksDone = () => state.tracks.length > 0 && state.tracks.every(trackDone);
const credit = (t) => {
  const a = t.artists.map((x) => x.name).join(', ');
  const c = [...t.contrib.map((x) => [x.name, x.role].filter(Boolean).join(', ')), ...t.pub.map((x) => x.name)].join(', ');
  return c ? `${a} / ${c}` : a;
};

function renderTracks() {
  $('#track-list').innerHTML = state.tracks
    .map(
      (t, i) => `<li class="trow${trackDone(t) ? ' is-done' : ''}">
        <button class="trow__main" type="button" data-edit="${t.id}">
          <span class="trow__n">${i + 1}.</span>
          <span class="trow__txt"><b>${esc(trackDone(t) ? t.title : t.file)}</b>${trackDone(t) ? `<small>${esc(credit(t))}</small>` : ''}</span>
        </button>
        <span class="trow__tools">
          <button type="button" aria-label="Play ${esc(t.file)}" aria-pressed="${playingId === t.id}" data-play="${t.id}"><svg viewBox="0 0 16 16"><use href="${playingId === t.id ? '#i-pause' : '#i-play'}" /></svg></button>
          <label aria-label="Replace file for ${esc(t.file)}"><svg viewBox="0 0 16 16"><use href="#i-folder" /></svg><input class="sr" type="file" accept="audio/*" data-replace="${t.id}" /></label>
          <button type="button" class="trow__del" aria-label="Delete ${esc(t.file)}" data-remove="${t.id}"><svg viewBox="0 0 16 16"><use href="#i-trash" /></svg></button>
        </span>
      </li>`,
    )
    .join('');
}
// Play the uploaded file itself (it never leaves the browser).
const player = new Audio();
let playingId = null;
let playingUrl = null;
function stopPlayer() {
  player.pause();
  if (playingUrl) URL.revokeObjectURL(playingUrl);
  playingUrl = null;
  playingId = null;
  renderTracks();
}
player.addEventListener('ended', stopPlayer);
document.addEventListener('click', (e) => {
  const p = e.target.closest('[data-play]');
  if (!p) return;
  const id = Number(p.dataset.play);
  if (playingId === id) return stopPlayer();
  const t = state.tracks.find((x) => x.id === id);
  if (!t?.blob) return;
  if (playingUrl) URL.revokeObjectURL(playingUrl);
  playingUrl = URL.createObjectURL(t.blob);
  playingId = id;
  player.src = playingUrl;
  player.play().catch(stopPlayer);
  renderTracks();
});
document.addEventListener('change', (e) => {
  const r = e.target.closest('[data-replace]');
  if (!r || !r.files[0]) return;
  const t = state.tracks.find((x) => x.id === Number(r.dataset.replace));
  if (t) {
    if (playingId === t.id) stopPlayer();
    t.file = r.files[0].name;
    t.blob = r.files[0];
  }
  renderTracks();
  renderFiles();
});

const modal = $('#track-modal');
const tform = $('#track-form');
let editing = null;
let draft = null;

document.addEventListener('click', (e) => {
  const ed = e.target.closest('[data-edit]');
  if (!ed) return;
  editing = state.tracks.find((t) => t.id === Number(ed.dataset.edit));
  draft = structuredClone(editing);
  tform.title.value = draft.title;
  tform.title.placeholder = `Add title for ${draft.file}`;
  $('#t-lyrics').value = draft.lyrics;
  $('#t-lyrics').hidden = !draft.lyrics;
  $('[data-lyrics]').hidden = !!draft.lyrics;
  tform.audio.value = draft.audio;
  tform.meta.value = draft.meta;
  tform.explicit.value = draft.explicit;
  $$('.adder', tform).forEach((a) => (a.hidden = true));
  renderPeople();
  checkSave();
  modal.showModal();
  $('.modal__body', modal).scrollTop = 0;
  tform.title.focus();
});

function renderPeople() {
  $('#t-artists').innerHTML = draft.artists
    .map(
      (a, i) => `<div class="pcard">
        <div><b>${esc(a.name)}</b>
          <span class="pcard__role"><button class="switch switch--sm" type="button" role="switch" aria-checked="${a.primary}" data-primary="${i}" aria-label="${esc(a.name)} is primary artist"></button>${a.primary ? 'Primary' : 'Featured'}</span>
        </div>
        <button class="pcard__x" type="button" data-del="artists:${i}" aria-label="Remove ${esc(a.name)}"><svg viewBox="0 0 16 16"><use href="#i-x" /></svg></button>
      </div>`,
    )
    .join('');
  const list = (key, sub) =>
    draft[key]
      .map(
        (p, i) => `<div class="pcard"><div><b>${esc(p.name)}</b><small>${esc(p[sub] || '')}</small></div>
          <button class="pcard__x pcard__x--dots" type="button" data-del="${key}:${i}" aria-label="Remove ${esc(p.name)}"><i></i><i></i><i></i></button></div>`,
      )
      .join('');
  $('#t-contrib').innerHTML = list('contrib', 'role');
  $('#t-pub').innerHTML = list('pub', 'company');
  $$('[data-open-adder]', tform).forEach((b) => {
    if (!b.dataset.empty) return;
    const key = b.dataset.openAdder;
    b.textContent = draft[key].length ? b.dataset.more : b.dataset.empty;
  });
}

tform.addEventListener('click', (e) => {
  const prim = e.target.closest('[data-primary]');
  if (prim) {
    const a = draft.artists[Number(prim.dataset.primary)];
    a.primary = !a.primary;
    renderPeople();
    return;
  }
  const del = e.target.closest('[data-del]');
  if (del) {
    const [key, i] = del.dataset.del.split(':');
    if (key === 'artists' && draft.artists.length === 1) return; // a track needs one artist
    draft[key].splice(Number(i), 1);
    renderPeople();
    checkSave();
    return;
  }
  const open = e.target.closest('[data-open-adder]');
  if (open) {
    const adder = $(`[data-adder="${open.dataset.openAdder}"]`, tform);
    adder.hidden = false;
    $('input', adder).focus();
    return;
  }
  const ok = e.target.closest('[data-add-ok]');
  if (ok) {
    commitAdder(ok.closest('.adder'));
    return;
  }
  if (e.target.closest('[data-lyrics]')) {
    $('[data-lyrics]').hidden = true;
    $('#t-lyrics').hidden = false;
    $('#t-lyrics').focus();
    return;
  }
  if (e.target.closest('[data-close]')) modal.close();
});
tform.addEventListener('keydown', (e) => {
  const adder = e.target.closest('.adder');
  if (adder && e.key === 'Enter') {
    e.preventDefault();
    commitAdder(adder);
  }
});
function commitAdder(adder) {
  const [a, b] = $$('input', adder).map((i) => i.value.trim());
  if (!a) return;
  const key = adder.dataset.adder;
  if (key === 'artist') draft.artists.push({ name: a, primary: false });
  if (key === 'contrib') draft.contrib.push({ name: a, role: b });
  if (key === 'pub') draft.pub.push({ name: a, company: b });
  $$('input', adder).forEach((i) => (i.value = ''));
  adder.hidden = true;
  renderPeople();
  checkSave();
}

function checkSave() {
  $('#t-save').disabled = !tform.title.value.trim();
}
tform.addEventListener('input', checkSave);
tform.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!tform.title.value.trim()) return;
  Object.assign(editing, draft, {
    title: tform.title.value.trim(),
    lyrics: $('#t-lyrics').value,
    audio: tform.audio.value,
    meta: tform.meta.value,
    explicit: tform.explicit.value,
  });
  modal.close();
  renderTracks();
  refresh();
});
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.close(); // click on the backdrop
});

/* ───────── royalty sharing ───────── */
function splitsValid() {
  return state.tracks.every((t) => {
    const s = state.splits[t.id] || [];
    const sum = s.reduce((n, x) => n + (Number(x.pct) || 0), 0);
    return Math.abs(sum - 100) < 0.01 && s.every((x) => x.you || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x.email || ''));
  });
}
function renderRoyalty() {
  if (!state.tracks.some((t) => t.id === state.royaltyTrack)) state.royaltyTrack = state.tracks[0]?.id;
  $('#royalty-tracks').innerHTML = state.tracks
    .map(
      (t, i) =>
        `<li><button type="button" data-rtrack="${t.id}" aria-pressed="${t.id === state.royaltyTrack}"><span>${i + 1}.</span>${esc(t.title || t.file)}</button></li>`,
    )
    .join('');
  const s = state.splits[state.royaltyTrack] || [];
  $('#splits').innerHTML = s
    .map((x, i) =>
      x.you
        ? `<div class="royalty__row"><span>${esc(x.name)}</span><label class="pct"><input class="inp" inputmode="decimal" value="${x.pct}" data-pct="${i}" aria-label="Your royalty split" /><span aria-hidden="true">%</span></label></div>`
        : `<div class="royalty__row">
            <input class="inp royalty__email" type="email" placeholder="Collaborator email" value="${esc(x.email)}" data-email="${i}" aria-label="Collaborator email" />
            <button class="royalty__rm" type="button" data-rm-collab="${i}" aria-label="Remove collaborator"><svg viewBox="0 0 16 16"><use href="#i-minus" /></svg></button>
            <label class="pct"><input class="inp" inputmode="decimal" value="${x.pct}" data-pct="${i}" aria-label="Collaborator royalty split" /><span aria-hidden="true">%</span></label>
          </div>`,
    )
    .join('');
  refresh();
}
const royalty = steps.royalty;
royalty.addEventListener('click', (e) => {
  const tb = e.target.closest('[data-rtrack]');
  if (tb) {
    state.royaltyTrack = Number(tb.dataset.rtrack);
    renderRoyalty();
    return;
  }
  const s = state.splits[state.royaltyTrack];
  if (e.target.closest('[data-add-collab]')) {
    // new collaborator takes 40% from you, as in the Figma example (60 / 40)
    const you = s[0];
    const give = Math.min(40, Number(you.pct) || 0);
    you.pct = (Number(you.pct) || 0) - give;
    s.push({ email: '', pct: give });
    renderRoyalty();
    $$('[data-email]', royalty).at(-1)?.focus();
    return;
  }
  const rm = e.target.closest('[data-rm-collab]');
  if (rm) {
    const [x] = s.splice(Number(rm.dataset.rmCollab), 1);
    s[0].pct = (Number(s[0].pct) || 0) + (Number(x.pct) || 0);
    renderRoyalty();
  }
});
royalty.addEventListener('input', (e) => {
  const s = state.splits[state.royaltyTrack];
  if (e.target.dataset.pct) s[Number(e.target.dataset.pct)].pct = e.target.value.replace(/[^0-9.]/g, '');
  if (e.target.dataset.email) s[Number(e.target.dataset.email)].email = e.target.value.trim();
  refresh();
});

/* ───────── release date ───────── */
const relDate = $('#rel-date');
const soon = (iso) => iso && new Date(`${iso}T00:00`) - new Date() < 21 * 864e5;
const longDate = (iso, month = 'long') =>
  iso ? new Date(`${iso}T00:00`).toLocaleDateString('en-US', { month, day: 'numeric', year: 'numeric' }) : '';
relDate.addEventListener('input', () => {
  state.date = relDate.value;
  $('.datecard__note').hidden = !soon(state.date);
  refresh();
});
// the Consumer release date from the details step starts this one off
details.date.addEventListener('change', () => {
  if (!state.date && details.date.value) {
    relDate.value = state.date = details.date.value;
    $('.datecard__note').hidden = !soon(state.date);
  }
});

/* ───────── review + submit ───────── */
function renderReview() {
  const rows = [
    ['Release Title', details.title.value],
    ['Artist Name', details.artist.value],
    ['Genre', details.genre.value],
    ['Distribute as', details.distribute.value],
    ['Format', details.format.value],
  ];
  $('#review-album').innerHTML = rows.map(([k, v]) => `<div><dt>${k}:</dt><dd>${esc(v)}</dd></div>`).join('');
  $('#review-tracks').innerHTML = state.tracks
    .map((t, i) => `<li><span>${i + 1}.</span><div><b>${esc(t.title)}</b><small>${esc(credit(t))}</small></div></li>`)
    .join('');
  $('#review-date').textContent = longDate(state.date);
  $('#review-fine').hidden = !soon(state.date);
}
const confirms = $$('[data-confirm]');
confirms.forEach((c) => c.addEventListener('change', refresh));
$('[data-submit]').addEventListener('click', () => {
  saveRelease({
    title: details.title.value.trim(),
    artist: details.artist.value,
    genre: details.genre.value,
    format: details.format.value,
    date: state.date,
    dateLabel: longDate(state.date, 'short'),
    cover: state.cover,
    tracks: state.tracks.map((t) => ({ file: t.file, title: t.title, duration: t.duration })),
  });
  try {
    localStorage.setItem('exd-released', '1');
  } catch {}
  location.href = '/music.html?submitted=1';
});

/* ───────── enable / disable the primary buttons ───────── */
function refresh() {
  const need = {
    cover: !!state.cover,
    details: detailsValid(),
    tracks: tracksDone(),
    royalty: splitsValid(),
    date: !!state.date,
  };
  $$('[data-need]').forEach((b) => (b.disabled = !need[b.dataset.need]));
  $('[data-submit]').disabled = !confirms.every((c) => c.checked);
  const bad = !splitsValid() && !steps.royalty.hidden;
  $('.royalty__err').hidden = !bad;
}

renderCover();
show(location.hash.slice(1) || 'upload', false);
