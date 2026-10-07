/**
 * Progress Component - Gautham's Fitness Analytics & Trends
 * Clean Weekly and Monthly charts, Streaks, and Body Measurements.
 */

import { appState } from '../state.js';
import { showToast } from './common.js';

let activeCharts = [];

export function renderProgress(container) {
  const streaks = appState.calculateStreaks();
  const measurements = appState.bodyMeasurements;

  container.innerHTML = `
    <div class="progress-page animate-fade-in">
      <header class="page-header">
        <div>
          <h1 class="page-title">Progress & Analytics</h1>
          <p class="page-subtitle">Track your weekly/monthly consistency, streaks, and body metrics.</p>
        </div>
      </header>

      <!-- STREAKS BAR -->
      <section class="streaks-container">
        <div class="dash-card streak-card">
          <span class="streak-icon">🔥</span>
          <div class="streak-meta">
            <span class="streak-value">${streaks.proteinStreak} days</span>
            <span class="streak-label">Protein Target Streak</span>
          </div>
        </div>
        <div class="dash-card streak-card">
          <span class="streak-icon">🏋️</span>
          <div class="streak-meta">
            <span class="streak-value">${streaks.workoutStreak} sessions</span>
            <span class="streak-label">Workout Streak</span>
          </div>
        </div>
        <div class="dash-card streak-card">
          <span class="streak-icon">📅</span>
          <div class="streak-meta">
            <span class="streak-value">${streaks.dailyLogStreak} days</span>
            <span class="streak-label">Daily Tracking Streak</span>
          </div>
        </div>
      </section>

      <!-- TIME RANGE TOGGLE -->
      <div class="tab-subnav mt-4">
        <button class="tab-btn active" data-range="7">Past 7 Days (Weekly)</button>
        <button class="tab-btn" data-range="30">Past 30 Days (Monthly)</button>
        <button class="tab-btn" data-range="body">Body Measurements (${measurements.length})</button>
      </div>

      <!-- CHARTS CONTAINER -->
      <div class="progress-pane active" id="pane-charts">
        <div class="charts-grid mt-3">
          <!-- PROTEIN CHART -->
          <div class="dash-card chart-card">
            <div class="chart-header">
              <h3>🍗 Protein Intake Trend (g)</h3>
              <span class="chart-subtitle">Target: ${appState.profile.proteinTargetG}g / day</span>
            </div>
            <div class="chart-wrapper">
              <canvas id="chart-protein"></canvas>
            </div>
          </div>

          <!-- WATER CHART -->
          <div class="dash-card chart-card">
            <div class="chart-header">
              <h3>💧 Water Consumption (L)</h3>
              <span class="chart-subtitle">Target: ${appState.profile.waterTargetL}L / day</span>
            </div>
            <div class="chart-wrapper">
              <canvas id="chart-water"></canvas>
            </div>
          </div>

          <!-- STEPS CHART -->
          <div class="dash-card chart-card">
            <div class="chart-header">
              <h3>👟 Daily Steps</h3>
              <span class="chart-subtitle">Target: ${appState.profile.stepTarget.toLocaleString()} steps</span>
            </div>
            <div class="chart-wrapper">
              <canvas id="chart-steps"></canvas>
            </div>
          </div>

          <!-- WEIGHT CHART -->
          <div class="dash-card chart-card">
            <div class="chart-header">
              <h3>⚖️ Body Weight Trend (kg)</h3>
            </div>
            <div class="chart-wrapper">
              <canvas id="chart-weight"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- BODY MEASUREMENTS PANE -->
      <div class="progress-pane" id="pane-body" style="display: none;">
        <div class="pane-header-actions">
          <p class="pane-desc">Optional secondary body tracking (Chest, Waist, Arms, Thighs, Body Fat %).</p>
          <button class="btn-primary-sm" id="btn-add-body-log">+ Add Body Measurement</button>
        </div>

        <div class="body-logs-table-card dash-card mt-3">
          ${measurements.length === 0 ? `
            <div class="empty-state">
              <div class="empty-icon">📐</div>
              <p>No body measurements logged yet.</p>
            </div>
          ` : `
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Weight</th>
                    <th>Chest</th>
                    <th>Waist</th>
                    <th>Arms</th>
                    <th>Thighs</th>
                    <th>Body Fat %</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  ${measurements.slice().reverse().map(m => `
                    <tr>
                      <td>${m.date}</td>
                      <td>${m.weightKg ? m.weightKg + ' kg' : '—'}</td>
                      <td>${m.chestCm ? m.chestCm + ' cm' : '—'}</td>
                      <td>${m.waistCm ? m.waistCm + ' cm' : '—'}</td>
                      <td>${m.armsCm ? m.armsCm + ' cm' : '—'}</td>
                      <td>${m.thighsCm ? m.thighsCm + ' cm' : '—'}</td>
                      <td>${m.bodyFatPct ? m.bodyFatPct + '%' : '—'}</td>
                      <td>${escapeHtml(m.notes || '—')}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>

      <!-- BODY MEASUREMENT MODAL -->
      <div class="modal-overlay" id="progress-modal-overlay" style="display: none;">
        <div class="modal-content dash-card">
          <div class="modal-header">
            <h3 class="modal-title">Add Body Measurement</h3>
            <button class="modal-close-btn" id="prog-modal-close">&times;</button>
          </div>
          <div class="modal-body">
            <form id="form-add-body-measurement">
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Weight (kg)</label>
                  <input type="number" step="0.1" class="form-input" id="bm-weight" placeholder="74.5">
                </div>
                <div class="form-group">
                  <label class="form-label">Chest (cm)</label>
                  <input type="number" step="0.1" class="form-input" id="bm-chest" placeholder="102">
                </div>
              </div>
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Waist (cm)</label>
                  <input type="number" step="0.1" class="form-input" id="bm-waist" placeholder="82">
                </div>
                <div class="form-group">
                  <label class="form-label">Arms (cm)</label>
                  <input type="number" step="0.1" class="form-input" id="bm-arms" placeholder="38">
                </div>
              </div>
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Thighs (cm)</label>
                  <input type="number" step="0.1" class="form-input" id="bm-thighs" placeholder="58">
                </div>
                <div class="form-group">
                  <label class="form-label">Body Fat %</label>
                  <input type="number" step="0.1" class="form-input" id="bm-fat" placeholder="15">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Notes</label>
                <input type="text" class="form-input" id="bm-notes" placeholder="e.g. Morning fasted measurement">
              </div>
              <div class="form-actions mt-3">
                <button type="button" class="btn-secondary-sm mr-2" id="btn-prog-cancel">Cancel</button>
                <button type="submit" class="btn-primary">Save Measurement</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  attachProgressEvents(container);
  loadCharts(7);
}

function attachProgressEvents(container) {
  const rangeBtns = container.querySelectorAll('.tab-btn[data-range]');
  const chartsPane = container.querySelector('#pane-charts');
  const bodyPane = container.querySelector('#pane-body');

  rangeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      rangeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const val = btn.getAttribute('data-range');
      if (val === 'body') {
        chartsPane.style.display = 'none';
        bodyPane.style.display = 'block';
      } else {
        bodyPane.style.display = 'none';
        chartsPane.style.display = 'block';
        const days = parseInt(val, 10);
        loadCharts(days);
      }
    });
  });

  // Modal open & close
  const addBodyBtn = container.querySelector('#btn-add-body-log');
  const modalOverlay = container.querySelector('#progress-modal-overlay');
  const modalClose = container.querySelector('#prog-modal-close');
  const cancelBtn = container.querySelector('#btn-prog-cancel');

  if (addBodyBtn) {
    addBodyBtn.addEventListener('click', () => {
      modalOverlay.style.display = 'flex';
    });
  }

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modalOverlay.style.display = 'none';
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      modalOverlay.style.display = 'none';
    });
  }

  // Form submit
  const bodyForm = container.querySelector('#form-add-body-measurement');
  if (bodyForm) {
    bodyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      appState.addBodyMeasurement({
        weightKg: container.querySelector('#bm-weight').value,
        chestCm: container.querySelector('#bm-chest').value,
        waistCm: container.querySelector('#bm-waist').value,
        armsCm: container.querySelector('#bm-arms').value,
        thighsCm: container.querySelector('#bm-thighs').value,
        bodyFatPct: container.querySelector('#bm-fat').value,
        notes: container.querySelector('#bm-notes').value.trim()
      });
      modalOverlay.style.display = 'none';
      showToast('Body measurement saved!');
    });
  }
}

async function loadCharts(daysCount) {
  if (typeof window.Chart === 'undefined') {
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/chart.js');
    } catch (e) {
      console.warn('Chart.js CDN load error:', e);
      return;
    }
  }

  activeCharts.forEach(c => c.destroy());
  activeCharts = [];

  const labels = [];
  const proteinData = [];
  const waterData = [];
  const stepsData = [];
  const weightData = [];

  const today = new Date();
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const shortLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
    labels.push(shortLabel);

    const log = appState.dailyLogs[dateStr];
    if (log) {
      const pTotal = log.foodEntries ? log.foodEntries.reduce((s, item) => s + (item.proteinG || 0), 0) : 0;
      proteinData.push(pTotal);
      waterData.push(log.waterIntakeL || 0);
      stepsData.push(log.steps || 0);
      weightData.push(log.weightKg || null);
    } else {
      proteinData.push(0);
      waterData.push(0);
      stepsData.push(0);
      weightData.push(null);
    }
  }

  const gridColor = 'rgba(255, 255, 255, 0.06)';
  const textColor = '#94a3b8';

  const createChart = (canvasId, label, data, color, type = 'line', targetVal = null) => {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const datasets = [{
      label,
      data,
      borderColor: color,
      backgroundColor: type === 'bar' ? color : 'transparent',
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 3,
      pointBackgroundColor: color
    }];

    if (targetVal) {
      datasets.push({
        label: 'Target',
        data: new Array(daysCount).fill(targetVal),
        borderColor: 'rgba(255, 255, 255, 0.25)',
        borderDash: [4, 4],
        borderWidth: 1,
        pointRadius: 0,
        fill: false
      });
    }

    const chart = new window.Chart(ctx, {
      type,
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { size: 10 } }
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { size: 10 } }
          }
        }
      }
    });
    activeCharts.push(chart);
  };

  createChart('chart-protein', 'Protein (g)', proteinData, '#38bdf8', 'line', appState.profile.proteinTargetG);
  createChart('chart-water', 'Water (L)', waterData, '#06b6d4', 'line', appState.profile.waterTargetL);
  createChart('chart-steps', 'Steps', stepsData, '#10b981', 'bar', appState.profile.stepTarget);
  createChart('chart-weight', 'Weight (kg)', weightData, '#f59e0b', 'line');
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
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
