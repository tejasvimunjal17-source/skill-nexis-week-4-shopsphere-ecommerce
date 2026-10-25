import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Loader } from './ui.jsx';

// This only controls what the PAGE shows. The real security check happens on the backend.
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <Loader text="Checking your login..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (adminOnly && !isAdmin) {
    return (
      <div className="container page">
        <div className="alert alert-error" role="alert">
          <strong>Access denied.</strong> This page is only for administrators.
        </div>
      </div>
    );
  }
  return children;
}
