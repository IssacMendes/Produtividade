


/* =====================================================================
   🌸 MeuDia — Produtividade com Estilo
   Arquivo: js/app.js
   ===================================================================== */

// ===================== STATE =====================
let state = {
  tasks:        [],
  schedule:     [],
  habits:       [],
  habitDone:    {},   // { habitId: [weekday, ...] }
  xp:           0,
  streak:       0,
  pomSessions:  0,
  pomHistory:   [],
  water:        0,
  mood:         '',
  settings:     { goal: 5, name: 'Usuário' },
  currentFilter:'todas'
};

// ===================== CONSTANTES =====================
const DAYS_PT   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const MONTHS_PT = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
];

const FOCUS_WORDS = [
  { word: 'Determinação', quote: '"Pequenos passos constantes chegam a grandes destinos."' },
  { word: 'Coragem',      quote: '"Dê o primeiro passo, mesmo sem ver a escada toda."' },
  { word: 'Foco',         quote: '"Uma coisa de cada vez, feita com atenção, vale mais do que dez feitas de qualquer jeito."' },
  { word: 'Gratidão',     quote: '"Quem é grato pelo pouco, recebe muito mais."' },
  { word: 'Persistência', quote: '"Caia sete vezes, levante-se oito."' },
  { word: 'Energia',      quote: '"Seu corpo consegue. É sua mente que precisa ser convencida."' },
  { word: 'Criatividade', quote: '"Toda grande aventura começa com uma ideia ousada."' },
];

const ACHIEVEMENTS = [
  { id: 'first_task', emoji: '🌱', name: 'Primeira Tarefa', desc: 'Conclua sua primeira tarefa' },
  { id: 'five_tasks', emoji: '⭐', name: 'Estrela',         desc: 'Conclua 5 tarefas' },
  { id: 'ten_tasks',  emoji: '🏅', name: 'Dedicação',       desc: 'Conclua 10 tarefas' },
  { id: 'streak3',    emoji: '🔥', name: 'Em Chamas',       desc: '3 dias seguidos' },
  { id: 'xp100',      emoji: '💎', name: '100 XP',          desc: 'Acumule 100 XP' },
  { id: 'water8',     emoji: '💧', name: 'Hidratado',       desc: 'Complete 8 copos' },
  { id: 'habit7',     emoji: '🏆', name: 'Hábito 7 dias',   desc: 'Faça um hábito por 7 dias' },
  { id: 'perfect',    emoji: '🌟', name: 'Dia Perfeito',    desc: 'Complete 100% das tarefas' },
];

const CATEGORY_LABELS = {
  trabalho: '💼 Trabalho',
  pessoal:  '💖 Pessoal',
  saude:    '💪 Saúde',
  estudo:   '📚 Estudo',
  outro:    '🎨 Outro'
};

let unlockedAchievements = [];

// ===================== INICIALIZAÇÃO =====================
function init() {
  loadTheme(); //
  loadData();
  updateDateTime();
  setInterval(updateDateTime, 60000);

  // Horários padrão
  if (state.schedule.length === 0) {
    state.schedule = [
      { id: 1, name: 'Café da Manhã',      start: '07:30', end: '08:00', type: 'refeicao',  emoji: '☕' },
      { id: 2, name: 'Início do Trabalho', start: '08:00', end: '12:00', type: 'work',       emoji: '💼' },
      { id: 3, name: 'Intervalo',          start: '10:30', end: '10:45', type: 'intervalo',  emoji: '☕' },
      { id: 4, name: 'Almoço',             start: '12:00', end: '13:00', type: 'refeicao',   emoji: '🥗' },
      { id: 5, name: 'Academia',           start: '17:30', end: '18:30', type: 'treino',     emoji: '🏋️' },
      { id: 6, name: 'Jantar',             start: '19:30', end: '20:00', type: 'refeicao',   emoji: '🍽️' },
    ];
  }

  // Hábitos padrão
  if (state.habits.length === 0) {
    state.habits = [
      { id: 1, name: "Beber 8 copos d'água", emoji: '💧' },
      { id: 2, name: 'Meditar 10 minutos',   emoji: '🧘' },
      { id: 3, name: 'Ler 30 minutos',       emoji: '📖' },
    ];
  }

  renderAll();
}

