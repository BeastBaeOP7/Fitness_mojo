/**
 * Main Application Orchestrator & Router
 */

import { appState } from './state.js';
import { renderDashboard } from './components/dashboard.js';
import { renderNutrition } from './components/nutrition.js';
import { renderWorkout } from './components/workout.js';
import { renderProgress } from './components/progress.js';
import { renderSettings } from './components/settings.js';

class App {
  constructor() {
    this.currentView = 'dashboard';
    this.mainContainer = null;
  }

  async init() {
    this.mainContainer = document.getElementById('view-container');

    // 1. Initialize State (LocalStorage + Firebase sync if setup)
    await appState.init();

    // 2. Setup Navigation Listeners (Desktop & Mobile)
    this.setupNavigation();

    // 3. Register PWA Service Worker
    this.registerServiceWorker();

    // 4. Initial Route
    this.handleRoute();

    // 5. Subscribe to State Changes for auto re-render
    appState.subscribe(() => {
      this.renderCurrentView();
    });

    window.addEventListener('hashchange', () => this.handleRoute());
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

    // Scroll to top on view change
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

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
