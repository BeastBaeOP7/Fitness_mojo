/**
 * Common UI Components & Utilities
 * Shared Date Navigation Bar and Toast Notifications.
 */

import { appState } from '../state.js';

export function renderDateBar() {
  const selectedStr = appState.selectedDateStr;
  const isToday = appState.isTodaySelected();

  // Format date display string
  const [y, m, d] = selectedStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dateOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  const formattedText = dateObj.toLocaleDateString('en-US', dateOptions);

  return `
    <div class="date-navigator-bar dash-card">
      <button class="btn-date-nav btn-date-prev" id="btn-date-prev" title="Previous Day">
        ‹ Prev
      </button>
      
      <div class="date-display-center">
        <label for="inp-date-picker" class="date-label-wrapper">
          <span class="date-text">${isToday ? 'Today — ' : ''}${formattedText}</span>
          <input type="date" id="inp-date-picker" class="date-picker-hidden" value="${selectedStr}">
        </label>
        ${!isToday ? `<button class="btn-micro btn-jump-today" id="btn-jump-today">Jump to Today</button>` : ''}
      </div>

      <button class="btn-date-nav btn-date-next" id="btn-date-next" title="Next Day">
        Next ›
      </button>
    </div>
  `;
}

export function attachDateBarEvents(container) {
  const prevBtn = container.querySelector('#btn-date-prev');
  const nextBtn = container.querySelector('#btn-date-next');
  const datePicker = container.querySelector('#inp-date-picker');
  const todayBtn = container.querySelector('#btn-jump-today');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      appState.navigateDate(-1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      appState.navigateDate(1);
    });
  }

  if (datePicker) {
    datePicker.addEventListener('change', (e) => {
      if (e.target.value) {
        appState.setSelectedDate(e.target.value);
      }
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      appState.setToday();
    });
  }
}

export function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type} animate-fade-in`;
  toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3000);
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
