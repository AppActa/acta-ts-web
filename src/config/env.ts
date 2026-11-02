export const env = {
  apiAuthUrl: import.meta.env.VITE_API_AUTH_URL ?? "",
  apiPgUrl: import.meta.env.VITE_API_PG_URL ?? "",
  apiImportUrl: import.meta.env.VITE_API_IMPORT_URL ?? "",
  apiMongoUrl: import.meta.env.VITE_API_MONGO_URL ?? "",
  apiCatoUrl: import.meta.env.VITE_API_CATO_URL || (
    import.meta.env.DEV ? "/api/cato" : "https://acta-ai.34-232-250-240.sslip.io"
  ),
  cloudinaryCloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? "",
  cloudinaryUploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? "",
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "",
  },
} as const;
