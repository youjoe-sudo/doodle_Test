import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
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

  return children;
};