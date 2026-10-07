/**
 * Workout Component - Gautham's Workout & Exercise Command Center
 * Clean, customizable 7-day split, Exercise Library, Exercise History, and Muscle History.
 */

import { appState } from '../state.js';

export function renderWorkout(container) {
  const plan = appState.workoutPlan;
  const library = appState.exerciseLibrary;

  container.innerHTML = `
    <div class="workout-page animate-fade-in">
      <header class="page-header">
        <div>
          <h1 class="page-title">Workouts & Library</h1>
          <p class="page-subtitle">Manage your weekly plan, exercise history, and muscle volume.</p>
        </div>
      </header>

      <!-- SUBTAB NAVIGATION -->
      <div class="tab-subnav">
        <button class="tab-btn active" data-wo-tab="weekly-plan">Weekly Plan (${plan.length} Days)</button>
        <button class="tab-btn" data-wo-tab="exercise-library">Exercise Library (${library.length})</button>
        <button class="tab-btn" data-wo-tab="exercise-history">Exercise History</button>
        <button class="tab-btn" data-wo-tab="muscle-history">Muscle History</button>
      </div>

      <!-- TAB 1: WEEKLY WORKOUT PLAN -->
      <div class="wo-tab-pane active" id="pane-weekly-plan">
        <div class="pane-header-actions">
          <p class="pane-desc">Customize your training split. Add, edit, reorder, or duplicate workout days.</p>
          <button class="btn-primary-sm" id="btn-add-workout-day">+ Add Workout Day</button>
        </div>

        <div class="workout-days-list">
          ${plan.map((day, dIdx) => `
            <div class="dash-card workout-day-card" data-day-index="${dIdx}">
              <div class="day-card-header">
                <div>
                  <h3 class="day-title">${escapeHtml(day.name)}</h3>
                  <span class="day-tag">${escapeHtml(day.tag || 'Workout')}</span>
                </div>
                <div class="day-card-actions">
                  <button class="btn-micro btn-edit-day" data-day-index="${dIdx}">Edit Day</button>
                  <button class="btn-micro btn-duplicate-day" data-day-index="${dIdx}">Duplicate</button>
                  <button class="btn-micro btn-delete-day" data-day-index="${dIdx}">Delete</button>
                </div>
              </div>

              ${day.isRest ? `
                <div class="rest-day-notice">
                  <span>🧘 Rest & Active Recovery Day</span>
                </div>
              ` : `
                <div class="day-exercise-table">
                  ${day.exercises.map((ex, eIdx) => `
                    <div class="day-ex-row">
                      <span class="ex-idx">${eIdx + 1}</span>
                      <div class="ex-main-meta">
                        <strong class="ex-name">${escapeHtml(ex.name)}</strong>
                        <span class="ex-sub">${escapeHtml(ex.category || 'General')} ${ex.note ? '• ' + escapeHtml(ex.note) : ''}</span>
                      </div>
                      <span class="ex-sets-reps">${ex.sets} × ${ex.reps}</span>
                      <button class="btn-icon btn-remove-ex" data-day="${dIdx}" data-ex="${eIdx}" title="Remove Exercise">&times;</button>
                    </div>
                  `).join('')}
                </div>
                <div class="day-card-footer">
                  <button class="btn-secondary-sm btn-add-ex-to-day" data-day-index="${dIdx}">+ Add Exercise</button>
                </div>
              `}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- TAB 2: EXERCISE LIBRARY -->
      <div class="wo-tab-pane" id="pane-exercise-library">
        <div class="pane-header-actions">
          <p class="pane-desc">All exercises are preloaded with muscle metadata (primary muscle, target region, secondary muscles).</p>
          <button class="btn-primary-sm" id="btn-add-custom-exercise">+ New Exercise</button>
        </div>

        <div class="exercise-filter-bar">
          <input type="text" class="form-input search-input" id="ex-lib-search" placeholder="Search exercises...">
          <select class="form-select" id="ex-lib-cat-filter">
            <option value="ALL">All Categories</option>
            <option value="Chest">Chest</option>
            <option value="Back">Back</option>
            <option value="Shoulders">Shoulders</option>
            <option value="Arms">Arms</option>
            <option value="Legs">Legs</option>
            <option value="Core">Core</option>
          </select>
        </div>

        <div class="exercise-library-grid" id="ex-library-grid-container">
          ${renderLibraryGrid(library)}
        </div>
      </div>

      <!-- TAB 3: EXERCISE HISTORY -->
      <div class="wo-tab-pane" id="pane-exercise-history">
        <div class="pane-header-actions">
          <p class="pane-desc">Track completion history and past performance per exercise.</p>
        </div>

        <div class="history-filter-bar">
          <select class="form-select" id="ex-history-select">
            <option value="ALL">Select Exercise...</option>
            ${library.map(ex => `<option value="${escapeHtml(ex.name)}">${escapeHtml(ex.name)}</option>`).join('')}
          </select>
        </div>

        <div class="history-results-card dash-card mt-3" id="ex-history-results">
          ${renderExerciseHistory('ALL')}
        </div>
      </div>

      <!-- TAB 4: MUSCLE HISTORY -->
      <div class="wo-tab-pane" id="pane-muscle-history">
        <div class="pane-header-actions">
          <p class="pane-desc">Visual history of target muscle groups trained based on your completed logs.</p>
        </div>
        <div class="muscle-grid" id="muscle-grid-container">
          ${renderMuscleHistory()}
        </div>
      </div>

      <!-- WORKOUT MODAL OVERLAY -->
      <div class="modal-overlay" id="workout-modal-overlay" style="display: none;">
        <div class="modal-content dash-card">
          <div class="modal-header">
            <h3 class="modal-title" id="wo-modal-title">Workout Action</h3>
            <button class="modal-close-btn" id="wo-modal-close">&times;</button>
          </div>
          <div class="modal-body" id="wo-modal-body"></div>
        </div>
      </div>
    </div>
  `;

  attachWorkoutEvents(container);
}

function renderLibraryGrid(exercises) {
  if (exercises.length === 0) return '<div class="empty-state"><p>No exercises match your filter.</p></div>';
  return exercises.map(ex => `
    <div class="dash-card ex-lib-card">
      <span class="ex-cat-badge">${escapeHtml(ex.primaryCategory)}</span>
      <h4 class="ex-title">${escapeHtml(ex.name)}</h4>
      <p class="ex-target">Target: <strong>${escapeHtml(ex.targetRegion)}</strong></p>
      ${ex.secondaryMuscles && ex.secondaryMuscles.length > 0 ? `
        <p class="ex-secondary">Secondary: ${ex.secondaryMuscles.join(', ')}</p>
      ` : ''}
    </div>
  `).join('');
}

function renderExerciseHistory(selectedExName) {
  const logs = appState.dailyLogs;
  const historyEntries = [];

  Object.keys(logs).forEach(dateStr => {
    const log = logs[dateStr];
    if (log.workout && log.workout.completedExercises) {
      log.workout.completedExercises.forEach(exName => {
        if (selectedExName === 'ALL' || selectedExName === exName) {
          historyEntries.push({
            date: dateStr,
            exercise: exName,
            workoutName: log.workout.name
          });
        }
      });
    }
  });

  if (historyEntries.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <p>${selectedExName === 'ALL' ? 'No exercise completions recorded yet. Complete exercises from the dashboard!' : 'No recorded sessions for ' + escapeHtml(selectedExName) + '.'}</p>
      </div>
    `;
  }

  // Sort newest first
  historyEntries.sort((a, b) => b.date.localeCompare(a.date));

  return `
    <div class="history-summary-head">
      <span class="summary-count">Total Sessions: <strong>${historyEntries.length}</strong></span>
    </div>
    <div class="history-list mt-3">
      ${historyEntries.map(h => `
        <div class="history-row-item">
          <div class="history-date">📅 ${h.date}</div>
          <div class="history-ex-name"><strong>${escapeHtml(h.exercise)}</strong></div>
          <div class="history-workout-meta">${escapeHtml(h.workoutName)}</div>
          <span class="status-chip-done">Completed</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderMuscleHistory() {
  const muscleCounts = {
    'Chest': 0, 'Upper Chest': 0, 'Middle Chest': 0,
    'Lats': 0, 'Upper Back': 0, 'Mid Back': 0,
    'Front Delts': 0, 'Side Delts': 0, 'Rear Delts': 0,
    'Biceps': 0, 'Triceps': 0, 'Forearms': 0,
    'Quads': 0, 'Hamstrings': 0, 'Glutes': 0, 'Calves': 0,
    'Abs': 0, 'Obliques': 0
  };

  const logs = appState.dailyLogs;
  Object.keys(logs).forEach(dateStr => {
    const log = logs[dateStr];
    if (log.workout && log.workout.completedExercises) {
      log.workout.completedExercises.forEach(exName => {
        const exObj = appState.exerciseLibrary.find(e => e.name === exName);
        if (exObj) {
          const cat = exObj.primaryCategory;
          const reg = exObj.targetRegion;

          if (muscleCounts[cat] !== undefined) muscleCounts[cat]++;

          // Match sub-regions
          Object.keys(muscleCounts).forEach(m => {
            if (reg.toLowerCase().includes(m.toLowerCase())) {
              muscleCounts[m]++;
            }
          });
        }
      });
    }
  });

  return Object.keys(muscleCounts).map(muscle => {
    const count = muscleCounts[muscle];
    return `
      <div class="dash-card muscle-card">
        <span class="muscle-name">${muscle}</span>
        <span class="muscle-count">${count} <span class="unit">sessions</span></span>
      </div>
    `;
  }).join('');
}

