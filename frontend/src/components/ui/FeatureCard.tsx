type FeatureCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

export const FeatureCard = ({ title, description, icon }: FeatureCardProps) => {
  return (
    <div className="flex-1 basis-[14rem] sm:max-w-[calc(50%-0.75rem)] bg-card border border-border rounded-[calc(var(--radius)+0.125rem)] p-6 text-center transition-colors duration-150 hover:border-ring/10">
      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-[0.9375rem] font-semibold mb-1.5">{title}</h3>
      <p className="text-[0.8125rem] text-muted-foreground leading-[1.5]">{description}</p>
    </div>
  );
};
