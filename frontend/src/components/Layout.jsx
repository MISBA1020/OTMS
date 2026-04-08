import React from 'react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
    return (
        <div className="flex bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50 via-gray-50 to-orange-50 min-h-screen selection:bg-primary-100 selection:text-primary-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
            <Sidebar />
            <main className="flex-1 ml-64 p-10 md:p-12 overflow-y-auto relative z-10 w-full h-screen">
                <div className="max-w-7xl mx-auto pb-20">
                    {children}
                </div>
            </main>
        </div>
    );
}
