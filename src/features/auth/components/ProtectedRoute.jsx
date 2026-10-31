import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../useAuth';
import { FullPageSpinner } from './FullPageSpinner';

// Wrap routes that need a logged-in user, optionally with specific roles.
// <Route element={<ProtectedRoute roles={['admin', 'superadmin']} />}> ... </Route>
// Note: this is for the user experience — the backend still checks every request.
export function ProtectedRoute({ roles }) {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullPageSpinner />;

  if (status !== 'authenticated') {
    // remember where the user wanted to go, to come back after login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
