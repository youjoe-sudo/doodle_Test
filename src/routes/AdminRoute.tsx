import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, profileLoading, profile } = useAuth();
  const location = useLocation();

  if (loading || profileLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (profile?.is_banned) {
    return <Navigate to="/banned" replace />;
  }

  if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
