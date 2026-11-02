import { env } from "../../../config/env";
import { httpClient } from "../../http/client";

const PG_ORIGIN = "https://acta-pg-api.34-232-250-240.sslip.io";

function urlUsuario(idUsuario: number): URL {
  if (!Number.isSafeInteger(idUsuario) || idUsuario <= 0) throw new Error("Identificador de usuário inválido.");
  try {
    const base = new URL(env.apiPgUrl);
    if (base.protocol !== "https:" || base.origin !== PG_ORIGIN || base.username || base.password
      || base.search || base.hash || (base.pathname !== "/" && base.pathname !== "")) throw new Error();
    return new URL(`/api/v1/usuario/${idUsuario}`, base.origin);
  } catch {
    throw new Error("Não foi possível conectar à pg-api.");
  }
}

export async function buscarFotoUsuarioPg(idUsuario: number): Promise<string | null> {
  const usuario = await httpClient<{ fotoUrl?: unknown }>(urlUsuario(idUsuario), {
    method: "GET",
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  return typeof usuario.fotoUrl === "string" && usuario.fotoUrl.trim() ? usuario.fotoUrl.trim() : null;
}

export async function atualizarFotoUsuarioPg(idUsuario: number, fotoUrl: string): Promise<void> {
  await httpClient(urlUsuario(idUsuario), {
    method: "PATCH",
    body: JSON.stringify({ fotoUrl }),
    signal: AbortSignal.timeout(20_000),
  });
}
