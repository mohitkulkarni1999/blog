import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-dark-card border-t border-gray-100 dark:border-dark-border mt-auto w-full transition-colors duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1 flex flex-col items-start gap-4">
                        <Link to="/" className="flex items-center gap-2 group">
                            <span className="font-heading font-bold text-2xl tracking-tight text-gray-900 dark:text-white">
                                DailyUpdatesHub<span className="text-primary-600 dark:text-primary-400">.</span>
                            </span>
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mt-2">
                            Providing daily updates, news, and professional insights across technology, lifestyle, and business.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="col-span-1">
                        <h4 className="font-heading font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider text-sm">Quick Links</h4>
                        <ul className="space-y-3">
                            <li><Link to="/about" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors text-sm">About Us</Link></li>
                            <li><Link to="/blog" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors text-sm">Latest Articles</Link></li>
                            <li><Link to="/contact" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors text-sm">Contact Us</Link></li>
                            <li><Link to="/sitemap.xml" target="_blank" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors text-sm">Sitemap</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="col-span-1">
                        <h4 className="font-heading font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider text-sm">Legal Links</h4>
                        <ul className="space-y-3">
                            <li><Link to="/privacy-policy" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors text-sm">Privacy Policy</Link></li>
                            <li><Link to="/terms-conditions" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors text-sm">Terms & Conditions</Link></li>
                            <li><Link to="/disclaimer" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors text-sm">Disclaimer</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="col-span-1">
                        <h4 className="font-heading font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider text-sm">Stay Updated</h4>
                        <form className="flex flex-col gap-3">
                            <div className="flex bg-gray-50 dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-dark-border p-1 focus-within:ring-2 focus-within:ring-primary-500/50 transition-shadow">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-grow bg-transparent border-none text-sm px-3 focus:ring-0 dark:text-white"
                                    required
                                />
                                <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-md transition-colors" aria-label="Subscribe">
                                    <Mail size={16} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Get updates on new posts and tech tips.</p>
                        </form>
                    </div>
                </div>

                {/* Bottom */}
                <div className="flex flex-col md:flex-row items-center justify-between border-t border-gray-100 dark:border-dark-border mt-12 pt-8">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        &copy; {new Date().getFullYear()} DailyUpdatesHub. All rights reserved.
                    </p>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        <a href="#" className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"><Facebook size={18} /></a>
                        <a href="#" className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"><Twitter size={18} /></a>
                        <a href="#" className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"><Instagram size={18} /></a>
                        <a href="#" className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"><Linkedin size={18} /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
