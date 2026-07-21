import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { DumbbellIcon } from "@/components/ui/DumbbellIcon";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-[80rem] mx-auto px-6 h-14 flex items-center gap-3">
        <div className="w-7 h-7 bg-foreground rounded-md flex items-center justify-center shrink-0">
          <DumbbellIcon />
        </div>
        <span className="text-base font-semibold tracking-tight">
          Ficha de Treino
        </span>
        <div className="ml-auto">
          <Button variant="outline" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
