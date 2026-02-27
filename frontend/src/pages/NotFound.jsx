import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
            <div className="text-center px-4 max-w-lg">
                <h1 className="text-9xl font-heading font-extrabold text-primary-600 dark:text-primary-500 tracking-tighter drop-shadow-sm mb-4">
                    404
                </h1>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-4">
                    Page Not Found
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 leading-relaxed">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <Link to="/" className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-lg group">
                    <Home size={20} className="group-hover:-translate-y-1 transition-transform" /> Back to Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
