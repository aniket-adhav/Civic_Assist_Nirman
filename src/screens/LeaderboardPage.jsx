import { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';

const LEADERBOARD_USERS = [
  { id: 'u1', name: 'Aarav Sharma', city: 'Delhi', reports: 184, resolved: 132 },
  { id: 'u2', name: 'Priya Nair', city: 'Bengaluru', reports: 171, resolved: 124 },
  { id: 'u3', name: 'Rohan Deshmukh', city: 'Pune', reports: 165, resolved: 119 },
  { id: 'u4', name: 'Sneha Patel', city: 'Ahmedabad', reports: 149, resolved: 102 },
  { id: 'u5', name: 'Vikram Singh', city: 'Jaipur', reports: 137, resolved: 93 },
  { id: 'u6', name: 'Ananya Roy', city: 'Kolkata', reports: 126, resolved: 88 },
  { id: 'u7', name: 'Farhan Khan', city: 'Lucknow', reports: 119, resolved: 81 },
  { id: 'u8', name: 'Kavya Iyer', city: 'Chennai', reports: 112, resolved: 79 },
  { id: 'u9', name: 'Neeraj Verma', city: 'Bhopal', reports: 104, resolved: 72 },
  { id: 'u10', name: 'Meera Joshi', city: 'Mumbai', reports: 96, resolved: 68 },
];

const MEDAL_STYLES = [
  { gradient: 'linear-gradient(135deg,#f59e0b,#f97316)', icon: 'fa-crown' },
  { gradient: 'linear-gradient(135deg,#94a3b8,#64748b)', icon: 'fa-medal' },
  { gradient: 'linear-gradient(135deg,#fb7185,#ef4444)', icon: 'fa-award' },
];

export default function LeaderboardPage() {
  const { t } = useLanguage();
  const sorted = useMemo(
    () => [...LEADERBOARD_USERS].sort((a, b) => b.reports - a.reports),
    []
  );
  const topThree = sorted.slice(0, 3);
  const nextSeven = sorted.slice(3, 10);

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="mb-6">
        <p className="text-[10px] font-black tracking-[0.22em] uppercase text-blue-500/70 mb-1">
          {t('leaderboard.pulse')}
        </p>
        <h1 className="text-2xl md:text-3xl font-black text-foreground">
          {t('leaderboard.title')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('leaderboard.subtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {topThree.map((user, index) => {
          const medal = MEDAL_STYLES[index];
          const rank = index + 1;
          return (
            <div
              key={user.id}
              className="rounded-3xl border border-border p-5 relative overflow-hidden animate-slideUp"
              style={{ animationDelay: `${index * 120}ms`, background: 'var(--gradient-card)' }}
            >
              <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full opacity-20" style={{ background: medal.gradient }} />
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-3 shadow-lg" style={{ background: medal.gradient }}>
                  <i className={`fas ${medal.icon}`} />
                </div>
                <p className="text-xs font-black text-muted-foreground uppercase tracking-wider">#{rank} {t('leaderboard.rank')}</p>
                <h3 className="text-lg font-black text-foreground mt-1">{user.name}</h3>
                <p className="text-xs text-muted-foreground">{user.city}</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <StatCard label={t('leaderboard.reports')} value={user.reports} />
                  <StatCard label={t('leaderboard.resolved')} value={user.resolved} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-border overflow-hidden bg-card shadow-sm">
        <div className="px-5 py-4 border-b border-border bg-secondary/30">
          <h2 className="text-base font-black text-foreground">{t('leaderboard.topTen')}</h2>
        </div>
        <div className="divide-y divide-border">
          {nextSeven.map((user, idx) => {
            const rank = idx + 4;
            const progress = Math.round((user.reports / topThree[0].reports) * 100);
            return (
              <div key={user.id} className="px-5 py-4 hover:bg-secondary/30 transition-colors animate-slideUp" style={{ animationDelay: `${idx * 70}ms` }}>
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-sm font-black text-foreground">
                    {rank}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-foreground truncate">{user.name}</p>
                      <p className="text-sm font-black text-primary">{user.reports} {t('leaderboard.reports')}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{user.city}</p>
                    <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${progress}%`, background: 'var(--gradient-primary)' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl bg-secondary/60 px-3 py-2">
      <p className="text-[10px] uppercase font-bold tracking-wide text-muted-foreground">{label}</p>
      <p className="text-base font-black text-foreground mt-0.5">{value}</p>
    </div>
  );
}
