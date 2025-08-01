import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.next_public_firebase_api_key,
  authDomain: process.env.next_public_firebase_auth_domain,
  projectId: process.env.next_public_firebase_project_id,
  storageBucket: process.env.next_public_firebase_storage_bucket,
  messagingSenderId: process.env.next_public_firebase_messaging_sender_id,
  appId: process.env.next_public_firebase_app_id,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
