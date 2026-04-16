import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import AdminSidebar from './AdminSidebar';
import MumbaiMap, { HOTSPOTS, getColor, getLabel } from './MumbaiMap';
import { api } from '../lib/api';

const DEPT_MAP = {
  garbage:     { dept: 'Solid Waste Management', head: 'Ms. Asha Kulkarni', phone: '9820011101', icon: 'fa-trash', color: '#059669' },
  streetlight: { dept: 'Street Lighting', head: 'Mr. Rohan Deshmukh', phone: '9820011102', icon: 'fa-bolt', color: '#f59e0b' },
  water:       { dept: 'Water Supply', head: 'Mr. Sandeep Patil', phone: '9820011103', icon: 'fa-droplet', color: '#0891b2' },
  road:        { dept: 'Roads & Potholes', head: 'Mr. Imran Shaikh', phone: '9820011104', icon: 'fa-road', color: '#7c3aed' },
  park:        { dept: 'Parks & Gardens', head: 'Ms. Neha Jadhav', phone: '9820011105', icon: 'fa-tree', color: '#10b981' },
  sewage:      { dept: 'Sewerage', head: 'Mr. Prakash More', phone: '9820011106', icon: 'fa-faucet', color: '#0891b2' },
  electricity: { dept: 'Electricity', head: 'Mr. Kunal Mehta', phone: '9820011107', icon: 'fa-bolt', color: '#f59e0b' },
  noise:       { dept: 'Public Safety (Noise)', head: 'Ms. Sana Khan', phone: '9820011108', icon: 'fa-volume-xmark', color: '#ef4444' },
  other:       { dept: 'General Administration', head: 'Mr. Ajay Rao', phone: '9820011109', icon: 'fa-building', color: '#64748b' },
};
const DEPARTMENT_HEADS = Object.entries(DEPT_MAP).map(([key, value]) => ({ key, ...value }));

const STAT_SCHEMA = [
  { key: 'total',      label: 'Total Complaints', icon: 'fa-folder-open', color: '#2563eb', bg: '#eff6ff', change: '+5%', up: true },
  { key: 'pending',    label: 'Pending',          icon: 'fa-clock',       color: '#d97706', bg: '#fffbeb', change: '-2%', up: false },
  { key: 'inprogress', label: 'In Progress',      icon: 'fa-arrows-rotate', color: '#7c3aed', bg: '#f5f3ff', change: '+3%', up: true },
  { key: 'resolved',   label: 'Resolved',         icon: 'fa-circle-check', color: '#059669', bg: '#ecfdf5', change: '+8%', up: true },
];

const priorityColor = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };

function statusCls(status, dark) {
  const map = {
    Pending:     dark ? 'bg-amber-900/40 text-amber-300 border-amber-700'  : 'bg-amber-50 text-amber-700 border-amber-200',
    'In Progress': dark ? 'bg-blue-900/40 text-blue-300 border-blue-700'   : 'bg-blue-50 text-blue-700 border-blue-200',
    Resolved:    dark ? 'bg-green-900/40 text-green-300 border-green-700' : 'bg-green-50 text-green-700 border-green-200',
  };
  return map[status] || '';
}

function card(dark) {
  return dark
    ? 'bg-[#1e293b] border-slate-700'
    : 'bg-white border-slate-100';
}

function DonutRing({ pct, color, size = 88, stroke = 11, dark }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={dark ? '#334155' : '#f1f5f9'} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fill={dark ? '#f1f5f9' : '#1e293b'} fontSize={size * 0.185} fontWeight="800">{pct}%</text>
    </svg>
  );
}

