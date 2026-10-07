import type { CurrentUser } from "../../../contracts/auth";
import { env } from "../../../config/env";
import { httpClient } from "../../http/client";

export function getCurrentActaUser() {
  const apiUrl = env.apiPgUrl.replace(/\/+$/, "");
  return httpClient<CurrentUser>(`${apiUrl}/api/v1/me`, {
    signal: AbortSignal.timeout(15_000),
  });
}