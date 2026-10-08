import type { CurrentUser } from "../../../contracts/auth";
import { env } from "../../../config/env";
import { httpClient } from "../../http/client";

export type Gestor = { cpf: string; nome: string; cargo: string; area: string; dataNascimento: string; dataContratacao: string; email: string };
export type Empresa = { cnpj: string; nome: string; tamanhoEmpresa: "PEQUENA" | "MEDIA" | "GRANDE"; setorEmpresa: string; emailEmpresa: string; telefoneEmpresa: string };
export type Endereco = { cep: string; uf: string; cidade: string; bairro: string; logradouro: string; numeroEndereco: string; complemento: string | null };
export type ResultadoOnboarding = {
  empresaExistente: boolean; conviteEnviado: boolean; proximaEtapa: boolean;
  idEmpresa: number | null; statusEmpresa: string | null; idUsuario: number | null;
  tipoUsuario: string | null; statusUsuario: string | null;
};

const base = `${env.apiPgUrl.replace(/\/+$/, "")}/api/v1`;
export const iniciarOnboarding = (gestor: Gestor, cnpj: string) =>
  httpClient<ResultadoOnboarding>(`${base}/onboarding/inicio`, { method: "POST", body: JSON.stringify({ gestor, cnpj }), signal: AbortSignal.timeout(20_000) });
export const cadastrarGestor = (gestor: Gestor, empresa: Empresa, endereco: Endereco) =>
  httpClient<ResultadoOnboarding>(`${base}/onboarding/gestor`, { method: "POST", body: JSON.stringify({ gestor, empresa, endereco }), signal: AbortSignal.timeout(20_000) });