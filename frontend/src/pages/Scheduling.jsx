import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';

export default function Scheduling() {
    const [surgeries, setSurgeries] = useState([]);
    const [ots, setOts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isImmediate, setIsImmediate] = useState(false);
    const [formData, setFormData] = useState({
        patientName: '',
        surgeonName: '',
        operationTheatreId: '',
        surgeryType: '',
        startTime: '',
        endTime: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [surgRes, otRes] = await Promise.all([
                axios.get('http://localhost:5000/api/surgeries'),
                axios.get('http://localhost:5000/api/ots')
            ]);
            setSurgeries(surgRes.data);
            setOts(otRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setIsImmediate(false);
        setFormData({
            patientName: '',
            surgeonName: '',
            operationTheatreId: '',
            surgeryType: '',
            startTime: '',
            endTime: '',
        });
    };

    const handleCreate = async (e) => {
        e.preventDefault();

        let payload = { ...formData };
        if (isImmediate) {
            const now = new Date();
            const end = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours default
            payload.startTime = now.toISOString();
            payload.endTime = end.toISOString();
            payload.status = 'In Progress';
        }

        try {
            await axios.post('http://localhost:5000/api/surgeries', payload);
            closeModal();
            fetchData();
            alert(isImmediate ? 'Immediate surgery started successfully!' : 'Surgery scheduled successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to schedule');
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/api/surgeries/${id}`, { status });
            fetchData();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Scheduling Calendar</h1>
                    <p className="text-gray-500 mt-1">Manage and track daily surgical operations</p>
                </div>
                <button
                    onClick={() => { setShowModal(true); setIsImmediate(false); }}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-primary-500/30 transition-all"
                >
                    Schedule Surgery
                </button>
            </div>

            <div className="bg-white border text-left border-gray-100 shadow-sm rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Patient / Surgeon</th>
                            <th className="px-6 py-4">Theatre</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Timing</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {surgeries.map(surgery => (
                            <tr key={surgery._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-gray-900">{surgery.patientName}</p>
                                    <p className="text-gray-500 text-xs flex items-center mt-1"><User className="w-3 h-3 mr-1" />{surgery.surgeonName}</p>
                                </td>
                                <td className="px-6 py-4 font-medium">{surgery.operationTheatreId?.name || 'Unknown'}</td>
                                <td className="px-6 py-4 text-gray-600">{surgery.surgeryType}</td>
                                <td className="px-6 py-4 text-gray-600">
                                    <div className="flex items-center"><CalendarIcon className="w-4 h-4 mr-2 text-gray-400" /> {format(new Date(surgery.startTime), 'MMM dd, yyyy')}</div>
                                    <div className="flex items-center mt-1 text-xs"><Clock className="w-3 h-3 mr-2 text-gray-400" /> {format(new Date(surgery.startTime), 'HH:mm')} - {format(new Date(surgery.endTime), 'HH:mm')}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${surgery.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                                        surgery.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                                            surgery.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {surgery.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {surgery.status === 'Scheduled' && (
                                        <button onClick={() => handleStatusChange(surgery._id, 'In Progress')} className="text-blue-600 hover:text-blue-800 text-xs font-bold mr-3">Start</button>
                                    )}
                                    {surgery.status === 'In Progress' && (
                                        <button onClick={() => handleStatusChange(surgery._id, 'Completed')} className="text-emerald-600 hover:text-emerald-800 text-xs font-bold mr-3">Complete</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {surgeries.length === 0 && (
                            <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No surgeries scheduled yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl w-full max-w-xl p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6">Schedule New Surgery</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4 cursor-pointer" onClick={() => setIsImmediate(!isImmediate)}>
                                <div>
                                    <h3 className="text-sm font-bold text-blue-900">Immediate Surgery</h3>
                                    <p className="text-xs text-blue-700 mt-1">Schedules for right now and marks as In Progress</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={isImmediate} onChange={(e) => setIsImmediate(e.target.checked)} onClick={(e) => e.stopPropagation()} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                </label>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                                    <input required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none"
                                        onChange={e => setFormData({ ...formData, patientName: e.target.value })} value={formData.patientName} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Surgeon Name</label>
                                    <input required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none"
                                        onChange={e => setFormData({ ...formData, surgeonName: e.target.value })} value={formData.surgeonName} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Operation Theatre</label>
                                <select required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none"
                                    onChange={e => setFormData({ ...formData, operationTheatreId: e.target.value })} value={formData.operationTheatreId}>
                                    <option value="">Select OT</option>
                                    {ots.map(ot => <option key={ot._id} value={ot._id}>{ot.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Surgery Type</label>
                                <input required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none"
                                    onChange={e => setFormData({ ...formData, surgeryType: e.target.value })} value={formData.surgeryType} />
                            </div>
                            {!isImmediate && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                        <input required type="datetime-local" className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none"
                                            onChange={e => setFormData({ ...formData, startTime: e.target.value })} value={formData.startTime} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                        <input required type="datetime-local" className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none"
                                            onChange={e => setFormData({ ...formData, endTime: e.target.value })} value={formData.endTime} />
                                    </div>
                                </div>
                            )}
                            <div className="mt-8 flex justify-end space-x-3">
                                <button type="button" onClick={closeModal} className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                                <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-primary-500/30 transition-all">{isImmediate ? 'Start Now' : 'Schedule'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
