import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import RotatingText from '../components/RotatingText';
import { api } from '../lib/api';

function AnimatedHero() {
  return (
    <div className="flex flex-col items-start gap-5">
      <div className="flex flex-col items-start gap-1">
        <h1
          className="uppercase leading-none whitespace-nowrap"
          style={{
            fontFamily: "'Impact', 'Arial Narrow', sans-serif",
            fontWeight: 'normal',
            fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
            letterSpacing: '0.01em',
            background: 'linear-gradient(160deg, #e0f2fe 0%, #bfdbfe 40%, #818cf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          CITIES NEED YOU.
        </h1>

        <div className="leading-none overflow-hidden">
          <RotatingText
            texts={['YOUR REPORT.', 'YOUR VOICE.', 'YOUR IMPACT.', 'YOUR FUTURE.', 'YOUR CHANGE.']}
            splitBy="words"
            staggerFrom="first"
            staggerDuration={0.07}
            rotationInterval={2300}
            transition={{ type: 'spring', damping: 18, stiffness: 250 }}
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-110%', opacity: 0 }}
            elementLevelClassName="hero-char-gradient"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(2.6rem, 5vw, 3.8rem)',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-slate-300 text-base font-semibold leading-snug max-w-xs">
          Turning citizen reports into real civic progress.
        </p>
        <p className="text-slate-500 text-xs font-medium tracking-[0.18em] uppercase">
          Report · Track · Transform
        </p>
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
    { icon: 'fa-map-location-dot', title: 'Report Issues', desc: 'Pin civic problems on the map' },
    { icon: 'fa-chart-line', title: 'Track Progress', desc: 'Follow complaints in real time' },
    { icon: 'fa-people-group', title: 'Community Voice', desc: 'Upvote and support local issues' },
  ];

  return (
    <div className="h-screen flex overflow-hidden">
      <div className="hidden lg:flex w-[45%] flex-col bg-gradient-to-b from-[#0f172a] to-[#1e3a5f] relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="relative z-10 px-10 pt-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}>
              <i className="fas fa-city text-white text-base" />
            </div>
            <div>
              <div className="text-xl tracking-tight" style={{
                fontFamily: "'Ancola', sans-serif", fontWeight: 600,
                background: 'linear-gradient(90deg, #60a5fa 0%, #38bdf8 50%, #a5f3fc 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                CivicAssist
              </div>
              <div className="text-sky-400/60 text-[9px] font-bold tracking-[4px] uppercase mt-0.5">Citizen Intelligence</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-between pt-8 px-10 xl:px-12 pb-8">
          <div>
            <AnimatedHero />
            <div className="mt-6 space-y-2">
              {features.map(f => (
                <div key={f.title} className="flex items-center gap-4 px-4 py-2.5 rounded-2xl border transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.07)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(99,179,237,0.12)', border: '1px solid rgba(99,179,237,0.18)' }}>
                    <i className={`fas ${f.icon} text-blue-400 text-sm`} />
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">{f.title}</div>
                    <div className="text-slate-400 text-xs mt-0.5">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-8">
              {[['5K+', 'Issues Resolved'], ['12K+', 'Active Citizens'], ['98%', 'Satisfaction']].map(([val, lbl]) => (
                <div key={lbl}>
                  <div className="text-2xl font-black text-white">{val}</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5 tracking-wide uppercase">{lbl}</div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-slate-600 text-xs">© 2026 CivicAssist · Powered by Citizen Participation</p>
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
