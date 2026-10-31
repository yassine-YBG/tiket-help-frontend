import { createBrowserRouter } from 'react-router';
import { ADMIN_ROLES } from '@/lib/constants';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { GuestRoute } from '@/features/auth/components/GuestRoute';
import { FullPageSpinner } from '@/features/auth/components/FullPageSpinner';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import HomeRedirect from './HomeRedirect';
import NotFoundPage from './NotFoundPage';
import RouteError from './RouteError';

// Pages are loaded only when visited (smaller first download)
const page = (load) => () => load().then((module) => ({ Component: module.default }));

export const router = createBrowserRouter([
  // Public: only for visitors who are not logged in
  {
    element: <GuestRoute />,
    errorElement: <RouteError />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },

  // Logged in: any role
  {
    element: <ProtectedRoute />,
    errorElement: <RouteError />,
    HydrateFallback: FullPageSpinner,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            // a crash in one page shows RouteError inside the layout (the menu still works)
            errorElement: <RouteError />,
            children: [
              { index: true, path: '/', element: <HomeRedirect /> },
              { path: '/tickets', lazy: page(() => import('@/features/tickets/pages/MyTicketsPage')) },
              { path: '/tickets/new', lazy: page(() => import('@/features/tickets/pages/NewTicketPage')) },
              { path: '/tickets/:id', lazy: page(() => import('@/features/tickets/pages/TicketDetailPage')) },
              { path: '/profile', lazy: page(() => import('@/features/profile/pages/ProfilePage')) },

              // Admin and superadmin only
              {
                element: <ProtectedRoute roles={ADMIN_ROLES} />,
                children: [
                  { path: '/admin/dashboard', lazy: page(() => import('@/features/dashboard/pages/DashboardPage')) },
                  { path: '/admin/tickets', lazy: page(() => import('@/features/tickets/pages/AllTicketsPage')) },
                  { path: '/admin/users', lazy: page(() => import('@/features/users/pages/UsersPage')) },
                  { path: '/admin/users/pending', lazy: page(() => import('@/features/users/pages/PendingUsersPage')) },
                  { path: '/admin/activity', lazy: page(() => import('@/features/activity/pages/ActivityLogsPage')) },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
]);