function attachWorkoutEvents(container) {
  // Tab Switching
  const tabBtns = container.querySelectorAll('.tab-btn');
  const panes = container.querySelectorAll('.wo-tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = 'pane-' + btn.getAttribute('data-wo-tab');
      const targetPane = container.querySelector('#' + targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Add Workout Day
  const addDayBtn = container.querySelector('#btn-add-workout-day');
  if (addDayBtn) {
    addDayBtn.addEventListener('click', () => {
      openWorkoutModal(container, 'add-day');
    });
  }

  // Day Actions (Edit, Duplicate, Delete, Remove Exercise, Add Exercise to Day)
  container.querySelectorAll('.btn-edit-day').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const dayIdx = parseInt(e.currentTarget.getAttribute('data-day-index'), 10);
      openWorkoutModal(container, 'edit-day', { dayIdx });
    });
  });

  container.querySelectorAll('.btn-duplicate-day').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const dayIdx = parseInt(e.currentTarget.getAttribute('data-day-index'), 10);
      const plan = appState.workoutPlan;
      const targetDay = plan[dayIdx];
      if (targetDay) {
        const copy = JSON.parse(JSON.stringify(targetDay));
        copy.name = copy.name + ' (Copy)';
        copy.dayIndex = plan.length + 1;
        plan.push(copy);
        appState.updateWorkoutPlan(plan);
      }
    });
  });

  container.querySelectorAll('.btn-delete-day').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const dayIdx = parseInt(e.currentTarget.getAttribute('data-day-index'), 10);
      const plan = appState.workoutPlan;
      if (confirm(`Delete ${plan[dayIdx].name}?`)) {
        plan.splice(dayIdx, 1);
        appState.updateWorkoutPlan(plan);
      }
    });
  });

  container.querySelectorAll('.btn-remove-ex').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const dIdx = parseInt(e.currentTarget.getAttribute('data-day'), 10);
      const eIdx = parseInt(e.currentTarget.getAttribute('data-ex'), 10);
      const plan = appState.workoutPlan;
      plan[dIdx].exercises.splice(eIdx, 1);
      appState.updateWorkoutPlan(plan);
    });
  });

  container.querySelectorAll('.btn-add-ex-to-day').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const dayIdx = parseInt(e.currentTarget.getAttribute('data-day-index'), 10);
      openWorkoutModal(container, 'add-ex-to-day', { dayIdx });
    });
  });

  // Library Filter listeners
  const searchInput = container.querySelector('#ex-lib-search');
  const catSelect = container.querySelector('#ex-lib-cat-filter');
  const gridContainer = container.querySelector('#ex-library-grid-container');

  const filterLibrary = () => {
    const q = searchInput.value.toLowerCase().trim();
    const cat = catSelect.value;

    const filtered = appState.exerciseLibrary.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(q) || ex.targetRegion.toLowerCase().includes(q);
      const matchesCat = cat === 'ALL' || ex.primaryCategory === cat;
      return matchesSearch && matchesCat;
    });

    gridContainer.innerHTML = renderLibraryGrid(filtered);
  };

  if (searchInput) searchInput.addEventListener('input', filterLibrary);
  if (catSelect) catSelect.addEventListener('change', filterLibrary);

  // Add Custom Exercise button
  const addCustomExBtn = container.querySelector('#btn-add-custom-exercise');
  if (addCustomExBtn) {
    addCustomExBtn.addEventListener('click', () => {
      openWorkoutModal(container, 'add-custom-exercise');
    });
  }

  // Exercise History filter dropdown
  const exHistSelect = container.querySelector('#ex-history-select');
  const exHistResults = container.querySelector('#ex-history-results');
  if (exHistSelect) {
    exHistSelect.addEventListener('change', (e) => {
      exHistResults.innerHTML = renderExerciseHistory(e.target.value);
    });
  }

  // Modal Close
  const modalOverlay = container.querySelector('#workout-modal-overlay');
  const modalClose = container.querySelector('#wo-modal-close');
  if (modalClose && modalOverlay) {
    modalClose.addEventListener('click', () => {
      modalOverlay.style.display = 'none';
    });
  }
}

