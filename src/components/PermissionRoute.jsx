import React from 'react';
import { useAuth } from '../hooks/useAuth';

// Component to wrap routes that need permission checking
const PermissionRoute = ({
    children,
    requiredPermission,
    fallbackComponent = null,
    showDisabled = true
}) => {
    const { hasPermission } = useAuth();
    const hasAccess = hasPermission(requiredPermission);

    // If no permission required, render normally
    if (!requiredPermission) {
        return children;
    }

    // If user doesn't have permission
    if (!hasAccess) {
        // If showDisabled is true, render with disabled styling
        if (showDisabled) {
            return (
                <div
                    style={{
                        pointerEvents: 'none',
                        opacity: 0.5,
                        cursor: 'not-allowed'
                    }}
                    title="You don't have permission to access this feature"
                >
                    {children}
                </div>
            );
        }

        // If fallback component provided, show it
        if (fallbackComponent) {
            return fallbackComponent;
        }

        // Otherwise, show access denied message
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="text-6xl text-gray-300 mb-4">🔒</div>
                    <h2 className="text-xl font-semibold text-gray-600 mb-2">
                        Access Denied
                    </h2>
                    <p className="text-gray-500">
                        You don't have permission to access this feature.
                    </p>
                </div>
            </div>
        );
    }

    // User has permission, render normally
    return children;
};

export default PermissionRoute;