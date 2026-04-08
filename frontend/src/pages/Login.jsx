import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BriefcaseMedical, KeyRound, User as UserIcon, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password, role);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials or role mismatch. Please contact support.');
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-white to-orange-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-400/10 rounded-full blur-[100px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[1000px] bg-white/70 backdrop-blur-2xl shadow-2xl shadow-indigo-900/10 rounded-[2.5rem] border border-white/80 flex flex-col md:flex-row overflow-hidden"
      >
        {/* Left Branding Panel */}
        <div className="md:w-5/12 bg-gradient-to-br from-primary-700 to-indigo-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] mix-blend-overlay"></div>
            
            <div className="relative z-10">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg shadow-black/10 border border-white/20 mb-8">
                    <Activity className="w-8 h-8 text-orange-400" />
                </div>
                <h2 className="text-4xl font-black tracking-tight mb-4 leading-tight">Operation<br/>Theatre<br/><span className="text-orange-400">Management System</span></h2>
            </div>
        </div>

        {/* Right Auth Panel */}
        <div className="md:w-7/12 p-12 md:p-16 flex flex-col justify-center bg-white/60">
            <div className="mb-10">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Secure Authentication</h3>
                <p className="text-gray-500 mt-2 font-medium">Sign in to your authorized workspace.</p>
            </div>

            {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 flex items-center shadow-sm">
                    {error}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Access Role</label>
                <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-4 pr-10 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold text-gray-800 shadow-sm cursor-pointer"
                >
                <option value="User">Doctor / Medical Personnel</option>
                <option value="Admin">System Administrator</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Identifier (UID)</label>
                <div className="relative">
                    <UserIcon className="w-5 h-5 absolute left-4 top-4 text-gray-400" />
                    <input type="text" required placeholder="Enter your username"
                    className="w-full pl-12 pr-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium shadow-sm"
                    value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Security Key</label>
                <div className="relative">
                    <KeyRound className="w-5 h-5 absolute left-4 top-4 text-gray-400" />
                    <input type="password" required placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium shadow-sm"
                    value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
            </div>

            <button type="submit" className="w-full py-4 mt-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:to-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary-500/30 hover:-translate-y-1 transition-all">
                Login
            </button>
            </form>
            

        </div>
      </motion.div>
    </div>
  );
}
