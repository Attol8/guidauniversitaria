import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, GoogleAuthProvider } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Connect to emulators only when explicitly enabled (for local development)
if (process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
  // Connect to Firestore emulator
  try {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
  } catch (error) {
    // Already connected
  }

  // Connect to Auth emulator if enabled
  if (process.env.NEXT_PUBLIC_USE_AUTH_EMULATOR === 'true') {
    try {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    } catch (error) {
      // Already connected
    }
  }
  
  // Connect to Storage emulator
  try {
    connectStorageEmulator(storage, '127.0.0.1', 9199);
  } catch (error) {
    // Already connected
  }
  
  // Connect to Functions emulator
  try {
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  } catch (error) {
    // Already connected
  }
}

export { db, storage, functions, auth, GoogleAuthProvider };
