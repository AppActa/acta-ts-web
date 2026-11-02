# Verificação de acessibilidade — DAD

**Data:** 2026-11-02
**Aplicação:** ambiente local em `http://127.0.0.1:5174`
**Ambiente observado:** navegador integrado do Codex; viewport desktop aproximado de 747 × 593 px e viewport móvel de 320 × 700 px.
**Cobertura funcional no navegador:** login, recuperação de senha e criação de conta, em sessão sem autenticação. **Cobertura estática adicional:** AST dos 82 arquivos TSX em `src/pages/` e `src/components/` para associações de rótulos, nomes de controles, imagens, botões, landmarks e handlers. NVDA não está instalado/disponível; VoiceOver não está disponível nesta sessão.

Esta verificação registra evidências dos fluxos acessíveis sem conta de demonstração. Não representa certificação WCAG nem auditoria funcional de todas as telas.

**Resumo por situação — mínimos:** Aprovado 1, Falhou 0, Não se aplica 0, Não verificado 5. **Extras:** Aprovado 0, Falhou 1, Não se aplica 0, Não verificado 3.

## Fluxos observados

| Fluxo | Critérios observados | Evidência | Resultado |
| --- | --- | --- | --- |
| Login | Rótulos acessíveis; ordem de teclado; envio vazio; contraste de texto, botão e foco | Árvore de acessibilidade apresentou Email, Senha, alternância de senha e ações nomeadas. Navegação por Tab percorreu os controles. Envio vazio mostrou mensagens associadas aos campos. Cores de texto/erro/foco foram ajustadas em `features/auth/styles/pagina-login.css`. Contraste calculado para as cores observadas: texto secundário `#666`/`#f6f6f6` = **5,31:1**; erro `#b3261e`/branco = **6,54:1**; botão `#102d31`/`#48b3c6` = **5,92:1**; link e foco `#267f8e`/branco = **4,66:1**. | **Não verificado** no escopo integral; as observações citadas cobrem apenas a tela de login e não incluem leitor de tela ou todos os estados. |
| Recuperação de senha | Foco inicial; retorno do foco; navegação por teclado | Ao abrir, o foco vai para o campo de e-mail; ao fechar, retorna ao botão que abriu o fluxo. Tab percorreu e-mail, continuar e voltar. | **Não verificado** no escopo integral; envio real de e-mail e leitor de tela não foram testados. |
| Criar conta | Acesso direto; campos nomeados; ordem de teclado | `/criar-conta` abre sem sessão; campos Email, Senha e Confirme a senha e seus controles foram reconhecidos; ordem de teclado conferida. | **Não verificado** no escopo integral; nenhuma conta foi criada e nenhum dado enviado. |
| Login em viewport móvel | Ausência de rolagem horizontal | Inicialmente, a 320 × 700 px, `documentElement.scrollWidth` e `body.scrollWidth` mediam 348 px. Após trocar a coluna móvel para `minmax(0, 1fr)`, ambos mediram 320 px; o cartão ficou entre x=16 e x=304. | **Aprovado** para o overflow horizontal desta rota e largura; não cobre outras larguras ou páginas. |

## Mínimos — M-DAD-11

| ID | Critério | Resultado e evidência/limite |
| --- | --- | --- |
| MIN-01 | Ações em controles apropriados | **Não verificado.** AST não encontrou `onClick` em `div`, `span` ou `tr`; ações de todos os fluxos não foram percorridas por teclado. |
| MIN-02 | `<label htmlFor>` associado a cada `<input>` | **Aprovado.** AST encontrou 100 labels com IDs correspondentes e nenhum dos 101 controles `input`/`select`/`textarea` sem associação; login também foi inspecionado na árvore de acessibilidade. |
| MIN-03 | Alternativas de texto para imagens | **Não verificado.** As 67 imagens têm `alt`, mas a adequação de cada texto/vazio em contexto não foi avaliada visualmente ou com leitor de tela. |
| MIN-04 | Contraste mínimo de texto | **Não verificado.** Quatro pares foram medidos no login (5,31:1; 6,54:1; 5,92:1; 4,66:1); outras páginas e estados não foram medidos. |
| MIN-05 | Erros no DOM com `role="alert"` | **Não verificado.** Erros de login vazios foram observados por teclado; a cobertura de erros assíncronos e demais formulários não foi exercitada. |
| MIN-06 | Operação integral por teclado e foco visível | **Não verificado.** Ordem de foco e retorno da recuperação foram observados; faltam as demais páginas, componentes e estados. |

## Extras — E-DAD-24

