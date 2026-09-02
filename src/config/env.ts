export const env = {
  apiPgUrl: import.meta.env.VITE_API_PG_URL ?? "",
  apiImportUrl: import.meta.env.VITE_API_IMPORT_URL ?? "",
  apiMongoUrl: import.meta.env.VITE_API_MONGO_URL ?? "",
} as const;
