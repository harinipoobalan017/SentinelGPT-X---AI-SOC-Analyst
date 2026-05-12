import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('sentinel_token');
  
  useEffect(() => {
    if (!token) return;
    
    // Auto-logout after 30 minutes of session
    const timer = setTimeout(() => {
      localStorage.removeItem('sentinel_token');
      localStorage.removeItem('sentinel_user');
      window.location.href = '/login';
    }, 30 * 60 * 1000);
    
    return () => clearTimeout(timer);
  }, [token]);

  if (!token) {
    return <Navigate to="/login?tab=register" replace />;
  }

  return <>{children}</>;
}
