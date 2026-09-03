'use client';

import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { UserInitialsButton } from '@/components/layout/UserInitialsButton';

interface UserMenuProps {
  name: string;
  showAccountLink: boolean;
  onLogout: () => void;
}

export const UserMenu = ({ name, showAccountLink, onLogout }: UserMenuProps): React.JSX.Element => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <UserInitialsButton name={name} />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {showAccountLink ? (
        <DropdownMenuItem asChild>
          <Link href="/account">Minha conta</Link>
        </DropdownMenuItem>
      ) : null}
      <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={onLogout}>
        Sair
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
