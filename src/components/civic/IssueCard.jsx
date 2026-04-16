import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../data/dummyIssues';
import { useLanguage } from '../../context/LanguageContext';

const statusColors = {
  open:       { dot: '#ef4444', solid: 'bg-red-500',    label: 'Open' },
  pending:    { dot: '#f97316', solid: 'bg-orange-500', label: 'Pending' },
  inprogress: { dot: '#f59e0b', solid: 'bg-amber-500',  label: 'In Progress' },
  resolved:   { dot: '#22c55e', solid: 'bg-green-500',  label: 'Resolved' },
};

function getSeverityChip(likes) {
  if (likes >= 150) return { label: 'Critical', color: '#ef4444' };
  if (likes >= 80)  return { label: 'High',     color: '#f97316' };
  if (likes >= 30)  return { label: 'Medium',   color: '#f59e0b' };
  return                   { label: 'Low',      color: '#22c55e' };
}

export default function IssueCard({ issue, onComment, variant = 'default' }) {
  const { toggleLike, navigateTo, showNotification } = useApp();
  const { t, categoryLabel, statusLabel, formatTimeAgo } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const category = CATEGORIES.find(c => c.id === issue.category);
  const status = statusColors[issue.status] || statusColors.open;
  const severity = getSeverityChip(issue.likes);
  const timeAgo = formatTimeAgo(issue.createdAt);

  const openDetails = () => navigateTo('issueDetail', issue);
  const stop = (event) => event.stopPropagation();

  const handleShare = async (event) => {
    stop(event);
    const text = `${issue.title} — ${issue.location}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: issue.title, text });
        return;
      } catch {
        return;
      }
    }
    await navigator.clipboard?.writeText(text);
    showNotification(t('issueCard.issueCopied'), 'success');
  };

  const copyLocation = async (event) => {
    stop(event);
    await navigator.clipboard?.writeText(issue.location);
    showNotification(t('issueCard.locationCopied'), 'success');
    setMenuOpen(false);
  };

  if (variant === 'feed') {
    return (
      <article
        onClick={openDetails}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openDetails();
          }
        }}
        tabIndex={0}
        role="button"
        className="group flex cursor-pointer overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm outline-none transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus:ring-4 focus:ring-primary/15"
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-black text-primary-foreground"
                style={{ background: 'var(--gradient-primary)' }}>
                {issue.reporter.name[0]}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">{issue.reporter.name}</p>
                <p className="flex items-center gap-1.5 truncate text-[10px] font-medium text-muted-foreground">
                  <i className="fas fa-clock shrink-0 text-[8px]" />
                  <span>{timeAgo}</span>
                  <span className="text-border">·</span>
                  <i className="fas fa-location-dot shrink-0 text-[8px]" />
                  <span className="truncate">{shortLocation(issue.location)}</span>
                </p>
              </div>
            </div>
            <div className="relative" onClick={stop}>
              <button onClick={() => setMenuOpen(value => !value)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" aria-label={t('issueCard.moreOptions')}>
                <i className="fas fa-ellipsis-vertical text-sm" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-2xl border border-border bg-card p-1 text-sm shadow-xl">
                  <button onClick={() => { setMenuOpen(false); openDetails(); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-semibold text-foreground hover:bg-secondary">
                    <i className="fas fa-up-right-from-square w-4 text-muted-foreground" />
                    {t('issueCard.viewDetails')}
                  </button>
                  <button onClick={copyLocation} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-semibold text-foreground hover:bg-secondary">
                    <i className="fas fa-location-dot w-4 text-muted-foreground" />
                    {t('issueCard.copyLocation')}
                  </button>
                  <button onClick={handleShare} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-semibold text-foreground hover:bg-secondary">
                    <i className="fas fa-share-nodes w-4 text-muted-foreground" />
                    {t('issueCard.sharePost')}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="relative h-56 overflow-hidden border-y border-border bg-secondary md:h-60">
            {issue.image && !imageFailed ? (
              <img
                src={issue.image}
                alt={issue.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl text-primary-foreground transition-transform duration-500 group-hover:scale-105"
                style={{ background: 'var(--gradient-accent)' }}>
                <i className={`fas ${category?.icon || 'fa-circle-exclamation'}`} />
              </div>
            )}
            <div className="absolute left-4 top-4">
              <span className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-card/90 px-3 py-2 text-xs font-bold text-foreground shadow-sm backdrop-blur">
                <i className={`fas ${category?.icon || 'fa-circle-exclamation'} text-muted-foreground`} />
                {category ? categoryLabel(category.id) : t('issueCard.issue')}
              </span>
            </div>
            {/* Severity chip — bottom left (hidden when Low) */}
            {severity.label !== 'Low' && (
              <div className="absolute bottom-4 left-4">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white shadow-md backdrop-blur"
                  style={{ background: severity.color }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                  {severity.label}
                </span>
              </div>
            )}
            {/* Status chip — bottom right */}
            <div className="absolute bottom-4 right-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold text-white shadow-md backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.dot }} />
                {statusLabel(issue.status || 'open')}
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col px-4 py-4">
            <h3 className="text-base font-black leading-snug text-foreground line-clamp-2">
              {issue.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {issue.description}
            </p>

            <div className="mt-4 flex items-center gap-1 border-t border-border pt-3 text-muted-foreground">
              <button
                onClick={(event) => { stop(event); toggleLike(issue.id); }}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold transition-all ${
                  issue.isLiked
                    ? 'text-red-500'
                    : 'hover:bg-secondary hover:text-foreground'
                }`}
              >
                <i className={`${issue.isLiked ? 'fas' : 'far'} fa-heart ${issue.isLiked ? 'animate-scaleIn' : ''}`} />
                {issue.likes}
              </button>
              <button
                onClick={(event) => { stop(event); onComment(issue); }}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold transition-all hover:bg-secondary hover:text-foreground"
              >
                <i className="far fa-comment" />
                {issue.comments.length}
              </button>
              <button onClick={handleShare} className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-all hover:bg-secondary hover:text-foreground" aria-label="Share issue">
                <i className="fas fa-share-nodes" />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="glass-card overflow-hidden group hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="relative aspect-square overflow-hidden">
        {issue.image && !imageFailed ? (
          <img
            src={issue.image}
            alt={issue.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-primary-foreground"
            style={{ background: 'var(--gradient-accent)' }}>
            <i className={`fas ${category?.icon || 'fa-circle-exclamation'}`} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <span className={`badge ${status.bg} ${status.text}`}>
            <i className="fas fa-circle text-[6px]" /> {status.label}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`badge ${category?.color || 'cat-other'}`}>
            <i className={`fas ${category?.icon}`} /> {category?.label}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-sm font-bold text-white leading-tight line-clamp-2 drop-shadow-lg">
            {issue.title}
          </h3>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{issue.description}</p>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <i className="fas fa-location-dot text-primary" />
          <span className="truncate">{issue.location}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-primary-foreground"
              style={{ background: 'var(--gradient-primary)' }}>
              {issue.reporter.name[0]}
            </div>
            <span className="font-medium text-foreground">{issue.reporter.name}</span>
          </div>
          <span>{timeAgo}</span>
        </div>

        <div className="flex items-center gap-1 mt-auto pt-3 border-t border-border">
          <button
            onClick={() => toggleLike(issue.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
              issue.isLiked
                ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            <i className={`fas fa-heart ${issue.isLiked ? 'animate-scaleIn' : ''}`} />
            {issue.likes}
          </button>
          <button
            onClick={() => onComment(issue)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-secondary transition-all"
          >
            <i className="fas fa-comment" />
            {issue.comments.length}
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-secondary transition-all">
            <i className="fas fa-share" />
            {issue.shares}
          </button>
        </div>
      </div>
    </div>
  );
}

function shortLocation(location) {
  return location.split(',').slice(0, 2).join(' · ');
}

