export interface PaginaOnboardingProps { pendente?: boolean }
export interface Gestor { cpf: string; nome: string; cargo: string; area: string; dataNascimento: string; dataContratacao: string; email: string }
export interface Empresa { cnpj: string; nome: string; tamanhoEmpresa: "PEQUENA" | "MEDIA" | "GRANDE"; setorEmpresa: string; emailEmpresa: string; telefoneEmpresa: string }
export interface Endereco { cep: string; uf: string; cidade: string; bairro: string; logradouro: string; numeroEndereco: string; complemento: string | null }
export interface ResultadoOnboarding {
  empresaExistente: boolean;
  conviteEnviado: boolean;
  proximaEtapa: boolean;
  idEmpresa: number | null;
  statusEmpresa: string | null;
  idUsuario: number | null;
  tipoUsuario: string | null;
  statusUsuario: string | null;
  mensagem?: string | null;
}
export interface EnderecoViaCep { cep: string; logradouro: string; bairro: string; localidade: string; uf: string; erro?: boolean }
