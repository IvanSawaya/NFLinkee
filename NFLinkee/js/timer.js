/* =========================================================
   Round timer
   ========================================================= */

const timer = { running: false, start: 0, elapsed: 0 };

function fmt(ms){
  const total = Math.floor(ms / 1000);
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return m + ':' + s;
}

function updateTimerDisplay(ms){
  const el = document.getElementById('timerDisplay');
  if (el) el.textContent = fmt(ms || 0);
}

function toggleTimer(){
  if (timer.running){
    timer.elapsed += Date.now() - timer.start;
    timer.running = false;
  } else {
    timer.start = Date.now();
    timer.running = true;
  }
  const b = document.getElementById('timerToggle');
  if (b) b.textContent = timer.running ? 'Pause' : 'Start';
  updateTimerDisplay(timer.running ? timer.elapsed + (Date.now() - timer.start) : timer.elapsed);
}

function resetTimer(){
  timer.running = false;
  timer.elapsed = 0;
  timer.start = 0;
  const b = document.getElementById('timerToggle');
  if (b) b.textContent = 'Start';
  updateTimerDisplay(0);
}

/* tick every 250ms while running */
setInterval(() => {
  if (timer.running && typeof currentView !== 'undefined' && currentView === 'play'){
    updateTimerDisplay(timer.elapsed + (Date.now() - timer.start));
  }
}, 250);