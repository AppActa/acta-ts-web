import { httpClient } from "../../http/client";
import { authApiBaseUrl } from "./auth.api";
import type { Empresa, Endereco, Gestor, ResultadoOnboarding } from "../../../types/empresa";

export const iniciarOnboarding = (gestor: Gestor, cnpj: string): Promise<ResultadoOnboarding> =>
  httpClient<ResultadoOnboarding>(`${authApiBaseUrl()}/api/v1/onboarding/inicio`, { method: "POST", body: JSON.stringify({ gestor, cnpj }), signal: AbortSignal.timeout(20_000) });
export const cadastrarGestor = (gestor: Gestor, empresa: Empresa, endereco: Endereco): Promise<ResultadoOnboarding> =>
  httpClient<ResultadoOnboarding>(`${authApiBaseUrl()}/api/v1/onboarding/gestor`, { method: "POST", body: JSON.stringify({ gestor, empresa, endereco }), signal: AbortSignal.timeout(20_000) });
