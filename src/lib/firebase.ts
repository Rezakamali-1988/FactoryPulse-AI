/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Helper to check if Firebase has been provisioned or is just placeholder
export const isFirebaseConfigured = 
  firebaseConfig && 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "placeholder-api-key";

// Initialize Firebase conditionally
let app;
let db: any = null;
let auth: any = null;
let googleProvider: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Failed to initialize Firebase SDK:", error);
  }
}

export { db, auth, googleProvider };

// Test connection if configured
export async function testConnection() {
  if (isFirebaseConfigured && db) {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
      console.log("Firebase connection verified and online.");
      return true;
    } catch (error: any) {
      if (error?.message?.includes('the client is offline') || error?.message?.includes('Missing or insufficient permissions')) {
        console.error("Please check your Firebase Firestore rules or connection status.");
      }
      return false;
    }
  }
  return false;
}
