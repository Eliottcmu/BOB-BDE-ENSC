import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../../services/auth';

export const ProtectedRoute = ({ children }) => {
    const location = useLocation();

    if (!isAuthenticated()) {
        // Save the attempted URL for redirect after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};