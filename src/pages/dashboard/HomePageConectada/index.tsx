import { useEffect, useState } from "react";
import { useAuth } from "../../../components/auth/AuthProvider";
import {
  listarCiclosPg,
  listarPlanosPorCicloPg,
  listarTarefasPorPlanoPg,
  obterAvancoCicloPg,
  type CicloPg,
  type TarefaDoPlanoPg,
} from "../../../services/api/pg/dashboard.read.api";
import { HomePage } from "../HomePage";
import type { DadosHomePage, EtapaHome, PendenciaHome } from "../../../types/dashboard";

const DIAS_PARA_PROXIMO_PRAZO = 7;
const LIMITE_PENDENCIAS_HOME = 5;

type EstadoCarregamento = "carregando" | "sucesso" | "erro";
type TarefaComCiclo = { ciclo: CicloPg; tarefa: TarefaDoPlanoPg };
type EstadoHome = { accountKey: string | null; estado: EstadoCarregamento; ciclos: CicloPg[]; tarefas: TarefaComCiclo[] | null; avancos: Record<number, number | null> };

function dataLocal(valor: string | null): Date | null {
  if (!valor) return null;

  const partes = valor.includes("/") ? valor.split("/").reverse() : valor.split("-");
  const [ano, mes, dia] = partes.map(Number);
  const data = new Date(ano, mes - 1, dia);

  if (Number.isNaN(data.getTime()) || data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) return null;

  return data;
}

function inicioDoDia(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), data.getDate());
}

function formatarPrazo(valor: string | null): string {
  const data = dataLocal(valor);
  if (!data) return "Prazo não informado";

  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(data).replace(".", "");
}

function estaAberta({ tarefa }: TarefaComCiclo): boolean {
  return tarefa.status !== "CONCLUIDA" && tarefa.status !== "CANCELADA";
}

function estaAtrasada(item: TarefaComCiclo, hoje: Date): boolean {
  const prazo = dataLocal(item.tarefa.dataFimPrevista);

  return item.tarefa.status === "ATRASADA" || (estaAberta(item) && prazo !== null && inicioDoDia(prazo) < hoje);
}

function estaNoPrazoDaSemana(item: TarefaComCiclo, hoje: Date): boolean {
  const prazo = dataLocal(item.tarefa.dataFimPrevista);
  const limite = new Date(hoje);
  limite.setDate(limite.getDate() + DIAS_PARA_PROXIMO_PRAZO);

  return estaAberta(item) && !estaAtrasada(item, hoje) && prazo !== null && prazo >= hoje && prazo <= limite;
}

function montarPendencias(tarefas: TarefaComCiclo[], hoje: Date): PendenciaHome[] {
  return tarefas
    .filter(estaAberta)
    .sort((primeira, segunda) => {
      const primeiraAtrasada = estaAtrasada(primeira, hoje);
      const segundaAtrasada = estaAtrasada(segunda, hoje);

      if (primeiraAtrasada !== segundaAtrasada) return primeiraAtrasada ? -1 : 1;

      return (dataLocal(primeira.tarefa.dataFimPrevista)?.getTime() ?? Number.MAX_SAFE_INTEGER)
        - (dataLocal(segunda.tarefa.dataFimPrevista)?.getTime() ?? Number.MAX_SAFE_INTEGER);
    })
    .slice(0, LIMITE_PENDENCIAS_HOME)
    .map(({ ciclo, tarefa }) => {
      const atrasada = estaAtrasada({ ciclo, tarefa }, hoje);

      return {
        id: `${ciclo.id}:${tarefa.id}`,
        titulo: tarefa.titulo,
        detalhe: `${ciclo.titulo} · ${formatarPrazo(tarefa.dataFimPrevista)}`,
        estado: atrasada ? "Atrasada" : tarefa.status === "EM_ANDAMENTO" ? "Em andamento" : "Pendente",
        variante: atrasada ? "atrasada" : tarefa.status === "EM_ANDAMENTO" ? "aguardando" : "pendente",
      };
    });
}

function montarDadosHome(nomeUsuario: string, ciclos: CicloPg[], tarefasCarregadas: TarefaComCiclo[] | null, idUsuario: number, avancos: Record<number, number | null>): DadosHomePage {
  const hoje = inicioDoDia(new Date());
  const tarefas = tarefasCarregadas ?? [];
  const tarefasDisponiveis = tarefasCarregadas !== null;
  const tarefasAtrasadas = tarefas.filter((item) => estaAtrasada(item, hoje)).length;
  const tarefasComPrazoProximo = tarefas.filter((item) => estaNoPrazoDaSemana(item, hoje)).length;
  const etapas: EtapaHome[] = [
    { id: "plan", etapa: "Plan", titulo: "Planejamento", quantidade: ciclos.filter((ciclo) => ciclo.status === "PLANEJAMENTO").length },
    { id: "do", etapa: "Do", titulo: "Execução", quantidade: ciclos.filter((ciclo) => ciclo.status === "EXECUCAO").length },
    { id: "check", etapa: "Check", titulo: "Verificação", quantidade: ciclos.filter((ciclo) => ciclo.status === "VERIFICACAO").length },
    { id: "act", etapa: "Act", titulo: "Padronização", quantidade: ciclos.filter((ciclo) => ciclo.status === "PADRONIZACAO").length },
  ];

  return {
    nomeUsuario,
    tituloCiclos: "Meus ciclos",
    metricas: [
      { id: "ciclos", titulo: "Ciclos da empresa", valor: ciclos.length, contexto: "Ciclos cadastrados", variante: "ciclos" },
      { id: "atrasadas", titulo: "Tarefas atrasadas", valor: tarefasDisponiveis ? tarefasAtrasadas : null, contexto: tarefasDisponiveis ? "Em todos os ciclos" : "Resumo indisponível", variante: "atrasadas" },
      { id: "prazos", titulo: "Próximos prazos", valor: tarefasDisponiveis ? tarefasComPrazoProximo : null, contexto: tarefasDisponiveis ? "Nos próximos " + DIAS_PARA_PROXIMO_PRAZO + " dias" : "Resumo indisponível", variante: "prazos" },
    ],
    pendencias: tarefasDisponiveis ? montarPendencias(tarefas.filter(({ tarefa }) => tarefa.idResponsavel === idUsuario), hoje) : null,
    ciclos: ciclos.map((ciclo) => ({ id: String(ciclo.id), titulo: ciclo.titulo, progresso: avancos[ciclo.id] ?? null, icone: null })),
    etapas,
  };
}

