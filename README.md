<h1 align="center">Ficha de Treino</h1>

![Captura de tela da página inicial](./.github/img/home.png)

<div align="center">
  <a href="README-en.md">English</a>
  ·
  <a href="README.md">Português</a>
</div>

## 💬 Descrição

A Ficha de Treino é uma aplicação web para gerenciamento de treinos de academia. A aplicação permite organizar exercícios por dia da semana, acompanhar o progresso e consultar um catálogo de exercícios em português brasileiro.

## 🎯 Objetivo

O projeto foi criado para oferecer uma ficha de treino simples, responsiva e acessível pelo navegador. Cada usuário tem uma rotina semanal própria, sem compartilhamento de dados entre contas.

## ✨ Funcionalidades

- Login e criação automática de conta com Google OAuth 2.0;
- Sete treinos, um para cada dia da semana, criados no primeiro login;
- Busca de exercícios por nome e filtros de categoria, equipamento, nível, força, mecânica e músculos;
- Adição e remoção de exercícios nos treinos;
- Marcação individual de exercícios concluídos;
- Limpeza das marcações de um treino sem remover seus exercícios;
- Exclusão permanente da conta e dos dados relacionados;
- Interface responsiva para desktop e dispositivos móveis.

## 🚀 Tecnologias

### Front-end

