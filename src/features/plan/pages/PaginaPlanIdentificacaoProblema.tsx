import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PainelCicloPlanDo } from "../../ciclo/components/PainelCicloPlanDo";
import "../../perfil/styles/pagina-perfil.css";
import "../../ciclo/styles/painel-ciclo-plan-do.css";
import "../styles/pagina-plan-identificacao-problema.css";

const historico = [
  ["Abr 2026", "10,2%"], ["Mai 2026", "9,6%"], ["Jun 2026", "8,4%"],
  ["Jul 2026", "7,6%"], ["Ago 2026", "6,8%"], ["Set 2026", "4,1%"],
];

export function PaginaPlanIdentificacaoProblema() {
  const { cicloId } = useParams();
  const [arquivo, setArquivo] = useState("");
  const [salvo, setSalvo] = useState(false);
  const [sugestoes, setSugestoes] = useState([
    { texto: "Novos colaboradores não concluem o onboarding no prazo.", aceita: false },
    { texto: "Leitores de código falham em picos de operação.", aceita: false },
  ]);

  function atualizarSugestao(index: number, acao: "aceitar" | "remover") {
    setSugestoes((atuais) => acao === "remover"
      ? atuais.filter((_, itemIndex) => itemIndex !== index)
      : atuais.map((item, itemIndex) => itemIndex === index ? { ...item, aceita: !item.aceita } : item));
  }

  function editarSugestao(index: number) {
    const texto = window.prompt("Edite a sugestão", sugestoes[index]?.texto);
    if (texto?.trim()) {
      setSugestoes((atuais) => atuais.map((item, itemIndex) => itemIndex === index ? { ...item, texto: texto.trim() } : item));
    }
  }

  return (
    <main className="pagina-ciclo-plan-do pagina-ciclo-plan pagina-plan-identificacao">
      <PainelCicloPlanDo cicloId={cicloId} etapaAtiva="plan" tituloCiclo="Nome do ciclo">
        <section className="plan-identificacao_conteudo" aria-labelledby="plan-identificacao-titulo">
          <div className="plan-identificacao_titulo-linha">
            <Link className="plan-identificacao_voltar" to={`/do/ciclo/${cicloId}/plan`} aria-label="Voltar ao resumo Plan">‹</Link>
            <h2 id="plan-identificacao-titulo">Identificação do problema</h2>
          </div>

          <div className="plan-identificacao_grade">
            <article className="plan-identificacao_card plan-identificacao_historico">
              <h3>Série histórica do indicador</h3>
              <p>Valores mensais usados para identificar tendência e sazonalidade.</p>
              <table><thead><tr><th>Período</th><th>Valor</th></tr></thead><tbody>{historico.map(([periodo, valor]) => <tr key={periodo}><td>{periodo}</td><td>{valor}</td></tr>)}</tbody></table>
            </article>

            <article className="plan-identificacao_card plan-identificacao_fonte">
              <h3>Fonte de dados</h3>
              <p>Relatório de expedição · atualizado em 07 out</p>
              <p className="plan-identificacao_arquivo">{arquivo || "divergencias.xlsx · anexo disponível"}</p>
              <span className="plan-identificacao_status">ATIVO</span>
              <p className="plan-identificacao_nota">Arquivo anexado para consulta. Revise e registre os pontos da série manualmente.</p>
              <label className="plan-identificacao_anexar">Anexar CSV / XLSX<input type="file" accept=".csv,.xlsx,.xls" onChange={(event) => setArquivo(event.target.files?.[0]?.name ?? "")} /></label>
            </article>

            <article className="plan-identificacao_card plan-identificacao_sugestoes">
              <h3>Sugestões de problemas</h3>
              <p>A IA sugere; o gestor decide.</p>
              <div className="plan-identificacao_lista-sugestoes">
                {sugestoes.map((sugestao, index) => (
                  <div className="plan-identificacao_sugestao" key={sugestao.texto}>
                    <p>{sugestao.texto}</p>
                    <div className="plan-identificacao_acoes-sugestao">
                      {sugestao.aceita && <span className="plan-identificacao_selecionada">Selecionada</span>}
                      <button type="button" onClick={() => atualizarSugestao(index, "aceitar")}>{sugestao.aceita ? "Desfazer" : "Aceitar"}</button>
                      <button type="button" onClick={() => editarSugestao(index)}>Editar</button>
                      <button type="button" onClick={() => atualizarSugestao(index, "remover")}>Remover</button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="plan-identificacao_manual">Também é possível cadastrar um problema manualmente.</p>
            </article>
          </div>

          <form className="plan-identificacao_card plan-identificacao_impactos" onSubmit={(event) => { event.preventDefault(); setSalvo(true); }}>
            <div className="plan-identificacao_impactos-cabecalho"><div><h3>Impactos do problema</h3><p>Registre consequências antes de selecionar uma hipótese.</p></div><button type="submit" className="plan-identificacao_salvar">Salvar impactos</button></div>
            <div className="plan-identificacao_campos-impacto">
              <label>Impacto operacional<input defaultValue="Retrabalho e atraso no fechamento do turno" /></label>
              <label>Impacto financeiro estimado<input defaultValue="R$ 18.400 por mês" /></label>
              <div><span>Responsável pelo registro</span><p>Catarina Cândido · Gestora</p></div>
              <div><span>Peso calculado: 0,90</span><p>Peso confirmado pelo gestor · pode editar</p></div>
            </div>
            {salvo && <p className="plan-identificacao_feedback" role="status">Alterações mantidas nesta prévia. A gravação na API ainda não está conectada.</p>}
          </form>
        </section>
      </PainelCicloPlanDo>
    </main>
  );
}
