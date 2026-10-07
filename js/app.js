/**
 * Main Application Orchestrator & Router
 */

import { appState } from './state.js';
import { getFirebaseStatus, signInWithGoogle, signOutUser } from './firebase-service.js';
import { renderDashboard } from './components/dashboard.js';
import { renderNutrition } from './components/nutrition.js';
import { renderWorkout } from './components/workout.js';
import { renderProgress } from './components/progress.js';
import { renderSettings } from './components/settings.js';
import { showToast } from './components/common.js';

class App {
  constructor() {
    this.currentView = 'dashboard';
    this.mainContainer = null;
    this.authContainer = null;
  }

  async init() {
    this.mainContainer = document.getElementById('view-container');
    this.authContainer = document.getElementById('header-auth-container');

    // 1. Initialize State (LocalStorage + Firebase sync)
    await appState.init();

    // 2. Setup Navigation Listeners (Desktop & Mobile)
    this.setupNavigation();

    // 3. Register PWA Service Worker
    this.registerServiceWorker();

    // 4. Initial Route & Auth Widget render
    this.renderHeaderAuth();
    this.handleRoute();

    // 5. Subscribe to State Changes
    appState.subscribe(() => {
      this.renderHeaderAuth();
      this.renderCurrentView();
    });

    window.addEventListener('hashchange', () => this.handleRoute());
  }

  renderHeaderAuth() {
    if (!this.authContainer) return;
    const status = getFirebaseStatus();

    if (status.authenticated && status.user) {
      this.authContainer.innerHTML = `
        <div class="user-auth-badge">
          ${status.user.photoURL ? `<img src="${status.user.photoURL}" class="user-avatar" alt="Avatar">` : `<span class="user-avatar-icon">👤</span>`}
          <span class="user-name-text">${escapeHtml(status.user.displayName || 'User')}</span>
          <button class="btn-micro" id="btn-header-signout" title="Sign Out">Sign Out</button>
        </div>
      `;

      const signOutBtn = this.authContainer.querySelector('#btn-header-signout');
      if (signOutBtn) {
        signOutBtn.addEventListener('click', async () => {
          await signOutUser();
          showToast('Signed out of Google account');
          appState.notify();
        });
      }
    } else {
      this.authContainer.innerHTML = `
        <button class="btn-secondary-sm btn-google-signin" id="btn-header-signin">
          <span>🔑 Google Sign-In</span>
        </button>
      `;

      const signInBtn = this.authContainer.querySelector('#btn-header-signin');
      if (signInBtn) {
        signInBtn.addEventListener('click', async () => {
          try {
            const user = await signInWithGoogle();
            showToast(`Welcome, ${user.displayName || 'User'}!`, 'success');
            await appState.syncWithCloud();
            appState.notify();
          } catch (err) {
            console.error('Google Sign-In Error:', err);
            showToast('Google Sign-In failed or was cancelled');
          }
        });
      }
    }
  }

  setupNavigation() {
    const desktopLinks = document.querySelectorAll('.desktop-nav .nav-link');
    const mobileBtns = document.querySelectorAll('.mobile-bottom-nav .mobile-nav-btn');

    const setActiveNav = (viewName) => {
      desktopLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-view') === viewName);
      });
      mobileBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
      });
    };

    const handleNavClick = (e) => {
      const view = e.currentTarget.getAttribute('data-view');
      if (view) {
        window.location.hash = view;
      }
    };

    desktopLinks.forEach(link => link.addEventListener('click', handleNavClick));
    mobileBtns.forEach(btn => btn.addEventListener('click', handleNavClick));

    this.setActiveNav = setActiveNav;
  }

  handleRoute() {
    const hash = window.location.hash.replace('#', '').trim();
    const validViews = ['dashboard', 'nutrition', 'workout', 'progress', 'settings'];

    if (validViews.includes(hash)) {
      this.currentView = hash;
    } else {
      this.currentView = 'dashboard';
    }

    if (this.setActiveNav) this.setActiveNav(this.currentView);
    this.renderCurrentView();
  }

  renderCurrentView() {
    if (!this.mainContainer) return;

    window.scrollTo({ top: 0, behavior: 'instant' });

    switch (this.currentView) {
      case 'dashboard':
        renderDashboard(this.mainContainer);
        break;
      case 'nutrition':
        renderNutrition(this.mainContainer);
        break;
      case 'workout':
        renderWorkout(this.mainContainer);
        break;
      case 'progress':
        renderProgress(this.mainContainer);
        break;
      case 'settings':
        renderSettings(this.mainContainer);
        break;
      default:
        renderDashboard(this.mainContainer);
    }
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => console.log('[PWA] ServiceWorker registered with scope:', reg.scope))
          .catch((err) => console.warn('[PWA] ServiceWorker registration failed:', err));
      });
    }
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

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
