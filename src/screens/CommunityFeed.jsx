import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/dummyIssues';
import { useLanguage } from '../context/LanguageContext';
import IssueCard from '../components/civic/IssueCard';
import CommentModal from '../components/civic/CommentModal';
import { useState, useEffect, useRef } from 'react';

/* ─── helpers ─── */
const getSeverity = (likes) => {
  if (likes >= 150) return { label: 'CRITICAL', bg: '#ef4444' };
  if (likes >= 80)  return { label: 'URGENT',   bg: '#10b981' };
  return              { label: null,        bg: '#64748b' };
};
const shortLoc = (loc) => loc.split(',').slice(0, 2).join(',');
const AVATAR_COLORS   = ['#3b82f6','#8b5cf6','#06b6d4','#f59e0b','#ec4899'];
const AVATAR_INITIALS = ['R','P','A','K','S'];

const CARD_GAP = 14;    // gap between cards in px

/* ─── single card ─── */
function TrendingCard({ issue, isActive, onSupport, onClick, t, cardW = 300 }) {
  const sev = getSeverity(issue.likes);
  const cat = CATEGORIES.find(c => c.id === issue.category);
  const extra = Math.max(0, issue.likes - 3);
  const [imageFailed, setImageFailed] = useState(false);

  const cardBg = 'hsl(var(--card))';
  const border = 'hsl(var(--border))';
  const fg = 'hsl(var(--foreground))';
  const muted = 'hsl(var(--muted-foreground))';
  const overlayBg = 'hsl(var(--secondary))';

  return (
    <div
      onClick={onClick}
      style={{
        width: cardW,
        flexShrink: 0,
        borderRadius: 18,
        overflow: 'hidden',
        background: cardBg,
        border: isActive ? '1.5px solid rgba(59,130,246,0.28)' : `1px solid ${border}`,
        boxShadow: 'none',
        transform: `scale(${isActive ? 1.05 : 0.93})`,
        opacity: isActive ? 1 : 0.6,
        transition: 'transform 0.42s cubic-bezier(.4,0,.2,1), opacity 0.42s ease, box-shadow 0.42s ease',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* image */}
      <div style={{ position: 'relative', height: 188 }}>
        {issue.image && !imageFailed
          ? <img src={issue.image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} loading="lazy" onError={() => setImageFailed(true)} />
          : <div style={{ width:'100%', height:'100%', background: overlayBg, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <i className={`fas ${cat?.icon||'fa-circle'}`} style={{ color: muted, fontSize:28 }} />
            </div>
        }
        {/* subtle overlay — enough for text readability, not heavy dark */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)' }} />

        {/* badge */}
        {sev.label && (
          <span style={{
            position:'absolute', top:10, left:10,
            background: sev.bg, color:'#fff',
            fontSize:9, fontWeight:900, letterSpacing:'0.14em', textTransform:'uppercase',
            padding:'3px 9px', borderRadius:7,
          }}>{sev.label}</span>
        )}

        {/* title + location */}
        <div style={{ position:'absolute', bottom:10, left:12, right:12 }}>
          <p style={{ color:'#fff', fontWeight:700, fontSize:13, lineHeight:1.3, margin:0, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
            {issue.title}
          </p>
          <p style={{ color:'rgba(255,255,255,0.62)', fontSize:10, marginTop:3, display:'flex', alignItems:'center', gap:4 }}>
            <i className="fas fa-location-dot" style={{ color:'#93c5fd', fontSize:9 }} />
            {shortLoc(issue.location)}
          </p>
        </div>
      </div>

      {/* bottom action row */}
      <div style={{ padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, background: cardBg }}>
        {/* avatars */}
        <div style={{ display:'flex', alignItems:'center', gap:7, minWidth:0 }}>
          <div style={{ display:'flex' }}>
            {AVATAR_INITIALS.slice(0,3).map((init,i) => (
              <div key={i} style={{
                width:22, height:22, borderRadius:'50%',
                border:'2px solid #fff', marginLeft: i===0?0:-7,
                background: AVATAR_COLORS[i],
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:8, fontWeight:900, color:'#fff',
              }}>{init}</div>
            ))}
            {extra > 0 && (
              <div style={{
                width:22, height:22, borderRadius:'50%',
                border:'2px solid #fff', marginLeft:-7,
                background:'#e2e8f0',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:7, fontWeight:700, color:'#64748b',
              }}>+{extra}</div>
            )}
          </div>
          <span style={{ fontSize:9, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.07em' }}>{t('feed.supporters')}</span>
        </div>

        {/* support button */}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            if (!issue?.id) return;
            onSupport?.(issue.id);
          }}
          style={{
            flexShrink:0, padding:'7px 14px', borderRadius:10,
            fontSize:11, fontWeight:700, color:'#fff', border:'none', cursor:'pointer',
            background: issue.isLiked ? 'linear-gradient(135deg,#ef4444,#b91c1c)' : 'var(--gradient-primary)',
            boxShadow: issue.isLiked ? '0 3px 10px rgba(239,68,68,0.28)' : '0 3px 10px rgba(0,0,0,0.18)',
            transition:'transform 0.15s, filter 0.15s',
          }}
          onPointerUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onPointerCancel={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onPointerLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onPointerMove={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onPointerDownCapture={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; }}
        >
          {issue.isLiked ? <><i className="fas fa-heart" style={{ marginRight:5 }}/>{t('feed.supported')}</> : t('feed.supportIssue')}
        </button>
      </div>
    </div>
  );
}

/* ─── carousel ─── */
function TrendingCarousel({ issues, onSupport, onOpen, t }) {
  const N            = issues.length;
  // triple the array so we can loop infinitely in both directions
  const looped       = [...issues, ...issues, ...issues];
  const [rawIdx, setRawIdx]         = useState(N);        // start in middle set
  const [animated, setAnimated]     = useState(true);
  const [containerW, setContainerW] = useState(0);
  const containerRef = useRef(null);
  const pausedRef    = useRef(false);

  const dotIdx = ((rawIdx % N) + N) % N;   // always 0…N-1

  // Responsive card width: max 300px but leave 40px breathing room on either side
  const cardW = containerW > 0 ? Math.min(300, Math.max(240, containerW - 48)) : 300;
  const STEP  = cardW + CARD_GAP;

  /* measure container */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setContainerW(el.clientWidth);
    const ro = new ResizeObserver(() => setContainerW(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* circular wrap — when we hit outer copies, silently jump to middle copy */
  useEffect(() => {
    if (rawIdx >= N * 2) {
      setAnimated(false);
      setRawIdx(rawIdx - N);
    } else if (rawIdx < N) {
      setAnimated(false);
      setRawIdx(rawIdx + N);
    }
  }, [rawIdx, N]);

  /* re-enable animation after instant jump */
  useEffect(() => {
    if (!animated) {
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setAnimated(true))
      );
      return () => cancelAnimationFrame(raf);
    }
  }, [animated]);

  /* auto-advance */
  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) setRawIdx(p => p + 1);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  /* centering via paddingLeft + translateX */
  const pad = containerW > 0 ? Math.max(0, containerW / 2 - cardW / 2) : 0;
  const tx  = -(rawIdx * STEP);

  return (
    <div>
      {/* viewport — overflow:clip so box-shadows don't bleed out */}
      <div
        ref={containerRef}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
        style={{ overflow:'hidden', margin:'16px 0 12px' }}
      >
        {/* add vertical padding inside a non-clipping wrapper so scale has room */}
        <div style={{ padding:'18px 0 20px' }}>
          <div style={{
            display:'flex',
            gap: CARD_GAP,
            paddingLeft: pad,
            paddingRight: pad,
            transform: `translateX(${tx}px)`,
            transition: animated ? 'transform 0.48s cubic-bezier(.4,0,.2,1)' : 'none',
            willChange:'transform',
          }}>
            {looped.map((issue, idx) => (
              <TrendingCard
                key={`${issue.id}-${idx}`}
                issue={issue}
                isActive={idx === rawIdx}
                onSupport={onSupport}
                t={t}
                cardW={cardW}
                onClick={() => idx === rawIdx ? onOpen(issue) : setRawIdx(idx)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* pill dot indicator */}
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:5 }}>
        {issues.map((_, i) => (
          <button
            key={i}
            onClick={() => setRawIdx(N + i)}
            style={{
              height:5, borderRadius:99,
              width: i === dotIdx ? 24 : 5,
              background: i === dotIdx ? '#1e293b' : '#cbd5e1',
              border:'none', padding:0, cursor:'pointer',
              transition:'width 0.35s ease, background 0.35s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-5 h-12 bg-card border border-border rounded-xl" />
      <div className="mb-7">
        <div className="h-3 w-28 bg-secondary rounded mb-1" />
        <div className="h-6 w-44 bg-secondary rounded mb-4" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-[300px] flex-shrink-0 rounded-[18px] overflow-hidden bg-card border border-border">
              <div className="h-[188px] bg-secondary" />
              <div className="p-3 flex justify-between items-center">
                <div className="h-4 w-20 bg-secondary rounded" />
                <div className="h-8 w-24 bg-secondary rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2 mb-5">
        {[1,2,3,4,5].map(i => <div key={i} className="h-9 w-20 rounded-full bg-card border border-border" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="glass-card p-4 space-y-3">
            <div className="h-40 bg-secondary rounded-xl" />
            <div className="h-4 bg-secondary rounded w-3/4" />
            <div className="h-3 bg-secondary rounded w-1/2" />
            <div className="flex gap-3">
              <div className="h-3 bg-secondary rounded w-10" />
              <div className="h-3 bg-secondary rounded w-10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── haversine distance (km) ─── */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

/* ─── page ─── */
export default function CommunityFeed() {
  const {
    issues, getFilteredIssues, getTrendingIssues, toggleLike,
    activeFilter, setActiveFilter,
    navigateTo, searchQuery, setSearchQuery,
    loadingIssues,
  } = useApp();
  const { t, categoryLabel } = useLanguage();
  const [commentIssue, setCommentIssue] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locStatus, setLocStatus] = useState('idle');

  const trendingIssues = getTrendingIssues();

  /* My Area: filter ALL issues by distance + search (skip category filter) */
  const filteredIssues = (() => {
    if (activeFilter === 'myarea') {
      let pool = [...(issues || [])];
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        pool = pool.filter(i =>
          i.title.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q) ||
          i.location?.toLowerCase().includes(q)
        );
      }
      if (userLocation) {
        pool = pool.filter(i => {
          if (!i.coordinates) return false;
          return haversine(userLocation.lat, userLocation.lng, i.coordinates.lat, i.coordinates.lng) <= 15;
        });
      }
      return pool;
    }
    return getFilteredIssues();
  })();

  /* handle My Area pill click */
  const handleMyArea = () => {
    setActiveFilter('myarea');
    if (userLocation) return;
    if (!navigator.geolocation) { setLocStatus('denied'); return; }
    setLocStatus('loading');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocStatus('granted');
      },
      () => setLocStatus('denied'),
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  if (loadingIssues && filteredIssues.length === 0) return <FeedSkeleton />;

  const categoryFilters = CATEGORIES.map(c => ({ ...c, label: categoryLabel(c.id) }));
  const allFilters = [
    { id: 'all', label: 'All', icon: 'fa-fire' },
    { id: 'myarea', label: 'My Area', icon: 'fa-location-dot', special: true },
    ...categoryFilters,
  ];

  return (
    <div className="animate-fadeIn">

      {/* Search + Report row */}
      <div className="mb-3 flex items-center gap-3">
        <div className="relative flex-1">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
          <input
            type="text"
            placeholder={t('feed.searchPlaceholder')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
        <button
          onClick={() => navigateTo('report')}
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-primary-foreground text-sm font-semibold whitespace-nowrap shrink-0 hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
          style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-lg)' }}
        >
          <i className="fas fa-plus text-xs" />
          <span>{t('feed.reportIssue')}</span>
        </button>
      </div>

      {/* Trending */}
      <div className="mb-7">
        <p className="text-[10px] font-black tracking-[0.22em] uppercase text-blue-500/70 mb-0.5">{t('feed.pulse')}</p>
        <h2 className="text-xl font-black text-foreground">{t('feed.trending')}</h2>
        <TrendingCarousel issues={trendingIssues} onSupport={toggleLike} onOpen={(issue) => navigateTo('issueDetail', issue)} t={t} />
      </div>

      {/* Category filters */}
      <div className="mb-5 overflow-x-auto scrollbar-none">
        <div className="flex gap-2 pb-1">
          {allFilters.map(f => {
            const isActive = activeFilter === f.id;
            const isMyArea = f.id === 'myarea';
            return (
            <button
              key={f.id}
              onClick={isMyArea ? handleMyArea : () => setActiveFilter(f.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border transition-all duration-200 ${
                isActive
                  ? 'text-primary-foreground border-transparent shadow-md'
                  : isMyArea
                    ? 'bg-card border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
              }`}
              style={isActive ? { background: isMyArea ? 'linear-gradient(135deg,#059669,#10b981)' : 'var(--gradient-primary)' } : {}}
            >
              {isMyArea && locStatus === 'loading'
                ? <i className="fas fa-spinner fa-spin text-xs" />
                : <i className={`fas ${f.icon}`} />}
              {f.label}
              {isMyArea && locStatus === 'granted' && userLocation && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />
              )}
            </button>
          );
        })}
        </div>
      </div>

      {/* Issue grid */}
      {activeFilter === 'myarea' && locStatus === 'loading' ? (
        <div className="glass-card text-center py-16 px-6">
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-2xl text-muted-foreground mx-auto mb-4">
            <i className="fas fa-spinner fa-spin text-blue-500" />
          </div>
          <h3 className="text-base font-bold text-foreground">Getting your location…</h3>
          <p className="text-sm text-muted-foreground mt-1">Please allow location access in your browser</p>
        </div>
      ) : activeFilter === 'myarea' && locStatus === 'denied' ? (
        <div className="glass-card text-center py-16 px-6">
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-2xl mx-auto mb-4">
            <i className="fas fa-location-slash text-red-400" />
          </div>
          <h3 className="text-base font-bold text-foreground">Location access denied</h3>
          <p className="text-sm text-muted-foreground mt-1">Enable location in your browser settings and try again</p>
        </div>
      ) : filteredIssues.length === 0 ? (
        <div className="glass-card text-center py-16 px-6">
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-2xl text-muted-foreground mx-auto mb-4">
            {activeFilter === 'myarea'
              ? <i className="fas fa-map-location-dot text-emerald-400" />
              : <i className="fas fa-search" />}
          </div>
          <h3 className="text-base font-bold text-foreground">
            {activeFilter === 'myarea' ? 'No issues near you' : t('feed.noIssues')}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {activeFilter === 'myarea' ? 'Great news — no reported issues within 15 km of your location!' : t('feed.tryFilter')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredIssues.map(issue => (
            <IssueCard key={issue.id} issue={issue} onComment={setCommentIssue} variant="feed" />
          ))}
        </div>
      )}


      {commentIssue && <CommentModal issue={commentIssue} onClose={() => setCommentIssue(null)} />}
    </div>
  );
}
