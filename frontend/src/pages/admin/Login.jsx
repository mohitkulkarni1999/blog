import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Lock, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, user, token } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in and is admin
    if (user && token && user.role === 'admin') {
        return <Navigate to="/admin" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/admin');
        } catch (err) {
            setError('Invalid email or password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg font-sans transition-colors duration-300">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-dark-card p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border m-4">

                <div className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center text-white shadow-neon mb-6">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-3xl font-heading font-extrabold text-gray-900 dark:text-white">Admin Access</h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Sign in to manage your blog content.</p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm font-medium text-center">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div className="relative">
                            <label className="sr-only" htmlFor="email-address">Email address</label>
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="input-field pl-10"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <label className="sr-only" htmlFor="password">Password</label>
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="input-field pl-10"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 text-lg">
                            Sign In <ArrowRight size={20} />
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm">
                    <a href="/" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                        Return to website
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Login;
