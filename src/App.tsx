import { lazy, Suspense, useEffect } from 'react';
import type { FC } from 'react';
import { useRoutes, useLocation, Navigate } from 'react-router-dom';
import { Spinner, YStack } from 'tamagui';

import { trackPageview } from './lib/analytics';
import { IS_PUBLIC } from './lib/auth';

import AuthGuard from './components/layout/AuthGuard';
import DocsLayout from './components/layout/DocsLayout';
import LoginPage from './pages/authentication/LoginPage';
import DocPage from './pages/docs/DocPage';
import DocsIndex from './pages/docs/DocsIndex';

// Lazy so Scalar (heavy) is split out of the main bundle.
const ApiReference = lazy(() => import('./pages/ApiReference'));

const App: FC = () => {
  const location = useLocation();
  useEffect(() => {
    trackPageview(location.pathname);
  }, [location.pathname]);

  const routes = useRoutes([
    // Public deploys skip the login screen entirely.
    { path: '/', element: IS_PUBLIC ? <Navigate to="/docs" replace /> : <LoginPage /> },
    { path: '/login', element: IS_PUBLIC ? <Navigate to="/docs" replace /> : <LoginPage /> },
    {
      path: '/docs',
      element: (
        <AuthGuard>
          <DocsLayout />
        </AuthGuard>
      ),
      children: [
        { index: true, element: <DocsIndex /> },
        // Specific route ranks above the splat — must exist or the splat would
        // try to load an api.mdx doc and 404. This is the Scalar API reference.
        {
          path: 'api',
          element: (
            <Suspense fallback={<Spinner size="large" margin="$8" />}>
              <ApiReference />
            </Suspense>
          ),
        },
        { path: '*', element: <DocPage /> },
      ],
    },
  ]);

  return (
    <YStack flex={1} backgroundColor="$background">
      {routes}
    </YStack>
  );
};

export default App;
