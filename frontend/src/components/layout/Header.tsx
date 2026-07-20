import { Button } from "@/components/ui/Button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-[80rem] mx-auto px-6 h-14 flex items-center gap-3">
        <div className="w-7 h-7 bg-foreground rounded-md flex items-center justify-center shrink-0">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5 text-background"
          >
            <path d="M6.5 6.5 17.5 17.5" />
            <path d="M17.5 6.5 6.5 17.5" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
            <circle cx="5" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
          </svg>
        </div>
        <span className="text-base font-semibold tracking-tight">
          Ficha Treino
        </span>
        <div className="ml-auto">
          <Button variant="outline" href="/login">
            Entrar
          </Button>
        </div>
      </div>
    </header>
  );
}
