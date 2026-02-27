import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Sparkles } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-[#0b0e14] border-t border-gray-100 dark:border-white/5 w-full transition-colors duration-500 overflow-hidden relative">
            {/* Decorative background element */}
            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-primary-600/5 blur-[100px] rounded-full translate-y-1/2 translate-x-1/2"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-20">

                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-3 group mb-6">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm group-hover:scale-105 transition-transform">
                                D
                            </div>
                            <span className="font-heading font-black text-xl tracking-tighter text-gray-900 dark:text-white">
                                DailyUpdates<span className="text-primary-600">Hub</span>
                            </span>
                        </Link>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
                            Premium insights, breaking updates, and technical deep-dives curated for the next generation of tech innovators.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="col-span-1">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white mb-8 border-l-2 border-primary-600 pl-4">Platform</h4>
                        <ul className="space-y-4">
                            <li><Link to="/about" className="text-sm font-black text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all uppercase tracking-widest">Company</Link></li>
                            <li><Link to="/" className="text-sm font-black text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all uppercase tracking-widest">Feed</Link></li>
                            <li><Link to="/contact" className="text-sm font-black text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all uppercase tracking-widest">Connect</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="col-span-1">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white mb-8 border-l-2 border-primary-600 pl-4">Security</h4>
                        <ul className="space-y-4">
                            <li><Link to="/privacy-policy" className="text-sm font-black text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all uppercase tracking-widest">Privacy</Link></li>
                            <li><Link to="/terms-conditions" className="text-sm font-black text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all uppercase tracking-widest">Terms</Link></li>
                            <li><Link to="/disclaimer" className="text-sm font-black text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all uppercase tracking-widest">Safety</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="col-span-1">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white mb-8 border-l-2 border-primary-600 pl-4">Stay Bold</h4>
                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                            <div className="flex bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 p-2 focus-within:ring-2 focus-within:ring-primary-500/30 transition-shadow">
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="flex-grow bg-transparent border-none text-xs px-3 focus:ring-0 dark:text-white font-medium"
                                />
                                <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-xl transition-all shadow-neon-primary active:scale-95">
                                    <Mail size={16} />
                                </button>
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Sparkles size={10} className="text-primary-500" /> join the 1%
                            </p>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between border-t border-gray-100 dark:border-white/5 mt-16 pt-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        &copy; {new Date().getFullYear()} DailyUpdatesHub <span className="mx-2 opacity-30">|</span> All Rights Reserved
                    </p>
                    <div className="flex gap-4 mt-6 md:mt-0">
                        {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                            <a key={i} href="#" className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:text-white transition-all transform hover:-translate-y-1">
                                <Icon size={18} />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
