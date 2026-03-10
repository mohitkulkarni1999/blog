const PrivacyPolicy = () => {
    const lastUpdated = 'March 10, 2026';

    return (
        <div className="bg-gray-50 dark:bg-dark-bg min-h-screen pt-12 pb-24 transition-colors duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="bg-white dark:bg-dark-card p-6 md:p-16 rounded-[2rem] shadow-soft border border-gray-100 dark:border-dark-border">
                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-2 border-b border-gray-100 dark:border-dark-border pb-6">
                        Privacy Policy
                    </h1>
                    <p className="text-sm text-gray-400 mb-10">Last updated: {lastUpdated} | Effective date: January 1, 2025</p>

                    <div className="prose prose-lg dark:prose-invert max-w-none space-y-10 text-gray-600 dark:text-gray-400">

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Introduction</h2>
                            <p>
                                Welcome to <strong>DailyUpdatesHub</strong> ("we," "us," or "our"), accessible at <strong>https://dailyupdateshub.in</strong>. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and protect your information when you visit our website.
                            </p>
                            <p className="mt-3">By using this website, you agree to the collection and use of information in accordance with this policy.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Information We Collect</h2>
                            <p>We may collect the following types of data:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li><strong>Identity Data:</strong> Name and username when you submit comments or contact forms.</li>
                                <li><strong>Contact Data:</strong> Email address when you contact us or subscribe.</li>
                                <li><strong>Technical Data:</strong> IP address, browser type, device type, pages visited, and time spent on our site (via analytics tools).</li>
                                <li><strong>Usage Data:</strong> How you interact with our content, which articles you read, and how you navigate the site.</li>
                                <li><strong>Cookie Data:</strong> Data stored via cookies and similar tracking technologies (see Section 5).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. How We Use Your Data</h2>
                            <ul className="list-disc pl-6 space-y-2 mt-2">
                                <li>To display and personalise content on our website.</li>
                                <li>To respond to enquiries submitted via our contact form.</li>
                                <li>To analyse website traffic and improve user experience.</li>
                                <li>To display relevant advertisements through third-party ad networks.</li>
                                <li>To detect, prevent, and address technical issues or fraudulent activity.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Third-Party Advertising — Google AdSense</h2>
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-6">
                                <p className="mb-4">
                                    We use <strong>Google AdSense</strong> to display advertisements on our website. Google AdSense is a third-party advertising service provided by Google LLC. Google uses cookies to serve ads based on a user's prior visits to our website or other websites on the internet.
                                </p>
                                <ul className="list-disc pl-6 space-y-2">
                                    <li>Google's use of advertising cookies enables it and its partners to serve ads based on your visit to DailyUpdatesHub and/or other sites on the internet.</li>
                                    <li>You may opt out of personalised advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 underline">Google Ad Settings</a>.</li>
                                    <li>You can also opt out of third-party vendor use of cookies by visiting <a href="https://optout.networkadvertising.org" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 underline">Network Advertising Initiative opt-out page</a>.</li>
                                    <li>Google's Privacy Policy is available at: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 underline">policies.google.com/privacy</a>.</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Cookies Policy</h2>
                            <p>We use cookies and similar tracking technologies to improve your experience on our site. Cookies are small data files stored on your device.</p>
                            <div className="mt-4 space-y-4">
                                <div className="border border-gray-100 dark:border-dark-border rounded-xl p-4">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Essential Cookies</h4>
                                    <p className="text-sm">Required for the website to function (login sessions, theme preferences). Cannot be disabled.</p>
                                </div>
                                <div className="border border-gray-100 dark:border-dark-border rounded-xl p-4">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Analytics Cookies</h4>
                                    <p className="text-sm">Help us understand how visitors interact with our website. We may use Google Analytics for this purpose.</p>
                                </div>
                                <div className="border border-gray-100 dark:border-dark-border rounded-xl p-4">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Advertising Cookies</h4>
                                    <p className="text-sm">Used by Google AdSense and other advertising partners to serve relevant ads. These may track your browsing across other websites.</p>
                                </div>
                            </div>
                            <p className="mt-4 text-sm">You can control cookies through your browser settings. Note that disabling certain cookies may affect website functionality.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Data Retention & Security</h2>
                            <p>
                                We retain personal data only as long as necessary for the purposes outlined in this policy. We use industry-standard security measures including HTTPS encryption, secure database hosting, and limited access controls to protect your data.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Your Rights</h2>
                            <p>Under applicable Indian data protection law and GDPR (where applicable), you have the right to:</p>
                            <ul className="list-disc pl-6 space-y-2 mt-3">
                                <li>Access the personal data we hold about you.</li>
                                <li>Request correction of inaccurate data.</li>
                                <li>Request deletion of your data ("right to be forgotten").</li>
                                <li>Object to or restrict certain types of processing.</li>
                                <li>Withdraw consent at any time (where processing is based on consent).</li>
                            </ul>
                            <p className="mt-3">To exercise any of these rights, contact us at <strong className="text-primary-600 dark:text-primary-400">privacy@dailyupdateshub.in</strong>.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Children's Privacy</h2>
                            <p>Our website is not directed at children under the age of 13. We do not knowingly collect personal data from children. If you believe a child has provided us with personal information, please contact us immediately.</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Changes to This Policy</h2>
                            <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by updating the "Last updated" date at the top of this page. Continued use of the website after changes constitutes acceptance of the revised policy.</p>
                        </section>

                        <section className="bg-gray-50 dark:bg-dark-bg p-8 rounded-2xl border border-gray-100 dark:border-dark-border">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Contact Us</h2>
                            <p>If you have questions about this Privacy Policy, our data practices, or wish to exercise your rights, contact us at:</p>
                            <div className="mt-4 space-y-1">
                                <p><strong>DailyUpdatesHub</strong></p>
                                <p>Email: <a href="mailto:privacy@dailyupdateshub.in" className="text-primary-600 dark:text-primary-400 font-bold">privacy@dailyupdateshub.in</a></p>
                                <p>Website: <a href="https://dailyupdateshub.in" className="text-primary-600 dark:text-primary-400">https://dailyupdateshub.in</a></p>
                                <p>Location: India</p>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
