import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

const AdminLayout = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-white overflow-hidden">
            <Sidebar isCollapsed={isSidebarCollapsed} />

            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-500">
                <TopBar
                    onNewClick={() => setIsCreateModalOpen(true)}
                    toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />

                <main className="flex-1 overflow-y-auto px-10 pb-10 pt-8 scroll-smooth no-scrollbar">
                    <Outlet />
                </main>
            </div>

        </div>
    );
};

export default AdminLayout;
