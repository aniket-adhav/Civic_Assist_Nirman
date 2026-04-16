import { useEffect, useRef, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

import LoginPage from './user/LoginPage';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';

import CommunityFeed from './screens/CommunityFeed';
import ReportIssue from './screens/ReportIssue';
import MyReports from './screens/MyReports';
import HelplinePage from './screens/HelplinePage';
import NotificationsPage from './screens/NotificationsPage';
import LeaderboardPage from './screens/LeaderboardPage';
import SettingsPage from './screens/SettingsPage';
import IssueDetail from './screens/IssueDetail';
import AppSidebar from './components/civic/AppSidebar';
import Notification from './components/civic/Notification';
import AppSkeleton from './components/civic/AppSkeleton';
import ChatBot from './components/civic/ChatBot';

const BOTTOM_NAV = [
  { id: 'feed',          icon: 'fa-house',       label: 'Feed' },
  { id: 'report',        icon: 'fa-circle-plus',  label: 'Report' },
  { id: 'myReports',     icon: 'fa-file-lines',   label: 'My Reports' },
  { id: 'notifications', icon: 'fa-bell',         label: 'Alerts' },
  { id: 'leaderboard',   icon: 'fa-trophy',       label: 'Ranks' },
];

function MobileBottomNav({ currentPage, onNavigate }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-xl border-t border-border flex items-stretch safe-bottom">
      {BOTTOM_NAV.map(item => {
        const active = currentPage === item.id || (item.id === 'feed' && currentPage === 'feed');
        const isReport = item.id === 'report';
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative transition-all active:scale-95 ${
              active ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {isReport ? (
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg mb-0.5 -mt-5"
                style={{ background: 'var(--gradient-primary)', boxShadow: '0 4px 16px rgba(59,130,246,0.4)' }}
              >
                <i className={`fas ${item.icon} text-base`} />
              </div>
            ) : (
              <>
                <i className={`fas ${item.icon} text-lg`} />
                <span className="text-[10px] font-semibold leading-none">{item.label}</span>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
                )}
              </>
            )}
            {isReport && (
              <span className="text-[10px] font-semibold text-muted-foreground leading-none">Report</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

function AppContent() {
  const { currentPage, notification, navigateTo } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const hasMounted = useRef(false);

  useEffect(() => {
    setPageLoading(true);
    const delay = hasMounted.current ? 320 : 850;
    const timer = window.setTimeout(() => {
      setPageLoading(false);
      hasMounted.current = true;
    }, delay);
    return () => window.clearTimeout(timer);
  }, [currentPage]);

  if (pageLoading) {
    return <AppSkeleton page={currentPage} />;
  }

  if (currentPage === 'login') return <LoginPage />;
  if (currentPage === 'adminLogin') return <AdminLogin />;
  if (currentPage === 'adminDashboard') return <AdminDashboard />;

  const renderPage = () => {
    switch (currentPage) {
      case 'feed': return <CommunityFeed />;
      case 'report': return <ReportIssue />;
      case 'myReports': return <MyReports />;
      case 'helplines': return <HelplinePage />;
      case 'issueDetail': return <IssueDetail />;
      case 'notifications': return <NotificationsPage />;
      case 'leaderboard': return <LeaderboardPage />;
      case 'settings': return <SettingsPage />;
      default: return <CommunityFeed />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileSidebarOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="md:hidden fixed left-0 top-0 z-50">
            <AppSidebar collapsed={false} onToggle={() => setMobileSidebarOpen(false)} />
          </div>
        </>
      )}

      <main className={`min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'md:ml-[68px]' : 'md:ml-[260px]'}`}>
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-20 h-14 bg-card/90 backdrop-blur-lg border-b border-border flex items-center px-4 gap-3">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-foreground hover:bg-secondary transition-colors active:scale-90"
          >
            <i className="fas fa-bars text-sm" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <i className="fas fa-city text-white text-xs" />
            </div>
            <span className="font-bold text-base gradient-text">CivicAssist</span>
          </div>
          <button
            onClick={() => navigateTo('notifications')}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors active:scale-90 relative"
          >
            <i className="fas fa-bell text-sm" />
          </button>
          <button
            onClick={() => navigateTo('settings')}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors active:scale-90"
          >
            <i className="fas fa-gear text-sm" />
          </button>
        </div>

        {/* Page content — add bottom padding on mobile to clear the bottom nav */}
        <div className="p-4 md:p-8 pb-24 md:pb-8">
          {renderPage()}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileBottomNav currentPage={currentPage} onNavigate={navigateTo} />

      {notification && <Notification message={notification.message} type={notification.type} />}
      <ChatBot />
    </div>
  );
}

const App = () => (
  <ThemeProvider>
    <LanguageProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </LanguageProvider>
  </ThemeProvider>
);

export default App;