| ID | Critério | Resultado e evidência/limite |
| --- | --- | --- |
| EXT-01 | Padrões ARIA e teclado em componentes complexos | **Não verificado.** Recuperação de senha foi aberta/fechada por teclado. A inspeção de código localizou diálogos HTML nativos no erro de Plan e diálogos ARIA em perfil, formulário/aviso de relatórios, aviso de treinamento, aviso de coleta e sucesso de tarefa. O hook `src/utils/useDialogFocus.ts` agora contém Tab/Shift+Tab nesses diálogos próprios; código e build não demonstram operação real, e menus/abas ainda não foram percorridos. |
| EXT-02 | Foco ao abrir e fechar componentes | **Não verificado.** Recuperação devolveu foco ao acionador observado; o código agora direciona foco ao primeiro controle e contém Tab nos diálogos citados, além de devolver o foco ao elemento anterior ao desmontar. Esses comportamentos novos ainda não foram observados no navegador autenticado. |
| EXT-03 | Landmarks `<header>`, `<main>`, `<nav>` e `<footer>` em todas as páginas | **Falhou.** `App` agora renderiza um `<footer>` global após o roteador. A inspeção das rotas ainda encontra páginas sem `<header>` ou `<nav>` próprios, inclusive login, cadastro, onboarding e formulários em modal; não há um landmark global que cubra esses casos. O build confirma compilação, mas o DOM após a mudança não foi observado no navegador. |
| EXT-04 | Navegação prática com NVDA ou VoiceOver | **Não verificado.** NVDA não está instalado/disponível e VoiceOver não está disponível nesta sessão. DOM e AST não substituem essa demonstração. |

## Correções realizadas

- Aumentado o contraste de texto secundário e mensagens de erro no login.
- Ajustada a cor do texto do botão principal para contraste superior ao limiar AA para texto normal contra o fundo verificado.
- Tornado mais perceptível o contorno de foco de campos.
- Adicionado um rodapé semântico global com informação de contexto do ACTA.
- Recuperação de senha move o foco para o campo ao abrir e o devolve ao botão de origem ao fechar.
- Corrigida a rota de criação de conta, que antes ficava atrás da proteção de autenticação; adicionado link de login para cadastro.
- Associados os 100 elementos <label> existentes em páginas e componentes com htmlFor e id correspondentes. Uma conferência via TypeScript AST encontrou 100/100 pares correspondentes e nenhum rótulo sem referência.
- Conferidos com TypeScript AST os 101 controles input/select/textarea: todos têm nome por label correspondente, aria-label ou aria-labelledby; as 67 imagens têm atributo alt; os 104 botões declaram type. A presença do alt não comprova que a alternativa textual esteja adequada em contexto.
- Removido onClick de duas linhas de tabela em Plan e Check; os links de ciclo em cada primeira coluna continuam sendo a navegação por teclado e por leitor de tela.
- As listas do formulário demonstrativo e da investigação agora têm ações nomeadas para mover e remover itens, com foco visível; o código direciona o foco ao campo correspondente após reordenação/remoção. O comportamento ainda não foi demonstrado no navegador autenticado.
- Corrigi o contraste do texto dos botões “Adicionar campo” e “Concluído” no formulário Plan: os pares definidos no CSS passaram de 2,19:1 e 2,46:1 para 6,13:1 e 5,46:1 (`#253132` sobre `#0ac2ca` e `#48b3c6`). Cálculo dos valores de CSS; renderização e estados focados/desabilitados não foram medidos no navegador.
- Movi os estilos do modal compartilhado para `features/perfil/styles/modal-edicao-perfil.css`, importado em `ModalEdicaoPerfil`; a análise dos assets do build confirmou que a rota Perfil inclui o CSS do diálogo sem depender da página Editar Perfil. A exibição do modal no navegador não foi retestada.
- `ModalEdicaoPerfil` agora move o foco ao abrir, contém Tab/Shift+Tab no diálogo, permite Escape para fechar/cancelar e devolve o foco ao elemento que o abriu. TypeScript e build aprovados; a sequência de foco ainda não foi observada no navegador autenticado.
- A confirmação de saída agora anuncia o estado de espera e, em falha de `signOut`, expõe uma mensagem com `role="alert"` sem fechar o diálogo; desabilita ações durante a requisição e direciona o foco à mensagem/status. Esses estados foram conferidos no código e build, sem simular falha no navegador.
- Corrigi contraste no modal do perfil. Pelo CSS, descrição `#526a6e`/branco = 5,76:1; botões turquesa `#253132`/`#4bb5c8` = 5,59:1 e hover `#253132`/`#3caabd` = 4,91:1; confirmação vermelha branco/`#c22127` = 5,93:1 e hover branco/`#d9272d` = 4,91:1; foco `#025a8a`/branco = 7,42:1. Cálculo estático; não mede pixels renderizados.
- Extraí a gestão de foco compartilhada de `ModalEdicaoPerfil` para `src/utils/useDialogFocus.ts` e apliquei foco inicial, contenção de Tab/Shift+Tab e retorno do foco ao desmontar nos diálogos próprios de relatórios, aviso de treinamento, aviso de coleta do Plan e sucesso de criação de tarefa. Os alertas de relatório e treinamento permitem Escape para retornar ao formulário. Mantive `ModalErroPlan` com o elemento HTML nativo `<dialog>`/`showModal()`. TypeScript e build aprovados; a sequência de teclado e retorno de foco desses fluxos ainda não foi demonstrada no navegador.
- `ModalSucessoDo` é uma tela de sucesso com landmark `<main>` e link de navegação, não uma sobreposição; removi `role="dialog"` e `aria-modal` para não anunciar falsamente uma janela modal.
- Corrigido o overflow horizontal do login a 320 px, causado pelo tamanho mínimo implícito da coluna de grid; reteste no navegador integrado confirmou largura de documento igual à largura do viewport.

