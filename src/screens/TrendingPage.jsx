import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/dummyIssues';

function Shimmer({ className = '', rounded = 'rounded-2xl' }) {
  return <div className={`skeleton-shimmer ${rounded} ${className}`} aria-hidden="true" />;
}

function TrendingSkeleton() {
  return (
    <div className="space-y-6">
      {/* header */}
      <div className="space-y-1">
        <Shimmer className="h-7 w-44" />
        <Shimmer className="h-3 w-64" />
      </div>
      {/* stat bar */}
      <div className="flex gap-3">
        {[0,1,2,3].map(i => (
          <div key={i} className="flex-1 rounded-2xl border border-border bg-card p-3 space-y-1">
            <Shimmer className="h-6 w-12" />
            <Shimmer className="h-3 w-full" />
          </div>
        ))}
      </div>
      {/* filter pills */}
      <div className="flex gap-2 overflow-hidden">
        {[0,1,2,3,4,5].map(i => <Shimmer key={i} className="h-9 w-24 shrink-0" rounded="rounded-full" />)}
      </div>
      {/* chart placeholder */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <Shimmer className="h-5 w-40" />
        <Shimmer className="h-48 w-full" rounded="rounded-xl" />
      </div>
      {/* issue grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[0,1,2,3].map(i => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
            <Shimmer className="h-36 w-full rounded-none" />
            <div className="p-4 space-y-2">
              <div className="flex gap-2">
                <Shimmer className="h-5 w-14" rounded="rounded-full" />
                <Shimmer className="h-5 w-20" rounded="rounded-full" />
              </div>
              <Shimmer className="h-4 w-3/4" />
              <Shimmer className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const getSeverity = (likes) => {
  if (likes >= 150) return { label: 'CRITICAL', bg: '#ef4444' };
  if (likes >= 80)  return { label: 'URGENT',   bg: '#10b981' };
  return              { label: null,        bg: 'rgba(100,116,139,0.9)' };
};

const shortLoc = (loc) => loc.split(',').slice(0, 2).join(',');

const AVATAR_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899'];
const AVATAR_INITIALS = ['R', 'P', 'A', 'K', 'S'];

const FILTERS = [
  { id: 'all',         label: 'All Reports',  icon: 'fa-list-ul' },
  { id: 'garbage',     label: 'Garbage',      icon: 'fa-trash' },
  { id: 'streetlight', label: 'Streetlight',  icon: 'fa-lightbulb' },
  { id: 'water',       label: 'Water Issue',  icon: 'fa-droplet' },
  { id: 'road',        label: 'Road Damage',  icon: 'fa-wrench' },
  { id: 'park',        label: 'Public Safety',icon: 'fa-shield-halved' },
];

const BAR_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899', '#10b981'];

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function StatCard({ icon, value, label, sub, color }) {
  return (
    <div
      className="flex-1 min-w-0 rounded-2xl p-4 flex flex-col gap-1"
      style={{
        background: 'linear-gradient(135deg, rgba(30,41,59,0.6) 0%, rgba(15,23,42,0.6) 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${color}22` }}
        >
          <i className={`fas ${icon} text-xs`} style={{ color }} />
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-2xl font-black text-foreground leading-none">{value}</p>
      {sub && <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function IssueCard({ issue, onSupport, onClick }) {
  const severity = getSeverity(issue.likes);
  const cat = CATEGORIES.find(c => c.id === issue.category);
  const extra = issue.likes - 3;

  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 w-[310px] rounded-2xl overflow-hidden select-none cursor-pointer hover:scale-[1.02] transition-transform duration-200"
      style={{
        background: 'linear-gradient(160deg, #1e293b 0%, #0f172a 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <div className="relative h-44">
        {issue.image ? (
          <img src={issue.image} alt={issue.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800">
            <i className={`fas ${cat?.icon || 'fa-circle'} text-slate-500 text-4xl`} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        {severity.label && (
          <div className="absolute top-3 left-3">
            <span
              className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-[0.15em] uppercase text-white"
              style={{ background: severity.bg, boxShadow: `0 2px 8px ${severity.bg}55` }}
            >
              {severity.label}
            </span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-bold text-sm leading-snug line-clamp-2 drop-shadow">{issue.title}</h3>
          <p className="text-white/65 text-xs mt-1 flex items-center gap-1">
            <i className="fas fa-location-dot text-[10px] text-blue-300" />
            {shortLoc(issue.location)}
          </p>
        </div>
      </div>

      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex -space-x-2 flex-shrink-0">
            {AVATAR_INITIALS.slice(0, 3).map((initial, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[9px] font-black text-white"
                style={{ background: AVATAR_COLORS[i], borderColor: '#0f172a' }}
              >
                {initial}
              </div>
            ))}
            {extra > 0 && (
              <div
                className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[8px] font-bold text-slate-300 bg-slate-700"
                style={{ borderColor: '#0f172a' }}
              >
                +{extra}
              </div>
            )}
          </div>
          <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wide truncate">Supporters</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onSupport(issue.id); }}
          className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all duration-200 active:scale-95 hover:opacity-90"
          style={{
            background: issue.isLiked
              ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
              : 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            boxShadow: issue.isLiked
              ? '0 4px 14px rgba(239,68,68,0.4)'
              : '0 4px 14px rgba(37,99,235,0.4)',
          }}
        >
          {issue.isLiked ? <><i className="fas fa-heart mr-1.5" />Supported</> : 'Support Issue'}
        </button>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-xl text-xs text-white font-semibold"
      style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      {payload[0].payload.label}: <span className="text-blue-300">{payload[0].value} issues</span>
    </div>
  );
};

export default function TrendingPage() {
  const { issues, getTrendingIssues, toggleLike, activeFilter, setActiveFilter, navigateTo, loadingIssues } = useApp();
  const [chartFilter, setChartFilter] = useState('category');
  const trending = getTrendingIssues();

  if (loadingIssues && issues.length === 0) return <TrendingSkeleton />;
  const doubled = [...trending, ...trending];

  const totalSupporters = issues.reduce((s, i) => s + i.likes, 0);
  const resolvedCount = issues.filter(i => i.status === 'inprogress' || i.status === 'resolved').length;
  const criticalCount = issues.filter(i => i.likes >= 150).length;

  const categoryData = CATEGORIES.map((cat, idx) => ({
    label: cat.label,
    value: issues.filter(i => i.category === cat.id).length,
    color: BAR_COLORS[idx % BAR_COLORS.length],
  })).filter(d => d.value > 0);

  const areaData = Object.entries(
    issues.reduce((acc, issue) => {
      const city = issue.location.split(',').slice(-1)[0].trim();
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([label, value], idx) => ({ label, value, color: BAR_COLORS[idx % BAR_COLORS.length] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const chartData = chartFilter === 'category' ? categoryData : areaData;

  const topAreas = areaData.slice(0, 4);

  return (
    <div className="space-y-5 animate-fadeIn">

      {/* Header */}
      <div>
        <p className="text-xs font-black tracking-[0.25em] uppercase text-blue-400/70 mb-1">Community Pulse</p>
        <h1 className="text-3xl font-black text-foreground">Trending Issues</h1>
      </div>

      {/* Community stats */}
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        <StatCard icon="fa-flag" value={issues.length} label="Total Reports" sub="Across all areas" color="#3b82f6" />
        <StatCard icon="fa-heart" value={totalSupporters.toLocaleString()} label="Supporters" sub="Community backing" color="#ef4444" />
        <StatCard icon="fa-circle-check" value={resolvedCount} label="In Progress" sub="Being addressed" color="#10b981" />
        <StatCard icon="fa-triangle-exclamation" value={criticalCount} label="Critical" sub="Needs urgent action" color="#f59e0b" />
      </div>

      {/* Auto-scroll strip */}
      <div className="overflow-hidden -mx-3 px-3">
        <div className="trending-scroll flex gap-4" style={{ width: 'max-content' }}>
          {doubled.map((issue, idx) => (
            <IssueCard
              key={`${issue.id}-${idx}`}
              issue={issue}
              onSupport={toggleLike}
              onClick={() => navigateTo('issueDetail', issue)}
            />
          ))}
        </div>
      </div>

      {/* Breakdown chart */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: 'linear-gradient(135deg, rgba(30,41,59,0.5) 0%, rgba(15,23,42,0.5) 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Issue Breakdown</p>
            <p className="text-base font-black text-foreground mt-0.5">Where are problems concentrated?</p>
          </div>
          <div className="flex gap-1 p-1 rounded-xl bg-slate-800/60">
            {[{ id: 'category', label: 'By Type' }, { id: 'area', label: 'By Area' }].map(opt => (
              <button
                key={opt.id}
                onClick={() => setChartFilter(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  chartFilter === opt.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Most affected areas */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Most Affected Areas</p>
        <div className="grid grid-cols-2 gap-3">
          {topAreas.map((area, idx) => {
            const pct = Math.round((area.value / issues.length) * 100);
            return (
              <div
                key={area.label}
                className="rounded-2xl p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(30,41,59,0.5) 0%, rgba(15,23,42,0.5) 100%)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-semibold text-foreground">{area.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{area.value} issue{area.value !== 1 ? 's' : ''}</p>
                  </div>
                  <span
                    className="text-xs font-black px-2 py-0.5 rounded-lg"
                    style={{ background: `${area.color}22`, color: area.color }}
                  >
                    #{idx + 1}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: area.color }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">{pct}% of all reports</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category filters */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Browse by Category</p>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => {
            const active = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={[
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95',
                  active
                    ? 'text-white shadow-lg'
                    : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700',
                ].join(' ')}
                style={active ? {
                  background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                } : {}}
              >
                <i className={`fas ${f.icon} text-xs ${active ? 'text-blue-300' : ''}`} />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Full rankings */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Full Rankings</p>
        <div className="space-y-3">
          {trending.map((issue, idx) => {
            const cat = CATEGORIES.find(c => c.id === issue.category);
            const severity = getSeverity(issue.likes);
            return (
              <div
                key={issue.id}
                onClick={() => navigateTo('issueDetail', issue)}
                className="flex items-center gap-4 p-3 rounded-2xl border transition-all hover:-translate-y-0.5 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(30,41,59,0.5) 0%, rgba(15,23,42,0.5) 100%)',
                  borderColor: 'rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <span
                  className="text-2xl font-black w-10 text-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  #{idx + 1}
                </span>

                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                  {issue.image ? (
                    <img src={issue.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-700">
                      <i className={`fas ${cat?.icon} text-slate-400`} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground truncate">{issue.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span><i className="fas fa-heart mr-1 text-red-400" />{issue.likes}</span>
                    <span><i className="fas fa-comment mr-1 text-blue-400" />{issue.comments.length}</span>
                    <span className="truncate"><i className="fas fa-location-dot mr-1 text-emerald-400" />{issue.location.split(',')[0]}</span>
                    <span className="text-slate-500"><i className="fas fa-clock mr-1" />{timeAgo(issue.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {severity.label && (
                    <span
                      className="hidden sm:block px-2 py-0.5 rounded-lg text-[9px] font-black tracking-widest uppercase text-white"
                      style={{ background: severity.bg }}
                    >
                      {severity.label}
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLike(issue.id); }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
                    style={{
                      background: issue.isLiked
                        ? 'linear-gradient(135deg,#ef4444,#b91c1c)'
                        : 'rgba(255,255,255,0.06)',
                      border: issue.isLiked ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <i className={`fas fa-heart text-sm ${issue.isLiked ? 'text-white' : 'text-slate-500'}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Call to action */}
      <div
        className="rounded-2xl p-6 text-center"
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #1e1b4b 100%)',
          border: '1px solid rgba(99,179,237,0.15)',
        }}
      >
        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
          <i className="fas fa-bullhorn text-blue-400 text-lg" />
        </div>
        <h3 className="text-white font-black text-lg mb-1">See an issue in your area?</h3>
        <p className="text-slate-400 text-sm mb-4">Every report brings your community one step closer to a fix.</p>
        <button
          onClick={() => navigateTo('report')}
          className="px-6 py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95 hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', boxShadow: '0 4px 20px rgba(37,99,235,0.4)' }}
        >
          <i className="fas fa-plus mr-2" />Report an Issue
        </button>
      </div>

    </div>
  );
}
