function Shimmer({ className = '', rounded = 'rounded-2xl' }) {
  return <div className={`skeleton-shimmer ${rounded} ${className}`} aria-hidden="true" />;
}

function LoadingStatus({ label }) {
  return (
    <div role="status" aria-live="polite" className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-card/80 px-6 py-5 text-center shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
      <div className="mx-auto mb-3 h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" aria-hidden="true" />
      <p className="text-sm font-semibold text-foreground">{label}</p>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <aside className="fixed left-0 top-0 h-full z-30 w-[260px] bg-card border-r border-border flex flex-col">
      {/* logo area */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border flex-shrink-0">
        <Shimmer className="h-9 w-9 flex-shrink-0" rounded="rounded-xl" />
        <Shimmer className="h-5 w-28" />
        <Shimmer className="h-4 w-4 ml-auto" rounded="rounded-md" />
      </div>
      {/* nav items */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${i === 0 ? 'skeleton-shimmer' : ''}`}>
            <Shimmer className={`h-5 w-5 flex-shrink-0 ${i === 0 ? 'bg-white/30' : ''}`} rounded="rounded-md" />
            <Shimmer className={`h-4 w-24 ${i === 0 ? 'bg-white/30' : ''}`} rounded="rounded-md" />
          </div>
        ))}
      </nav>
      {/* bottom: dark mode + logout */}
      <div className="p-3 border-t border-border space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
          <Shimmer className="h-5 w-5 flex-shrink-0" rounded="rounded-md" />
          <Shimmer className="h-4 w-20" rounded="rounded-md" />
        </div>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
          <Shimmer className="h-5 w-5 flex-shrink-0" rounded="rounded-md" />
          <Shimmer className="h-4 w-16" rounded="rounded-md" />
        </div>
      </div>
    </aside>
  );
}

function MobileTopBarSkeleton() {
  return (
    <div className="md:hidden sticky top-0 z-20 h-14 bg-card/80 backdrop-blur-lg border-b border-border flex items-center px-4 gap-3">
      <Shimmer className="h-6 w-6" rounded="rounded-md" />
      <Shimmer className="h-5 w-28" rounded="rounded-md" />
    </div>
  );
}

function MobileBottomNavSkeleton() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border flex items-stretch h-14">
      {[0,1,2,3,4].map(i => (
        <div key={i} className="flex-1 flex flex-col items-center justify-center gap-1 py-2">
          <Shimmer className={`h-5 w-5 ${i === 0 ? '' : ''}`} rounded="rounded-md" />
          <Shimmer className="h-2 w-8" rounded="rounded-sm" />
        </div>
      ))}
    </div>
  );
}

function UserPanelLayout({ children }) {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="hidden md:block">
        <SidebarSkeleton />
      </div>
      <MobileTopBarSkeleton />
      <main className="min-h-screen md:ml-[260px]">
        <div className="p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </div>
      </main>
      <MobileBottomNavSkeleton />
    </div>
  );
}

function LoginSkeleton() {
  return (
    <div className="h-screen overflow-hidden bg-white">
      <div className="grid h-full lg:grid-cols-[45%_55%]">
        <section className="relative hidden overflow-hidden bg-gradient-to-b from-[#0f172a] to-[#1e3a5f] p-10 lg:block">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="relative z-10 flex items-center gap-3">
            <Shimmer className="h-11 w-11" rounded="rounded-2xl" />
            <div className="space-y-2">
              <Shimmer className="h-5 w-40 bg-white/15" />
              <Shimmer className="h-2 w-36 bg-white/10" />
            </div>
          </div>
          <div className="relative z-10 mt-12 space-y-4">
            <Shimmer className="h-12 w-72 bg-white/12" />
            <Shimmer className="h-16 w-[28rem] max-w-full bg-white/14" />
            <div className="space-y-2 pt-3">
              <Shimmer className="h-4 w-72 bg-white/12" />
              <Shimmer className="h-3 w-52 bg-white/10" />
            </div>
          </div>
          <div className="relative z-10 mt-8 space-y-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <Shimmer className="h-10 w-10 bg-white/12" rounded="rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Shimmer className="h-3 w-32 bg-white/12" />
                  <Shimmer className="h-3 w-44 bg-white/10" />
                </div>
              </div>
            ))}
          </div>
          <div className="relative z-10 mt-8 flex gap-8">
            {[0, 1, 2].map((item) => (
              <div key={item} className="space-y-2">
                <Shimmer className="h-6 w-14 bg-white/14" />
                <Shimmer className="h-2 w-20 bg-white/10" />
              </div>
            ))}
          </div>
        </section>

        <section className="relative flex items-center justify-center overflow-hidden bg-white px-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,#bfdbfe_0%,#e0f2fe_40%,transparent_75%)] opacity-50" />
          <div className="relative z-10 w-full max-w-[360px] space-y-8">
            <div className="space-y-4">
              <Shimmer className="h-14 w-14 bg-blue-100" />
              <div className="space-y-2">
                <Shimmer className="h-7 w-28 bg-slate-200" />
                <Shimmer className="h-4 w-64 bg-slate-100" />
              </div>
            </div>
            <div className="space-y-4">
              <Shimmer className="h-3 w-32 bg-slate-200" />
              <Shimmer className="h-14 w-full bg-slate-100" rounded="rounded-xl" />
              <Shimmer className="h-12 w-full bg-gradient-to-r from-blue-200/80 to-violet-200/80" rounded="rounded-xl" />
              <Shimmer className="mx-auto h-3 w-64 bg-slate-100" />
            </div>
            <div className="border-t border-slate-100 pt-6">
              <Shimmer className="mx-auto mb-3 h-3 w-44 bg-slate-100" />
              <Shimmer className="h-12 w-full bg-slate-100" rounded="rounded-xl" />
            </div>
          </div>
          <LoadingStatus label="Preparing CivicAssist..." />
        </section>
      </div>
    </div>
  );
}

function FeedPageSkeleton() {
  return (
    <div className="space-y-5">
      {/* search + report row */}
      <div className="flex gap-3">
        <Shimmer className="h-11 flex-1" rounded="rounded-xl" />
        <Shimmer className="h-11 w-36" rounded="rounded-xl" />
      </div>
      {/* trending header */}
      <div className="space-y-1">
        <Shimmer className="h-3 w-28" rounded="rounded-full" />
        <Shimmer className="h-6 w-44" />
      </div>
      {/* trending carousel */}
      <div className="flex gap-4 overflow-hidden pb-1">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-[300px] shrink-0 overflow-hidden rounded-2xl border border-border bg-card">
            <Shimmer className="h-44 w-full rounded-none" />
            <div className="space-y-2 p-3">
              <Shimmer className="h-4 w-2/3" />
              <Shimmer className="h-3 w-full" />
              <div className="flex items-center justify-between pt-1">
                <div className="flex gap-1">
                  {[0,1,2].map(j => <Shimmer key={j} className="h-5 w-5" rounded="rounded-full" />)}
                  <Shimmer className="h-4 w-16 ml-1" rounded="rounded-full" />
                </div>
                <Shimmer className="h-8 w-24" rounded="rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* dots */}
      <div className="flex justify-center gap-1.5">
        {[0,1,2,3,4,5,6].map(i => (
          <Shimmer key={i} className={`h-1.5 ${i === 0 ? 'w-6' : 'w-1.5'}`} rounded="rounded-full" />
        ))}
      </div>
      {/* filter pills */}
      <div className="flex gap-2 overflow-hidden">
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <Shimmer key={i} className="h-9 w-24 shrink-0" rounded="rounded-full" />
        ))}
      </div>
      {/* issue cards grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
            <Shimmer className="h-48 w-full rounded-none" />
            <div className="space-y-3 p-4">
              <div className="flex items-center gap-2">
                <Shimmer className="h-6 w-6" rounded="rounded-full" />
                <div className="space-y-1 flex-1">
                  <Shimmer className="h-3 w-24" />
                  <Shimmer className="h-2.5 w-32" />
                </div>
                <Shimmer className="h-5 w-5" rounded="rounded-md" />
              </div>
              <Shimmer className="h-5 w-16" rounded="rounded-full" />
              <Shimmer className="h-4 w-5/6" />
              <Shimmer className="h-3 w-3/4" />
              <Shimmer className="h-3 w-2/3" />
              <div className="flex gap-2 border-t border-border pt-3">
                <Shimmer className="h-9 flex-1" rounded="rounded-xl" />
                <Shimmer className="h-9 flex-1" rounded="rounded-xl" />
                <Shimmer className="h-9 flex-1" rounded="rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IssueDetailPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* hero card */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        <div className="relative h-[360px] bg-secondary">
          <Shimmer className="h-full w-full rounded-none" />
          <div className="absolute left-4 top-4 h-10 w-10 rounded-full bg-black/20" />
          <div className="absolute bottom-5 left-5 right-5 space-y-3">
            <div className="flex gap-2">
              <Shimmer className="h-6 w-20 bg-white/20" rounded="rounded-full" />
              <Shimmer className="h-6 w-24 bg-white/20" rounded="rounded-full" />
            </div>
            <Shimmer className="h-8 w-3/4 bg-white/25" />
            <Shimmer className="h-4 w-1/2 bg-white/20" />
          </div>
        </div>
        <div className="flex gap-3 border-t border-border p-4">
          <Shimmer className="h-11 flex-1" />
          <Shimmer className="h-11 flex-1" />
          <Shimmer className="h-11 flex-1" />
        </div>
      </div>

      {/* description card */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <Shimmer className="h-5 w-32" />
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-3/4" />
        <Shimmer className="h-3 w-5/6" />
      </div>

      {/* reporter + meta row */}
      <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-4">
        <Shimmer className="h-11 w-11" rounded="rounded-full" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-4 w-28" />
          <Shimmer className="h-3 w-20" />
        </div>
        <Shimmer className="h-6 w-20" rounded="rounded-full" />
      </div>

      {/* map placeholder */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="p-4 pb-2">
          <Shimmer className="h-5 w-24 mb-3" />
        </div>
        <Shimmer className="h-52 w-full rounded-none" />
      </div>

      {/* comments section */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Shimmer className="h-5 w-28" />
          <Shimmer className="h-4 w-16" />
        </div>
        {[0, 1, 2].map(i => (
          <div key={i} className="flex gap-3">
            <Shimmer className="h-9 w-9 shrink-0" rounded="rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Shimmer className="h-3 w-24" />
                <Shimmer className="h-3 w-14" />
              </div>
              <Shimmer className="h-3 w-full" />
              <Shimmer className="h-3 w-3/4" />
            </div>
          </div>
        ))}
        <div className="flex gap-2 border-t border-border pt-3">
          <Shimmer className="h-10 flex-1" rounded="rounded-xl" />
          <Shimmer className="h-10 w-16" rounded="rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function MyReportsPageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Shimmer className="h-7 w-32" />
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

function TrendingPageSkeleton() {
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

function LeaderboardPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* header */}
      <div className="space-y-1">
        <Shimmer className="h-7 w-44" />
        <Shimmer className="h-3 w-56" />
      </div>
      {/* stat cards */}
      <div className="flex gap-3">
        {[0,1,2].map(i => (
          <div key={i} className="flex-1 rounded-2xl border border-border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Shimmer className="h-7 w-7" rounded="rounded-lg" />
              <Shimmer className="h-3 w-16" />
            </div>
            <Shimmer className="h-7 w-20" />
            <Shimmer className="h-3 w-full" />
          </div>
        ))}
      </div>
      {/* filter pills */}
      <div className="flex gap-2 overflow-hidden">
        {[0,1,2,3,4,5].map(i => <Shimmer key={i} className="h-9 w-24 shrink-0" rounded="rounded-full" />)}
      </div>
      {/* top 3 podium */}
      <div className="grid grid-cols-3 gap-3">
        {[0,1,2].map(i => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4 flex flex-col items-center gap-2">
            <Shimmer className="h-8 w-8" rounded="rounded-full" />
            <Shimmer className="h-12 w-12" rounded="rounded-full" />
            <Shimmer className="h-4 w-20" />
            <Shimmer className="h-3 w-16" />
            <Shimmer className="h-5 w-14" rounded="rounded-full" />
          </div>
        ))}
      </div>
      {/* rank list */}
      <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
        {[0,1,2,3,4,5].map(i => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Shimmer className="h-6 w-6" rounded="rounded-full" />
            <Shimmer className="h-10 w-10" rounded="rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Shimmer className="h-4 w-32" />
              <Shimmer className="h-3 w-20" />
            </div>
            <div className="text-right space-y-1.5">
              <Shimmer className="h-4 w-16" />
              <Shimmer className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HelplinePageSkeleton() {
  return (
    <div className="space-y-6">
      {/* header */}
      <div className="space-y-1">
        <Shimmer className="h-7 w-40" />
        <Shimmer className="h-3 w-56" />
      </div>
      {/* emergency 4-card grid */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <Shimmer className="h-5 w-36" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[0,1,2,3].map(i => (
            <div key={i} className="rounded-2xl border border-border p-4 flex flex-col items-center gap-2">
              <Shimmer className="h-12 w-12" rounded="rounded-2xl" />
              <Shimmer className="h-5 w-12" />
              <Shimmer className="h-3 w-16" />
              <Shimmer className="h-5 w-20" rounded="rounded-full" />
            </div>
          ))}
        </div>
      </div>
      {/* civic service sections */}
      {[0,1,2,3,4].map(i => (
        <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <Shimmer className="h-9 w-9" rounded="rounded-xl" />
            <Shimmer className="h-5 w-32" />
          </div>
          {[0,1].map(j => (
            <div key={j} className="flex items-center gap-3 p-4 border-b border-border/50 last:border-0">
              <div className="flex-1 space-y-1.5">
                <Shimmer className="h-4 w-36" />
                <Shimmer className="h-3 w-48" />
              </div>
              <Shimmer className="h-4 w-20" />
              <Shimmer className="h-8 w-8" rounded="rounded-lg" />
              <Shimmer className="h-9 w-16" rounded="rounded-xl" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function NotificationsPageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Shimmer className="h-6 w-36" />
          <Shimmer className="h-3 w-24" />
        </div>
        <div className="flex gap-2">
          <div className="flex overflow-hidden rounded-xl border border-border">
            <Shimmer className="h-8 w-16 rounded-none" />
            <Shimmer className="h-8 w-20 rounded-none" />
          </div>
          <Shimmer className="h-8 w-24" rounded="rounded-xl" />
        </div>
      </div>
      {/* notification list */}
      <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
        {[
          'bg-red-50 dark:bg-red-900/20',
          'bg-blue-50 dark:bg-blue-900/20',
          'bg-green-50 dark:bg-green-900/20',
          'bg-orange-50 dark:bg-orange-900/20',
          'bg-amber-50 dark:bg-amber-900/20',
        ].map((bg, i) => (
          <div key={i} className={`flex items-start gap-3 p-4 ${bg}`}>
            <Shimmer className="h-10 w-10 shrink-0" rounded="rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Shimmer className="h-4 w-3/5" />
                <Shimmer className="h-3 w-10" />
              </div>
              <Shimmer className="h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* profile card */}
      <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
        <Shimmer className="h-16 w-16 shrink-0" rounded="rounded-full" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-5 w-36" />
          <Shimmer className="h-3 w-28" />
          <Shimmer className="h-3 w-20" />
        </div>
        <Shimmer className="h-9 w-20" rounded="rounded-xl" />
      </div>
      {/* setting sections */}
      {['Appearance', 'Privacy', 'Location', 'Account'].map((section, si) => (
        <div key={si} className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <Shimmer className="h-4 w-28" />
          </div>
          {[0,1,2].slice(0, si === 3 ? 2 : 3).map(i => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-border/50 last:border-0">
              <Shimmer className="h-9 w-9" rounded="rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <Shimmer className="h-4 w-32" />
                <Shimmer className="h-3 w-48" />
              </div>
              <Shimmer className="h-8 w-20" rounded="rounded-xl" />
            </div>
          ))}
        </div>
      ))}
      {/* logout button */}
      <Shimmer className="h-12 w-full" rounded="rounded-xl" />
    </div>
  );
}

function FormPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* header */}
      <div className="space-y-2">
        <Shimmer className="h-8 w-64" />
        <Shimmer className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* form fields */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <Shimmer className="h-12 w-full" rounded="rounded-xl" />
          <Shimmer className="h-28 w-full" rounded="rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            <Shimmer className="h-12 w-full" rounded="rounded-xl" />
            <Shimmer className="h-12 w-full" rounded="rounded-xl" />
          </div>
          <Shimmer className="h-12 w-full" rounded="rounded-xl" />
          <div className="flex gap-3">
            <Shimmer className="h-10 w-36" rounded="rounded-xl" />
            <Shimmer className="h-10 w-28" rounded="rounded-xl" />
          </div>
          <Shimmer className="h-12 w-44" rounded="rounded-xl" />
        </div>
        {/* map + photo */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <Shimmer className="h-5 w-28" />
            <Shimmer className="h-52 w-full" rounded="rounded-xl" />
            <Shimmer className="h-4 w-3/4" />
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <Shimmer className="h-5 w-24" />
            <Shimmer className="h-32 w-full border-2 border-dashed border-border" rounded="rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <Shimmer className="mb-8 h-10 w-36 bg-white/10" />
          <div className="space-y-3">
            {[0, 1, 2, 3].map((item) => <Shimmer key={item} className="h-11 w-full bg-white/10" />)}
          </div>
        </aside>
        <section className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((item) => <Shimmer key={item} className="h-28 bg-white/10" />)}
          </div>
          <Shimmer className="h-80 bg-white/10" />
          <div className="grid gap-4 md:grid-cols-2">
            <Shimmer className="h-48 bg-white/10" />
            <Shimmer className="h-48 bg-white/10" />
          </div>
        </section>
      </div>
      <LoadingStatus label="Loading admin tools..." />
    </div>
  );
}

export default function AppSkeleton({ page = 'login' }) {
  if (page === 'adminLogin' || page === 'adminDashboard') return <AdminSkeleton />;
  if (page === 'login') return <LoginSkeleton />;

  const pageSkeletons = {
    feed:          <FeedPageSkeleton />,
    report:        <FormPageSkeleton />,
    issueDetail:   <IssueDetailPageSkeleton />,
    myReports:     <MyReportsPageSkeleton />,
    leaderboard:   <LeaderboardPageSkeleton />,
    helplines:     <HelplinePageSkeleton />,
    notifications: <NotificationsPageSkeleton />,
    settings:      <SettingsPageSkeleton />,
    trending:      <TrendingPageSkeleton />,
  };

  const content = pageSkeletons[page] ?? <FeedPageSkeleton />;

  return (
    <UserPanelLayout>
      {content}
    </UserPanelLayout>
  );
}
