import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="h-screen flex bg-gray-100 overflow-hidden">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                >
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
                </div>
            )}

            <div className={`
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                fixed lg:relative lg:translate-x-0 z-50 lg:z-auto
                w-64 h-full bg-gray-900 transition-transform duration-300 ease-in-out
            `}>
                <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>

            <div className="flex-1 flex flex-col h-full">
                <Header onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 bg-gray-100 p-4 sm:p-6 overflow-auto">
                    <div className="h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Layout