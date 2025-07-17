import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface PublicRouteProps {
    children: ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
    const token = localStorage.getItem("token");
    if (token) {
        return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
};

export default PublicRoute;