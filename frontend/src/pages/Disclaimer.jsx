const Disclaimer = () => {
    return (
        <div className="bg-gray-50 dark:bg-dark-bg min-h-screen pt-12 pb-24 transition-colors duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="bg-white dark:bg-dark-card p-10 md:p-16 rounded-[2rem] shadow-soft border border-gray-100 dark:border-dark-border">
                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-8 border-b border-gray-100 dark:border-dark-border pb-6">
                        Disclaimer
                    </h1>

                    <div className="prose prose-lg dark:prose-invert max-w-none space-y-8 text-gray-600 dark:text-gray-400">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. General Information</h2>
                            <p>
                                All the information on this website - https://dailyupdateshub.in - is published in good faith and for general information purpose only. DailyUpdatesHub does not make any warranties about the completeness, reliability and accuracy of this information.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Professional Advice</h2>
                            <p>
                                The information provided on this blog is for informational and educational purposes only. It is not intended as a substitute for professional advice. Any action you take upon the information you find on this website is strictly at your own risk.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. External Links</h2>
                            <p>
                                Through our website, you can visit other websites by following hyperlinks to such external sites. While we strive to provide only quality links to useful and ethical websites, we have no control over the content and nature of these sites.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Content Ownership</h2>
                            <p>
                                The views and opinions expressed in the articles on this website are those of the authors and do not necessarily reflect the official policy or position of DailyUpdatesHub.
                            </p>
                        </section>

                        <section className="bg-gray-50 dark:bg-dark-bg p-8 rounded-2xl border border-gray-100 dark:border-dark-border">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Consent</h2>
                            <p>
                                By using our website, you hereby consent to our disclaimer and agree to its terms. This disclaimer was last updated on February 27, 2026.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Disclaimer;
