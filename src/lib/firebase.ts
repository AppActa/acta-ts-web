import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { env } from "../config/env";

const firebaseApp = getApps().length ? getApp() : initializeApp(env.firebase);
export const auth = getAuth(firebaseApp);