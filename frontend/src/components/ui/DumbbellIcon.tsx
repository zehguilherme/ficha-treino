type DumbbellIconProps = {
  className?: string;
};

export const DumbbellIcon = ({ className = 'w-3.5 h-3.5 text-background' }: DumbbellIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M2.5 9.25a1.25 1.25 0 0 1 2.5 0v5.5a1.25 1.25 0 0 1-2.5 0v-5.5Zm3.5-2a1.25 1.25 0 0 1 2.5 0v9.5a1.25 1.25 0 0 1-2.5 0v-9.5Zm2.5 3.25h7v3h-7v-3Zm7-3.25a1.25 1.25 0 0 1 2.5 0v9.5a1.25 1.25 0 0 1-2.5 0v-9.5Zm3.5 2a1.25 1.25 0 0 1 2.5 0v5.5a1.25 1.25 0 0 1-2.5 0v-5.5Z" />
  </svg>
);
