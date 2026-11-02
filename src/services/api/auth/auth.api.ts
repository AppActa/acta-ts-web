import type { CurrentUser } from "../../../types/auth";
import { env } from "../../../config/env";
import { ApiError, httpClient } from "../../http/client";

export function authApiBaseUrl(): string {
  try {
    const configured = env.apiAuthUrl;
    if (!configured || configured.trim() !== configured) throw new Error();
    const url = new URL(configured);
    const httpLocalhost = import.meta.env.DEV && url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname);
    if ((url.protocol !== "https:" && !httpLocalhost) || url.username || url.password
      || /[?#]/.test(configured) || url.search || url.hash || (url.pathname !== "/" && url.pathname !== "")) throw new Error();
    return url.origin;
  } catch {
    throw new ApiError("A URL da API de autenticação não está configurada ou não é válida.", 0);
  }
}

export async function getCurrentActaUser(): Promise<CurrentUser> {
  return httpClient<CurrentUser>(`${authApiBaseUrl()}/api/v1/me`, {
    signal: AbortSignal.timeout(15_000),
  });
}
