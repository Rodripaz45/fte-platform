// Configuración de Firebase
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Configuración de Firebase
// Las credenciales se obtienen de las variables de entorno para mayor seguridad
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validar que todas las variables de entorno estén configuradas
if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.storageBucket) {
  console.warn('⚠️ Firebase no está completamente configurado. Verifica las variables de entorno en .env.local');
}

// Inicializar Firebase solo una vez
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Obtener instancia de Storage
export const storage: FirebaseStorage = getStorage(app);

export default app;

