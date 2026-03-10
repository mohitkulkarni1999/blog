import { useState } from 'react';
import { Mail, Send, Clock, Building, ArrowRight } from 'lucide-react';
import api from '../services/api';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState({ type: '', msg: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', msg: '' });

        try {
            await api.post('/contact', formData);
            setStatus({ type: 'success', msg: 'Your message has been sent successfully!' });
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            setStatus({ type: 'error', msg: 'Failed to send message. Please try again later.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    return (
        <div className="bg-[#fcfcfd] dark:bg-[#0b0e14] transition-colors duration-500 min-h-screen">
            {/* Premium Header */}
            <header className="relative w-full bg-[#0b0e14] pt-32 pb-32 md:pb-48 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary-600/15 blur-[100px] rounded-[100%]"></div>

                <div className="container mx-auto px-4 relative z-10 text-center animate-fade-in-up">
                    <span className="text-primary-400 font-black uppercase text-xs tracking-[0.3em] mb-4 block">Reach Out</span>
                    <h1 className="text-4xl md:text-6xl font-heading font-black text-white mb-6 tracking-tight">
                        Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400">Touch</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg font-medium px-4">
                        Have a story tip, partnership inquiry, or need to report a correction?
                        Our editorial team is ready to hear from you.
                    </p>
                </div>
            </header>

            {/* Overlapping Content Section */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl -mt-20 md:-mt-32 relative z-20 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* Contact Information Panel */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="bg-white dark:bg-dark-card p-8 md:p-10 rounded-3xl shadow-2xl border border-gray-100 dark:border-white/5 relative overflow-hidden group hover:border-primary-500/30 transition-all duration-300 h-full">
                            {/* Decorative background orb */}
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl group-hover:bg-primary-500/10 transition-all duration-500"></div>

                            <h3 className="text-2xl font-heading font-black text-gray-900 dark:text-white mb-10">Contact Information</h3>

                            <div className="space-y-10 relative z-10">
                                <div className="flex items-start gap-5 group/item">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0 group-hover/item:scale-110 group-hover/item:bg-primary-600 group-hover/item:text-white transition-all duration-300 shadow-sm border border-gray-100 dark:border-white/5">
                                        <Mail size={24} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">Editorial Inbox</h4>
                                        <a href="mailto:contact@dailyupdateshub.in" className="text-gray-500 dark:text-gray-400 text-sm hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium break-all">contact@dailyupdateshub.in</a>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-medium">Response time: usually within 24 hours.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5 group/item">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0 group-hover/item:scale-110 group-hover/item:bg-primary-600 group-hover/item:text-white transition-all duration-300 shadow-sm border border-gray-100 dark:border-white/5">
                                        <Building size={24} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">Headquarters</h4>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
                                            DailyUpdatesHub Media<br />
                                            Digital Publication<br />
                                            Based in India
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5 group/item">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0 group-hover/item:scale-110 group-hover/item:bg-primary-600 group-hover/item:text-white transition-all duration-300 shadow-sm border border-gray-100 dark:border-white/5">
                                        <Clock size={24} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">Newsroom Hours</h4>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed">
                                            Monday - Friday<br />
                                            9:00 AM - 6:00 PM (IST)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form Panel */}
                    <div className="lg:col-span-7">
                        <div className="bg-white dark:bg-dark-card p-8 md:p-10 rounded-3xl shadow-2xl border border-gray-100 dark:border-white/5 relative">
                            <h3 className="text-2xl font-heading font-black text-gray-900 dark:text-white mb-2">Send a Message</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 font-medium">Fill out the form below and our editorial team will get back to you.</p>

                            {status.msg && (
                                <div className={`p-4 rounded-2xl mb-8 text-sm font-bold flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'}`}>
                                    <div className={`w-2 h-2 rounded-full ${status.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                    {status.msg}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="block text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 ml-1">Your Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 md:px-5 py-4 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="block text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 md:px-5 py-4 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="message" className="block text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 ml-1">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows="6"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 md:px-5 py-4 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-y"
                                        placeholder="How can we help you?"
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-black uppercase tracking-widest py-4 md:py-5 rounded-xl transition-all shadow-neon-primary hover:shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm mt-4 md:mt-8"
                                >
                                    {loading ? 'Sending...' : <><Send size={18} /> Send Message <ArrowRight size={18} /></>}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
