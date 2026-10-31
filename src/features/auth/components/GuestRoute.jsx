import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../useAuth';
import { FullPageSpinner } from './FullPageSpinner';

// Login / register pages: a logged-in user is sent to the app instead
export function GuestRoute() {
  const { status } = useAuth();
  if (status === 'loading') return <FullPageSpinner />;
  if (status === 'authenticated') return <Navigate to="/" replace />;
  return <Outlet />;
}
