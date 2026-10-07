/**
 * Settings Component - Profile, Goals, Reminders, Firebase & iOS Widget Export
 * Zero Browser Alerts or Prompts.
 */

import { appState } from '../state.js';
import { initializeFirebase, getFirebaseStatus } from '../firebase-service.js';
import { showToast } from './common.js';

export function renderSettings(container) {
  const profile = appState.profile;
  const reminders = appState.reminders;
  const fbStatus = getFirebaseStatus();
  const fbConfig = appState.firebaseConfig || {};

  container.innerHTML = `
    <div class="settings-page animate-fade-in">
      <header class="page-header">
        <div>
          <h1 class="page-title">Settings</h1>
          <p class="page-subtitle">Configure personal targets, Firebase storage, reminders, and exports.</p>
        </div>
      </header>

      <!-- SECTION 1: PROFILE & GOALS -->
      <section class="dash-card settings-card mt-3">
        <h3 class="settings-sec-title">👤 Personal Profile & Targets</h3>
        <form id="form-settings-profile">
          <div class="form-row-2 mt-3">
            <div class="form-group">
              <label class="form-label">Name</label>
              <input type="text" class="form-input" id="set-name" value="${escapeHtml(profile.name)}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Age</label>
              <input type="number" class="form-input" id="set-age" value="${profile.age}">
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Height (cm)</label>
              <input type="number" class="form-input" id="set-height" value="${profile.heightCm}">
            </div>
            <div class="form-group">
              <label class="form-label">Weight (kg)</label>
              <input type="number" step="0.1" class="form-input" id="set-weight" value="${profile.weightKg || ''}">
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Daily Protein Target (grams)</label>
              <input type="number" class="form-input" id="set-protein-target" value="${profile.proteinTargetG}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Daily Water Target (Liters)</label>
              <input type="number" step="0.1" class="form-input" id="set-water-target" value="${profile.waterTargetL}" required>
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Daily Step Target</label>
              <input type="number" class="form-input" id="set-step-target" value="${profile.stepTarget}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Workout Target Days / Week</label>
              <input type="number" class="form-input" id="set-workout-target" value="${profile.workoutTargetDaysPerWeek || 5}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Overall Goal Summary</label>
            <input type="text" class="form-input" id="set-goal-summary" value="${escapeHtml(profile.goalSummary)}">
          </div>
          <div class="form-actions mt-3">
            <button type="submit" class="btn-primary">Save Profile & Goals</button>
          </div>
        </form>
      </section>

      <!-- SECTION 2: REMINDERS MANAGEMENT -->
      <section class="dash-card settings-card mt-4">
        <div class="sec-header-actions">
          <h3 class="settings-sec-title">🔔 Customizable Reminders</h3>
          <button class="btn-secondary-sm" id="btn-add-new-reminder">+ Add Reminder</button>
        </div>
        <p class="settings-desc">Only enabled reminders appear on your active dashboard. Zero forced push notifications.</p>

        <div class="reminders-settings-list mt-3">
          ${reminders.map(rem => `
            <div class="rem-setting-item">
              <div class="rem-setting-info">
                <strong class="rem-name">${escapeHtml(rem.name)}</strong>
                <span class="rem-time-tag">${rem.type === 'intelligent' ? '💡 Intelligent Check' : rem.time} • ${rem.frequency}</span>
              </div>
              <div class="rem-setting-actions">
                <label class="toggle-switch">
                  <input type="checkbox" class="rem-toggle-cb" data-id="${rem.id}" ${rem.enabled ? 'checked' : ''}>
                  <span class="toggle-slider"></span>
                </label>
                <button class="btn-icon btn-delete-rem" data-id="${rem.id}" title="Delete Reminder">&times;</button>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- SECTION 3: FIREBASE FIRESTORE CONFIGURATION -->
      <section class="dash-card settings-card mt-4">
        <div class="sec-header-actions">
          <h3 class="settings-sec-title">🔥 Firebase Cloud Storage</h3>
          <span class="status-chip ${fbStatus.connected ? 'status-connected' : 'status-local'}">
            ${fbStatus.connected ? '● Firestore Connected' : '○ Local Storage Mode'}
          </span>
        </div>
        <p class="settings-desc">Enter your Firebase Web App credentials to persist data in Firestore. Single-user structure under <code>users/gautham</code>.</p>

        <form id="form-settings-firebase" class="mt-3">
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">API Key</label>
              <input type="password" class="form-input" id="fb-apiKey" value="${escapeHtml(fbConfig.apiKey || '')}" placeholder="AIzaSy...">
            </div>
            <div class="form-group">
              <label class="form-label">Project ID</label>
              <input type="text" class="form-input" id="fb-projectId" value="${escapeHtml(fbConfig.projectId || '')}" placeholder="gautham-fitness-app">
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Auth Domain</label>
              <input type="text" class="form-input" id="fb-authDomain" value="${escapeHtml(fbConfig.authDomain || '')}" placeholder="project.firebaseapp.com">
            </div>
            <div class="form-group">
              <label class="form-label">Storage Bucket</label>
              <input type="text" class="form-input" id="fb-storageBucket" value="${escapeHtml(fbConfig.storageBucket || '')}">
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Messaging Sender ID</label>
              <input type="text" class="form-input" id="fb-messagingSenderId" value="${escapeHtml(fbConfig.messagingSenderId || '')}">
            </div>
            <div class="form-group">
              <label class="form-label">App ID</label>
              <input type="text" class="form-input" id="fb-appId" value="${escapeHtml(fbConfig.appId || '')}">
            </div>
          </div>
          <div class="form-actions mt-3">
            <button type="submit" class="btn-primary">Connect & Save Credentials</button>
          </div>
        </form>
      </section>

      <!-- SECTION 4: APP THEME & DATA BACKUP / IOS WIDGET -->
      <section class="dash-card settings-card mt-4">
        <h3 class="settings-sec-title">📱 App Options & Future iOS Widget Data</h3>
        
        <div class="setting-option-row mt-3">
          <div>
            <strong>Interface Theme</strong>
            <p class="settings-desc">Choose between sleek Dark glass mode or crisp Light mode.</p>
          </div>
          <select class="form-select w-auto" id="set-theme-select">
            <option value="dark" ${profile.theme === 'dark' ? 'selected' : ''}>🌙 Dark Mode (Default)</option>
            <option value="light" ${profile.theme === 'light' ? 'selected' : ''}>☀️ Light Mode</option>
          </select>
        </div>

        <div class="setting-option-row mt-4">
          <div>
            <strong>iOS Widget Data JSON</strong>
            <p class="settings-desc">Export live data formatted for Apple Health / iOS Widget extensions.</p>
          </div>
          <button class="btn-secondary-sm" id="btn-export-widget-json">Export iOS Widget JSON</button>
        </div>

        <div class="setting-option-row mt-4">
          <div>
            <strong>Backup & Restore Data</strong>
            <p class="settings-desc">Export or import a full JSON backup of all logs, meals, workouts, and goals.</p>
          </div>
          <div class="btn-group">
            <button class="btn-secondary-sm" id="btn-export-full-backup">Export Backup</button>
            <label class="btn-secondary-sm cursor-pointer" for="inp-import-file">Import Backup</label>
            <input type="file" id="inp-import-file" accept=".json" style="display: none;">
          </div>
        </div>
      </section>

      <!-- SETTINGS MODAL -->
      <div class="modal-overlay" id="settings-modal-overlay" style="display: none;">
        <div class="modal-content dash-card">
          <div class="modal-header">
            <h3 class="modal-title" id="set-modal-title">Settings Action</h3>
            <button class="modal-close-btn" id="set-modal-close">&times;</button>
          </div>
          <div class="modal-body" id="set-modal-body"></div>
        </div>
      </div>
    </div>
  `;

  attachSettingsEvents(container);
}

function attachSettingsEvents(container) {
  // Save Profile Form
  const profileForm = container.querySelector('#form-settings-profile');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const p = appState.profile;
      p.name = container.querySelector('#set-name').value.trim();
      p.age = parseInt(container.querySelector('#set-age').value, 10) || p.age;
      p.heightCm = parseInt(container.querySelector('#set-height').value, 10) || p.heightCm;
      p.weightKg = parseFloat(container.querySelector('#set-weight').value) || p.weightKg;
      p.proteinTargetG = parseInt(container.querySelector('#set-protein-target').value, 10) || p.proteinTargetG;
      p.waterTargetL = parseFloat(container.querySelector('#set-water-target').value) || p.waterTargetL;
      p.stepTarget = parseInt(container.querySelector('#set-step-target').value, 10) || p.stepTarget;
      p.workoutTargetDaysPerWeek = parseInt(container.querySelector('#set-workout-target').value, 10) || 5;
      p.goalSummary = container.querySelector('#set-goal-summary').value.trim();

      appState.notify();
      showToast('Profile and goals saved!');
    });
  }

  // Reminders Toggle & Delete & Add
  container.querySelectorAll('.rem-toggle-cb').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      appState.toggleReminderEnabled(id);
    });
  });

  container.querySelectorAll('.btn-delete-rem').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      openSettingsModal(container, 'confirm-delete-reminder', { id });
    });
  });

  const addRemBtn = container.querySelector('#btn-add-new-reminder');
  if (addRemBtn) {
    addRemBtn.addEventListener('click', () => {
      openSettingsModal(container, 'add-reminder');
    });
  }

  // Firebase Form
  const fbForm = container.querySelector('#form-settings-firebase');
  if (fbForm) {
    fbForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const config = {
        apiKey: container.querySelector('#fb-apiKey').value.trim(),
        projectId: container.querySelector('#fb-projectId').value.trim(),
        authDomain: container.querySelector('#fb-authDomain').value.trim(),
        storageBucket: container.querySelector('#fb-storageBucket').value.trim(),
        messagingSenderId: container.querySelector('#fb-messagingSenderId').value.trim(),
        appId: container.querySelector('#fb-appId').value.trim()
      };

      appState.firebaseConfig = config;
      appState.saveToLocalStorage();

      const connected = await initializeFirebase(config);
      if (connected) {
        showToast('Successfully connected to Firebase Firestore!', 'success');
        appState.syncCloudAsync();
      } else {
        showToast('Using LocalStorage mode. (Check Firebase keys if connection was intended)');
      }
      appState.notify();
    });
  }

  // Theme Select
  const themeSelect = container.querySelector('#set-theme-select');
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      appState.setTheme(e.target.value);
    });
  }

  // Export Widget JSON
  const exportWidgetBtn = container.querySelector('#btn-export-widget-json');
  if (exportWidgetBtn) {
    exportWidgetBtn.addEventListener('click', () => {
      const widgetData = appState.getIOSWidgetData();
      downloadJSON(widgetData, `ios_fitness_widget_${appState.getTodayStr()}.json`);
      showToast('Exported iOS Widget JSON');
    });
  }

  // Full Backup Export / Import
  const exportBackupBtn = container.querySelector('#btn-export-full-backup');
  if (exportBackupBtn) {
    exportBackupBtn.addEventListener('click', () => {
      const fullBackup = {
        profile: appState.profile,
        workoutPlan: appState.workoutPlan,
        exerciseLibrary: appState.exerciseLibrary,
        savedFoods: appState.savedFoods,
        savedMeals: appState.savedMeals,
        reminders: appState.reminders,
        dailyLogs: appState.dailyLogs,
        bodyMeasurements: appState.bodyMeasurements
      };
      downloadJSON(fullBackup, `gautham_fitness_backup_${appState.getTodayStr()}.json`);
      showToast('Exported full backup file');
    });
  }

  const importFileInp = container.querySelector('#inp-import-file');
  if (importFileInp) {
    importFileInp.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = JSON.parse(evt.target.result);
          if (data.profile) appState.profile = data.profile;
          if (data.workoutPlan) appState.workoutPlan = data.workoutPlan;
          if (data.savedFoods) appState.savedFoods = data.savedFoods;
          if (data.savedMeals) appState.savedMeals = data.savedMeals;
          if (data.reminders) appState.reminders = data.reminders;
          if (data.dailyLogs) appState.dailyLogs = data.dailyLogs;

          appState.notify();
          showToast('Full backup restored successfully!', 'success');
        } catch (err) {
          showToast('Error parsing JSON backup file.');
        }
      };
      reader.readAsText(file);
    });
  }

  // Modal Close
  const modalOverlay = container.querySelector('#settings-modal-overlay');
  const modalClose = container.querySelector('#set-modal-close');
  if (modalClose && modalOverlay) {
    modalClose.addEventListener('click', () => {
      modalOverlay.style.display = 'none';
    });
  }
}

function openSettingsModal(container, mode, payload = null) {
  const modalOverlay = container.querySelector('#settings-modal-overlay');
  const modalTitle = container.querySelector('#set-modal-title');
  const modalBody = container.querySelector('#set-modal-body');

  modalOverlay.style.display = 'flex';

  if (mode === 'add-reminder') {
    modalTitle.textContent = 'Add Custom Reminder';
    modalBody.innerHTML = `
      <form id="form-add-rem">
        <div class="form-group">
          <label class="form-label">Reminder Name</label>
          <input type="text" class="form-input" id="inp-rem-name" placeholder="e.g. Creatine, Whey, Water" required>
        </div>
        <div class="form-group">
          <label class="form-label">Time</label>
          <input type="time" class="form-input" id="inp-rem-time" value="09:00" required>
        </div>
        <div class="form-group">
          <label class="form-label">Type</label>
          <select class="form-select" id="inp-rem-type">
            <option value="fixed">Fixed Time Reminder</option>
            <option value="intelligent">Intelligent Trigger (Low Protein Check)</option>
          </select>
        </div>
        <div class="form-actions mt-3">
          <button type="button" class="btn-secondary-sm mr-2" id="btn-set-modal-cancel">Cancel</button>
          <button type="submit" class="btn-primary">Save Reminder</button>
        </div>
      </form>
    `;

    container.querySelector('#btn-set-modal-cancel').addEventListener('click', () => {
      modalOverlay.style.display = 'none';
    });

    container.querySelector('#form-add-rem').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = container.querySelector('#inp-rem-name').value.trim();
      const time = container.querySelector('#inp-rem-time').value;
      const type = container.querySelector('#inp-rem-type').value;

      appState.addReminderConfig({
        name,
        time,
        type,
        thresholdG: type === 'intelligent' ? 30 : null
      });

      modalOverlay.style.display = 'none';
      showToast('Reminder added!');
    });
  } else if (mode === 'confirm-delete-reminder' && payload) {
    modalTitle.textContent = 'Delete Reminder';
    modalBody.innerHTML = `
      <p class="mb-3">Delete this reminder?</p>
      <div class="form-actions">
        <button class="btn-secondary-sm mr-2" id="btn-cancel-rem-del">Cancel</button>
        <button class="btn-danger-sm" id="btn-confirm-rem-del">Delete</button>
      </div>
    `;

    container.querySelector('#btn-cancel-rem-del').addEventListener('click', () => {
      modalOverlay.style.display = 'none';
    });

    container.querySelector('#btn-confirm-rem-del').addEventListener('click', () => {
      appState.deleteReminderConfig(payload.id);
      modalOverlay.style.display = 'none';
      showToast('Reminder deleted');
    });
  }
}

function downloadJSON(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
