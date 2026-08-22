import { useAuth } from '../hooks/useAuth';
import { Navigate } from "react-router";
import Loader from "./Loader";

function Protected({ children }) {
  const { loading, user } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default Protected;