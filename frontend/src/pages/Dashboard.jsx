import React, { useEffect, useState } from 'react';
import { Activity, Beaker, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const STATUS_COLORS = {
    'Available': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'In Use': 'bg-blue-100 text-blue-800 border-blue-200',
    'Sterilizing': 'bg-purple-100 text-purple-800 border-purple-200',
    'Maintenance': 'bg-rose-100 text-rose-800 border-rose-200',
};

export default function Dashboard() {
    const [ots, setOts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchOTs();
        const interval = setInterval(fetchOTs, 10000); // refresh every 10s
        return () => clearInterval(interval);
    }, []);

    const stats = [
        { name: 'Available', value: ots.filter(ot => ot.status === 'Available').length, icon: CheckCircle, color: 'text-emerald-500' },
        { name: 'In Use', value: ots.filter(ot => ot.status === 'In Use').length, icon: Activity, color: 'text-blue-500' },
        { name: 'Sterilizing', value: ots.filter(ot => ot.status === 'Sterilizing').length, icon: Beaker, color: 'text-purple-500' },
        { name: 'Maintenance', value: ots.filter(ot => ot.status === 'Maintenance').length, icon: AlertCircle, color: 'text-rose-500' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Live Status Overview</h1>
                <p className="text-gray-500 mt-1">Real-time monitoring of all 11 Operation Theatres</p>
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
                    ots.map((ot, index) => (
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
                                <p className="text-sm text-gray-500 flex justify-between">
                                    <span>Equipments:</span>
                                    <span className="font-medium text-gray-900">{ot.equipmentList.length} Items</span>
                                </p>
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
            </div>
        </div>
    );
}
