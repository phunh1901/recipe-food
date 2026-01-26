import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    // Chuyển sang login, lưu lại trang đang muốn vào
    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    // Không đủ quyền admin
    if (adminOnly && user?.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
