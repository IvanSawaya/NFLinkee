/* =========================================================
   Global state, persistence, and helpers
   ========================================================= */

const KEY = 'nfl-linkee-v1';

const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const uid = () => Math.random().toString(36).slice(2, 9);
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => (
  {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]
));

function shuffleArr(a){
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- default state (used if no localStorage) ---------- */
function defaultState(){
  return {
    cards: [],
    teams: [
      { id: uid(), name: 'Team 1', score: 0 },
      { id: uid(), name: 'Team 2', score: 0 }
    ]
  };
}

/* ---------- in-memory state ---------- */
let state = defaultState();

/* ---------- persistence ---------- */
function saveState(){
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save state:', e);
  }
}

function loadState(){
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    if (d && Array.isArray(d.cards) && Array.isArray(d.teams)) {
      state = d;
      return true;
    }
  } catch (e) {
    console.warn('Could not load state:', e);
  }
  return false;
}

/* ---------- deck loading from JSON file ---------- */
async function loadDefaultDeck(){
  try {
    const res = await fetch('data/default-deck.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const cards = Array.isArray(data) ? data : data.cards;
    if (!Array.isArray(cards)) throw new Error('bad format');

    state.cards = cards.map(c => ({
      id: uid(),
      theme: c.theme || '',
      qs: [0,1,2,3].map(i => ({
        q: (c.qs && c.qs[i] && c.qs[i].q) || '',
        a: (c.qs && c.qs[i] && c.qs[i].a) || ''
      })),
      link: c.link || ''
    }));
    saveState();
    return true;
  } catch (e) {
    console.warn('Could not load default deck:', e);
    return false;
  }
}

/* ---------- toast ---------- */
function toast(msg){
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 1800);
}