// ===================== DATA/HORA =====================
function updateDateTime() {
  const now = new Date();
  const wd  = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira',
                'Quinta-feira','Sexta-feira','Sábado'][now.getDay()];

  document.getElementById('sidebarDay').textContent     = now.getDate();
  document.getElementById('sidebarWeekday').textContent = wd;
  document.getElementById('sidebarMonth').textContent   = MONTHS_PT[now.getMonth()] + ' ' + now.getFullYear();
  document.getElementById('greetingDate').textContent   =
    `Hoje é ${wd}, ${now.getDate()} de ${MONTHS_PT[now.getMonth()]} de ${now.getFullYear()}`;

  const hour = now.getHours();
  let greet, gEmoji;
  if      (hour < 12) { greet = `Bom dia, ${state.settings.name}!`;   gEmoji = '☀️'; }
  else if (hour < 18) { greet = `Boa tarde, ${state.settings.name}!`; gEmoji = '🌤️'; }
  else                { greet = `Boa noite, ${state.settings.name}!`; gEmoji = '🌙'; }

  document.getElementById('greetingText').textContent  = greet;
  document.getElementById('greetingEmoji').textContent = gEmoji;
}

// ===================== RENDER ALL =====================
function renderAll() {
  renderTaskList();
  renderProgress();
  renderSchedule();
  renderHabits();
  renderWater();
  renderAchievements();
  renderXP();
  renderFocusWord();
  saveData();
}

// ===================== TAREFAS =====================
function addTask() {
  const name = document.getElementById('taskNameInput').value.trim();
  if (!name) { showNotif('⚠️', 'Digite um nome para a tarefa!'); return; }

  const task = {
    id:        Date.now(),
    name,
    category:  document.getElementById('taskCategoryInput').value,
    priority:  document.getElementById('taskPriorityInput').value,
    time:      document.getElementById('taskTimeInput').value,
    note:      document.getElementById('taskNoteInput').value,
    xp:        parseInt(document.getElementById('taskXpInput').value),
    done:      false,
    createdAt: new Date().toISOString()
  };

  state.tasks.unshift(task);
  closeModal();
  renderAll();
  showNotif('✨', 'Tarefa adicionada com sucesso!');
  spawnConfetti();
}

function toggleTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  if (task.done) {
    state.xp += task.xp;
    showNotif('🎉', `+${task.xp} XP! "${task.name}" concluída!`);
    spawnConfetti();
    checkAchievements();
  } else {
    state.xp = Math.max(0, state.xp - task.xp);
    showNotif('↩️', 'Tarefa desmarcada.');
  }
  renderAll();
}

function deleteTask(id, e) {
  e.stopPropagation();
  state.tasks = state.tasks.filter(t => t.id !== id);
  renderAll();
  showNotif('🗑️', 'Tarefa removida.');
}

function filterTasks(filter, btn) {
  state.currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.remove('active');
    if (b.getAttribute('onclick')?.includes(`'${filter}'`)) b.classList.add('active');
  });
  renderTaskList();
}

function getFilteredTasks() {
  const f = state.currentFilter;
  if (f === 'todas')    return state.tasks;
  if (f === 'pendente') return state.tasks.filter(t => !t.done);
  if (f === 'concluida')return state.tasks.filter(t => t.done);
  if (['alta','media','baixa'].includes(f)) return state.tasks.filter(t => t.priority === f);
  return state.tasks;
}

function renderTaskList() {
  const filtered = getFilteredTasks();
  ['taskList', 'taskListFull'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (filtered.length === 0) {
      el.innerHTML = `<div class="empty-tasks">
        <span class="big-emoji">🎉</span>
        Nenhuma tarefa aqui!<br>Adicione algo para fazer.
      </div>`;
      return;
    }
    el.innerHTML = filtered.map(t => taskHTML(t)).join('');
  });
}

