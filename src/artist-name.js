// Settings › Artist › Change artist name (Artist Name Setup Figma: 1-635 notice → 1-693 →
// existing 1-1246/1-709 → Spotify match 1-970 → Apple Music match 1-1064 → done 1-1170,
// or new 1-950/1-930 → done 1-1208). Steps are routed by #hash; matches are sample data.
const $ = (s, c = document) => c.querySelector(s);
const steps = [...document.querySelectorAll('.an__step')];
const esc = (v) => v.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const st = {
  get() {
    try {
      return JSON.parse(sessionStorage.getItem('exd-artist-flow')) || {};
    } catch {
      return {};
    }
  },
  set(p) {
    try {
      sessionStorage.setItem('exd-artist-flow', JSON.stringify({ ...st.get(), ...p }));
    } catch {}
  },
};

const PHOTO = '/assets/dashboard/artist-photo.jpg';
const matches = (name, platform) =>
  platform === 'spotify'
    ? [{ id: 's1', name, genre: 'R&B / Soul', img: PHOTO }]
    : [
        { id: 'a1', name, genre: 'R&B / Soul', img: PHOTO },
        { id: 'a2', name: name.toUpperCase(), genre: 'Electronic / House', img: null },
      ];

function renderMatches(form, platform, name) {
  const list = $('.an__matches', form);
  list.innerHTML = matches(name, platform)
    .map(
      (m) => `<li><label class="an__match">
        ${m.img ? `<img src="${m.img}" alt="" />` : `<span class="an__avatar" aria-hidden="true">${esc(m.name.slice(0, 1))}</span>`}
        <span><b>${esc(m.name)}</b><small>${m.genre}</small></span>
        <input type="radio" name="${platform}" value="${m.id}" />
        <i class="an__check" aria-hidden="true"></i>
      </label></li>`,
    )
    .join('');
  $('button[type="submit"]', form).disabled = true;
}

function show() {
  let step = location.hash.slice(1);
  const s = st.get();
  if (!steps.some((x) => x.dataset.step === step)) step = '';
  if ((step === 'spotify' || step === 'apple') && !s.name) step = 'existing';
  if (step === 'done' && !s.done) step = '';
  steps.forEach((x) => (x.hidden = x.dataset.step !== step));
  document.querySelectorAll('.an__name').forEach((el) => (el.textContent = s.name || ''));
  if (step === 'spotify' || step === 'apple') renderMatches($(`[data-pick="${step}"]`), step, s.name);
  if (step === 'done') {
    $('#done-text').innerHTML =
      `Your tracks will be available under the name ‘<em>${esc(s.name)}</em>’ on Spotify, Apple Music, and over 150+ platforms.` +
      (s.mode === 'new' ? ' Profile creation may take up to 3 days.' : '');
  }
  window.scrollTo(0, 0);
  steps.find((x) => !x.hidden)?.querySelector('h1')?.focus({ preventScroll: true });
}
window.addEventListener('hashchange', show);

const finish = (name, mode) => {
  try {
    localStorage.setItem('exd-artist-name', name);
    localStorage.setItem('exd-artist-named', '1');
  } catch {}
  st.set({ name, mode, done: true });
  location.hash = 'done';
};

/* existing: by name, or by profile link */
const exName = $('#ex-name');
const exForm = $('#ex-form');
let linkMode = false;
$('#ex-mode').addEventListener('click', () => {
  linkMode = !linkMode;
  $('#ex-label').textContent = linkMode ? 'Profile link' : 'Artist Name';
  exName.placeholder = linkMode ? 'https://open.spotify.com/artist/...' : 'Enter artist name here...';
  exName.type = linkMode ? 'url' : 'text';
  $('#ex-sub').textContent = linkMode ? 'Paste the link to your Spotify or Apple Music artist page.' : "Enter your artist name exactly as it's listed.";
  $('#ex-mode').textContent = linkMode ? 'Enter artist name' : 'Enter profile link';
  exName.value = '';
  $('button[type="submit"]', exForm).disabled = true;
  exName.focus();
});
exName.addEventListener('input', () => {
  const v = exName.value.trim();
  $('button[type="submit"]', exForm).disabled = linkMode ? !/^https?:\/\/(open\.spotify\.com|music\.apple\.com)\//.test(v) : !v;
});
exForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const v = exName.value.trim();
  if (!v) return;
  // a pasted link stands in for the profile's name (sample data)
  let current = 'Rion Hale';
  try {
    current = localStorage.getItem('exd-artist-name') || current;
  } catch {}
  const name = linkMode ? current : v;
  st.set({ name, mode: 'existing', done: false });
  location.hash = 'spotify';
});

/* platform matches */
document.querySelectorAll('[data-pick]').forEach((form) => {
  form.addEventListener('change', () => ($('button[type="submit"]', form).disabled = !form.querySelector('input:checked')));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.querySelector('input:checked')) return;
    if (form.dataset.next === 'done') finish(st.get().name, 'existing');
    else location.hash = form.dataset.next;
  });
});

/* new name */
const newName = $('#new-name');
const newForm = $('#new-form');
newName.addEventListener('input', () => ($('button[type="submit"]', newForm).disabled = !newName.value.trim()));
newForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const v = newName.value.trim();
  if (v) finish(v, 'new');
});

show();
