import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, isBootstrapping, user } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-300">
        Checking your session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="rounded-[28px] border border-amber-500/20 bg-amber-500/10 p-6 text-sm text-amber-100">
        Your role does not have access to this section.
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
