import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  UserPlus
} from 'lucide-react';
import { candidateService } from '../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    failed: 0,
    partial: 0,
  });
  const [recentCandidates, setRecentCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await candidateService.list();
        const candidates = res.data || [];
        
        // Calculate Statistics
        const computedStats = candidates.reduce(
          (acc: any, curr: any) => {
            acc.total += 1;
            if (curr.status === 'VERIFIED') acc.verified += 1;
            else if (curr.status === 'PENDING') acc.pending += 1;
            else if (curr.status === 'FAILED') acc.failed += 1;
            else if (curr.status === 'PARTIAL') acc.partial += 1;
            return acc;
          },
          { total: 0, verified: 0, pending: 0, failed: 0, partial: 0 }
        );
        
        setStats(computedStats);
        setRecentCandidates(candidates.slice(0, 5)); // Keep only top 5 recent candidates
      } catch (err) {
        console.error('Error fetching dashboard statistics: ', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Candidates',
      value: stats.total,
      icon: Users,
      color: 'from-indigo-500 to-purple-600',
      shadow: 'shadow-indigo-500/10',
      description: 'Profiles created by active recruiter',
    },
    {
      title: 'Verified Clearance',
      value: stats.verified,
      icon: CheckCircle2,
      color: 'from-emerald-400 to-teal-500',
      shadow: 'shadow-emerald-500/10',
      description: 'Cleared all Aadhaar and PAN checks',
    },
    {
      title: 'Pending Reviews',
      value: stats.pending,
      icon: Clock,
      color: 'from-sky-400 to-indigo-500',
      shadow: 'shadow-sky-500/10',
      description: 'Awaiting audit triggers',
    },
    {
      title: 'Failed Audits',
      value: stats.failed + stats.partial,
      icon: AlertTriangle,
      color: 'from-amber-500 to-rose-600',
      shadow: 'shadow-rose-500/10',
      description: 'Flagged or partial failures',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex flex-col gap-6 animate-pulse mt-4">
        <div className="h-8 w-48 bg-slate-800 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          <div className="lg:col-span-2 h-96 bg-slate-800 rounded-2xl"></div>
          <div className="h-96 bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 flex flex-col gap-8 max-w-7xl mx-auto animate-fade-in-up">
      {/* Welcome Banner */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-100">Recruitment Workspace</h2>
          <p className="text-slate-400 text-sm mt-1">Manage and orchestrate automated candidate background verification checks.</p>
        </div>
        <button
          onClick={() => navigate('/candidates')}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
        >
          <UserPlus className="w-4 h-4" />
          Add Candidate
        </button>
      </div>

      {/* Grid Statistics Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="glass-panel p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden group hover:border-indigo-500/30 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-700/10 to-transparent rounded-full group-hover:scale-110 transition-transform duration-500"></div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-400 tracking-wide">{card.title}</span>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center shadow-lg ${card.shadow}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-100">{card.value}</h3>
                <p className="text-[11px] text-slate-500 font-medium mt-1 leading-normal">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Panel Division */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Recent Candidates List Table */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h3 className="font-extrabold text-lg text-slate-100">Recent Audits</h3>
              <p className="text-xs text-slate-500 mt-0.5">Direct overview of last created profiles</p>
            </div>
            <button 
              onClick={() => navigate('/candidates')}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              See all candidates
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            {recentCandidates.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700/50">
                  <Users className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-300">No candidates available</p>
                  <p className="text-xs text-slate-500 mt-0.5">Add a new candidate profile to start verification audits.</p>
                </div>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                    <th className="pb-3">Candidate</th>
                    <th className="pb-3">Verification Details</th>
                    <th className="pb-3">Audit Outcome</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {recentCandidates.map((cand) => (
                    <tr key={cand.id} className="group hover:bg-slate-700/20 transition-colors">
                      <td className="py-4 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
                            {cand.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">{cand.fullName}</p>
                            <p className="text-[11px] text-slate-500">{cand.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-3">
                        <div className="flex flex-col gap-0.5 text-xs">
                          <span className="text-slate-400 font-mono text-[10px]">Aadhaar: XXXX-XXXX-{cand.aadhaarNumber.slice(-4)}</span>
                          <span className="text-slate-400 font-mono text-[10px]">PAN: XXXXX{cand.panNumber.slice(-4)}</span>
                        </div>
                      </td>
                      <td className="py-4 pr-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide ${
                          cand.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          cand.status === 'PENDING' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                          cand.status === 'PARTIAL' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {cand.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => navigate(`/candidates/${cand.id}`)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Dynamic Verifications Distribution Pie Chart */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6">
          <div>
            <h3 className="font-extrabold text-lg text-slate-100">Status Breakdown</h3>
            <p className="text-xs text-slate-500 mt-0.5">Verification status allocation ratio</p>
          </div>

          <div className="flex flex-col gap-6 items-center">
            {stats.total === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No statistics available. Populate candidates to build charts.
              </div>
            ) : (
              <>
                 {/* Custom Responsive SVG Chart */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    {/* Background Circle */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#eaeae2" strokeWidth="2.8" />
                    
                    {/* Verified Ring */}
                    <circle 
                      cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3" 
                      strokeDasharray={`${(stats.verified / stats.total) * 100} ${100 - (stats.verified / stats.total) * 100}`}
                      strokeDashoffset="0"
                    />
                    
                    {/* Pending Ring */}
                    <circle 
                      cx="18" cy="18" r="15.915" fill="none" stroke="#3b56cd" strokeWidth="3" 
                      strokeDasharray={`${(stats.pending / stats.total) * 100} ${100 - (stats.pending / stats.total) * 100}`}
                      strokeDashoffset={`${-((stats.verified / stats.total) * 100)}`}
                    />
 
                    {/* Partial Ring */}
                    <circle 
                      cx="18" cy="18" r="15.915" fill="none" stroke="#eab308" strokeWidth="3" 
                      strokeDasharray={`${(stats.partial / stats.total) * 100} ${100 - (stats.partial / stats.total) * 100}`}
                      strokeDashoffset={`${-(((stats.verified + stats.pending) / stats.total) * 100)}`}
                    />

                    {/* Failed Ring */}
                    <circle 
                      cx="18" cy="18" r="15.915" fill="none" stroke="#e64949" strokeWidth="3" 
                      strokeDasharray={`${(stats.failed / stats.total) * 100} ${100 - (stats.failed / stats.total) * 100}`}
                      strokeDashoffset={`${-(((stats.verified + stats.pending + stats.partial) / stats.total) * 100)}`}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Success</span>
                    <span className="text-xl font-extrabold text-slate-100">
                      {stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}%
                    </span>
                  </div>
                </div>

                {/* Legends Grid */}
                <div className="w-full flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      <span className="text-slate-400">Verified</span>
                    </div>
                    <span className="text-slate-200">{stats.verified} ({stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}%)</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                      <span className="text-slate-400">Pending</span>
                    </div>
                    <span className="text-slate-200">{stats.pending} ({stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0}%)</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                      <span className="text-slate-400">Partial</span>
                    </div>
                    <span className="text-slate-200">{stats.partial} ({stats.total > 0 ? Math.round((stats.partial / stats.total) * 100) : 0}%)</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                      <span className="text-slate-400">Failed</span>
                    </div>
                    <span className="text-slate-200">{stats.failed} ({stats.total > 0 ? Math.round((stats.failed / stats.total) * 100) : 0}%)</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