## Inspeção estática adicional

| Verificação | Método | Resultado e limite |
| --- | --- | --- |
| Contraste dos botões do formulário Plan | Cálculo WCAG a partir das cores de texto e fundo declaradas no CSS. | Texto escuro `#253132` sobre `#0ac2ca`: **6,13:1**; sobre `#48b3c6`: **5,46:1**. Verificação estática das cores declaradas, sem medir os estados renderizados no navegador. |
| Contraste do modal de perfil | Cálculo WCAG dos estados normal, hover e foco a partir do CSS compartilhado. | Texto de descrição **5,76:1**; botões turquesa normal/hover **5,59:1/4,91:1**; botão de confirmação vermelho normal/hover **5,93:1/4,91:1**; contorno de foco **7,42:1**. Valores do CSS, sem observação dos pixels renderizados. |
| Rótulos de formulário | Percurso dos nós TSX em src/pages/ e src/components/; para cada <label>, comparar htmlFor com o id de um controle. | **100/100 labels têm `htmlFor`; 100/100 valores resolvidos apontam a IDs de controles**, incluindo expressões JSX simples e templates dinâmicos. Todos os 79 inputs têm associação literal; a busca é estática, não uma inspeção DOM das 49 páginas. |
| Nome dos controles | TypeScript AST: 101 input/select/textarea; associação por `htmlFor` ou atributo aria-label/aria-labelledby. | **101/101 com nome programático declarado.** Inspeção estática não confirma a experiência auditiva real. |
| Alternativas de imagens | TypeScript AST: procurar todas as tags `<img>` em páginas e componentes e verificar atributo `alt`. | **67/67 têm `alt`**; requer revisão contextual para confirmar se o texto descreve a imagem ou se vazio é apropriado. |
| Tipo de botões | TypeScript AST: procurar `<button>` sem atributo `type`. | **104/104 declaram `type`**; não avalia se cada ação deveria ser link ou botão. |
| Landmarks | Inspeção do shell `App` e das páginas sob `src/pages/`. | `<main>` aparece nas páginas observadas e o `<footer>` é renderizado depois do roteador; ainda faltam `<header>` ou `<nav>` em algumas rotas. Inspeção estática não confirma o DOM efetivo de todos os estados e caminhos. |
| Landmarks | TypeScript AST dos arquivos TSX de páginas e componentes. | Não há `<footer>` nos arquivos examinados; esse requisito extra falha. A contagem por tag não determina a cobertura renderizada em cada rota. |
| Ações em elementos não interativos | TypeScript AST dos elementos JSX nas páginas e componentes; verificar o elemento que recebe cada `onClick`, incluindo `Link` do React Router. | Foram encontrados 62 handlers `onClick`; todos estão em controles nativos interativos ou em `Link` (renderizado como âncora). Nenhum foi encontrado em elemento não interativo. Busca estática, não valida semântica completa nem todos os outros handlers. |
| Erros exclusivos em alert/console | Busca por alert() e console.log() no código fonte. | Nenhuma ocorrência; não comprova, por si só, feedback visível em cada operação assíncrona. |

## Próxima demonstração necessária

Com conta de teste autorizada: percorrer onboarding, navegação entre domínios, formulários, mensagens de carregamento/erro/sucesso, modais e retorno de foco. Repetir com leitor de tela, teclado, zoom e larguras menores. Registrar data, navegador, tecnologia assistiva, fluxos e resultados antes de declarar cobertura completa.
