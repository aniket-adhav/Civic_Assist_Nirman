import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';

export default function AdminLogin() {
  const { navigateTo } = useApp();
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!adminId.trim()) { setError('Admin ID is required'); return; }
    if (password.length < 3) { setError('Password must be at least 3 characters'); return; }
    setError('');
    setLoading(true);
    try {
      const result = await api.adminLogin(adminId.trim(), password);
      localStorage.setItem('ca_token', result.token);
      navigateTo('adminDashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex bg-[#f0f4ff]">
      <div className="hidden lg:flex w-[52%] flex-col relative overflow-hidden bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#1e40af]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-white/5" />
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 600 800" fill="none">
            <circle cx="300" cy="400" r="250" stroke="white" strokeWidth="0.5" />
            <circle cx="300" cy="400" r="180" stroke="white" strokeWidth="0.5" />
            <circle cx="300" cy="400" r="110" stroke="white" strokeWidth="0.5" />
            <line x1="0" y1="400" x2="600" y2="400" stroke="white" strokeWidth="0.5" />
            <line x1="300" y1="0" x2="300" y2="800" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="relative z-10 px-10 py-7">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <i className="fas fa-shield-halved text-white text-base" />
            </div>
            <div>
              <div className="text-white font-black text-lg tracking-tight">CivicAssist</div>
              <div className="text-blue-200 text-[10px] font-semibold tracking-widest uppercase">Government Portal</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center px-12 min-h-0">
          <div className="mb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur border border-white/20 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/90 text-[11px] font-bold tracking-widest uppercase">System Online</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-[0.95] tracking-tight">
              Admin Control<br /><span className="text-blue-200">Center</span>
            </h1>
            <p className="text-blue-100/80 text-sm xl:text-base mt-3 leading-relaxed max-w-sm">
              Manage complaints, monitor progress, and coordinate civic services across your jurisdiction.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: 'fa-folder-open', label: 'Active Cases', value: '120', color: 'bg-white/15' },
              { icon: 'fa-circle-check', label: 'Resolved', value: '847', color: 'bg-white/15' },
              { icon: 'fa-users', label: 'Officers', value: '32', color: 'bg-white/15' },
              { icon: 'fa-chart-line', label: 'This Month', value: '+12%', color: 'bg-white/15' },
            ].map(s => (
              <div key={s.label} className={`${s.color} backdrop-blur rounded-2xl p-3 border border-white/10`}>
                <i className={`fas ${s.icon} text-blue-200 text-sm mb-2 block`} />
                <div className="text-white text-xl font-black leading-none">{s.value}</div>
                <div className="text-blue-200/80 text-[10px] font-semibold uppercase tracking-wide mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 px-10 py-6">
          <div className="flex items-center gap-2 text-blue-200/60 text-xs">
            <i className="fas fa-lock text-xs" />
            <span>TLS 1.3 · AES-256 Encrypted</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 bg-white overflow-hidden">
        <div className="w-full max-w-[380px]">
          <div className="lg:hidden flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
              <i className="fas fa-shield-halved text-white text-sm" />
            </div>
            <span className="font-black text-slate-900 text-base">CivicAssist Admin</span>
          </div>

          <div className="mb-5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-3">
              <i className="fas fa-user-tie text-blue-600 text-xl" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Welcome back,</h2>
            <h2 className="text-2xl font-black text-blue-600 tracking-tight leading-tight">Admin Officer</h2>
            <p className="text-slate-400 text-sm mt-2">Sign in to access the administrative portal.</p>
            <p className="text-slate-300 text-xs mt-1 leading-snug">Default: <code className="bg-slate-100 px-1 rounded">ADM-00001</code> · <code className="bg-slate-100 px-1 rounded">admin123</code></p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Admin ID</label>
              <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                <i className="fas fa-id-badge text-slate-400 text-sm" />
                <input type="text" placeholder="e.g. ADM-00001" value={adminId}
                  onChange={e => { setAdminId(e.target.value); setError(''); }}
                  className="flex-1 bg-transparent text-slate-900 text-sm font-medium outline-none placeholder:text-slate-300" autoFocus />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Password</label>
              <div className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                <i className="fas fa-lock text-slate-400 text-sm" />
                <input type={showPass ? 'text' : 'password'} placeholder="Enter your password" value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  className="flex-1 bg-transparent text-slate-900 text-sm font-medium outline-none placeholder:text-slate-300" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="text-slate-300 hover:text-slate-500 transition-colors">
                  <i className={`fas ${showPass ? 'fa-eye' : 'fa-eye-slash'} text-sm`} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${rememberMe ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                  {rememberMe && <i className="fas fa-check text-white text-[8px]" />}
                </div>
                <span className="text-xs text-slate-500 font-medium">Remember me</span>
              </label>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                <i className="fas fa-circle-exclamation text-red-500 text-sm" />
                <span className="text-red-600 text-sm font-medium">{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying credentials...</>
                : <><i className="fas fa-arrow-right-to-bracket text-sm" />Sign In to Admin Portal</>}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <button onClick={() => navigateTo('login')}
              className="inline-flex items-center gap-2 text-slate-400 text-sm font-medium hover:text-slate-700 transition-colors">
              <i className="fas fa-arrow-left text-xs" />Back to Citizen Portal
            </button>
          </div>

          <p className="text-center text-[11px] text-slate-300 mt-3">
            Authorized personnel only · Unauthorized access is prosecutable
          </p>
        </div>
      </div>
    </div>
  );
}
