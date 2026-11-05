import { createBrowserRouter } from 'react-router-dom';
import { AuthHydrator, RequireAuth, GuestOnly, AuthGate } from './guards';
import { LoginPage } from '../../features/auth/LoginPage';
import { RegisterPage } from '../../features/auth/RegisterPage';
import { PlayerShell } from '../../features/home/PlayerShell';
import { HomePage } from '../../features/home/HomePage';
import { TurfListPage } from '../../features/turf/TurfListPage';
import { TurfDetailPage } from '../../features/turf/TurfDetailPage';
import { CheckoutPage } from '../../features/booking/CheckoutPage';
import { PaymentSuccessPage } from '../../features/booking/PaymentSuccessPage';
import { MyBookingsPage } from '../../features/booking/MyBookingsPage';
import { TeamsPage } from '../../features/teams/TeamsPage';
import { TeamDetailPage } from '../../features/teams/TeamDetailPage';
import { CreateTeamPage } from '../../features/teams/CreateTeamPage';
import { ProfilePage } from '../../features/profile/ProfilePage';
import { EditProfilePage } from '../../features/profile/EditProfilePage';
import { AdminShell } from '../../features/admin/AdminShell';
import { DashboardPage } from '../../features/admin/DashboardPage';
import { ManageTurfsPage } from '../../features/admin/ManageTurfsPage';
import { TurfFormPage } from '../../features/admin/TurfFormPage';
import { ManageSlotsPage } from '../../features/admin/ManageSlotsPage';
import { AdminBookingsPage } from '../../features/admin/AdminBookingsPage';
import { AdminProfilePage } from '../../features/admin/AdminProfilePage';
import { NotFoundPage } from '../../features/NotFoundPage';
import { LandingPage } from '../../features/LandingPage';

export const appRouter = createBrowserRouter([
  {
    element: <AuthGate />,
    children: [
  { path: '/login', element: <GuestOnly><LoginPage /></GuestOnly> },
  { path: '/register', element: <GuestOnly><RegisterPage /></GuestOnly> },

  {
    element: <RequireAuth />,
    children: [
      {
        path: '/home',
        element: <RequireAuth player><PlayerShell /></RequireAuth>,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'turfs', element: <TurfListPage /> },
          { path: 'turf/:id', element: <TurfDetailPage /> },
          { path: 'checkout/:slotId', element: <CheckoutPage /> },
          { path: 'payment-success/:bookingId', element: <PaymentSuccessPage /> },
          { path: 'bookings', element: <MyBookingsPage /> },
          { path: 'teams', element: <TeamsPage /> },
          { path: 'teams/create', element: <CreateTeamPage /> },
          { path: 'teams/:id', element: <TeamDetailPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'profile/edit', element: <EditProfilePage /> },
        ],
      },
      {
        element: <RequireAuth admin />,
        children: [
          {
            path: '/admin',
            element: <AdminShell />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: 'turfs', element: <ManageTurfsPage /> },
              { path: 'turfs/new', element: <TurfFormPage /> },
              { path: 'turfs/:id/edit', element: <TurfFormPage /> },
              { path: 'slots', element: <ManageSlotsPage /> },
              { path: 'bookings', element: <AdminBookingsPage /> },
              { path: 'profile', element: <AdminProfilePage /> },
            ],
          },
        ],
      },
    ],
  },

  { path: '/', element: <LandingPage /> },
  { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export { AuthHydrator, AuthGate };
