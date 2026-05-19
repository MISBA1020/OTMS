import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';
import { format } from 'date-fns';
import { Plus, Edit2, QrCode, Trash2, X, Printer, ShieldCheck, Package, FlaskConical } from 'lucide-react';

const ZONES = ['Zone 1', 'Zone 2', 'Zone 3'];
const ZONE_COLORS = {
  'Zone 1': { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800', btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30' },
  'Zone 2': { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800', btn: 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/30' },
  'Zone 3': { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800', btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30' },
};
const STATUS_COLORS = {
  'Pending':    'bg-amber-100 text-amber-700',
  'Sterilized': 'bg-emerald-100 text-emerald-700',
  'Expired':    'bg-red-100 text-red-700',
  'In Use':     'bg-blue-100 text-blue-700',
};
const METHODS = ['Autoclave', 'ETO', 'Dry Heat', 'Chemical'];
const STATUSES = ['Pending', 'Sterilized', 'Expired', 'In Use'];

const EMPTY_FORM = {
  zone: 'Zone 1', instrumentName: '', instrumentCount: '', batchNumber: '',
  sterilizationMethod: 'Autoclave', temperature: '', pressure: '', duration: '',
  cycleNumber: '', sterilizedDate: '', expiryDate: '', sterilizedBy: '',
  checkedBy: '', status: 'Pending', notes: '',
};

function buildQrText(s) {
  return [
    'PESU HOSPITALS — STERILIZATION RECORD',
    `Set ID    : ${s.setId}`,
    `Zone      : ${s.zone}`,
    `Instrument: ${s.instrumentName} (${s.instrumentCount} pcs)`,
    `Batch     : ${s.batchNumber}`,
    `Method    : ${s.sterilizationMethod}  Cycle: ${s.cycleNumber || 'N/A'}`,
    `Temp/Press: ${s.temperature || 'N/A'} / ${s.pressure || 'N/A'}  ${s.duration || 'N/A'} min`,
    `Sterilized: ${s.sterilizedDate ? format(new Date(s.sterilizedDate), 'dd/MM/yyyy HH:mm') : 'N/A'}`,
    `Expiry    : ${s.expiryDate ? format(new Date(s.expiryDate), 'dd/MM/yyyy') : 'N/A'}`,
    `By        : ${s.sterilizedBy}`,
    `Verified  : ${s.checkedBy}`,
    `Status    : ${s.status.toUpperCase()}`,
    s.notes ? `Notes     : ${s.notes}` : '',
  ].filter(Boolean).join('\n');
}

