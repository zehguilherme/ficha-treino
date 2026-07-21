import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { FeatureCard } from '@/components/ui/FeatureCard';
import { DocumentIcon } from '@/components/ui/DocumentIcon';
import { ChartIcon } from '@/components/ui/ChartIcon';
import { ClockIcon } from '@/components/ui/ClockIcon';
import { ArrowRightIcon } from '@/components/ui/ArrowRightIcon';

const features = [
  {
    title: 'Plano de treino',
    desc: 'Monte sua ficha com exercícios organizados por dia da semana.',
    icon: <DocumentIcon />,
  },
  {
    title: 'Acompanhe sua evolução',
    desc: 'Marque exercícios como feitos e veja seu progresso semanal.',
    icon: <ChartIcon />,
  },
  {
    title: 'Simplicidade',
    desc: 'Interface limpa e direta. Foco no que importa: seu treino.',
    icon: <ClockIcon />,
  },
];

const HomePage = () => {
  return (
    <>
      <Header />

      <section className="relative min-h-[calc(100vh-3.5rem)] flex items-center overflow-hidden">
        <Image
          fill
          className="object-cover z-0"
          src="/hero-gym.jpg"
          alt="Academia organizada"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/75 to-foreground/45 z-[1]" />
        <div className="relative z-10 max-w-3xl mx-auto py-12 px-6 sm:py-16 sm:px-8 text-center text-white">
          <p className="text-xs font-medium tracking-[0.08em] uppercase text-background/80 mb-6">
            Ficha de Treino
          </p>
          <h1 className="text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold leading-[1.08] tracking-[-0.03em] mb-5">
            Seu próximo shape
            <br />
            <em className="not-italic underline decoration-background/30 underline-offset-[0.2em] decoration-2">
              começa aqui
            </em>
          </h1>
          <p className="text-[clamp(1rem,2vw,1.125rem)] leading-relaxed text-background/80 max-w-lg mx-auto mb-10">
            Organize seus treinos, acompanhe cada exercício e evolua com consistência. O
            planejamento que separa quem sonha de quem conquista.
          </p>
          <Button
            asChild
            className="group bg-background text-foreground font-semibold rounded-[calc(var(--radius)+0.125rem)] px-8 py-3.5 hover:bg-background/90 hover:-translate-y-px hover:shadow-[0_4px_20px_hsl(222.2,84%,4.9%/0.2)] text-[0.9375rem]"
          >
            <Link href="/login">
              Começar agora
              <ArrowRightIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-[3px]" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="w-full py-12 px-4 sm:py-20 sm:px-6 max-w-5xl mx-auto">
        <div className="flex flex-wrap justify-center gap-6">
          {features.map((f) => (
            <FeatureCard key={f.title} title={f.title} description={f.desc} icon={f.icon} />
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default HomePage;
