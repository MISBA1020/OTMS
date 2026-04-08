import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';

export default function Scheduling() {
    const [surgeries, setSurgeries] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/surgeries');
            setSurgeries(res.data);
        } catch (err) {
            console.error(err);
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
            <div className="mb-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Scheduling Calendar</h1>
                <p className="text-gray-500 mt-1">Manage and track daily surgical operations</p>
            </div>

            <div className="overflow-x-auto pb-10">
                <table className="w-full text-left border-separate border-spacing-y-3">
                    <thead className="text-gray-500 font-medium text-sm tracking-wide">
                        <tr>
                            <th className="px-6 pb-2 font-semibold">Patient / Surgeon</th>
                            <th className="px-6 pb-2 font-semibold">Theatre</th>
                            <th className="px-6 pb-2 font-semibold">Type</th>
                            <th className="px-6 pb-2 font-semibold">Timing</th>
                            <th className="px-6 pb-2 font-semibold">Status</th>
                            <th className="px-6 pb-2 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {surgeries.map(surgery => (
                            <tr key={surgery._id} className="glass-panel hover:-translate-y-1 transition-all duration-300">
                                <td className="px-6 py-5 rounded-l-3xl">
                                    <p className="font-bold text-gray-900 text-base">{surgery.patientName}</p>
                                    <p className="text-primary-600 font-semibold text-xs flex items-center mt-1"><User className="w-3.5 h-3.5 mr-1" />{surgery.surgeonName}</p>
                                </td>
                                <td className="px-6 py-5 font-bold text-gray-700">{surgery.operationTheatreId?.name || 'Unknown'}</td>
                                <td className="px-6 py-5 font-medium text-gray-500">{surgery.surgeryType}</td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center text-gray-800 font-semibold"><CalendarIcon className="w-4 h-4 mr-2 text-primary-500" /> {format(new Date(surgery.startTime), 'MMM dd, yyyy')}</div>
                                    <div className="flex items-center mt-1 text-xs text-gray-500 font-medium"><Clock className="w-3.5 h-3.5 mr-2" /> {format(new Date(surgery.startTime), 'HH:mm')} - {format(new Date(surgery.endTime), 'HH:mm')}</div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border shadow-sm ${surgery.status === 'Scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            surgery.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                surgery.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                                        }`}>
                                        {surgery.status}
                                    </span>
                                </td>
                                <td className="px-6 py-5 rounded-r-3xl">
                                    {surgery.status === 'Scheduled' && (
                                        <button onClick={() => handleStatusChange(surgery._id, 'In Progress')} className="bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-xs font-bold mr-3 shadow-sm transition-colors">Start OP</button>
                                    )}
                                    {surgery.status === 'In Progress' && (
                                        <button onClick={() => handleStatusChange(surgery._id, 'Completed')} className="bg-emerald-500 text-white hover:bg-emerald-600 px-4 py-2 rounded-xl text-xs font-bold mr-3 shadow-md shadow-emerald-500/20 transition-all">Complete</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {surgeries.length === 0 && (
                            <tr><td colSpan="6" className="px-6 py-16 text-center text-gray-500 font-medium glass-panel rounded-3xl">No surgeries scheduled yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
