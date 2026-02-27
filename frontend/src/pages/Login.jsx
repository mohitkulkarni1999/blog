import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, ArrowRight, Star, TrendingUp } from 'lucide-react';
import api from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [featuredPost, setFeaturedPost] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const { data } = await api.get('/posts?limit=1');
                if (data.posts && data.posts.length > 0) {
                    setFeaturedPost(data.posts[0]);
                }
            } catch (err) {
                console.error('Failed to fetch featured post for login', err);
            }
        };
        fetchFeatured();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await login(email, password);
            if (data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch {
            setError('Invalid email or password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg font-sans transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden bg-white dark:bg-dark-card rounded-3xl shadow-2xl border border-gray-100 dark:border-dark-border">

                {/* Left Side: Login Form */}
                <div className="p-8 sm:p-12 md:p-16 flex flex-col justify-center">
                    <div className="text-center lg:text-left">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white shadow-lg mb-8 mx-auto lg:mx-0 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                            <Lock size={32} />
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-gray-900 dark:text-white tracking-tight">Admin Login</h2>
                        <p className="mt-3 text-base text-gray-500 dark:text-gray-400">Welcome back! Please enter your details to access the dashboard.</p>
                    </div>

                    {error && (
                        <div className="mt-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium animate-shake">
                            {error}
                        </div>
                    )}

                    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="relative group">
                                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1 mb-1 block" htmlFor="email-address">Email address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                    <input
                                        id="email-address"
                                        name="email"
                                        type="email"
                                        required
                                        className="input-field pl-12 h-12 bg-gray-50/50 dark:bg-dark-bg border-gray-200 dark:border-dark-border focus:bg-white dark:focus:bg-dark-card transition-all"
                                        placeholder="admin@dailyupdateshub.in"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="relative group">
                                <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1 mb-1 block" htmlFor="password">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="input-field pl-12 h-12 bg-gray-50/50 dark:bg-dark-bg border-gray-200 dark:border-dark-border focus:bg-white dark:focus:bg-dark-card transition-all"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button type="submit" className="btn-primary w-full h-12 flex items-center justify-center gap-2 text-base font-bold shadow-neon-primary hover:scale-[1.02] active:scale-[0.98] transition-all">
                                Sign In Your Account <ArrowRight size={20} />
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-dark-border text-center lg:text-left text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Don't have an account? </span>
                        <Link to="/register" className="font-bold text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors">
                            Register Now
                        </Link>
                    </div>
                </div>

                {/* Right Side: Featured Section */}
                <div className="hidden lg:flex relative bg-gray-900 overflow-hidden">
                    {featuredPost ? (
                        <>
                            <img
                                src={featuredPost.featured_image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80'}
                                alt="Featured"
                                className="absolute inset-0 w-full h-full object-cover opacity-50 transition-scale duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                            <div className="relative w-full h-full p-16 flex flex-col justify-end">
                                <div className="flex items-center gap-2 mb-4 bg-primary-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest w-fit shadow-lg">
                                    <TrendingUp size={12} /> Featured Insight
                                </div>
                                <h3 className="text-3xl font-heading font-extrabold text-white leading-tight mb-4 line-clamp-3">
                                    {featuredPost.title}
                                </h3>
                                <p className="text-gray-300 text-lg font-light line-clamp-3 mb-8">
                                    {featuredPost.meta_description || 'Insights from our latest publication. Dive deep into the world of tech and design with our expert analysis.'}
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                                        <Star size={18} className="fill-current" />
                                    </div>
                                    <div className="text-white text-sm">
                                        <p className="font-bold">Latest Milestone</p>
                                        <p className="text-gray-400 text-xs">Reach millions of readers weekly</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-700 to-primary-900 flex flex-col items-center justify-center p-16 text-center text-white">
                            <TrendingUp size={64} className="mb-6 opacity-20" />
                            <h3 className="text-3xl font-heading font-bold mb-4">Discover More</h3>
                            <p className="opacity-70 max-w-xs font-light">Stay updated with the latest trends and stories from our expert writers around the world.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
