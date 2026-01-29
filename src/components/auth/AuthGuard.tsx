import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PinSetup } from './PinSetup';
import { PinLogin } from './PinLogin';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isFirstAccess } = useAuth();

  if (isFirstAccess) {
    return <PinSetup />;
  }

  if (!isAuthenticated) {
    return <PinLogin />;
  }

  return <>{children}</>;
}
