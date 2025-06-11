import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { ROUTES } from '../utils/constants.js';

const ProtectedRoute = ({ children, requiredPermission }) => {
    const { isAuthenticated, loading, hasPermission, refreshPermissions } = useAuth();
    const location = useLocation();

    // Refresh permissions when component mounts to ensure we have latest permissions
    useEffect(() => {
        if (isAuthenticated && !loading) {
            refreshPermissions();
        }
    }, [isAuthenticated, loading, refreshPermissions]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirection 
        return <Navigate to={ROUTES.SIGN_IN} state={{ from: location }} replace />;
    }

    // Check for specific permission if required
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600">You don't have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;