import { useState, useEffect } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { Menu, X, Sun, Moon, Search } from 'lucide-react';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
            setIsOpen(false);
        }
    };

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const navLinks = [
        { name: 'Blog', path: '/' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <header className="glass-header w-full fixed top-0 left-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20 gap-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white font-heading font-bold text-xl shadow-neon group-hover:scale-105 transition-transform duration-300">
                            D
                        </div>
                        <span className="font-heading font-bold text-2xl tracking-tight text-gray-900 dark:text-white hidden sm:inline">
                            DailyUpdatesHub<span className="text-primary-600 dark:text-primary-400">.</span>
                        </span>
                    </Link>

                    {/* Search Bar Desktop */}
                    <div className="hidden md:flex flex-grow max-w-md mx-4">
                        <form onSubmit={handleSearch} className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-100 dark:bg-dark-border border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary-500 dark:text-white transition-all shadow-sm"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        </form>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8 flex-shrink-0">
                        <nav className="flex space-x-6">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.name}
                                    to={link.path}
                                    className={({ isActive }) =>
                                        `font-medium transition-colors hover:text-primary-600 dark:hover:text-primary-400 text-sm tracking-wide ${isActive ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-gray-600 dark:text-gray-300'
                                        }`
                                    }
                                >
                                    {link.name}
                                </NavLink>
                            ))}
                        </nav>
                        <div className="flex items-center gap-4 pl-4 border-l border-gray-200 dark:border-dark-border">
                            <button
                                onClick={toggleTheme}
                                className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors bg-gray-100 dark:bg-dark-border rounded-full"
                                aria-label="Toggle Dark Mode"
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-500 dark:text-gray-400"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-700 dark:text-gray-300 hover:text-primary-600 focus:outline-none"
                        >
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown */}
                {isOpen && (
                    <div className="md:hidden absolute left-0 w-full bg-white dark:bg-dark-card border-b border-gray-100 dark:border-dark-border shadow-lg animate-fade-in-down origin-top py-6 px-6">
                        <form onSubmit={handleSearch} className="relative w-full mb-6">
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-100 dark:bg-dark-border border-none rounded-xl py-3 pl-12 pr-4 text-base focus:ring-2 focus:ring-primary-500 dark:text-white transition-all shadow-sm"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        </form>
                        <nav className="flex flex-col space-y-4 items-center">
                            {navLinks.map((link) => (
                                <NavLink
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className="w-full text-center text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-2 border-b border-gray-100 dark:border-dark-border last:border-0"
                                >
                                    {link.name}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
