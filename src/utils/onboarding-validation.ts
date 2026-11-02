import type { Endereco, Empresa, Gestor } from "../types/empresa";

export type CampoOnboarding = keyof Gestor | keyof Empresa | keyof Endereco;
export type ErrosOnboarding = Partial<Record<CampoOnboarding | "codigo", string>> & Record<string, string | undefined>;
export type CampoEnderecoViaCep = "uf" | "cidade" | "bairro" | "logradouro";

export const digitos = (valor: string): string => valor.replace(/\D/g, "");
export const mascaraCpf = (valor: string): string => digitos(valor).slice(0, 11)
  .replace(/^(\d{3})(\d)/, "$1.$2").replace(/^(\d{3}\.\d{3})(\d)/, "$1.$2")
  .replace(/^(\d{3}\.\d{3}\.\d{3})(\d)/, "$1-$2");
export const mascaraCnpj = (valor: string): string => digitos(valor).slice(0, 14)
  .replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2}\.\d{3})(\d)/, "$1.$2")
  .replace(/^(\d{2}\.\d{3}\.\d{3})(\d)/, "$1/$2").replace(/(\d{4})(\d{1,2})$/, "$1-$2");
export const mascaraCep = (valor: string): string => digitos(valor).slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");
export const mascaraTelefone = (valor: string): string => {
  const numero = digitos(valor).slice(0, 11);
  return numero.length <= 10
    ? numero.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d{1,4})$/, "$1-$2")
    : numero.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2");
};

export const emailValido = (valor: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);

export const hojeLocal = (): string => {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
};
export const ontemLocal = (): string => {
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);
  return `${ontem.getFullYear()}-${String(ontem.getMonth() + 1).padStart(2, "0")}-${String(ontem.getDate()).padStart(2, "0")}`;
};

export function documentoValido(valor: string, tamanho: 11 | 14): boolean {
  const documento = digitos(valor);
  if (documento.length !== tamanho || /^(\d)\1+$/.test(documento)) return false;
  const digito = (base: string, pesos: number[]): number => {
    const resto = base.split("").reduce((soma, n, i) => soma + Number(n) * pesos[i], 0) % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  return tamanho === 11
    ? Number(documento[9]) === digito(documento.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2])
      && Number(documento[10]) === digito(documento.slice(0, 10), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2])
    : Number(documento[12]) === digito(documento.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
      && Number(documento[13]) === digito(documento.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
}

function dataValida(valor: string, deveSerPassada: boolean): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const data = new Date(`${valor}T12:00:00`);
  return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === valor
    && (deveSerPassada ? valor < hojeLocal() : valor <= hojeLocal());
}

const estados = new Set("AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" "));

export function validarGestor(gestor: Gestor, cnpj: string, emailConta: string): ErrosOnboarding {
  const erros: ErrosOnboarding = {};
  if (!documentoValido(gestor.cpf, 11)) erros.cpf = "Informe um CPF válido.";
  for (const [campo, limite] of [["nome", 160], ["cargo", 100], ["area", 100]] as const) {
    if (!gestor[campo].trim() || gestor[campo].length > limite) erros[campo] = `Campo obrigatório, até ${limite} caracteres.`;
  }
  if (!dataValida(gestor.dataNascimento, true)) erros.dataNascimento = "Informe uma data de nascimento passada.";
  if (!dataValida(gestor.dataContratacao, false)) erros.dataContratacao = "A contratação deve ser hoje ou anterior.";
  if (!emailValido(emailConta) || emailConta.length > 254) erros.email = "Informe um endereço de e-mail válido para sua conta.";
  if (!documentoValido(cnpj, 14)) erros.cnpj = "Informe um CNPJ válido.";
  return erros;
}

export function validarEmpresa(empresa: Empresa): ErrosOnboarding {
  const erros: ErrosOnboarding = {};
  if (!documentoValido(empresa.cnpj, 14)) erros.cnpj = "Informe um CNPJ válido.";
  for (const [campo, limite] of [["nome", 160], ["setorEmpresa", 100]] as const) {
    if (!empresa[campo].trim() || empresa[campo].length > limite) erros[campo] = `Campo obrigatório, até ${limite} caracteres.`;
  }
  if (!emailValido(empresa.emailEmpresa) || empresa.emailEmpresa.length > 254) erros.emailEmpresa = "Informe um e-mail válido de até 254 caracteres.";
  if (![10, 11].includes(digitos(empresa.telefoneEmpresa).length)) erros.telefoneEmpresa = "Informe 10 ou 11 dígitos.";
  return erros;
}

export function validarEndereco(endereco: Endereco): ErrosOnboarding {
  const erros: ErrosOnboarding = {};
  for (const [campo, limite] of [["cidade", 100], ["bairro", 100], ["logradouro", 180], ["numeroEndereco", 20]] as const) {
    if (!endereco[campo].trim() || endereco[campo].length > limite) erros[campo] = `Campo obrigatório, até ${limite} caracteres.`;
  }
  if (digitos(endereco.cep).length !== 8) erros.cep = "Informe 8 dígitos.";
  if (!estados.has(endereco.uf.toUpperCase())) erros.uf = "Informe uma sigla de estado válida.";
  if ((endereco.complemento?.length ?? 0) > 1000) erros.complemento = "Máximo de 1000 caracteres.";
  return erros;
}
