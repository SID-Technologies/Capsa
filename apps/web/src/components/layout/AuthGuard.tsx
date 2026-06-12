import type { FC, ReactNode } from 'react';
import { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { Spinner, YStack, Paragraph } from 'tamagui';

import { useAuth } from '../../contexts/AuthContext';
import { IS_PUBLIC } from '../../lib/auth';

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard: FC<AuthGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated, isInitialized } = useAuth();

  useEffect(() => {
    if (IS_PUBLIC) return;
    if (!isInitialized) return;
    if (!isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isInitialized, isAuthenticated, navigate]);

  // Public by default (no auth configured) or dev-bypass → render through.
  if (IS_PUBLIC) {
    return <>{children}</>;
  }

  if (!isInitialized) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="100vh">
        <Spinner size="large" />
        <Paragraph marginTop="$4">Loading...</Paragraph>
      </YStack>
    );
  }

  if (!isAuthenticated) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" minHeight="100vh">
        <Spinner size="large" />
        <Paragraph marginTop="$4">Redirecting to login...</Paragraph>
      </YStack>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
