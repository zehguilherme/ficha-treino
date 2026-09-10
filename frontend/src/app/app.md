# Frontend app

## Propósito

Este módulo contém as rotas do Next.js App Router, metadata, layouts e estados de página da aplicação.
Componentes reutilizáveis vivem em `src/components/`; contratos HTTP ficam em `src/schemas/` e `src/lib/`.

## Rotas

- `/`: landing pública e metadata social.
- `/login` e `/auth/google/callback`: fluxo Google OAuth.
- `/treinos`: dashboard semanal com sete dias.
- `/treinos/[weekDay]`: treino diário, progresso e ações.
- `/treinos/[weekDay]/adicionar-exercicio`: busca e adição paginada.
- `/minha-conta`: perfil e exclusão de conta.
- `not-found.tsx`, `sitemap.ts` e `robots.ts`: estados e superfícies públicas.

## Arquivos-chave

- `layout.tsx`: layout raiz, fonte e metadata global.
- `manifest.ts`: manifest PWA para instalação como aplicativo.
- `components/ui/Alert.tsx`: base acessível para avisos não modais.
- `components/layout/PwaInstallPrompt.tsx`: banner global de instalação nativa ou instruções iOS.
- `treinos/DashboardClient.tsx`: consulta e expansão dos resumos.
- `treinos/[weekDay]/page.tsx`: treino diário e mutações.
- `treinos/[weekDay]/adicionar-exercicio/page.tsx`: rota dedicada de catálogo.
- `minha-conta/page.tsx`: perfil autenticado.

## Verificação

Em `frontend/`, execute `npm test`, `npm run lint`, `npm run format:check` e `npm run build`.
Para alterações de interface, aplicar também a checklist de acessibilidade em `frontend/frontend.md`.

## Limites

- Usar somente slugs ASCII minúsculos para dias de treino.
- Consumir a API Express pelo cliente HTTP tipado; não criar rotas API do Next.js.
- Manter textos PT-BR, estados loading/erro acessíveis e foco de teclado preservado.
- Componentes em `src/components/` usam PascalCase e exports nomeados.

## Fluxo de alteração

1. Ler `frontend/frontend.md` e a referência de testes antes de editar uma rota.
2. Reutilizar componentes e helpers existentes antes de criar novos.
3. Cobrir estados de loading, erro, vazio e sucesso no teste da página afetada.
4. Validar metadata e navegação quando a rota ou o layout mudar.

## Dependências

As páginas usam `AuthContext`, `QueryProvider` e o cliente Axios tipado. O backend Express é a
única origem de dados; a CDN de exercícios fornece apenas imagens referenciadas pelos dados.

## Referências

- `frontend/frontend.md` é o resumo operacional das rotas e constraints.
- `frontend/testing.md` mantém o catálogo detalhado de suítes e convenções Jest.
- `design-system/design-system.md` resume tokens e componentes reutilizáveis.
- `specification.md` define os fluxos esperados pelo produto.
