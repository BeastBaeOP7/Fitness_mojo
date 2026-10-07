/**
 * Health Integration Boundary Service
 * Standardized integration point for Browser/PWA Health APIs, Native Bridges, and Apple Health.
 */

import { appState } from './state.js';

export class HealthService {
  constructor() {
    this.isSupported = 'geolocation' in navigator || 'DeviceMotionEvent' in window;
    this.isMockingSync = false;
  }

  // Request native health sync permissions or fallback to web motion sensor step estimation
  async requestHealthAccess() {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const response = await DeviceMotionEvent.requestPermission();
        return response === 'granted';
      } catch (err) {
        console.warn('DeviceMotionEvent permission error:', err);
        return false;
      }
    }
    return true;
  }

  // Query health metrics (Steps, Water, Sleep, Heart rate)
  async syncHealthData() {
    const todayLog = appState.getTodayLog();
    
    // Check if window.AppleHealthBridge exists (e.g. if rendered inside WKWebView / iOS App Wrapper)
    if (window.AppleHealthBridge && typeof window.AppleHealthBridge.fetchTodayMetrics === 'function') {
      try {
        const metrics = await window.AppleHealthBridge.fetchTodayMetrics();
        if (metrics.steps !== undefined) appState.setSteps(metrics.steps);
        if (metrics.weightKg !== undefined) appState.setWeight(metrics.weightKg);
        return { success: true, source: 'Apple Health Native' };
      } catch (e) {
        console.warn('Apple Health Native sync failed:', e);
      }
    }

    // Default return current values
    return {
      success: true,
      source: 'Local / Manual Data Boundary',
      steps: todayLog.steps,
      weightKg: todayLog.weightKg
    };
  }

  // Simulate health data sync for testing
  simulateSync() {
    const currentSteps = appState.getTodayLog().steps;
    const addedSteps = Math.floor(Math.random() * 800) + 200;
    appState.setSteps(currentSteps + addedSteps);
    return currentSteps + addedSteps;
  }
}

export const healthService = new HealthService();
