import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';

/** UI-Schutz für /app. Echte Autorisierung erfolgt serverseitig (RLS) – dies ist nur Navigation. */
export function ProtectedRoute() {
  const { session, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p className="p-8 text-slate-500">Lade …</p>;
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
