
export const Footer = () => {
    return (
        <footer className="border-t border-gray-200 dark:border-card-border mt-auto bg-white dark:bg-card-dark py-8 px-6 md:px-10">
            <div className="max-w-[1280px] w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">© 2026 AlumniFinance. All rights reserved.</p>
                <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                    <button
                        onClick={() => {
                            const feedbackBtn = document.querySelector('[class*="fixed bottom-6 right-6"]') as HTMLButtonElement;
                            if (feedbackBtn) feedbackBtn.click();
                        }}
                        className="text-sm text-primary font-medium hover:text-primary-dark transition-colors flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-base">rate_review</span>
                        Beri Saran
                    </button>
                    <a className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors" href="#">Kebijakan Privasi</a>
                    <a className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors" href="#">Syarat &amp; Ketentuan</a>
                    <a className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors" href="#">Bantuan</a>
                </div>
            </div>
        </footer>
    );
};
