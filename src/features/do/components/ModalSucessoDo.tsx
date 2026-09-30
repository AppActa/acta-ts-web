import { Link } from "react-router-dom";
import estrelaSucesso from "../assets/treinamento-sucesso-estrela.svg";
import checkSucesso from "../assets/treinamento-sucesso-check.svg";
import "../styles/modal-sucesso-do.css";

type ModalSucessoDoProps = {
  titulo: string;
  descricao: string;
  larguraDescricao?: number;
  hrefConcluido: string;
};

export function ModalSucessoDo({ titulo, descricao, larguraDescricao = 309, hrefConcluido }: ModalSucessoDoProps) {
  return (
    <main className="pagina-sucesso-do" role="dialog" aria-modal="true" aria-labelledby="sucesso-do_titulo">
      <section className="sucesso-do_modal">
        <div className="sucesso-do_cartao" />
        <img className="sucesso-do_estrela" src={estrelaSucesso} alt="" />
        <img className="sucesso-do_check" src={checkSucesso} alt="" />
        <h1 id="sucesso-do_titulo" className="sucesso-do_titulo">{titulo}</h1>
        <p className="sucesso-do_descricao" style={{ width: `${larguraDescricao}px` }}>{descricao}</p>
        <Link className="sucesso-do_concluido" to={hrefConcluido}>Concluído</Link>
      </section>
    </main>
  );
}
