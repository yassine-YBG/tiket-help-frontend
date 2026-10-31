import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../useAuth';
import { FullPageSpinner } from './FullPageSpinner';

// Login / register pages: a logged-in user is sent to the app instead.
// Right after logging in, go back to the page the user asked for before login.
// ("from" comes from the router state set by ProtectedRoute, never from the URL,
// so it cannot be used to redirect someone to another website.)
export function GuestRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullPageSpinner />;
  if (status === 'authenticated') {
    const target = location.state?.from?.pathname || '/';
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}
