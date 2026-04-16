import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export default function NotificationsPage() {
  const { navigateTo, issues, showNotification } = useApp();
  const { t, statusLabel } = useLanguage();
  const BASE_NOTIFS = [
    { id: 1, icon: 'fa-heart', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', title: `Rahul M. ${t('feed.supported').toLowerCase()} your report`, desc: 'Overflowing garbage bins near City Mall', time: '2h', read: false, issueId: null },
    { id: 2, icon: 'fa-comment', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', title: 'Priya S. commented on your report', desc: '"This has been an issue for weeks!"', time: '3h', read: false, issueId: null },
    { id: 3, icon: 'fa-circle-check', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', title: 'Issue resolved by Pune Municipal Corp', desc: `Pothole on MG Road is now ${statusLabel('resolved')}`, time: '1d', read: true, issueId: null },
    { id: 4, icon: 'fa-fire', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', title: 'Your report is trending!', desc: `Water supply disrupted - 200+ ${t('feed.supporters').toLowerCase()}`, time: '2d', read: true, issueId: null },
    { id: 5, icon: 'fa-arrows-rotate', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', title: 'Status update on your report', desc: `Pothole on MG Road is now ${statusLabel('inprogress')}`, time: '3d', read: true, issueId: null },
  ];
  const [notifs, setNotifs] = useState(() => {
    return BASE_NOTIFS.map((n, i) => ({ ...n, issueId: issues[i]?.id || null }));
  });
  const [filter, setFilter] = useState('all');

  const unreadCount = notifs.filter(n => !n.read).length;

  const markRead = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const deleteNotif = (id, e) => { e.stopPropagation(); setNotifs(prev => prev.filter(n => n.id !== id)); };

  const filtered = filter === 'unread' ? notifs.filter(n => !n.read) : notifs;

  const handleClick = (n) => {
    markRead(n.id);
    if (n.issueId) {
      const issue = issues.find(i => i.id === n.issueId);
      if (issue) { navigateTo('issueDetail', issue); return; }
    }
    showNotification(t('notifications.navigating'), 'info');
    navigateTo('feed');
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t('notifications.title')}</h1>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">{unreadCount} {t('notifications.unread')}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-border overflow-hidden text-xs font-semibold">
            {['all', 'unread'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 transition-colors capitalize ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-secondary'}`}
              >
                {statusLabel(f)}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs font-bold text-primary hover:text-primary/80 transition-colors px-2 py-1.5"
            >
              {t('notifications.markAllRead')}
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card text-center py-16">
          <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-2xl text-muted-foreground mx-auto mb-4">
            <i className="fas fa-bell-slash" />
          </div>
          <h3 className="text-base font-bold text-foreground">{t('notifications.allCaughtUp')}</h3>
          <p className="text-sm text-muted-foreground mt-1">{t('notifications.noNow').replace('{{prefix}}', filter === 'unread' ? `${t('notifications.unread')} ` : '')}</p>
        </div>
      ) : (
        <div className="glass-card divide-y divide-border">
          {filtered.map(n => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className={`group flex items-start gap-4 p-4 hover:bg-secondary/40 transition-colors cursor-pointer relative ${!n.read ? 'bg-primary/[0.03]' : ''}`}
            >
              {!n.read && (
                <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              )}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${n.bg}`}>
                <i className={`fas ${n.icon} text-sm ${n.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm text-foreground ${n.read ? 'font-medium' : 'font-bold'}`}>{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.desc}</p>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium">{n.time} ago</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!n.read && (
                  <button
                    onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all active:scale-90"
                    title={t('notifications.markAsRead')}
                  >
                    <i className="fas fa-check text-xs" />
                  </button>
                )}
                <button
                  onClick={(e) => deleteNotif(n.id, e)}
                  className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-destructive transition-all active:scale-90"
                  title={t('notifications.dismiss')}
                >
                  <i className="fas fa-xmark text-xs" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
