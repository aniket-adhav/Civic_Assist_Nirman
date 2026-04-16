import { useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/dummyIssues';
import { useLanguage } from '../context/LanguageContext';

const DETAIL_PIN_ICON = L.divIcon({
  className: '',
  html: `<div style="
    position:relative;width:36px;height:48px;
  ">
    <div style="
      position:absolute;left:50%;top:2px;width:30px;height:30px;
      transform:translateX(-50%) rotate(-45deg);
      transform-origin:center;
      background:linear-gradient(145deg,#fb7185,#dc2626);
      border:3px solid white;
      border-radius:50% 50% 50% 0;
      box-shadow:0 10px 26px rgba(220,38,38,0.45),0 0 0 8px rgba(220,38,38,0.12);
    "></div>
    <div style="
      position:absolute;left:50%;top:12px;width:9px;height:9px;
      transform:translateX(-50%);
      border-radius:999px;background:white;
      box-shadow:0 1px 4px rgba(0,0,0,0.22);
    "></div>
  </div>`,
  iconSize: [36, 48],
  iconAnchor: [18, 38],
});

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  open: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  inprogress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
};

const statusLabels = {
  pending: 'Pending',
  open: 'Pending',
  inprogress: 'In Progress',
  resolved: 'Resolved',
};

export default function IssueDetail() {
  const { selectedIssue, issues, navigateTo, toggleLike, addComment, showNotification } = useApp();
  const { t, tf, categoryLabel, statusLabel, formatTimeAgo } = useLanguage();
  const issue = useMemo(
    () => issues.find(item => item.id === selectedIssue?.id) || selectedIssue,
    [issues, selectedIssue]
  );
  const [comment, setComment] = useState('');
  const [imageOpen, setImageOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [heroImageFailed, setHeroImageFailed] = useState(false);

  if (!issue) {
    return (
      <div className="animate-fadeIn rounded-3xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <i className="fas fa-file-circle-question text-2xl" />
        </div>
        <h2 className="text-xl font-black text-foreground">{t('issueDetail.notSelected')}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t('issueDetail.selectFromFeed')}</p>
        <button onClick={() => navigateTo('feed')} className="mt-5 rounded-xl px-5 py-3 text-sm font-bold text-primary-foreground" style={{ background: 'var(--gradient-primary)' }}>
          {t('issueDetail.backToFeed')}
        </button>
      </div>
    );
  }

  const category = CATEGORIES.find(c => c.id === issue.category);
  const normalizedStatus = issue.status === 'open' ? 'pending' : issue.status;
  const statusClass = statusStyles[normalizedStatus] || statusStyles.pending;
  const statusText = statusLabel(normalizedStatus) || statusLabels[normalizedStatus] || statusLabel('pending');
  const timeAgo = formatTimeAgo(issue.createdAt);
  const comments = issue.comments || [];
  const coordinates = getCoordinates(issue);
  const mapCenter = coordinates ? [coordinates.lat, coordinates.lng] : null;

  const handleShare = async () => {
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
    showNotification(t('issueDetail.issueCopied'), 'success');
  };

  const handleComment = () => {
    const text = comment.trim();
    if (!text) return;
    addComment(issue.id, text);
    setComment('');
    showNotification(t('issueDetail.commentPosted'), 'success');
  };

  const handleReply = (item) => {
    const text = replyText.trim();
    if (!text) return;
    addComment(issue.id, `@${item.user}: ${text}`);
    setReplyingTo(null);
    setReplyText('');
    showNotification(t('issueDetail.replyPosted'), 'success');
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <section className="animate-scaleIn overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
        <div className="relative h-[220px] sm:h-[300px] overflow-hidden md:h-[430px]">
          {issue.image && !heroImageFailed ? (
            <img src={issue.image} alt={issue.title} className="h-full w-full object-cover" onError={() => setHeroImageFailed(true)} />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl text-primary-foreground" style={{ background: 'var(--gradient-accent)' }}>
              <i className={`fas ${category?.icon || 'fa-circle-exclamation'}`} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/5" />
          <button onClick={() => navigateTo('feed')} className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/65" aria-label="Back to feed">
            <i className="fas fa-arrow-left" />
          </button>
          <div className="absolute bottom-5 left-5 right-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] ${statusClass}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {statusText}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white backdrop-blur">
                <i className={`fas ${category?.icon || 'fa-circle-exclamation'}`} />
                {category ? categoryLabel(category.id) : t('issueCard.issue')}
              </span>
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="max-w-4xl text-xl sm:text-3xl font-black leading-tight text-white drop-shadow-lg md:text-5xl">
                  {issue.title}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-white/80">
                  <span className="inline-flex items-center gap-2">
                    <i className="fas fa-location-dot text-blue-300" />
                    {issue.location}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <i className="fas fa-clock text-blue-300" />
                    {t('issueDetail.reported')} {timeAgo}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={handleShare} className="rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-950 shadow-lg transition hover:bg-slate-100">
                  <i className="fas fa-share-nodes mr-2" />
                  {t('common.share')}
                </button>
                <button onClick={() => setImageOpen(true)} className="rounded-xl bg-white/15 px-4 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/25">
                  <i className="fas fa-expand mr-2" />
                  {t('issueDetail.viewImage')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="animate-slideUp rounded-3xl border border-border bg-card p-5 shadow-sm">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">{t('issueDetail.detailedDescription')}</p>
          <p className="text-base leading-8 text-foreground">{issue.description}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <DetailPill icon="fa-user" label={t('issueDetail.reportedBy')} value={issue.reporter.name} />
            <DetailPill icon="fa-heart" label={t('issueDetail.supporters')} value={`${issue.likes} ${t('issueDetail.citizens')}`} />
            <DetailPill icon="fa-comments" label={t('issueDetail.discussion')} value={`${comments.length} ${t('issueDetail.comments').toLowerCase()}`} />
          </div>
          <div className="mt-5 rounded-2xl bg-secondary/70 p-4">
            <p className="text-sm font-bold text-foreground">{t('issueDetail.prioritySignal')}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {t('issueDetail.priorityHelp')}
            </p>
          </div>
        </section>

        <section className="animate-slideUp overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          <div className="relative h-80 bg-secondary">
            {mapCenter ? (
              <MapContainer
                center={mapCenter}
                zoom={17}
                style={{ width: '100%', height: '100%' }}
                zoomControl={true}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  maxZoom={19}
                />
                <Marker position={mapCenter} icon={DETAIL_PIN_ICON} />
              </MapContainer>
            ) : (
              <div className="absolute inset-0 opacity-80" style={{ backgroundImage: 'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
            )}
            <div className="absolute left-8 top-6 rounded-2xl bg-card/90 px-4 py-3 shadow-md backdrop-blur">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t('report.preciseLocation')}</p>
              <p className="mt-1 max-w-[220px] text-sm font-bold text-foreground">{shortLocation(issue.location)}</p>
              {coordinates && (
                <p className="mt-1 font-mono text-[10px] font-semibold text-muted-foreground">
                  {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                </p>
              )}
            </div>
            {!mapCenter && (
              <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-red-500 text-white shadow-xl shadow-red-500/30">
                <i className="fas fa-location-dot text-2xl" />
              </div>
            )}
            <button onClick={() => setMapOpen(true)} className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background shadow-lg hover:opacity-80 transition-opacity" aria-label={t('issueDetail.expandMap')}>
              <i className="fas fa-up-right-and-down-left-from-center" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4">
            <InfoTile icon="fa-route" label={t('issueDetail.area')} value={shortLocation(issue.location)} />
            <InfoTile icon="fa-bolt" label={t('issueDetail.priority')} value={issue.likes >= 150 ? t('issueDetail.high') : issue.likes >= 80 ? t('issueDetail.rising') : t('issueDetail.normal')} />
          </div>
        </section>
      </div>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-secondary to-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-black text-foreground">{t('issueDetail.impactSupport')}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {t('issueDetail.impactHelp')}
              </p>
            </div>
            <button onClick={() => toggleLike(issue.id)} className={`shrink-0 rounded-2xl px-6 py-4 text-sm font-black shadow-lg transition active:scale-95 ${issue.isLiked ? 'bg-red-500 text-white shadow-red-500/20' : 'text-primary-foreground'}`} style={!issue.isLiked ? { background: 'var(--gradient-primary)' } : {}}>
              <i className={`${issue.isLiked ? 'fas' : 'far'} fa-heart mr-2`} />
              {issue.isLiked ? t('feed.supported') : t('issueDetail.supportThis')}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InfoTile icon="fa-people-group" label={t('issueDetail.communityReach')} value={`${Math.max(issue.likes * 4, 120)} ${t('issueDetail.views')}`} />
          <InfoTile icon="fa-arrow-trend-up" label={t('issueDetail.momentum')} value={issue.likes >= 100 ? t('issueDetail.strong') : t('issueDetail.growing')} />
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-black text-foreground">{t('issueDetail.communityDiscussion')}</h2>
          <span className="text-sm font-semibold text-muted-foreground">{comments.length} {t('issueDetail.comments')}</span>
        </div>
        <div className="mb-6 flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <i className="fas fa-user" />
          </div>
          <div className="flex-1">
            <textarea
              value={comment}
              onChange={event => setComment(event.target.value)}
              placeholder={t('issueDetail.addCommentPlaceholder')}
              className="min-h-28 w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
            <div className="mt-2 flex justify-end">
              <button onClick={handleComment} disabled={!comment.trim()} className="rounded-xl bg-foreground px-5 py-2.5 text-sm font-black text-background transition disabled:cursor-not-allowed disabled:opacity-40">
                {t('issueDetail.postComment')}
              </button>
            </div>
          </div>
        </div>
        <div className="space-y-5">
          {comments.length === 0 ? (
            <div className="rounded-2xl bg-secondary/70 p-6 text-center text-sm text-muted-foreground">
              {t('issueDetail.noComments')}
            </div>
          ) : (
            comments.map(item => (
              <div key={item.id} className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black text-primary-foreground" style={{ background: 'var(--gradient-primary)' }}>
                  {item.user[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-foreground">{item.user}</p>
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(item.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.text}</p>
                  <button
                    onClick={() => { setReplyingTo(replyingTo === item.id ? null : item.id); setReplyText(''); }}
                    className="mt-2 text-xs font-bold text-muted-foreground transition hover:text-primary"
                  >
                    <i className="far fa-comment mr-1.5" />
                    {t('issueDetail.reply')}
                  </button>
                  {replyingTo === item.id && (
                    <div className="mt-3 flex gap-2">
                      <input
                        autoFocus
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(item); } }}
                        placeholder={tf('issueDetail.replyTo', { user: item.user })}
                        className="flex-1 px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                      <button
                        onClick={() => handleReply(item)}
                        disabled={!replyText.trim()}
                        className="px-3 py-2 rounded-xl bg-foreground text-background text-xs font-bold disabled:opacity-40 transition"
                      >
                        {t('issueDetail.post')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {imageOpen && issue.image && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setImageOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-black"
            aria-label={t('issueDetail.closeImage')}
            onClick={(e) => { e.stopPropagation(); setImageOpen(false); }}
          >
            <i className="fas fa-xmark" />
          </button>
          <img
            src={issue.image}
            alt={issue.title}
            className="max-h-[88vh] max-w-full rounded-2xl object-contain shadow-2xl"
            onClick={event => event.stopPropagation()}
          />
        </div>
      )}

      {mapOpen && mapCenter && (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-black/90 backdrop-blur-sm" onClick={() => setMapOpen(false)} role="dialog" aria-modal="true">
          <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <div>
              <p className="text-white font-black text-sm">{shortLocation(issue.location)}</p>
              <p className="text-white/60 text-xs font-mono mt-0.5">{mapCenter[0].toFixed(6)}, {mapCenter[1].toFixed(6)}</p>
            </div>
            <button onClick={() => setMapOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
              <i className="fas fa-xmark" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden" onClick={e => e.stopPropagation()}>
            <MapContainer center={mapCenter} zoom={17} style={{ width: '100%', height: '100%' }} scrollWheelZoom zoomControl>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={mapCenter} icon={DETAIL_PIN_ICON} />
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailPill({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <i className={`fas ${icon} mb-3 text-primary`} />
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}

function InfoTile({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <i className={`fas ${icon} mb-3 text-primary`} />
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-black text-foreground">{value}</p>
    </div>
  );
}

function shortLocation(location) {
  return location.split(',').slice(0, 2).join(', ');
}

function getCoordinates(issue) {
  const lat = Number(issue?.coordinates?.lat);
  const lng = Number(issue?.coordinates?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}
