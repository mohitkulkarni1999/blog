import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
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
        <div className="bg-gray-50 dark:bg-dark-bg min-h-screen pt-12 pb-24 transition-colors duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 dark:text-white leading-tight">
                        Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Touch</span>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg">
                        Have a question, suggestion or just want to say hi? We'd love to hear from you.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                    {/* Contact Information */}
                    <div className="flex flex-col gap-10">
                        <div className="bg-white dark:bg-dark-card p-8 rounded-2xl shadow-soft border border-gray-100 dark:border-dark-border">
                            <h3 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-6">Contact Information</h3>
                            <ul className="space-y-6">
                                <li className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">Email Us</h4>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">contact@problog.com</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">Call Us</h4>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">+1 (555) 123-4567</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400 flex-shrink-0">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">Location</h4>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">123 Blog Street, Tech City, TC 90210</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white dark:bg-dark-card p-8 rounded-2xl shadow-soft border border-gray-100 dark:border-dark-border">
                        <h3 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-6">Send a Message</h3>

                        {status.msg && (
                            <div className={`p-4 rounded-lg mb-6 text-sm font-medium ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                {status.msg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="input-field py-3 text-base"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="input-field py-3 text-base"
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="5"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    className="input-field py-3 text-base resize-y"
                                    placeholder="How can we help you?"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-4 text-base tracking-wide flex items-center justify-center gap-2"
                            >
                                {loading ? 'Sending...' : <><Send size={18} /> Send Message</>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
