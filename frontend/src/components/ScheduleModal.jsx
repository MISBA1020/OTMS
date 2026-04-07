import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Activity, Clock, ShieldAlert } from 'lucide-react';

// Static Data based on Requirements
const WARD_OPTIONS = ['FSW', 'MSW', 'ENT', 'FOW', 'MOW', 'OBS', 'Gyn', 'F-ophthal', 'M-ophthal', 'Psychiatric Female Ward'];
const ANAESTHESIA_OPTIONS = ['GA', 'LA', 'MAC', 'EA', 'RA', 'NB', 'TIVA', 'Sedation', 'TA', 'FB'];
const ANESTHESIOLOGISTS = ['Dr. Ellie Sattler', 'Dr. Henry Wu', 'Dr. John Hammond'];
const NURSES = ['Sulochana - Chief Nurse', 'Kavya - Assistant Nurse', 'Nayana - Admin'];
const TECHNICIANS = ['Mike - Lead Tech', 'Steve - Tech', 'Robert - Tech'];

export default function ScheduleModal({ showModal, setShowModal, onSuccess }) {
    const [surgeonsList, setSurgeonsList] = useState(['Dr. Sarah Jenkins', 'Dr. John Doe', 'Dr. Alan Grant', 'Dr. Ian Malcolm']);
    const [showAddSurgeonModal, setShowAddSurgeonModal] = useState(false);
    const [newSurgeonName, setNewSurgeonName] = useState('');
    const [ots, setOts] = useState([]);
    const [isImmediate, setIsImmediate] = useState(false);
    
    const [formData, setFormData] = useState({
        uhid: '',
        aadharNo: '',
        ipNumber: '',
        patientName: '',
        age: '',
        sex: 'M',
        ward: 'FSW',
        diagnosis: '',
        surgery: '',
        surgeryCategory: 'Major',
        priority: 'Planned',
        operationTheatreId: '',
        surgeonName: '',
        anesthesiologist: '',
        anaesthesiaType: 'GA',
        scrubNurse: '',
        otTechnician: '',
        startTime: '',
        endTime: '',
    });

    useEffect(() => {
        if (showModal) {
            axios.get('http://localhost:5000/api/ots')
                 .then(res => setOts(res.data))
                 .catch(err => console.error(err));
        }
    }, [showModal]);

    if (!showModal) return null;

    const closeModal = () => {
        setShowModal(false);
        setIsImmediate(false);
        setFormData({
            uhid: '', aadharNo: '', ipNumber: '', patientName: '', age: '', sex: 'M', ward: 'FSW',
            diagnosis: '', surgery: '', surgeryCategory: 'Major', priority: 'Planned',
            operationTheatreId: '', surgeonName: '', anesthesiologist: '', anaesthesiaType: 'GA',
            scrubNurse: '', otTechnician: '', startTime: '', endTime: '',
        });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        
        let payload = { ...formData };
        if (isImmediate) {
            const now = new Date();
            const end = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours default for immediate
            payload.startTime = now.toISOString();
            payload.endTime = end.toISOString();
            payload.status = 'In Progress';
        }

        try {
            await axios.post('http://localhost:5000/api/surgeries', payload);
            closeModal();
            onSuccess && onSuccess();
            alert(isImmediate ? 'Immediate surgery started successfully!' : 'Surgery scheduled successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to schedule. Check for overlaps.');
        }
    };

    const handleChange = (e) => {
        if (e.target.name === 'surgeonName' && e.target.value === 'ADD_NEW') {
            setShowAddSurgeonModal(true);
            return;
        }
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddSurgeon = (e) => {
        e.preventDefault();
        const name = newSurgeonName.trim();
        if (!name) return alert('Name cannot be empty');
        if (surgeonsList.includes(name)) return alert('Surgeon already exists');
        
        setSurgeonsList([...surgeonsList, name]);
        setFormData({ ...formData, surgeonName: name });
        setShowAddSurgeonModal(false);
        setNewSurgeonName('');
        alert('Surgeon added successfully');
    };

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Schedule Comprehensive Surgery</h2>
                        <p className="text-sm text-gray-500 mt-1">Complete the mandatory operational and clinical context</p>
                    </div>
                </div>

                {/* Scrollable Form Body */}
                <div className="flex-1 overflow-y-auto p-8">
                    <form id="surgeryForm" onSubmit={handleCreate} className="space-y-8">
                        
                        {/* Section 1: Patient Information */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 flex items-center mb-4"><User className="w-5 h-5 mr-2 text-primary-500" /> Patient Demographics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-sm text-gray-600 font-bold mb-1">UHID</label>
                                    <input required name="uhid" className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none" onChange={handleChange} value={formData.uhid}/>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 font-bold mb-1">Patient Name</label>
                                    <input required name="patientName" className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none" onChange={handleChange} value={formData.patientName}/>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 font-bold mb-1">Ward Assignment</label>
                                    <select required name="ward" className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none" onChange={handleChange} value={formData.ward}>
                                        {WARD_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 font-bold mb-1">Aadhar Number</label>
                                    <input type="number" required name="aadharNo" className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none" onChange={handleChange} value={formData.aadharNo}/>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 font-bold mb-1">I.P Number</label>
                                    <input type="number" required name="ipNumber" className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none" onChange={handleChange} value={formData.ipNumber}/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-600 font-bold mb-1">Age</label>
                                        <input type="number" required name="age" className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none" onChange={handleChange} value={formData.age}/>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 font-bold mb-1">Sex</label>
                                        <select required name="sex" className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none" onChange={handleChange} value={formData.sex}>
                                            <option value="M">M</option>
                                            <option value="F">F</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Clinical Details */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 flex items-center mb-4 pt-4 border-t border-gray-100"><Activity className="w-5 h-5 mr-2 text-rose-500" /> Clinical & Operation Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                <div>
                                    <label className="block text-sm text-gray-600 font-bold mb-1">Diagnosis</label>
                                    <textarea required name="diagnosis" rows="2" className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none" onChange={handleChange} value={formData.diagnosis}></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 font-bold mb-1">Surgery Request</label>
                                    <textarea required name="surgery" rows="2" className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none" onChange={handleChange} value={formData.surgery}></textarea>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-sm text-gray-600 font-bold mb-1">Operation Theatre</label>
                                    <select required name="operationTheatreId" className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none bg-blue-50/50" onChange={handleChange} value={formData.operationTheatreId}>
                                        <option value="">-- Assign Theatre --</option>
                                        {ots.map(ot => <option key={ot._id} value={ot._id}>{ot.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 font-bold mb-1">Surgery Category</label>
                                    <select required name="surgeryCategory" className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none" onChange={handleChange} value={formData.surgeryCategory}>
                                        <option value="Major">Major</option>
                                        <option value="Minor">Minor</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 font-bold mb-1">Priority Selection</label>
                                    <select required name="priority" className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none" onChange={handleChange} value={formData.priority}>
                                        <option value="Planned">Planned</option>
                                        <option value="Unplanned">Unplanned</option>
                                        <option value="Emergency">Emergency</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Staff & Timing */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 flex items-center mb-4 pt-4 border-t border-gray-100"><ShieldAlert className="w-5 h-5 mr-2 text-emerald-500" /> Operational & Staff Commitments</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-5">
                                <div>
                                    <label className="block text-sm text-gray-600 font-bold mb-1">Lead Surgeon</label>
                                    <select required name="surgeonName" className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none" onChange={handleChange} value={formData.surgeonName}>
                                        <option value="">- Select -</option>
                                        {surgeonsList.map(s => <option key={s} value={s}>{s}</option>)}
                                        <option value="ADD_NEW">➕ Add New Surgeon</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 font-bold mb-1">Anesthesiologist</label>
                                    <select required name="anesthesiologist" className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none" onChange={handleChange} value={formData.anesthesiologist}>
                                        <option value="">- Select -</option>
                                        {ANESTHESIOLOGISTS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 font-bold mb-1">Scrub Nurse</label>
                                    <select required name="scrubNurse" className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none" onChange={handleChange} value={formData.scrubNurse}>
                                        <option value="">- Select -</option>
                                        {NURSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 font-bold mb-1">OT Technician</label>
                                    <select required name="otTechnician" className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none" onChange={handleChange} value={formData.otTechnician}>
                                        <option value="">- Select -</option>
                                        {TECHNICIANS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                                <div>
                                    <label className="block text-sm text-gray-600 font-bold mb-1">Anaesthesia Type</label>
                                    <select required name="anaesthesiaType" className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none" onChange={handleChange} value={formData.anaesthesiaType}>
                                        {ANAESTHESIA_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                </div>

                                <div className="md:col-span-3 flex items-center space-x-5">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between bg-blue-50 p-2.5 rounded-xl border border-blue-100 cursor-pointer" onClick={() => setIsImmediate(!isImmediate)}>
                                            <div>
                                                <h3 className="text-sm font-bold text-blue-900 flex items-center"><Clock className="w-4 h-4 mr-1"/> Immediate Operation</h3>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={isImmediate} onChange={(e) => setIsImmediate(e.target.checked)} onClick={(e) => e.stopPropagation()} />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                    {!isImmediate && (
                                        <>
                                            <div className="flex-1">
                                                <input required type="datetime-local" name="startTime" className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none" onChange={handleChange} value={formData.startTime} />
                                            </div>
                                            <div className="flex-1">
                                                <input required type="datetime-local" name="endTime" className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-2 focus:ring-primary-500 outline-none" onChange={handleChange} value={formData.endTime} />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Controls */}
                <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3 flex-shrink-0">
                    <button type="button" onClick={closeModal} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
                    <button type="submit" form="surgeryForm" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-500/30 transition-all text-lg">
                        {isImmediate ? 'Initiate Surgery Now' : 'Save & Schedule Block'}
                    </button>
                </div>

            </div>

            {/* Add New Surgeon Modal */}
            {showAddSurgeonModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-96 p-6">
                        <h3 className="text-xl font-bold mb-4">Add New Surgeon</h3>
                        <input autoFocus type="text" value={newSurgeonName} onChange={e => setNewSurgeonName(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none mb-5" placeholder="e.g., Dr. First Last" />
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => { setShowAddSurgeonModal(false); setNewSurgeonName(''); }} className="px-4 py-2 font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                            <button onClick={handleAddSurgeon} className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors">Add</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
