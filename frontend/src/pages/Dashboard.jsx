import React, { useEffect, useState } from 'react';
import { Activity, Beaker, CheckCircle, AlertCircle, Search, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import ScheduleModal from '../components/ScheduleModal';

const STATUS_COLORS = {
    'Available': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'In Use': 'bg-blue-100 text-blue-800 border-blue-200',
    'Sterilizing': 'bg-purple-100 text-purple-800 border-purple-200',
    'Maintenance': 'bg-rose-100 text-rose-800 border-rose-200',
};

export default function Dashboard() {
    const [ots, setOts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    useEffect(() => {
        fetchOTs();
        const interval = setInterval(fetchOTs, 10000); // refresh every 10s
        return () => clearInterval(interval);
    }, []);

    const fetchOTs = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/ots');
            setOts(res.data);
        } catch (err) {
            console.error('Failed to fetch OTs', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredOts = ots.filter(ot => 
        ot.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        ot.status.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = [
        { name: 'Available', value: ots.filter(ot => ot.status === 'Available').length, icon: CheckCircle, color: 'text-emerald-500' },
        { name: 'In Use', value: ots.filter(ot => ot.status === 'In Use').length, icon: Activity, color: 'text-blue-500' },
        { name: 'Sterilizing', value: ots.filter(ot => ot.status === 'Sterilizing').length, icon: Beaker, color: 'text-purple-500' },
        { name: 'Maintenance', value: ots.filter(ot => ot.status === 'Maintenance').length, icon: AlertCircle, color: 'text-rose-500' },
    ];

    return (
        <div className="space-y-8 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Live Status Overview</h1>
                    <p className="text-gray-500 mt-1">Real-time monitoring of all 11 Operation Theatres</p>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search theatres, status..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none w-64 shadow-sm"
                        />
                    </div>
                    <button 
                        onClick={() => setShowScheduleModal(true)}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-500/30 transition-all flex items-center"
                    >
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Schedule Surgery
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={stat.name}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow"
                        >
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                            </div>
                            <div className={`p-4 rounded-xl bg-gray-50 ${stat.color}`}>
                                <Icon className="w-8 h-8" />
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 flex justify-center text-gray-400">Loading OT Status...</div>
                ) : (
                    filteredOts.map((ot, index) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            key={ot._id}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all"
                        >
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-bold text-gray-900">{ot.name}</h3>
                                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${STATUS_COLORS[ot.status]}`}>
                                    {ot.status}
                                </span>
                            </div>

                            <div className="mt-6 space-y-3">
                                {ot.lastMaintained && (
                                    <p className="text-sm text-gray-500 flex justify-between">
                                        <span>Last Sterilized:</span>
                                        <span className="font-medium text-gray-900">
                                            {new Date(ot.lastMaintained).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
                {!loading && filteredOts.length === 0 && (
                    <div className="col-span-full py-10 text-center text-gray-500">No Operation Theatres found matching your search.</div>
                )}
            </div>

            <ScheduleModal showModal={showScheduleModal} setShowModal={setShowScheduleModal} onSuccess={fetchOTs} />
        </div>
    );
}
