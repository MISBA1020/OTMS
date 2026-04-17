import React, { useState, useContext } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function ProfileModal({ onClose, initialTab = 'profile' }) {
    const { user, updateUser } = useContext(AuthContext);
    const [tab, setTab] = useState(initialTab); // 'profile' | 'password'

    // Profile tab state
    const [name, setName] = useState(user?.name || '');
    const [profileStatus, setProfileStatus] = useState(null); // { type: 'success'|'error', msg }
    const [profileLoading, setProfileLoading] = useState(false);

    // Password tab state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [passwordStatus, setPasswordStatus] = useState(null);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const handleProfileSave = async (e) => {
        e.preventDefault();
        if (!name.trim()) return setProfileStatus({ type: 'error', msg: 'Name cannot be empty.' });
        setProfileLoading(true);
        setProfileStatus(null);
        try {
            const res = await axios.put('http://localhost:5000/api/auth/profile', { name });
            updateUser({ name: res.data.name });
            setProfileStatus({ type: 'success', msg: 'Profile updated successfully!' });
        } catch (err) {
            setProfileStatus({ type: 'error', msg: err.response?.data?.message || 'Update failed.' });
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) return setPasswordStatus({ type: 'error', msg: 'New passwords do not match.' });
        if (newPassword.length < 6) return setPasswordStatus({ type: 'error', msg: 'Password must be at least 6 characters.' });
        setPasswordLoading(true);
        setPasswordStatus(null);
        try {
            await axios.put('http://localhost:5000/api/auth/password', { currentPassword, newPassword });
            setPasswordStatus({ type: 'success', msg: 'Password changed successfully!' });
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        } catch (err) {
            setPasswordStatus({ type: 'error', msg: err.response?.data?.message || 'Failed to change password.' });
        } finally {
            setPasswordLoading(false);
        }
    };

    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=2563eb&color=fff&size=128`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                className="bg-white rounded-3xl shadow-2xl shadow-indigo-900/15 w-full max-w-md border border-gray-100 overflow-hidden"
            >
                {/* Header */}
                <div className="relative bg-gradient-to-br from-primary-700 to-indigo-900 px-8 pt-10 pb-16 text-white text-center">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                    <img src={avatar} alt="avatar" className="w-20 h-20 rounded-full border-4 border-white/30 mx-auto shadow-xl mb-3" />
                    <p className="text-xl font-black">{user?.name}</p>
                    <span className="text-xs font-bold text-indigo-200 bg-white/10 px-3 py-1 rounded-full mt-1 inline-block">{user?.role}</span>
                    <p className="text-indigo-300 text-sm mt-1">@{user?.username}</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 -mt-px relative z-10 bg-white">
                    {['profile', 'password'].map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 py-3.5 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
                                tab === t
                                    ? 'text-primary-600 border-b-2 border-primary-600'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {t === 'profile' ? <User className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            {t === 'profile' ? 'My Profile' : 'Change Password'}
                        </button>
                    ))}
                </div>

                {/* Tab Body */}
                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {tab === 'profile' ? (
                            <motion.form
                                key="profile"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                onSubmit={handleProfileSave}
                                className="space-y-5"
                            >
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Display Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-medium text-gray-800 transition-all"
                                        placeholder="Your full name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Username</label>
                                    <input
                                        type="text"
                                        value={user?.username}
                                        disabled
                                        className="w-full border border-gray-100 rounded-xl px-4 py-3 bg-gray-50 text-gray-400 font-medium cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Username cannot be changed.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Role</label>
                                    <input
                                        type="text"
                                        value={user?.role}
                                        disabled
                                        className="w-full border border-gray-100 rounded-xl px-4 py-3 bg-gray-50 text-gray-400 font-medium cursor-not-allowed"
                                    />
                                </div>

                                {profileStatus && (
                                    <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold ${profileStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                        {profileStatus.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                        {profileStatus.msg}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={profileLoading}
                                    className="w-full py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-60"
                                >
                                    {profileLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form
                                key="password"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                onSubmit={handlePasswordChange}
                                className="space-y-5"
                            >
                                {[
                                    { label: 'Current Password', value: currentPassword, set: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent(p => !p) },
                                    { label: 'New Password', value: newPassword, set: setNewPassword, show: showNew, toggle: () => setShowNew(p => !p) },
                                    { label: 'Confirm New Password', value: confirmPassword, set: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm(p => !p) },
                                ].map(({ label, value, set, show, toggle }) => (
                                    <div key={label}>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5">{label}</label>
                                        <div className="relative">
                                            <input
                                                type={show ? 'text' : 'password'}
                                                value={value}
                                                onChange={e => set(e.target.value)}
                                                required
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-medium text-gray-800 transition-all"
                                                placeholder="••••••••"
                                            />
                                            <button type="button" onClick={toggle} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                                                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {passwordStatus && (
                                    <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold ${passwordStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                        {passwordStatus.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                        {passwordStatus.msg}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-secondary-500 hover:to-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-60"
                                >
                                    {passwordLoading ? 'Updating...' : 'Update Password'}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
