import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, Users, LogOut, X } from 'lucide-react';

interface SidebarProps {
  user: {
    name: string;
    email: string;
  } | null;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout, isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onClose();
    onLogout();
    navigate('/login');
  };

  return (
    <aside className={`w-64 h-screen fixed left-0 top-0 glass-panel border-r border-slate-700/50 flex flex-col justify-between p-6 z-30 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex flex-col gap-8">
        {/* Brand Header & Mobile Close */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight text-white">VShield</h1>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-widest uppercase">Verifier</span>
            </div>
          </div>

          {/* Close Menu Button on Mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors lg:hidden"
          >
            <X className="w-5.5 h-5.5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          <NavLink
            to="/"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-950/40 border-l-4 border-indigo-400'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </NavLink>
          
          <NavLink
            to="/candidates"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-950/40 border-l-4 border-indigo-400'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
              }`
            }
          >
            <Users className="w-4 h-4" />
            Candidates
          </NavLink>
        </nav>
      </div>

      {/* User Session Info / Logout */}
      <div className="flex flex-col gap-4 border-t border-slate-700/40 pt-4">
        {user && (
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center font-bold text-sm text-indigo-300">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

