import { useEffect, useState } from "react";
import { useAuth } from "../../../auth/AuthProvider";
import { listarCiclosPg, type CicloPg } from "../../../services/api/pg/dashboard.read.api";
import { HomePage, type DadosHomePage, type EtapaHome } from "./HomePage";

type EstadoCarregamento = "carregando" | "sucesso" | "erro";
type EstadoHome = { accountKey: string | null; estado: EstadoCarregamento; ciclos: CicloPg[] };

function montarDadosHome(nomeUsuario: string, ciclos: CicloPg[]): DadosHomePage {
  const etapas: EtapaHome[] = [
    { id: "plan", etapa: "Plan", titulo: "Planejamento", quantidade: ciclos.filter((ciclo) => ciclo.status === "PLANEJAMENTO").length },
    { id: "do", etapa: "Do", titulo: "Execução", quantidade: ciclos.filter((ciclo) => ciclo.status === "EXECUCAO").length },
    { id: "check", etapa: "Check", titulo: "Verificação", quantidade: ciclos.filter((ciclo) => ciclo.status === "VERIFICACAO").length },
    { id: "act", etapa: "Act", titulo: "Padronização", quantidade: ciclos.filter((ciclo) => ciclo.status === "PADRONIZACAO").length },
  ];

  return {
    nomeUsuario,
    tituloCiclos: "Ciclos da empresa",
    metricas: [
      { id: "ciclos", titulo: "Ciclos da empresa", valor: ciclos.length, contexto: "Ciclos cadastrados", variante: "ciclos" },
      { id: "atrasadas", titulo: "Tarefas atrasadas", valor: null, contexto: "Resumo ainda indisponível", variante: "atrasadas" },
      { id: "prazos", titulo: "Próximos prazos", valor: null, contexto: "Resumo ainda indisponível", variante: "prazos" },
    ],
    pendencias: null,
    ciclos: ciclos.map((ciclo) => ({ id: String(ciclo.id), titulo: ciclo.titulo, progresso: null, icone: null })),
    etapas,
  };
}

export function HomePageConectada() {
  const { firebaseUser, actaUser, loading: authLoading } = useAuth();
  const [estadoHome, setEstadoHome] = useState<EstadoHome>({ accountKey: null, estado: "carregando", ciclos: [] });

  const perfilAtivo = actaUser?.estadoPerfil === "PERFIL_CRIADO" && actaUser.status === "ATIVO";
  const idEmpresa = perfilAtivo ? actaUser.idEmpresa : null;
  const uid = firebaseUser?.uid ?? null;
  const accountKey = firebaseUser?.emailVerified && uid && idEmpresa && Number.isSafeInteger(idEmpresa) && idEmpresa > 0
    ? `${uid}:${idEmpresa}`
    : null;

  useEffect(() => {
    if (authLoading) {
      setEstadoHome({ accountKey: null, estado: "carregando", ciclos: [] });
      return;
    }

    if (!accountKey || !idEmpresa) {
      setEstadoHome({ accountKey: null, estado: "erro", ciclos: [] });
      return;
    }

    const controller = new AbortController();
    setEstadoHome({ accountKey, estado: "carregando", ciclos: [] });

    void listarCiclosPg(idEmpresa, controller.signal)
      .then((ciclos) => {
        if (!controller.signal.aborted) setEstadoHome({ accountKey, estado: "sucesso", ciclos });
      })
      .catch(() => {
        if (!controller.signal.aborted) setEstadoHome({ accountKey, estado: "erro", ciclos: [] });
      });

    return () => controller.abort();
  }, [authLoading, accountKey, idEmpresa]);

  if (authLoading) return <HomePage estado="carregando" />;
  if (!firebaseUser?.emailVerified || !actaUser || actaUser.estadoPerfil !== "PERFIL_CRIADO" || actaUser.status !== "ATIVO" || !accountKey || !idEmpresa) {
    return <HomePage estado="erro" />;
  }
  if (estadoHome.accountKey !== accountKey || estadoHome.estado === "carregando") return <HomePage estado="carregando" />;
  if (estadoHome.estado === "erro") return <HomePage estado="erro" />;

  return <HomePage dados={montarDadosHome(actaUser.nome, estadoHome.ciclos)} />;
}
