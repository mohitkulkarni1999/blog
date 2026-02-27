import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Home, PenTool, LayoutDashboard, Tag, Menu as MenuIcon, X } from 'lucide-react';

const AdminLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-dark-bg font-sans overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[60] lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-[70] w-64 bg-white dark:bg-dark-card shadow-soft h-full flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
                    <h2 className="text-xl font-heading font-bold text-primary-600 dark:text-primary-400">DailyUpdates</h2>
                    <button className="lg:hidden p-2 text-gray-400" onClick={() => setIsSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/admin" onClick={() => setIsSidebarOpen(false)} className="flex items-center space-x-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-dark-border rounded-lg transition-colors">
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/admin/create-post" onClick={() => setIsSidebarOpen(false)} className="flex items-center space-x-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-dark-border rounded-lg transition-colors">
                        <PenTool size={20} />
                        <span>Write Post</span>
                    </Link>
                    <Link to="/admin/categories" onClick={() => setIsSidebarOpen(false)} className="flex items-center space-x-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-dark-border rounded-lg transition-colors">
                        <Tag size={20} />
                        <span>Categories</span>
                    </Link>
                </nav>
                <div className="p-4 border-t border-gray-100 dark:border-dark-border text-center">
                    <button onClick={handleLogout} className="flex items-center space-x-3 w-full p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Top Navbar */}
                <header className="h-16 bg-white dark:bg-dark-card shadow-sm flex items-center justify-between px-6 transition-colors flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 text-gray-500 hover:text-primary-600 transition-colors"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <MenuIcon size={24} />
                        </button>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Admin Hub</h3>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="flex items-center text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary-600">
                            <Home size={18} className="mr-1" /> <span className="hidden sm:inline">View Site</span>
                        </Link>
                    </div>
                </header>

                {/* Dynamic Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 dark:bg-dark-bg">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
