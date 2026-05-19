import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import QRCode from 'react-qr-code';
import { 
  ArrowLeft, Printer, ShieldCheck, Activity, Package, 
  Settings, Clock, UserCheck, TestTube, History, CheckCircle2 
} from 'lucide-react';

const STATUS_COLORS = {
  'Dirty': 'bg-gray-100 text-gray-700',
  'Cleaning': 'bg-blue-100 text-blue-700',
  'Packed': 'bg-indigo-100 text-indigo-700',
  'Sterilizing': 'bg-amber-100 text-amber-700',
  'Sterile': 'bg-emerald-100 text-emerald-700',
  'Stored': 'bg-teal-100 text-teal-700',
  'Issued': 'bg-purple-100 text-purple-700',
  'Returned': 'bg-orange-100 text-orange-700',
  'Expired': 'bg-red-100 text-red-700',
  'Failed': 'bg-red-100 text-red-900',
  'Pending': 'bg-gray-100 text-gray-500'
};

export default function SetDetails() {
  const { setId } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();
  
  const [set, setSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSet = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/sterilization-sets/${setId}`);
        setSet(res.data);
      } catch (err) {
        setError('Failed to load set details. It might not exist.');
      } finally {
        setLoading(false);
      }
    };
    fetchSet();
  }, [setId]);

  const handlePrintLabel = () => {
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`<html>
      <head>
        <title>Label — ${set.setId}</title>
        <style>
          body { font-family: monospace; padding: 20px; }
          .label-container { border: 2px solid #000; padding: 15px; width: 300px; }
          .title { font-weight: bold; font-size: 14px; margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 5px; }
          .row { margin-bottom: 5px; font-size: 12px; }
          .qr-box { margin-top: 15px; text-align: center; }
          @media print { body { margin: 0; padding: 0; } }
        </style>
      </head>
      <body>${content}</body>
    </html>`);
    win.document.close();
    win.print();
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading details...</div>;
  if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;
  if (!set) return <div className="p-10 text-center text-gray-500">Set not found.</div>;

  const isExpired = set.expiryDate && new Date(set.expiryDate) < new Date();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-gray-900">{set.setId}</h1>
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${STATUS_COLORS[set.status] || 'bg-gray-100 text-gray-700'}`}>
                {set.status}
              </span>
              {isExpired && <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700">Expired</span>}
            </div>
            <p className="text-gray-500 font-medium">{set.instrumentName}</p>
          </div>
        </div>
        <button onClick={handlePrintLabel} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all">
          <Printer className="w-4 h-4" /> Print Label
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Info */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Package className="w-4 h-4" /> Basic Information
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
              <div><p className="text-xs text-gray-500 font-bold mb-1">Zone</p><p className="font-semibold">{set.zone}</p></div>
              <div><p className="text-xs text-gray-500 font-bold mb-1">Instrument Count</p><p className="font-semibold">{set.instrumentCount} pieces</p></div>
              <div><p className="text-xs text-gray-500 font-bold mb-1">Batch Number</p><p className="font-semibold">{set.batchNumber}</p></div>
            </div>
          </section>

          {/* Process & Machine Details */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Process & Machine
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 mb-6">
              <div><p className="text-xs text-gray-500 font-bold mb-1">Method</p><p className="font-semibold">{set.sterilizationMethod}</p></div>
              <div><p className="text-xs text-gray-500 font-bold mb-1">Cycle Number</p><p className="font-semibold">{set.cycleNumber || '—'}</p></div>
              <div><p className="text-xs text-gray-500 font-bold mb-1">Load Number</p><p className="font-semibold">{set.loadNumber || '—'}</p></div>
              <div><p className="text-xs text-gray-500 font-bold mb-1">Program Number</p><p className="font-semibold">{set.programNumber || '—'}</p></div>
              <div><p className="text-xs text-gray-500 font-bold mb-1">Temperature</p><p className="font-semibold">{set.temperature || '—'}</p></div>
              <div><p className="text-xs text-gray-500 font-bold mb-1">Pressure</p><p className="font-semibold">{set.pressure || '—'}</p></div>
              <div><p className="text-xs text-gray-500 font-bold mb-1">Duration</p><p className="font-semibold">{set.duration ? `${set.duration} min` : '—'}</p></div>
              {set.sterilizationMethod === 'ETO' && <div><p className="text-xs text-gray-500 font-bold mb-1">Aeration Time</p><p className="font-semibold">{set.aerationTime ? `${set.aerationTime} min` : '—'}</p></div>}
            </div>
            <div className="pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 bg-gray-50 rounded-xl p-4">
              <div><p className="text-xs text-gray-500 font-bold mb-1">Machine Name</p><p className="font-semibold">{set.machineName || '—'}</p></div>
              <div><p className="text-xs text-gray-500 font-bold mb-1">Machine ID</p><p className="font-semibold">{set.machineId || '—'}</p></div>
              <div><p className="text-xs text-gray-500 font-bold mb-1">Brand</p><p className="font-semibold">{set.sterilizerBrand || '—'}</p></div>
              <div><p className="text-xs text-gray-500 font-bold mb-1">Serial Number</p><p className="font-semibold">{set.machineSerialNumber || '—'}</p></div>
            </div>
          </section>

          {/* Indicators Section */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <TestTube className="w-4 h-4" /> Quality Indicators
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['biologicalIndicator', 'chemicalIndicator', 'bowieDickTest', 'indicatorResult'].map(ind => (
                <div key={ind} className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                  <p className="text-xs text-gray-500 font-bold mb-2 capitalize">{ind.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                    set[ind] === 'Passed' ? 'bg-emerald-100 text-emerald-700' :
                    set[ind] === 'Failed' ? 'bg-red-100 text-red-700' :
                    set[ind] === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {set[ind] || 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </section>
          
          {/* Dates & Staff */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <UserCheck className="w-4 h-4" /> Dates & Staff
            </h2>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-100 fill-blue-500" />
                <div><p className="text-xs text-gray-500 font-bold mb-0.5">Sterilization Date</p><p className="font-semibold">{set.sterilizedDate ? format(new Date(set.sterilizedDate), 'dd MMM yyyy, HH:mm') : '—'}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className={`w-8 h-8 ${isExpired ? 'text-red-100 fill-red-500' : 'text-emerald-100 fill-emerald-500'}`} />
                <div><p className="text-xs text-gray-500 font-bold mb-0.5">Expiry Date</p><p className={`font-semibold ${isExpired ? 'text-red-600' : ''}`}>{set.expiryDate ? format(new Date(set.expiryDate), 'dd MMM yyyy') : '—'}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">{set.sterilizedBy?.charAt(0) || '?'}</div>
                <div><p className="text-xs text-gray-500 font-bold mb-0.5">Sterilized By</p><p className="font-semibold">{set.sterilizedBy || '—'}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">{set.checkedBy?.charAt(0) || '?'}</div>
                <div><p className="text-xs text-gray-500 font-bold mb-0.5">Verified By</p><p className="font-semibold">{set.checkedBy || '—'}</p></div>
              </div>
            </div>
            {set.notes && (
              <div className="mt-6 p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm border border-yellow-200">
                <strong>Notes:</strong> {set.notes}
              </div>
            )}
          </section>

        </div>

        {/* Sidebar: History Timeline */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <History className="w-4 h-4" /> Activity History
            </h2>
            
            <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 pb-4">
              {set.history && set.history.length > 0 ? (
                [...set.history].reverse().map((log, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div className="absolute w-4 h-4 bg-indigo-500 rounded-full border-4 border-white -left-[9px] top-1 shadow-sm"></div>
                    <p className="text-sm font-bold text-gray-900">{log.action}</p>
                    <p className="text-xs text-gray-500 mt-1">Status changed to <span className={`font-semibold ${STATUS_COLORS[log.status]?.split(' ')[1] || 'text-gray-900'}`}>{log.status}</span></p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" /> {log.user}</span>
                      <span>•</span>
                      <span>{format(new Date(log.timestamp), 'dd MMM yyyy, HH:mm')}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 ml-6">No history available.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Hidden Printable Label Content */}
      <div className="hidden">
        <div ref={printRef} className="label-container">
          <div className="title">PESU HOSPITALS — CSSD</div>
          <div className="row"><b>ID:</b> {set.setId}</div>
          <div className="row"><b>Item:</b> {set.instrumentName} ({set.instrumentCount} pcs)</div>
          <div className="row"><b>Method:</b> {set.sterilizationMethod}</div>
          <div className="row"><b>Batch:</b> {set.batchNumber}</div>
          <div className="row"><b>Exp Date:</b> {set.expiryDate ? format(new Date(set.expiryDate), 'dd/MM/yyyy') : 'N/A'}</div>
          <div className="qr-box">
             <QRCode value={`${window.location.origin}/sterilization/set/${set._id}`} size={120} />
          </div>
        </div>
      </div>

    </div>
  );
}
