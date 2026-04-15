import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

const PUNE_ZONES = ['Shivajinagar', 'Hadapsar', 'Kothrud', 'Wakad', 'Aundh', 'Deccan', 'Yerawada', 'Baner', 'Pimpri', 'Kondhwa'];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { currentUser, logout, showNotification } = useApp();
  const { language, setLanguage, languageOptions, t } = useLanguage();

  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.name || 'You');
  const [nameInput, setNameInput] = useState(displayName);

  const [profilePublic, setProfilePublic] = useState(true);
  const [anonymous, setAnonymous] = useState(false);
  const [twoFA, setTwoFA] = useState(false);

  const [showLangPicker, setShowLangPicker] = useState(false);

  const [location, setLocation] = useState('');
  const [editingLocation, setEditingLocation] = useState(false);
  const [locationInput, setLocationInput] = useState('');

  const [showAbout, setShowAbout] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  const saveName = () => {
    if (nameInput.trim()) {
      setDisplayName(nameInput.trim());
      showNotification('Display name updated!', 'success');
    }
    setEditingName(false);
  };

  const saveLocation = () => {
    if (locationInput.trim()) {
      setLocation(locationInput.trim());
      showNotification('Default location saved!', 'success');
    }
    setEditingLocation(false);
  };

  const sections = [
    {
      title: 'Appearance',
      items: [
        {
          icon: 'fa-palette',
          label: 'Theme',
          description: 'Choose your preferred appearance',
          action: (
            <div className="flex gap-2">
              {['light', 'dark'].map(t => (
                <button key={t} onClick={() => setTheme(t)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all capitalize ${theme === t ? 'border-transparent text-primary-foreground' : 'bg-secondary border-border text-muted-foreground hover:border-primary/30'}`}
                  style={theme === t ? { background: 'var(--gradient-primary)' } : {}}>
                  <i className={`fas ${t === 'dark' ? 'fa-moon' : 'fa-sun'} mr-1.5`} />{t}
                </button>
              ))}
            </div>
          ),
        },
      ],
    },
    {
      title: 'Profile',
      items: [
        {
          icon: 'fa-user',
          label: 'Display Name',
          description: editingName ? '' : displayName,
          action: editingName ? (
            <div className="flex gap-2 items-center">
              <input
                autoFocus
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveName()}
                className="px-3 py-1.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary w-32"
              />
              <button onClick={saveName} className="text-xs font-bold text-primary hover:text-primary/70">Save</button>
              <button onClick={() => { setEditingName(false); setNameInput(displayName); }} className="text-xs font-bold text-muted-foreground">Cancel</button>
            </div>
          ) : (
            <button onClick={() => { setEditingName(true); setNameInput(displayName); }} className="text-xs font-bold text-primary hover:text-primary/70 transition-colors">Edit →</button>
          ),
        },
        {
          icon: 'fa-phone',
          label: 'Phone Number',
          description: currentUser?.phone ? `+91 ${currentUser.phone}` : 'Not set',
          action: <span className="text-xs text-green-500 font-bold"><i className="fas fa-circle-check mr-1" />Verified</span>,
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { icon: 'fa-bell', label: 'Push Notifications', description: 'Get notified about issue updates', action: <ToggleSwitch defaultOn /> },
        { icon: 'fa-envelope', label: 'Email Notifications', description: 'Receive email digests', action: <ToggleSwitch /> },
        { icon: 'fa-fire', label: 'Trending Alerts', description: 'Alerts for trending issues nearby', action: <ToggleSwitch defaultOn /> },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          icon: 'fa-lock',
          label: 'Profile Visibility',
          description: profilePublic ? 'Anyone can see your profile' : 'Your profile is private',
          action: (
            <button
              onClick={() => { setProfilePublic(p => !p); showNotification(`Profile set to ${profilePublic ? 'Private' : 'Public'}`, 'success'); }}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${profilePublic ? 'bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' : 'bg-secondary border-border text-muted-foreground'}`}
            >
              {profilePublic ? 'Public' : 'Private'} →
            </button>
          ),
        },
        {
          icon: 'fa-eye-slash',
          label: 'Anonymous Reports',
          description: anonymous ? 'Your name is hidden on reports' : 'Your name is visible on reports',
          action: <ToggleSwitch defaultOn={anonymous} onChange={v => { setAnonymous(v); showNotification(v ? 'Reports will be anonymous' : 'Your name will be shown', 'success'); }} />,
        },
        {
          icon: 'fa-shield',
          label: 'Two-Factor Auth',
          description: twoFA ? 'Extra security enabled' : 'Add extra security to your account',
          action: (
            <button
              onClick={() => setShow2FAModal(true)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${twoFA ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {twoFA ? 'Enabled ✓' : 'Setup →'}
            </button>
          ),
        },
      ],
    },
    {
      title: t('settings.general'),
      items: [
        {
          icon: 'fa-language',
          label: t('settings.language'),
          description: languageOptions.find(({ code }) => code === language)?.label || 'English',
          action: (
            <div className="relative">
              <button onClick={() => setShowLangPicker(p => !p)} className="text-xs font-bold text-primary hover:text-primary/70 transition-colors">{t('settings.change')} →</button>
              {showLangPicker && (
                <div className="absolute right-0 top-7 w-52 bg-card border border-border rounded-2xl shadow-xl z-10 overflow-hidden">
                  {languageOptions.map((option) => (
                    <button
                      key={option.code}
                      onClick={() => {
                        setLanguage(option.code);
                        setShowLangPicker(false);
                        showNotification(`${t('settings.languageSet')} ${option.label.split(' ')[0]}`, 'success');
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-secondary ${option.code === language ? 'font-bold text-primary' : 'text-foreground'}`}
                    >
                      {option.code === language && <i className="fas fa-check mr-2 text-xs" />}{option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ),
        },
        {
          icon: 'fa-location-dot',
          label: 'Default Location',
          description: editingLocation ? '' : (location || 'Not set — tap to choose your area'),
          action: editingLocation ? (
            <div className="flex gap-2 items-center">
              <select
                autoFocus
                value={locationInput}
                onChange={e => setLocationInput(e.target.value)}
                className="px-2 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground outline-none focus:border-primary"
              >
                <option value="">Select area…</option>
                {PUNE_ZONES.map(z => <option key={z}>{z}</option>)}
              </select>
              <button onClick={saveLocation} className="text-xs font-bold text-primary">Save</button>
              <button onClick={() => setEditingLocation(false)} className="text-xs font-bold text-muted-foreground">✕</button>
            </div>
          ) : (
            <button onClick={() => { setEditingLocation(true); setLocationInput(location); }} className="text-xs font-bold text-primary hover:text-primary/70 transition-colors">
              {location ? 'Change →' : 'Set →'}
            </button>
          ),
        },
        {
          icon: 'fa-circle-info',
          label: 'About',
          description: 'CivicAssist · Version 1.0.0',
          action: (
            <button onClick={() => setShowAbout(true)} className="text-muted-foreground hover:text-foreground transition-colors">
              <i className="fas fa-chevron-right text-xs" />
            </button>
          ),
        },
      ],
    },
  ];

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <h1 className="text-xl font-bold text-foreground mb-6">{t('settings.title')}</h1>

      <div className="space-y-6">
        {sections.map(section => (
          <div key={section.title}>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">{section.title}</h2>
            <div className="glass-card divide-y divide-border">
              {section.items.map(item => (
                <div key={item.label} className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <i className={`fas ${item.icon} text-sm`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
                  </div>
                  <div className="flex-shrink-0">{item.action}</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="glass-card divide-y divide-border">
          <button onClick={logout}
            className="w-full flex items-center gap-4 p-4 hover:bg-destructive/5 transition-colors text-left">
            <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive flex-shrink-0">
              <i className="fas fa-right-from-bracket text-sm" />
            </div>
            <div>
              <p className="text-sm font-semibold text-destructive">Logout</p>
              <p className="text-xs text-muted-foreground">Sign out of your account</p>
            </div>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center gap-4 p-4 hover:bg-destructive/5 transition-colors text-left">
            <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive flex-shrink-0">
              <i className="fas fa-trash text-sm" />
            </div>
            <div>
              <p className="text-sm font-semibold text-destructive">Delete Account</p>
              <p className="text-xs text-muted-foreground">Permanently remove your account and data</p>
            </div>
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-trash text-destructive text-xl" />
            </div>
            <h3 className="text-base font-black text-foreground text-center">Delete your account?</h3>
            <p className="text-sm text-muted-foreground text-center mt-2 leading-6">This will permanently delete all your reports, comments and data. This action cannot be undone.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 rounded-xl bg-secondary text-sm font-bold text-foreground hover:bg-border transition-colors">Cancel</button>
              <button
                onClick={() => { setShowDeleteConfirm(false); logout(); }}
                className="flex-1 py-3 rounded-xl bg-destructive text-sm font-bold text-white hover:bg-destructive/80 transition-colors"
              >Delete</button>
            </div>
          </div>
        </div>
      )}

      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-shield text-blue-500 text-xl" />
            </div>
            <h3 className="text-base font-black text-foreground text-center">Two-Factor Authentication</h3>
            <p className="text-sm text-muted-foreground text-center mt-2 leading-6">
              {twoFA
                ? 'Two-factor authentication is currently enabled. Disable it to allow login with OTP only.'
                : 'Enabling 2FA adds an extra layer of security. You will be asked for both your OTP and a PIN each login.'}
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShow2FAModal(false)} className="flex-1 py-3 rounded-xl bg-secondary text-sm font-bold text-foreground hover:bg-border transition-colors">Cancel</button>
              <button
                onClick={() => {
                  setTwoFA(p => !p);
                  setShow2FAModal(false);
                  showNotification(twoFA ? '2FA disabled' : '2FA enabled — stay secure!', 'success');
                }}
                className={`flex-1 py-3 rounded-xl text-sm font-bold text-white transition-colors ${twoFA ? 'bg-destructive hover:bg-destructive/80' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {twoFA ? 'Disable 2FA' : 'Enable 2FA'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowAbout(false)}>
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-sm shadow-2xl mb-4" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--gradient-primary)' }}>
              <i className="fas fa-city text-white text-2xl" />
            </div>
            <h3 className="text-lg font-black text-foreground text-center">CivicAssist</h3>
            <p className="text-xs text-muted-foreground text-center mt-1">Version 1.0.0 · Pune, Maharashtra</p>
            <p className="text-sm text-muted-foreground text-center mt-3 leading-6">Empowering citizens to report and track local civic issues for a better community.</p>
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { label: 'Issues Tracked', value: '1,200+' },
                { label: 'Zones Covered', value: '10' },
                { label: 'Citizens Active', value: '4,800+' },
              ].map(s => (
                <div key={s.label} className="text-center p-3 rounded-xl bg-secondary">
                  <p className="text-base font-black text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setShowAbout(false)} className="w-full mt-5 py-3 rounded-xl bg-secondary text-sm font-bold text-foreground hover:bg-border transition-colors">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleSwitch({ defaultOn = false, onChange }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => { const next = !on; setOn(next); onChange?.(next); }}
      className={`w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0 relative ${on ? 'bg-primary' : 'bg-border'}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );
}
