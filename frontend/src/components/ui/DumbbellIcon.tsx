type DumbbellIconProps = {
  className?: string;
};

export const DumbbellIcon = ({ className = "w-3.5 h-3.5 text-background" }: DumbbellIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6.5 6.5 17.5 17.5" />
    <path d="M17.5 6.5 6.5 17.5" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
    <circle cx="5" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
  </svg>
);
