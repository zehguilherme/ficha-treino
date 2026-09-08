<h1 align="center">Workout Planner</h1>

![Screenshot of the home page](./.github/img/home.png)

<div align="center">
  <a href="README-en.md">English</a>
  ·
  <a href="README.md">Português</a>
</div>

## 💬 Description

Workout Planner is a simple, responsive, and accessible web application for managing gym workouts. It lets users organize exercises by day of the week, track progress, and browse a Brazilian Portuguese exercise catalog. Each user has an independent weekly routine, with no data shared between accounts.

## ✨ Features

- Google OAuth 2.0 login and automatic account creation;
- Seven workouts, one for each day of the week, created on first login;
- Exercise search by name and filters for category, equipment, level, force, mechanic, and muscles;
- Add and remove exercises from workouts;
- Mark individual exercises as completed;
- Clear a workout's completion marks without removing its exercises;
- Permanent account and related data deletion;
- Responsive interface for desktop and mobile devices.

## 🌐 Environments

### Local

- Frontend: [localhost:3000](http://localhost:3000);
- API: [localhost:3001](http://localhost:3001);
- Swagger: [local documentation](http://localhost:3001/api/docs);
- Health check: [check local API](http://localhost:3001/api/health).

### Production

- Frontend: [fichatreino.vercel.app](https://fichatreino.vercel.app);
- API: [production API](https://ficha-treino-backend.vercel.app);
- Swagger: [production documentation](https://ficha-treino-backend.vercel.app/api/docs);
- Health check: [check production API](https://ficha-treino-backend.vercel.app/api/health).

Hosting: [Vercel](https://vercel.com/). Database: [Neon](https://neon.tech/).

## 🚀 Getting started

### Prerequisites

Install [Node.js](https://nodejs.org/), [npm](https://www.npmjs.com/), and [Docker](https://www.docker.com/).

### Configuration

Clone the repository and prepare local files from the `.env.example` templates in `backend/` and `frontend/`. Fill in the credentials required by the environment before starting the services.

```bash
git clone https://github.com/zehguilherme/ficha-treino.git
cd ficha-treino
```

### Database and backend

```bash
docker compose up -d
cd backend
npm install
npx prisma migrate deploy
npm run seed
npm run dev
```

### Frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

After starting both services, see the local links in the [Environments](#-environments) section.

## 🏗️ Architecture

The frontend and backend are independent applications. The Next.js frontend consumes the Express API through HTTP/JSON, while the backend accesses PostgreSQL through Prisma ORM.

The main flow is:

1. The user authenticates with Google;
2. The backend validates the token, creates or updates the user, and issues a JWT;
3. The frontend stores the session and sends the JWT on protected requests;
4. The backend reads workouts and exercises owned by that user;
5. Changes are persisted in PostgreSQL.

## 🔐 Authentication

There is no password-based registration. On the first Google login, the backend creates the user and seven weekly workouts automatically. On later logins, the name and email are updated from the Google account.

The JWT is issued by the backend, expires after 24 hours, and has no refresh token. After expiration, the user must authenticate again.

## 🗃️ Database and seed

The database contains `Users`, `Workouts`, `Exercises`, and `Workout_Exercises`. Each user has exactly one workout for each day of the week, and an exercise cannot be repeated in the same workout.

The seed downloads [`exercises-ptbr-full-translation.json`](https://github.com/joao-gugel/exercicios-bd-ptbr/blob/main/exercises/exercises-ptbr-full-translation.json), translated into Brazilian Portuguese, and upserts the exercises into the database. Exercise images are served through the [free-exercise-db](https://github.com/yuhonas/free-exercise-db) CDN.

## 🔌 API

| Group | Main routes | Description |
| --- | --- | --- |
| Authentication | `POST /api/auth/google`, `GET /api/auth/me` | Google login and current profile |
| Workouts | `GET /api/workouts`, `GET /api/workouts/:weekDay` | Weekly summary and daily workout |
| Workout exercises | `POST /api/workouts/:weekDay/exercises`, `DELETE /api/workouts/:weekDay/exercises/:exerciseId`, `PATCH /api/workout-exercises/:id`, `POST /api/workouts/:weekDay/clear` | Add, remove, complete, and clear |
| Catalog | `GET /api/exercises` | Paginated and filtered search |
| Account | `DELETE /api/account` | Cascading account deletion |
| Health | `GET /api/health` | API health check |

## 🎨 Layout and design system

The design system contains HSL tokens, typography, reusable components, reference HTML pages, and visual previews in [`design-system/`](./design-system/). The application uses the Inter font and is designed for desktop and mobile screens.

## 🚀 Technologies

### Front-end

- [Next.js 16](https://nextjs.org/) and [React 19](https://react.dev/) — App Router web application;
- [TypeScript](https://www.typescriptlang.org/) — static typing;
- [Tailwind CSS](https://tailwindcss.com/) — responsive styling;
- [ShadCN](https://ui.shadcn.com/) with [Radix UI](https://www.radix-ui.com/) and [Class Variance Authority](https://cva.style/docs) — accessible components and visual variants;
- [TanStack Query](https://tanstack.com/query) — server-state caching;
- [Axios](https://axios-http.com/) — API communication;
- [Zod](https://zod.dev/) — HTTP contract validation;
- [Jest](https://jestjs.io/) and [Testing Library](https://testing-library.com/) — automated tests.

### Back-end

- [Express 5](https://expressjs.com/) — REST API;
- [Prisma 7](https://www.prisma.io/) with [PostgreSQL](https://www.postgresql.org/) 16 and the `pg` driver — data persistence;
- [Google Auth Library](https://cloud.google.com/nodejs/docs/reference/google-auth-library/latest) — Google OAuth 2.0 authentication;
- [JSON Web Token](https://jwt.io/) — authenticated sessions valid for 24 hours;
- [Swagger/OpenAPI](https://swagger.io/specification/) — interactive API documentation;
- [Zod](https://zod.dev/) — input and response validation.

### Infrastructure

- [Docker Compose](https://docs.docker.com/compose/) — local PostgreSQL for development;
- [Vercel](https://vercel.com/) — application hosting;
- [Neon](https://neon.tech/) — PostgreSQL for production.

## ✅ Tests and validation

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

## 📁 Project structure

```text
frontend/             # Next.js application, pages, and components
backend/              # Express API, Prisma, authentication, and seed
design-system/        # Visual tokens, components, and previews
.github/img/          # Documentation images
docker-compose.yml    # Local PostgreSQL
specification.md      # Requirements and business rules
```

## 🤔 Contributing

1. Fork the project;
2. Create a branch for your change: `git checkout -b my-new-feature`;
3. Install dependencies and run the tests for the changed module;
4. Commit using Conventional Commits: `git commit -m 'feat: add a new feature'`;
5. Push the branch: `git push origin my-new-feature`;
6. Open a Pull Request;
7. After the merge, you can delete your branch.

---

Made with 💟 by José Guilherme Paro Monteiro Tomaine. [Get in touch!](https://www.linkedin.com/in/jos%C3%A9-guilherme-paro-monteiro-tomaine/)
