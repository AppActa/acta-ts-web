export type VarianteMetricaHome = "ciclos" | "atrasadas" | "prazos";
export type IconeCicloHome = "tempo" | "estoque" | "equipe" | "protecao" | "aprovacao";
export type VariantePendenciaHome = "aguardando" | "atrasada" | "pendente";

export interface MetricaHome {
  id: string;
  titulo: string;
  valor: number | null;
  contexto: string;
  variante: VarianteMetricaHome;
}
export interface PendenciaHome { id: string; titulo: string; detalhe: string; estado: string; variante: VariantePendenciaHome }
export interface CicloHome { id: string; titulo: string; progresso: number | null; icone: IconeCicloHome | null }
export interface EtapaHome { id: string; etapa: string; titulo: string; quantidade: number }
export interface DadosHomePage {
  nomeUsuario: string;
  metricas: readonly [MetricaHome, MetricaHome, MetricaHome];
  pendencias: readonly PendenciaHome[] | null;
  ciclos: readonly CicloHome[];
  etapas: readonly EtapaHome[];
  tituloCiclos?: string;
}
export interface HomePageProps { dados?: DadosHomePage | null; estado?: "carregando" | "erro" | "cancelado" }
