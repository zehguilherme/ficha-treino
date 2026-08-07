import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { HomeIcon } from '@/components/ui/HomeIcon';

const NotFoundPage = () => {
  return (
    <>
      <Header />

      <main className="flex-1 flex items-center justify-center px-6 py-8 bg-background max-sm:px-4">
        <div className="bg-card border border-border rounded-[calc(var(--radius)+0.25rem)] px-10 py-12 max-w-[26rem] w-full text-center max-sm:px-6 max-sm:py-8">
          <p className="text-[5rem] font-extrabold leading-none tracking-[-0.04em] mb-2">404</p>
          <p className="text-lg font-medium leading-[1.5] mb-3">
            Esse exercício não existe na sua ficha
          </p>
          <p className="text-sm text-muted-foreground leading-[1.5] mb-8">
            Parece que você tentou pegar um haltere que não está no rack. Respira, volta pro início
            e tenta de novo.
          </p>
          <Button variant="outline" asChild className="px-5 py-2">
            <Link href="/">
              <HomeIcon className="size-3.5" />
              Voltar para Home
            </Link>
          </Button>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default NotFoundPage;
