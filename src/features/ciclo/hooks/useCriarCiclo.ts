import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../components/auth/AuthProvider";
import { adicionarUsuarioAoCicloPg, criarCicloPg, type NovoCicloPg } from "../../../services/api/pg/ciclo.api";
import type { UsuarioDaEmpresaPg } from "../../../services/api/pg/dashboard.read.api";

export type ResultadoCriacaoCiclo = "criado" | "criado-com-falha-na-equipe";

export function useCriarCiclo() {
  const { actaUser } = useAuth();
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState("");
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  async function executar(
    dados: Omit<NovoCicloPg, "idGestor">,
    colaboradores: readonly UsuarioDaEmpresaPg[],
  ): Promise<ResultadoCriacaoCiclo | null> {
    setErro("");
    if (!actaUser || actaUser.estadoPerfil !== "PERFIL_CRIADO" || !actaUser.permissaoGestor) {
      setErro("A criação de ciclos está disponível somente para gestores.");
      return null;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setCriando(true);
    try {
      const ciclo = await criarCicloPg({ ...dados, idGestor: actaUser.idUsuario }, actaUser.idEmpresa, controller.signal);
      const usuarios = [
        { idUsuario: actaUser.idUsuario, nome: actaUser.nome, papelCiclo: "RESPONSAVEL" as const },
        ...colaboradores.map((usuario) => ({ idUsuario: usuario.id, nome: usuario.nome, papelCiclo: "PARTICIPANTE" as const })),
      ];
      const vinculos = await Promise.allSettled(usuarios.map((usuario) =>
        adicionarUsuarioAoCicloPg(ciclo.id, usuario.idUsuario, usuario.nome, usuario.papelCiclo, controller.signal),
      ));
      return vinculos.some((vinculo) => vinculo.status === "rejected")
        ? "criado-com-falha-na-equipe"
        : "criado";
    } catch (cause) {
      if (!controller.signal.aborted) setErro(cause instanceof Error ? cause.message : "Não foi possível criar o ciclo. Tente novamente.");
      return null;
    } finally {
      if (!controller.signal.aborted) setCriando(false);
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }

  return { criando, erro, executar };
}