function ScoreCard({ label, value, icon, dark, large = false }) {
  const pct = Math.round((value ?? 0) * 100);
  const isGood   = pct >= 60;
  const isMid    = pct >= 35 && pct < 60;
  const color    = isGood ? '#059669' : isMid ? '#d97706' : '#dc2626';
  const bgLight  = isGood ? 'bg-emerald-50 border-emerald-200' : isMid ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';
  const bgDark   = isGood ? 'bg-emerald-900/20 border-emerald-700/40' : isMid ? 'bg-amber-900/20 border-amber-700/40' : 'bg-red-900/20 border-red-700/40';
  const verdict  = isGood ? 'Genuine' : isMid ? 'Uncertain' : 'Suspicious';
  const vBg      = isGood
    ? (dark ? 'bg-emerald-800/40 text-emerald-300' : 'bg-emerald-100 text-emerald-700')
    : isMid
      ? (dark ? 'bg-amber-800/40 text-amber-300' : 'bg-amber-100 text-amber-700')
      : (dark ? 'bg-red-800/40 text-red-300' : 'bg-red-100 text-red-700');

  return (
    <div className={`rounded-2xl border p-4 flex flex-col gap-2 transition-all ${dark ? bgDark : bgLight} ${large ? 'col-span-full' : ''}`}>
      <div className="flex items-center justify-between">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center`} style={{ background: `${color}22` }}>
          <i className={`fas ${icon} text-xs`} style={{ color }} />
        </div>
        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${vBg}`}>{verdict}</span>
      </div>
      <div>
        <p className="text-2xl font-black leading-none" style={{ color }}>
          {typeof value === 'number' ? value.toFixed(3) : '--'}
        </p>
        <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
      </div>
      <div className={`w-full h-1.5 rounded-full overflow-hidden ${dark ? 'bg-slate-700/60' : 'bg-white/70'}`}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function ComplaintDetail({ complaint, dark, onClose, onStatusChange, onAssign, onReanalyze }) {
  const dept = DEPT_MAP[complaint.category];
  const isAssigned = !!complaint.assignedTo;
  const isSpam = !!complaint.aiAnalysis?.isSpam;
  const isScanning = complaint.aiAnalysis?.authenticity === 'scanning';
  const hasAI = !isScanning && complaint.aiAnalysis && typeof complaint.aiAnalysis.finalScore === 'number';
  const [imageOpen, setImageOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const statusMeta = {
    Pending:       { pill: 'bg-amber-100 text-amber-700',   dot: '#f59e0b' },
    'In Progress': { pill: 'bg-blue-100 text-blue-700',     dot: '#2563eb' },
    Resolved:      { pill: 'bg-emerald-100 text-emerald-700', dot: '#059669' },
  };

  const askConfirm = (action) => setConfirmAction(action);
  const closeConfirm = () => setConfirmAction(null);
  const runConfirmedAction = () => { confirmAction?.onConfirm?.(); setConfirmAction(null); };

  return (
    <div className="animate-fadeIn space-y-5">
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.animate-fadeIn{animation:fadeIn 0.3s ease}`}</style>

      {/* ── Hero ── */}
      <section className="overflow-hidden rounded-3xl shadow-xl relative" style={{ height: 320 }}>
        {complaint.image
          ? <img src={complaint.image} alt={complaint.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-6xl text-white"
              style={{ background: `linear-gradient(135deg,${dept?.color||'#2563eb'},${dept?.color||'#2563eb'}88)` }}>
              <i className={`fas ${dept?.icon||'fa-circle-exclamation'}`} />
            </div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/10" />

        <button onClick={onClose}
          className="absolute left-4 top-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center hover:bg-black/60 transition z-10">
          <i className="fas fa-arrow-left" />
        </button>

        {isSpam && (
          <div className="absolute right-4 top-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
            <i className="fas fa-shield-virus" /> Spam Flagged
          </div>
        )}

        <div className="absolute bottom-5 left-5 right-5">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusMeta[complaint.status]?.pill || 'bg-slate-100 text-slate-600'}`}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusMeta[complaint.status]?.dot }} />{complaint.status}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur">
              <i className={`fas ${dept?.icon||'fa-circle'}`} />{complaint.category}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: priorityColor[complaint.priority] }} />{complaint.priority} Priority
            </span>
          </div>
          <h1 className="text-2xl font-black text-white leading-tight drop-shadow-lg">{complaint.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-white/75">
            <span className="flex items-center gap-1.5"><i className="fas fa-location-dot text-blue-300" />{complaint.location}</span>
            <span className="flex items-center gap-1.5"><i className="fas fa-clock text-blue-300" />{complaint.submittedAt}</span>
          </div>
          {complaint.image && (
            <button onClick={() => setImageOpen(true)}
              className="mt-3 px-4 py-2 rounded-xl bg-white/15 backdrop-blur text-white text-xs font-black hover:bg-white/25 transition">
              <i className="fas fa-expand mr-1.5" />View Full Image
            </button>
          )}
        </div>
      </section>

      {/* ── Main Grid ── */}
      <div className="grid items-start gap-5 xl:grid-cols-2">

        {/* LEFT — Description + AI Analysis */}
        <div className="space-y-4">

          {/* Description */}
          <div className={`rounded-2xl border p-5 shadow-sm ${card(dark)}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Complaint Description</p>
            <p className={`text-sm leading-7 ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{complaint.description}</p>
          </div>

          {/* AI Analysis */}
          <div className={`rounded-2xl border p-5 shadow-sm space-y-4 ${
            isScanning
              ? (dark ? 'bg-blue-950/20 border-blue-700/30' : 'bg-blue-50/80 border-blue-200')
              : isSpam
                ? (dark ? 'bg-red-950/30 border-red-700/50' : 'bg-red-50 border-red-200')
                : (dark ? 'bg-emerald-950/20 border-emerald-700/30' : 'bg-emerald-50/80 border-emerald-200')
          }`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isScanning ? 'bg-blue-500' : isSpam ? 'bg-red-500' : 'bg-emerald-500'}`}>
                  {isScanning
                    ? <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    : <i className={`fas ${isSpam ? 'fa-shield-virus' : 'fa-shield-check'} text-white text-sm`} />
                  }
                </div>
                <div>
                  <p className={`text-xs font-black ${isScanning ? (dark ? 'text-blue-300' : 'text-blue-700') : isSpam ? (dark ? 'text-red-300' : 'text-red-700') : (dark ? 'text-emerald-300' : 'text-emerald-700')}`}>
                    {isScanning ? 'AI Scan in Progress' : isSpam ? 'Flagged as Fake / Spam' : 'Verified as Genuine'}
                  </p>
                  <p className={`text-[10px] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>AI Authenticity Analysis</p>
                </div>
              </div>
              <button
                onClick={() => askConfirm({
                  title: 'Re-run AI Scan?',
                  message: 'This will re-analyze the complaint text and image and update the authenticity scores.',
                  confirmText: 'Run Scan',
                  icon: 'fa-rotate-right',
                  color: '#2563eb',
                  onConfirm: () => onReanalyze(complaint._id),
                })}
                className={`flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-lg transition-colors ${
                  dark ? 'bg-slate-800 text-blue-300 hover:bg-slate-700' : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-100'
                }`}
              >
                <i className="fas fa-rotate-right" />Re-scan
              </button>
            </div>

            {isScanning ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-10 h-10 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
                <p className={`text-xs font-semibold ${dark ? 'text-blue-300' : 'text-blue-600'}`}>AI is scanning this complaint…</p>
                <p className={`text-[10px] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Scores will appear automatically when done.</p>
              </div>
            ) : hasAI ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <ScoreCard label="Text Score"  value={complaint.aiAnalysis.textScore}  icon="fa-align-left"     dark={dark} />
                  <ScoreCard label="Image Score" value={complaint.aiAnalysis.imageScore} icon="fa-image"          dark={dark} />
                  <ScoreCard label="Final Score (Authenticity)" value={complaint.aiAnalysis.finalScore} icon="fa-shield-halved" dark={dark} large />
                </div>
                <p className={`text-[10px] leading-relaxed pt-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {isSpam
                    ? 'Final score below 0.5 — text or image did not match the reported issue category.'
                    : 'Final score above 0.5 — content aligns with the reported category and appears genuine.'}
                </p>
              </div>
            ) : (
              <p className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>No AI scan data. Click Re-scan to analyze.</p>
            )}
          </div>

          {/* Reporter Info — always visible */}
          <div className={`rounded-2xl border p-5 shadow-sm ${card(dark)}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Reporter Information</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { icon: 'fa-user', label: 'Name', value: complaint.reporter },
                { icon: 'fa-phone', label: 'Phone', value: complaint.phone },
                { icon: 'fa-calendar', label: 'Filed', value: complaint.date },
              ].map((p, i) => (
                <div key={i} className={`rounded-xl p-3 ${dark ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-100'}`}>
                  <i className={`fas ${p.icon} text-blue-500 mb-1.5 block text-xs`} />
                  <p className={`text-[9px] font-black uppercase tracking-widest ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{p.label}</p>
                  <p className={`text-xs font-bold mt-0.5 truncate ${dark ? 'text-slate-200' : 'text-slate-800'}`}>{p.value || '—'}</p>
                </div>
              ))}
            </div>
            <a href={`tel:${complaint.phone}`}
              className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white text-xs font-black shadow-sm active:scale-95 transition-all ${
                isSpam ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-blue-500 to-violet-600'
              }`}>
              <i className="fas fa-phone" />{isSpam ? 'Call Reporter for Inquiry' : 'Call Reporter'}
            </a>
          </div>
        </div>

        {/* RIGHT — Admin Actions */}
        {isSpam ? (
          /* ── SPAM Panel ── */
          <div className="space-y-4">
            <div className={`rounded-2xl border p-5 shadow-sm ${dark ? 'bg-red-950/25 border-red-700/50' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-triangle-exclamation text-white" />
                </div>
                <div>
                  <p className={`text-sm font-black ${dark ? 'text-red-300' : 'text-red-700'}`}>Spam Investigation Mode</p>
                  <p className={`text-[10px] ${dark ? 'text-red-400/70' : 'text-red-500'}`}>Assignment & status actions are locked</p>
                </div>
              </div>

              <div className={`rounded-xl p-4 mb-4 text-xs leading-relaxed ${dark ? 'bg-red-900/30 border border-red-700 text-red-200' : 'bg-white border border-red-200 text-red-700'}`}>
                <p className="font-black mb-1"><i className="fas fa-robot mr-2" />AI Moderation Report</p>
                <p className="font-medium opacity-80">The image uploaded does not match the reported category or the description provided. This complaint has been automatically queued for manual review.</p>
              </div>

              <div className="space-y-2.5">
                <p className={`text-[10px] font-black uppercase tracking-widest ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Investigator Actions</p>
                <button
                  onClick={() => askConfirm({
                    title: 'Re-run AI Scan?',
                    message: 'Re-analyze this complaint. If it passes, it will be cleared from spam.',
                    confirmText: 'Run Scan',
                    icon: 'fa-rotate-right',
                    color: '#2563eb',
                    onConfirm: () => onReanalyze(complaint._id),
                  })}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-all active:scale-95 border ${
                    dark ? 'border-blue-700 bg-blue-900/20 text-blue-300 hover:bg-blue-900/40' : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  <i className="fas fa-rotate-right" />Re-run AI Verification
                </button>
                <button
                  onClick={() => askConfirm({
                    title: 'Override — Mark as Genuine?',
                    message: 'You are manually overriding the AI decision. This will clear the spam flag and allow the complaint to be processed.',
                    confirmText: 'Override & Clear',
                    icon: 'fa-user-shield',
                    color: '#059669',
                    onConfirm: () => onStatusChange(complaint._id, 'pending'),
                  })}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-all active:scale-95 border ${
                    dark ? 'border-emerald-700 bg-emerald-900/20 text-emerald-300 hover:bg-emerald-900/40' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  <i className="fas fa-user-shield" />Admin Override — Mark as Genuine
                </button>
                <button
                  onClick={() => askConfirm({
                    title: 'Dismiss & Close?',
                    message: 'Mark this complaint as resolved / closed without processing. This cannot be undone easily.',
                    confirmText: 'Dismiss Complaint',
                    icon: 'fa-ban',
                    color: '#dc2626',
                    onConfirm: () => onStatusChange(complaint._id, 'Resolved'),
                  })}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-all active:scale-95 border ${
                    dark ? 'border-red-800 bg-red-900/20 text-red-300 hover:bg-red-900/40' : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                >
                  <i className="fas fa-ban" />Dismiss Spam Complaint
                </button>
              </div>
            </div>

            {/* Locked assignment notice */}
            <div className={`rounded-2xl border p-4 flex items-center gap-3 ${dark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${dark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                <i className={`fas fa-lock text-sm ${dark ? 'text-slate-400' : 'text-slate-500'}`} />
              </div>
              <div>
                <p className={`text-xs font-black ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Assignment Locked</p>
                <p className={`text-[10px] ${dark ? 'text-slate-600' : 'text-slate-400'}`}>Clear spam flag to enable department assignment</p>
              </div>
            </div>
          </div>
        ) : (
          /* ── Normal Admin Actions ── */
          <div className="space-y-4">

            {/* Department Assignment */}
            <div className={`rounded-2xl border p-5 shadow-sm ${card(dark)}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Department Assignment</p>
              {isAssigned ? (
                <div>
                  <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ background: `${dept?.color}10`, borderColor: `${dept?.color}30` }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${dept?.color}20` }}>
                      <i className={`fas ${dept?.icon||'fa-building'} text-base`} style={{ color: dept?.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black truncate" style={{ color: dept?.color }}>{complaint.assignedTo}</p>
                      <p className={`text-[10px] mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{dept?.dept || 'Department'} · Notified</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {dept?.phone && (
                        <a href={`tel:${dept.phone}`}
                          className="w-8 h-8 rounded-full flex items-center justify-center transition hover:scale-110"
                          style={{ background: `${dept?.color}20` }}>
                          <i className="fas fa-phone text-xs" style={{ color: dept?.color }} />
                        </a>
                      )}
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${dept?.color}20` }}>
                        <i className="fas fa-circle-check text-sm text-emerald-500" />
                      </div>
                    </div>
                  </div>
                  <p className={`text-[10px] mt-2 text-center ${dark ? 'text-slate-600' : 'text-slate-400'}`}>Complaint assigned and department head notified</p>
                </div>
              ) : (
                <div>
                  <div className={`rounded-xl p-3 mb-3 flex items-center gap-3 ${dark ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-100'}`}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${dept?.color}20` }}>
                      <i className={`fas ${dept?.icon||'fa-building'} text-sm`} style={{ color: dept?.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-black truncate ${dark ? 'text-slate-200' : 'text-slate-800'}`}>{dept?.dept || 'General Administration'}</p>
                      <p className={`text-[10px] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Head: {dept?.head || 'Dept Head'} · {dept?.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => askConfirm({
                      title: 'Assign to Department?',
                      message: `Assign this complaint to ${dept?.head||'the department head'} at ${dept?.dept||'the department'}? They will be notified immediately.`,
                      confirmText: 'Assign Now',
                      icon: 'fa-user-check',
                      color: dept?.color || '#2563eb',
                      onConfirm: () => onAssign(complaint._id, dept?.head),
                    })}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-white font-bold text-sm shadow-md active:scale-95 transition-all"
                    style={{ background: `linear-gradient(135deg,${dept?.color||'#2563eb'},${dept?.color||'#2563eb'}cc)` }}
                  >
                    <i className={`fas ${dept?.icon||'fa-building'}`} />
                    <span className="flex-1 text-left">Assign to {dept?.head||'Dept Head'}</span>
                    <i className="fas fa-arrow-right opacity-70 text-sm" />
                  </button>
                </div>
              )}
            </div>

            {/* Status Update */}
            <div className={`rounded-2xl border p-5 shadow-sm ${card(dark)}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Update Status</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Pending',     icon: 'fa-clock',         color: '#d97706', shadow: 'shadow-amber-200',  grad: 'from-amber-400 to-amber-500' },
                  { label: 'In Progress', icon: 'fa-arrows-rotate', color: '#2563eb', shadow: 'shadow-blue-200',   grad: 'from-blue-500 to-blue-600' },
                  { label: 'Resolved',    icon: 'fa-circle-check',  color: '#059669', shadow: 'shadow-green-200',  grad: 'from-emerald-500 to-emerald-600' },
                ].map(s => {
                  const isActive = complaint.status === s.label;
                  return (
                    <button key={s.label} disabled={isActive}
                      onClick={() => askConfirm({
                        title: 'Update Status?',
                        message: `Change status from "${complaint.status}" to "${s.label}"?`,
                        confirmText: `Set ${s.label}`,
                        icon: s.icon,
                        color: s.color,
                        onConfirm: () => onStatusChange(complaint._id, s.label),
                      })}
                      className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 text-xs font-black transition-all active:scale-95 ${
                        isActive
                          ? `bg-gradient-to-br ${s.grad} text-white border-transparent shadow-lg ${s.shadow}`
                          : dark
                            ? 'border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-800'
                            : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <i className={`fas ${s.icon} text-base`} />
                      <span className="leading-tight text-center">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Activity Timeline (full width, bottom) ── */}
      <div className={`rounded-2xl border p-6 shadow-sm ${card(dark)}`}>
        <div className="flex items-center gap-2.5 mb-6">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${dark ? 'bg-slate-700' : 'bg-slate-100'}`}>
            <i className={`fas fa-timeline text-xs ${dark ? 'text-slate-400' : 'text-slate-500'}`} />
          </div>
          <p className={`text-[10px] font-black uppercase tracking-widest ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Activity Timeline</p>
          <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${dark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
            {complaint.timeline?.length || 0} events
          </span>
        </div>

        {complaint.timeline?.length > 0 ? (
          <div className="relative">
            <div className={`absolute left-[17px] top-0 bottom-0 w-0.5 ${dark ? 'bg-slate-700' : 'bg-slate-100'}`} />
            <div className="space-y-0">
              {complaint.timeline.map((t, i) => (
                <div key={i} className="flex gap-4 items-start relative">
                  <div className="flex-shrink-0 z-10">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm"
                      style={{ background: `${t.color}18`, border: `2px solid ${t.color}50` }}>
                      <i className={`fas ${t.icon} text-xs`} style={{ color: t.color }} />
                    </div>
                  </div>
                  <div className={`flex-1 pb-6 ${i === complaint.timeline.length - 1 ? 'pb-0' : ''}`}>
                    <div className={`rounded-xl p-3 ${
                      i === 0
                        ? (dark ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-100')
                        : ''
                    }`}>
                      <p className={`text-sm font-bold ${dark ? 'text-slate-200' : 'text-slate-800'}`}>{t.event}</p>
                      <p className={`text-[10px] mt-0.5 font-medium ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                        <i className="fas fa-clock mr-1" />{t.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className={`text-xs text-center py-4 ${dark ? 'text-slate-600' : 'text-slate-400'}`}>No activity recorded yet.</p>
        )}
      </div>

      {/* ── Image Lightbox ── */}
      {imageOpen && complaint.image && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setImageOpen(false)} role="dialog" aria-modal="true">
          <button className="absolute right-5 top-5 w-11 h-11 rounded-full bg-white text-black flex items-center justify-center"
            onClick={(e) => { e.stopPropagation(); setImageOpen(false); }}>
            <i className="fas fa-xmark" />
          </button>
          <img src={complaint.image} alt={complaint.title}
            className="max-h-[88vh] max-w-full rounded-2xl object-contain shadow-2xl"
            onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* ── Confirm Dialog ── */}
      {confirmAction && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
          role="dialog" aria-modal="true" onClick={closeConfirm}>
          <div className={`w-full max-w-sm rounded-3xl border p-5 shadow-2xl ${dark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-900'}`}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
                style={{ background: `linear-gradient(135deg,${confirmAction.color},${confirmAction.color}bb)` }}>
                <i className={`fas ${confirmAction.icon} text-base`} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-black leading-tight">{confirmAction.title}</h3>
                <p className={`mt-1 text-sm leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{confirmAction.message}</p>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={closeConfirm}
                className={`flex-1 rounded-2xl px-4 py-3 text-sm font-black transition-all active:scale-95 ${dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                Cancel
              </button>
              <button type="button" onClick={runConfirmedAction}
                className="flex-1 rounded-2xl px-4 py-3 text-sm font-black text-white shadow-lg transition-all active:scale-95"
                style={{ background: `linear-gradient(135deg,${confirmAction.color},${confirmAction.color}bb)` }}>
                {confirmAction.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const NOTIFS = [
  { id: 1, text: 'New complaint in Andheri — Streetlight out', time: '2 min ago', icon: 'fa-bolt', color: '#f59e0b', read: false },
  { id: 2, text: 'Garbage complaint #C-003 marked Resolved', time: '15 min ago', icon: 'fa-circle-check', color: '#059669', read: false },
  { id: 3, text: 'Pothole repair assigned to Roads Dept', time: '1 hr ago', icon: 'fa-road', color: '#7c3aed', read: true },
  { id: 4, text: 'New user registered in Powai zone', time: '2 hrs ago', icon: 'fa-user-plus', color: '#2563eb', read: true },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dark, setDark] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inprogress: 0, resolved: 0, fake: 0, real: 0, unknown: 0 });
  const [analysisData, setAnalysisData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState(NOTIFS);
  const notifsRef = useRef(null);

  const setTab = (tab) => {
    setActiveTab(tab);
    setSelectedComplaint(null);
  };

  // Safety: if anything changes the tab directly, ensure detail view closes.
  useEffect(() => {
    setSelectedComplaint(null);
  }, [activeTab]);

  useEffect(() => {
    const handler = (e) => { if (notifsRef.current && !notifsRef.current.contains(e.target)) setShowNotifs(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    async function load() {
      setLoadingData(true);
      try {
        const [fetchedComplaints, fetchedStats, fetchedAnalysis] = await Promise.all([
          api.getAdminIssues(),
          api.getAdminStats(),
          api.getAdminAnalysis(),
        ]);
        setComplaints(fetchedComplaints);
        setStats(fetchedStats);
        setAnalysisData(fetchedAnalysis);
      } catch (err) {
        console.error('Failed to load admin data:', err.message);
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, []);

  const unreadCount = notifs.filter(n => !n.read).length;
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));

  const handleStatusChange = async (_id, newStatus) => {
    try {
      const updated = await api.updateIssueStatus(_id, newStatus);
      setComplaints(prev => prev.map(c => c._id === _id ? updated : c));
      setSelectedComplaint(prev => prev?._id === _id ? updated : prev);
      const refreshedStats = await api.getAdminStats();
      setStats(refreshedStats);
    } catch (err) {
      console.error('Status update failed:', err.message);
    }
  };

  const handleAssign = async (_id, deptName) => {
    try {
      const updated = await api.assignIssueDept(_id, deptName);
      setComplaints(prev => prev.map(c => c._id === _id ? updated : c));
      setSelectedComplaint(prev => prev?._id === _id ? updated : prev);
    } catch (err) {
      console.error('Assignment failed:', err.message);
    }
  };

  const handleReanalyze = async (_id) => {
    try {
      const updated = await api.reanalyzeIssue(_id);
      setComplaints(prev => prev.map(c => c._id === _id ? updated : c));
      setSelectedComplaint(prev => prev?._id === _id ? updated : prev);

      if (updated?.aiAnalysis?.authenticity === 'scanning') {
        const poll = async () => {
          const MAX_POLLS = 30;
          let attempts = 0;
          while (attempts < MAX_POLLS) {
            await new Promise(r => setTimeout(r, 3000));
            attempts++;
            try {
              const fresh = await api.getAdminIssueById(_id);
              setComplaints(prev => prev.map(c => c._id === _id ? fresh : c));
              setSelectedComplaint(prev => prev?._id === _id ? fresh : prev);
              if (fresh?.aiAnalysis?.authenticity !== 'scanning') {
                const refreshedStats = await api.getAdminStats();
                setStats(refreshedStats);
                break;
              }
            } catch (pollErr) {
              console.warn('Polling error:', pollErr.message);
            }
          }
        };
        poll();
      } else {
        const refreshedStats = await api.getAdminStats();
        setStats(refreshedStats);
      }
    } catch (err) {
      console.error('AI reanalyze failed:', err.message);
    }
  };

  const bg = dark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]';
  const headerBg = dark ? 'bg-[#0f172a] border-slate-700' : 'bg-white border-slate-100';
  const textMain = dark ? 'text-white' : 'text-slate-900';
  const textMuted = dark ? 'text-slate-400' : 'text-slate-400';

  return (
    <div className={`min-h-screen flex ${bg} transition-colors duration-300`}>
      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <AdminSidebar activeTab={activeTab} setActiveTab={setTab} dark={dark} onToggleDark={() => setDark(!dark)} />

      <div className="flex-1 flex flex-col min-h-screen lg:ml-[240px]">
        <header className={`sticky top-0 z-20 border-b px-5 lg:px-8 py-4 flex items-center justify-between shadow-sm transition-colors duration-300 ${headerBg}`}>
          <div>
            <h1 className={`text-lg font-black capitalize ${textMain}`}>
              {activeTab === 'dashboard' ? 'Admin Dashboard' : activeTab === 'complaints' ? 'Complaints' : activeTab === 'analysis' ? 'Analysis & Map' : activeTab === 'settings' ? 'Settings' : 'Admin'}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <i className={`fas fa-location-dot text-[10px] text-blue-500`} />
              <p className={`text-xs font-medium truncate max-w-[160px] sm:max-w-none ${textMuted}`}>
                <span className="sm:hidden">BMC · Mumbai</span>
                <span className="hidden sm:inline">Brihanmumbai Municipal Corporation (BMC) · Mumbai Region</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative" ref={notifsRef}>
              <button
                onClick={() => setShowNotifs(v => !v)}
                className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${dark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                <i className="fas fa-bell text-sm" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px] font-black">{unreadCount}</span>
                )}
              </button>
              {showNotifs && (
                <div className={`absolute right-0 top-11 w-80 rounded-2xl border shadow-xl z-50 overflow-hidden ${dark ? 'bg-[#0f172a] border-slate-700' : 'bg-white border-slate-100'}`}>
                  <div className={`flex items-center justify-between px-4 py-3 border-b ${dark ? 'border-slate-700' : 'border-slate-100'}`}>
                    <span className={`text-sm font-black ${dark ? 'text-white' : 'text-slate-900'}`}>Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-[11px] font-bold text-blue-500 hover:text-blue-600">Mark all read</button>
                    )}
                  </div>
                  <div className="divide-y divide-slate-50 dark:divide-slate-800 max-h-72 overflow-y-auto">
                    {notifs.map(n => (
                      <div
                        key={n.id}
                        onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
                        className={`flex gap-3 items-start px-4 py-3 cursor-pointer transition-colors ${n.read ? '' : dark ? 'bg-blue-500/5' : 'bg-blue-50/50'} ${dark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${n.color}18` }}>
                          <i className={`fas ${n.icon} text-xs`} style={{ color: n.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold leading-snug ${dark ? 'text-slate-200' : 'text-slate-700'}`}>{n.text}</p>
                          <p className={`text-[10px] mt-1 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{n.time}</p>
                        </div>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={`flex items-center gap-2.5 pl-3 border-l ${dark ? 'border-slate-700' : 'border-slate-100'}`}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm">
                <i className="fas fa-user-tie text-white text-sm" />
              </div>
              <div className="hidden sm:block">
                <div className={`text-sm font-bold leading-tight ${textMain}`}>Mumbai Admin</div>
                <div className={`text-[10px] font-medium ${textMuted}`}>Super Admin</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-8 pb-24 lg:pb-8 space-y-6">
          {selectedComplaint ? (
            <ComplaintDetail
              complaint={selectedComplaint}
              dark={dark}
              onClose={() => setSelectedComplaint(null)}
              onStatusChange={handleStatusChange}
              onAssign={handleAssign}
              onReanalyze={handleReanalyze}
            />
          ) : (
            <>
              {activeTab === 'dashboard'   && <DashboardTab dark={dark} setActiveTab={setTab} stats={stats} complaints={complaints} />}
              {activeTab === 'complaints'  && <ComplaintsTab dark={dark} complaints={complaints} onSelect={setSelectedComplaint} />}
              {activeTab === 'analysis'    && (
                <AnalysisTab
                  dark={dark}
                  analysisData={analysisData}
                  complaints={complaints}
                  onSelectComplaint={setSelectedComplaint}
                />
              )}
              {activeTab === 'admin'       && <AdminTab dark={dark} />}
              {activeTab === 'settings'    && <SettingsTab dark={dark} onToggleDark={() => setDark(!dark)} />}
            </>
          )}
        </main>

        <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t shadow-xl transition-colors duration-300 ${dark ? 'bg-[#0f172a] border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="flex items-stretch">
            {[
              { id: 'dashboard',  icon: 'fa-gauge',          label: 'Home' },
              { id: 'complaints', icon: 'fa-clipboard-list', label: 'Cases' },
              { id: 'analysis',   icon: 'fa-chart-line',     label: 'Analysis' },
              { id: 'admin',      icon: 'fa-user-shield',    label: 'Officers' },
              { id: 'settings',   icon: 'fa-gear',           label: 'Settings' },
            ].map(item => {
              const active = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => setTab(item.id)}
                  className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative transition-all active:scale-95 ${active ? 'text-blue-500' : dark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-blue-500" />}
                  <i className={`fas ${item.icon} text-base`} />
                  <span className="text-[9px] font-bold">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

    </div>
  );
}

function DashboardTab({ dark, setActiveTab, stats, complaints }) {
  const BAR_DATA = Object.entries(
    complaints.reduce((acc, c) => { acc[c.category] = (acc[c.category] || 0) + 1; return acc; }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([cat, count]) => ({ label: cat.charAt(0).toUpperCase() + cat.slice(1), value: count, color: DEPT_MAP[cat]?.color || '#2563eb' }));

  const maxBar = Math.max(...BAR_DATA.map(d => d.value), 1);

  const LIVE_STATS = STAT_SCHEMA.map(s => ({
    ...s,
    value: String(stats[s.key] ?? 0),
  }));

  const total = stats.total || 1;
  const pendingPct  = Math.round((stats.pending    / total) * 100);
  const inProgressPct = Math.round((stats.inprogress / total) * 100);
  const resolvedPct = Math.round((stats.resolved   / total) * 100);
  const fakeTotal = (stats.fake || 0) + (stats.real || 0) + (stats.unknown || 0);
  const fakePct = Math.round(((stats.fake || 0) / (fakeTotal || 1)) * 100);
  const realPct = Math.round(((stats.real || 0) / (fakeTotal || 1)) * 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {LIVE_STATS.map((s, i) => (
          <div key={i} className={`rounded-2xl border p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all ${card(dark)}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: dark ? `${s.color}20` : s.bg }}>
                <i className={`fas ${s.icon} text-base`} style={{ color: s.color }} />
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${s.up ? (dark ? 'bg-green-900/40 text-green-400' : 'bg-green-50 text-green-600') : (dark ? 'bg-red-900/40 text-red-400' : 'bg-red-50 text-red-500')}`}>
                <i className={`fas ${s.up ? 'fa-arrow-up' : 'fa-arrow-down'} text-[9px]`} /> {s.change}
              </span>
            </div>
            <div className={`text-3xl font-black ${dark ? 'text-white' : 'text-slate-900'}`}>{s.value}</div>
            <div className={`text-xs font-semibold mt-1 ${dark ? 'text-slate-400' : 'text-slate-400'}`}>{s.label}</div>
            <div className={`text-[10px] mt-0.5 ${dark ? 'text-slate-600' : 'text-slate-300'}`}>from last month</div>
          </div>
        ))}
      </div>

      <div className={`rounded-2xl border p-6 shadow-sm ${card(dark)}`}>
        <div className="mb-4">
          <h3 className={`text-sm font-black ${dark ? 'text-white' : 'text-slate-900'}`}>AI Classification Overview</h3>
          <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-400'}`}>Real vs Fake complaint quality split</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className={`rounded-2xl border p-5 ${dark ? 'bg-emerald-900/10 border-emerald-700/40' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-[11px] font-black uppercase tracking-wider ${dark ? 'text-emerald-300' : 'text-emerald-700'}`}>Real Complaints</p>
                <p className={`text-3xl font-black mt-1 ${dark ? 'text-emerald-200' : 'text-emerald-700'}`}>{stats.real || 0}</p>
                <p className={`text-xs mt-1 ${dark ? 'text-emerald-300/80' : 'text-emerald-700/80'}`}>{realPct}% of analyzed</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <i className="fas fa-shield-check text-emerald-500 text-xl" />
              </div>
            </div>
            <div className={`mt-4 h-2 rounded-full overflow-hidden ${dark ? 'bg-emerald-950/40' : 'bg-white'}`}>
              <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${realPct}%` }} />
            </div>
          </div>
          <div className={`rounded-2xl border p-5 ${dark ? 'bg-red-900/10 border-red-700/40' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-[11px] font-black uppercase tracking-wider ${dark ? 'text-red-300' : 'text-red-700'}`}>Fake / Spam</p>
                <p className={`text-3xl font-black mt-1 ${dark ? 'text-red-200' : 'text-red-700'}`}>{stats.fake || 0}</p>
                <p className={`text-xs mt-1 ${dark ? 'text-red-300/80' : 'text-red-700/80'}`}>{fakePct}% of analyzed</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <i className="fas fa-triangle-exclamation text-red-500 text-xl" />
              </div>
            </div>
            <div className={`mt-4 h-2 rounded-full overflow-hidden ${dark ? 'bg-red-950/40' : 'bg-white'}`}>
              <div className="h-full rounded-full bg-red-500 transition-all duration-700" style={{ width: `${fakePct}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className={`lg:col-span-2 rounded-2xl border p-6 shadow-sm ${card(dark)}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-sm font-black ${dark ? 'text-white' : 'text-slate-900'}`}>Complaint Trends</h3>
              <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-400'}`}>Last 30 days by category</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-500 font-bold bg-blue-500/10 px-3 py-1.5 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />Live
            </div>
          </div>
          <div className="flex items-end gap-3 h-36">
            {BAR_DATA.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className={`text-[10px] font-black ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{d.value}</span>
                <div className="w-full rounded-t-xl overflow-hidden" style={{ height: `${(d.value / maxBar) * 100}px` }}>
                  <div className="w-full h-full rounded-t-xl" style={{ background: d.color, opacity: 0.85 }} />
                </div>
                <span className={`text-[9px] font-semibold text-center leading-tight ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl border p-6 shadow-sm ${card(dark)}`}>
            <div className="mb-5">
              <h3 className={`text-sm font-black ${dark ? 'text-white' : 'text-slate-900'}`}>Resolution Status</h3>
              <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-400'}`}>Current period overview</p>
            </div>
            <div className="space-y-5">
              {[
                { label: 'Pending', pct: pendingPct, color: '#ef4444' },
                { label: 'In Progress', pct: inProgressPct, color: '#2563eb' },
                { label: 'Resolved', pct: resolvedPct, color: '#059669' },
              ].map(d => (
                <div key={d.label} className="flex items-center gap-4">
                  <DonutRing pct={d.pct} color={d.color} size={64} stroke={8} dark={dark} />
                  <div>
                    <div className={`text-sm font-black ${dark ? 'text-slate-200' : 'text-slate-700'}`}>{d.label}</div>
                    <div className={`text-xs mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{d.pct}% of total</div>
                  </div>
                </div>
              ))}
            </div>
            <div className={`mt-4 pt-4 border-t text-center ${dark ? 'border-slate-700' : 'border-slate-50'}`}>
              <span className={`text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Total tracked: </span>
              <span className={`text-xs font-black ${dark ? 'text-slate-200' : 'text-slate-700'}`}>{stats.total} complaints</span>
            </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className={`rounded-2xl border p-6 shadow-sm ${card(dark)}`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className={`text-sm font-black ${dark ? 'text-white' : 'text-slate-900'}`}>Top Categories</h3>
              <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-400'}`}>Ranked by complaint volume</p>
            </div>
            <button onClick={() => setActiveTab('complaints')} className="text-xs text-blue-500 font-bold hover:text-blue-400 transition-colors">View all</button>
          </div>
          <div className="space-y-4">
            {BAR_DATA.map((c, i) => {
              const pct = Math.round((c.value / (stats.total || 1)) * 100);
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-black w-4 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{i + 1}</span>
                      <span className={`text-sm font-bold ${dark ? 'text-slate-200' : 'text-slate-800'}`}>{c.label}</span>
                      <span className={`text-[10px] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{c.value} issues</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 h-2 rounded-full overflow-hidden ${dark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: c.color }} />
                    </div>
                    <span className={`text-[11px] font-black w-7 text-right ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`rounded-2xl border p-6 shadow-sm ${card(dark)}`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className={`text-sm font-black ${dark ? 'text-white' : 'text-slate-900'}`}>Recent Activity</h3>
              <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-400'}`}>Latest complaint updates</p>
            </div>
            <button onClick={() => setActiveTab('complaints')} className="text-xs text-blue-500 font-bold hover:text-blue-400 transition-colors">See all</button>
          </div>
          <div className="space-y-3">
            {complaints.slice(0, 4).map((c, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer ${dark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-50 hover:bg-blue-50'}`}>
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: priorityColor[c.priority] }} />
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-bold truncate ${dark ? 'text-slate-200' : 'text-slate-800'}`}>{c.title}</div>
                  <div className={`text-[10px] mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{c.reporter} · {c.date}</div>
                </div>
                <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCls(c.status, dark)}`}>{c.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplaintsTab({ dark, complaints, onSelect }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = complaints.filter(c => {
    const matchQ = c.title.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase());
    const matchF = filter === 'All' || c.status === filter;
    return matchQ && matchF;
  });

  return (
    <div className="space-y-5">
      <div className={`rounded-2xl border p-5 shadow-sm ${card(dark)}`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className={`flex-1 flex items-center gap-3 border rounded-xl px-4 py-2.5 focus-within:border-blue-400 focus-within:ring-4 transition-all ${dark ? 'border-slate-700 bg-slate-800 focus-within:ring-blue-900/40' : 'border-slate-200 bg-slate-50 focus-within:bg-white focus-within:ring-blue-50'}`}>
            <i className={`fas fa-magnifying-glass text-sm ${dark ? 'text-slate-500' : 'text-slate-300'}`} />
            <input
              type="text" placeholder="Search by title or category..."
              value={search} onChange={e => setSearch(e.target.value)}
              className={`flex-1 bg-transparent text-sm outline-none ${dark ? 'text-slate-200 placeholder:text-slate-600' : 'text-slate-800 placeholder:text-slate-300'}`}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['All', 'Pending', 'In Progress', 'Resolved'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  filter === s
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200'
                    : dark
                      ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-blue-500 hover:text-blue-400'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600'
                }`}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((c, i) => {
          const dept = DEPT_MAP[c.category];
          return (
            <div
              key={i}
              onClick={() => onSelect(c)}
              className={`relative group rounded-2xl border cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${card(dark)}`}
              style={{ borderLeft: `4px solid ${priorityColor[c.priority]}` }}
            >
              {c.image && (
                <div className="absolute right-0 top-0 bottom-0 w-24 overflow-hidden opacity-20 group-hover:opacity-30 transition-opacity">
                  <img src={c.image} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white dark:to-slate-900" />
                </div>
              )}
              <div className="relative px-5 py-4 flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-center gap-1 flex-shrink-0 w-14">
                  <span className="text-[10px] font-black text-blue-500 font-mono">{c.id}</span>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${dept?.color || '#2563eb'}18` }}>
                    <i className={`fas ${dept?.icon || 'fa-circle'} text-sm`} style={{ color: dept?.color || '#2563eb' }} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="sm:hidden text-[10px] font-black text-blue-500 font-mono">{c.id}</span>
                    <h3 className={`text-sm font-bold leading-snug group-hover:text-blue-500 transition-colors ${dark ? 'text-slate-100' : 'text-slate-900'}`}>{c.title}</h3>
                  </div>
                  <div className={`flex items-center gap-3 mt-1.5 flex-wrap text-[11px] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <span className="flex items-center gap-1.5">
                      <i className="fas fa-user text-[9px]" />{c.reporter}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <i className="fas fa-location-dot text-[9px]" />
                      {c.location.split(',').slice(0, 2).join(',')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <i className="fas fa-clock text-[9px]" />{c.date}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${statusCls(c.status, dark)}`}>{c.status}</span>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                    c.aiAnalysis?.isSpam
                      ? (dark ? 'bg-red-900/30 text-red-300 border border-red-700' : 'bg-red-100 text-red-700 border border-red-200')
                      : (dark ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-700' : 'bg-emerald-100 text-emerald-700 border border-emerald-200')
                  }`}>
                    {c.aiAnalysis?.isSpam ? 'Fake' : 'Real'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`hidden sm:flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg ${dark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                      <i className={`fas ${dept?.icon || 'fa-circle'} text-[9px]`} style={{ color: dept?.color }} />{c.category}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: priorityColor[c.priority] }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: priorityColor[c.priority] }} />{c.priority}
                    </span>
                  </div>
                </div>

                <div className={`hidden sm:flex w-8 h-8 rounded-xl items-center justify-center flex-shrink-0 transition-all opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 ${dark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-500'}`}>
                  <i className="fas fa-chevron-right text-xs" />
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className={`py-16 text-center rounded-2xl border ${card(dark)}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
              <i className={`fas fa-magnifying-glass text-xl ${dark ? 'text-slate-600' : 'text-slate-300'}`} />
            </div>
            <p className={`text-sm font-bold ${dark ? 'text-slate-500' : 'text-slate-400'}`}>No complaints found</p>
            <p className={`text-xs mt-1 ${dark ? 'text-slate-600' : 'text-slate-300'}`}>Try a different search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AnalysisTab({ dark, analysisData, complaints, onSelectComplaint }) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const resolved = [30, 45, 60, 40, 70, 55];
  const pending = [20, 35, 25, 50, 30, 45];
  const maxV = Math.max(...resolved, ...pending);

  const rawAvgDays = analysisData?.avgResolutionDays;
  const avgDays = !rawAvgDays || rawAvgDays === 'N/A' ? 'N/A' : rawAvgDays;
  const satisfaction = analysisData ? `${analysisData.resolutionRatePct}%` : '—';
  const peakCat = analysisData?.peakCategory
    ? analysisData.peakCategory.charAt(0).toUpperCase() + analysisData.peakCategory.slice(1)
    : '—';
  const responseRate = analysisData && analysisData.total > 0
    ? `${Math.round(((analysisData.inprogress + analysisData.resolved) / analysisData.total) * 100)}%`
    : '—';

  const catColors = { garbage: '#059669', streetlight: '#2563eb', road: '#d97706', water: '#0891b2', sewage: '#0891b2', noise: '#7c3aed', park: '#10b981', electricity: '#f59e0b', other: '#64748b' };
  const catBreakdown = analysisData?.categoryBreakdown ?? [];
  const catTotal = catBreakdown.reduce((s, c) => s + c.count, 0) || 1;

  const hotspots = analysisData?.hotspots?.length ? analysisData.hotspots : HOTSPOTS;
  const sortedHotspots = [...hotspots].sort((a, b) => b.issues - a.issues);
  const actionQueue = analysisData?.actionQueue ?? [];

  const INSIGHTS = [
    { icon: 'fa-triangle-exclamation', color: '#ef4444', bg: '#fef2f2', title: 'Critical Hotspot', desc: 'Andheri & Goregaon show the highest open issues today. Prioritize streetlights and potholes on major corridors.' },
    { icon: 'fa-stopwatch', color: '#2563eb', bg: '#eff6ff', title: 'Avg Resolution Time', desc: 'Track delays by zone: pending >48h should be escalated automatically to department heads.' },
    { icon: 'fa-trash', color: '#059669', bg: '#ecfdf5', title: 'Top Category — Garbage', desc: 'Garbage and sanitation reports spike near markets and transit hubs. Schedule additional pickups and audits.' },
    { icon: 'fa-road', color: '#7c3aed', bg: '#f5f3ff', title: 'Pothole Season Alert', desc: 'Monsoon increases road complaints. Create a weekly “fast repair” queue for the worst segments.' },
    { icon: 'fa-star', color: '#d97706', bg: '#fffbeb', title: 'Citizen Satisfaction', desc: 'Fast turnaround (under 48h) dramatically improves trust. Encourage photo-based proof-of-fix updates.' },
    { icon: 'fa-chart-line', color: '#0891b2', bg: '#ecfeff', title: 'Trend: Declining Pending', desc: 'Auto-assignment + overdue alerts can reduce pending volume significantly across wards.' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg Resolution', value: avgDays === 'N/A' ? 'N/A' : `${avgDays} days`, icon: 'fa-stopwatch', color: '#2563eb', bg: '#eff6ff' },
          { label: 'Resolution Rate', value: satisfaction, icon: 'fa-star', color: '#d97706', bg: '#fffbeb' },
          { label: 'Peak Category', value: peakCat, icon: 'fa-trash', color: '#7c3aed', bg: '#f5f3ff' },
          { label: 'Response Rate', value: responseRate, icon: 'fa-reply', color: '#059669', bg: '#ecfdf5' },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all ${card(dark)}`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: dark ? `${s.color}20` : s.bg }}>
              <i className={`fas ${s.icon} text-base`} style={{ color: s.color }} />
            </div>
            <div className={`text-2xl font-black ${dark ? 'text-white' : 'text-slate-900'}`}>{s.value}</div>
            <div className={`text-xs font-semibold mt-1 ${dark ? 'text-slate-400' : 'text-slate-400'}`}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={`rounded-2xl border shadow-sm overflow-hidden ${card(dark)}`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${dark ? 'border-slate-700' : 'border-slate-100'}`}>
          <div>
            <h3 className={`text-sm font-black ${dark ? 'text-white' : 'text-slate-900'}`}>Mumbai Complaint Heatmap</h3>
            <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-400'}`}>Live issue density by area — click circles to see details</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <i className="fas fa-location-dot text-[10px]" />Mumbai, MH
          </div>
        </div>
        <div className="p-4">
          <MumbaiMap hotspots={hotspots} />
        </div>
      </div>

      <div className={`rounded-2xl border shadow-sm overflow-hidden ${card(dark)}`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${dark ? 'border-slate-700' : 'border-slate-100'}`}>
          <div>
            <h3 className={`text-sm font-black ${dark ? 'text-white' : 'text-slate-900'}`}>Top 10 Actions Today</h3>
            <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-400'}`}>Auto-prioritized: unassigned, overdue, high-support, fast wins</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-xl ${dark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
            {actionQueue.length}/10
          </span>
        </div>
        <div className={`${dark ? 'divide-slate-800' : 'divide-slate-100'} divide-y`}>
          {actionQueue.length === 0 ? (
            <div className={`px-6 py-10 text-center ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
              No action items yet. Add more issues with coordinates to see the live queue.
            </div>
          ) : (
            actionQueue.map((a, idx) => (
              <button
                key={a._id}
                onClick={() => {
                  const found = complaints?.find?.((c) => c._id === a._id);
                  if (found) onSelectComplaint?.(found);
                }}
                className={`w-full text-left px-6 py-4 transition-colors ${dark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
                type="button"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${dark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                    <span className="text-xs font-black">#{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-bold leading-snug ${dark ? 'text-slate-200' : 'text-slate-900'}`}>{a.title}</div>
                    <div className={`text-[11px] mt-1 flex flex-wrap items-center gap-3 ${dark ? 'text-slate-500' : 'text-slate-500'}`}>
                      <span className="flex items-center gap-1.5">
                        <i className="fas fa-location-dot text-[10px]" />
                        {a.location?.split(',').slice(0, 2).join(',') || '—'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <i className="fas fa-heart text-[10px]" />
                        {a.likes}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <i className="fas fa-clock text-[10px]" />
                        {a.ageDays}d
                      </span>
                    </div>
                    <div className={`text-[10px] mt-2 font-bold ${dark ? 'text-blue-400' : 'text-blue-600'}`}>{a.reason}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {(() => {
                      const label = a.status === 'pending' ? 'Pending' : a.status === 'inprogress' ? 'In Progress' : 'Resolved';
                      return (
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusCls(label, dark)}`}>
                          {label}
                        </span>
                      );
                    })()}
                    <span className={`text-[10px] font-black ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Score {a.score}</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className={`rounded-2xl border shadow-sm ${card(dark)}`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${dark ? 'border-slate-700' : 'border-slate-100'}`}>
          <h3 className={`text-sm font-black ${dark ? 'text-white' : 'text-slate-900'}`}>Area-wise Issue Ranking</h3>
          <span className={`text-xs font-bold px-3 py-1 rounded-xl ${dark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{hotspots.length} zones</span>
        </div>
        <div className="divide-y divide-slate-50">
          {sortedHotspots.map((spot, i) => {
            const color = getColor(spot.issues);
            const label = getLabel(spot.issues);
            const resolvePct = Math.round((spot.resolved / spot.issues) * 100);
            return (
              <div key={spot.name} className={`flex items-center gap-4 px-6 py-3.5 transition-colors ${dark ? 'divide-slate-800 hover:bg-slate-800' : 'hover:bg-slate-50'}`}>
                <span className={`text-xs font-black w-6 text-center ${i === 0 ? 'text-red-500' : dark ? 'text-slate-500' : 'text-slate-300'}`}>#{i + 1}</span>
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-bold ${dark ? 'text-slate-200' : 'text-slate-800'}`}>{spot.name}</span>
                  <span className={`ml-2 text-[10px] font-semibold ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Top: {spot.top}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`hidden sm:flex flex-col items-end`}>
                    <div className={`w-24 h-1.5 rounded-full overflow-hidden ${dark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <div className="h-full rounded-full" style={{ width: `${resolvePct}%`, background: '#059669' }} />
                    </div>
                    <span className={`text-[9px] mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{spot.resolved}/{spot.issues} resolved</span>
                  </div>
                  <span className="text-sm font-black" style={{ color }}>{spot.issues}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: `${color}18`, color }}>{label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className={`rounded-2xl border p-6 shadow-sm ${card(dark)}`}>
          <div className="flex items-center justify-between mb-5">
            <h3 className={`text-sm font-black ${dark ? 'text-white' : 'text-slate-900'}`}>Monthly Overview</h3>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-blue-500"><span className="w-2 h-2 rounded bg-blue-500" />Resolved</span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-500"><span className="w-2 h-2 rounded bg-amber-400" />Pending</span>
            </div>
          </div>
          <div className="flex items-end gap-4 h-40">
            {months.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex gap-0.5 items-end" style={{ height: '128px' }}>
                  <div className="flex-1 rounded-t-md bg-blue-500" style={{ height: `${(resolved[i] / maxV) * 100}%` }} />
                  <div className="flex-1 rounded-t-md bg-amber-400" style={{ height: `${(pending[i] / maxV) * 100}%` }} />
                </div>
                <span className={`text-[10px] font-bold ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{m}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl border p-6 shadow-sm ${card(dark)}`}>
          <h3 className={`text-sm font-black mb-5 ${dark ? 'text-white' : 'text-slate-900'}`}>Category Breakdown</h3>
          <div className="space-y-4">
            {(catBreakdown.length > 0 ? catBreakdown : []).map((c, i) => {
              const pct = Math.round((c.count / catTotal) * 100);
              const name = c.category.charAt(0).toUpperCase() + c.category.slice(1);
              const color = catColors[c.category] || '#64748b';
              return { name, pct, color };
            }).map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`text-xs font-bold w-20 ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{c.name}</span>
                <div className={`flex-1 h-2 rounded-full overflow-hidden ${dark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                  <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
                </div>
                <span className={`text-xs font-black w-8 text-right ${dark ? 'text-slate-300' : 'text-slate-700'}`}>{c.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className={`text-sm font-black mb-3 ${dark ? 'text-white' : 'text-slate-900'}`}>Key Insights for Mumbai Admin</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INSIGHTS.map((ins, i) => (
            <div key={i} className={`rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all ${card(dark)}`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 flex-shrink-0" style={{ background: dark ? `${ins.color}20` : ins.bg }}>
                <i className={`fas ${ins.icon} text-sm`} style={{ color: ins.color }} />
              </div>
              <p className={`text-sm font-bold mb-1 ${dark ? 'text-slate-100' : 'text-slate-900'}`}>{ins.title}</p>
              <p className={`text-xs leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{ins.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminTab({ dark }) {
  const { navigateTo } = useApp();
  const [copied, setCopied] = useState(null);

  const copyNumber = (phone, key) => {
    navigator.clipboard.writeText(phone).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className="space-y-5">
      <div className={`rounded-2xl border p-6 shadow-sm ${card(dark)}`}>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-200">
            <i className="fas fa-user-shield text-white text-2xl" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className={`text-lg font-black ${dark ? 'text-white' : 'text-slate-900'}`}>Mumbai Admin</h2>
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 uppercase tracking-widest">Super Admin</span>
            </div>
            <div className={`text-sm font-medium mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-400'}`}>mumbai-admin@civicassist.gov.in</div>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className={`text-[10px] font-medium ${dark ? 'text-slate-400' : 'text-slate-400'}`}>Active Session</span>
              </span>
              <span className={`flex items-center gap-1 text-[10px] font-medium ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                <i className="fas fa-location-dot text-blue-400 text-[9px]" />BMC · Mumbai
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label: 'Total Managed', value: '247', icon: 'fa-folder-open', color: '#2563eb' },
            { label: 'This Month', value: '34', icon: 'fa-calendar', color: '#7c3aed' },
            { label: 'Avg Rating', value: '4.8 ★', icon: 'fa-star', color: '#d97706' },
          ].map((s, i) => (
            <div key={i} className={`text-center p-4 rounded-xl border ${dark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
              <i className={`fas ${s.icon} text-sm mb-2`} style={{ color: s.color }} />
              <div className={`text-xl font-black ${dark ? 'text-white' : 'text-slate-900'}`}>{s.value}</div>
              <div className={`text-[10px] font-semibold mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={`rounded-2xl border p-6 shadow-sm ${card(dark)}`}>
        <div className="mb-5">
          <h3 className={`text-sm font-black ${dark ? 'text-white' : 'text-slate-900'}`}>Department Heads Directory</h3>
          <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-400'}`}>{DEPARTMENT_HEADS.length} departments · Escalation contacts for Mumbai region</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {DEPARTMENT_HEADS.map((d) => (
            <div key={d.key} className={`rounded-2xl border overflow-hidden ${dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} shadow-sm`}>
              <div className="flex items-center gap-3 p-4 pb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: `${d.color}18` }}>
                  <i className={`fas ${d.icon} text-base`} style={{ color: d.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-black truncate ${dark ? 'text-white' : 'text-slate-900'}`}>{d.dept}</p>
                  <p className={`text-xs font-semibold truncate ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{d.head}</p>
                </div>
              </div>
              <div className={`mx-4 mb-3 flex items-center gap-2 px-3 py-2 rounded-xl ${dark ? 'bg-slate-700/60' : 'bg-slate-50'}`}>
                <i className="fas fa-phone text-[10px]" style={{ color: d.color }} />
                <span className={`text-xs font-black tracking-wide flex-1 ${dark ? 'text-slate-200' : 'text-slate-700'}`}>+91 {d.phone}</span>
              </div>
              <div className={`flex gap-2 px-4 pb-4`}>
                <a
                  href={`tel:+91${d.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${d.color}, ${d.color}bb)` }}
                >
                  <i className="fas fa-phone-volume text-[10px]" />Call Now
                </a>
                <button
                  onClick={() => copyNumber(d.phone, d.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    copied === d.key
                      ? 'bg-green-500 border-green-500 text-white'
                      : dark
                        ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <i className={`fas ${copied === d.key ? 'fa-check' : 'fa-copy'} text-[10px]`} />
                  {copied === d.key ? 'Copied!' : 'Copy No.'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => navigateTo('login')}
        className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-sm transition-all ${dark ? 'bg-red-900/30 border border-red-800 text-red-400 hover:bg-red-900/50' : 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100'}`}
      >
        <i className="fas fa-right-from-bracket" />Sign Out of Mumbai Admin Portal
      </button>
    </div>
  );
}

function SettingsTab({ dark, onToggleDark }) {
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(false);
  const [notifyResolved, setNotifyResolved] = useState(true);
  const [autoAssign, setAutoAssign] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState('10');

  const Toggle = ({ value, onChange }) => (
    <button
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition-all duration-200 relative flex-shrink-0 ${value ? 'bg-blue-600' : dark ? 'bg-slate-700' : 'bg-slate-200'}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${value ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );

  const Section = ({ title, children }) => (
    <div className={`rounded-2xl border p-6 shadow-sm space-y-4 ${card(dark)}`}>
      <h3 className={`text-sm font-black ${dark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
      {children}
    </div>
  );

  const Row = ({ label, desc, children }) => (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${dark ? 'text-slate-200' : 'text-slate-800'}`}>{label}</p>
        {desc && <p className={`text-xs mt-0.5 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{desc}</p>}
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-5 max-w-2xl mx-auto w-full">
      <Section title="Appearance">
        <Row label="Dark Mode" desc="Switch the admin panel to a dark theme">
          <Toggle value={dark} onChange={onToggleDark} />
        </Row>
        <div className={`h-px ${dark ? 'bg-slate-700' : 'bg-slate-100'}`} />
        <Row label="Items Per Page" desc="Number of complaints shown per page">
          <select
            value={itemsPerPage}
            onChange={e => setItemsPerPage(e.target.value)}
            className={`text-xs font-bold px-3 py-2 rounded-xl border outline-none transition-colors ${dark ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-blue-400'}`}
          >
            {['5', '10', '20', '50'].map(v => <option key={v}>{v}</option>)}
          </select>
        </Row>
      </Section>

      <Section title="Notifications">
        <Row label="Email Alerts" desc="Get notified via email for new complaints">
          <Toggle value={notifyEmail} onChange={setNotifyEmail} />
        </Row>
        <div className={`h-px ${dark ? 'bg-slate-700' : 'bg-slate-100'}`} />
        <Row label="Push Notifications" desc="Browser push notifications">
          <Toggle value={notifyPush} onChange={setNotifyPush} />
        </Row>
        <div className={`h-px ${dark ? 'bg-slate-700' : 'bg-slate-100'}`} />
        <Row label="Resolved Alerts" desc="Notify when a complaint is marked resolved">
          <Toggle value={notifyResolved} onChange={setNotifyResolved} />
        </Row>
      </Section>

      <Section title="Workflow">
        <Row label="Auto-assign Complaints" desc="Automatically assign complaints to the relevant department">
          <Toggle value={autoAssign} onChange={setAutoAssign} />
        </Row>
      </Section>

      <Section title="Account">
        <div className="space-y-3">
          {[
            { label: 'Full Name', value: 'Admin Officer', type: 'text' },
            { label: 'Email', value: 'admin@civicassist.gov.in', type: 'email' },
          ].map(f => (
            <div key={f.label}>
              <label className={`text-xs font-semibold mb-1 block ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{f.label}</label>
              <input
                type={f.type}
                defaultValue={f.value}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${dark ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-400 focus:bg-white'}`}
              />
            </div>
          ))}
          <div>
            <label className={`text-xs font-semibold mb-1 block ${dark ? 'text-slate-400' : 'text-slate-500'}`}>New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${dark ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-600 focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-300 focus:border-blue-400 focus:bg-white'}`}
            />
          </div>
          <button className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors shadow-sm shadow-blue-200">
            Save Changes
          </button>
        </div>
      </Section>
    </div>
  );
}
