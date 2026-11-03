import { authApiBaseUrl } from "./auth.api";
import { httpClient } from "../../http/client";

export type DadosConvite = {
  cpf: string; nome: string; cargo: string; area: string;
  dataNascimento: string; dataContratacao: string; permissaoGestor: boolean;
  email: string; telefone: string; tipo: "COLABORADOR" | "GESTOR";
};

export class ConviteRespostaInvalida extends Error {}

export async function convidarColaborador(dados: DadosConvite, idEmpresa: number, signal: AbortSignal): Promise<{ idUsuario: number; nome: string }> {
  if (!Number.isSafeInteger(idEmpresa) || idEmpresa <= 0 || !/^\d{11}$/.test(dados.cpf) || !/^\d{9,11}$/.test(dados.telefone)
    || !dados.nome.trim() || !dados.cargo.trim() || !dados.area.trim() || !dados.email.trim()
    || !/^\d{4}-\d{2}-\d{2}$/.test(dados.dataNascimento) || !/^\d{4}-\d{2}-\d{2}$/.test(dados.dataContratacao)
    || !["COLABORADOR", "GESTOR"].includes(dados.tipo)) throw new Error("Dados inválidos.");
  const resposta: unknown = await httpClient(`${authApiBaseUrl()}/api/v1/empresas/me/convites`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dados), signal, retryOnUnauthorized: false, expectedStatus: 201,
  });
  if (typeof resposta !== "object" || resposta === null || !("idUsuario" in resposta) || typeof resposta.idUsuario !== "number"
    || !Number.isSafeInteger(resposta.idUsuario) || resposta.idUsuario <= 0 || !("idEmpresa" in resposta) || resposta.idEmpresa !== idEmpresa
    || !("nome" in resposta) || resposta.nome !== dados.nome || !("status" in resposta) || resposta.status !== "PENDENTE") throw new ConviteRespostaInvalida();
  return { idUsuario: resposta.idUsuario, nome: dados.nome };
}
