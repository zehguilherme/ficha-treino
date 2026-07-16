# Sistema de Controle de Treinos de Academia

Aplicação web para gerenciamento de treinos de academia. Stack: Next.js + Express + PostgreSQL + Docker + TypeScript. Autenticação Google OAuth 2.0, dados de exercícios em PT-BR importados via seed, imagens JPG via CDN, sem dependência de API externa.

# Objetivo do sistema

Desenvolver uma aplicação web para que usuários possam gerenciar seus treinos de academia de forma simples, acessando-os pelo navegador em computadores e dispositivos móveis.

O sistema terá como base um conjunto de exercícios em português brasileiro importado do dataset open source [exercicios-bd-ptbr](https://github.com/joao-gugel/exercicios-bd-ptbr), armazenado no banco de dados da aplicação.

# Escopo

O sistema deverá permitir:

- Autenticação utilizando uma conta Google;
- Gerenciamento dos treinos semanais do usuário;
- Pesquisa de exercícios disponíveis no banco de dados da aplicação;
- Armazenamento no banco de dados das informações dos exercícios utilizados;
- Marcação manual dos exercícios concluídos.

O sistema **não** terá funcionalidades sociais, compartilhamento de treinos ou criação manual de exercícios.

# Funcionalidades

## Usuários

### Login

A autenticação deverá utilizar OAuth 2.0 do Google.

O sistema não possuirá cadastro tradicional utilizando e-mail e senha.

### Cadastro

Após o primeiro login via Google:

1. verificar se o usuário já existe;
2. caso não exista, criar automaticamente um novo usuário;
3. permitir o acesso ao sistema.

### Dados armazenados

O sistema armazenará apenas:

- nome;
- e-mail;
- identificador único da conta Google.

Nenhuma senha será armazenada.

### Atualização dos dados do usuário

Caso alguma informação do usuário seja alterada na sua conta do Google, ela deve ser atualizada automaticamente após fazer um novo login.

### Logout

O usuário poderá encerrar sua sessão a qualquer momento.

### Exclusão da conta

Ao excluir a conta deverão ser removidos permanentemente:

- usuário;
- todos os treinos;
- todas as associações de exercícios aos treinos.

A exclusão da conta é permanente e irreversível.

```
Usuário

↓

Treinos

↓

Treino_Exercício
```

### O que acontece se o usuário perder acesso à conta Google?

O acesso ao sistema depende exclusivamente da autenticação pela conta Google. Caso o usuário perca acesso à sua conta Google, também perderá o acesso aos dados armazenados no sistema.

## Treinos

Cada usuário possuirá exatamente **um treino para cada dia da semana**.

Dias disponíveis:

- Domingo
- Segunda-feira
- Terça-feira
- Quarta-feira
- Quinta-feira
- Sexta-feira
- Sábado

Cada treino poderá conter **zero ou mais exercícios**.

O usuário poderá editar apenas seus próprios treinos.

### Editar treino

Um treino é editado exclusivamente através da adição ou remoção de exercícios.

Não será permitido:

- alterar a ordem dos exercícios.

### Remover exercícios do treino

A remoção é individual — o usuário remove exercícios específicos, um por vez.

O treino nunca é excluído.

Apenas os exercícios.

O registro do treino continua existindo no banco.

### Exibição

Ao visualizar um treino:

- os exercícios deverão ser exibidos em ordem alfabética;
- essa ordenação não poderá ser alterada pelo usuário.

### Limpar treino

Cada treino possuirá um botão **Limpar treino**.

Essa ação deverá:

- desmarcar todos os exercícios daquele treino.

Essa ação **não deverá** remover exercícios.

## Exercícios

Os exercícios têm como fonte o dataset open source [exercicios-bd-ptbr](https://github.com/joao-gugel/exercicios-bd-ptbr), traduzido para português brasileiro.

Os dados são importados para o banco de dados da aplicação uma única vez, durante o setup inicial (seed).

Não há sincronização periódica com API externa.

### Pesquisa

- A busca dos exercícios ocorrerá enquanto o usuário digita (debounce).
- A pesquisa será realizada no banco de dados da aplicação.

### Informações exibidas

Cada exercício deverá apresentar:

- nome (em português);
- imagem JPG de execução;
- categoria;
- equipamento;
- músculo principal;
- músculos secundários;
- instruções (em português);
- checkbox **Feito**.

### Marcação

A marcação do checkbox será manual.

O estado do checkbox pertence à associação entre um treino e um exercício. O mesmo exercício pode estar marcado como concluído em um treino e não concluído em outro.

O estado permanecerá salvo até que:

- o usuário desmarque manualmente;
- ou utilize a funcionalidade **Limpar treino**.

### Categorias

O dataset define os valores de categoria, equipamento e músculos já em português brasileiro.

### Imagens

As imagens de execução são servidas via CDN do repositório [free-exercise-db](https://github.com/yuhonas/free-exercise-db) no formato JPG.

Cada exercício possui duas imagens (0.jpg e 1.jpg), acessíveis pela URL:

```
https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/{exercise_id}/{indice}.jpg
```

# Regras de negócio

- Apenas usuários autenticados podem acessar o sistema.
- Cada usuário possui exatamente um treino para cada dia da semana.
- Cada treino pertence exclusivamente a um usuário.
- Um treino pode possuir zero ou mais exercícios.
- Um exercício pode aparecer em um ou mais treinos, mas o mesmo exercício não pode estar 2 vezes ou mais no mesmo treino
  - Exemplo permitido
    - Treino de segunda-feira: Esteira
    - Treino de sexta-feira: Esteira
  - Exemplo não permitido
    - Treino de segunda-feira: Esteira
    - Treino de segunda-feira: Esteira
- Um usuário somente poderá visualizar e modificar seus próprios treinos.
- A exclusão de um usuário removerá todos os dados associados.
- Os exercícios serão exibidos em ordem alfabética.
- A ordenação dos exercícios não poderá ser alterada pelo usuário.
- O botão **Limpar treino** apenas desmarca exercícios.
- A marcação dos exercícios é persistida até alteração manual ou limpeza do treino.
- Criação dos treinos
  - Após o primeiro login, o sistema criará automaticamente sete treinos, um para cada dia da semana, inicialmente sem exercícios. O usuário poderá adicionar exercícios a qualquer treino quando desejar.
- Os dados dos exercícios são importados uma única vez via script de seed, utilizando `exercise_id` como identificador único.
- O frontend nunca deverá consumir API externa de exercícios.
- Todas as pesquisas de exercícios deverão consultar apenas o banco de dados da aplicação.

# Modelo conceitual

```
Users
──────────────
id                   SERIAL (PK)
google_id            VARCHAR(255) NOT NULL UNIQUE
name                 VARCHAR(255) NOT NULL
email                VARCHAR(255) NOT NULL
created_at
updated_at

Workouts
──────────────
id                   SERIAL (PK)
user_id              INTEGER NOT NULL (FK → Users.id)
week_day             ENUM (DOMINGO, SEGUNDA, TERÇA, QUARTA, QUINTA, SEXTA, SABADO) NOT NULL

UNIQUE (user_id, week_day)

Exercises
──────────────
id                   VARCHAR(50) (PK)
name                 VARCHAR(255) NOT NULL
force                VARCHAR(10)
level                VARCHAR(20) NOT NULL
mechanic             VARCHAR(10)
equipment            VARCHAR(50)
primary_muscles      TEXT[] NOT NULL
secondary_muscles    TEXT[]
instructions         TEXT[] NOT NULL
category             VARCHAR(20) NOT NULL
images               TEXT[] NOT NULL
created_at
updated_at

Workout_Exercises
────────────────────
id                   SERIAL (PK)
workout_id           INTEGER NOT NULL (FK → Workouts.id)
exercise_id          VARCHAR(50) NOT NULL (FK → Exercises.id)
done                 BOOLEAN DEFAULT FALSE NOT NULL
created_at

UNIQUE (workout_id, exercise_id)
```

# Fonte de dados de exercícios

O sistema utiliza o dataset open source [exercicios-bd-ptbr](https://github.com/joao-gugel/exercicios-bd-ptbr) como fonte dos exercícios.

Trata-se de um arquivo JSON com mais de 800 exercícios já traduzidos para o português brasileiro, baseado no repositório [free-exercise-db](https://github.com/yuhonas/free-exercise-db).

## Seed

A importação dos dados ocorre uma única vez através de um script de seed executado durante o setup inicial da aplicação.

O script de seed faz download do JSON do GitHub, faz upsert dos exercícios usando o campo `id` do JSON como PK, e armazena o array `images`. Exercícios que deixaram de existir no dataset são removidos apenas se não estiverem associados a nenhum treino.

### Imagens

Servidas via CDN (jsDelivr):

```
https://cdn.jsdelivr.net/gh/yohonas/free-exercise-db@main/exercises/{exercise_id}/0.jpg
https://cdn.jsdelivr.net/gh/yohonas/free-exercise-db@main/exercises/{exercise_id}/1.jpg
```

Cada exercício possui duas imagens no formato JPG.

# Fluxos de autenticação

1. Usuário clica "Entrar com Google" → Google OAuth 2.0 + OpenID Connect
2. Frontend recebe o ID Token e envia para a API
3. API valida o token, procura usuário pelo `google_id`
4. Se existe → gera JWT. Se não → cria usuário → gera JWT
5. Frontend armazena o JWT no localStorage

O JWT expira em 24h, sem refresh token. Após expirar, o usuário deve refazer o login. O frontend verifica a expiração e redireciona para o login quando necessário.

# Requisitos não funcionais

- Aplicação responsiva para desktop e dispositivos móveis.
- Comunicação entre frontend e backend utilizando HTTPS.
- API REST com troca de dados em JSON.
- Código-fonte escrito em TypeScript.
- Todas as rotas de gerenciamento de treinos e exercícios exigem autenticação, exceto rotas de autenticação.
- Os dados persistidos devem manter integridade referencial no banco de dados.
- O sistema não depende de API externa para funcionamento dos treinos.

# Tecnologias

## Compartilhados

- TypeScript
- Zod — validação de dados no frontend e backend (https://zod.dev)
- Variáveis de ambiente: dotenv no backend, Next.js com suporte nativo a `.env.local` no frontend + validação via Zod
- ESLint
- Prettier
- Jest — testes unitários e de integração

## Autenticação

- JWT (gerado e validado pelo backend, armazenado no localStorage do frontend)
- Validade: 24 horas, sem refresh token (https://jwt.io)
- `@react-oauth/google` (frontend) — Google Sign-In
- `google-auth-library` (backend) — validação do ID Token

## Front-end

- Next.js com App Router, sem usar rotas de API (https://nextjs.org/docs)
- Gerenciamento de estado com `useState` e `useEffect`
- Estilização
  - Tailwind CSS (https://tailwindcss.com/docs/installation/framework-guides/nextjs)
  - ShadCN (https://ui.shadcn.com/docs/installation)
- TypeScript (compartilhado)
- Zod (compartilhado)
- Jest (compartilhado)

## Back-end

- Node.js com Express (https://expressjs.com/en/starter/installing.html)
- SQL puro (raw SQL) com `pg` (node-postgres)
- Docker + Docker Compose para subir os containers do banco

## Arquitetura

- API REST com frontend separado (inspirada em MVC)
  - Model: banco de dados + raw SQL
  - View: front-end Next.js
  - Controller: rotas Express

# Estrutura esperada do projeto
