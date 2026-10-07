/**
 * Firebase Firestore Service with offline capability and seamless setup.
 * Supports direct Firestore sync when credentials are provided, with standard fallback to localStorage.
 */

let db = null;
let isFirebaseConnected = false;
let userDocId = 'gautham_main_user';

export function getFirebaseStatus() {
  return {
    connected: isFirebaseConnected,
    dbInitialized: !!db
  };
}

export async function initializeFirebase(config) {
  if (!config || !config.apiKey || !config.projectId) {
    console.log('[Firebase] No valid configuration provided. Operating in LocalStorage mode.');
    isFirebaseConnected = false;
    return false;
  }

  try {
    // Dynamic import of Firebase SDK modules from CDN
    const { initializeApp, getApps, getApp } = await import('https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js');
    const { getFirestore, doc, setDoc, getDoc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js');

    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    db = getFirestore(app);
    isFirebaseConnected = true;
    console.log('[Firebase] Successfully connected to Firestore!');
    return true;
  } catch (err) {
    console.warn('[Firebase] Initialization error:', err);
    isFirebaseConnected = false;
    return false;
  }
}

export async function saveUserDataToCloud(dataKey, payload) {
  if (!isFirebaseConnected || !db) return false;
  try {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js');
    const docRef = doc(db, 'users', userDocId, dataKey, 'current');
    await setDoc(docRef, { ...payload, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.error(`[Firebase] Failed to save ${dataKey}:`, err);
    return false;
  }
}

export async function fetchUserDataFromCloud(dataKey) {
  if (!isFirebaseConnected || !db) return null;
  try {
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js');
    const docRef = doc(db, 'users', userDocId, dataKey, 'current');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.error(`[Firebase] Failed to fetch ${dataKey}:`, err);
    return null;
  }
}
