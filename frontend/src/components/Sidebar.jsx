import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, ShieldAlert, Users, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

export default function Sidebar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'OT Scheduling', path: '/scheduling', icon: Calendar },
        { name: 'Sterilization', path: '/sterilization', icon: ShieldAlert },
    ];

    if (user?.role === 'Admin') {
        navItems.push({ name: 'Admin Panel', path: '/admin', icon: Users });
    }

    // Default Fallback
    const avatar = `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=2563eb&color=fff`;

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

            <div className="mt-auto px-4 mb-2">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 text-rose-500 hover:bg-rose-50 hover:text-rose-600 py-3 rounded-xl transition-all font-bold"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Secure Logout</span>
                </button>
            </div>

            <div className="p-4 mx-4 mb-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 flex items-center space-x-3 shadow-sm">
                <img src={avatar} alt="Profile" className="w-10 h-10 rounded-full shadow-sm" />
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-gray-900 leading-tight truncate">{user?.name}</p>
                    <p className="text-xs text-primary-600 font-medium truncate">{user?.role}</p>
                </div>
            </div>
        </motion.aside>
    );
}