function taskHTML(t) {
  return `<div class="task-item ${t.done ? 'done' : ''}" onclick="toggleTask(${t.id})">
    <div class="task-check">${t.done ? '✓' : ''}</div>
    <div class="task-info">
      <div class="task-name">${t.name}</div>
      <div class="task-meta">
        <span class="tag tag-${t.category}">${CATEGORY_LABELS[t.category] || t.category}</span>
        ${t.time ? `<span class="task-time">🕐 ${t.time}</span>` : ''}
        <span class="task-time">⭐ ${t.xp} XP</span>
      </div>
    </div>
    <div class="task-priority priority-${t.priority}"></div>
    <button class="task-del" onclick="deleteTask(${t.id}, event)" title="Remover">🗑️</button>
  </div>`;
}

// ===================== PROGRESSO =====================
function renderProgress() {
  const total  = state.tasks.length;
  const done   = state.tasks.filter(t => t.done).length;
  const goal   = state.settings.goal || 5;
  const goalPct = Math.min(100, Math.round((done / goal) * 100));

  document.getElementById('doneCount').textContent  = done;
  document.getElementById('totalCount').textContent  = total;
  document.getElementById('bigBarFill').style.width  = goalPct + '%';
  document.getElementById('bigBarPct').textContent   = goalPct + '%';
  document.getElementById('stat-done').textContent   = done;
  document.getElementById('stat-pending').textContent= total - done;
  document.getElementById('stat-streak').textContent = state.streak;
  document.getElementById('stat-xp').textContent     = state.xp;

  // Troféu dinâmico
  const trophies = [
    [0,  '🌱', 'Iniciante'],
    [20, '🌿', 'Aprendiz'],
    [40, '⭐', 'Promissor'],
    [60, '🌟', 'Dedicado'],
    [80, '🏅', 'Comprometido'],
    [100,'🏆', 'Campeão'],
  ];
  let td = trophies[0];
  for (const t of trophies) { if (goalPct >= t[0]) td = t; }
  document.getElementById('trophyIcon').textContent  = td[1];
  document.getElementById('trophyLabel').textContent = td[2];

  if (goalPct === 100) checkAchievement('perfect');
}

// ===================== AGENDA =====================
function renderSchedule() {
  const now = new Date();
  const cur = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const sorted = [...state.schedule].sort((a, b) => a.start.localeCompare(b.start));

  ['miniSchedule', 'fullSchedule'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (sorted.length === 0) {
      el.innerHTML = '<div style="color:var(--text-muted);font-size:.82rem;padding:10px 0;">Nenhum horário. Clique em Adicionar!</div>';
      return;
    }
    const list = id === 'miniSchedule' ? sorted.slice(0, 5) : sorted;
    el.innerHTML = list.map(s => {
      const isNow     = cur >= s.start && cur <= (s.end || s.start);
      const typeClass = { refeicao:'type-refeicao', treino:'type-treino', intervalo:'type-intervalo', work:'type-work' }[s.type] || 'type-work';
      const typeText  = { refeicao:'Refeição',      treino:'Treino',      intervalo:'Intervalo',      work:'Trabalho' }[s.type]  || 'Outro';
      return `<div class="schedule-item ${isNow ? 'now' : ''}">
        <div class="schedule-time">${s.start}${s.end ? '<br>' + s.end : ''}</div>
        <div><div class="schedule-name">${s.name}</div></div>
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="schedule-emoji">${s.emoji || '📌'}</span>
          <span class="schedule-type ${typeClass}">${typeText}</span>
          ${id === 'fullSchedule' ? `<button class="task-del" style="opacity:1;" onclick="deleteSchedule(${s.id})">🗑️</button>` : ''}
        </div>
      </div>`;
    }).join('');
  });
}

function addScheduleItem() {
  const name = document.getElementById('schedNameInput').value.trim();
  if (!name) { showNotif('⚠️', 'Digite o nome do evento!'); return; }
  state.schedule.push({
    id:    Date.now(),
    name,
    start: document.getElementById('schedStartInput').value,
    end:   document.getElementById('schedEndInput').value,
    type:  document.getElementById('schedTypeInput').value,
    emoji: document.getElementById('schedEmojiInput').value || '📌',
  });
  closeScheduleModal();
  renderAll();
  showNotif('📅', 'Horário adicionado!');
}

