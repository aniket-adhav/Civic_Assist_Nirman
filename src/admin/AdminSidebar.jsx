import { useApp } from '../context/AppContext';

const NAV = [
  { id: 'dashboard', icon: 'fa-gauge', label: 'Dashboard' },
  { id: 'complaints', icon: 'fa-clipboard-list', label: 'Complaints' },
  { id: 'analysis', icon: 'fa-chart-line', label: 'Analysis' },
  { id: 'admin', icon: 'fa-user-shield', label: 'Admin' },
];

export default function AdminSidebar({ activeTab, setActiveTab, dark, onToggleDark }) {
  const { navigateTo } = useApp();

  const bg = dark ? 'bg-[#0f172a] border-slate-700' : 'bg-white border-slate-100';
  const activeBtn = 'bg-blue-600 text-white shadow-sm shadow-blue-200';
  const inactiveBtn = dark
    ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50';
  const activeIcon = 'bg-white/20';
  const inactiveIcon = dark ? 'bg-slate-800' : 'bg-slate-100';

  return (
    <aside className={`hidden lg:flex flex-col fixed left-0 top-0 h-full w-[240px] border-r z-30 shadow-sm transition-colors duration-300 ${bg}`}>
      <div className={`flex items-center gap-3 px-6 py-5 border-b ${dark ? 'border-slate-700' : 'border-slate-100'}`}>
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-200">
          <i className="fas fa-shield-halved text-white text-sm" />
        </div>
        <div>
          <div className={`text-sm font-black leading-tight ${dark ? 'text-white' : 'text-slate-900'}`}>CivicAssist</div>
          <div className="text-[10px] text-blue-500 font-bold tracking-widest uppercase leading-tight">Admin Portal</div>
        </div>
      </div>

      <div className="px-3 py-2 mt-1">
        <p className={`text-[9px] font-black uppercase tracking-widest px-3 mb-1 ${dark ? 'text-slate-600' : 'text-slate-300'}`}>Main Menu</p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
              activeTab === item.id ? activeBtn : inactiveBtn
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
              activeTab === item.id ? activeIcon : inactiveIcon
            }`}>
              <i className={`fas ${item.icon} text-sm`} />
            </div>
            <span className="text-sm font-semibold">{item.label}</span>
            {activeTab === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
          </button>
        ))}
      </nav>

      <div className={`px-3 py-2 mt-1 border-t ${dark ? 'border-slate-700' : 'border-slate-100'}`}>
        <p className={`text-[9px] font-black uppercase tracking-widest px-3 mb-1 mt-2 ${dark ? 'text-slate-600' : 'text-slate-300'}`}>System</p>
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
            activeTab === 'settings' ? activeBtn : inactiveBtn
          }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${activeTab === 'settings' ? activeIcon : inactiveIcon}`}>
            <i className="fas fa-gear text-sm" />
          </div>
          <span className="text-sm font-semibold">Settings</span>
          {activeTab === 'settings' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
        </button>
        <button
          onClick={onToggleDark}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${inactiveBtn}`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${dark ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <i className={`fas ${dark ? 'fa-sun text-yellow-400' : 'fa-moon text-slate-500'} text-sm`} />
          </div>
          <span className="text-sm font-semibold">{dark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button
          onClick={() => navigateTo('login')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${dark ? 'text-red-400 hover:bg-red-900/30' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${inactiveIcon}`}>
            <i className="fas fa-right-from-bracket text-sm" />
          </div>
          <span className="text-sm font-semibold">Sign Out</span>
        </button>
      </div>

      <div className={`px-5 py-4 border-t ${dark ? 'border-slate-700' : 'border-slate-50'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
            <i className="fas fa-user-tie text-white text-xs" />
          </div>
          <div className="overflow-hidden flex-1">
            <div className={`text-xs font-bold leading-tight truncate ${dark ? 'text-slate-200' : 'text-slate-800'}`}>Admin Officer</div>
            <div className={`text-[10px] font-medium truncate ${dark ? 'text-slate-500' : 'text-slate-400'}`}>admin@civicassist.gov.in</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}
