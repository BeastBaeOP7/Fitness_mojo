/**
 * Dashboard Component - Gautham's Fitness Command Center
 * Supports Date Navigation, Full Workout Day Override, and Clean UI Modals (No Browser Prompts).
 */

import { appState } from '../state.js';
import { healthService } from '../health-service.js';
import { renderDateBar, attachDateBarEvents, showToast } from './common.js';

export function renderDashboard(container) {
  const profile = appState.profile;
  const log = appState.getSelectedDateLog();
  const totalProtein = appState.getSelectedDateTotalProtein();
  const proteinTarget = profile.proteinTargetG;
  const waterTarget = profile.waterTargetL;
  const stepTarget = profile.stepTarget;
  const healthStatus = healthService.getConnectionStatus();

  // Calculate greeting
  const dateObj = new Date();
  const hours = dateObj.getHours();
  let greeting = 'Good morning';
  if (hours >= 12 && hours < 17) greeting = 'Good afternoon';
  if (hours >= 17) greeting = 'Good evening';

  // Active reminders
  const activeReminders = appState.reminders.filter(r => {
    if (!r.enabled) return false;
    const isCompleted = (log.completedReminders || []).includes(r.id);
    if (isCompleted) return false;

    if (r.type === 'intelligent' && r.thresholdG) {
      const remainingProtein = proteinTarget - totalProtein;
      return remainingProtein >= r.thresholdG;
    }
    return true;
  });

  // Workout state
  const currentWorkout = log.workout;
  const isWorkoutCompleted = currentWorkout && currentWorkout.completed;
  const isRestDay = currentWorkout && currentWorkout.isRest;
  const showWorkoutCard = currentWorkout && !isWorkoutCompleted && !isRestDay;

  // Calculate overall day progress percentage
  const proteinPct = Math.min(100, Math.round((totalProtein / proteinTarget) * 100));
  const waterPct = Math.min(100, Math.round((log.waterIntakeL / waterTarget) * 100));
  const stepPct = Math.min(100, Math.round((log.steps / stepTarget) * 100));
  const overallPct = Math.round((proteinPct + waterPct + stepPct) / 3);

  container.innerHTML = `
    <div class="dashboard-page animate-fade-in">
      <!-- DATE NAVIGATOR BAR -->
      ${renderDateBar()}

      <!-- GREETING & OVERALL SCORE -->
      <header class="dash-header mt-3">
        <div class="dash-greeting-block">
          <h1 class="greeting-title">${greeting}, <span class="highlight-name">${escapeHtml(profile.name)}</span></h1>
          <p class="greeting-subtitle">${appState.isTodaySelected() ? 'Here is your active command dashboard for today.' : 'Viewing historical log for ' + appState.selectedDateStr}</p>
        </div>
        <div class="dash-overall-badge">
          <div class="progress-ring-mini" style="--ring-pct: ${overallPct}%">
            <span>${overallPct}%</span>
          </div>
          <span class="badge-label">Day Score</span>
        </div>
      </header>

      <!-- COMPACT PROGRESS CARDS GRID -->
      <section class="progress-cards-grid">
        <!-- PROTEIN CARD -->
        <div class="dash-card stat-card" id="card-protein">
          <div class="stat-card-header">
            <span class="stat-icon protein-icon">🍗</span>
            <span class="stat-title">Protein</span>
          </div>
          <div class="stat-main">
            <span class="stat-value">${totalProtein.toFixed(0)}</span>
            <span class="stat-target">/ ${proteinTarget}g</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill protein-fill" style="width: ${proteinPct}%"></div>
          </div>
          <div class="stat-card-footer">
            <span>${proteinPct}% target</span>
            <button class="btn-micro" id="dash-quick-protein-btn">+ Add Protein</button>
          </div>
        </div>

        <!-- WATER CARD -->
        <div class="dash-card stat-card" id="card-water">
          <div class="stat-card-header">
            <span class="stat-icon water-icon">💧</span>
            <span class="stat-title">Water</span>
          </div>
          <div class="stat-main">
            <span class="stat-value">${log.waterIntakeL.toFixed(1)}</span>
            <span class="stat-target">/ ${waterTarget}L</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill water-fill" style="width: ${waterPct}%"></div>
          </div>
          <div class="water-quick-buttons">
            <button class="btn-chip" data-water="0.25">+250ml</button>
            <button class="btn-chip" data-water="0.5">+500ml</button>
            <button class="btn-chip" data-water="1.0">+1L</button>
          </div>
        </div>

        <!-- STEPS CARD -->
        <div class="dash-card stat-card" id="card-steps">
          <div class="stat-card-header">
            <span class="stat-icon steps-icon">👟</span>
            <span class="stat-title">Steps</span>
          </div>
          <div class="stat-main">
            <span class="stat-value">${log.steps.toLocaleString()}</span>
            <span class="stat-target">/ ${stepTarget.toLocaleString()}</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill steps-fill" style="width: ${stepPct}%"></div>
          </div>
          <div class="stat-card-footer">
            <span class="health-conn-label" title="${escapeHtml(healthStatus.message)}">🔴 ${escapeHtml(healthStatus.label)}</span>
            <button class="btn-micro" id="dash-edit-steps-btn">Edit Steps</button>
          </div>
        </div>

        <!-- WEIGHT CARD -->
        <div class="dash-card stat-card" id="card-weight">
          <div class="stat-card-header">
            <span class="stat-icon weight-icon">⚖️</span>
            <span class="stat-title">Weight</span>
          </div>
          <div class="stat-main">
            <span class="stat-value">${log.weightKg !== null ? log.weightKg + ' kg' : 'Not logged'}</span>
          </div>
          <div class="stat-card-footer">
            <span>${log.weightKg !== null ? 'Recorded' : 'Tap to set'}</span>
            <button class="btn-micro" id="dash-log-weight-btn">${log.weightKg !== null ? 'Edit' : '+ Log Weight'}</button>
          </div>
        </div>
      </section>

      <!-- DYNAMIC SECTION: WORKOUT LOG FOR SELECTED DATE -->
      <section class="dash-section animate-slide-up" id="dash-workout-section">
        <div class="section-header-inline">
          <div class="sec-title-group">
            <h2 class="section-title">WORKOUT ASSIGNED FOR THIS DATE</h2>
            <span class="tag-badge">${escapeHtml(currentWorkout.tag || 'Workout')}</span>
          </div>
          <button class="btn-secondary-sm" id="btn-change-assigned-workout">
            🔄 Change Assigned Workout Day ▾
          </button>
        </div>

        <div class="dash-card workout-active-card">
          <div class="workout-card-head">
            <div>
              <h3 class="workout-name">${escapeHtml(currentWorkout.name)}</h3>
              <p class="workout-meta">
                ${isRestDay ? 'Rest & Active Recovery' : `${currentWorkout.exercises.length} Exercises • Tap checkbox when completed`}
              </p>
            </div>
            ${!isRestDay && !isWorkoutCompleted ? `
              <button class="btn-secondary-sm" id="btn-complete-workout-all">Mark Workout Complete</button>
            ` : ''}
            ${isWorkoutCompleted ? `
              <span class="status-chip-done">✓ Workout Completed</span>
            ` : ''}
          </div>

          ${isRestDay ? `
            <div class="serene-completion-box border-0">
              <div class="serene-icon">🧘</div>
              <h3>Rest & Recovery Day</h3>
              <p>Take time to stretch, hydrate, and let your muscles adapt.</p>
            </div>
          ` : `
            <div class="exercise-checklist">
              ${currentWorkout.exercises.map((ex, idx) => {
                const isDone = (currentWorkout.completedExercises || []).includes(ex.name);
                return `
                  <div class="exercise-item ${isDone ? 'completed-item' : ''}" data-ex-name="${escapeHtml(ex.name)}">
                    <label class="custom-checkbox-container">
                      <input type="checkbox" class="ex-checkbox" data-ex-name="${escapeHtml(ex.name)}" ${isDone ? 'checked' : ''}>
                      <span class="checkmark"></span>
                    </label>
                    <div class="ex-info">
                      <span class="ex-title">${idx + 1}. ${escapeHtml(ex.name)}</span>
                      <span class="ex-details">${ex.sets} × ${ex.reps} ${ex.note ? '• ' + escapeHtml(ex.note) : ''}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </section>

      <!-- DYNAMIC SECTION: REMINDERS -->
      ${activeReminders.length > 0 ? `
        <section class="dash-section animate-slide-up" id="dash-reminders-section">
          <div class="section-header-inline">
            <h2 class="section-title">ACTIVE REMINDERS</h2>
            <span class="count-badge">${activeReminders.length} remaining</span>
          </div>
          <div class="dash-card reminders-active-card">
            <div class="reminders-checklist">
              ${activeReminders.map(rem => `
                <div class="reminder-item" data-rem-id="${rem.id}">
                  <label class="custom-checkbox-container">
                    <input type="checkbox" class="rem-checkbox" data-rem-id="${rem.id}">
                    <span class="checkmark"></span>
                  </label>
                  <div class="rem-info">
                    <span class="rem-title">${escapeHtml(rem.name)}</span>
                    <span class="rem-time">${rem.type === 'intelligent' ? '💡 Intelligent Protein Trigger' : rem.time}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </section>
      ` : ''}

      <!-- ALL CAUGHT UP STATE (IF NO REMINDERS ACTIVE & WORKOUT COMPLETE/REST) -->
      ${(isRestDay || isWorkoutCompleted) && activeReminders.length === 0 ? `
        <section class="dash-section serene-completion-box animate-fade-in">
          <div class="serene-icon">✨</div>
          <h3>You're all caught up for ${appState.isTodaySelected() ? 'today' : appState.selectedDateStr}!</h3>
          <p>${isRestDay ? 'Rest day log is up to date.' : 'Workout and daily reminders completed.'}</p>
        </div>
      ` : ''}

      <!-- DASHBOARD MODAL CONTAINER -->
      <div class="modal-overlay" id="dash-modal-overlay" style="display: none;">
        <div class="modal-content dash-card">
          <div class="modal-header">
            <h3 class="modal-title" id="dash-modal-title">Action</h3>
            <button class="modal-close-btn" id="dash-modal-close">&times;</button>
          </div>
          <div class="modal-body" id="dash-modal-body"></div>
        </div>
      </div>
    </div>
  `;

  // Attach event handlers
  attachDateBarEvents(container);
  attachDashboardEvents(container);
}

function attachDashboardEvents(container) {
  // Quick Water Buttons
  container.querySelectorAll('.water-quick-buttons button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const amount = parseFloat(e.currentTarget.getAttribute('data-water'));
      if (amount) {
        appState.addWaterIntake(amount, appState.selectedDateStr);
        showToast(`Added ${amount >= 1 ? amount + 'L' : (amount * 1000) + 'ml'} water`);
      }
    });
  });

  // Quick Add Protein Button (Opens Modal)
  const quickProteinBtn = container.querySelector('#dash-quick-protein-btn');
  if (quickProteinBtn) {
    quickProteinBtn.addEventListener('click', () => {
      openDashModal(container, 'quick-protein');
    });
  }

  // Edit Steps Button (Opens Modal)
  const editStepsBtn = container.querySelector('#dash-edit-steps-btn');
  if (editStepsBtn) {
    editStepsBtn.addEventListener('click', () => {
      openDashModal(container, 'edit-steps');
    });
  }

  // Log Weight Button (Opens Modal)
  const logWeightBtn = container.querySelector('#dash-log-weight-btn');
  if (logWeightBtn) {
    logWeightBtn.addEventListener('click', () => {
      openDashModal(container, 'log-weight');
    });
  }

  // Change Assigned Workout Day Button (Opens Modal)
  const changeWorkoutBtn = container.querySelector('#btn-change-assigned-workout');
  if (changeWorkoutBtn) {
    changeWorkoutBtn.addEventListener('click', () => {
      openDashModal(container, 'change-workout-day');
    });
  }

  // Exercise Checkboxes
  container.querySelectorAll('.ex-checkbox').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const exName = e.currentTarget.getAttribute('data-ex-name');
      appState.toggleExerciseCompletion(exName, appState.selectedDateStr);
    });
  });

  // Complete All Workout Button
  const completeAllBtn = container.querySelector('#btn-complete-workout-all');
  if (completeAllBtn) {
    completeAllBtn.addEventListener('click', () => {
      appState.completeWorkoutManually(appState.selectedDateStr);
      showToast('Workout marked complete!');
    });
  }

  // Reminder Checkboxes
  container.querySelectorAll('.rem-checkbox').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const remId = e.currentTarget.getAttribute('data-rem-id');
      appState.toggleReminderCompletion(remId, appState.selectedDateStr);
    });
  });

  // Modal Close
  const modalOverlay = container.querySelector('#dash-modal-overlay');
  const modalClose = container.querySelector('#dash-modal-close');
  if (modalClose && modalOverlay) {
    modalClose.addEventListener('click', () => {
      modalOverlay.style.display = 'none';
    });
  }
}

function openDashModal(container, mode) {
  const modalOverlay = container.querySelector('#dash-modal-overlay');
  const modalTitle = container.querySelector('#dash-modal-title');
  const modalBody = container.querySelector('#dash-modal-body');

  modalOverlay.style.display = 'flex';

  if (mode === 'quick-protein') {
    modalTitle.textContent = `Add Protein to ${appState.selectedDateStr}`;
    modalBody.innerHTML = `
      <form id="form-dash-quick-protein">
        <div class="form-group">
          <label class="form-label">Food / Supplement Name</label>
          <input type="text" class="form-input" id="inp-dash-prot-name" placeholder="e.g. Whey Scoop, Chicken Snack" value="Whey Scoop" required>
        </div>
        <div class="form-group">
          <label class="form-label">Quantity / Serving</label>
          <input type="text" class="form-input" id="inp-dash-prot-qty" value="1 serving" required>
        </div>
        <div class="form-group">
          <label class="form-label">Protein Amount (grams)</label>
          <input type="number" step="0.1" class="form-input" id="inp-dash-prot-g" placeholder="24" value="24" required>
        </div>
        <div class="form-actions mt-3">
          <button type="button" class="btn-secondary-sm mr-2" id="btn-dash-modal-cancel">Cancel</button>
          <button type="submit" class="btn-primary">Add Protein</button>
        </div>
      </form>
    `;

    container.querySelector('#btn-dash-modal-cancel').addEventListener('click', () => {
      modalOverlay.style.display = 'none';
    });

    container.querySelector('#form-dash-quick-protein').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = container.querySelector('#inp-dash-prot-name').value.trim();
      const qty = container.querySelector('#inp-dash-prot-qty').value.trim();
      const proteinG = parseFloat(container.querySelector('#inp-dash-prot-g').value);

      appState.addFoodEntryToLog({ name, qty, proteinG }, appState.selectedDateStr);
      modalOverlay.style.display = 'none';
      showToast(`Logged ${proteinG}g protein`);
    });
  } else if (mode === 'edit-steps') {
    const curSteps = appState.getSelectedDateLog().steps || 0;
    modalTitle.textContent = `Edit Steps for ${appState.selectedDateStr}`;
    modalBody.innerHTML = `
      <form id="form-dash-edit-steps">
        <div class="form-group">
          <label class="form-label">Daily Step Count</label>
          <input type="number" class="form-input" id="inp-dash-steps" value="${curSteps}" required>
        </div>
        <div class="form-actions mt-3">
          <button type="button" class="btn-secondary-sm mr-2" id="btn-dash-modal-cancel">Cancel</button>
          <button type="submit" class="btn-primary">Save Step Count</button>
        </div>
      </form>
    `;

    container.querySelector('#btn-dash-modal-cancel').addEventListener('click', () => {
      modalOverlay.style.display = 'none';
    });

    container.querySelector('#form-dash-edit-steps').addEventListener('submit', (e) => {
      e.preventDefault();
      const steps = parseInt(container.querySelector('#inp-dash-steps').value, 10) || 0;
      appState.setSteps(steps, appState.selectedDateStr);
      modalOverlay.style.display = 'none';
      showToast('Step count updated!');
    });
  } else if (mode === 'log-weight') {
    const curWeight = appState.getSelectedDateLog().weightKg || appState.profile.weightKg || '';
    modalTitle.textContent = `Log Weight for ${appState.selectedDateStr}`;
    modalBody.innerHTML = `
      <form id="form-dash-log-weight">
        <div class="form-group">
          <label class="form-label">Body Weight (kg)</label>
          <input type="number" step="0.1" class="form-input" id="inp-dash-weight" value="${curWeight}" placeholder="e.g. 74.5" required>
        </div>
        <div class="form-actions mt-3">
          <button type="button" class="btn-secondary-sm mr-2" id="btn-dash-modal-cancel">Cancel</button>
          <button type="submit" class="btn-primary">Save Weight</button>
        </div>
      </form>
    `;

    container.querySelector('#btn-dash-modal-cancel').addEventListener('click', () => {
      modalOverlay.style.display = 'none';
    });

    container.querySelector('#form-dash-log-weight').addEventListener('submit', (e) => {
      e.preventDefault();
      const weight = parseFloat(container.querySelector('#inp-dash-weight').value);
      if (!isNaN(weight)) {
        appState.setWeight(weight, appState.selectedDateStr);
        modalOverlay.style.display = 'none';
        showToast('Weight recorded!');
      }
    });
  } else if (mode === 'change-workout-day') {
    const currentPlanIdx = appState.getSelectedDateLog().workout ? appState.getSelectedDateLog().workout.planDayIndex : 0;
    modalTitle.textContent = `Assign Workout Day for ${appState.selectedDateStr}`;
    modalBody.innerHTML = `
      <form id="form-dash-change-workout">
        <p class="settings-desc mb-3">Select which workout day from your 7-day training split to assign to ${appState.selectedDateStr}:</p>
        <div class="form-group">
          <label class="form-label">Workout Split Day</label>
          <select class="form-select" id="inp-select-workout-plan-day">
            ${appState.workoutPlan.map((p, idx) => `
              <option value="${idx}" ${idx === currentPlanIdx ? 'selected' : ''}>
                ${escapeHtml(p.name)} (${p.isRest ? 'Rest' : (p.exercises ? p.exercises.length : 0) + ' Exercises'})
              </option>
            `).join('')}
          </select>
        </div>
        <div class="form-actions mt-3">
          <button type="button" class="btn-secondary-sm mr-2" id="btn-dash-modal-cancel">Cancel</button>
          <button type="submit" class="btn-primary">Assign Workout Day</button>
        </div>
      </form>
    `;

    container.querySelector('#btn-dash-modal-cancel').addEventListener('click', () => {
      modalOverlay.style.display = 'none';
    });

    container.querySelector('#form-dash-change-workout').addEventListener('submit', (e) => {
      e.preventDefault();
      const planIdx = parseInt(container.querySelector('#inp-select-workout-plan-day').value, 10);
      appState.assignWorkoutDayToLog(planIdx, appState.selectedDateStr);
      modalOverlay.style.display = 'none';
      showToast('Assigned workout day updated!');
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
