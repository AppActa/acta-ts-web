import { useEffect, useState } from "react";
import { listarPlanosPorCicloPg, listarUsuariosDaEmpresaPg, listarUsuariosDoCicloPg } from "../../../services/api/pg/dashboard.read.api";
import type { PlanoOpcaoCriarTarefaDo, ResponsavelOpcaoCriarTarefaDo } from "../components/FormularioCriarTarefaDo";

type Opcoes = { planos: readonly PlanoOpcaoCriarTarefaDo[]; responsaveis: readonly ResponsavelOpcaoCriarTarefaDo[] };
type Snapshot = { chave: string | null; estado: "carregando" | "erro" | "sucesso"; dados: Opcoes | null };
export type ResultadoOpcoesCriarTarefaDo =
  | { estado: "carregando" }
  | { estado: "indisponivel" }
  | { estado: "erro" }
  | { estado: "sucesso"; planos: readonly PlanoOpcaoCriarTarefaDo[]; responsaveis: readonly ResponsavelOpcaoCriarTarefaDo[] };
type Parametros = { uid: string | null; idEmpresa: number | null; idCiclo: number | null; habilitado: boolean };

function idPositivo(value: number | null): value is number {
  return value !== null && Number.isSafeInteger(value) && value > 0;
}

export function useOpcoesCriarTarefaDo({ uid, idEmpresa, idCiclo, habilitado }: Parametros): ResultadoOpcoesCriarTarefaDo {
  const chaveAtual = habilitado && uid && idPositivo(idEmpresa) && idPositivo(idCiclo)
    ? JSON.stringify([uid, idEmpresa, idCiclo]) : null;
  const [snapshot, setSnapshot] = useState<Snapshot>({ chave: null, estado: "carregando", dados: null });

  useEffect(() => {
    if (!chaveAtual || !uid || !idPositivo(idEmpresa) || !idPositivo(idCiclo)) {
      setSnapshot({ chave: null, estado: "erro", dados: null });
      return;
    }
    const controller = new AbortController();
    const idEmpresaValidado = idEmpresa;
    const idCicloValidado = idCiclo;
    setSnapshot({ chave: chaveAtual, estado: "carregando", dados: null });

    async function carregar() {
      try {
        const [planosRecebidos, membros, usuariosEmpresa] = await Promise.all([
          listarPlanosPorCicloPg(idCicloValidado, controller.signal),
          listarUsuariosDoCicloPg(idCicloValidado, controller.signal),
          listarUsuariosDaEmpresaPg(idEmpresaValidado, controller.signal),
        ]);
        if (controller.signal.aborted) return;
        if (planosRecebidos.some((plano) => plano.idCiclo !== idCicloValidado)
          || membros.some((membro) => membro.idCiclo !== idCicloValidado)
          || usuariosEmpresa.some((usuario) => usuario.idEmpresa !== idEmpresaValidado)
          || new Set(membros.map((membro) => membro.idUsuario)).size !== membros.length
          || new Set(usuariosEmpresa.map((usuario) => usuario.id)).size !== usuariosEmpresa.length) throw new Error("Associações inválidas.");

        const planos = planosRecebidos
          .filter((plano) => plano.status === "APROVADO" || plano.status === "EM_EXECUCAO")
          .map((plano) => ({ id: plano.id, nome: plano.nome, idCiclo: plano.idCiclo, status: plano.status }));
        const ativosPorId = new Map(usuariosEmpresa.filter((usuario) => usuario.status === "ATIVO").map((usuario) => [usuario.id, usuario]));
        const responsaveis = membros.flatMap((membro) => {
          const usuarioAtivo = ativosPorId.get(membro.idUsuario);
          return usuarioAtivo ? [{ id: usuarioAtivo.id, nome: usuarioAtivo.nome }] : [];
        });
        const dados = { planos, responsaveis };
        setSnapshot({ chave: chaveAtual, estado: "sucesso", dados });
      } catch {
        if (!controller.signal.aborted) {
          setSnapshot({ chave: chaveAtual, estado: "erro", dados: null });
          controller.abort();
        }
      }
    }

    void carregar();
    return () => controller.abort();
  }, [chaveAtual, habilitado, uid, idEmpresa, idCiclo]);

  if (!chaveAtual) return { estado: "indisponivel" };
  if (snapshot.chave !== chaveAtual || snapshot.estado === "carregando") return { estado: "carregando" };
  if (snapshot.estado === "erro" || !snapshot.dados) return { estado: "erro" };
  return { estado: "sucesso", planos: snapshot.dados.planos, responsaveis: snapshot.dados.responsaveis };
}
