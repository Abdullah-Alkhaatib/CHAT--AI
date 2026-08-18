import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
    const {
        isAuthenticated,
        loading,
    } = useAuth();

    // Wait until localStorage is checked
    if (loading) {
        return (
            <div className="auth-loading">
                Loading...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;