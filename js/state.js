/**
 * Central State Manager for Personal Fitness Command Center
 */

import {
  DEFAULT_PROFILE,
  INITIAL_INDIAN_FOODS,
  INITIAL_SAVED_MEALS,
  INITIAL_EXERCISE_LIBRARY,
  INITIAL_WORKOUT_PLAN,
  INITIAL_REMINDERS
} from './config.js';
import { initializeFirebase, saveUserDataToCloud, fetchUserDataFromCloud } from './firebase-service.js';

const STORAGE_KEYS = {
  PROFILE: 'fit_profile',
  WORKOUT_PLAN: 'fit_workout_plan',
  EXERCISE_LIB: 'fit_exercise_library',
  SAVED_FOODS: 'fit_saved_foods',
  SAVED_MEALS: 'fit_saved_meals',
  REMINDERS: 'fit_reminders',
  DAILY_LOGS: 'fit_daily_logs',
  BODY_MEASUREMENTS: 'fit_body_measurements',
  FIREBASE_CONFIG: 'fit_firebase_config'
};

class AppState {
  constructor() {
    this.listeners = [];
    this.profile = { ...DEFAULT_PROFILE };
    this.workoutPlan = [...INITIAL_WORKOUT_PLAN];
    this.exerciseLibrary = [...INITIAL_EXERCISE_LIBRARY];
    this.savedFoods = [...INITIAL_INDIAN_FOODS];
    this.savedMeals = [...INITIAL_SAVED_MEALS];
    this.reminders = [...INITIAL_REMINDERS];
    this.dailyLogs = {};
    this.bodyMeasurements = [];
    this.firebaseConfig = null;
    
    this.selectedDateStr = this.getTodayStr();
  }

  getTodayStr() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async init() {
    // 1. Load from localStorage first (for immediate instant render)
    this.loadFromLocalStorage();

    // 2. Try loading Firebase config & syncing if available
    if (this.firebaseConfig) {
      const connected = await initializeFirebase(this.firebaseConfig);
      if (connected) {
        await this.syncWithCloud();
      }
    }

    // Ensure today's log exists
    this.ensureDailyLog(this.selectedDateStr);
    
    // Apply theme
    this.applyTheme(this.profile.theme || 'dark');
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.saveToLocalStorage();
    this.listeners.forEach(fn => fn(this));
  }

