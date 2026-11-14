// Settings › Account: Change Email (Change Email Figma 2001-664 → notice 2001-637) and
// Delete Account confirmation (All Flows 6984-15633).
// Front end only: "deleting" clears this browser's demo data and signs out.
const PHRASE = 'delete my account permanently';
const dlg = document.getElementById('deldlg');
const input = document.getElementById('del-input');
const go = document.getElementById('del-go');

document.getElementById('del-open').addEventListener('click', () => {
  input.value = '';
  go.disabled = true;
  dlg.showModal();
  input.focus();
});
input.addEventListener('input', () => {
  go.disabled = input.value.trim().toLowerCase() !== PHRASE;
});
dlg.addEventListener('click', (e) => {
  if (e.target === dlg || e.target.closest('[data-close]')) dlg.close();
});
document.getElementById('del-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (go.disabled) return;
  go.disabled = true;
  go.classList.add('is-busy');
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('exd-') && k !== 'exd-lang')
      .forEach((k) => localStorage.removeItem(k));
    sessionStorage.clear();
  } catch {}
  setTimeout(() => location.replace('/'), 700);
});

/* ───────── Change Email ───────── */
{
  const dlg = document.getElementById('chemail');
  const pass = document.getElementById('ce-pass');
  const email = document.getElementById('ce-email');
  const err = document.getElementById('ce-err');
  const save = document.getElementById('ce-save');
  const current = document.getElementById('email');
  const note = document.getElementById('email-note');
  const esc = (v) => v.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const setErr = (msg) => {
    err.textContent = msg;
    email.classList.toggle('is-invalid', !!msg);
    email.setAttribute('aria-invalid', !!msg);
  };

  document.getElementById('email-change').addEventListener('click', () => {
    pass.value = email.value = '';
    setErr('');
    save.disabled = true;
    dlg.showModal();
    pass.focus();
  });
  [pass, email].forEach((el) =>
    el.addEventListener('input', () => {
      save.disabled = !(pass.value && email.value.trim());
      if (el === email && err.textContent) setErr('');
    }),
  );
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg || e.target.closest('[data-close]')) dlg.close();
  });
  dlg.addEventListener('close', () => (pass.value = '')); // never keep the password around
  document.getElementById('chemail-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const next = email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(next)) return setErr('Please enter a valid email.'), email.focus();
    if (next.toLowerCase() === current.value.trim().toLowerCase()) return setErr('Email already taken.'), email.focus();
    dlg.close();
    // the address only changes after it's verified, so the field keeps the current one
    document.getElementById('email-note-text').innerHTML = `We have sent an email to <b>${esc(next)}</b>. We will keep using <b>${esc(current.value)}</b> until you verify the new address.`;
    note.hidden = false;
  });
  document.getElementById('email-note-x').addEventListener('click', () => (note.hidden = true));
}

/* ───────── Artist name ───────── */
{
  // the name chosen in /artist-name.html
  let name = null;
  try {
    name = localStorage.getItem('exd-artist-name');
  } catch {}
  const field = document.getElementById('artist-name');
  if (name && field) field.value = name;
  const dlg = document.getElementById('name-notice');
  document.getElementById('name-change').addEventListener('click', () => dlg.showModal());
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg || e.target.closest('[data-close]')) dlg.close();
  });
}
