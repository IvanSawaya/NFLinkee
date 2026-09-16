/* =========================================================
   Play view
   ========================================================= */

let play = {
  order: [],
  idx: 0,
  revealed: [false, false, false, false],
  linkShown: false
};

function renderPlay(){
  const wrap = document.getElementById('view-play');
  if (!wrap) return;

  if (state.cards.length === 0){
    wrap.innerHTML = `
      <div class="panel empty-state">
        <h2>No cards yet 🏈</h2>
        <p class="muted">Head to the <b>Deck Editor</b> to build your first NFL Linkee card.</p>
        <button class="btn green" onclick="showView('editor')">Go to Deck Editor</button>
      </div>`;
    return;
  }

  /* keep play order in sync with the deck */
  const ids = state.cards.map(c => c.id);
  const inSync = play.order.length === ids.length && play.order.every(id => ids.includes(id));
  if (!inSync){
    play.order = ids.slice();
    play.idx = Math.min(play.idx, play.order.length - 1);
    play.revealed = [false, false, false, false];
    play.linkShown = false;
  }

  /* deck complete */
  if (play.idx >= play.order.length){
    wrap.innerHTML = `
      <div class="panel empty-state">
        <h2>🏁 Deck complete!</h2>
        <p class="muted">You played all ${play.order.length} cards.</p>
        <button class="btn green" id="playAgain">Shuffle &amp; Play Again</button>
      </div>` + scoreboardHTML();
    return;
  }

  const card = state.cards.find(c => c.id === play.order[play.idx]);
  if (!card){ play.idx = 0; renderPlay(); return; }

  const tiles = card.qs.map((qa, i) => `
    <button class="tile ${play.revealed[i] ? 'revealed' : ''}" data-i="${i}">
      <div class="tile-top">
        <span class="qnum">Q${i + 1}</span>
        <span class="peek">tap to reveal</span>
      </div>
      <div class="qtext">${qa.q ? esc(qa.q) : '<i style="color:#54688a">(empty question)</i>'}</div>
      <div class="atext">${esc(qa.a) || '—'}</div>
    </button>`).join('');

  wrap.innerHTML = `
    <div class="play-head">
      <div class="counter">
        Card ${play.idx + 1} of ${play.order.length}
        ${card.theme ? `<span class="chip">${esc(card.theme)}</span>` : ''}
      </div>
      <div class="timer-wrap">
        <div class="timer" id="timerDisplay">00:00</div>
        <button class="btn tiny" id="timerToggle">${timer.running ? 'Pause' : 'Start'}</button>
        <button class="btn tiny" id="timerReset">Reset</button>
      </div>
    </div>

    <div class="tiles">${tiles}</div>

    <div class="link-panel ${play.linkShown ? 'shown' : ''}" id="linkPanel">
      <button class="btn gold" id="btnLink">${play.linkShown ? 'Hide the Link' : '🔗 Reveal the Link'}</button>
      <div class="link-answer">${esc(card.link) || '—'}</div>
    </div>

    <div class="play-actions">
      <button class="btn green" id="nextCard">Next Card →</button>
      <button class="btn" id="shuffleBtn">🔀 Shuffle Deck</button>
    </div>

    ${scoreboardHTML()}
  `;

  updateTimerDisplay(timer.running ? timer.elapsed + (Date.now() - timer.start) : timer.elapsed);
}

function scoreboardHTML(){
  if (state.teams.length === 0){
    return `<div class="panel" style="text-align:center">
      <p class="muted" style="margin:0">No teams set up. <button class="btn tiny" onclick="showView('teams')">Add teams</button></p>
    </div>`;
  }
  return `<div class="scoreboard">
    ${state.teams.map(t => `
      <div class="team-card">
        <div class="team-name">${esc(t.name)}</div>
        <div class="team-score">${t.score}</div>
        <div class="team-btns">
          <button data-team="${t.id}" data-delta="-1">−</button>
          <button data-team="${t.id}" data-delta="1">+</button>
        </div>
      </div>`).join('')}
  </div>`;
}

function startPlay(shuffle){
  const ids = state.cards.map(c => c.id);
  if (shuffle) shuffleArr(ids);
  play.order = ids;
  play.idx = 0;
  play.revealed = [false, false, false, false];
  play.linkShown = false;
  resetTimer();
  renderPlay();
}

function toggleReveal(i){
  play.revealed[i] = !play.revealed[i];
  const tile = document.querySelector(`#view-play .tile[data-i="${i}"]`);
  if (tile) tile.classList.toggle('revealed', play.revealed[i]);
}

function toggleLink(){
  play.linkShown = !play.linkShown;
  const p = document.getElementById('linkPanel');
  const b = document.getElementById('btnLink');
  if (p) p.classList.toggle('shown', play.linkShown);
  if (b) b.textContent = play.linkShown ? 'Hide the Link' : '🔗 Reveal the Link';
}

function nextCard(){
  play.idx++;
  play.revealed = [false, false, false, false];
  play.linkShown = false;
  renderPlay();
}

/* delegated events — survives innerHTML swaps */
function initPlayEvents(){
  const wrap = document.getElementById('view-play');
  if (!wrap || wrap._bound) return;
  wrap._bound = true;

  wrap.addEventListener('click', e => {
    const tile = e.target.closest('.tile');
    if (tile){ toggleReveal(+tile.dataset.i); return; }

    if (e.target.closest('#btnLink'))     { toggleLink(); return; }
    if (e.target.closest('#nextCard'))    { nextCard(); return; }
    if (e.target.closest('#shuffleBtn'))  { startPlay(true); toast('Deck shuffled'); return; }
    if (e.target.closest('#playAgain'))   { startPlay(true); return; }
    if (e.target.closest('#timerToggle')) { toggleTimer(); return; }
    if (e.target.closest('#timerReset'))  { resetTimer(); return; }

    const sb = e.target.closest('[data-team]');
    if (sb){
      const team = state.teams.find(x => x.id === sb.dataset.team);
      if (team){
        team.score += (+sb.dataset.delta);
        saveState();
        const cardEl = sb.closest('.team-card');
        const scoreEl = cardEl && cardEl.querySelector('.team-score');
        if (scoreEl) scoreEl.textContent = team.score;
      }
    }
  });
}