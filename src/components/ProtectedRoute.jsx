import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, authReady } = useAuth();

  if (!authReady) {
    return <div className="screen-loader">Opening the vault</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
