/**
 * Firebase Service with Google Authentication & Firestore Cloud Persistence
 * Plain HTML/JS Browser approach via official Firebase v10 CDN Modules.
 */

import { FIREBASE_CONFIG } from './config.js';

let app = null;
let db = null;
let auth = null;
let currentUser = null;
let isInitialized = false;

export function getFirebaseStatus() {
  return {
    initialized: isInitialized,
    authenticated: !!currentUser,
    user: currentUser ? {
      uid: currentUser.uid,
      displayName: currentUser.displayName,
      email: currentUser.email,
      photoURL: currentUser.photoURL
    } : null
  };
}

export async function initializeFirebase(customConfig = null) {
  if (isInitialized && app) return true;

  const activeConfig = customConfig || FIREBASE_CONFIG;
  if (!activeConfig || !activeConfig.projectId) {
    console.warn('[Firebase] Incomplete configuration. Operating in LocalStorage mode.');
    return false;
  }

  try {
    const { initializeApp, getApps, getApp } = await import('https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js');
    const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js');
    const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js');

    app = getApps().length === 0 ? initializeApp(activeConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    isInitialized = true;

    console.log('[Firebase] App & Firestore initialized successfully for project:', activeConfig.projectId);

    return true;
  } catch (err) {
    console.warn('[Firebase] Initialization failed:', err);
    return false;
  }
}

export async function setupAuthStateListener(onAuthChangeCallback) {
  if (!auth) {
    await initializeFirebase();
  }
  if (!auth) return;

  const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js');
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (onAuthChangeCallback) {
      onAuthChangeCallback(user);
    }
  });
}

export async function signInWithGoogle() {
  if (!auth) await initializeFirebase();
  if (!auth) throw new Error('Firebase Auth is not initialized');

  const { GoogleAuthProvider, signInWithPopup } = await import('https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js');
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  currentUser = result.user;
  return currentUser;
}

export async function signOutUser() {
  if (!auth) return;
  const { signOut } = await import('https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js');
  await signOut(auth);
  currentUser = null;
}

// --- FIRESTORE PERSISTENCE UNDER users/{uid}/ ---

export async function saveUserDataToFirestore(collectionOrDocKey, payload, docId = 'current') {
  if (!db || !currentUser) return false;
  try {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js');
    const uid = currentUser.uid;
    const docRef = doc(db, 'users', uid, collectionOrDocKey, docId);
    await setDoc(docRef, { ...payload, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.error(`[Firebase] Error writing to users/${currentUser ? currentUser.uid : 'anon'}/${collectionOrDocKey}/${docId}:`, err);
    return false;
  }
}

export async function fetchUserDataFromFirestore(collectionOrDocKey, docId = 'current') {
  if (!db || !currentUser) return null;
  try {
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js');
    const uid = currentUser.uid;
    const docRef = doc(db, 'users', uid, collectionOrDocKey, docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.error(`[Firebase] Error fetching users/${currentUser ? currentUser.uid : 'anon'}/${collectionOrDocKey}/${docId}:`, err);
    return null;
  }
}

export async function fetchDailyLogFromFirestore(dateStr) {
  if (!db || !currentUser) return null;
  try {
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js');
    const uid = currentUser.uid;
    const docRef = doc(db, 'users', uid, 'dailyLogs', dateStr);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.error(`[Firebase] Error fetching dailyLog for ${dateStr}:`, err);
    return null;
  }
}

export async function saveDailyLogToFirestore(dateStr, logPayload) {
  return saveUserDataToFirestore('dailyLogs', logPayload, dateStr);
}