function deleteSchedule(id) {
  state.schedule = state.schedule.filter(s => s.id !== id);
  renderAll();
}

// ===================== HÁBITOS =====================
function renderHabits() {
  renderMiniHabits();
  renderFullHabits();
}

function renderMiniHabits() {
  const el    = document.getElementById('miniHabits');
  if (!el) return;
  if (state.habits.length === 0) {
    el.innerHTML = '<div style="color:var(--text-muted);font-size:.82rem;">Nenhum hábito ainda.</div>';
    return;
  }
  const today = new Date().getDay();
  el.innerHTML = state.habits.slice(0, 4).map(h => {
    const done = (state.habitDone[h.id] || []).includes(today);
    return `<div class="habit-row">
      <span style="font-size:1.1rem;">${h.emoji || '🔥'}</span>
      <span class="habit-name">${h.name}</span>
      <div class="habit-dot ${done ? 'done' : ''}" onclick="toggleHabit(${h.id})"></div>
      <span class="habit-streak">🔥 ${(state.habitDone[h.id] || []).length}d</span>
    </div>`;
  }).join('');
}

function renderFullHabits() {
  const el        = document.getElementById('fullHabits');
  const streakEl  = document.getElementById('streaksArea');
  if (!el) return;

  if (state.habits.length === 0) {
    el.innerHTML = '<div style="color:var(--text-muted);font-size:.82rem;padding:10px 0;">Nenhum hábito. Clique em Adicionar!</div>';
    if (streakEl) streakEl.innerHTML = '';
    return;
  }

  el.innerHTML = state.habits.map(h => {
    const daysArr = state.habitDone[h.id] || [];
    return `<div class="habit-row" style="margin-bottom:10px;background:var(--bg);padding:10px;border-radius:var(--radius-sm);border:1.5px solid var(--border);">
      <span style="font-size:1.2rem;">${h.emoji || '🔥'}</span>
      <span class="habit-name">${h.name}</span>
      <div class="habit-dots">
        ${DAYS_PT.map((_, i) =>
          `<div class="habit-dot ${daysArr.includes(i) ? 'done' : ''}"
            onclick="toggleHabitDay(${h.id},${i})"
            title="${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][i]}">
            ${DAYS_PT[i].charAt(0)}
          </div>`
        ).join('')}
      </div>
      <span class="habit-streak">🔥 ${daysArr.length}d</span>
      <button class="task-del" style="opacity:1;margin-left:6px;" onclick="deleteHabit(${h.id})">🗑️</button>
    </div>`;
  }).join('');

  if (streakEl) {
    streakEl.innerHTML = state.habits.map(h => {
      const streak = (state.habitDone[h.id] || []).length;
      const barW   = Math.min(100, (streak / 7) * 100);
      return `<div style="margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;font-size:.8rem;font-weight:700;margin-bottom:4px;">
          <span>${h.emoji || '🔥'} ${h.name}</span>
          <span style="color:var(--peach-d);">🔥 ${streak} dias</span>
        </div>
        <div class="big-bar-wrap" style="height:10px;">
          <div class="big-bar-fill" style="width:${barW}%;background:linear-gradient(90deg,var(--peach),var(--coral-d));"></div>
        </div>
      </div>`;
    }).join('');
  }
}

function toggleHabit(id) {
  const today = new Date().getDay();
  if (!state.habitDone[id]) state.habitDone[id] = [];
  if (state.habitDone[id].includes(today)) {
    state.habitDone[id] = state.habitDone[id].filter(d => d !== today);
  } else {
    state.habitDone[id].push(today);
    showNotif('🔥', 'Hábito marcado! +5 XP');
    state.xp += 5;
  }
  renderAll();
}

