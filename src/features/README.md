# Áreas funcionais

Cada pasta representa um domínio do ACTA. Organize cada funcionalidade em `pages/`, `components/`, `styles/` e `assets/` conforme necessário. Mantenha a implementação próxima dos hooks, serviços e contratos do mesmo domínio.

Elementos usados por vários domínios ficam em `features/layout` ou `src/components`. Fontes e estilos globais ficam em `src/styles`. O roteador em `src/app/router` importa as páginas diretamente de suas respectivas features.
