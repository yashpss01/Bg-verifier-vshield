import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  PlayCircle,
  Terminal,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileSpreadsheet,
  Clock
} from 'lucide-react';
import { candidateService, verificationService } from '../services/api';

const CandidateDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [openLogId, setOpenLogId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchCandidateDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await candidateService.get(id);
      setCandidate(res.data);
    } catch (err) {
      console.error('Error fetching candidate logs: ', err);
      navigate('/candidates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidateDetails();
  }, [id]);

  const handleStartVerification = async () => {
    if (!id) return;
    setIsVerifying(true);
    setNotification(null);
    try {
      const res = await verificationService.start(id);
      setCandidate(res.data);
      setNotification({ message: 'Background verification process completed successfully!', type: 'success' });
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      setNotification({ 
        message: err.response?.data?.message || 'Verification pipeline encountered a network error.', 
        type: 'error' 
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsVerifying(false);
    }
  };

  const toggleLogExpansion = (logId: string) => {
    setOpenLogId(openLogId === logId ? null : logId);
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex flex-col gap-6 animate-pulse max-w-5xl mx-auto mt-4">
        <div className="h-6 w-32 bg-slate-800 rounded-lg"></div>
        <div className="h-32 bg-slate-800 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-96 bg-slate-800 rounded-2xl"></div>
          <div className="h-96 bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!candidate) return null;

  // Mask identity numbers locally for display safety
  const maskedAadhaar = candidate.aadhaarNumber 
    ? `${candidate.aadhaarNumber.slice(0, 4)}-${candidate.aadhaarNumber.slice(4, 8)}-${candidate.aadhaarNumber.slice(8, 12)}`.replace(/^\d{4}-\d{4}/, 'XXXX-XXXX')
    : 'N/A';
    
  const maskedPan = candidate.panNumber 
    ? candidate.panNumber.replace(/^[A-Z]{5}[0-9]{4}/, 'XXXXX0000') 
    : 'N/A';

  return (
    <div className="flex-1 p-8 flex flex-col gap-6 max-w-5xl mx-auto animate-fade-in-up">
      {/* Return button */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <button
          onClick={() => navigate('/candidates')}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Candidates
        </button>
      </div>

      {/* Modern Glass Alert Toast */}
      {notification && (
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
          notification.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${notification.type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
            <p className="text-xs font-semibold">{notification.message}</p>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-xs font-bold opacity-60 hover:opacity-100 transition-opacity"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Profile Showcase */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-700/10 to-transparent rounded-full"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-extrabold text-2xl text-indigo-300">
            {candidate.fullName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-100">{candidate.fullName}</h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider border ${
                candidate.status === 'VERIFIED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                candidate.status === 'PENDING' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                candidate.status === 'PARTIAL' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {candidate.status}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                ID: {candidate.id.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={handleStartVerification}
            disabled={isVerifying || candidate.status === 'VERIFIED'}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold text-xs px-4.5 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/15 disabled:opacity-50 active:scale-[0.98]"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Auditing Documents...
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4" />
                Start Verification
              </>
            )}
          </button>
          
          <button
            onClick={() => navigate(`/reports/${candidate.id}`)}
            disabled={candidate.status === 'PENDING'}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 hover:text-slate-200 font-semibold text-xs px-4.5 py-3 rounded-xl transition-all duration-200 shadow-md disabled:opacity-30 disabled:pointer-events-none active:scale-[0.98]"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Profile Split View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Personal Details Panel */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6">
          <h3 className="font-extrabold text-sm text-slate-300 uppercase tracking-wider border-b border-slate-700/40 pb-3">Personal Metadata</h3>
          
          <div className="flex flex-col gap-4 text-xs">
            <div className="flex items-start gap-3">
              <Mail className="w-4.5 h-4.5 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Email Address</span>
                <p className="text-slate-300 font-semibold mt-0.5">{candidate.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4.5 h-4.5 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Phone Number</span>
                <p className="text-slate-300 font-semibold mt-0.5">{candidate.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-4.5 h-4.5 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Date of Birth</span>
                <p className="text-slate-300 font-semibold mt-0.5">{new Date(candidate.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4.5 h-4.5 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Residential Address</span>
                <p className="text-slate-300 font-semibold leading-relaxed mt-0.5">{candidate.address}</p>
              </div>
            </div>
          </div>

          <h3 className="font-extrabold text-sm text-slate-300 uppercase tracking-wider border-b border-slate-700/40 pb-3 mt-4">Document Credentials</h3>
          
          <div className="flex flex-col gap-4 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-500 font-sans font-bold uppercase tracking-wider">Aadhaar (Masked)</span>
              <p className="text-slate-300 font-semibold mt-0.5">{maskedAadhaar}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-sans font-bold uppercase tracking-wider">PAN Card (Masked)</span>
              <p className="text-slate-300 font-semibold mt-0.5 uppercase">{maskedPan}</p>
            </div>
          </div>
        </div>

        {/* Verification timeline and Log inspectors */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Verification Status Timeline */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6">
            <h3 className="font-extrabold text-sm text-slate-300 uppercase tracking-wider border-b border-slate-700/40 pb-3">Audit Logs Timeline</h3>

            {isVerifying ? (
              <div className="relative flex flex-col gap-6 pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
                {/* Shimmer Aadhaar Check */}
                <div className="relative flex flex-col gap-3 p-5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 overflow-hidden shimmer-wrapper">
                  <div className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full bg-indigo-500 animate-ping"></div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-indigo-400">AADHAAR DEMOGRAPHIC CHECK</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold tracking-widest bg-indigo-500/10 text-indigo-300 animate-pulse">
                        AUDITING...
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">Real-time Pipeline</span>
                  </div>
                  <div className="space-y-2 mt-2">
                    <div className="h-3 w-5/6 bg-slate-800 rounded"></div>
                    <div className="h-3 w-4/6 bg-slate-800 rounded"></div>
                  </div>
                </div>

                {/* Shimmer PAN Check */}
                <div className="relative flex flex-col gap-3 p-5 rounded-xl border border-slate-800 bg-slate-950/20 overflow-hidden shimmer-wrapper" style={{ animationDelay: '0.5s' }}>
                  <div className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full bg-slate-700 animate-pulse"></div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-400">PAN REGISTRY CHECK</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold tracking-widest bg-slate-850 text-slate-500 animate-pulse">
                        PENDING...
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-600 font-medium">Queued</span>
                  </div>
                  <div className="space-y-2 mt-2">
                    <div className="h-3 w-4/5 bg-slate-850 rounded"></div>
                    <div className="h-3 w-3/5 bg-slate-850 rounded"></div>
                  </div>
                </div>
              </div>
            ) : candidate.verificationLogs.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                <Clock className="w-8 h-8 text-slate-600 animate-pulse-slow" />
                <div>
                  <p className="text-sm font-semibold text-slate-300">Audits not initiated</p>
                  <p className="text-xs text-slate-500 max-w-xs mt-0.5 mx-auto">Click the Start Verification button above to trigger the document checks pipeline.</p>
                </div>
              </div>
            ) : (
              <div className="relative flex flex-col gap-6 pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
                {candidate.verificationLogs.map((log: any) => {
                  const isSuccess = log.verificationStatus === 'SUCCESS';
                  return (
                    <div key={log.id} className="relative flex flex-col gap-2.5">
                      {/* Timeline dot */}
                      <div className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 ${
                        isSuccess ? 'bg-emerald-400 border-emerald-950' : 'bg-rose-500 border-rose-950'
                      }`}></div>
                      
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-200">{log.verificationType} CHECK</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-widest ${
                            isSuccess ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {log.verificationStatus}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {new Date(log.verifiedAt).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        {log.verificationType === 'AADHAAR' 
                          ? (isSuccess ? 'Aadhaar demographic data successfully authenticated against the central mock identity registry.' : 'Aadhaar registration records matching failed. Flagged invalid format or inactive status.')
                          : (isSuccess ? 'PAN number successfully validated and reported as active by mock income tax database.' : 'PAN registry matches failed. Inactive card code or validation error returned.')
                        }
                      </p>

                      {/* Log Json Expand Panel */}
                      <div className="mt-1 border border-slate-700/30 rounded-xl overflow-hidden bg-slate-950/20">
                        <button
                          onClick={() => toggleLogExpansion(log.id)}
                          className="w-full px-4 py-2.5 hover:bg-slate-800/40 text-left flex items-center justify-between text-[11px] font-bold text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Terminal className="w-3.5 h-3.5 text-indigo-400/80" />
                            API Transaction Payload Logs
                          </span>
                          {openLogId === log.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {openLogId === log.id && (
                          <div className="p-4 border-t border-slate-800/60 font-mono text-[10px] text-indigo-300/90 flex flex-col gap-4 max-h-[300px] overflow-y-auto">
                            <div>
                              <span className="text-[9px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Request Parameters:</span>
                              <pre className="bg-slate-950/80 p-3 rounded-lg border border-slate-850 overflow-x-auto">{JSON.stringify(log.requestPayload, null, 2)}</pre>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Response Outcome:</span>
                              <pre className="bg-slate-950/80 p-3 rounded-lg border border-slate-850 overflow-x-auto">{JSON.stringify(log.responsePayload, null, 2)}</pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetails;
