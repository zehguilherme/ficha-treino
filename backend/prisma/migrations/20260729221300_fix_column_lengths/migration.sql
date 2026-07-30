-- Drop FK before altering PK type
ALTER TABLE "workout_exercises" DROP CONSTRAINT "workout_exercises_exercise_id_fkey";

-- Increase column lengths
ALTER TABLE "exercises" ALTER COLUMN "id" TYPE VARCHAR(100);
ALTER TABLE "exercises" ALTER COLUMN "category" TYPE VARCHAR(30);
ALTER TABLE "workout_exercises" ALTER COLUMN "exercise_id" TYPE VARCHAR(100);

-- Re-add FK
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_exercise_id_fkey"
  FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
