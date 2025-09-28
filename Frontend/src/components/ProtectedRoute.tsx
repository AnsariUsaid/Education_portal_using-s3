import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'teacher' | 'student';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
      navigate('/login');
      return;
    }

    if (requiredRole && role !== requiredRole) {
      // Redirect to appropriate dashboard if wrong role
      navigate(role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard');
      return;
    }
  }, [navigate, requiredRole]);

  return <>{children}</>;
}