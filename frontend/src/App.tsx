import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CandidateList from './pages/CandidateList';
import CandidateDetails from './pages/CandidateDetails';
import ReportView from './pages/ReportView';

const App: React.FC = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

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

  const isAuthenticated = !!token;

  return (
    <Router>
      <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex font-sans">
        {isAuthenticated ? (
          <>
            {/* Sidebar Navigation */}
            <Sidebar user={user} onLogout={handleLogout} />
            
            {/* Content Shell with sidebar margin */}
            <main className="flex-1 ml-64 min-h-screen flex flex-col relative overflow-y-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/candidates" element={<CandidateList />} />
                <Route path="/candidates/:id" element={<CandidateDetails />} />
                <Route path="/reports/:id" element={<ReportView />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </>
        ) : (
          <Routes>
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );
};

export default App;