// ─── QR Modal ────────────────────────────────────────────────────────────────
function QRModal({ set, onClose }) {
  const printRef = useRef();
  const qrText = buildQrText(set);
  const isExpired = set.expiryDate && new Date(set.expiryDate) < new Date();

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Sticker — ${set.setId}</title>
      <style>body{font-family:monospace;padding:20px;} @media print{body{margin:0}}</style>
      </head><body>${content}</body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-500" /> Set QR — {set.setId}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>

        <div ref={printRef} className="p-6 space-y-4">
          <div className={`border-2 rounded-2xl p-4 ${isExpired ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">PESU Hospitals</span>
                <h4 className="text-xl font-black text-gray-900 mt-0.5">{set.setId}</h4>
                <p className="text-sm font-semibold text-gray-600">{set.instrumentName}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[set.status]}`}>{set.status}</span>
                <span className="text-xs text-gray-500">{set.zone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1 text-xs text-gray-600 mb-3">
              <span><b>Method:</b> {set.sterilizationMethod}</span>
              <span><b>Count:</b> {set.instrumentCount} pcs</span>
              <span><b>Batch:</b> {set.batchNumber}</span>
              <span><b>Cycle:</b> {set.cycleNumber || 'N/A'}</span>
              <span><b>Sterilized:</b> {set.sterilizedDate ? format(new Date(set.sterilizedDate), 'dd/MM/yyyy') : 'N/A'}</span>
              <span className={isExpired ? 'text-red-600 font-bold' : ''}>
                <b>Expiry:</b> {set.expiryDate ? format(new Date(set.expiryDate), 'dd/MM/yyyy') : 'N/A'}
              </span>
              <span><b>By:</b> {set.sterilizedBy}</span>
              <span><b>Verified:</b> {set.checkedBy}</span>
            </div>

            {isExpired && <p className="text-xs font-bold text-red-600 mb-2">⚠ THIS SET HAS EXPIRED — DO NOT USE</p>}

            <div className="flex justify-center bg-white rounded-xl p-3 border border-gray-100">
              <QRCode value={qrText} size={160} />
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors">Close</button>
          <button onClick={handlePrint} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2">
            <Printer className="w-4 h-4" /> Print Sticker
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Set Form Modal ───────────────────────────────────────────────────────────
function SetModal({ initialData, defaultZone, onClose, onSaved }) {
  const isEdit = !!initialData;
  const [form, setForm] = useState(
    isEdit ? {
      ...initialData,
      sterilizedDate: initialData.sterilizedDate ? format(new Date(initialData.sterilizedDate), "yyyy-MM-dd'T'HH:mm") : '',
      expiryDate: initialData.expiryDate ? format(new Date(initialData.expiryDate), 'yyyy-MM-dd') : '',
    } : { ...EMPTY_FORM, zone: defaultZone }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setField = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (isEdit) {
        await axios.put(`http://localhost:5000/api/sterilization-sets/${initialData._id}`, form);
      } else {
        await axios.post('http://localhost:5000/api/sterilization-sets', form);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all';
  const labelCls = 'block text-xs font-bold text-gray-600 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 shrink-0">
          <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Sterilization Set' : 'Register New Set'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-7 space-y-6">
          {/* Section 1: Set Identity */}
          <div>
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" /> Set Identity
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Zone</label>
                <select required className={inputCls} value={form.zone} onChange={e => setField('zone', e.target.value)}>
                  {ZONES.map(z => <option key={z}>{z}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Instrument Set Name</label>
                <input required className={inputCls} placeholder="e.g. Laparotomy Set" value={form.instrumentName} onChange={e => setField('instrumentName', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Instrument Count</label>
                <input required type="number" min="1" className={inputCls} placeholder="12" value={form.instrumentCount} onChange={e => setField('instrumentCount', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Batch Number</label>
                <input required className={inputCls} placeholder="BATCH-2026-001" value={form.batchNumber} onChange={e => setField('batchNumber', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Section 2: Process Details */}
          <div>
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <FlaskConical className="w-4 h-4" /> Process Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Sterilization Method</label>
                <select required className={inputCls} value={form.sterilizationMethod} onChange={e => setField('sterilizationMethod', e.target.value)}>
                  {METHODS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Cycle Number</label>
                <input className={inputCls} placeholder="e.g. C-042" value={form.cycleNumber} onChange={e => setField('cycleNumber', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Temperature</label>
                <input className={inputCls} placeholder="134°C" value={form.temperature} onChange={e => setField('temperature', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Pressure</label>
                <input className={inputCls} placeholder="2.1 bar" value={form.pressure} onChange={e => setField('pressure', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Duration (minutes)</label>
                <input type="number" min="1" className={inputCls} placeholder="20" value={form.duration} onChange={e => setField('duration', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select required className={inputCls} value={form.status} onChange={e => setField('status', e.target.value)}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Dates & Staff */}
          <div>
            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Dates & Staff
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Sterilization Date & Time</label>
                <input required type="datetime-local" className={inputCls} value={form.sterilizedDate} onChange={e => setField('sterilizedDate', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Expiry Date</label>
                <input required type="date" className={inputCls} value={form.expiryDate} onChange={e => setField('expiryDate', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Sterilized By (Technician)</label>
                <input required className={inputCls} placeholder="Staff name" value={form.sterilizedBy} onChange={e => setField('sterilizedBy', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Checked / Verified By</label>
                <input required className={inputCls} placeholder="Supervisor / Nurse name" value={form.checkedBy} onChange={e => setField('checkedBy', e.target.value)} />
              </div>
            </div>
            <div className="mt-4">
              <label className={labelCls}>Notes (optional)</label>
              <textarea className={`${inputCls} resize-none h-20`} placeholder="Any additional remarks..." value={form.notes} onChange={e => setField('notes', e.target.value)} />
            </div>
          </div>

          {error && (
            <p className="text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
          )}
        </form>

        <div className="px-7 py-5 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="px-8 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-60">
            {loading ? 'Saving...' : isEdit ? 'Update Set' : 'Register Set'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Set Card ────────────────────────────────────────────────────────────────
function SetCard({ set, onEdit, onQR, onDelete }) {
  const isExpired = set.expiryDate && new Date(set.expiryDate) < new Date();
  return (
    <div className={`bg-white rounded-2xl border ${isExpired ? 'border-red-200' : 'border-gray-100'} shadow-sm hover:shadow-md transition-all p-4 space-y-3`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-black text-gray-400 tracking-widest uppercase">{set.zone}</span>
          <h4 className="text-lg font-black text-gray-900 leading-tight">{set.setId}</h4>
          <p className="text-sm font-semibold text-gray-600">{set.instrumentName}</p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[set.status]}`}>{set.status}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
        <span><b className="text-gray-700">Method:</b> {set.sterilizationMethod}</span>
        <span><b className="text-gray-700">Count:</b> {set.instrumentCount} pcs</span>
        <span><b className="text-gray-700">Batch:</b> {set.batchNumber}</span>
        <span><b className="text-gray-700">By:</b> {set.sterilizedBy}</span>
        <span><b className="text-gray-700">Sterilized:</b> {set.sterilizedDate ? format(new Date(set.sterilizedDate), 'dd MMM yy') : '—'}</span>
        <span className={isExpired ? 'text-red-600 font-bold' : ''}>
          <b className="text-gray-700">Expiry:</b> {set.expiryDate ? format(new Date(set.expiryDate), 'dd MMM yy') : '—'}
        </span>
      </div>

      {isExpired && <p className="text-xs font-bold text-red-500">⚠ Expired — Re-sterilize required</p>}

      <div className="flex gap-2 pt-1">
        <button onClick={() => onQR(set)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors">
          <QrCode className="w-3.5 h-3.5" /> View QR
        </button>
        <button onClick={() => onEdit(set)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold transition-colors">
          <Edit2 className="w-3.5 h-3.5" /> Edit
        </button>
        <button onClick={() => onDelete(set)} className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Sterilization() {
  const [sets, setSets] = useState([]);
  const [activeZone, setActiveZone] = useState('Zone 1');
  const [showForm, setShowForm] = useState(false);
  const [editSet, setEditSet] = useState(null);
  const [qrSet, setQrSet] = useState(null);

  const fetchSets = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/sterilization-sets');
      setSets(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchSets(); }, []);

  const handleDelete = async (set) => {
    if (!window.confirm(`Delete set ${set.setId}? This cannot be undone.`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/sterilization-sets/${set._id}`);
      fetchSets();
    } catch (err) { alert('Delete failed'); }
  };

  const handleSaved = () => { setShowForm(false); setEditSet(null); fetchSets(); };

  const zoneSets = sets.filter(s => s.zone === activeZone);
  const summary = {
    total: sets.length,
    sterilized: sets.filter(s => s.status === 'Sterilized').length,
    expired: sets.filter(s => s.status === 'Expired' || (s.expiryDate && new Date(s.expiryDate) < new Date())).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-purple-500" /> Sterilization Management
          </h1>
          <p className="text-gray-500 mt-1">Zone-based instrument set tracking with QR sticker generation</p>
        </div>
        <button
          onClick={() => { setEditSet(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all"
        >
          <Plus className="w-4 h-4" /> Register New Set
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Sets', value: summary.total, color: 'text-gray-900', bg: 'bg-white' },
          { label: 'Sterilized', value: summary.sterilized, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Expired', value: summary.expired, color: 'text-red-700', bg: 'bg-red-50' },
        ].map(c => (
          <div key={c.label} className={`${c.bg} rounded-2xl border border-gray-100 p-5 text-center shadow-sm`}>
            <p className={`text-3xl font-black ${c.color}`}>{c.value}</p>
            <p className="text-sm text-gray-500 font-medium mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Zone Tabs */}
      <div className="flex gap-2 border-b border-gray-100">
        {ZONES.map(z => {
          const col = ZONE_COLORS[z];
          const count = sets.filter(s => s.zone === z).length;
          return (
            <button
              key={z}
              onClick={() => setActiveZone(z)}
              className={`px-6 py-3 font-bold text-sm rounded-t-xl transition-all border-b-2 ${
                activeZone === z
                  ? `${col.badge} border-current`
                  : 'text-gray-400 border-transparent hover:text-gray-700'
              }`}
            >
              {z} <span className="ml-1.5 text-xs opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Zone Panel */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">{activeZone} — {zoneSets.length} Set{zoneSets.length !== 1 ? 's' : ''}</h2>
          <button
            onClick={() => { setEditSet(null); setShowForm(true); }}
            className={`flex items-center gap-2 text-white text-sm px-4 py-2 rounded-xl font-bold shadow-lg transition-all ${ZONE_COLORS[activeZone].btn}`}
          >
            <Plus className="w-4 h-4" /> Add to {activeZone}
          </button>
        </div>

        {zoneSets.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No sets in {activeZone} yet.</p>
            <p className="text-sm mt-1">Click "Add to {activeZone}" to register the first set.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {zoneSets.map(s => (
              <SetCard
                key={s._id}
                set={s}
                onEdit={set => { setEditSet(set); setShowForm(true); }}
                onQR={setQrSet}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <SetModal
          initialData={editSet}
          defaultZone={activeZone}
          onClose={() => { setShowForm(false); setEditSet(null); }}
          onSaved={handleSaved}
        />
      )}
      {qrSet && <QRModal set={qrSet} onClose={() => setQrSet(null)} />}
    </div>
  );
}
