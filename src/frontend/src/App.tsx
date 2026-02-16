import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useCurrentUserProfile';
import SignedOutScreen from './components/auth/SignedOutScreen';
import OnboardingPage from './pages/OnboardingPage';
import DiscoverPage from './pages/DiscoverPage';
import RequestsPage from './pages/RequestsPage';
import ChatsPage from './pages/ChatsPage';
import ChatDetailPage from './pages/ChatDetailPage';
import AppLayout from './components/layout/AppLayout';
import { useEffect } from 'react';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { identity, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;

  if (loginStatus === 'initializing') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SignedOutScreen />;
  }

  return <>{children}</>;
}

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (isFetched && userProfile === null) {
      navigate({ to: '/onboarding' });
    }
  }, [isFetched, userProfile, navigate]);

  if (isLoading || !isFetched) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

const rootRoute = createRootRoute({
  component: () => (
    <AuthGate>
      <Outlet />
    </AuthGate>
  ),
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  component: OnboardingPage,
});

const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'app-layout',
  component: () => (
    <OnboardingGate>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </OnboardingGate>
  ),
});

const discoverRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/',
  component: DiscoverPage,
});

const requestsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/requests',
  component: RequestsPage,
});

const chatsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/chats',
  component: ChatsPage,
});

const chatDetailRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/chats/$userId',
  component: ChatDetailPage,
});

const routeTree = rootRoute.addChildren([
  onboardingRoute,
  appLayoutRoute.addChildren([discoverRoute, requestsRoute, chatsRoute, chatDetailRoute]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
