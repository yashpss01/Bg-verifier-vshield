import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CandidateList from './pages/CandidateList';
import CandidateDetails from './pages/CandidateDetails';
import ReportView from './pages/ReportView';
import Landing from './pages/Landing';

const AppContent: React.FC<{
  user: any;
  token: string | null;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  handleLoginSuccess: (userData: any, userToken: string) => void;
  handleLogout: () => void;
}> = ({ user, token, sidebarOpen, setSidebarOpen, handleLoginSuccess, handleLogout }) => {
  const location = useLocation();
  const isAuthenticated = !!token;
  const isLandingPage = location.pathname === '/';

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If user is authenticated and is on the landing page, render it cleanly
  if (isLandingPage) {
    return <Landing />;
  }

  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex font-sans flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <Sidebar 
        user={user} 
        onLogout={handleLogout} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Mobile Header Bar */}
      <header className="flex items-center justify-between px-6 py-4 glass-panel border-b border-slate-700 lg:hidden sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center shadow-md">
            <span className="font-extrabold text-sm text-white">V</span>
          </div>
          <h1 className="font-extrabold text-sm tracking-wide text-slate-100">VShield Verifier</h1>
        </div>
        
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-900/50 text-slate-400 hover:text-slate-100 transition-all active:scale-[0.98]"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Translucent Backdrop Blur Overlay when mobile drawer is open */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-[#0c0c09]/30 backdrop-blur-sm z-20 lg:hidden transition-opacity duration-300 animate-fade-in"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        />
      )}
      
      {/* Content Shell with sidebar responsive margin */}
      <main className="flex-1 ml-0 lg:ml-64 min-h-screen flex flex-col relative overflow-y-auto">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/candidates" element={<CandidateList />} />
          <Route path="/candidates/:id" element={<CandidateDetails />} />
          <Route path="/reports/:id" element={<ReportView />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Rehydrate session from localStorage
    const savedUser = localStorage.getItem('vshield_user');
    const savedToken = localStorage.getItem('vshield_token');
    
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (err) {
        localStorage.removeItem('vshield_user');
        localStorage.removeItem('vshield_token');
      }
    }
    setIsInitializing(false);
  }, []);

  const handleLoginSuccess = (userData: any, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('vshield_user', JSON.stringify(userData));
    localStorage.setItem('vshield_token', userToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('vshield_user');
    localStorage.removeItem('vshield_token');
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-500 animate-spin flex items-center justify-center shadow-lg shadow-indigo-500/25"></div>
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-2">Loading Workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AppContent 
        user={user}
        token={token}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleLoginSuccess={handleLoginSuccess}
        handleLogout={handleLogout}
      />
    </Router>
  );
};

export default App;

