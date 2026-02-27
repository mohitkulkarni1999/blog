import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Home, PenTool, LayoutDashboard, Tag } from 'lucide-react';

const AdminLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-dark-bg font-sans">
            {/* Sidebar sidebar */}
            <aside className="w-64 bg-white dark:bg-dark-card shadow-soft h-full flex flex-col transition-colors">
                <div className="p-6 border-b border-gray-100 dark:border-dark-border">
                    <h2 className="text-2xl font-heading font-bold text-primary-600 dark:text-primary-400">Admin Panel</h2>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/admin" className="flex items-center space-x-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-dark-border rounded-lg transition-colors">
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/admin/create-post" className="flex items-center space-x-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-dark-border rounded-lg transition-colors">
                        <PenTool size={20} />
                        <span>Write Post</span>
                    </Link>
                    <Link to="/admin/categories" className="flex items-center space-x-3 p-3 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-dark-border rounded-lg transition-colors">
                        <Tag size={20} />
                        <span>Categories</span>
                    </Link>
                </nav>
                <div className="p-4 border-t border-gray-100 dark:border-dark-border">
                    <button onClick={handleLogout} className="flex items-center space-x-3 w-full p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Top Navbar */}
                <header className="h-16 bg-white dark:bg-dark-card shadow-sm flex items-center justify-between px-6 transition-colors">
                    <h3 className="text-lg font-medium">Dashboard</h3>
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600">
                            <Home size={18} className="mr-1" /> View Site
                        </Link>
                    </div>
                </header>

                {/* Dynamic Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-bg">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
