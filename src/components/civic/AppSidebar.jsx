import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function AppSidebar({ collapsed, onToggle }) {
  const { currentPage, navigateTo, currentUser, logout } = useApp();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const navItems = [
    { id: 'feed', label: t('sidebar.feed'), icon: 'fa-house' },
    { id: 'report', label: t('sidebar.report'), icon: 'fa-circle-plus' },
    { id: 'myReports', label: t('sidebar.myReports'), icon: 'fa-file-lines' },
    { id: 'helplines', label: t('sidebar.helplines'), icon: 'fa-phone' },
    { id: 'notifications', label: t('sidebar.notifications'), icon: 'fa-bell' },
    { id: 'leaderboard', label: t('sidebar.leaderboard'), icon: 'fa-trophy' },
    { id: 'settings', label: t('sidebar.settings'), icon: 'fa-gear' },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-30 bg-card border-r border-border flex flex-col transition-all duration-300 ${
        collapsed ? 'w-[68px]' : 'w-[260px]'
      }`}
    >
      <div className={`flex items-center h-16 border-b border-border flex-shrink-0 ${collapsed ? 'justify-center px-2' : 'gap-3 px-4'}`}>
        {!collapsed && (
          <>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-primary-foreground flex-shrink-0"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <i className="fas fa-city text-sm" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">CivicAssist</span>
          </>
        )}
        <button
          onClick={onToggle}
          className={`text-muted-foreground hover:text-foreground transition-colors p-1 ${collapsed ? '' : 'ml-auto'}`}
        >
          <i className={`fas ${collapsed ? 'fa-angles-right' : 'fa-angles-left'} text-xs`} />
        </button>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const active = currentPage === item.id || (item.id === 'feed' && currentPage === 'feed');
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
              style={active ? { background: 'var(--gradient-primary)' } : {}}
              title={collapsed ? item.label : undefined}
            >
              <i className={`fas ${item.icon} w-5 text-center flex-shrink-0`} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          title={collapsed ? (theme === 'dark' ? t('sidebar.lightMode') : t('sidebar.darkMode')) : undefined}
        >
          <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} w-5 text-center`} />
          {!collapsed && <span>{theme === 'dark' ? t('sidebar.lightMode') : t('sidebar.darkMode')}</span>}
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
          title={collapsed ? t('sidebar.logout') : undefined}
        >
          <i className="fas fa-right-from-bracket w-5 text-center" />
          {!collapsed && <span>{t('sidebar.logout')}</span>}
        </button>
      </div>
    </aside>
  );
}
