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

function AppContent() {
  const { currentPage, notification } = useApp();
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
      <div className="hidden md:block">
        <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      {mobileSidebarOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="md:hidden fixed left-0 top-0 z-50">
            <AppSidebar collapsed={false} onToggle={() => setMobileSidebarOpen(false)} />
          </div>
        </>
      )}

      <main className={`min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'md:ml-[68px]' : 'md:ml-[260px]'}`}>
        <div className="md:hidden sticky top-0 z-20 h-14 bg-card/80 backdrop-blur-lg border-b border-border flex items-center px-4 gap-3">
          <button onClick={() => setMobileSidebarOpen(true)} className="text-foreground">
            <i className="fas fa-bars" />
          </button>
          <span className="font-bold gradient-text">CivicAssist</span>
        </div>
        <div className="p-4 md:p-8">
          {renderPage()}
        </div>
      </main>

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