function openWorkoutModal(container, mode, payload = null) {
  const modalOverlay = container.querySelector('#workout-modal-overlay');
  const modalTitle = container.querySelector('#wo-modal-title');
  const modalBody = container.querySelector('#wo-modal-body');

  modalOverlay.style.display = 'flex';

  if (mode === 'add-day') {
    modalTitle.textContent = 'Add Workout Day';
    modalBody.innerHTML = `
      <form id="form-add-wo-day">
        <div class="form-group">
          <label class="form-label">Day Title</label>
          <input type="text" class="form-input" id="inp-day-name" placeholder="e.g. Day 8 — Upper Body Power" required>
        </div>
        <div class="form-group">
          <label class="form-label">Tag / Focus Summary</label>
          <input type="text" class="form-input" id="inp-day-tag" placeholder="e.g. Hypertrophy, Upper Body" value="Workout">
        </div>
        <div class="form-group">
          <label class="form-label">Rest Day?</label>
          <select class="form-select" id="inp-day-is-rest">
            <option value="false">No (Active Training Day)</option>
            <option value="true">Yes (Rest & Recovery)</option>
          </select>
        </div>
        <div class="form-actions mt-3">
          <button type="submit" class="btn-primary">Add Day to Plan</button>
        </div>
      </form>
    `;

    container.querySelector('#form-add-wo-day').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = container.querySelector('#inp-day-name').value.trim();
      const tag = container.querySelector('#inp-day-tag').value.trim();
      const isRest = container.querySelector('#inp-day-is-rest').value === 'true';

      const plan = appState.workoutPlan;
      plan.push({
        dayIndex: plan.length + 1,
        name,
        tag,
        isRest,
        exercises: []
      });

      appState.updateWorkoutPlan(plan);
      modalOverlay.style.display = 'none';
    });
  } else if (mode === 'edit-day' && payload) {
    const day = appState.workoutPlan[payload.dayIdx];
    modalTitle.textContent = 'Edit Workout Day';
    modalBody.innerHTML = `
      <form id="form-edit-wo-day">
        <div class="form-group">
          <label class="form-label">Day Title</label>
          <input type="text" class="form-input" id="inp-edit-day-name" value="${escapeHtml(day.name)}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Tag / Focus Summary</label>
          <input type="text" class="form-input" id="inp-edit-day-tag" value="${escapeHtml(day.tag || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Rest Day?</label>
          <select class="form-select" id="inp-edit-day-is-rest">
            <option value="false" ${!day.isRest ? 'selected' : ''}>No (Active Training Day)</option>
            <option value="true" ${day.isRest ? 'selected' : ''}>Yes (Rest & Recovery)</option>
          </select>
        </div>
        <div class="form-actions mt-3">
          <button type="submit" class="btn-primary">Save Changes</button>
        </div>
      </form>
    `;

    container.querySelector('#form-edit-wo-day').addEventListener('submit', (e) => {
      e.preventDefault();
      day.name = container.querySelector('#inp-edit-day-name').value.trim();
      day.tag = container.querySelector('#inp-edit-day-tag').value.trim();
      day.isRest = container.querySelector('#inp-edit-day-is-rest').value === 'true';

      appState.updateWorkoutPlan(appState.workoutPlan);
      modalOverlay.style.display = 'none';
    });
  } else if (mode === 'add-ex-to-day' && payload) {
    modalTitle.textContent = 'Add Exercise to Day';
    modalBody.innerHTML = `
      <form id="form-add-ex-to-day">
        <div class="form-group">
          <label class="form-label">Select Exercise from Library</label>
          <select class="form-select" id="inp-select-ex-lib" required>
            ${appState.exerciseLibrary.map(ex => `<option value="${escapeHtml(ex.name)}" data-cat="${escapeHtml(ex.primaryCategory)}">${escapeHtml(ex.name)} (${ex.primaryCategory})</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Sets</label>
          <input type="number" class="form-input" id="inp-ex-sets" value="2" required>
        </div>
        <div class="form-group">
          <label class="form-label">Rep Range / Target</label>
          <input type="text" class="form-input" id="inp-ex-reps" value="8–12" placeholder="e.g. 8–12 or 10–15" required>
        </div>
        <div class="form-group">
          <label class="form-label">Optional Note</label>
          <input type="text" class="form-input" id="inp-ex-note" placeholder="e.g. Short-head bias, slow eccentric">
        </div>
        <div class="form-actions mt-3">
          <button type="submit" class="btn-primary">Add Exercise</button>
        </div>
      </form>
    `;

    container.querySelector('#form-add-ex-to-day').addEventListener('submit', (e) => {
      e.preventDefault();
      const exSelect = container.querySelector('#inp-select-ex-lib');
      const exName = exSelect.value;
      const selectedOption = exSelect.options[exSelect.selectedIndex];
      const category = selectedOption.getAttribute('data-cat') || 'General';

      const sets = parseInt(container.querySelector('#inp-ex-sets').value, 10) || 2;
      const reps = container.querySelector('#inp-ex-reps').value.trim();
      const note = container.querySelector('#inp-ex-note').value.trim();

      const plan = appState.workoutPlan;
      plan[payload.dayIdx].exercises.push({
        exerciseId: 'ex_' + Date.now(),
        name: exName,
        sets,
        reps,
        note,
        category
      });

      appState.updateWorkoutPlan(plan);
      modalOverlay.style.display = 'none';
    });
  } else if (mode === 'add-custom-exercise') {
    modalTitle.textContent = 'Create Custom Exercise';
    modalBody.innerHTML = `
      <form id="form-create-custom-ex">
        <div class="form-group">
          <label class="form-label">Exercise Name</label>
          <input type="text" class="form-input" id="inp-custom-ex-name" placeholder="e.g. Standing Cable Chest Fly" required>
        </div>
        <div class="form-group">
          <label class="form-label">Primary Category</label>
          <select class="form-select" id="inp-custom-ex-cat">
            <option value="Chest">Chest</option>
            <option value="Back">Back</option>
            <option value="Shoulders">Shoulders</option>
            <option value="Arms">Arms</option>
            <option value="Legs">Legs</option>
            <option value="Core">Core</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Target Region / Muscle</label>
          <input type="text" class="form-input" id="inp-custom-ex-target" placeholder="e.g. Upper Chest, Lats, Side Delts" required>
        </div>
        <div class="form-actions mt-3">
          <button type="submit" class="btn-primary">Save to Exercise Library</button>
        </div>
      </form>
    `;

    container.querySelector('#form-create-custom-ex').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = container.querySelector('#inp-custom-ex-name').value.trim();
      const primaryCategory = container.querySelector('#inp-custom-ex-cat').value;
      const targetRegion = container.querySelector('#inp-custom-ex-target').value.trim();

      appState.addCustomExerciseToLibrary({ name, primaryCategory, targetRegion });
      modalOverlay.style.display = 'none';
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
