const TermsConditions = () => {
    return (
        <div className="bg-gray-50 dark:bg-dark-bg min-h-screen pt-12 pb-24 transition-colors duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="bg-white dark:bg-dark-card p-6 md:p-16 rounded-[2rem] shadow-soft border border-gray-100 dark:border-dark-border">
                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-8 border-b border-gray-100 dark:border-dark-border pb-6">
                        Terms & Conditions
                    </h1>

                    <div className="prose prose-lg dark:prose-invert max-w-none space-y-8 text-gray-600 dark:text-gray-400">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
                            <p>
                                By accessing and using DailyUpdatesHub, you accept and agree to be bound by the terms and provision of this agreement. Any participation in this service will constitute acceptance of this agreement.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Intellectual Property Rights</h2>
                            <p>
                                Unless otherwise stated, DailyUpdatesHub and/or its licensors own the intellectual property rights for all material on DailyUpdatesHub. All intellectual property rights are reserved. You may access this from DailyUpdatesHub for your own personal use subjected to restrictions set in these terms and conditions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. User Conduct</h2>
                            <p>
                                You must not use our website in any way that causes, or may cause, damage to the website or impairment of the availability or accessibility of the website; or in any way which is unlawful, illegal, fraudulent or harmful.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Limitation of Liability</h2>
                            <p>
                                In no event shall DailyUpdatesHub, nor any of its officers, directors and employees, be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract.
                            </p>
                        </section>

                        <section className="bg-gray-50 dark:bg-dark-bg p-8 rounded-2xl border border-gray-100 dark:border-dark-border">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Governing Law</h2>
                            <p>
                                These Terms will be governed by and interpreted in accordance with the laws of the jurisdiction in which we operate, and you submit to the non-exclusive jurisdiction of the state and federal courts for the resolution of any disputes.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsConditions;
