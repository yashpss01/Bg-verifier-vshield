import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Printer, 
  Download,
  ShieldCheck, 
  ShieldAlert, 
  BookmarkCheck,
  Award
} from 'lucide-react';
import { reportService } from '../services/api';

const ReportView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await reportService.getJson(id);
        setReport(res.data);
      } catch (err) {
        console.error('Failed to retrieve report data: ', err);
        navigate(`/candidates/${id}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handlePrintRedirect = () => {
    if (!id) return;
    // Open the backend print endpoint in a new tab
    window.open(reportService.getDownloadUrl(id), '_blank');
  };

  const handleDownloadPDF = () => {
    if (!id) return;
    window.open(`${reportService.getDownloadUrl(id)}&format=pdf`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex flex-col gap-6 animate-pulse max-w-3xl mx-auto mt-4">
        <div className="h-6 w-32 bg-slate-800 rounded-lg"></div>
        <div className="h-[500px] bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  if (!report) return null;

  const isVerified = report.overallStatus === 'VERIFIED';
  const isPartial = report.overallStatus === 'PARTIAL';
  const isFailed = report.overallStatus === 'FAILED';

  return (
    <div className="flex-1 p-8 flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Back to Candidate details */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/candidates/${id}`)}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Details
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-emerald-600/10 active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>

          <button
            onClick={handlePrintRedirect}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-indigo-600/10 active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* High-Fidelity Professional Sheet */}
      <div className="glass-panel p-10 rounded-2xl relative overflow-hidden flex flex-col gap-8 shadow-2xl border-slate-700/60">
        <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-full"></div>
        
        {/* Certificate Watermark Header */}
        <div className="flex justify-between items-center border-b border-slate-700/60 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight leading-none">VShield Verification</h2>
              <span className="text-[9px] text-emerald-400 font-bold tracking-widest uppercase mt-1 block">Credential Integrity Audit</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Report Serial Number</span>
            <span className="text-xs font-mono font-semibold text-slate-400 mt-1 block">{report.digitalSignature}</span>
          </div>
        </div>

        {/* Audit Status Outcome Display */}
        <div className={`p-6 rounded-xl border flex items-start gap-4 ${
          isVerified ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
          isPartial ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' :
          'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-md ${
            isVerified ? 'bg-emerald-500/20' :
            isPartial ? 'bg-amber-500/20' :
            'bg-rose-500/20'
          }`}>
            {isVerified ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <h4 className="font-extrabold text-sm uppercase tracking-wide">Overall Audit Status: {report.overallStatus}</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {isVerified && 'The verification database has successfully cleared identity checks on both Aadhaar and PAN credentials. Background clearance approved.'}
              {isPartial && 'Verification completed with partial success. Aadhaar or PAN credential failed to validate against registry authorities.'}
              {isFailed && 'Critical background failure reported. All verified documents failed biometric and registration matching audits.'}
            </p>
          </div>
        </div>

        {/* Candidate Metadata Summary */}
        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-xs text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Candidate Profile</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Full Legal Name</span>
              <span className="text-slate-200 font-bold mt-1 block">{report.candidateName}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Email Address</span>
              <span className="text-slate-200 font-bold mt-1 block">{report.email}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Phone Number</span>
              <span className="text-slate-200 font-bold mt-1 block">{report.phone}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Date of Birth</span>
              <span className="text-slate-200 font-bold mt-1 block">{report.dob}</span>
            </div>
          </div>

          <div className="text-xs mt-1">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Residential Address</span>
            <span className="text-slate-200 font-bold leading-relaxed mt-1 block">{report.address}</span>
          </div>
        </div>

        {/* Document Audit Metrics */}
        <div className="flex flex-col gap-4">
          <h4 className="font-bold text-xs text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Document Authentications</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl border border-slate-800/80 bg-slate-950/20 flex flex-col gap-3">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Aadhaar Verification ({report.maskedAadhaar})</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2.5 h-2.5 rounded-full ${report.aadhaarVerification === 'SUCCESS' ? 'bg-emerald-400 shadow-lg shadow-emerald-500/20' : 'bg-rose-500'}`}></span>
                <span className="text-sm font-extrabold text-slate-200">{report.aadhaarVerification === 'SUCCESS' ? 'AUTHENTICATED' : 'FAILED'}</span>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-800/80 bg-slate-950/20 flex flex-col gap-3">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">PAN Card Verification ({report.maskedPan})</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2.5 h-2.5 rounded-full ${report.panVerification === 'SUCCESS' ? 'bg-emerald-400 shadow-lg shadow-emerald-500/20' : 'bg-rose-500'}`}></span>
                <span className="text-sm font-extrabold text-slate-200">{report.panVerification === 'SUCCESS' ? 'AUTHENTICATED' : 'FAILED'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Certification Signoff footer */}
        <div className="border-t border-slate-800 pt-6 mt-4 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Verification Authority</span>
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <BookmarkCheck className="w-4 h-4 text-emerald-400" />
              <span>Certified by {report.verifiedBy}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Audit Date: {report.generatedOn}</span>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-2 text-center sm:text-right">
            {/* Signature Placeholder */}
            <div className="w-48 border-b border-slate-700/60 h-10 relative flex items-center justify-center">
              <span className="font-sans italic text-slate-400 text-sm tracking-widest select-none opacity-40 font-semibold">{report.verifiedBy}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Authorized Signature</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
