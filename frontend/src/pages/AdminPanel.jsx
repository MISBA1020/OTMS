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
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-2 mb-6">
                            <UserPlus className="text-primary-600 w-6 h-6" />
                            <h2 className="text-xl font-bold">Register User</h2>
                        </div>
                        
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none"
                                    onChange={e => setFormData({ ...formData, name: e.target.value })} value={formData.name}/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none"
                                    onChange={e => setFormData({ ...formData, username: e.target.value })} value={formData.username}/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                                <input required type="password" className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none"
                                    onChange={e => setFormData({ ...formData, password: e.target.value })} value={formData.password}/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">System Role</label>
                                <select required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none"
                                    onChange={e => setFormData({ ...formData, role: e.target.value })} value={formData.role}>
                                    <option value="User">Doctor / Personnel</option>
                                    <option value="Admin">System Administrator</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 mt-4 rounded-xl font-bold shadow-lg shadow-primary-500/30 transition-all">
                                Create Account
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Username</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading && <tr><td colSpan="4" className="px-6 py-4 text-center">Loading...</td></tr>}
                                {!loading && users.map(u => (
                                    <tr key={u._id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-bold text-gray-900">{u.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{u.username}</td>
                                        <td className="px-6 py-4">
                                            {u.role === 'Admin' ? 
                                                <span className="flex items-center text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full w-max"><Shield className="w-3 h-3 mr-1"/> Admin</span> : 
                                                <span className="flex items-center text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full w-max"><User className="w-3 h-3 mr-1"/> User</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDeleteUser(u._id, u.role)}
                                                disabled={u.role === 'Admin'}
                                                title={u.role === 'Admin' ? "Cannot delete System Admin" : "Delete user"}
                                                className={`p-2 rounded-lg transition-colors ${u.role === 'Admin' ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'text-rose-500 hover:bg-rose-50 hover:text-rose-700'}`}
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
