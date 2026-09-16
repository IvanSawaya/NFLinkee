/* =========================================================
   App bootstrap, view switching, keyboard shortcuts
   ========================================================= */

let currentView = 'play';

function showView(v){
  currentView = v;

  ['play','editor','teams','help'].forEach(name => {
    const el = document.getElementById('view-' + name);
    if (el) el.classList.toggle('hidden', name !== v);
  });

  $$('nav button').forEach(b => b.classList.toggle('active', b.dataset.view === v));

  if (v === 'play')   renderPlay();
  if (v === 'editor') renderEditor();
  if (v === 'teams')  renderTeams();
}

function bindNav(){
  $$('nav button').forEach(b => {
    b.addEventListener('click', () => showView(b.dataset.view));
  });
}

function bindKeyboard(){
  document.addEventListener('keydown', e => {
    if (currentView !== 'play') return;
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;

    if (e.key >= '1' && e.key <= '4'){
      toggleReveal(+e.key - 1);
      return;
    }
    if (e.key === ' '){
      e.preventDefault();
      toggleLink();
      return;
    }
    if (e.key.toLowerCase() === 'n'){
      nextCard();
      return;
    }
  });
}

async function boot(){
  const hadState = loadState();

  /* First visit — pull the sample deck from data/default-deck.json */
  if (!hadState){
    await loadDefaultDeck();
  }

  bindNav();
  bindKeyboard();
  initPlayEvents();
  showView('play');
}

boot();