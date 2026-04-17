import React, { useEffect, useState } from 'react';
import { Activity, Beaker, CheckCircle, AlertCircle, Search, PlusCircle, User, X } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import ScheduleModal from '../components/ScheduleModal';

const STATUS_COLORS = {
    'Available': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'In Use': 'bg-red-100 text-red-800 border-red-200',
    'Sterilizing': 'bg-purple-100 text-purple-800 border-purple-200',
    'Maintenance': 'bg-rose-100 text-rose-800 border-rose-200',
};

export default function Dashboard() {
    const [ots, setOts] = useState([]);
    const [activeSurgeries, setActiveSurgeries] = useState([]);
    const [selectedActiveSurgery, setSelectedActiveSurgery] = useState(null);
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
            const [otsRes, surgeriesRes] = await Promise.all([
                axios.get('http://localhost:5000/api/ots'),
                axios.get('http://localhost:5000/api/surgeries')
            ]);
            
            const now = new Date();
            const allSurgeries = surgeriesRes.data;
            
            const updatedOts = otsRes.data.map(ot => {
                const active = allSurgeries.find(s => 
                    (s.operationTheatreId?._id || s.operationTheatreId) === ot._id &&
                    s.status !== 'Completed' && s.status !== 'Cancelled' &&
                    (s.status === 'In Progress' || (new Date(s.startTime) <= now && new Date(s.endTime) > now))
                );
                return { ...ot, status: active ? 'In Use' : (ot.status === 'In Use' ? 'Available' : ot.status) };
            });

            setOts(updatedOts);
            setActiveSurgeries(allSurgeries);
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
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">Live Status Overview</h1>
                    <p className="text-gray-500 mt-1">Real-time monitoring of all {ots.length} Operation Theatres</p>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search theatres, status..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none w-64 shadow-sm"
                        />
                    </div>
                    <button 
                        onClick={() => setShowScheduleModal(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center"
                    >
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Schedule Operation
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
                            className="bg-white border border-gray-100 shadow-sm rounded-xl p-6 flex items-center justify-between hover:-translate-y-1 transition-transform cursor-default"
                        >
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                                <p className="text-3xl font-bold text-slate-800 mt-2">{stat.value}</p>
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
                    filteredOts.map((ot, index) => {
                        const otSurgeries = activeSurgeries.filter(s => 
                            (s.operationTheatreId?._id || s.operationTheatreId) === ot._id &&
                            s.status !== 'Completed' && s.status !== 'Cancelled'
                        );
                        const now = new Date();
                        const active = otSurgeries.find(s => s.status === 'In Progress' || (new Date(s.startTime) <= now && new Date(s.endTime) > now)) || otSurgeries[0];

                        return (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                key={ot._id}
                                className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 flex flex-col hover:-translate-y-1 hover:shadow-md transition-all cursor-default h-full"
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className="text-base font-bold text-slate-800 leading-tight">{ot.name}</h3>
                                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border whitespace-nowrap shrink-0 ${STATUS_COLORS[ot.status] || 'bg-gray-100 text-gray-800'}`}>
                                        {ot.status}
                                    </span>
                                </div>

                                <div className="mt-4 space-y-2 flex-grow">
                                    {ot.lastMaintained && (
                                        <p className="text-sm text-gray-500 flex justify-between">
                                            <span>Last Sterilized:</span>
                                            <span className="font-medium text-gray-900">
                                                {new Date(ot.lastMaintained).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                {active && (
                                    <button 
                                        onClick={() => setSelectedActiveSurgery(active)} 
                                        className="mt-4 w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-2 rounded-lg transition-colors border border-slate-200 shadow-sm flex justify-center items-center text-sm"
                                    >
                                        View Details
                                    </button>
                                )}
                            </motion.div>
                        );
                    })
                )}
                {!loading && filteredOts.length === 0 && (
                    <div className="col-span-full py-10 text-center text-gray-500">No Operation Theatres found matching your search.</div>
                )}
            </div>

            <ScheduleModal showModal={showScheduleModal} setShowModal={setShowScheduleModal} onSuccess={fetchOTs} />

            {selectedActiveSurgery && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-indigo-900/40 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl shadow-indigo-900/20 border border-gray-100 relative"
                    >
                        <button 
                            onClick={() => setSelectedActiveSurgery(null)}
                            className="absolute top-6 right-6 p-2 rounded-full bg-gray-50 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse outline outline-4 outline-blue-100"></div>
                            <span className="text-sm font-bold text-blue-800 uppercase tracking-widest">Live Operation Data</span>
                        </div>

                        <h2 className="text-3xl font-black text-gray-900 leading-tight capitalize">{selectedActiveSurgery.patientName}</h2>
                        
                        <div className="flex gap-2 mt-2 font-bold mb-6">
                            <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs">UHID: {selectedActiveSurgery.uhid}</span>
                            <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs">IP: {selectedActiveSurgery.ipNumber || 'N/A'}</span>
                            <span className="bg-orange-50 border border-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs">{selectedActiveSurgery.surgeryCategory}</span>
                        </div>

                        <div className="mt-4 space-y-4">
                            <div className="p-4 rounded-2xl flex items-center shadow-sm glass-panel border-gray-200">
                                <div className="p-2 bg-indigo-50 rounded-xl shadow-sm mr-4"><Beaker className="w-5 h-5 text-indigo-500"/></div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Surgical Procedure</p>
                                    <p className="font-bold text-gray-900">{selectedActiveSurgery.surgery}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-2xl shadow-sm">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Lead Surgeon</p>
                                    <p className="font-bold text-gray-900 flex items-start text-sm"><User className="w-3.5 h-3.5 mr-1.5 mt-0.5 shrink-0" /> {selectedActiveSurgery.surgeonName}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl shadow-sm">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Anesthesiologist</p>
                                    <p className="font-bold text-gray-900 flex items-start text-sm"><User className="w-3.5 h-3.5 mr-1.5 mt-0.5 shrink-0" /> {selectedActiveSurgery.anesthesiologist}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl shadow-sm">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Scrub Nurse</p>
                                    <p className="font-bold text-gray-900 flex items-start text-sm"><User className="w-3.5 h-3.5 mr-1.5 mt-0.5 shrink-0" /> {selectedActiveSurgery.scrubNurse}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl shadow-sm">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">OT Technician</p>
                                    <p className="font-bold text-gray-900 flex items-start text-sm"><User className="w-3.5 h-3.5 mr-1.5 mt-0.5 shrink-0" /> {selectedActiveSurgery.otTechnician}</p>
                                </div>
                            </div>

                            <div className="flex space-x-4">
                                <div className="bg-blue-50/50 p-4 rounded-2xl shadow-sm flex-1 border border-blue-100">
                                    <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-1">Commenced</p>
                                    <p className="font-bold text-gray-900">{new Date(selectedActiveSurgery.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <div className="bg-purple-50/50 p-4 rounded-2xl shadow-sm flex-1 border border-purple-100">
                                    <p className="text-xs text-purple-500 font-bold uppercase tracking-wider mb-1">Anesthesia</p>
                                    <p className="font-bold text-gray-900">{selectedActiveSurgery.anaesthesiaType}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
