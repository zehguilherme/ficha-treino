import Link from "next/link";

type ButtonProps = {
  variant?: "primary" | "outline" | "ghost";
  href?: string;
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({
  variant = "primary",
  href,
  className = "",
  children,
  ...props
}: ButtonProps) => {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium tracking-[0.02em] rounded-[var(--radius)] transition-all duration-150 text-[0.8125rem]";

  const variants = {
    primary:
      "bg-foreground text-primary-foreground px-3 py-1.5 hover:opacity-85",
    outline:
      "border border-border text-foreground px-3 py-1.5 hover:bg-secondary",
    ghost:
      "border border-border text-muted-foreground px-2 py-1 hover:bg-secondary",
  };

  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
