'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AddExercisePage } from '@/components/workout/AddExercisePage';
import { Button } from '@/components/ui/Button';
import { DumbbellIcon } from '@/components/ui/DumbbellIcon';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { getWeekDayFromSlug, getWeekDaySlug } from '@/lib/weekDays';

const AddExerciseRoutePage = (): React.JSX.Element => {
  const params = useParams<{ weekDay: string }>();
  const router = useRouter();
  const { status } = useAuth();
  const weekDay = getWeekDayFromSlug(params.weekDay);

  if (status !== 'authenticated')
    return (
      <>
        <main className="flex-1 bg-background" />
        <Footer />
      </>
    );

  if (!weekDay)
    return (
      <>
        <Header />
        <main className="flex flex-1 items-center justify-center bg-background px-4 py-8 sm:px-6">
          <section
            aria-labelledby="invalid-add-exercise-title"
            className="w-full max-w-[26rem] rounded-[calc(var(--radius)+0.25rem)] border border-border bg-card px-10 py-12 text-center max-sm:px-6 max-sm:py-8"
          >
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <DumbbellIcon className="size-7" aria-hidden="true" />
            </div>
            <h1 id="invalid-add-exercise-title" className="text-xl font-semibold tracking-tight">
              Esse treino não existe
            </h1>
            <p className="mx-auto mt-3 max-w-[26rem] text-sm leading-6 text-muted-foreground">
              O endereço pode estar incorreto ou este dia não faz parte da sua ficha.
            </p>
            <Button asChild className="mt-8 w-full sm:w-auto">
              <Link href="/dashboard">Voltar para meus treinos</Link>
            </Button>
          </section>
        </main>
        <Footer />
      </>
    );

  return (
    <AddExercisePage
      weekDay={weekDay}
      onAdded={() => router.replace(`/workout/${getWeekDaySlug(weekDay)}`)}
    />
  );
};

export default AddExerciseRoutePage;
