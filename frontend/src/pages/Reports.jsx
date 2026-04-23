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

    const downloadPatientRecord = async (surgery) => {
        // Safely load the hospital logo from public folder as base64
        let logoBase64 = null;
        let logoFormat = 'WEBP';
        try {
            const response = await fetch('/pes logo.webp');
            if (response.ok) {
                const blob = await response.blob();
                logoBase64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            }
        } catch (e) {
            console.warn('Logo not loaded, using fallback.', e);
        }

        const doc = new jsPDF({ unit: 'mm', format: 'a4' });
        const pageW = 210;
        const margin = 15;
        const colMid = 105;
        let y = 14;


        // ── Helpers ─────────────────────────────────────────────────────────
        const sectionHeader = (title) => {
            doc.setFillColor(220, 225, 235);
            doc.rect(margin, y, pageW - margin * 2, 7, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9.5);
            doc.setTextColor(30, 30, 30);
            doc.text(title, margin + 2, y + 5);
            y += 10;
        };

        const row2col = (l1, v1, l2, v2) => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(60, 60, 60);
            doc.text(l1, margin + 2, y);
            doc.setFont('helvetica', 'bold');
            doc.text(v1 || '—', margin + 32, y);
            if (l2) {
                doc.setFont('helvetica', 'normal');
                doc.text(l2, colMid, y);
                doc.setFont('helvetica', 'bold');
                doc.text(v2 || '—', colMid + 28, y);
            }
            y += 7;
        };

        const row1col = (label, value) => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(60, 60, 60);
            doc.text(label, margin + 2, y);
            doc.setFont('helvetica', 'bold');
            doc.text(value || '—', margin + 32, y);
            y += 7;
        };

        const divider = () => {
            doc.setDrawColor(210, 210, 210);
            doc.setLineWidth(0.2);
            doc.line(margin, y - 2, pageW - margin, y - 2);
        };

        // ── Header ───────────────────────────────────────────────────────────
        if (logoBase64) {
            doc.addImage(logoBase64, 'WEBP', margin, y, 18, 18);
        } else {
            // Fallback: drawn compass circle
            doc.setDrawColor(30, 50, 110);
            doc.setLineWidth(1);
            doc.circle(margin + 9, y + 9, 8);
            doc.setFillColor(230, 130, 30);
            doc.circle(margin + 9, y + 9, 6, 'F');
        }

        // "PESU Hospitals" — dark navy bold, vertically centered beside logo
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(30, 45, 100);
        doc.text('PESU Hospitals', margin + 22, y + 11);
        y += 22;


        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 30, 30);
        doc.text('OPERATION THEATRE RECORD SHEET', pageW / 2, y, { align: 'center' });
        y += 4;

        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.4);
        doc.line(margin, y, pageW - margin, y);
        y += 5;

        // ── 1. Patient Details ────────────────────────────────────────────────
        sectionHeader('Patient Details');
        row2col('Patient Name:', surgery.patientName, 'UHID:', surgery.uhid);
        row2col('IP Number:', surgery.ipNumber || 'N/A', 'Age / Sex:', `${surgery.age} / ${surgery.sex}`);
        row2col('Ward:', surgery.ward, 'Ward:', surgery.ward);
        y += 2;

        // ── 2. Surgical Information ───────────────────────────────────────────
        sectionHeader('Surgical Information');
        const startDt = new Date(surgery.startTime);
        const endDt   = new Date(surgery.endTime);
        const fmt = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateFmt = (d) => d.toLocaleDateString('en-GB').replaceAll('/', '/');
        row2col('Date:', dateFmt(startDt), 'Time (Start - End):', `${fmt(startDt)} - ${fmt(endDt)}`);
        row2col('Operation Theatre:', surgery.operationTheatreId?.name || 'N/A', 'Surgery Type:', surgery.surgery?.substring(0, 20));
        row2col('Category:', surgery.surgeryCategory, 'Priority:', surgery.priority);
        y += 2;

        // ── 3. Clinical Details ───────────────────────────────────────────────
        sectionHeader('Clinical Details');
        row1col('Diagnosis:', surgery.diagnosis);
        row1col('Surgery/Procedure:', surgery.surgery);
        y += 2;

        // ── 4. OT Staff Details ───────────────────────────────────────────────
        sectionHeader('OT Staff Details');
        row1col('Lead Surgeon:', surgery.surgeonName);
        row2col('Anesthesiologist:', surgery.anesthesiologist, 'Scrub Nurse:', surgery.scrubNurse);
        row1col('OT Technician:', surgery.otTechnician);
        y += 2;

        // ── 5. Anaesthesia  |  Outcome / Remarks  (side by side) ─────────────
        const anaStart = y;
        sectionHeader('Anaesthesia');
        row1col('Type:', surgery.anaesthesiaType);
        const anaEnd = y;

        // rewind and do right column
        y = anaStart;
        const rhX = colMid + 2;

        doc.setFillColor(220, 225, 235);
        doc.rect(colMid, y, pageW - margin - colMid, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 30, 30);
        doc.text('Outcome / Remarks', rhX, y + 5);
        y += 10;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        doc.text('Surgery Outcome:', rhX, y);
        doc.setFont('helvetica', 'bold');
        doc.text('Successful', rhX + 32, y);
        y += 7;

        doc.setFont('helvetica', 'normal');
        doc.text('Complications (if any):', rhX, y);
        doc.setFont('helvetica', 'bold');
        doc.text('None', rhX + 38, y);

        y = Math.max(anaEnd, y) + 4;

        // ── 6. Intraoperative Notes  |  Post-Operative Orders ────────────────
        const notesStart = y;
        sectionHeader('Intraoperative Notes');

        // Intraoperative Notes — left blank for manual writing
        y += 30; // blank writing space
        const notesEnd = y;

        // right column — Post-Operative Orders
        y = notesStart;
        doc.setFillColor(220, 225, 235);
        doc.rect(colMid, y, pageW - margin - colMid, 7, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 30, 30);
        doc.text('Post-Operative Orders', rhX, y + 5);
        y += 10;

        // Post-Operative Orders — left blank for doctor to fill manually
        y += 30; // blank writing space

        y = Math.max(notesEnd, y) + 5;

        // ── 7. Signatures ─────────────────────────────────────────────────────
        sectionHeader('Signatures');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        doc.text('Surgeon Signature:', margin + 2, y + 5);
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.3);
        doc.line(margin + 38, y + 5, margin + 80, y + 5);
        // Blank — for manual signing

        // ── Footer ────────────────────────────────────────────────────────────
        doc.setFontSize(7.5);
        doc.setTextColor(150, 150, 150);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${new Date().toLocaleString()}  |  UHID: ${surgery.uhid}  |  CONFIDENTIAL`, pageW / 2, 290, { align: 'center' });

        doc.save(`OT_Record_${surgery.uhid}.pdf`);
    };

    return (
        <div className="space-y-8 relative">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center transition-colors"><FileText className="w-8 h-8 mr-3 text-secondary-500" /> Administrative Reports</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 transition-colors">Export aggregate scheduling data or detailed patient clinical files.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button onClick={exportCSV} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all flex items-center">
                        <FileJson className="w-4 h-4 mr-2 text-emerald-500" /> Export CSV
                    </button>
                    <button onClick={exportTXT} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-indigo-500" /> Export TXT
                    </button>
                    <button onClick={exportMasterPDF} className="bg-gradient-to-r from-primary-600 to-indigo-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center">
                        <Printer className="w-4 h-4 mr-2" /> Master PDF
                    </button>
                </div>
            </div>

            <div className="relative mb-6 w-full md:w-96">
                <Search className="w-5 h-5 absolute left-4 top-3.5 text-gray-400 dark:text-gray-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search records by Patient, UHID, or Surgeon..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-gray-200 dark:border-slate-700/50 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 rounded-2xl outline-none font-medium text-gray-800 dark:text-white dark:placeholder-gray-500 shadow-sm transition-all"
                />
            </div>

            <div className="overflow-x-auto pb-10">
                <table className="w-full text-left border-separate border-spacing-y-3">
                    <thead className="text-gray-500 dark:text-gray-400 font-medium text-sm tracking-wide transition-colors">
                        <tr>
                            <th className="px-6 pb-2 font-semibold">Patient Information</th>
                            <th className="px-6 pb-2 font-semibold">Diagnosis & Procedure</th>
                            <th className="px-6 pb-2 font-semibold">Surgical Team</th>
                            <th className="px-6 pb-2 font-semibold">Schedule Log</th>
                            <th className="px-6 pb-2 font-semibold text-center">Individual Extraction</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {loading && <tr><td colSpan="5" className="text-center py-12 glass-panel dark:bg-slate-900 border dark:border-slate-800 rounded-3xl font-bold text-gray-400 dark:text-gray-500">Querying Master Database...</td></tr>}
                        {!loading && filteredSurgeries.map(s => (
                            <tr key={s._id} className="glass-panel dark:bg-slate-900 shadow-sm border border-transparent dark:border-slate-800 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                                <td className="px-6 py-5 rounded-l-3xl">
                                    <p className="font-bold text-gray-900 dark:text-slate-100 text-base">{s.patientName}</p>
                                    <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold px-2.5 py-1 rounded-md mt-1.5 inline-block border border-indigo-100 dark:border-indigo-800/50">UHID: {s.uhid}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="font-bold text-gray-800 dark:text-slate-200 line-clamp-1">{s.surgery}</p>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{s.diagnosis}</p>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="font-bold text-gray-700 dark:text-slate-300">{s.surgeonName}</p>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">Anesth: {s.anesthesiologist}</p>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center text-gray-800 dark:text-slate-200 font-semibold mb-1"><CalendarIcon className="w-3.5 h-3.5 mr-2 text-primary-500" /> {format(new Date(s.startTime), 'MMM dd')}</div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${s.status === 'Completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>
                                        {s.status}
                                    </span>
                                </td>
                                <td className="px-6 py-5 rounded-r-3xl text-center">
                                    <button 
                                        onClick={() => downloadPatientRecord(s)}
                                        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800/50 hover:bg-indigo-50 dark:hover:bg-slate-700 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center w-max mx-auto transition-colors shadow-sm"
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
