# 🌐 ACTA Web

Aplicação web do ACTA para apoiar a gestão de ciclos de melhoria contínua com o método PDCA. O frontend reúne autenticação, onboarding, ciclos, atividades de Plan/Do/Check/Act, perfil e relatórios.

## Funcionalidades

| Domínio | Capacidades |
| --- | --- |
| Conta | Login por e-mail ou Google, criação de conta, recuperação de senha e onboarding da empresa |
| Ciclos | Listagem de ciclos e acompanhamento de um ciclo de melhoria |
| Plan | Coleta, causas, investigação, metas, planos de ação e identificação de problemas |
| Do | Equipe, tarefas, cronograma e treinamentos |
| Check | Verificações e indicadores |
| Act | Acompanhamento da etapa Act |
| Perfil | Preferências e edição do perfil |
| Cato e relatórios | Conversas com o Cato e tela de relatórios com aviso de indisponibilidade |

## Tecnologias

| Tecnologia | Uso |
| --- | --- |
| React 19.2.8 | Interface e componentes |
| React DOM 19.2.8 | Renderização da aplicação web |
| TypeScript 5.8.3 | Tipagem estática |
| Vite 6.4.3 | Desenvolvimento e build |
| React Router DOM 7.18.3 | Rotas da aplicação |
| Firebase 11.10.0 | Autenticação |


As versões correspondem às dependências resolvidas em `package-lock.json`.

## Aplicação publicada

[Abrir ACTA Web](https://app-acta.vercel.app)

O domínio abre a tela de login. A publicação existente ainda retorna 404 ao recarregar diretamente uma rota interna; `vercel.json` configura o fallback de SPA para a próxima publicação.

## Requisitos

- Node.js 22 (mesma versão principal usada pela validação automatizada)
- npm

## Configuração local

1. Instale as dependências:

   ```bash
   npm ci
   ```

2. Copie `.env.example` para `.env.local` e preencha as URLs das APIs e as credenciais do projeto Firebase fornecidas pela equipe. Não publique valores secretos.

   ```powershell
   Copy-Item .env.example .env.local
   ```

   Em Bash, use `cp .env.example .env.local`.

| Variável | Uso |
| --- | --- |
| `VITE_API_AUTH_URL` | URL base da API de autenticação. |
| `VITE_API_PG_URL` | URL base da API PostgreSQL do ACTA. |
| `VITE_API_MONGO_URL` | URL base da API MongoDB do ACTA. |
| `VITE_API_CATO_URL` | URL base da API do Cato; o exemplo inclui o endpoint usado pelo projeto. |
| `VITE_FIREBASE_*` | Configuração do Firebase Authentication, conforme as seis chaves do `.env.example`. |
| `VITE_API_IMPORT_URL` | Está no exemplo de ambiente, mas nenhum fluxo atual do frontend chama a API de importação. |

3. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

4. Gere o build de produção:

   ```bash
   npm run build
   ```

## Estrutura do código

- `src/app`: inicialização e configuração de rotas.
- `src/components/auth`: contexto de autenticação, proteção de rotas e interface de acesso.
- `src/pages/<domínio>/<página>/index.tsx`: telas de rota.
- `src/components/<domínio>/<componente>/index.tsx`: componentes de interface.
- `src/features`: hooks e dados organizados por domínio.
- `src/services`: clientes e módulos de comunicação com APIs.
- `src/types`: props, entidades e contratos tipados agrupados por domínio.
- `features`, `styles`: folhas de estilo, imagens, SVGs e fontes fora de `src`.

As rotas carregam as páginas sob demanda. `vercel.json` direciona rotas de cliente para a entrada do Vite, necessária para recargas em URLs internas.

## Integrações

- Firebase Authentication para login e gestão de sessão.
- `acta-auth-api`, `acta-pg-api`, `acta-mongo-api` e `acta-ai` para autenticação, dados do PDCA e conversas com o Cato; seus endpoints são configurados por variáveis `VITE_*` em `.env.local`.
- ViaCEP para consulta de CEP no onboarding.

## 🤝 Links e autoria

- [Repositório](https://github.com/AppActa/acta-ts-web) · [Licença MIT](LICENSE) · `acta.institutojef@gmail.com`
- Integrações: [acta-auth-api](https://github.com/AppActa/acta-auth-api) · [acta-pg-api](https://github.com/AppActa/acta-pg-api) · [acta-mongo-api](https://github.com/AppActa/acta-mongo-api) · [acta-ai](https://github.com/AppActa/acta-ai) · [ViaCEP](https://viacep.com.br/)
- Contribuições: use *issues* e *pull requests*; há um [PULL_REQUEST_TEMPLATE.md](PULL_REQUEST_TEMPLATE.md).
