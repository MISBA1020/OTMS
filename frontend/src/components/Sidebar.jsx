import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_USER = {
    name: 'Dr. Sarah Jenkins',
    role: 'Chief Surgeon',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=2563eb&color=fff',
};

const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'OT Scheduling', path: '/scheduling', icon: Calendar },
    { name: 'Sterilization', path: '/sterilization', icon: ShieldAlert },
];

export default function Sidebar() {
    return (
        <motion.aside
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            className="w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col h-screen fixed shadow-sm"
        >
            <div className="p-6 flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/30">
                    OT
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
                    Manager
                </span>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`
                            }
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 flex items-center space-x-3 hover:shadow-md transition-shadow cursor-pointer">
                <img src={MOCK_USER.avatar} alt="Profile" className="w-10 h-10 rounded-full shadow-sm" />
                <div>
                    <p className="text-sm font-bold text-gray-900 leading-tight">{MOCK_USER.name}</p>
                    <p className="text-xs text-primary-600 font-medium">{MOCK_USER.role}</p>
                </div>
            </div>
        </motion.aside>
    );
}
