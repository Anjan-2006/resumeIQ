import { useAuth } from '../hooks/useAuth';
import { Navigate } from "react-router";
import Loader from "./Loader";

function Protected({ children }) {
  const { loading, user } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    const isExpired = typeof window !== 'undefined' && sessionStorage.getItem('resumeiq_session_expired') === 'true';
    if (isExpired) {
      sessionStorage.removeItem('resumeiq_session_expired');
      return <Navigate to="/login?session_expired=true" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default Protected;