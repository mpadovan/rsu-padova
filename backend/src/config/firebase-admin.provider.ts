import { Provider } from '@nestjs/common';
import { initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export const FIREBASE_APP = 'FIREBASE_APP';
export const FIRESTORE = 'FIRESTORE';

function buildFirebaseConfig() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return undefined;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin credentials.');
  }

  return {
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  };
}

export const firebaseProviders: Provider[] = [
  {
    provide: FIREBASE_APP,
    useFactory: (): App => {
      const config = buildFirebaseConfig();
      return initializeApp(config);
    },
  },
  {
    provide: FIRESTORE,
    inject: [FIREBASE_APP],
    useFactory: (app: App) => getFirestore(app),
  },
];
