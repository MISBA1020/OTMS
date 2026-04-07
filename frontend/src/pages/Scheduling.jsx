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
        </div>
    );
}
