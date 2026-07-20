import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FeatureCard } from "@/components/ui/FeatureCard";

const features = [
  {
    title: "Plano de treino",
    desc: "Monte sua ficha com exercícios organizados por dia da semana.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    title: "Acompanhe sua evolução",
    desc: "Marque exercícios como feitos e veja seu progresso semanal.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    title: "Simplicidade",
    desc: "Interface limpa e direta. Foco no que importa: seu treino.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export default function HomePage() {
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
            Ficha Treino
          </p>
          <h1 className="text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold leading-[1.08] tracking-[-0.03em] mb-5">
            Seu próximo shape
            <br />
            <em className="not-italic underline decoration-background/30 underline-offset-[0.2em] decoration-2">
              começa aqui
            </em>
          </h1>
          <p className="text-[clamp(1rem,2vw,1.125rem)] leading-relaxed text-background/80 max-w-lg mx-auto mb-10">
            Organize seus treinos, acompanhe cada exercício e evolua com
            consistência. O planejamento que separa quem sonha de quem
            conquista.
          </p>
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 text-[0.9375rem] font-semibold tracking-[0.02em] text-foreground bg-background rounded-[calc(var(--radius)+0.125rem)] px-8 py-3.5 transition-all hover:bg-background/90 hover:-translate-y-px hover:shadow-[0_4px_20px_hsl(222.2,84%,4.9%/0.2)]"
          >
            Começar agora
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-[3px]"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      <section className="w-full py-12 px-4 sm:py-20 sm:px-6 max-w-5xl mx-auto">
        <div className="flex flex-wrap justify-center gap-6">
          {features.map((f) => (
            <FeatureCard
              key={f.title}
              title={f.title}
              description={f.desc}
              icon={f.icon}
            />
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