function toggleHabitDay(id, day) {
  if (!state.habitDone[id]) state.habitDone[id] = [];
  if (state.habitDone[id].includes(day)) {
    state.habitDone[id] = state.habitDone[id].filter(d => d !== day);
  } else {
    state.habitDone[id].push(day);
  }
  renderAll();
}

function addHabit() {
  const name = document.getElementById('habitNameInput').value.trim();
  if (!name) { showNotif('⚠️', 'Digite o nome do hábito!'); return; }
  state.habits.push({
    id:    Date.now(),
    name,
    emoji: document.getElementById('habitEmojiInput').value || '🔥',
  });
  closeHabitModal();
  renderAll();
  showNotif('🔥', 'Hábito criado!');
}

function deleteHabit(id) {
  state.habits = state.habits.filter(h => h.id !== id);
  delete state.habitDone[id];
  renderAll();
}

// ===================== HIDRATAÇÃO =====================
function renderWater() {
  const el = document.getElementById('waterCups');
  if (!el) return;
  el.innerHTML = Array.from({ length: 8 }, (_, i) =>
    `<span class="water-cup ${i < state.water ? 'done' : ''}" onclick="toggleWater(${i})">💧</span>`
  ).join('');
  const wc = document.getElementById('waterCount');
  if (wc) wc.textContent = state.water;
  if (state.water >= 8) checkAchievement('water8');
}

function toggleWater(i) {
  state.water = (i + 1 === state.water) ? i : i + 1;
  renderWater();
  saveData();
}

// ===================== HUMOR =====================
function setMood(btn, mood) {
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  state.mood = mood;
  saveData();
  showNotif(mood, 'Humor registrado!');
}

// ===================== XP / NÍVEL =====================
function renderXP() {
  const xpLabel   = document.getElementById('xpLabel');
  const xpBar     = document.getElementById('xpBar');
  const levelLabel= document.getElementById('levelLabel');
  const totalXP   = state.xp;
  const level     = Math.floor(totalXP / 100) + 1;
  const xpInLevel = totalXP % 100;
  const levels    = ['Iniciante 🌱','Aprendiz 🌿','Explorador ⭐','Campeão 🏅','Mestre 🏆','Lendário 💎'];
  const levelName = levels[Math.min(level - 1, levels.length - 1)];

  if (xpLabel)    xpLabel.textContent    = `${xpInLevel} / 100`;
  if (xpBar)      xpBar.style.width      = xpInLevel + '%';
  if (levelLabel) levelLabel.textContent = `Nível ${level} — ${levelName}`;
  if (totalXP >= 100) checkAchievement('xp100');
}

// ===================== CONQUISTAS =====================
function checkAchievements() {
  const done = state.tasks.filter(t => t.done).length;
  if (done >= 1)  checkAchievement('first_task');
  if (done >= 5)  checkAchievement('five_tasks');
  if (done >= 10) checkAchievement('ten_tasks');
}

function checkAchievement(id) {
  if (!unlockedAchievements.includes(id)) {
    unlockedAchievements.push(id);
    const a = ACHIEVEMENTS.find(a => a.id === id);
    if (a) showNotif(a.emoji, `Conquista desbloqueada: ${a.name}!`);
    renderAchievements();
    saveData();
  }
}

function renderAchievements() {
  const el = document.getElementById('achievementsGrid');
  if (!el) return;
  el.innerHTML = ACHIEVEMENTS.map(a => {
    const locked = !unlockedAchievements.includes(a.id);
    return `<div class="achievement ${locked ? 'locked' : ''}" title="${a.desc}">
      <span class="medal">${a.emoji}</span>
      <span class="medal-name">${a.name}</span>
    </div>`;
  }).join('');
}

// ===================== FOCO DO DIA =====================
function renderFocusWord() {
  const fw  = FOCUS_WORDS[new Date().getDay() % FOCUS_WORDS.length];
  const fwEl= document.getElementById('focusWord');
  const fqEl= document.getElementById('focusQuote');
  if (fwEl) fwEl.textContent = fw.word;
  if (fqEl) fqEl.textContent = fw.quote;
}

