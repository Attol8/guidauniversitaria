import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';
import 'firebase/functions';

// Configuration details
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

console.log("Using Firebase Config:", firebaseConfig);

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // if already initialized, use that one
}

const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();
const functions = firebase.functions();

// Connect to Firebase emulators in development environment
if (process.env.NODE_ENV === 'development') {
  db.settings({
    host: "localhost:8080",  // Firestore emulator
    ssl: false
  });

  auth.useEmulator("http://localhost:9099");  // Authentication emulator
  storage.useEmulator("localhost", 9199);  // Storage emulator
  functions.useEmulator("localhost", 5001);  // Functions emulator
}

export { db, auth, storage, functions };
