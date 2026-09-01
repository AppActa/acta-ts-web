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
