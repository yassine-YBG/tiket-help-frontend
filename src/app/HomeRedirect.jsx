import { Navigate } from 'react-router';
import { useAuth } from '@/features/auth/useAuth';
import { isAdmin } from '@/lib/constants';

// "/" sends each role to its main page
export default function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={isAdmin(user) ? '/admin/dashboard' : '/tickets'} replace />;
}
