export type EnderecoViaCep = {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
};

export async function buscarEnderecoPorCep(cep: string, signal: AbortSignal): Promise<EnderecoViaCep | null> {
  const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!resposta.ok) throw new Error(`ViaCEP respondeu ${resposta.status}.`);

  const dados = (await resposta.json()) as EnderecoViaCep;
  return dados.erro ? null : dados;
}