  loadFromLocalStorage() {
    try {
      const p = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (p) this.profile = { ...DEFAULT_PROFILE, ...JSON.parse(p) };

      const wp = localStorage.getItem(STORAGE_KEYS.WORKOUT_PLAN);
      if (wp) this.workoutPlan = JSON.parse(wp);

      const el = localStorage.getItem(STORAGE_KEYS.EXERCISE_LIB);
      if (el) this.exerciseLibrary = JSON.parse(el);

      const sf = localStorage.getItem(STORAGE_KEYS.SAVED_FOODS);
      if (sf) this.savedFoods = JSON.parse(sf);

      const sm = localStorage.getItem(STORAGE_KEYS.SAVED_MEALS);
      if (sm) this.savedMeals = JSON.parse(sm);

      const rm = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      if (rm) this.reminders = JSON.parse(rm);

      const dl = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
      if (dl) this.dailyLogs = JSON.parse(dl);

      const bm = localStorage.getItem(STORAGE_KEYS.BODY_MEASUREMENTS);
      if (bm) this.bodyMeasurements = JSON.parse(bm);

      const fc = localStorage.getItem(STORAGE_KEYS.FIREBASE_CONFIG);
      if (fc) this.firebaseConfig = JSON.parse(fc);
    } catch (err) {
      console.warn('Error reading from localStorage:', err);
    }
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(this.profile));
      localStorage.setItem(STORAGE_KEYS.WORKOUT_PLAN, JSON.stringify(this.workoutPlan));
      localStorage.setItem(STORAGE_KEYS.EXERCISE_LIB, JSON.stringify(this.exerciseLibrary));
      localStorage.setItem(STORAGE_KEYS.SAVED_FOODS, JSON.stringify(this.savedFoods));
      localStorage.setItem(STORAGE_KEYS.SAVED_MEALS, JSON.stringify(this.savedMeals));
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(this.reminders));
      localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(this.dailyLogs));
      localStorage.setItem(STORAGE_KEYS.BODY_MEASUREMENTS, JSON.stringify(this.bodyMeasurements));
      if (this.firebaseConfig) {
        localStorage.setItem(STORAGE_KEYS.FIREBASE_CONFIG, JSON.stringify(this.firebaseConfig));
      }
    } catch (err) {
      console.warn('Error saving to localStorage:', err);
    }

    // Asynchronously update Firebase if connected
    this.syncCloudAsync();
  }

  async syncCloudAsync() {
    if (!this.firebaseConfig) return;
    saveUserDataToCloud('profile', this.profile);
    saveUserDataToCloud('workoutPlan', { plan: this.workoutPlan });
    saveUserDataToCloud('dailyLogs', { logs: this.dailyLogs });
    saveUserDataToCloud('reminders', { reminders: this.reminders });
    saveUserDataToCloud('savedFoods', { foods: this.savedFoods });
    saveUserDataToCloud('savedMeals', { meals: this.savedMeals });
  }

  async syncWithCloud() {
    const cloudProfile = await fetchUserDataFromCloud('profile');
    if (cloudProfile) this.profile = { ...this.profile, ...cloudProfile };

    const cloudPlan = await fetchUserDataFromCloud('workoutPlan');
    if (cloudPlan && cloudPlan.plan) this.workoutPlan = cloudPlan.plan;

    const cloudLogs = await fetchUserDataFromCloud('dailyLogs');
    if (cloudLogs && cloudLogs.logs) this.dailyLogs = { ...this.dailyLogs, ...cloudLogs.logs };
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  setTheme(theme) {
    this.profile.theme = theme;
    this.applyTheme(theme);
    this.notify();
  }

  // --- DAILY LOG HELPERS ---
  ensureDailyLog(dateStr = this.selectedDateStr) {
    if (!this.dailyLogs[dateStr]) {
      // Determine day of week for workout plan initialization
      // Note: Javascript Date parse of YYYY-MM-DD treats it as UTC, so parse manually
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const dayOfWeek = dateObj.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat

      // Find matching workout plan day (matching dayIndex or order)
      const scheduledWorkout = this.workoutPlan.find(plan => plan.dayIndex === dayOfWeek) || this.workoutPlan[0];

      this.dailyLogs[dateStr] = {
        dateStr,
        foodEntries: [],
        waterIntakeL: 0,
        steps: 0,
        weightKg: null,
        completedReminders: [],
        workout: {
          planDayId: scheduledWorkout ? scheduledWorkout.dayIndex : 0,
          name: scheduledWorkout ? scheduledWorkout.name : 'Rest Day',
          tag: scheduledWorkout ? scheduledWorkout.tag : 'Rest',
          isRest: scheduledWorkout ? scheduledWorkout.isRest : false,
          exercises: scheduledWorkout ? JSON.parse(JSON.stringify(scheduledWorkout.exercises)) : [],
          completedExercises: [],
          completed: false
        }
      };
    }
    return this.dailyLogs[dateStr];
  }

  getTodayLog() {
    return this.ensureDailyLog(this.selectedDateStr);
  }

  // --- NUTRITION LOGGING ---
  addFoodEntryToToday(entry) {
    const log = this.getTodayLog();
    const newEntry = {
      id: 'fe_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: entry.name || 'Custom Food',
      qty: entry.qty || '1 serving',
      proteinG: Number(entry.proteinG) || 0,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    log.foodEntries.push(newEntry);
    this.notify();
  }

  updateFoodEntry(entryId, updatedFields) {
    const log = this.getTodayLog();
    const index = log.foodEntries.findIndex(e => e.id === entryId);
    if (index !== -1) {
      log.foodEntries[index] = { ...log.foodEntries[index], ...updatedFields };
      this.notify();
    }
  }

  deleteFoodEntry(entryId) {
    const log = this.getTodayLog();
    log.foodEntries = log.foodEntries.filter(e => e.id !== entryId);
    this.notify();
  }

  addSavedMealToToday(mealId) {
    const meal = this.savedMeals.find(m => m.id === mealId);
    if (!meal) return;
    const log = this.getTodayLog();

    // Create discrete copy of items for today's log (Data Integrity requirement!)
    meal.items.forEach(item => {
      log.foodEntries.push({
        id: 'fe_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        name: item.name,
        qty: item.qty,
        proteinG: Number(item.proteinG) || 0,
        sourceMealName: meal.name,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    });
    this.notify();
  }

  // --- WATER LOGGING ---
  addWaterIntake(amountL) {
    const log = this.getTodayLog();
    log.waterIntakeL = Math.max(0, Number((log.waterIntakeL + amountL).toFixed(2)));
    this.notify();
  }

  setWaterIntake(totalL) {
    const log = this.getTodayLog();
    log.waterIntakeL = Math.max(0, Number(totalL.toFixed(2)));
    this.notify();
  }

  // --- STEPS & WEIGHT ---
  setSteps(steps) {
    const log = this.getTodayLog();
    log.steps = Math.max(0, parseInt(steps, 10) || 0);
    this.notify();
  }

  setWeight(weightKg) {
    const log = this.getTodayLog();
    const w = parseFloat(weightKg);
    log.weightKg = isNaN(w) ? null : w;
    if (log.weightKg !== null) {
      this.profile.weightKg = log.weightKg;
      // Also add to body measurements history
      this.addBodyMeasurement({ weightKg: log.weightKg, date: this.selectedDateStr });
    }
    this.notify();
  }

  // --- WORKOUT TRACKING ---
  toggleExerciseCompletion(exerciseName) {
    const log = this.getTodayLog();
    if (!log.workout) return;

    const list = log.workout.completedExercises || [];
    const index = list.indexOf(exerciseName);
    if (index === -1) {
      list.push(exerciseName);
    } else {
      list.splice(index, 1);
    }
    log.workout.completedExercises = list;

    // Check if entire workout is completed
    const totalExercises = log.workout.exercises.length;
    if (totalExercises > 0 && list.length >= totalExercises) {
      log.workout.completed = true;
    } else {
      log.workout.completed = false;
    }

    this.notify();
  }

  completeWorkoutManually() {
    const log = this.getTodayLog();
    if (!log.workout) return;
    log.workout.completedExercises = log.workout.exercises.map(e => e.name);
    log.workout.completed = true;
    this.notify();
  }

  // --- REMINDERS TRACKING ---
  toggleReminderCompletion(reminderId) {
    const log = this.getTodayLog();
    const list = log.completedReminders || [];
    const index = list.indexOf(reminderId);
    if (index === -1) {
      list.push(reminderId);
    } else {
      list.splice(index, 1);
    }
    log.completedReminders = list;
    this.notify();
  }

  // --- SAVED FOODS MANAGEMENT ---
  addSavedFood(food) {
    const newFood = {
      id: 'f_' + Date.now(),
      name: food.name,
      defaultQty: food.defaultQty || '100g',
      proteinG: Number(food.proteinG) || 0,
      category: food.category || 'Custom'
    };
    this.savedFoods.push(newFood);
    this.notify();
  }

  deleteSavedFood(id) {
    this.savedFoods = this.savedFoods.filter(f => f.id !== id);
    this.notify();
  }

  // --- SAVED MEALS MANAGEMENT ---
  addSavedMeal(meal) {
    const totalProtein = meal.items.reduce((sum, item) => sum + (Number(item.proteinG) || 0), 0);
    const newMeal = {
      id: 'sm_' + Date.now(),
      name: meal.name,
      items: meal.items,
      totalProteinG: Number(totalProtein.toFixed(1))
    };
    this.savedMeals.push(newMeal);
    this.notify();
  }

  updateSavedMeal(id, updatedMeal) {
    const idx = this.savedMeals.findIndex(m => m.id === id);
    if (idx !== -1) {
      const totalProtein = updatedMeal.items.reduce((sum, item) => sum + (Number(item.proteinG) || 0), 0);
      this.savedMeals[idx] = {
        ...this.savedMeals[idx],
        name: updatedMeal.name,
        items: updatedMeal.items,
        totalProteinG: Number(totalProtein.toFixed(1))
      };
      this.notify();
    }
  }

  deleteSavedMeal(id) {
    this.savedMeals = this.savedMeals.filter(m => m.id !== id);
    this.notify();
  }

  duplicateSavedMeal(id) {
    const meal = this.savedMeals.find(m => m.id === id);
    if (meal) {
      this.addSavedMeal({
        name: `${meal.name} (Copy)`,
        items: JSON.parse(JSON.stringify(meal.items))
      });
    }
  }

  // --- WORKOUT PLAN MANAGEMENT ---
  updateWorkoutPlan(newPlan) {
    this.workoutPlan = newPlan;
    this.notify();
  }

  addCustomExerciseToLibrary(ex) {
    const newEx = {
      id: 'ex_' + Date.now(),
      name: ex.name,
      primaryCategory: ex.primaryCategory || 'General',
      targetRegion: ex.targetRegion || 'General',
      secondaryMuscles: ex.secondaryMuscles || []
    };
    this.exerciseLibrary.push(newEx);
    this.notify();
  }

  // --- REMINDERS CONFIG MANAGEMENT ---
  addReminderConfig(rem) {
    const newRem = {
      id: 'rem_' + Date.now(),
      name: rem.name,
      time: rem.time || '12:00',
      frequency: rem.frequency || 'daily',
      enabled: rem.enabled !== false,
      type: rem.type || 'fixed',
      thresholdG: rem.thresholdG || null
    };
    this.reminders.push(newRem);
    this.notify();
  }

  toggleReminderEnabled(id) {
    const r = this.reminders.find(item => item.id === id);
    if (r) {
      r.enabled = !r.enabled;
      this.notify();
    }
  }

  deleteReminderConfig(id) {
    this.reminders = this.reminders.filter(r => r.id !== id);
    this.notify();
  }

  // --- BODY MEASUREMENTS ---
  addBodyMeasurement(entry) {
    this.bodyMeasurements.push({
      id: 'bm_' + Date.now(),
      date: entry.date || this.selectedDateStr,
      weightKg: entry.weightKg ? Number(entry.weightKg) : null,
      chestCm: entry.chestCm ? Number(entry.chestCm) : null,
      waistCm: entry.waistCm ? Number(entry.waistCm) : null,
      armsCm: entry.armsCm ? Number(entry.armsCm) : null,
      thighsCm: entry.thighsCm ? Number(entry.thighsCm) : null,
      bodyFatPct: entry.bodyFatPct ? Number(entry.bodyFatPct) : null,
      notes: entry.notes || ''
    });
    this.notify();
  }

  // --- STAT CALCULATIONS & STREAKS ---
  getTodayTotalProtein() {
    const log = this.getTodayLog();
    return log.foodEntries.reduce((sum, item) => sum + (Number(item.proteinG) || 0), 0);
  }

  calculateStreaks() {
    let proteinStreak = 0;
    let workoutStreak = 0;
    let dailyLogStreak = 0;

    const dates = Object.keys(this.dailyLogs).sort().reverse();
    const today = this.getTodayStr();

    // Daily log streak
    for (const date of dates) {
      const log = this.dailyLogs[date];
      if (log && (log.foodEntries.length > 0 || log.workout.completed || log.waterIntakeL > 0)) {
        dailyLogStreak++;
      } else {
        break;
      }
    }

    // Protein streak
    for (const date of dates) {
      const log = this.dailyLogs[date];
      if (!log) break;
      const totalProt = log.foodEntries.reduce((s, item) => s + (item.proteinG || 0), 0);
      if (totalProt >= this.profile.proteinTargetG) {
        proteinStreak++;
      } else if (date !== today) {
        break;
      }
    }

    // Workout streak (consecutive target workouts completed)
    for (const date of dates) {
      const log = this.dailyLogs[date];
      if (!log) break;
      if (log.workout && log.workout.completed && !log.workout.isRest) {
        workoutStreak++;
      }
    }

    return { proteinStreak, workoutStreak, dailyLogStreak };
  }

  // Widget Export Format
  getIOSWidgetData() {
    const todayLog = this.getTodayLog();
    const totalProt = this.getTodayTotalProtein();
    return {
      updatedAt: new Date().toISOString(),
      user: this.profile.name,
      protein: {
        current: Number(totalProt.toFixed(1)),
        target: this.profile.proteinTargetG,
        unit: 'g',
        percentage: Math.min(100, Math.round((totalProt / this.profile.proteinTargetG) * 100))
      },
      water: {
        current: todayLog.waterIntakeL,
        target: this.profile.waterTargetL,
        unit: 'L'
      },
      steps: {
        current: todayLog.steps,
        target: this.profile.stepTarget
      },
      workout: {
        title: todayLog.workout.name,
        isCompleted: todayLog.workout.completed,
        exercisesRemaining: todayLog.workout.exercises.length - (todayLog.workout.completedExercises || []).length
      },
      activeRemindersCount: this.reminders.filter(r => r.enabled && !(todayLog.completedReminders || []).includes(r.id)).length
    };
  }
}

export const appState = new AppState();
