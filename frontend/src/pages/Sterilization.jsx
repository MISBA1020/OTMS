import React, { useState, useEffect } from 'react';
import { ShieldCheck, User, Search, RefreshCw, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

export default function Sterilization() {
    const [logs, setLogs] = useState([]);
    const [ots, setOts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        operationTheatreId: '',
        technicianName: '',
        notes: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [logsRes, otsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/sterilization'),
                axios.get('http://localhost:5000/api/ots')
            ]);
            setLogs(logsRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            setOts(otsRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleStart = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/sterilization/start', formData);
            setShowModal(false);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to start sterilization');
        }
    };

    const handleComplete = async (id) => {
        try {
            await axios.post(`http://localhost:5000/api/sterilization/${id}/complete`);
            fetchData();
        } catch (err) {
            alert('Failed to complete sterilization');
        }
    };

    // Only show available OTs or already sterilized OTs
    const availableOts = ots.filter(ot => ot.status !== 'In Use');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors">Sterilization Tracking</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 transition-colors">Monitor and log operation theatre cleaning procedures</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-purple-500/30 transition-all flex items-center"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Start New Cycle
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between transition-colors">
                        <h2 className="font-bold text-gray-900 dark:text-white transition-colors">Recent Cycles</h2>
                        <div className="relative flex items-center">
                            <Search className="w-5 h-5 absolute left-3 text-gray-400 dark:text-gray-500 transition-colors" />
                            <input placeholder="Search logs..." className="pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border-none rounded-lg focus:ring-2 focus:ring-purple-500 text-sm outline-none w-64 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors" />
                        </div>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-slate-800">
                        {logs.map(log => (
                            <div key={log._id} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                                <div className="flex items-start space-x-4">
                                    <div className={`p-3 rounded-full ${log.status === 'Completed' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                        {log.status === 'Completed' ? <CheckCircle2 className="w-6 h-6" /> : <RefreshCw className="w-6 h-6 animate-spin-slow" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white transition-colors">{log.operationTheatreId?.name || 'Unknown OT'}</h3>
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1 space-x-4 transition-colors">
                                            <span className="flex items-center"><User className="w-3 h-3 mr-1" /> {log.technicianName}</span>
                                            <span>•</span>
                                            <span>Started: {format(new Date(log.startTime), 'HH:mm (MMM dd)')}</span>
                                            {log.endTime && (
                                                <>
                                                    <span>•</span>
                                                    <span>Finished: {format(new Date(log.endTime), 'HH:mm')}</span>
                                                </>
                                            )}
                                        </div>
                                        {log.notes && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 bg-gray-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-md inline-block transition-colors">Note: {log.notes}</p>}
                                    </div>
                                </div>
                                {log.status === 'In Progress' && (
                                    <button
                                        onClick={() => handleComplete(log._id)}
                                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                                    >
                                        Mark Completed
                                    </button>
                                )}
                            </div>
                        ))}
                        {logs.length === 0 && <div className="p-12 text-center text-gray-500 dark:text-gray-400 transition-colors">No sterilization logs found.</div>}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/50 rounded-2xl p-6 transition-colors">
                        <h3 className="font-bold text-purple-900 dark:text-purple-300 flex items-center transition-colors"><ShieldCheck className="w-5 h-5 mr-2" /> Compliance Status</h3>
                        <p className="text-purple-900/80 dark:text-purple-300/80 text-sm mt-2 font-medium leading-relaxed transition-colors">Currently, {ots.filter(ot => ot.status === 'Available').length} OTs are fully sterilized and ready for use. Ensuring a rigorous sterilization process avoids cross-contamination.</p>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg p-8 shadow-2xl transition-colors">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white transition-colors">Start Sterilization Cycle</h2>
                        <form onSubmit={handleStart} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Select Operation Theatre</label>
                                <select required className="w-full border-gray-300 dark:border-slate-700 rounded-lg p-3 bg-gray-50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 border focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white transition-colors"
                                    onChange={e => setFormData({ ...formData, operationTheatreId: e.target.value })}>
                                    <option value="">Choose OT</option>
                                    {availableOts.map(ot => <option key={ot._id} value={ot._id} disabled={ot.status === 'Sterilizing'}>{ot.name} {ot.status === 'Sterilizing' ? '(Already Sterilizing)' : ''}</option>)}
                                </select>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">OTs currently "In Use" cannot be selected.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Technician Name / ID</label>
                                <input required className="w-full border-gray-300 dark:border-slate-700 rounded-lg p-3 bg-gray-50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 border focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white transition-colors"
                                    onChange={e => setFormData({ ...formData, technicianName: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">Additional Notes</label>
                                <textarea className="w-full border-gray-300 dark:border-slate-700 rounded-lg p-3 bg-gray-50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 border focus:ring-2 focus:ring-purple-500 outline-none h-24 resize-none text-gray-900 dark:text-white transition-colors"
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                            </div>

                            <div className="mt-8 flex justify-end space-x-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-xl font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                                <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-purple-500/30 transition-all">Start Cycle</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
