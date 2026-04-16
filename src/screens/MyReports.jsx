import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

function Shimmer({ className = '', rounded = 'rounded-2xl' }) {
  return <div className={`skeleton-shimmer ${rounded} ${className}`} aria-hidden="true" />;
}

function MyReportsSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Shimmer className="h-6 w-32" />
          <Shimmer className="h-3 w-24" />
        </div>
        <Shimmer className="h-9 w-28" rounded="rounded-xl" />
      </div>
      {/* stat pills */}
      <div className="grid grid-cols-4 gap-2">
        {[0,1,2,3].map(i => (
          <div key={i} className="rounded-xl border border-border bg-card p-3 space-y-1">
            <Shimmer className="h-5 w-8" />
            <Shimmer className="h-3 w-full" />
          </div>
        ))}
      </div>
      {/* filter tabs */}
      <div className="flex gap-2">
        {[0,1,2,3].map(i => <Shimmer key={i} className="h-8 w-20" rounded="rounded-xl" />)}
      </div>
      {/* report rows */}
      <div className="space-y-3">
        {[0,1,2,3,4].map(i => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4 flex gap-4">
            <Shimmer className="w-16 h-16 shrink-0" rounded="rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between gap-2">
                <Shimmer className="h-4 w-3/5" />
                <Shimmer className="h-5 w-16" rounded="rounded-full" />
              </div>
              <Shimmer className="h-3 w-2/5" />
              <div className="flex gap-3 pt-1">
                <Shimmer className="h-3 w-12" />
                <Shimmer className="h-3 w-10" />
                <Shimmer className="h-3 w-14" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const STATUS_STYLES = {
  open: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  inprogress: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  resolved: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
};

export default function MyReports() {
  const { issues, currentUser, navigateTo, showNotification, loadingIssues } = useApp();
  const { t, tf, statusLabel } = useLanguage();
  const [filter, setFilter] = useState('all');
  const [deleteId, setDeleteId] = useState(null);

  if (loadingIssues && issues.length === 0) return <MyReportsSkeleton />;

  const myIssues = issues.filter(i => i.reporter.userId === currentUser?.id);
  const filtered = filter === 'all' ? myIssues : myIssues.filter(i => i.status === filter);

  const openIssue = (issue) => navigateTo('issueDetail', issue);

  const handleShare = async (issue, e) => {
    e.stopPropagation();
    const text = `${issue.title} — ${issue.location}`;
    if (navigator.share) { try { await navigator.share({ title: issue.title, text }); return; } catch {} }
    await navigator.clipboard?.writeText(text);
    showNotification(t('myReports.copied'), 'success');
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('myReports.title')}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{myIssues.length} {t('myReports.submitted')}</p>
        </div>
        <button
          onClick={() => navigateTo('report')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-95"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <i className="fas fa-plus text-xs" />{t('myReports.newReport')}
        </button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[
          { key: 'all', label: statusLabel('all'), count: myIssues.length },
          { key: 'open', label: statusLabel('open'), count: myIssues.filter(i => i.status === 'open').length },
          { key: 'inprogress', label: statusLabel('inprogress'), count: myIssues.filter(i => i.status === 'inprogress').length },
          { key: 'resolved', label: statusLabel('resolved'), count: myIssues.filter(i => i.status === 'resolved').length },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all flex-shrink-0 ${filter === f.key ? 'border-transparent text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:border-primary/30'}`}
            style={filter === f.key ? { background: 'var(--gradient-primary)' } : {}}
          >
            {f.label}
            {f.count > 0 && <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${filter === f.key ? 'bg-white/25' : 'bg-secondary'}`}>{f.count}</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card text-center py-16">
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-2xl text-muted-foreground mx-auto mb-4">
            <i className="fas fa-file-lines" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            {filter === 'all' ? t('myReports.noReports') : tf('myReports.noStatusReports', { status: statusLabel(filter).toLowerCase() })}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {filter === 'all' ? t('myReports.issuesAppearHere') : t('myReports.tryDifferentFilter')}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => navigateTo('report')}
              className="mt-5 rounded-xl px-5 py-3 text-sm font-bold text-primary-foreground"
              style={{ background: 'var(--gradient-primary)' }}
            >
              {t('myReports.reportIssue')}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(issue => (
            <div
              key={issue.id}
              onClick={() => openIssue(issue)}
              className="glass-card p-4 flex gap-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                {issue.image ? (
                  <img src={issue.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary-foreground" style={{ background: 'var(--gradient-accent)' }}>
                    <i className="fas fa-image" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{issue.title}</h3>
                  <span className={`badge text-[10px] font-bold flex-shrink-0 ${STATUS_STYLES[issue.status] || STATUS_STYLES.open}`}>
                    {statusLabel(issue.status || 'open')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  <i className="fas fa-location-dot mr-1" />{issue.location}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span><i className="fas fa-heart mr-1 text-red-400" />{issue.likes}</span>
                  <span><i className="fas fa-comment mr-1 text-blue-400" />{issue.comments.length}</span>
                  <span className="flex-1" />
                  <button
                    onClick={(e) => handleShare(issue, e)}
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1 text-primary hover:text-primary/70 font-bold active:scale-90"
                  >
                    <i className="fas fa-share-nodes text-[10px]" /><span className="hidden sm:inline">{t('myReports.share')}</span>
                  </button>
                  <span className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-primary">
                    <i className="fas fa-chevron-right text-[10px]" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-trash text-destructive text-lg" />
            </div>
            <h3 className="text-base font-black text-foreground text-center">{t('myReports.deleteReport')}</h3>
            <p className="text-sm text-muted-foreground text-center mt-2">{t('myReports.deleteHelp')}</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-xl bg-secondary text-sm font-bold text-foreground hover:bg-border transition-colors">{t('common.cancel')}</button>
              <button
                onClick={() => { setDeleteId(null); showNotification(t('myReports.deleted'), 'success'); }}
                className="flex-1 py-3 rounded-xl bg-destructive text-sm font-bold text-white hover:bg-destructive/80 transition-colors"
              >{t('common.delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