async function carregarTarefas(ciclos: CicloPg[], signal: AbortSignal): Promise<TarefaComCiclo[]> {
  const tarefasPorCiclo: TarefaComCiclo[][] = ciclos.map(() => []);
  let proximoIndice = 0;

  async function carregarCiclo(): Promise<void> {
    while (!signal.aborted) {
      const indice = proximoIndice++;
      if (indice >= ciclos.length) return;

      const ciclo = ciclos[indice];
      const planos = await listarPlanosPorCicloPg(ciclo.id, signal);
      if (planos.some((plano) => plano.idCiclo !== ciclo.id)) throw new Error("Associação de planos inválida.");

      const tarefasDosPlanos = await Promise.all(planos.map(async (plano) => {
        const tarefasDoPlano = await listarTarefasPorPlanoPg(plano.id, signal);
        if (tarefasDoPlano.some((tarefa) => tarefa.idPlanoAcao !== plano.id)) throw new Error("Associação de tarefas inválida.");

        return tarefasDoPlano.map((tarefa) => ({ ciclo, tarefa }));
      }));

      tarefasPorCiclo[indice].push(...tarefasDosPlanos.flat());
    }
  }

  await Promise.all(Array.from({ length: Math.min(3, ciclos.length) }, () => carregarCiclo()));

  return tarefasPorCiclo.flat();
}

async function carregarAvancos(ciclos: CicloPg[], signal: AbortSignal): Promise<Record<number, number | null>> {
  const avancos: Record<number, number | null> = Object.fromEntries(ciclos.map((ciclo) => [ciclo.id, null]));
  let proximoIndice = 0;

  async function carregarCiclo(): Promise<void> {
    while (!signal.aborted) {
      const ciclo = ciclos[proximoIndice++];
      if (!ciclo) return;

      try {
        avancos[ciclo.id] = await obterAvancoCicloPg(ciclo.id, signal);
      } catch {
        if (signal.aborted) return;
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(3, ciclos.length) }, () => carregarCiclo()));

  return avancos;
}

export function HomePageConectada() {
  const { firebaseUser, actaUser, loading: authLoading } = useAuth();
  const [estadoHome, setEstadoHome] = useState<EstadoHome>({ accountKey: null, estado: "carregando", ciclos: [], tarefas: [], avancos: {} });

  const perfilAtivo = actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO";
  const idEmpresa = perfilAtivo ? actaUser.idEmpresa : null;
  const uid = firebaseUser?.uid ?? null;
  const accountKey = firebaseUser?.emailVerified && uid && idEmpresa && Number.isSafeInteger(idEmpresa) && idEmpresa > 0
    ? `${uid}:${idEmpresa}`
    : null;

  useEffect(() => {
    if (authLoading) {
      setEstadoHome({ accountKey: null, estado: "carregando", ciclos: [], tarefas: [], avancos: {} });
      return;
    }

    if (!accountKey || !idEmpresa) {
      setEstadoHome({ accountKey: null, estado: "erro", ciclos: [], tarefas: [], avancos: {} });
      return;
    }

    const controller = new AbortController();
    setEstadoHome({ accountKey, estado: "carregando", ciclos: [], tarefas: [], avancos: {} });

    void listarCiclosPg(idEmpresa, controller.signal)
      .then(async (ciclos) => ({
        ciclos,
        tarefas: await carregarTarefas(ciclos, controller.signal).catch(() => null),
        avancos: await carregarAvancos(ciclos, controller.signal),
      }))
      .then(({ ciclos, tarefas, avancos }) => {
        if (!controller.signal.aborted) setEstadoHome({ accountKey, estado: "sucesso", ciclos, tarefas, avancos });
      })
      .catch(() => {
        if (!controller.signal.aborted) setEstadoHome({ accountKey, estado: "erro", ciclos: [], tarefas: [], avancos: {} });
      });

    return () => controller.abort();
  }, [authLoading, accountKey, idEmpresa]);

  if (authLoading) return <HomePage estado="carregando" />;
  if (!firebaseUser?.emailVerified || !actaUser || actaUser.estadoPerfil !== "PERFIL_CRIADO" || actaUser.status !== "ATIVO" || !accountKey || !idEmpresa) {
    return <HomePage estado="erro" />;
  }
  if (estadoHome.accountKey !== accountKey || estadoHome.estado === "carregando") return <HomePage estado="carregando" />;
  if (estadoHome.estado === "erro") return <HomePage estado="erro" />;

  return <HomePage dados={montarDadosHome(actaUser.nome, estadoHome.ciclos, estadoHome.tarefas, actaUser.idUsuario, estadoHome.avancos)} />;
}
