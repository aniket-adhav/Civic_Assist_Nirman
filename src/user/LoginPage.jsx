import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import RotatingText from '../components/RotatingText';
import { api } from '../lib/api';

function AnimatedHero() {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex flex-col items-start gap-1.5">
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
          fontSize: '0.6rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#14b8a6',
        }}>
          Civic Intelligence Platform
        </p>

        <div style={{
          display: 'inline-block',
          background: 'linear-gradient(120deg, rgba(255,255,255,0.06) 0%, rgba(147,197,253,0.10) 50%, rgba(96,165,250,0.07) 100%)',
          borderRadius: '10px',
          padding: '6px 16px 6px 12px',
          border: '1px solid rgba(147,197,253,0.12)',
        }}>
          <h1 style={{
            fontFamily: "'Boldonse', cursive",
            fontWeight: 400,
            fontSize: 'clamp(1.75rem, 3.2vw, 2.6rem)',
            lineHeight: 1,
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #e2e8f0 0%, #93c5fd 45%, #60a5fa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
          }}>
            Your City. Your Voice.
          </h1>
        </div>

        <div className="overflow-hidden">
          <RotatingText
            texts={['Make it heard.', 'Drive change.', 'Build tomorrow.', 'Shape progress.', 'Act now.']}
            splitBy="words"
            staggerFrom="first"
            staggerDuration={0.06}
            rotationInterval={2400}
            transition={{ type: 'spring', damping: 20, stiffness: 240 }}
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-110%', opacity: 0 }}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(1.45rem, 2.5vw, 1.7rem)',
              letterSpacing: '0.01em',
              lineHeight: 1.3,
              color: '#14b8a6',
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.95rem',
          fontWeight: 400,
          lineHeight: 1.65,
          color: '#64748b',
          maxWidth: '26rem',
        }}>
          Every report you file becomes a step toward a better city. Join thousands making real civic impact.
        </p>
        <div className="flex items-center gap-2">
          <div style={{ width: 22, height: 1, background: 'linear-gradient(90deg, #14b8a6, transparent)' }} />
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#3b82f6',
          }}>
            Report · Track · Resolve
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { login, navigateTo } = useApp();
  const { language, setLanguage, languageOptions, t } = useLanguage();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [pendingUserId, setPendingUserId] = useState('');
  const otpRefs = useRef([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(v => v - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleSendOtp = async () => {
    if (phone.length < 10) { setError(t('login.errors.invalidPhone')); return; }
    setError('');
    setLoading(true);
    try {
      await api.sendOtp(phone);
      setStep('otp');
      setResendTimer(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.message || t('login.errors.sendOtpFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);
    setError('');
    if (cleaned && index < 5) otpRefs.current[index + 1]?.focus();
    if (newOtp.every(d => d !== '') && newOtp.join('').length === 6) {
      setTimeout(() => handleVerifyOtp(newOtp.join('')), 100);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleVerifyOtp = async (otpVal) => {
    const code = otpVal || otp.join('');
    if (code.length < 6) { setError(t('login.errors.incompleteOtp')); return; }
    setLoading(true);
    try {
      const result = await api.verifyOtp(phone);
      if (result.isNew || !result.user.name) {
        setPendingUserId(result.userId);
        localStorage.setItem('ca_userId', result.userId);
        setStep('name');
      } else {
        login(result.user);
      }
    } catch (err) {
      setError(err.message || t('login.errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteName = async () => {
    const trimmed = name.trim();
    if (!trimmed) { setError(t('login.errors.enterName')); return; }
    setLoading(true);
    try {
      const result = await api.completeProfile(trimmed);
      login(result.user);
    } catch (err) {
      setError(err.message || t('login.errors.saveNameFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setOtp(['', '', '', '', '', '']);
    setError('');
    setLoading(true);
    try {
      await api.sendOtp(phone);
      setResendTimer(30);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: 'fa-map-location-dot', title: 'Report Issues', desc: 'Pin civic problems on the live city map' },
    { icon: 'fa-chart-line', title: 'Track Progress', desc: 'Follow every complaint from filed to resolved' },
    { icon: 'fa-people-group', title: 'Community Voice', desc: 'Upvote and support urgent local issues' },
  ];

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="hidden lg:flex w-[45%] flex-col relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #050c1a 0%, #071628 55%, #030a15 100%)' }}>

        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.5), transparent)' }} />
          <div className="absolute -top-40 -left-20 w-[420px] h-[420px] rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.09) 0%, transparent 70%)' }} />
          <div className="absolute bottom-10 right-0 w-72 h-72 rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.07) 0%, transparent 70%)' }} />
          <div className="absolute inset-0 opacity-[0.02]"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #60a5fa 1px, transparent 0)', backgroundSize: '30px 30px' }} />
          <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.2), transparent)' }} />
        </div>

        {/* Logo */}
        <div className="relative z-10 px-9 pt-7">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', boxShadow: '0 4px 14px rgba(59,130,246,0.35)' }}>
              <i className="fas fa-city text-white text-sm" />
            </div>
            <div>
              <div style={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 700,
                fontSize: '1.3rem',
                letterSpacing: '-0.01em',
                background: 'linear-gradient(90deg, #93c5fd 0%, #60a5fa 60%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                CivicAssist
              </div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.58rem',
                fontWeight: 600,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: 'rgba(20,184,166,0.65)',
                marginTop: '0px',
              }}>For The People</div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex-1 flex flex-col pt-5 px-9 pb-6">
          <div className="flex flex-col gap-5">
            <AnimatedHero />

            {/* Divider */}
            <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(59,130,246,0.25), rgba(20,184,166,0.15), transparent)' }} />

            {/* Feature cards */}
            <div className="flex flex-col gap-2">
              {features.map(f => (
                <div key={f.title} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl"
                  style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.12)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <i className={`fas ${f.icon} text-xs`} style={{ color: '#60a5fa' }} />
                  </div>
                  <div>
                    <div style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: '0.83rem',
                      color: '#cbd5e1',
                    }}>{f.title}</div>
                    <div style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '0.71rem',
                      fontWeight: 400,
                      color: '#475569',
                      marginTop: '1px',
                    }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-start gap-6 mt-3">
              {[['5K+', 'Issues Resolved'], ['12K+', 'Active Citizens'], ['98%', 'Satisfaction'], ['48h', 'Avg Response']].map(([val, lbl]) => (
                <div key={lbl}>
                  <div style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontWeight: 400,
                    fontSize: '1.75rem',
                    letterSpacing: '0.04em',
                    background: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1,
                  }}>{val}</div>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    color: '#334155',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    marginTop: '3px',
                  }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.65rem',
            color: '#1e3a5f',
            letterSpacing: '0.04em',
            marginTop: 'auto',
          }}>© 2026 CivicAssist · Powered by Citizen Participation</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 bg-white overflow-auto relative">
        <div className="absolute right-6 top-5 z-20">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            aria-label="Select language"
          >
            {languageOptions.map((option) => (
              <option key={option.code} value={option.code}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="absolute inset-0 z-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 60% 40%, #bfdbfe 0%, #e0f2fe 40%, transparent 75%)', opacity: 0.5 }} />

        <div className="w-full max-w-[360px] relative z-10">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
              <i className="fas fa-city text-white text-sm" />
            </div>
            <span className="font-black text-slate-900">CivicAssist</span>
          </div>

          {step === 'phone' && (
            <div>
              <div className="mb-8">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5">
                  <i className="fas fa-mobile-screen text-blue-600 text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{t('login.signIn')}</h2>
                <p className="text-slate-400 text-sm mt-1">{t('login.enterMobile')}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t('login.mobileNumber')}</label>
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 transition-all overflow-hidden">
                    <div className="flex items-center gap-2 pl-4 pr-3 border-r border-slate-200 py-3.5">
                      <span className="text-slate-400 text-sm font-bold">🇮🇳</span>
                      <span className="text-slate-500 text-sm font-bold">+91</span>
                    </div>
                    <input
                      type="tel" placeholder="9876543210" value={phone}
                      onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                      onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                      maxLength={10} autoFocus
                      className="flex-1 px-4 py-3.5 text-slate-900 text-sm font-semibold bg-transparent outline-none placeholder:text-slate-300 placeholder:font-normal"
                    />
                    {phone.length === 10 && <span className="pr-4 text-green-500"><i className="fas fa-circle-check text-sm" /></span>}
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 px-3.5 py-3 bg-red-50 border border-red-200 rounded-xl">
                    <i className="fas fa-circle-exclamation text-red-500 text-sm" />
                    <span className="text-red-600 text-sm">{error}</span>
                  </div>
                )}
                <button onClick={handleSendOtp} disabled={phone.length < 10 || loading}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', boxShadow: '0 8px 24px rgba(37,99,235,0.3)' }}>
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('login.sending')}</>
                    : <>{t('login.continue')} <i className="fas fa-arrow-right text-xs" /></>}
                </button>
                <p className="text-center text-xs text-slate-400">
                  {t('login.termsPrefix')} <button className="text-blue-500 font-semibold hover:underline">{t('login.terms')}</button>
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-center text-xs text-slate-400 mb-3">{t('login.officialPrompt')}</p>
                <button onClick={() => navigateTo('adminLogin')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all">
                  <i className="fas fa-shield-halved text-sm" />
                  {t('login.adminPortal')}
                </button>
              </div>
            </div>
          )}

          {step === 'otp' && (
            <div>
              <button onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); setError(''); }}
                className="flex items-center gap-2 text-slate-400 text-sm font-semibold mb-8 hover:text-slate-700 transition-colors">
                <i className="fas fa-arrow-left text-xs" /> {t('login.back')}
              </button>
              <div className="mb-8">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5">
                  <i className="fas fa-message text-blue-600 text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{t('login.verifyOtp')}</h2>
                <p className="text-slate-400 text-sm mt-1">
                  {t('login.enterOtpFor')} <strong className="text-slate-700">+91 {phone}</strong>
                </p>
              </div>
              <div className="flex gap-2.5 justify-between mb-5">
                {otp.map((digit, i) => (
                  <input key={i} ref={el => otpRefs.current[i] = el}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className={`w-12 h-14 border-2 rounded-2xl text-center text-xl font-black outline-none transition-all ${
                      digit ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50'
                    }`}
                  />
                ))}
              </div>
              {error && (
                <div className="flex items-center gap-2 px-3.5 py-3 bg-red-50 border border-red-200 rounded-xl mb-4">
                  <i className="fas fa-circle-exclamation text-red-500 text-sm" />
                  <span className="text-red-600 text-sm">{error}</span>
                </div>
              )}
              <button onClick={() => handleVerifyOtp()} disabled={loading || otp.join('').length < 6}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', boxShadow: '0 8px 24px rgba(37,99,235,0.3)' }}>
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('login.verifying')}</>
                  : <>{t('login.verifyContinue')} <i className="fas fa-arrow-right text-xs" /></>}
              </button>
              <div className="text-center mt-5">
                {resendTimer > 0
                  ? <p className="text-slate-400 text-sm">{t('login.resendIn')} <strong className="text-slate-700">{resendTimer}s</strong></p>
                  : <button onClick={handleResend} className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                      <i className="fas fa-rotate-right mr-1.5" />{t('login.resendOtp')}
                    </button>}
              </div>
            </div>
          )}

          {step === 'name' && (
            <div>
              <div className="mb-8">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5">
                  <i className="fas fa-user text-blue-600 text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{t('login.whatsYourName')}</h2>
                <p className="text-slate-400 text-sm mt-1">{t('login.nameHelp')}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t('login.yourName')}</label>
                  <input
                    type="text" placeholder="e.g. Rahul Sharma" value={name} autoFocus
                    onChange={e => { setName(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleCompleteName()}
                    className="w-full px-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 text-sm font-semibold focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300 placeholder:font-normal"
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 px-3.5 py-3 bg-red-50 border border-red-200 rounded-xl">
                    <i className="fas fa-circle-exclamation text-red-500 text-sm" />
                    <span className="text-red-600 text-sm">{error}</span>
                  </div>
                )}
                <button onClick={handleCompleteName} disabled={loading || !name.trim()}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', boxShadow: '0 8px 24px rgba(37,99,235,0.3)' }}>
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('login.saving')}</>
                    : <>{t('login.letsGo')} <i className="fas fa-arrow-right text-xs" /></>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
