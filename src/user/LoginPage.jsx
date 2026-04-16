import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import RotatingText from '../components/RotatingText';
import { api } from '../lib/api';

const TICKER_ITEMS = [
  { dot: '#f87171', text: 'Pothole on Brigade Road', status: 'Filed 4m ago', statusColor: 'rgba(248,113,113,0.85)' },
  { dot: '#34d399', text: 'Water leak in Koramangala', status: 'Resolved', statusColor: 'rgba(52,211,153,0.85)' },
  { dot: '#fbbf24', text: 'Street light out · MG Road', status: 'Under review', statusColor: 'rgba(251,191,36,0.85)' },
  { dot: '#34d399', text: 'Garbage pile near City Mall', status: 'Resolved in 48h', statusColor: 'rgba(52,211,153,0.85)' },
  { dot: '#f87171', text: 'Broken footpath · Indiranagar', status: 'Filed 12m ago', statusColor: 'rgba(248,113,113,0.85)' },
  { dot: '#fbbf24', text: 'Park maintenance · Jayanagar', status: 'In progress', statusColor: 'rgba(251,191,36,0.85)' },
  { dot: '#34d399', text: 'Open drain · HSR Layout', status: 'Resolved in 2 days', statusColor: 'rgba(52,211,153,0.85)' },
  { dot: '#f87171', text: 'Power outage · Whitefield', status: 'Filed 1h ago', statusColor: 'rgba(248,113,113,0.85)' },
];

function LiveTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{ width: '100%', marginTop: '4px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', flexShrink: 0, boxShadow: '0 0 6px rgba(34,197,94,0.7)' }}
        />
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase' }}>
          Live Reports
        </span>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.08), transparent)' }} />
      </div>

      {/* Ticker strip */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '8px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        padding: '7px 0',
        maskImage: 'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)',
      }}>
        <div className="ticker-track">
          {doubled.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', paddingRight: '32px', flexShrink: 0 }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: item.dot, flexShrink: 0, boxShadow: `0 0 5px ${item.dot}88` }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.7rem', fontWeight: 500, color: 'rgba(255,255,255,0.65)', whiteSpace: 'nowrap' }}>
                {item.text}
              </span>
              <span style={{ fontSize: '0.62rem', color: item.statusColor, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, whiteSpace: 'nowrap' }}>
                · {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const MAP_DOTS = [
  { x: 18, y: 30, color: '#f87171', ring: '#f87171', label: 'Road', delay: 0 },
  { x: 35, y: 55, color: '#fbbf24', ring: '#fbbf24', label: 'Electric', delay: 0.4 },
  { x: 52, y: 22, color: '#60a5fa', ring: '#60a5fa', label: 'Water', delay: 0.8 },
  { x: 68, y: 65, color: '#34d399', ring: '#34d399', label: 'Resolved', delay: 1.2 },
  { x: 80, y: 38, color: '#f87171', ring: '#f87171', label: 'Road', delay: 0.3 },
  { x: 25, y: 72, color: '#60a5fa', ring: '#60a5fa', label: 'Water', delay: 0.9 },
  { x: 60, y: 48, color: '#fbbf24', ring: '#fbbf24', label: 'Electric', delay: 0.6 },
  { x: 88, y: 72, color: '#34d399', ring: '#34d399', label: 'Resolved', delay: 1.5 },
  { x: 42, y: 82, color: '#f87171', ring: '#f87171', label: 'Road', delay: 0.2 },
  { x: 74, y: 18, color: '#34d399', ring: '#34d399', label: 'Resolved', delay: 1.0 },
];

const STREET_H = [15, 32, 50, 68, 84];
const STREET_V = [12, 26, 42, 58, 72, 86];

function MiniCityMap() {
  const [visible, setVisible] = useState([]);

  useEffect(() => {
    MAP_DOTS.forEach((_, i) => {
      setTimeout(() => setVisible(v => [...v, i]), 300 + i * 180);
    });
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(96,165,250,0.15)' }}>
      {/* City grid SVG */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <rect width="100%" height="100%" fill="#0a1628" />
        {STREET_H.map(y => (
          <line key={y} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="rgba(96,165,250,0.08)" strokeWidth="1" />
        ))}
        {STREET_V.map(x => (
          <line key={x} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="rgba(96,165,250,0.08)" strokeWidth="1" />
        ))}
        {/* Block fills */}
        {STREET_H.slice(0, -1).map((y, i) =>
          STREET_V.slice(0, -1).map((x, j) => (
            <rect key={`${i}-${j}`} x={`${x + 0.5}%`} y={`${y + 0.5}%`}
              width={`${(STREET_V[j + 1] || 100) - x - 1}%`}
              height={`${(STREET_H[i + 1] || 100) - y - 1}%`}
              fill={`rgba(255,255,255,${((i + j) % 3 === 0) ? '0.012' : '0.005'})`} />
          ))
        )}
      </svg>

      {/* Edge vignette */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10,22,40,0.85) 100%)', pointerEvents: 'none' }} />

      {/* Dots */}
      {MAP_DOTS.map((dot, i) => (
        <AnimatePresence key={i}>
          {visible.includes(i) && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              style={{ position: 'absolute', left: `${dot.x}%`, top: `${dot.y}%`, transform: 'translate(-50%,-50%)' }}
            >
              {/* Ping ring */}
              <motion.div
                animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: dot.delay, ease: 'easeOut' }}
                style={{ position: 'absolute', inset: '-3px', borderRadius: '50%', border: `1.5px solid ${dot.color}`, pointerEvents: 'none' }}
              />
              {/* Core dot */}
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: dot.delay }}
                style={{ width: '7px', height: '7px', borderRadius: '50%', background: dot.color, boxShadow: `0 0 8px ${dot.color}99`, position: 'relative' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      ))}

      {/* LIVE badge */}
      <div style={{ position: 'absolute', top: '7px', right: '9px', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.45)', borderRadius: '20px', padding: '2px 8px 2px 6px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <motion.div
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e' }}
        />
        <span style={{ fontSize: '0.55rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>LIVE</span>
      </div>

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: '7px', left: '9px', display: 'flex', gap: '10px' }}>
        {[['#f87171', 'Road'], ['#fbbf24', 'Electric'], ['#60a5fa', 'Water'], ['#34d399', 'Resolved']].map(([color, lbl]) => (
          <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: color }} />
            <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.45)', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, letterSpacing: '0.04em' }}>{lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

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
          padding: '10px 18px 14px 14px',
          border: '1px solid rgba(147,197,253,0.12)',
          overflow: 'visible',
        }}>
          <h1 style={{
            fontFamily: "'Boldonse', cursive",
            fontWeight: 400,
            fontSize: 'clamp(1.45rem, 2.6vw, 2.1rem)',
            lineHeight: 1,
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap',
            display: 'block',
            background: 'linear-gradient(135deg, #e2e8f0 0%, #93c5fd 45%, #60a5fa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
            padding: '0.1em 0 0 0',
          }}>
            YOUR CITY. YOUR VOICE.
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
          color: 'rgba(255,255,255,0.72)',
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
            color: 'rgba(255,255,255,0.5)',
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
        style={{ background: 'linear-gradient(160deg, #0c1628 0%, #0e1e35 35%, #101f38 65%, #0d1b30 100%)' }}>

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
                      color: '#ffffff',
                    }}>{f.title}</div>
                    <div style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '0.71rem',
                      fontWeight: 400,
                      color: 'rgba(255,255,255,0.5)',
                      marginTop: '1px',
                    }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Ticker */}
            <LiveTicker />
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
            {[['fa-shield-halved', 'Secure'], ['fa-lock', 'Private'], ['fa-bolt', 'Fast']].map(([icon, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <i className={`fas ${icon}`} style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)' }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>{label}</span>
              </div>
            ))}
          </div>
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
              <div className="flex gap-1.5 sm:gap-2.5 justify-between mb-5">
                {otp.map((digit, i) => (
                  <input key={i} ref={el => otpRefs.current[i] = el}
                    type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className={`flex-1 min-w-0 h-12 sm:h-14 border-2 rounded-xl sm:rounded-2xl text-center text-lg sm:text-xl font-black outline-none transition-all ${
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
