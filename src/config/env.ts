export const env = {
  apiPgUrl: import.meta.env.VITE_API_PG_URL ?? "",
  apiImportUrl: import.meta.env.VITE_API_IMPORT_URL ?? "",
  apiMongoUrl: import.meta.env.VITE_API_MONGO_URL ?? "",
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "",
  },
} as const;