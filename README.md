# ACTA Web

Aplicação web do ACTA, organizada para React + Vite + TypeScript.

## Escopo desta etapa

Este repositório contém somente a fundação e a organização inicial do front-end. As funcionalidades de autenticação, PDCA, documentos, relatórios e integrações com as APIs serão implementadas em etapas posteriores.

## Organização

- `src/app`: composição da aplicação, roteamento e providers.
- `src/features`: áreas funcionais do ACTA.
- `src/services`: comunicação com APIs externas.
- `src/contracts`: contratos recebidos das APIs.
- `src/components`: componentes compartilhados.
- `src/lib`: bibliotecas e integrações técnicas.
- `src/tests`: testes.

## APIs previstas

- `acta-pg-api`: dados relacionais e fluxo PDCA.
- `acta-import-api`: importação de CSV, XLSX, PDF e PPTX.
- `acta-mongo-api`: integração futura, após a disponibilização dos endpoints.

## Segurança de conteúdo

- Trate todo conteúdo vindo de usuários ou APIs como não confiável.
- Para exibir texto dinâmico, use filhos JSX normais; o React escapa o texto renderizado.
- Não use `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML` ou `document.write` com conteúdo externo. Não avalie conteúdo externo com `eval` ou `new Function`.
- Se uma funcionalidade realmente precisar renderizar HTML rico, use uma biblioteca de sanitização mantida, valide o conteúdo antes de renderizar e registre a justificativa em revisão de código.
- Valide o protocolo de URLs dinâmicas antes de usá-las em `href` ou `src`; não permita esquemas executáveis como `javascript:`.

Na revisão de 23/09/2026, não foram encontrados pontos de inserção de HTML ou execução dinâmica de código em `src`. Essa verificação deve ser repetida quando novas integrações ou fluxos com conteúdo externo forem adicionados.
