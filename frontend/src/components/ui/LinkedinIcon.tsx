type LinkedinIconProps = {
  className?: string;
};

export const LinkedinIcon = ({ className = 'size-4' }: LinkedinIconProps) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9.75h3.96V21H3V9.75ZM9.5 9.75h3.8v1.54h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-3.96v-5.01c0-1.2-.02-2.75-1.68-2.75-1.68 0-1.94 1.31-1.94 2.66V21H9.5V9.75Z" />
  </svg>
);
