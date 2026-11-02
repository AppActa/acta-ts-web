import type { EnderecoViaCep } from "../../types/empresa";

export async function buscarEnderecoPorCep(cep: string, signal: AbortSignal): Promise<EnderecoViaCep | null> {
  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${encodeURIComponent(cep)}/json/`, {
      signal,
      headers: { Accept: "application/json" },
    });
    if (!resposta.ok) throw new Error(`ViaCEP respondeu ${resposta.status}.`);

    const dados: unknown = await resposta.json();
    if (!dados || typeof dados !== "object" || Array.isArray(dados)) throw new Error("Resposta inválida do ViaCEP.");
    const endereco = dados as Record<string, unknown>;
    if (endereco.erro === true) return null;
    if (typeof endereco.cep !== "string" || typeof endereco.logradouro !== "string"
      || typeof endereco.bairro !== "string" || typeof endereco.localidade !== "string"
      || typeof endereco.uf !== "string" || (endereco.erro !== undefined && endereco.erro !== false)) {
      throw new Error("Resposta inválida do ViaCEP.");
    }
    return {
      cep: endereco.cep,
      logradouro: endereco.logradouro,
      bairro: endereco.bairro,
      localidade: endereco.localidade,
      uf: endereco.uf,
    };
  } catch (cause) {
    if (signal.aborted || (cause instanceof DOMException && cause.name === "AbortError")) throw cause;
    throw new Error("Não foi possível consultar o CEP.");
  }
}
