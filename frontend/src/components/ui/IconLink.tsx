import Link from 'next/link';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

import { Button, type ButtonProps } from '@/components/ui/Button';

interface IconLinkProps extends Omit<ButtonProps, 'asChild' | 'children'> {
  href: string;
  icon: ReactNode;
  children?: ReactNode;
  rel?: AnchorHTMLAttributes<HTMLAnchorElement>['rel'];
  target?: AnchorHTMLAttributes<HTMLAnchorElement>['target'];
}

export const IconLink = ({ children, href, icon, ...props }: IconLinkProps): React.JSX.Element => (
  <Button asChild {...props}>
    <Link href={href}>
      {icon}
      {children}
    </Link>
  </Button>
);
