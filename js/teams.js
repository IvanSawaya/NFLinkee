/* =========================================================
   Teams & scores
   ========================================================= */

function renderTeams(){
  const wrap = document.getElementById('view-teams');
  if (!wrap) return;

  wrap.innerHTML = `
    <div class="panel">
      <h2>Teams &amp; Scores</h2>
      <p class="muted" style="margin-top:4px">Set up to 6 teams. Names and scores carry over into Play mode.</p>
      <div id="teamList" style="margin-top:18px"></div>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:16px">
        <button class="btn green" id="addTeam">+ Add Team</button>
        <button class="btn" id="resetScores">Reset All Scores</button>
      </div>
    </div>
  `;

  const list = document.getElementById('teamList');

  const paint = () => {
    list.innerHTML = state.teams.map(t => `
      <div class="team-row" data-id="${t.id}">
        <input value="${esc(t.name)}" data-name="${t.id}" placeholder="Team name">
        <span class="score-pill">${t.score}</span>
        <button class="btn tiny danger" data-remove="${t.id}">✕</button>
      </div>
    `).join('') || '<p class="muted">No teams yet.</p>';
  };
  paint();

  list.addEventListener('input', e => {
    const id = e.target.dataset.name;
    if (!id) return;
    const team = state.teams.find(t => t.id === id);
    if (team){
      team.name = e.target.value;
      saveState();
    }
  });

  list.addEventListener('click', e => {
    const id = e.target.dataset.remove;
    if (!id) return;
    state.teams = state.teams.filter(t => t.id !== id);
    saveState();
    paint();
  });

  document.getElementById('addTeam').addEventListener('click', () => {
    if (state.teams.length >= 6){
      toast('Max 6 teams');
      return;
    }
    state.teams.push({ id: uid(), name: 'Team ' + (state.teams.length + 1), score: 0 });
    saveState();
    paint();
  });

  document.getElementById('resetScores').addEventListener('click', () => {
    state.teams.forEach(t => t.score = 0);
    saveState();
    paint();
    toast('Scores reset');
  });
}