// ===================== POMODORO =====================
let pomTimer   = null;
let pomSeconds = 25 * 60;
let pomTotal   = 25 * 60;
let pomRunning = false;
const CIRC     = 2 * Math.PI * 52;

function setMode(mode, btn) {
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (pomRunning) {
    clearInterval(pomTimer);
    pomRunning = false;
    document.getElementById('timerStartBtn').textContent = '▶ Iniciar';
  }
  const times = { pomodoro: 25 * 60, short: 5 * 60, long: 15 * 60 };
  pomSeconds = pomTotal = times[mode] || 25 * 60;
  updateTimerDisplay();
}

function toggleTimer() {
  if (pomRunning) {
    clearInterval(pomTimer);
    pomRunning = false;
    document.getElementById('timerStartBtn').textContent = '▶ Retomar';
  } else {
    pomRunning = true;
    document.getElementById('timerStartBtn').textContent = '⏸ Pausar';
    pomTimer = setInterval(() => {
      pomSeconds--;
      updateTimerDisplay();
      if (pomSeconds <= 0) {
        clearInterval(pomTimer);
        pomRunning = false;
        document.getElementById('timerStartBtn').textContent = '▶ Iniciar';
        state.pomSessions++;
        state.pomHistory.push({
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          mode: pomTotal
        });
        document.getElementById('pomSessions').textContent = state.pomSessions;
        renderPomHistory();
        showNotif('🍅', 'Pomodoro concluído! +15 XP');
        state.xp += 15;
        renderXP();
        saveData();
        spawnConfetti();
        pomSeconds = pomTotal;
        updateTimerDisplay();
      }
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(pomTimer);
  pomRunning = false;
  pomSeconds = pomTotal;
  document.getElementById('timerStartBtn').textContent = '▶ Iniciar';
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const m    = String(Math.floor(pomSeconds / 60)).padStart(2, '0');
  const s    = String(pomSeconds % 60).padStart(2, '0');
  document.getElementById('timerDisplay').textContent = `${m}:${s}`;
  const progress = pomSeconds / pomTotal;
  const offset   = CIRC * progress;
  const ring     = document.getElementById('timerRingFill');
  if (ring) ring.style.strokeDashoffset = CIRC - offset;
}

function renderPomHistory() {
  const el = document.getElementById('pomHistory');
  if (!el) return;
  if (state.pomHistory.length === 0) return;
  el.innerHTML = [...state.pomHistory].reverse().slice(0, 8).map((p, i) =>
    `<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--bg);border-radius:var(--radius-sm);margin-bottom:6px;">
      <span>🍅</span>
      <span style="font-size:.82rem;font-weight:700;">Sessão ${state.pomHistory.length - i}</span>
      <span style="font-size:.75rem;color:var(--text-muted);margin-left:auto;">${p.time}</span>
    </div>`
  ).join('');
}

// ===================== MODAIS =====================
function openModal() {
  document.getElementById('taskNameInput').value = '';
  document.getElementById('taskTimeInput').value = '';
  document.getElementById('taskNoteInput').value = '';
  document.getElementById('modalOverlay').classList.add('open');
  setTimeout(() => document.getElementById('taskNameInput').focus(), 100);
}
function closeModal()    { document.getElementById('modalOverlay').classList.remove('open'); }
function closeModalOut(e){ if (e.target.id === 'modalOverlay') closeModal(); }

function openScheduleModal() {
  document.getElementById('schedNameInput').value  = '';
  document.getElementById('schedStartInput').value = '';
  document.getElementById('schedEndInput').value   = '';
  document.getElementById('schedEmojiInput').value = '';
  document.getElementById('scheduleModalOverlay').classList.add('open');
  setTimeout(() => document.getElementById('schedNameInput').focus(), 100);
}
function closeScheduleModal()    { document.getElementById('scheduleModalOverlay').classList.remove('open'); }
function closeScheduleModalOut(e){ if (e.target.id === 'scheduleModalOverlay') closeScheduleModal(); }

function openHabitModal() {
  document.getElementById('habitNameInput').value  = '';
  document.getElementById('habitEmojiInput').value = '';
  document.getElementById('habitModalOverlay').classList.add('open');
  setTimeout(() => document.getElementById('habitNameInput').focus(), 100);
}
function closeHabitModal()    { document.getElementById('habitModalOverlay').classList.remove('open'); }
function closeHabitModalOut(e){ if (e.target.id === 'habitModalOverlay') closeHabitModal(); }

// Atalhos de teclado
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeScheduleModal(); closeHabitModal(); }
  if (e.key === 'Enter' && document.getElementById('modalOverlay').classList.contains('open'))         addTask();
  if (e.key === 'Enter' && document.getElementById('scheduleModalOverlay').classList.contains('open')) addScheduleItem();
  if (e.key === 'Enter' && document.getElementById('habitModalOverlay').classList.contains('open'))    addHabit();
});

