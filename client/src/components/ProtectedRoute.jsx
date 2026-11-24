import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { PageLoader } from './Feedback.jsx';

// Wrap private routes in this. Visitors are sent to /login and returned afterwards.
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Checking your session..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}
