import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Shield, User, Trash2 } from 'lucide-react';

export default function AdminPanel() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        role: 'User'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/auth/users');
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch users', err);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/auth/create', formData);
            setFormData({ username: '', password: '', name: '', role: 'User' });
            fetchUsers();
            alert('User created successfully');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create user');
        }
    };

    const handleDeleteUser = async (id, role) => {
        if (role === 'Admin') {
            alert('Cannot delete Admin accounts');
            return;
        }

        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`http://localhost:5000/api/auth/users/${id}`);
                setUsers(users.filter(u => u._id !== id));
                alert('User deleted successfully');
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Control Panel</h1>
                    <p className="text-gray-500 mt-1">Manage personnel access and roles</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="glass-panel rounded-3xl p-8 sticky top-8">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="p-3 bg-secondary-50 text-secondary-500 rounded-xl">
                                <UserPlus className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Register User</h2>
                        </div>
                        
                        <form onSubmit={handleCreateUser} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 mt-1">Full Name</label>
                                <input required className="w-full bg-white/50 border border-gray-200 rounded-2xl p-3.5 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none"
                                    onChange={e => setFormData({ ...formData, name: e.target.value })} value={formData.name}/>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Username</label>
                                <input required className="w-full bg-white/50 border border-gray-200 rounded-2xl p-3.5 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none"
                                    onChange={e => setFormData({ ...formData, username: e.target.value })} value={formData.username}/>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Temporary Password</label>
                                <input required type="password" className="w-full bg-white/50 border border-gray-200 rounded-2xl p-3.5 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none"
                                    onChange={e => setFormData({ ...formData, password: e.target.value })} value={formData.password}/>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">System Role</label>
                                <select required className="w-full bg-white/50 border border-gray-200 rounded-2xl p-3.5 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none cursor-pointer"
                                    onChange={e => setFormData({ ...formData, role: e.target.value })} value={formData.role}>
                                    <option value="User">Doctor / Personnel</option>
                                    <option value="Admin">System Administrator</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:to-indigo-700 text-white py-4 mt-6 rounded-2xl font-bold text-lg shadow-xl shadow-primary-500/30 hover:-translate-y-0.5 transition-all">
                                Create Account
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="overflow-x-auto pb-10">
                        <table className="w-full text-sm text-left border-separate border-spacing-y-3">
                            <thead className="text-gray-500 font-medium tracking-wide">
                                <tr>
                                    <th className="px-6 pb-2 font-semibold text-base">Authorized Personnel</th>
                                    <th className="px-6 pb-2 font-semibold text-base">Identifier (UID)</th>
                                    <th className="px-6 pb-2 font-semibold text-base">Clearance Level</th>
                                    <th className="px-6 pb-2 font-semibold text-base text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-base">
                                {loading && <tr><td colSpan="4" className="px-6 py-16 text-center text-gray-400 font-bold glass-panel rounded-3xl">Loading Directory...</td></tr>}
                                {!loading && users.map(u => (
                                    <tr key={u._id} className="glass-panel hover:-translate-y-1 transition-all duration-300">
                                        <td className="px-6 py-5 font-bold text-gray-900 rounded-l-3xl">{u.name}</td>
                                        <td className="px-6 py-5 text-gray-500 font-medium">{u.username}</td>
                                        <td className="px-6 py-5">
                                            {u.role === 'Admin' ? 
                                                <span className="flex items-center text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-full w-max shadow-sm"><Shield className="w-3.5 h-3.5 mr-1.5"/> System Admin</span> : 
                                                <span className="flex items-center text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full w-max shadow-sm"><User className="w-3.5 h-3.5 mr-1.5"/> Med Personnel</span>
                                            }
                                        </td>
                                        <td className="px-6 py-5 text-right rounded-r-3xl">
                                            <button 
                                                onClick={() => handleDeleteUser(u._id, u.role)}
                                                disabled={u.role === 'Admin'}
                                                title={u.role === 'Admin' ? "Cannot delete System Admin" : "Delete user"}
                                                className={`p-2.5 rounded-xl transition-all shadow-sm border ${u.role === 'Admin' ? 'text-gray-300 border-gray-100 cursor-not-allowed bg-gray-50' : 'text-rose-500 bg-white border-rose-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 hover:-translate-y-0.5 hover:shadow-md'}`}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
