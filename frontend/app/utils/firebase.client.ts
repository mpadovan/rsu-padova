import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User
} from "firebase/auth";

export type AuthState = {
  user: User | null;
  loading: boolean;
  error?: string;
};

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  allowedDomains: string[];
};

let app: FirebaseApp | undefined;

export function initFirebase(config: FirebaseConfig) {
  if (!app) {
    app = initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      appId: config.appId
    });
  }
  return app;
}

export async function signInWithGoogleDomain(config: FirebaseConfig) {
  const firebaseApp = initFirebase(config);
  const auth = getAuth(firebaseApp);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const result = await signInWithPopup(auth, provider);
  const email = result.user.email ?? "";
  const domain = email.split("@")[1] ?? "";
  if (config.allowedDomains.length > 0 && !config.allowedDomains.includes(domain)) {
    await signOut(auth);
    throw new Error("Dominio email non autorizzato");
  }
  return result.user;
}

export function listenToAuthChanges(config: FirebaseConfig, callback: (state: AuthState) => void) {
  const firebaseApp = initFirebase(config);
  const auth = getAuth(firebaseApp);
  callback({ user: auth.currentUser, loading: true });
  return onAuthStateChanged(
    auth,
    (user) => callback({ user, loading: false }),
    (error) => callback({ user: null, loading: false, error: error.message })
  );
}

export async function logout(config: FirebaseConfig) {
  const firebaseApp = initFirebase(config);
  const auth = getAuth(firebaseApp);
  await signOut(auth);
}
