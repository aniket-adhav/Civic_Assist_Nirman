import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const EMERGENCY = [
  { label: 'Police', number: '100', icon: 'fa-shield-halved', color: '#3b82f6', desc: 'Law & order emergency' },
  { label: 'Fire Brigade', number: '101', icon: 'fa-fire-extinguisher', color: '#ef4444', desc: 'Fire & rescue services' },
  { label: 'Ambulance', number: '108', icon: 'fa-truck-medical', color: '#10b981', desc: 'Medical emergency' },
  { label: 'Disaster Mgmt', number: '1070', icon: 'fa-house-crack', color: '#f59e0b', desc: 'Natural disaster helpline' },
];

const CIVIC_SERVICES = [
  {
    category: 'Water & Sewage',
    icon: 'fa-droplet',
    color: '#06b6d4',
    services: [
      { label: 'BWSSB Helpline', number: '1916', desc: 'Water supply & sewage complaints' },
      { label: 'Water Board', number: '155313', desc: '24×7 water emergency' },
    ],
  },
  {
    category: 'Electricity',
    icon: 'fa-bolt',
    color: '#f59e0b',
    services: [
      { label: 'BESCOM Helpline', number: '1912', desc: 'Power outage & electrical faults' },
      { label: 'EB Emergency', number: '1800-425-1912', desc: 'Toll-free electricity helpline' },
    ],
  },
  {
    category: 'Roads & Transport',
    icon: 'fa-road',
    color: '#8b5cf6',
    services: [
      { label: 'Road Helpline', number: '1800-425-4332', desc: 'Pothole & road damage reports' },
      { label: 'Traffic Police', number: '103', desc: 'Traffic violations & accidents' },
    ],
  },
  {
    category: 'Garbage & Sanitation',
    icon: 'fa-trash',
    color: '#10b981',
    services: [
      { label: 'BBMP Helpline', number: '1533', desc: 'Garbage collection complaints' },
      { label: 'Swachh Bharat', number: '1800-11-6000', desc: 'Sanitation & cleanliness' },
    ],
  },
  {
    category: 'Public Safety',
    icon: 'fa-person-shelter',
    color: '#ec4899',
    services: [
      { label: "Women's Helpline", number: '1091', desc: 'Safety & harassment complaints' },
      { label: 'Child Helpline', number: '1098', desc: 'Child abuse & safety' },
    ],
  },
  {
    category: 'Other Municipal',
    icon: 'fa-building-columns',
    color: '#64748b',
    services: [
      { label: 'Civic Grievances', number: '1800-425-0101', desc: 'Municipal complaints & grievances' },
      { label: 'RTI Helpline', number: '1800-11-0001', desc: 'Right to Information requests' },
    ],
  },
];

function EmergencyCard({ item }) {
  return (
    <a
      href={`tel:${item.number}`}
      className="flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all hover:scale-[1.03] active:scale-95 cursor-pointer"
      style={{
        background: `${item.color}12`,
        borderColor: `${item.color}30`,
      }}
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: `${item.color}20` }}
      >
        <i className={`fas ${item.icon} text-lg`} style={{ color: item.color }} />
      </div>
      <div>
        <p className="text-foreground font-black text-base leading-none">{item.number}</p>
        <p className="text-xs font-bold text-muted-foreground mt-1">{item.label}</p>
      </div>
      <span
        className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
        style={{ background: `${item.color}20`, color: item.color }}
      >
        {item.desc}
      </span>
    </a>
  );
}

function ServiceRow({ service }) {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  const handleCopy = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(service.number).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-background/40 hover:bg-secondary/30 transition-all">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground">{service.label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{service.desc}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-sm font-black text-foreground">{service.number}</span>
        <button
          onClick={handleCopy}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90"
          style={{ background: 'rgba(99,179,237,0.1)', border: '1px solid rgba(99,179,237,0.2)' }}
          title={t('common.copyNumber')}
        >
          <i className={`fas ${copied ? 'fa-check text-emerald-400' : 'fa-copy text-blue-400'} text-xs`} />
        </button>
        <a
          href={`tel:${service.number}`}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90"
          style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
          title={t('common.callNow')}
        >
          <i className="fas fa-phone text-white text-xs" />
        </a>
      </div>
    </div>
  );
}

export default function HelplinePage() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const { t, tf } = useLanguage();

  const filtered = CIVIC_SERVICES.filter(cat =>
    search === '' ||
    cat.category.toLowerCase().includes(search.toLowerCase()) ||
    cat.services.some(s =>
      s.label.toLowerCase().includes(search.toLowerCase()) ||
      s.number.includes(search)
    )
  );

  return (
    <div className="space-y-8 animate-fadeIn max-w-2xl mx-auto">

      {/* Header */}
      <div>
        <p className="text-xs font-black tracking-[0.25em] uppercase text-blue-400/70 mb-1">{t('helplines.quickAccess')}</p>
        <h1 className="text-3xl font-black text-foreground">{t('helplines.title')}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t('helplines.subtitle')}</p>
      </div>

      {/* Emergency strip */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          <i className="fas fa-triangle-exclamation mr-1.5 text-red-400" />{t('helplines.emergencyNumbers')}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {EMERGENCY.map(item => <EmergencyCard key={item.number} item={item} />)}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <i className="fas fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
        <input
          type="text"
          placeholder={t('helplines.searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-secondary/40 text-foreground text-sm placeholder:text-muted-foreground outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
        />
      </div>

      {/* Civic services */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t('helplines.municipalServices')}</p>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <i className="fas fa-phone-slash text-3xl mb-3 block opacity-30" />
            <p className="text-sm">{tf('helplines.noFound', { search })}</p>
          </div>
        )}
        {filtered.map(cat => {
          const isOpen = expanded === cat.category;
          return (
            <div
              key={cat.category}
              className="rounded-2xl border border-border/50 overflow-hidden"
              style={{ background: 'var(--gradient-card)' }}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : cat.category)}
                className="w-full flex items-center gap-3 px-4 py-4 hover:bg-secondary/30 transition-all"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${cat.color}20` }}
                >
                  <i className={`fas ${cat.icon} text-sm`} style={{ color: cat.color }} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold text-foreground">{cat.category}</p>
                  <p className="text-xs text-muted-foreground">{cat.services.length} {cat.services.length !== 1 ? t('helplines.contacts') : t('helplines.contact')}</p>
                </div>
                <i className={`fas fa-chevron-down text-xs text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-2 border-t border-border/30 pt-3">
                  {cat.services.map(s => <ServiceRow key={s.number} service={s} />)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tip */}
      <div
        className="rounded-2xl p-4 flex gap-3 items-start"
        style={{
          background: 'linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(124,58,237,0.1) 100%)',
          border: '1px solid rgba(99,179,237,0.15)',
        }}
      >
        <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <i className="fas fa-lightbulb text-blue-400 text-xs" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{t('helplines.proTip')}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {t('helplines.tipText')}
          </p>
        </div>
      </div>

    </div>
  );
}
