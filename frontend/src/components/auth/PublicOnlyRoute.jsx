import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";

const PublicOnlyRoute = () => {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-300">
        Preparing authentication...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicOnlyRoute;