// ===================== NOTIFICAÇÃO =====================
let notifTimeout;
function showNotif(icon, text) {
  const n = document.getElementById('notification');
  document.getElementById('notifIcon').textContent = icon;
  document.getElementById('notifText').textContent  = text;
  n.classList.add('show');
  clearTimeout(notifTimeout);
  notifTimeout = setTimeout(() => n.classList.remove('show'), 3000);
}

// ===================== CONFETE =====================
function spawnConfetti() {
  const colors = ['#f4a7b9','#f9c784','#a8d8b9','#c5b8e8','#a8d4f5','#f5b8a8'];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className    = 'confetti-particle';
    p.style.cssText = `
      left: ${Math.random() * 100}vw;
      top: ${Math.random() * 30}vh;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-delay: ${Math.random() * .5}s;
      animation-duration: ${.8 + Math.random() * .6}s;
    `;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1500);
  }
}

// ===================== NAVEGAÇÃO =====================
function showPage(page, btn) {
  document.querySelectorAll('.section-page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

// ===================== CONFIGURAÇÕES =====================
function saveSettings() {
  state.settings.goal = parseInt(document.getElementById('settingGoal')?.value) || 5;
  state.settings.name = document.getElementById('settingName')?.value || 'Usuário';
  updateDateTime();
  renderAll();
}

// ===================== PERSISTÊNCIA DE DADOS =====================
function saveData() {
  try {
    localStorage.setItem('meudia_state',        JSON.stringify(state));
    localStorage.setItem('meudia_achievements', JSON.stringify(unlockedAchievements));
  } catch (e) {}
}

function loadData() {
  try {
    const s = localStorage.getItem('meudia_state');
    if (s) Object.assign(state, JSON.parse(s));
    const a = localStorage.getItem('meudia_achievements');
    if (a) unlockedAchievements = JSON.parse(a);

    // Restaura inputs de configuração
    const goalEl = document.getElementById('settingGoal');
    const nameEl = document.getElementById('settingName');
    if (goalEl) goalEl.value = state.settings.goal || 5;
    if (nameEl) nameEl.value = state.settings.name  || 'Usuário';
  } catch (e) {}
}

function exportData() {
  const blob = new Blob([JSON.stringify({ state, unlockedAchievements }, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'meudia_backup.json';
  a.click();
  URL.revokeObjectURL(url);
  showNotif('📤', 'Dados exportados!');
}

function clearData() {
  if (confirm('Tem certeza? Isso vai apagar todos os seus dados!')) {
    localStorage.clear();
    state = {
      tasks: [], schedule: [], habits: [], habitDone: {},
      xp: 0, streak: 0, pomSessions: 0, pomHistory: [],
      water: 0, mood: '',
      settings: { goal: 5, name: 'Usuário' },
      currentFilter: 'todas'
    };
    unlockedAchievements = [];
    renderAll();
    showNotif('🗑️', 'Dados apagados.');
  }
}

// ===================== DARK MODE =====================
function toggleTheme() {
  document.body.classList.toggle('dark');

  if (document.body.classList.contains('dark')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'dark') {
    document.body.classList.add('dark');

    const toggle = document.getElementById('themeToggle');
    if (toggle) toggle.checked = true;
  }
}

// ===================== START =====================
init();

// ===================== START =====================
init();
