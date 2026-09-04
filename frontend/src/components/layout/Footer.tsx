import { GlobeIcon } from '@/components/ui/GlobeIcon';
import { GithubIcon } from '@/components/ui/GithubIcon';
import { IconLink } from '@/components/ui/IconLink';
import { LinkedinIcon } from '@/components/ui/LinkedinIcon';
import { MailIcon } from '@/components/ui/MailIcon';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
      <p className="mb-1 font-medium text-foreground">Ficha de Treino — Seu treino organizado</p>
      <p className="mb-4">Todos os direitos reservados © {currentYear}</p>
      <div className="flex justify-center gap-2">
        <IconLink
          aria-label="Portfólio"
          href="https://joseguilherme.vercel.app/"
          rel="noreferrer"
          target="_blank"
          title="Portfólio"
          variant="ghost"
          size="icon"
          icon={<GlobeIcon />}
        />
        <IconLink
          aria-label="GitHub"
          href="https://github.com/zehguilherme"
          rel="noreferrer"
          target="_blank"
          title="GitHub"
          variant="ghost"
          size="icon"
          icon={<GithubIcon />}
        />
        <IconLink
          aria-label="LinkedIn"
          href="https://www.linkedin.com/in/jos%C3%A9-guilherme-paro-monteiro-tomaine/"
          rel="noreferrer"
          target="_blank"
          title="LinkedIn"
          variant="ghost"
          size="icon"
          icon={<LinkedinIcon />}
        />
        <IconLink
          aria-label="E-mail"
          href="mailto:jgtomaine@hotmail.com"
          title="E-mail"
          variant="ghost"
          size="icon"
          icon={<MailIcon />}
        />
      </div>
    </footer>
  );
};
