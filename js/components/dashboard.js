/**
 * Dashboard Component - Gautham's Fitness Command Center
 * Dynamic, self-reflowing, ultra-clean mobile-first view.
 */

import { appState } from '../state.js';
import { healthService } from '../health-service.js';

export function renderDashboard(container) {
  const profile = appState.profile;
  const log = appState.getTodayLog();
  const totalProtein = appState.getTodayTotalProtein();
  const proteinTarget = profile.proteinTargetG;
  const waterTarget = profile.waterTargetL;
  const stepTarget = profile.stepTarget;

  // Calculate greeting & date string
  const dateObj = new Date();
  const hours = dateObj.getHours();
  let greeting = 'Good morning';
  if (hours >= 12 && hours < 17) greeting = 'Good afternoon';
  if (hours >= 17) greeting = 'Good evening';

  const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = dateObj.toLocaleDateString('en-US', dateOptions);

  // Reminders check
  const activeReminders = appState.reminders.filter(r => {
    if (!r.enabled) return false;
    const isCompleted = (log.completedReminders || []).includes(r.id);
    if (isCompleted) return false;

    // Check intelligent reminder conditions if applicable
    if (r.type === 'intelligent' && r.thresholdG) {
      const remainingProtein = proteinTarget - totalProtein;
      return remainingProtein >= r.thresholdG;
    }
    return true;
  });

  // Workout state
  const isWorkoutCompleted = log.workout && log.workout.completed;
  const isRestDay = log.workout && log.workout.isRest;
  const showWorkoutCard = log.workout && !isWorkoutCompleted && !isRestDay;

  // Calculate overall day progress percentage
  const proteinPct = Math.min(100, Math.round((totalProtein / proteinTarget) * 100));
  const waterPct = Math.min(100, Math.round((log.waterIntakeL / waterTarget) * 100));
  const stepPct = Math.min(100, Math.round((log.steps / stepTarget) * 100));
  const overallPct = Math.round((proteinPct + waterPct + stepPct) / 3);

  container.innerHTML = `
    <div class="dashboard-page animate-fade-in">
      <!-- HEADER -->
      <header class="dash-header">
        <div class="dash-greeting-block">
          <p class="greeting-subtitle">${formattedDate}</p>
          <h1 class="greeting-title">${greeting}, <span class="highlight-name">${escapeHtml(profile.name)}</span></h1>
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
            <span>${proteinPct}% completed</span>
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
            <button class="btn-micro" id="dash-sync-steps-btn">Sync Health</button>
            <button class="btn-micro" id="dash-edit-steps-btn">Edit</button>
          </div>
        </div>

        <!-- WEIGHT CARD -->
        <div class="dash-card stat-card" id="card-weight">
          <div class="stat-card-header">
            <span class="stat-icon weight-icon">⚖️</span>
            <span class="stat-title">Today's Weight</span>
          </div>
          <div class="stat-main">
            <span class="stat-value">${log.weightKg !== null ? log.weightKg + ' kg' : 'Not set'}</span>
          </div>
          <div class="stat-card-footer">
            <button class="btn-micro" id="dash-log-weight-btn">${log.weightKg !== null ? 'Update' : '+ Log Weight'}</button>
          </div>
        </div>
      </section>

      <!-- DYNAMIC SECTION: TODAY'S WORKOUT -->
      ${showWorkoutCard ? `
        <section class="dash-section animate-slide-up" id="dash-workout-section">
          <div class="section-header-inline">
            <h2 class="section-title">TODAY'S WORKOUT</h2>
            <span class="tag-badge">${escapeHtml(log.workout.tag || 'Scheduled')}</span>
          </div>
          <div class="dash-card workout-active-card">
            <div class="workout-card-head">
              <div>
                <h3 class="workout-name">${escapeHtml(log.workout.name)}</h3>
                <p class="workout-meta">${log.workout.exercises.length} Exercises • Tap checkbox when set complete</p>
              </div>
              <button class="btn-secondary-sm" id="btn-complete-workout-all">Complete All</button>
            </div>
            <div class="exercise-checklist">
              ${log.workout.exercises.map((ex, idx) => {
                const isDone = (log.workout.completedExercises || []).includes(ex.name);
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
          </div>
        </section>
      ` : ''}

      <!-- DYNAMIC SECTION: TODAY'S REMINDERS -->
      ${activeReminders.length > 0 ? `
        <section class="dash-section animate-slide-up" id="dash-reminders-section">
          <div class="section-header-inline">
            <h2 class="section-title">TODAY'S REMINDERS</h2>
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
                    <span class="rem-time">${rem.type === 'intelligent' ? '💡 Intelligent trigger' : rem.time}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </section>
      ` : ''}

      <!-- SERENE ALL-COMPLETED STATE (IF NO WORKOUT & NO REMINDERS ACTIVE) -->
      ${!showWorkoutCard && activeReminders.length === 0 ? `
        <section class="dash-section serene-completion-box animate-fade-in">
          <div class="serene-icon">✨</div>
          <h3>You're all caught up for today!</h3>
          <p>${isRestDay ? 'Today is a rest & recovery day.' : 'Workout and daily reminders completed.'}</p>
        </div>
      ` : ''}
    </div>
  `;

  // Attach event handlers
  attachDashboardEvents(container);
}

function attachDashboardEvents(container) {
  // Quick Water Buttons
  container.querySelectorAll('.water-quick-buttons button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const amount = parseFloat(e.currentTarget.getAttribute('data-water'));
      if (amount) {
        appState.addWaterIntake(amount);
      }
    });
  });

  // Quick Protein button -> opens modal or quick prompt
  const quickProteinBtn = container.querySelector('#dash-quick-protein-btn');
  if (quickProteinBtn) {
    quickProteinBtn.addEventListener('click', () => {
      const name = prompt('Food name:', 'Whey Scoop / Snack');
      if (!name) return;
      const protStr = prompt('Protein in grams:', '24');
      const prot = parseFloat(protStr);
      if (!isNaN(prot) && prot > 0) {
        appState.addFoodEntryToToday({ name, qty: '1 serving', proteinG: prot });
      }
    });
  }

  // Sync Steps Button
  const syncStepsBtn = container.querySelector('#dash-sync-steps-btn');
  if (syncStepsBtn) {
    syncStepsBtn.addEventListener('click', async () => {
      const newSteps = healthService.simulateSync();
      alert(`Synced with Health data: +${newSteps} total steps updated!`);
    });
  }

  // Edit Steps Button
  const editStepsBtn = container.querySelector('#dash-edit-steps-btn');
  if (editStepsBtn) {
    editStepsBtn.addEventListener('click', () => {
      const cur = appState.getTodayLog().steps;
      const val = prompt('Enter today\'s total step count:', cur);
      if (val !== null) {
        const num = parseInt(val, 10);
        if (!isNaN(num)) appState.setSteps(num);
      }
    });
  }

  // Log Weight Button
  const logWeightBtn = container.querySelector('#dash-log-weight-btn');
  if (logWeightBtn) {
    logWeightBtn.addEventListener('click', () => {
      const cur = appState.getTodayLog().weightKg || appState.profile.weightKg || '';
      const val = prompt('Enter today\'s weight in kg:', cur);
      if (val !== null) {
        const num = parseFloat(val);
        if (!isNaN(num) && num > 0) appState.setWeight(num);
      }
    });
  }

  // Exercise Checkboxes
  container.querySelectorAll('.ex-checkbox').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const exName = e.currentTarget.getAttribute('data-ex-name');
      appState.toggleExerciseCompletion(exName);
    });
  });

  // Complete All Workout Button
  const completeAllBtn = container.querySelector('#btn-complete-workout-all');
  if (completeAllBtn) {
    completeAllBtn.addEventListener('click', () => {
      appState.completeWorkoutManually();
    });
  }

  // Reminder Checkboxes
  container.querySelectorAll('.rem-checkbox').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const remId = e.currentTarget.getAttribute('data-rem-id');
      appState.toggleReminderCompletion(remId);
    });
  });
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