- [Next.js 16](https://nextjs.org/) e [React 19](https://react.dev/) — aplicação web com App Router;
- [TypeScript](https://www.typescriptlang.org/) — tipagem estática;
- [Tailwind CSS](https://tailwindcss.com/) — estilização responsiva;
- [ShadCN](https://ui.shadcn.com/) com [Radix UI](https://www.radix-ui.com/) e [Class Variance Authority](https://cva.style/docs) — componentes acessíveis e variantes visuais;
- [TanStack Query](https://tanstack.com/query) — cache e estado do servidor;
- [Axios](https://axios-http.com/) — comunicação com a API;
- [Zod](https://zod.dev/) — validação dos contratos HTTP;
- [Jest](https://jestjs.io/) e [Testing Library](https://testing-library.com/) — testes automatizados.

### Back-end

- [Express 5](https://expressjs.com/) — API REST;
- [Prisma 7](https://www.prisma.io/) com [PostgreSQL](https://www.postgresql.org/) 16 e driver `pg` — persistência de dados;
- [Google Auth Library](https://cloud.google.com/nodejs/docs/reference/google-auth-library/latest) — autenticação Google OAuth 2.0;
- [JSON Web Token](https://jwt.io/) — sessões autenticadas com validade de 24 horas;
- [Swagger/OpenAPI](https://swagger.io/specification/) — documentação interativa da API;
- [Zod](https://zod.dev/) — validação de entradas e respostas.

### Infraestrutura

- [Docker Compose](https://docs.docker.com/compose/) — PostgreSQL local para desenvolvimento;
- [Vercel](https://vercel.com/) — hospedagem da aplicação;
- [Neon](https://neon.tech/) — PostgreSQL do ambiente de produção.

## 🏗️ Arquitetura

Frontend e backend são aplicações independentes. O frontend Next.js consome a API Express por HTTP/JSON, enquanto o backend acessa o PostgreSQL por meio do Prisma ORM.

O fluxo principal é:

1. O usuário autentica com o Google;
2. O backend valida o token, cria ou atualiza o usuário e gera um JWT;
3. O frontend armazena a sessão e envia o JWT nas requisições protegidas;
4. O backend consulta os treinos e exercícios pertencentes ao usuário;
5. As alterações são persistidas no PostgreSQL.

## 🔐 Autenticação

Não existe cadastro por senha. No primeiro login Google, o backend cria o usuário e os sete treinos semanais automaticamente. Nos logins seguintes, nome e e-mail são atualizados a partir da conta Google.

O JWT é emitido pelo backend, expira em 24 horas e não possui refresh token. Ao expirar, o usuário precisa autenticar novamente.

## 🗃️ Banco de dados e seed

O banco possui as entidades `Users`, `Workouts`, `Exercises` e `Workout_Exercises`. Cada usuário possui exatamente um treino para cada dia da semana, e um exercício não pode ser repetido no mesmo treino.

O seed baixa o dataset [`exercises-ptbr-full-translation.json`](https://github.com/joao-gugel/exercicios-bd-ptbr/blob/main/exercises/exercises-ptbr-full-translation.json), traduzido para português brasileiro, e faz upsert dos exercícios no banco. As imagens são exibidas pelo CDN do [free-exercise-db](https://github.com/yuhonas/free-exercise-db).

## 🔌 API

A documentação completa e interativa fica disponível em `http://localhost:3001/api/docs` durante o desenvolvimento.

| Grupo | Rotas principais | Descrição |
| --- | --- | --- |
| Autenticação | `POST /api/auth/google`, `GET /api/auth/me` | Login Google e perfil atual |
| Treinos | `GET /api/workouts`, `GET /api/workouts/:weekDay` | Resumo semanal e treino diário |
| Exercícios do treino | `POST /api/workouts/:weekDay/exercises`, `DELETE /api/workouts/:weekDay/exercises/:exerciseId`, `PATCH /api/workout-exercises/:id`, `POST /api/workouts/:weekDay/clear` | Adição, remoção, conclusão e limpeza |
| Catálogo | `GET /api/exercises` | Busca paginada e filtrada |
| Conta | `DELETE /api/account` | Exclusão da conta com cascade |
| Saúde | `GET /api/health` | Verificação da API |

## 🎨 Layout e design system

O design system contém tokens HSL, tipografia, componentes reutilizáveis, páginas HTML de referência e previews visuais em [`design-system/`](./design-system/). A aplicação usa a fonte Inter e foi projetada para telas de desktop e dispositivos móveis.

## 🚀 Começando

### Pré-requisitos

Instale [Node.js](https://nodejs.org/), [npm](https://www.npmjs.com/) e [Docker](https://www.docker.com/).

### Configuração

Clone o repositório e prepare os arquivos locais a partir dos templates `.env.example` de `backend/` e `frontend/`. Preencha as credenciais necessárias para o ambiente antes de iniciar os serviços.

```bash
git clone https://github.com/zehguilherme/ficha-treino.git
cd ficha-treino
```

### Banco e backend

```bash
docker compose up -d
cd backend
npm install
npx prisma migrate deploy
npm run seed
npm run dev
```

### Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

A aplicação estará em `http://localhost:3000`, a API em `http://localhost:3001` e o Swagger em `http://localhost:3001/api/docs`.

## ✅ Testes e validações

### Backend

```bash
cd backend
npm test
npm run lint
npm run format:check
npx tsc --noEmit
```

### Frontend

```bash
cd frontend
npm test
npm run lint
npm run format:check
npm run test:component-names
npx tsc --noEmit
```

## 📁 Estrutura do projeto

```text
frontend/             # Aplicação Next.js, páginas e componentes
backend/              # API Express, Prisma, autenticação e seed
design-system/        # Tokens, componentes e previews visuais
.github/img/          # Imagens da documentação
docker-compose.yml    # PostgreSQL local
specification.md      # Requisitos e regras de negócio
```

## 🌐 Produção

A landing pública está disponível em [fichatreino.vercel.app](https://fichatreino.vercel.app). O ambiente de produção usa Vercel para hospedagem e Neon como banco PostgreSQL.

## 🤔 Como contribuir

1. Faça um fork do projeto;
2. Crie uma branch para sua alteração: `git checkout -b minha-nova-feature`;
3. Instale as dependências e execute os testes do módulo alterado;
4. Faça commit seguindo Conventional Commits: `git commit -m 'feat: adiciona uma nova feature'`;
5. Faça push da branch: `git push origin minha-nova-feature`;
6. Abra uma Pull Request;
7. Depois do merge, você pode excluir sua branch.

---

Feito com 💟 por José Guilherme Paro Monteiro Tomaine. [Fale comigo!](https://www.linkedin.com/in/jos%C3%A9-guilherme-paro-monteiro-tomaine/)
