import { Spinner } from '@/components/ui/Spinner';

export interface LoadingProps {
  message: string;
}

export const Loading = ({ message }: LoadingProps): React.JSX.Element => (
  <div aria-live="polite" className="flex flex-col items-center gap-3 text-center">
    <Spinner aria-label={message} className="size-6" />
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);
