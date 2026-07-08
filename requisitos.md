# Sistema de Controle de Treinos de Academia

# Objetivo do sistema

Desenvolver uma aplicação web para que usuários possam gerenciar seus treinos de academia de forma simples, acessando-os pelo navegador em computadores e dispositivos móveis.

O sistema permitirá que cada usuário monte seus treinos semanais utilizando exercícios sincronizados da API pública ExerciseDB OSS e armazenados no banco de dados da aplicação.

# Escopo

O sistema deverá permitir:

- Autenticação utilizando uma conta Google;
- Gerenciamento dos treinos semanais do usuário;
- Pesquisa de exercícios disponíveis no banco de dados da aplicação;
- Sincronização automática diária dos exercícios da API pública ExerciseDB OSS para o banco de dados da aplicação.
- Armazenamento no banco de dados das informações dos exercícios utilizados;
- Marcação manual dos exercícios concluídos.

O sistema **não** terá funcionalidades sociais, compartilhamento de treinos ou criação manual de exercícios.

# Casos de uso

## Autenticação

- Fazer login com Google.
- Fazer logout.
- Criar automaticamente um usuário no primeiro login.
- Excluir permanentemente a conta do usuário.

## Treinos

- Visualizar todos os treinos.
- Editar um treino
  - Um treino é editado exclusivamente através da adição ou remoção de exercícios.
- Remover exercícios do treino (individualmente)
- Limpar todas as marcações de um treino.

## Exercícios

- Pesquisar exercícios.
- Adicionar exercícios ao treino.
- Remover exercícios do treino.
- Marcar um exercício como realizado.
- Desmarcar um exercício.

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
- todos os exercícios pertencentes aos treinos.

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

Os exercícios terão como fonte de dados a API pública ExerciseDB OSS.

Após serem sincronizados pelo backend, os exercícios serão armazenados no banco de dados da aplicação.

As pesquisas realizadas pelos usuários consultarão exclusivamente o banco de dados da aplicação.

### Pesquisa

- A busca dos exercícios ocorrerá enquanto o usuário digita (debounce).
- A pesquisa será realizada no banco de dados da aplicação.
- O backend será responsável por consultar apenas os exercícios previamente sincronizados.

### Informações exibidas

Cada exercício deverá apresentar:

- nome;
- GIF de execução;
- categoria;
- equipamento;
- músculo principal;
- músculos secundários;
- instruções;
- checkbox **Feito**.

### Marcação

A marcação do checkbox será manual.

O estado do checkbox pertence à associação entre um treino e um exercício. O mesmo exercício pode estar marcado como concluído em um treino e não concluído em outro.

O estado permanecerá salvo até que:

- o usuário desmarque manualmente;
- ou utilize a funcionalidade **Limpar treino**.

### Categorias

A API define os nomes das categorias existentes para cada exercício

### Persistência

Os exercícios obtidos na ExerciseDB serão persistidos no banco de dados da aplicação.

A persistência tem como objetivo:

- reduzir dependência da API externa;
- manter os treinos funcionais mesmo sem acesso à API;
- permitir tradução dos dados para português;
- reduzir requisições repetidas para a API.

Durante a sincronização dos exercícios com a ExerciseDB OSS:

- os dados originais da API serão obtidos;
- os campos de vocabulário controlado (categoria, equipamento, músculos) serão traduzidos usando mapa estático no código;
- os campos de nome e instruções serão mantidos em inglês;
- o exercício será persistido ou atualizado no banco de dados.

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
- Caso um exercício já exista na tabela Exercício, ele não deverá ser criado novamente.
- O frontend nunca deverá consumir diretamente a ExerciseDB.
- Todas as pesquisas de exercícios deverão consultar apenas o banco de dados da aplicação.
- A sincronização da ExerciseDB é responsabilidade exclusiva do backend.
- Durante a sincronização, os campos de vocabulário controlado (categoria, equipamento, músculos) deverão ser traduzidos para português usando mapa estático; os campos de nome e instruções permanecem em inglês.
- Durante a sincronização, o sistema deverá criar novos exercícios e atualizar os já existentes utilizando o campo `api_exercise_id` como identificador único.

# Modelo conceitual

```
Usuário
──────────────
id
google_id
nome
email
created_at
updated_at

Treino
──────────────
id
usuario_id
dia_semana ENUM (DOMINGO, SEGUNDA, TERÇA, QUARTA, QUINTA, SEXTA, SABADO)
created_at
updated_at

Exercício
──────────────
id
api_exercise_id
nome
nome_original
categoria
categoria_original
equipamento
equipamento_original
musculo_principal
musculo_principal_original
musculos_secundarios
musculos_secundarios_original
instrucoes
gif_url
created_at
updated_at

Treino_Exercício
────────────────────
id
treino_id
exercicio_id
concluido BOOLEAN DEFAULT FALSE NOT NULL
created_at
updated_at
```

# API externa de exercícios

A aplicação utilizará a API pública ExerciseDB OSS como fonte oficial dos exercícios.

A API será utilizada exclusivamente pelo backend.

O frontend nunca realizará requisições diretamente para a ExerciseDB OSS.

## Sincronização

A sincronização dos exercícios será executada automaticamente todos os dias às 03:00 (horário do servidor) pelo backend.

Durante a sincronização, o backend deverá:

1. Consultar a ExerciseDB OSS.
2. Obter todos os exercícios disponíveis.
3. Traduzir para português os campos utilizados pela aplicação.
4. Criar os exercícios que ainda não existirem no banco de dados.
5. Atualizar os dados dos exercícios já existentes utilizando o `api_exercise_id` como identificador único.

