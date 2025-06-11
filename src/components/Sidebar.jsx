import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard,
    Bell,
    PlusCircle,
    Package,
    Wallet,
    BarChart3,
    Settings,
    LogOut,
    X,
    Clock,
    Lock
} from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import { useAuth } from '../hooks/useAuth'

const Sidebar = ({ onClose }) => {
    const { user, signOut } = useContext(AuthContext)
    const { hasPermission } = useAuth()

    const navigation = [
        {
            name: 'Dashboard',
            href: '/',
            icon: LayoutDashboard,
            permission: null // No permission required
        },
        {
            name: 'Notifications',
            href: '/notifications',
            icon: Bell,
            permission: null // No permission required
        },
        {
            name: 'Manual Order',
            href: '/manual-order',
            icon: PlusCircle,
            permission: 'BILLING'
        },
        {
            name: 'Order History',
            href: '/order-history',
            icon: Clock,
            permission: 'BILLING'
        },
        {
            name: 'Inventory',
            href: '/inventory',
            icon: Package,
            permission: 'INVENTORY'
        },
        {
            name: 'Wallet',
            href: '/wallet',
            icon: Wallet,
            permission: null // No permission required
        },
        {
            name: 'Reports',
            href: '/reports',
            icon: BarChart3,
            permission: 'REPORTS'
        },
    ]

    // Check if user has permission for a navigation item
    const hasAccess = (item) => {
        return !item.permission || hasPermission(item.permission);
    }

    // Get appropriate styling based on access and active state
    const getNavLinkClass = (item, isActive) => {
        const baseClass = 'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors';
        const hasUserAccess = hasAccess(item);

        if (!hasUserAccess) {
            return `${baseClass} text-gray-500 cursor-not-allowed opacity-50`;
        }

        if (isActive) {
            return `${baseClass} bg-theme text-white`;
        }

        return `${baseClass} text-primary hover:bg-none hover:text-black`;
    }

    // Render navigation item (with or without permission)
    const renderNavItem = (item) => {
        const hasUserAccess = hasAccess(item);

        if (!hasUserAccess) {
            return (
                <li key={item.name}>
                    <div
                        className={getNavLinkClass(item, false)}
                        title={`You don't have permission to access ${item.name}`}
                    >
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        <span className="truncate">{item.name}</span>
                        <Lock className="ml-auto h-4 w-4 flex-shrink-0" />
                    </div>
                </li>
            );
        }

        return (
            <li key={item.name}>
                <NavLink
                    to={item.href}
                    onClick={() => onClose && onClose()}
                    className={({ isActive }) => getNavLinkClass(item, isActive)}
                >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                </NavLink>
            </li>
        );
    }

    return (
        <div className="bg-nav text-primary w-64 h-full flex flex-col overflow-hidden">
            {/* Logo and close button */}
            <div className="lg:hidden p-6 flex items-center justify-between">
                {/* Close button (only mobile) */}
                <button
                    type="button"
                    className="lg:hidden p-1 rounded-md text-primary hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
                    onClick={onClose}
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 overflow-y-auto">
                <ul className="space-y-2">
                    {navigation.map(renderNavItem)}
                </ul>
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-gray-700">
                <NavLink
                    to="/settings"
                    onClick={() => onClose && onClose()}
                    className={({ isActive }) =>
                        `flex items-center w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                            ? 'bg-theme text-white'
                            : 'text-primary hover:bg-gray-800 hover:text-white'
                        }`
                    }
                >
                    <Settings className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">Settings</span>
                </NavLink>

                <button
                    onClick={signOut}
                    className="flex items-center w-full px-4 py-2 text-sm font-medium text-primary rounded-lg hover:bg-gray-800 hover:text-white transition-colors mt-2"
                >
                    <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">Logout</span>
                </button>
            </div>
        </div>
    )
}

export default Sidebar