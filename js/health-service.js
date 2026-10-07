/**
 * Health Integration Boundary Service
 * Standardized integration point for Browser/PWA Health APIs, Native Bridges, and Apple Health.
 * NEVER fabricates fake health metrics or random steps.
 */

import { appState } from './state.js';

export class HealthService {
  constructor() {
    this.isNativeBridgeAvailable = typeof window !== 'undefined' && typeof window.AppleHealthBridge !== 'undefined';
  }

  // Returns clear status of native health connection
  getConnectionStatus() {
    if (typeof window !== 'undefined' && window.AppleHealthBridge && typeof window.AppleHealthBridge.fetchTodayMetrics === 'function') {
      return {
        connected: true,
        label: 'Connected',
        message: 'Connected to Apple Health native bridge.'
      };
    }

    return {
      connected: false,
      label: 'Not connected',
      message: 'Native Apple Health bridge not detected. Step and weight data can be manually logged.'
    };
  }

  // Query health metrics from real native bridge if present
  async syncHealthData() {
    const selectedLog = appState.getSelectedDateLog();
    
    if (typeof window !== 'undefined' && window.AppleHealthBridge && typeof window.AppleHealthBridge.fetchTodayMetrics === 'function') {
      try {
        const metrics = await window.AppleHealthBridge.fetchTodayMetrics();
        if (metrics.steps !== undefined) appState.setSteps(metrics.steps);
        if (metrics.weightKg !== undefined) appState.setWeight(metrics.weightKg);
        return { success: true, source: 'Apple Health Native' };
      } catch (e) {
        console.warn('Apple Health Native sync failed:', e);
      }
    }

    return {
      success: false,
      source: 'Not connected',
      message: 'Health Data is Not Connected'
    };
  }
}

export const healthService = new HealthService();