Após a sincronização, todas as pesquisas de exercícios realizadas pelos usuários consultarão exclusivamente o banco de dados da aplicação.

A sincronização é incremental.

Para cada exercício retornado pela ExerciseDB:

- se não existir, deverá ser criado;
- se existir, deverá ser atualizado.

A sincronização nunca deverá remover exercícios da tabela Exercício.

### Logs da sincronização

Cada sincronização deverá registrar:

- data e hora de início;
- data e hora de término;
- duração;
- quantidade de exercícios criados;
- quantidade de exercícios atualizados;
- quantidade de falhas.

### Falha na sincronização

Caso uma sincronização falhe:

- os exercícios já existentes no banco de dados deverão permanecer disponíveis;
- a falha deverá ser registrada em log;
- a próxima sincronização deverá ocorrer normalmente no horário agendado.

## Tradução

A ExerciseDB OSS fornece todas as informações dos exercícios em inglês.

A tradução será feita por **mapa estático no código** (dicionário), sem o uso de APIs externas de tradução.

### Campos traduzidos por mapa estático

Os campos de vocabulário controlado (conjunto finito de termos) serão mapeados no código:

- `categoria` (bodyPart)
- `equipamento`
- `músculo principal` (target)
- `músculos secundários`

### Campos mantidos em inglês

Os campos abaixo serão armazenados e exibidos no idioma original da API:

- `nome`
- `instruções`

### Regras

- A tradução ocorre apenas durante a sincronização, nunca em tempo de execução.
- Os valores traduzidos são armazenados permanentemente no banco de dados.
- Se um termo novo (não mapeado) aparecer em uma sincronização futura, ele será armazenado em inglês e registrado em log para atualização manual do mapa.

Os seguintes campos da ExerciseDB OSS serão persistidos no banco de dados:

- api_exercise_id
- nome
- gif_url
- categoria (bodyPart)
- categoria_original
- equipamento
- equipamento_original
- músculo principal
- músculo_principal_original
- músculos secundários
- músculos_secundarios_original
- instruções

## Remoção

Caso um exercício deixe de existir na ExerciseDB OSS, ele permanecerá no banco de dados da aplicação enquanto existir associado a pelo menos um treino.

# Fluxos de autenticação

```
Usuário

↓

Clique em "Entrar com Google"

↓

Google OAuth 2.0 + OpenID Connect

↓

Frontend recebe o ID Token

↓

Frontend envia o token para a API

↓

API valida o token

↓

Procura usuário pelo google_id

↓

Existe?

├── Sim → gera sessão/JWT
└── Não → cria usuário → gera sessão/JWT

O JWT terá duração de 24 horas. Após sua expiração, o usuário deverá realizar um novo login.

↓

Frontend armazena o token (Local Storage)

↓

Usuário autenticado
```

# Fluxo de sincronização dos exercícios

```
Agendador diário

↓

Backend

↓

Consulta a ExerciseDB OSS

↓

Obtém todos os exercícios

↓

Traduz os campos necessários para português

↓

Verifica se o exercício já existe pelo api_exercise_id

↓

Existe?

├── Sim → Atualiza os dados
└── Não → Cria o exercício

↓

Salva no banco de dados

↓

Registra os resultados da sincronização em log

↓

Sincronização concluída
```

# Requisitos não funcionais

- Aplicação responsiva para desktop e dispositivos móveis.
- Comunicação entre frontend e backend utilizando HTTPS.
- API REST com troca de dados em JSON.
- Código-fonte escrito em TypeScript.
- Utilização do fuso horário do navegador do usuário para exibição de datas e horários, quando aplicável.
- Todas as rotas de gerenciamento de treinos e exercícios exigem autenticação.
- A aplicação deve tratar falhas da API externa sem comprometer o funcionamento dos treinos já cadastrados.
- Os dados persistidos devem manter integridade referencial no banco de dados.
- O sistema deve registrar logs de erros da API para facilitar diagnóstico.
- A sincronização diária deverá ser executada automaticamente pelo backend sem intervenção do usuário.
- A sincronização deverá ser idempotente, permitindo múltiplas execuções sem criar exercícios duplicados.
- A sincronização deverá registrar logs para auditoria e diagnóstico.
- A sincronização deverá utilizar o campo `api_exercise_id` como identificador único dos exercícios.

# Tecnologias

## Front-end

- Aplicação Next.js com App Router sem usar as rotas de API (https://nextjs.org/docs)
- TypeScript
- JWT
  - O JWT terá duração de 24 horas. Após sua expiração, o usuário deverá realizar um novo login.
- ESLint
- Prettier
- Estilização
  - Tailwind CSS (https://tailwindcss.com/docs/installation/using-vite)
  - Componentes do ShadCN (https://ui.shadcn.com/docs/installation)

## Back-end

- API
  - Node.js com Express (https://expressjs.com/en/5x/starter/installing/)
- API de exercícios
  - https://oss.exercisedb.dev/docs
- Arquitetura MVC para separação de responsabilidades
  - Model
  - View (a view será o próprio front-end em Next.js)
  - Controller
- Banco de dados relacional
  - PostgreSQL
  - Não vai ser usado ORM junto do banco de dados
- Docker com Docker Compose para subir os containers do banco e API (https://docs.docker.com/manuals/)

# Estrutura esperada do projeto
