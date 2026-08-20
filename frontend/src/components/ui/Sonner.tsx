'use client';

import { Toaster as Sonner, type ToasterProps as SonnerToasterProps } from 'sonner';

const toasterClassNames = {
  toast: 'border',
  success: '!bg-success !text-success-foreground !border-success',
  warning: '!bg-warning !text-warning-foreground !border-warning',
  title: '!font-medium !text-current',
  description: '!text-current',
};

const Toaster = (props: SonnerToasterProps): React.JSX.Element => (
  <Sonner
    {...props}
    position="top-right"
    toastOptions={{
      ...props.toastOptions,
      classNames: {
        ...toasterClassNames,
        ...props.toastOptions?.classNames,
      },
    }}
  />
);

export { Toaster };
