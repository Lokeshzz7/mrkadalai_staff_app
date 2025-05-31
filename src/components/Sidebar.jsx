import React from 'react'
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
    X
} from 'lucide-react'

const Sidebar = ({ onClose }) => {
    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Notifications', href: '/notifications', icon: Bell },
        { name: 'Manual Order', href: '/manual-order', icon: PlusCircle },
        { name: 'Inventory', href: '/inventory', icon: Package },
        { name: 'Wallet', href: '/wallet', icon: Wallet },
        { name: 'Reports', href: '/reports', icon: BarChart3 },
    ]

    return (
        <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
            {/* Logo and close button */}
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                <h1 className="text-lg sm:text-xl font-bold">Restaurant Dashboard</h1>
                {/* Close button (only mobile) */}
                <button
                    type="button"
                    className="lg:hidden p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
                    onClick={onClose}
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6">
                <ul className="space-y-2">
                    {navigation.map((item) => (
                        <li key={item.name}>
                            <NavLink
                                to={item.href}
                                onClick={() => onClose && onClose()}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`
                                }
                            >
                                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                                <span className="truncate">{item.name}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-gray-700">
                <button className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors">
                    <Settings className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">Settings</span>
                </button>
                <button className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors mt-2">
                    <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">Logout</span>
                </button>
            </div>
        </div>
    )
}

export default Sidebar