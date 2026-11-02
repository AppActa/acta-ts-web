import { useEffect, useState } from "react";
import { listarUsuariosDaEmpresaPg, type UsuarioDaEmpresaPg } from "../../../services/api/pg/dashboard.read.api";

export type ResultadoUsuariosDaEmpresa =
  | { estado: "carregando"; usuarios: readonly UsuarioDaEmpresaPg[] }
  | { estado: "erro"; usuarios: readonly UsuarioDaEmpresaPg[] }
  | { estado: "sucesso"; usuarios: readonly UsuarioDaEmpresaPg[] };

export function useUsuariosDaEmpresa(ativo: boolean, idEmpresa: number | null, chave: string | null): ResultadoUsuariosDaEmpresa {
  const [snapshot, setSnapshot] = useState<{ chave: string | null; resultado: ResultadoUsuariosDaEmpresa }>({
    chave: null,
    resultado: { estado: "carregando", usuarios: [] },
  });

  useEffect(() => {
    if (!ativo || !idEmpresa || !chave) {
      setSnapshot({ chave: null, resultado: { estado: "erro", usuarios: [] } });
      return;
    }
    const controller = new AbortController();
    setSnapshot({ chave, resultado: { estado: "carregando", usuarios: [] } });
    void listarUsuariosDaEmpresaPg(idEmpresa, controller.signal)
      .then((usuarios) => {
        if (!controller.signal.aborted) setSnapshot({ chave, resultado: { estado: "sucesso", usuarios } });
      })
      .catch(() => {
        if (!controller.signal.aborted) setSnapshot({ chave, resultado: { estado: "erro", usuarios: [] } });
      });
    return () => controller.abort();
  }, [ativo, idEmpresa, chave]);

  if (!ativo || !chave || !idEmpresa) return { estado: "erro", usuarios: [] };
  if (snapshot.chave !== chave) return { estado: "carregando", usuarios: [] };
  return snapshot.resultado;
}
