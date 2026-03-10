import { Target, Zap, Award, Shield, BookOpen, Clock, CheckCircle, ExternalLink } from 'lucide-react';

const About = () => {
    return (
        <div className="bg-gray-50 dark:bg-dark-bg min-h-screen pt-8 md:pt-12 pb-12 md:pb-24 transition-colors duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">

                {/* Hero */}
                <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
                    <span className="inline-block text-xs font-black uppercase tracking-widest text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-full mb-4">About Us</span>
                    <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 dark:text-white leading-tight">
                        About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">DailyUpdatesHub</span>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-6 text-lg leading-relaxed">
                        DailyUpdatesHub is an independent digital news publication based in India, founded in 2024. We cover technology, business, world affairs, health, and science — bringing you timely, accurate, and clearly written news stories every day.
                    </p>
                </div>

                {/* Who We Are */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center mb-16 md:mb-24">
                    <div className="relative">
                        <img
                            src="https://images.unsplash.com/photo-1522071823991-b9671f9d7f1f?auto=format&fit=crop&q=80"
                            alt="DailyUpdatesHub editorial team at work"
                            className="rounded-[2.5rem] shadow-2xl relative z-10"
                        />
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-600/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary-400/10 rounded-full blur-3xl"></div>
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 dark:text-white leading-tight">
                            Our Mission &amp; <span className="text-primary-600 dark:text-primary-400">Editorial Values</span>
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                            At DailyUpdatesHub, we believe that quality journalism is the foundation of an informed society. Our mission is to make credible, fact-checked news accessible to every Indian reader — without paywalls, sensationalism, or bias.
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                            Every article published on this platform is reviewed by a human editor before going live. We clearly disclose when content has been drafted with AI assistance, and all factual claims are verified against primary sources.
                        </p>
                        <div className="flex items-center gap-3 pt-2">
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 font-medium">Human-reviewed before publication</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 font-medium">Corrections published prominently</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 font-medium">No sponsored content disguised as news</span>
                        </div>
                    </div>
                </div>

                {/* Core Values */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-16 md:mb-24">
                    {[
                        { icon: <Target size={28} />, title: 'Accuracy', desc: 'Every story is verified against credible primary sources before publication. We retract and correct errors transparently.' },
                        { icon: <Zap size={28} />, title: 'Timeliness', desc: 'Breaking news is published fast, but never at the cost of fact-checking. Speed and accuracy go hand in hand.' },
                        { icon: <Shield size={28} />, title: 'Independence', desc: 'We are editorially independent. Advertisers have no influence over our news coverage or editorial decisions.' },
                        { icon: <Award size={28} />, title: 'Transparency', desc: 'We disclose AI-assisted content, conflicts of interest, and corrections openly and without delay.' },
                    ].map((v, i) => (
                        <div key={i} className="bg-white dark:bg-dark-card p-6 md:p-8 rounded-3xl shadow-soft border border-gray-100 dark:border-dark-border text-center group hover:border-primary-500 transition-all">
                            <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 mx-auto mb-6 group-hover:scale-110 transition-transform">
                                {v.icon}
                            </div>
                            <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-3">{v.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{v.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Editorial Policy Summary */}
                <div className="bg-white dark:bg-dark-card rounded-[2rem] border border-gray-100 dark:border-dark-border shadow-soft p-8 md:p-14 mb-16 md:mb-24">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-primary-600 dark:text-primary-400">
                            <BookOpen size={24} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 dark:text-white">Editorial Standards</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-600 dark:text-gray-400">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-lg">How We Source News</h3>
                            <p className="leading-relaxed text-sm">We source news from verified wire services, official press releases, government announcements, and credible news agencies. Anonymous sources are used only when information is of significant public interest and cannot be obtained on record.</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-lg">AI-Assisted Content Policy</h3>
                            <p className="leading-relaxed text-sm">Some articles on DailyUpdatesHub are drafted with AI assistance (Google Gemini). All such content is reviewed, edited, and verified by a human editor before publication. AI is a tool, not a replacement for editorial judgment.</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-lg">Corrections & Updates</h3>
                            <p className="leading-relaxed text-sm">If we make a factual error, we correct it promptly. Corrections are noted at the top of the article with the date of correction. We never silently delete or alter published content to hide errors.</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-lg">Advertising & Sponsorships</h3>
                            <p className="leading-relaxed text-sm">We may display third-party advertisements (including Google AdSense). Advertising revenue does not influence our editorial decisions. Sponsored content, if any, is always clearly labeled as "Sponsored" or "Advertisement."</p>
                        </div>
                    </div>
                </div>

                {/* Established Info Bar */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-[2rem] p-6 md:p-10 shadow-neon-primary relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-white relative z-10 text-center">
                        <div>
                            <p className="text-3xl md:text-4xl font-bold mb-1">2024</p>
                            <p className="text-primary-100 text-[10px] md:text-sm uppercase tracking-widest font-bold">Established</p>
                        </div>
                        <div>
                            <p className="text-3xl md:text-4xl font-bold mb-1">India</p>
                            <p className="text-primary-100 text-[10px] md:text-sm uppercase tracking-widest font-bold">Based In</p>
                        </div>
                        <div>
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Clock size={20} />
                                <p className="text-3xl md:text-4xl font-bold">24/7</p>
                            </div>
                            <p className="text-primary-100 text-[10px] md:text-sm uppercase tracking-widest font-bold">Coverage</p>
                        </div>
                        <div>
                            <p className="text-3xl md:text-4xl font-bold mb-1">Free</p>
                            <p className="text-primary-100 text-[10px] md:text-sm uppercase tracking-widest font-bold">Always Free to Read</p>
                        </div>
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="text-center mt-16">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Have a tip, correction, or feedback?</p>
                    <a href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-800 dark:text-white font-semibold rounded-2xl hover:border-primary-500 transition-all shadow-soft">
                        <ExternalLink size={16} /> contact@dailyupdateshub.in
                    </a>
                </div>

            </div>
        </div>
    );
};

export default About;
