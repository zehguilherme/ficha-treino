-- ============================================================
-- schema.sql — DOCUMENTAÇÃO DE REFERÊNCIA
--
-- Este arquivo descreve a estrutura do banco em SQL puro.
-- A implementação real é gerenciada via Prisma ORM.
-- Consulte o final do arquivo para o schema Prisma equivalente.
--
-- Legenda dos comentários:
--   PRISMA: <modelo/atributo Prisma equivalente>
-- ============================================================

-- ENUM
-- PRISMA: enum WeekDay { DOMINGO SEGUNDA TERCA QUARTA QUINTA SEXTA SABADO }
CREATE TYPE WEEK_DAY AS ENUM('DOMINGO', 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO');

-- USERS
-- PRISMA: model User {
-- PRISMA:   @@map("users")
-- PRISMA: }
CREATE TABLE USERS(
	-- PRISMA: id Int @id @default(autoincrement())
	ID INTEGER GENERATED ALWAYS AS IDENTITY,
	-- PRISMA: googleId String @unique @map("google_id") @db.VarChar(255)
	GOOGLE_ID VARCHAR(255) NOT NULL,
	-- PRISMA: name String @db.VarChar(255)
	NAME VARCHAR(255) NOT NULL,
	-- PRISMA: email String @db.VarChar(255)
	EMAIL VARCHAR(255) NOT NULL,
	-- PRISMA: createdAt DateTime @default(now()) @map("created_at")
	CREATED_AT TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	-- PRISMA: updatedAt DateTime @updatedAt @map("updated_at")
	UPDATED_AT TIMESTAMPTZ NOT NULL
);

-- WORKOUTS
-- PRISMA: model Workout {
-- PRISMA:   @@map("workouts")
-- PRISMA: }
CREATE TABLE WORKOUTS(
	-- PRISMA: id Int @id @default(autoincrement())
	ID INTEGER GENERATED ALWAYS AS IDENTITY,
	-- PRISMA: userId Int @map("user_id")
	USER_ID INTEGER NOT NULL,
	-- PRISMA: weekDay WeekDay @map("week_day")
	WEEK_DAY WEEK_DAY NOT NULL
);

-- EXERCISES
-- PRISMA: model Exercise {
-- PRISMA:   @@map("exercises")
-- PRISMA: }
CREATE TABLE EXERCISES(
	-- PRISMA: id String @id @db.VarChar(100)
	ID VARCHAR(100),
	-- PRISMA: name String @db.VarChar(255)
	NAME VARCHAR(255) NOT NULL,
	-- PRISMA: force String? @db.VarChar(10)
	FORCE VARCHAR(10),
	-- PRISMA: level String @db.VarChar(20)
	LEVEL VARCHAR(20) NOT NULL,
	-- PRISMA: mechanic String? @db.VarChar(10)
	MECHANIC VARCHAR(10),
	-- PRISMA: equipment String? @db.VarChar(50)
	EQUIPMENT VARCHAR(50),
	-- PRISMA: primaryMuscles String[] @map("primary_muscles")
	PRIMARY_MUSCLES TEXT[] NOT NULL,
	-- PRISMA: secondaryMuscles String[]? @map("secondary_muscles")
	SECONDARY_MUSCLES TEXT[],
	-- PRISMA: instructions String[]
	INSTRUCTIONS TEXT[] NOT NULL,
	-- PRISMA: category String @db.VarChar(30)
	CATEGORY VARCHAR(30) NOT NULL,
	-- PRISMA: images String[]
	IMAGES TEXT[] NOT NULL,
	-- PRISMA: createdAt DateTime @default(now()) @map("created_at")
	CREATED_AT TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	-- PRISMA: updatedAt DateTime @updatedAt @map("updated_at")
	UPDATED_AT TIMESTAMPTZ NOT NULL
);

-- WORKOUT_EXERCISES
-- PRISMA: model WorkoutExercise {
-- PRISMA:   @@map("workout_exercises")
-- PRISMA: }
CREATE TABLE WORKOUT_EXERCISES(
	-- PRISMA: id Int @id @default(autoincrement())
	ID INTEGER GENERATED ALWAYS AS IDENTITY,
	-- PRISMA: workoutId Int @map("workout_id")
	WORKOUT_ID INTEGER NOT NULL,
	-- PRISMA: exerciseId String @map("exercise_id")
	EXERCISE_ID VARCHAR(100) NOT NULL,
	-- PRISMA: done Boolean @default(false)
	DONE BOOLEAN DEFAULT FALSE NOT NULL,
	-- PRISMA: createdAt DateTime @default(now()) @map("created_at")
	CREATED_AT TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CONSTRAINTS
-- ============================================================

-- PRISMA: id Int @id @default(autoincrement())
ALTER TABLE USERS
ADD CONSTRAINT PK_USERS
PRIMARY KEY (ID);

-- PRISMA: googleId String @unique
ALTER TABLE USERS
ADD CONSTRAINT UQ_USERS_GOOGLE_ID
UNIQUE (GOOGLE_ID);

-- PRISMA: id Int @id @default(autoincrement())
ALTER TABLE WORKOUTS
ADD CONSTRAINT PK_WORKOUTS
PRIMARY KEY (ID);

-- PRISMA: user User @relation(fields: [userId], references: [id], onDelete: Cascade)
ALTER TABLE WORKOUTS
ADD CONSTRAINT FK_WORKOUTS_USERS
FOREIGN KEY (USER_ID)
REFERENCES USERS(ID)
ON DELETE CASCADE;

-- PRISMA: @@unique([userId, weekDay])
ALTER TABLE WORKOUTS ADD CONSTRAINT UQ_WORKOUTS_USER_WEEK_DAY UNIQUE (USER_ID,
WEEK_DAY);

-- PRISMA: id String @id
ALTER TABLE EXERCISES
ADD CONSTRAINT PK_EXERCISES
PRIMARY KEY (ID);

-- PRISMA: id Int @id @default(autoincrement())
ALTER TABLE WORKOUT_EXERCISES
ADD CONSTRAINT PK_WORKOUT_EXERCISES
PRIMARY KEY (ID);

-- PRISMA: workout Workout @relation(fields: [workoutId], references: [id], onDelete: Cascade)
ALTER TABLE WORKOUT_EXERCISES
ADD CONSTRAINT FK_WORKOUT_EXERCISES_WORKOUTS
FOREIGN KEY (WORKOUT_ID)
REFERENCES WORKOUTS(ID)
ON DELETE CASCADE;

-- PRISMA: exercise Exercise @relation(fields: [exerciseId], references: [id])
ALTER TABLE WORKOUT_EXERCISES
ADD CONSTRAINT FK_WORKOUT_EXERCISES_EXERCISES
FOREIGN KEY (EXERCISE_ID)
REFERENCES EXERCISES(ID);

-- PRISMA: @@unique([workoutId, exerciseId])
ALTER TABLE WORKOUT_EXERCISES ADD CONSTRAINT UQ_WORKOUT_EXERCISES_COMPOSITE UNIQUE (WORKOUT_ID,
EXERCISE_ID);

-- ============================================================
-- TRIGGERS FOR UPDATED_AT
-- PRISMA: substituído por @updatedAt em User.updatedAt e Exercise.updatedAt
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_exercises_updated_at
    BEFORE UPDATE ON exercises
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- PRISMA EQUIVALENT SCHEMA (v7+)
--
-- Cópia do schema Prisma que este SQL documenta.
-- A implementação real fica em backend/prisma/schema.prisma.
-- Connection URL configurada em backend/prisma.config.ts.
-- ============================================================
--
-- generator client {
--   provider            = "prisma-client"
--   output              = "../src/generated/prisma"
--   importFileExtension = "ts"
-- }
--
-- datasource db {
--   provider = "postgresql"
-- }
--
-- enum WeekDay {
--   DOMINGO
--   SEGUNDA
--   TERCA
--   QUARTA
--   QUINTA
--   SEXTA
--   SABADO
-- }
--
-- model User {
--   id        Int       @id @default(autoincrement())
--   googleId  String    @unique @map("google_id") @db.VarChar(255)
--   name      String    @db.VarChar(255)
--   email     String    @db.VarChar(255)
--   createdAt DateTime  @default(now()) @map("created_at")
--   updatedAt DateTime  @updatedAt @map("updated_at")
--   workouts  Workout[]
--
--   @@map("users")
-- }
--
-- model Workout {
--   id        Int               @id @default(autoincrement())
--   userId    Int               @map("user_id")
--   user      User              @relation(fields: [userId], references: [id], onDelete: Cascade)
--   weekDay   WeekDay           @map("week_day")
--   exercises WorkoutExercise[]
--
--   @@unique([userId, weekDay])
--   @@map("workouts")
-- }
--
-- model Exercise {
--   id               String             @id @db.VarChar(100)
--   name             String             @db.VarChar(255)
--   force            String?            @db.VarChar(10)
--   level            String             @db.VarChar(20)
--   mechanic         String?            @db.VarChar(10)
--   equipment        String?            @db.VarChar(50)
--   primaryMuscles   String[]           @map("primary_muscles")
--   secondaryMuscles String[]           @map("secondary_muscles")
--   instructions     String[]
--   category         String             @db.VarChar(30)
--   images           String[]
--   createdAt        DateTime           @default(now()) @map("created_at")
--   updatedAt        DateTime           @updatedAt @map("updated_at")
--   workoutExercises WorkoutExercise[]
--
--   @@map("exercises")
-- }
--
-- model WorkoutExercise {
--   id         Int      @id @default(autoincrement())
--   workoutId  Int      @map("workout_id")
--   workout    Workout  @relation(fields: [workoutId], references: [id], onDelete: Cascade)
--   exerciseId String   @map("exercise_id")
--   exercise   Exercise @relation(fields: [exerciseId], references: [id])
--   done       Boolean  @default(false)
--   createdAt  DateTime @default(now()) @map("created_at")
--
--   @@unique([workoutId, exerciseId])
--   @@map("workout_exercises")
-- }
