import { useState, useEffect } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { Menu, X, Sun, Moon, Search, ChevronDown } from 'lucide-react';
import api from '../services/api';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState([]);
    const [isCatOpen, setIsCatOpen] = useState(false);
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
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/categories');
                setCategories(data || []);
            } catch (err) {
                console.error('Failed to fetch categories', err);
            }
        };
        fetchCategories();
    }, []);

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
        { name: 'Home', path: '/' },
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

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8 flex-shrink-0 ml-auto">
                        <nav className="flex items-center space-x-6">
                            <NavLink to="/" className={({ isActive }) => `font-medium transition-colors hover:text-primary-600 dark:hover:text-primary-400 text-sm tracking-wide ${isActive ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-gray-600 dark:text-gray-300'}`}>
                                Home
                            </NavLink>

                            {/* Categories Dropdown */}
                            <div className="relative group"
                                onMouseEnter={() => setIsCatOpen(true)}
                                onMouseLeave={() => setIsCatOpen(false)}
                            >
                                <button className="flex items-center gap-1 font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm tracking-wide transition-colors py-2">
                                    Categories <ChevronDown size={14} className={`transition-transform duration-300 ${isCatOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isCatOpen && (
                                    <div className="absolute top-full left-0 w-48 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl shadow-xl py-2 mt-0 animate-fade-in-up transition-all z-[60]">
                                        <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-dark-border mb-1">Explore Topics</div>
                                        {categories.map((cat) => (
                                            <Link
                                                key={cat.id}
                                                to={`/?category=${cat.id}`}
                                                className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                            >
                                                {cat.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <NavLink to="/contact" className={({ isActive }) => `font-medium transition-colors hover:text-primary-600 dark:hover:text-primary-400 text-sm tracking-wide ${isActive ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-gray-600 dark:text-gray-300'}`}>
                                Contact
                            </NavLink>
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
                    <div className="flex items-center md:hidden gap-4 ml-auto">
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
                    <div className="md:hidden absolute left-0 w-full bg-white dark:bg-dark-card border-b border-gray-100 dark:border-dark-border shadow-lg animate-fade-in-down origin-top py-6 px-6 z-[50]">
                        <nav className="flex flex-col space-y-4">
                            <Link to="/" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 border-b border-gray-50 dark:border-dark-border pb-2">
                                Home
                            </Link>

                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Categories</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {categories.map((cat) => (
                                        <Link
                                            key={cat.id}
                                            to={`/?category=${cat.id}`}
                                            onClick={() => setIsOpen(false)}
                                            className="px-3 py-2 text-sm bg-gray-50 dark:bg-dark-bg text-gray-700 dark:text-gray-300 rounded-lg hover:text-primary-600"
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <Link to="/contact" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 border-t border-gray-50 dark:border-dark-border pt-4">
                                Contact
                            </Link>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
