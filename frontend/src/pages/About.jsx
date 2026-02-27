import { Target, Users, Zap, Award } from 'lucide-react';

const About = () => {
    return (
        <div className="bg-gray-50 dark:bg-dark-bg min-h-screen pt-12 pb-24 transition-colors duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">

                {/* Hero Section */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 dark:text-white leading-tight">
                        About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">DailyUpdatesHub</span>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-6 text-xl leading-relaxed">
                        We are a dedicated team of professionals committed to bringing you the most relevant, accurate, and timely updates from across the globe.
                    </p>
                </div>

                {/* Values Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
                    <div className="bg-white dark:bg-dark-card p-8 rounded-3xl shadow-soft border border-gray-100 dark:border-dark-border text-center group hover:border-primary-500 transition-all">
                        <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <Target size={28} />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-3">Precision</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Every story we publish undergoes rigorous fact-checking for maximum accuracy.</p>
                    </div>
                    <div className="bg-white dark:bg-dark-card p-8 rounded-3xl shadow-soft border border-gray-100 dark:border-dark-border text-center group hover:border-primary-500 transition-all">
                        <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <Zap size={28} />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-3">Agility</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">We move fast to ensure you're the first to know about breaking news and trends.</p>
                    </div>
                    <div className="bg-white dark:bg-dark-card p-8 rounded-3xl shadow-soft border border-gray-100 dark:border-dark-border text-center group hover:border-primary-500 transition-all">
                        <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <Users size={28} />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-3">Community</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">We value our readers' feedback and strive to create a platform that serves their needs.</p>
                    </div>
                    <div className="bg-white dark:bg-dark-card p-8 rounded-3xl shadow-soft border border-gray-100 dark:border-dark-border text-center group hover:border-primary-500 transition-all">
                        <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <Award size={28} />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-3">Quality</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">From design to content, we never compromise on providing a premium experience.</p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
                    <div className="relative">
                        <img
                            src="https://images.unsplash.com/photo-1522071823991-b9671f9d7f1f?auto=format&fit=crop&q=80"
                            alt="Our Team"
                            className="rounded-[2.5rem] shadow-2xl relative z-10"
                        />
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-600/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary-400/10 rounded-full blur-3xl"></div>
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 dark:text-white leading-tight">
                            Our Mission & <span className="text-primary-600 dark:text-primary-400">Vision</span>
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                            At DailyUpdatesHub, we believe information should be accessible, engaging, and above all, true. In an era of informational noise, we act as a filter, highlighting what truly matters.
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                            Our vision is to become the leading global hub for professional updates, where quality meets consistency. We're constantly evolving, integrating new technologies and expanding our coverage to ensure you never miss a beat.
                        </p>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="bg-primary-600 rounded-[2rem] p-6 md:p-12 shadow-neon-primary relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 text-white relative z-10">
                        <div className="text-center">
                            <p className="text-2xl md:text-4xl font-bold mb-1">5M+</p>
                            <p className="text-primary-100 text-[10px] md:text-sm uppercase tracking-widest font-bold">Monthly Readers</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl md:text-4xl font-bold mb-1">10k+</p>
                            <p className="text-primary-100 text-[10px] md:text-sm uppercase tracking-widest font-bold">In-depth Articles</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl md:text-4xl font-bold mb-1">50+</p>
                            <p className="text-primary-100 text-[10px] md:text-sm uppercase tracking-widest font-bold">Global Authors</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl md:text-4xl font-bold mb-1">24/7</p>
                            <p className="text-primary-100 text-[10px] md:text-sm uppercase tracking-widest font-bold">Live Updates</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
