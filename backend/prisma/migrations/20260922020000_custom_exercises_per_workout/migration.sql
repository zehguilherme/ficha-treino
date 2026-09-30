-- Move custom exercises from user ownership to exactly one workout.
ALTER TABLE "exercises" ADD COLUMN "custom_workout_id" INTEGER;

CREATE TEMP TABLE "custom_exercise_workout_map" AS
SELECT
  we."exercise_id",
  we."workout_id",
  ROW_NUMBER() OVER (PARTITION BY we."exercise_id" ORDER BY we."workout_id") AS "rank"
FROM "workout_exercises" we
JOIN "exercises" e ON e."id" = we."exercise_id"
WHERE e."is_custom" = true;

DELETE FROM "exercises" e
WHERE e."is_custom" = true
  AND NOT EXISTS (
    SELECT 1 FROM "custom_exercise_workout_map" m WHERE m."exercise_id" = e."id"
  );

UPDATE "exercises" e
SET "custom_workout_id" = m."workout_id"
FROM "custom_exercise_workout_map" m
WHERE m."exercise_id" = e."id" AND m."rank" = 1;

INSERT INTO "exercises" (
  "id", "name", "force", "level", "mechanic", "equipment",
  "primary_muscles", "secondary_muscles", "instructions", "category", "images",
  "custom_workout_id", "is_custom", "created_at", "updated_at"
)
SELECT
  'custom-' || md5(e."id" || ':' || m."workout_id"),
  e."name", e."force", e."level", e."mechanic", e."equipment",
  e."primary_muscles", e."secondary_muscles", e."instructions", e."category", e."images",
  m."workout_id", true, e."created_at", e."updated_at"
FROM "custom_exercise_workout_map" m
JOIN "exercises" e ON e."id" = m."exercise_id"
WHERE m."rank" > 1;

UPDATE "workout_exercises" we
SET "exercise_id" = 'custom-' || md5(we."exercise_id" || ':' || we."workout_id")
WHERE EXISTS (
  SELECT 1
  FROM "custom_exercise_workout_map" m
  WHERE m."exercise_id" = we."exercise_id"
    AND m."workout_id" = we."workout_id"
    AND m."rank" > 1
);

DROP INDEX "exercises_owner_id_idx";
ALTER TABLE "exercises" DROP CONSTRAINT "exercises_owner_id_fkey";
ALTER TABLE "exercises" DROP COLUMN "owner_id";

CREATE INDEX "exercises_custom_workout_id_idx" ON "exercises"("custom_workout_id");
ALTER TABLE "exercises"
  ADD CONSTRAINT "exercises_custom_workout_id_fkey"
  FOREIGN KEY ("custom_workout_id") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "workout_exercises" DROP CONSTRAINT "workout_exercises_exercise_id_fkey";
ALTER TABLE "workout_exercises"
  ADD CONSTRAINT "workout_exercises_exercise_id_fkey"
  FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "exercises"
  ADD CONSTRAINT "exercises_custom_workout_consistency_check"
  CHECK (("is_custom" = true AND "custom_workout_id" IS NOT NULL)
      OR ("is_custom" = false AND "custom_workout_id" IS NULL));
