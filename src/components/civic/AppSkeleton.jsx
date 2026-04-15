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

function FeedSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:block fixed left-0 top-0 h-screen w-[260px] border-r border-border bg-sidebar p-4">
        <div className="mb-8 flex items-center gap-3">
          <Shimmer className="h-11 w-11" />
          <div className="space-y-2">
            <Shimmer className="h-4 w-28" />
            <Shimmer className="h-3 w-20" />
          </div>
        </div>
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-xl p-2">
              <Shimmer className="h-9 w-9" rounded="rounded-xl" />
              <Shimmer className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>

      <main className="min-h-screen md:ml-[260px]">
        <div className="md:hidden sticky top-0 h-14 border-b border-border bg-card/80 px-4 py-3">
          <Shimmer className="h-7 w-40" />
        </div>
        <div className="relative p-4 md:p-8">
          <Shimmer className="mb-6 h-12 w-full" rounded="rounded-xl" />
          <div className="mb-8">
            <Shimmer className="mb-2 h-3 w-36" />
            <Shimmer className="mb-5 h-7 w-56" />
            <div className="grid gap-4 lg:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="overflow-hidden rounded-2xl border border-border bg-card">
                  <Shimmer className="h-44 w-full rounded-none" />
                  <div className="space-y-3 p-4">
                    <Shimmer className="h-4 w-2/3" />
                    <Shimmer className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-6 flex gap-2 overflow-hidden">
            {[0, 1, 2, 3, 4].map((item) => (
              <Shimmer key={item} className="h-9 w-24 shrink-0" rounded="rounded-full" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="overflow-hidden rounded-2xl border border-border bg-card">
                <Shimmer className="aspect-square w-full rounded-none" />
                <div className="space-y-3 p-4">
                  <Shimmer className="h-4 w-5/6" />
                  <Shimmer className="h-3 w-full" />
                  <Shimmer className="h-3 w-3/4" />
                  <div className="flex gap-2 border-t border-border pt-3">
                    <Shimmer className="h-9 flex-1" />
                    <Shimmer className="h-9 flex-1" />
                    <Shimmer className="h-9 flex-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <LoadingStatus label="Loading civic updates..." />
        </div>
      </main>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="min-h-screen bg-background md:ml-[260px]">
      <div className="relative p-4 md:p-8">
        <Shimmer className="mb-3 h-8 w-64" />
        <Shimmer className="mb-8 h-4 w-96 max-w-full" />
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="space-y-5">
              <Shimmer className="h-12 w-full" />
              <Shimmer className="h-28 w-full" />
              <Shimmer className="h-12 w-full" />
              <Shimmer className="h-12 w-full" />
              <Shimmer className="h-12 w-44" />
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <Shimmer className="mb-4 h-48 w-full" />
            <Shimmer className="mb-2 h-4 w-3/4" />
            <Shimmer className="h-3 w-full" />
          </div>
        </div>
        <LoadingStatus label="Preparing form..." />
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
  if (page === 'report' || page === 'settings') return <FormSkeleton />;
  if (page === 'feed' || page === 'issueDetail' || page === 'myReports' || page === 'trending' || page === 'notifications') return <FeedSkeleton />;
  return <LoginSkeleton />;
}