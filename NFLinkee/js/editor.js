/* =========================================================
   Deck editor
   ========================================================= */

function renderEditor(){
  const wrap = document.getElementById('view-editor');
  if (!wrap) return;

  wrap.innerHTML = `
    <div class="panel toolbar">
      <button class="btn green" id="addCard">+ Add Card</button>
      <button class="btn" id="exportBtn">⬇ Export JSON</button>
      <button class="btn" id="importBtn">⬆ Import JSON</button>
      <button class="btn danger" id="resetBtn">↺ Reset to Sample Deck</button>
      <input type="file" id="fileInput" accept=".json,application/json" class="hidden">
      <span class="count">${state.cards.length} card${state.cards.length === 1 ? '' : 's'}</span>
    </div>
    <div id="cardsList"></div>
    ${state.cards.length === 0 ? `
      <div class="panel empty-state">
        <h2>Your deck is empty</h2>
        <p class="muted">Add your first card, or reset to the sample deck to see the format.</p>
      </div>` : ''}
  `;

  const list = document.getElementById('cardsList');
  list.innerHTML = state.cards.map((c, i) => `
    <div class="card-editor" data-id="${c.id}">
      <div class="ce-head">
        <span class="ce-num">Card ${i + 1}</span>
        <input class="theme-input" placeholder="Theme / Category (optional)" value="${esc(c.theme)}" data-field="theme">
        <button class="btn tiny danger" data-del="${c.id}">Delete</button>
      </div>
      <div class="ce-grid">
        ${c.qs.map((qa, j) => `
          <div class="ce-row">
            <span class="ce-label">Q${j + 1}</span>
            <input class="ce-q" placeholder="Question ${j + 1}" value="${esc(qa.q)}" data-idx="${j}" data-field="q">
            <input class="ce-a" placeholder="Answer ${j + 1}" value="${esc(qa.a)}" data-idx="${j}" data-field="a">
          </div>`).join('')}
      </div>
      <div class="ce-row link-row">
        <span class="ce-label gold">LINK</span>
        <input class="ce-link" placeholder="The common link — the answer players must guess" value="${esc(c.link)}" data-field="link">
      </div>
    </div>
  `).join('');

  /* live edits — no re-render, keeps focus */
  list.addEventListener('input', e => {
    const cardEl = e.target.closest('.card-editor');
    if (!cardEl) return;
    const card = state.cards.find(c => c.id === cardEl.dataset.id);
    if (!card) return;

    const field = e.target.dataset.field;
    if (field === 'theme') card.theme = e.target.value;
    else if (field === 'link') card.link = e.target.value;
    else if (field === 'q' || field === 'a'){
      const idx = +e.target.dataset.idx;
      if (card.qs[idx]) card.qs[idx][field] = e.target.value;
    }
    saveState();
  });

  /* delete a card */
  list.addEventListener('click', e => {
    const del = e.target.closest('[data-del]');
    if (!del) return;
    if (!confirm('Delete this card?')) return;
    state.cards = state.cards.filter(c => c.id !== del.dataset.del);
    saveState();
    renderEditor();
  });

  /* toolbar: add */
  document.getElementById('addCard').addEventListener('click', () => {
    state.cards.push({
      id: uid(),
      theme: '',
      qs: [0,1,2,3].map(() => ({ q: '', a: '' })),
      link: ''
    });
    saveState();
    renderEditor();
    const cards = $$('.card-editor');
    const last = cards[cards.length - 1];
    if (last){
      last.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const inp = last.querySelector('.theme-input');
      if (inp) inp.focus();
    }
  });

  /* toolbar: export */
  document.getElementById('exportBtn').addEventListener('click', () => {
    const payload = { game: 'NFL Linkee', version: 1, cards: state.cards };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'nfl-linkee-deck.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    toast('Deck exported');
  });

  /* toolbar: import */
  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('fileInput').click();
  });

  document.getElementById('fileInput').addEventListener('change', e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const rawCards = Array.isArray(data) ? data : data.cards;
        if (!Array.isArray(rawCards)) throw new Error('bad format');

        const clean = rawCards.map(c => ({
          id: uid(),
          theme: c.theme || '',
          qs: [0,1,2,3].map(i => ({
            q: (c.qs && c.qs[i] && c.qs[i].q) || '',
            a: (c.qs && c.qs[i] && c.qs[i].a) || ''
          })),
          link: c.link || ''
        }));

        if (confirm(`Import ${clean.length} card(s)? This replaces your current deck.`)){
          state.cards = clean;
          saveState();
          renderEditor();
          toast('Deck imported');
        }
      } catch (err){
        alert('Could not read that file. Use a deck JSON exported from this page.');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  });

  /* toolbar: reset to sample deck */
  document.getElementById('resetBtn').addEventListener('click', async () => {
    if (!confirm('Replace your current deck with the sample NFL deck? This cannot be undone.')) return;
    const ok = await loadDefaultDeck();
    if (ok){
      renderEditor();
      toast('Sample deck restored');
    } else {
      alert('Could not load the sample deck. Are you running from a local server or GitHub Pages?');
    }
  });
}