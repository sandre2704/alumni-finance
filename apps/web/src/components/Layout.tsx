import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';

export const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        if (window.innerWidth >= 768) {
            setIsCollapsed(!isCollapsed);
        } else {
            setIsSidebarOpen(!isSidebarOpen);
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display flex">
            {/* Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isCollapsed={isCollapsed}
            />

            {/* Main Content Wrapper */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isCollapsed ? 'md:ml-[80px]' : 'md:ml-[280px]'}`}>

                {/* Global Header */}
                <Header
                    onOpenSidebar={toggleSidebar}
                    isCollapsed={isCollapsed}
                />

                {/* Page Content */}
                <main className="flex-1 w-full mx-auto p-0">
                    <Outlet />
                </main>

                {/* Global Footer */}
                <Footer />
            </div>
        </div>
    );
};
