import { useState, useEffect } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
import { Menu, X, Sun, Moon, Search, ChevronDown, Sparkles } from 'lucide-react';
import api from '../services/api';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [categories, setCategories] = useState([]);
    const [isCatOpen, setIsCatOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

    return (
        <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'py-3' : 'py-5'}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`relative flex justify-between items-center px-6 py-3 rounded-2xl transition-all duration-500 shadow-2xl ${scrolled ? 'bg-white/70 dark:bg-dark-card/70 backdrop-blur-xl border border-white/20 dark:border-white/5' : 'bg-transparent border border-transparent'}`}>

                    {/* Brand Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-heading font-black text-xl shadow-neon-primary group-hover:scale-105 transition-transform duration-300">
                            D
                        </div>
                        <span className={`font-heading font-black text-xl tracking-tighter transition-colors duration-300 ${scrolled ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white md:text-gray-900'}`}>
                            DailyUpdates<span className="text-primary-600">Hub</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <NavLink to="/" className={({ isActive }) => `text-xs font-black uppercase tracking-[0.2em] transition-all hover:text-primary-600 ${isActive ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400'}`}>
                            Home
                        </NavLink>

                        {/* Dropdown */}
                        <div className="relative"
                            onMouseEnter={() => setIsCatOpen(true)}
                            onMouseLeave={() => setIsCatOpen(false)}
                        >
                            <button className={`flex items-center gap-1 text-xs font-black uppercase tracking-[0.2em] transition-all hover:text-primary-600 py-2 ${isCatOpen ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400'}`}>
                                Topics <ChevronDown size={14} className={`transition-transform duration-300 ${isCatOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <div className={`absolute top-full left-1/2 -translate-x-1/2 w-56 pt-2 transition-all duration-300 origin-top ${isCatOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}>
                                <div className="bg-white dark:bg-[#0b0e14] border border-gray-100 dark:border-white/5 rounded-2xl shadow-2xl p-2">
                                    <div className="px-4 py-2 text-[10px] font-black text-gray-300 uppercase tracking-widest border-b border-gray-50 dark:border-white/5 mb-1 flex items-center gap-2">
                                        <Sparkles size={10} /> Browse News
                                    </div>
                                    {categories.map((cat) => (
                                        <Link
                                            key={cat.id}
                                            to={`/?category=${cat.id}`}
                                            className="block px-4 py-3 text-[11px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 rounded-xl transition-all"
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <NavLink to="/contact" className={({ isActive }) => `text-xs font-black uppercase tracking-[0.2em] transition-all hover:text-primary-600 ${isActive ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400'}`}>
                            Contact
                        </NavLink>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-all rounded-xl"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden p-2.5 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-xl active:scale-95 transition-all"
                        >
                            {isOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    <div className={`md:hidden absolute top-[calc(100%+12px)] left-0 w-full pt-2 transition-all duration-300 origin-top ${isOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}>
                        <div className="bg-white/90 dark:bg-[#0b0e14]/90 backdrop-blur-2xl border border-gray-100 dark:border-white/5 rounded-3xl shadow-2xl p-6 flex flex-col gap-6">
                            <nav className="flex flex-col gap-6">
                                <Link to="/" onClick={() => setIsOpen(false)} className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white border-b border-gray-50 dark:border-white/5 pb-4">Home</Link>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles size={10} /> Popular Categories
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {categories.map((cat) => (
                                            <Link
                                                key={cat.id}
                                                to={`/?category=${cat.id}`}
                                                onClick={() => setIsOpen(false)}
                                                className="px-4 py-3 bg-gray-50 dark:bg-white/5 text-[11px] font-black uppercase text-gray-700 dark:text-gray-300 rounded-xl hover:bg-primary-600 hover:text-white transition-all text-center"
                                            >
                                                {cat.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                <Link to="/contact" onClick={() => setIsOpen(false)} className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white border-t border-gray-50 dark:border-white/5 pt-6">Contact</Link>
                            </nav>
                        </div>
                    </div>

                </div>
            </div>
        </header>
    );
};

export default Header;
