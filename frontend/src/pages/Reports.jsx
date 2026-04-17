import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FileText, Download, FileJson, Search, Printer, CalendarIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

export default function Reports() {
    const [surgeries, setSurgeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        axios.get('http://localhost:5000/api/surgeries')
            .then(res => setSurgeries(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const filteredSurgeries = surgeries.filter(s => 
        s.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.uhid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.surgeonName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const exportCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "UHID,Patient Name,Surgery,Surgeon,Status,Start Time,End Time\n";
        filteredSurgeries.forEach(row => {
            csvContent += `"${row.uhid}","${row.patientName}","${row.surgery}","${row.surgeonName}","${row.status}","${row.startTime}","${row.endTime}"\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "OTMS_Scheduling_Report.csv");
        document.body.appendChild(link);
        link.click();
    };

    const exportTXT = () => {
        let txtContent = "OTMS MASTER SCHEDULING REPORT\n=================================\n\n";
        filteredSurgeries.forEach(s => {
            txtContent += `Patient: ${s.patientName} (UHID: ${s.uhid})\n`;
            txtContent += `Procedure: ${s.surgery}\n`;
            txtContent += `Lead Surgeon: ${s.surgeonName}\n`;
            txtContent += `Status: ${s.status}\n`;
            txtContent += `Timing: ${new Date(s.startTime).toLocaleString()} - ${new Date(s.endTime).toLocaleString()}\n`;
            txtContent += `---------------------------------\n`;
        });
        const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "OTMS_Scheduling_Report.txt";
        link.click();
    };

    const exportMasterPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("OTMS Scheduling Directory Master Report", 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
        
        const tableColumn = ["Patient Name", "UHID", "Procedure", "Lead Surgeon", "Status", "Date"];
        const tableRows = [];

        filteredSurgeries.forEach(s => {
            const ticketData = [
                s.patientName,
                s.uhid,
                s.surgery,
                s.surgeonName,
                s.status,
                format(new Date(s.startTime), 'MMM dd, yyyy HH:mm')
            ];
            tableRows.push(ticketData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [37, 99, 235] }
        });
        doc.save("OTMS_Master_Report.pdf");
    };

    const downloadPatientRecord = (surgery) => {
        const doc = new jsPDF();
        
        doc.setFontSize(22);
        doc.setTextColor(37, 99, 235);
        doc.text("Operation Theatre Management System", 105, 20, null, null, "center");
        
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("CONFIDENTIAL CLINICAL RECORD", 105, 30, null, null, "center");

        // Horizontal Line
        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);
        
        doc.setFontSize(12);
        
        // Block 1: Patient Data
        doc.setFont(undefined, 'bold');
        doc.text("A. Patient Demographics", 20, 45);
        doc.setFont(undefined, 'normal');
        doc.text(`Patient Name: ${surgery.patientName}`, 25, 55);
        doc.text(`UHID: ${surgery.uhid}`, 25, 63);
        doc.text(`IP Number: ${surgery.ipNumber || 'N/A'}`, 120, 63);
        doc.text(`Age/Sex: ${surgery.age} / ${surgery.sex}`, 25, 71);
        doc.text(`Ward: ${surgery.ward}`, 120, 71);
        
        // Block 2: Clinical Details
        doc.setFont(undefined, 'bold');
        doc.text("B. Surgical Details", 20, 85);
        doc.setFont(undefined, 'normal');
        doc.text(`Diagnosis: ${surgery.diagnosis}`, 25, 95);
        doc.text(`Intervention: ${surgery.surgery}`, 25, 103);
        doc.text(`Category & Priority: ${surgery.surgeryCategory} (${surgery.priority})`, 25, 111);
        
        // Block 3: Team Configuration
        doc.setFont(undefined, 'bold');
        doc.text("C. Intraoperative Staffing", 20, 125);
        doc.setFont(undefined, 'normal');
        doc.text(`Lead Surgeon: ${surgery.surgeonName}`, 25, 135);
        doc.text(`Anesthesiologist: ${surgery.anesthesiologist}`, 120, 135);
        doc.text(`Anaesthesia Type: ${surgery.anaesthesiaType}`, 120, 143);
        doc.text(`Scrub Nurse: ${surgery.scrubNurse}`, 25, 143);
        doc.text(`OT Tech: ${surgery.otTechnician}`, 25, 151);

        // Block 4: Timing
        doc.setFont(undefined, 'bold');
        doc.text("D. Chronology", 20, 165);
        doc.setFont(undefined, 'normal');
        doc.text(`Commenced: ${new Date(surgery.startTime).toLocaleString()}`, 25, 175);
        doc.text(`Completed: ${new Date(surgery.endTime).toLocaleString()}`, 25, 183);
        doc.text(`Final Status: ${surgery.status.toUpperCase()}`, 120, 175);

        doc.save(`Patient_Record_${surgery.uhid}.pdf`);
    };

    return (
        <div className="space-y-8 relative">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center"><FileText className="w-8 h-8 mr-3 text-secondary-500" /> Administrative Reports</h1>
                    <p className="text-gray-500 mt-2">Export aggregate scheduling data or detailed patient clinical files.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button onClick={exportCSV} className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all flex items-center">
                        <FileJson className="w-4 h-4 mr-2 text-emerald-500" /> Export CSV
                    </button>
                    <button onClick={exportTXT} className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-indigo-500" /> Export TXT
                    </button>
                    <button onClick={exportMasterPDF} className="bg-gradient-to-r from-primary-600 to-indigo-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center">
                        <Printer className="w-4 h-4 mr-2" /> Master PDF
                    </button>
                </div>
            </div>

            <div className="relative mb-6 w-full md:w-96">
                <Search className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search records by Patient, UHID, or Surgeon..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/70 backdrop-blur-md border border-gray-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 rounded-2xl outline-none font-medium text-gray-800 shadow-sm transition-all"
                />
            </div>

            <div className="overflow-x-auto pb-10">
                <table className="w-full text-left border-separate border-spacing-y-3">
                    <thead className="text-gray-500 font-medium text-sm tracking-wide">
                        <tr>
                            <th className="px-6 pb-2 font-semibold">Patient Information</th>
                            <th className="px-6 pb-2 font-semibold">Diagnosis & Procedure</th>
                            <th className="px-6 pb-2 font-semibold">Surgical Team</th>
                            <th className="px-6 pb-2 font-semibold">Schedule Log</th>
                            <th className="px-6 pb-2 font-semibold text-center">Individual Extraction</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {loading && <tr><td colSpan="5" className="text-center py-12 glass-panel rounded-3xl font-bold text-gray-400">Querying Master Database...</td></tr>}
                        {!loading && filteredSurgeries.map(s => (
                            <tr key={s._id} className="glass-panel hover:-translate-y-1 transition-all duration-300">
                                <td className="px-6 py-5 rounded-l-3xl">
                                    <p className="font-bold text-gray-900 text-base">{s.patientName}</p>
                                    <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-md mt-1.5 inline-block border border-indigo-100">UHID: {s.uhid}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="font-bold text-gray-800 line-clamp-1">{s.surgery}</p>
                                    <p className="text-xs font-medium text-gray-500 mt-1 line-clamp-1">{s.diagnosis}</p>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="font-bold text-gray-700">{s.surgeonName}</p>
                                    <p className="text-xs font-medium text-gray-500 mt-1">Anesth: {s.anesthesiologist}</p>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center text-gray-800 font-semibold mb-1"><CalendarIcon className="w-3.5 h-3.5 mr-2 text-primary-500" /> {format(new Date(s.startTime), 'MMM dd')}</div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${s.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {s.status}
                                    </span>
                                </td>
                                <td className="px-6 py-5 rounded-r-3xl text-center">
                                    <button 
                                        onClick={() => downloadPatientRecord(s)}
                                        className="bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center w-max mx-auto transition-colors shadow-sm"
                                    >
                                        <Download className="w-4 h-4 mr-2" /> PDF Record
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
