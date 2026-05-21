import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, CheckCircle2, FileCheck2, Cpu, Lock, Landmark, Search } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('vshield_token');
    setIsLoggedIn(!!token);

    // Dynamic timeline animation loop for the interactive dashboard mockup
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const handleCTA = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-900 text-slate-100 relative overflow-x-hidden animate-fade-in-up">
      {/* Decorative top-right organic background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full filter blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-[40%] left-[-100px] w-[400px] h-[400px] bg-emerald-500/3 rounded-full filter blur-[100px] pointer-events-none z-0"></div>

      {/* Floating Translucent Navigation Bar */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center shadow-md shadow-indigo-500/10">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-tight tracking-tight text-slate-100">VShield</h1>
            <span className="text-[10px] text-indigo-500 font-bold tracking-widest uppercase">Verifier</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400">
          <a href="#features" className="hover:text-slate-100 transition-colors">Features</a>
          <a href="#process" className="hover:text-slate-100 transition-colors">How it Works</a>
          <a href="#security" className="hover:text-slate-100 transition-colors">Security</a>
        </div>

        <button
          onClick={handleCTA}
          className="flex items-center gap-2 bg-slate-800 border border-slate-700 hover:border-indigo-500/40 text-slate-100 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98]"
        >
          {isLoggedIn ? 'Go to Console' : 'Sign In'}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </nav>

      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10 relative">
        <div className="lg:col-span-6 flex flex-col gap-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
            <span className="text-[9px] font-extrabold text-indigo-400 tracking-wider uppercase">Institutional Trust Layer</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-slate-100">
            The Modern Trust <br />
            Infrastructure for <br />
            <span className="text-gradient">Background Verification</span>
          </h2>

          <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-lg">
            Deploy institutional-grade identity, criminal registry, and professional record checks with automated speed, cryptographic integrity, and absolute candidate privacy.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-2">
            <button
              onClick={handleCTA}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all shadow-md shadow-indigo-500/10 hover:shadow-lg active:scale-[0.98]"
            >
              Start Verifying Free
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#process"
              className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 hover:bg-slate-800 text-slate-200 font-bold text-sm px-6 py-3.5 rounded-xl transition-all active:scale-[0.98]"
            >
              Explore Sandbox
            </a>
          </div>
        </div>

        {/* Dynamic Interactive Verification Preview Widget */}
        <div className="lg:col-span-6 flex items-center justify-center relative">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-white border border-slate-700/70 shadow-2xl shadow-slate-300/10 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-500"></div>
            
            {/* Header info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-sm text-slate-100 shadow-sm shadow-slate-200/50">
                  AR
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-100">Aditi Roy</h4>
                  <span className="text-[10px] text-slate-500 font-medium">Software Engineer • Credentials Queue</span>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-widest uppercase transition-all duration-300 ${
                activeStep === 3 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25' 
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 animate-pulse'
              }`}>
                {activeStep === 3 ? 'VERIFIED' : 'VERIFYING...'}
              </span>
            </div>

            {/* Check progress bar */}
            <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden mb-6">
              <div 
                className="h-full bg-indigo-500 transition-all duration-700 ease-out"
                style={{ width: `${(activeStep + 1) * 25}%` }}
              ></div>
            </div>

            {/* Simulated verification step logs */}
            <div className="flex flex-col gap-3">
              {/* Step 1: Aadhaar Check */}
              <div className={`p-3.5 rounded-xl border transition-all duration-300 ${
                activeStep >= 0 ? 'bg-slate-900 border-slate-700' : 'bg-slate-950 border-slate-700/50 opacity-40'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${activeStep === 0 ? 'bg-indigo-500 animate-ping' : 'bg-indigo-400'}`}></div>
                    <span className="text-xs font-bold text-slate-100">AADHAAR BIOMETRIC REGISTRY MATCH</span>
                  </div>
                  {activeStep > 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <span className="text-[9px] font-extrabold text-indigo-400 animate-pulse">CHECKING</span>
                  )}
                </div>
              </div>

              {/* Step 2: PAN Check */}
              <div className={`p-3.5 rounded-xl border transition-all duration-300 ${
                activeStep >= 1 ? 'bg-slate-900 border-slate-700' : 'bg-slate-950 border-slate-700/50 opacity-40'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${activeStep === 1 ? 'bg-indigo-500 animate-ping' : activeStep > 1 ? 'bg-indigo-400' : 'bg-slate-500'}`}></div>
                    <span className="text-xs font-bold text-slate-100">INCOME TAX PAN REGISTRY RECORD</span>
                  </div>
                  {activeStep > 1 ? (
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  ) : activeStep === 1 ? (
                    <span className="text-[9px] font-extrabold text-indigo-400 animate-pulse">CHECKING</span>
                  ) : (
                    <span className="text-[9px] font-bold text-slate-500">PENDING</span>
                  )}
                </div>
              </div>

              {/* Step 3: Criminal Record Check */}
              <div className={`p-3.5 rounded-xl border transition-all duration-300 ${
                activeStep >= 2 ? 'bg-slate-900 border-slate-700' : 'bg-slate-950 border-slate-700/50 opacity-40'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${activeStep === 2 ? 'bg-indigo-500 animate-ping' : activeStep > 2 ? 'bg-indigo-400' : 'bg-slate-500'}`}></div>
                    <span className="text-xs font-bold text-slate-100">NATIONAL CRIMINAL DATABASE SCAN</span>
                  </div>
                  {activeStep > 2 ? (
                    <span className="flex items-center gap-1 text-[9px] font-extrabold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      CLEAN RECORD
                    </span>
                  ) : activeStep === 2 ? (
                    <span className="text-[9px] font-extrabold text-indigo-400 animate-pulse">CHECKING</span>
                  ) : (
                    <span className="text-[9px] font-bold text-slate-500">PENDING</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full border-t border-slate-700 py-24 bg-slate-900/40 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center flex flex-col items-center gap-12">
          <div className="flex flex-col gap-3 max-w-xl">
            <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Why VShield?</span>
            <h3 className="text-3xl font-black tracking-tight text-slate-100">Boutique Trust Ledger Integration</h3>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              We leverage clean API-driven database checks with maximum security protocols to ensure candidate integrity is preserved transparently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-700/60 shadow-md shadow-slate-200/50 flex flex-col gap-4 text-left group hover:-translate-y-1 hover:border-indigo-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shadow-sm shadow-indigo-500/5 mb-2">
                <Cpu className="w-5.5 h-5.5" />
              </div>
              <h4 className="font-extrabold text-base text-slate-100">Atomic Speeds</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect directly to Aadhaar biometric logs and PAN tax registries. No long lead times or manually scanned paperwork delays.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-700/60 shadow-md shadow-slate-200/50 flex flex-col gap-4 text-left group hover:-translate-y-1 hover:border-indigo-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shadow-sm shadow-indigo-500/5 mb-2">
                <Lock className="w-5.5 h-5.5" />
              </div>
              <h4 className="font-extrabold text-base text-slate-100">Zero-Knowledge Sovereignty</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Queries are securely verified at state databases without persisting personal demographic files or exposing sensitive documents.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-700/60 shadow-md shadow-slate-200/50 flex flex-col gap-4 text-left group hover:-translate-y-1 hover:border-indigo-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shadow-sm shadow-indigo-500/5 mb-2">
                <FileCheck2 className="w-5.5 h-5.5" />
              </div>
              <h4 className="font-extrabold text-base text-slate-100">Immutable Reports</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Each verified credential record is locked, timestamped, and cryptographically signed to generate audit-ready verification passcodes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Verification Workflow Section */}
      <section id="process" className="w-full border-t border-slate-700 py-24 relative z-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center gap-16 text-center">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Process Blueprint</span>
            <h3 className="text-3xl font-black tracking-tight text-slate-100">How VShield Secures Background Checks</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-4 text-center group">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center font-black text-lg text-indigo-400 group-hover:border-indigo-500/40 shadow-sm transition-all duration-300">
                01
              </div>
              <h4 className="font-extrabold text-base text-slate-100 mt-2">Submit Credentials</h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[240px]">
                Input basic candidate demographics, tax identifiers, or court reference codes into the VShield Console.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-4 text-center group">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center font-black text-lg text-indigo-400 group-hover:border-indigo-500/40 shadow-sm transition-all duration-300">
                02
              </div>
              <h4 className="font-extrabold text-base text-slate-100 mt-2">Live Verification Run</h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[240px]">
                Watch Aadhaar registries, tax offices, and federal criminal databases return cryptographically signed responses in real-time.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-4 text-center group">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center font-black text-lg text-indigo-400 group-hover:border-indigo-500/40 shadow-sm transition-all duration-300">
                03
              </div>
              <h4 className="font-extrabold text-base text-slate-100 mt-2">Signed Audit Ledger</h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[240px]">
                Download a tamper-proof PDF verification record secure with a cryptographic stamp to protect candidate profiles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Architecture Section */}
      <section id="security" className="w-full border-t border-slate-700 py-24 bg-slate-900/30 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 flex flex-col gap-6 text-left">
            <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Enterprise Architecture</span>
            <h3 className="text-3xl font-black tracking-tight text-slate-100">
              Government-Grade Cryptography & Decoupled Integrity
            </h3>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              We separate identity storage and credential checks using absolute end-to-end tokenization. Candidate data resides entirely within sovereign endpoints and remains fully encrypted in transit.
            </p>
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-start gap-3">
                <Landmark className="w-5 h-5 text-indigo-400 mt-0.5" />
                <div>
                  <h5 className="font-bold text-xs text-slate-100">Direct API Node Routing</h5>
                  <p className="text-[11px] text-slate-500">Bypasses middle-man brokers by issuing directly authenticated handshake tokens.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Search className="w-5 h-5 text-indigo-400 mt-0.5" />
                <div>
                  <h5 className="font-bold text-xs text-slate-100">Comprehensive Compliance Logs</h5>
                  <p className="text-[11px] text-slate-500">Every verification request maps strictly to recruiter authorization keys, fully audited.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex justify-center">
            {/* Visual network graph card mockup */}
            <div className="w-full max-w-xl p-8 rounded-2xl bg-white border border-slate-700/60 shadow-lg shadow-slate-200/50 flex flex-col gap-6 font-mono text-[10px]">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <span className="text-slate-400">CRYPTOGRAPHIC SANDBOX TERMINAL</span>
                <span className="text-indigo-400 font-extrabold">SECURE HANDSHAKE ACTIVE</span>
              </div>
              <div className="flex flex-col gap-2.5 text-slate-400">
                <p><span className="text-slate-500">[09:12:44]</span> <span className="text-emerald-400">INFO</span> Initializing Handshake with Government Demographic API...</p>
                <p><span className="text-slate-500">[09:12:45]</span> <span className="text-indigo-400">AUTH</span> Recruiter token validated (SHA-256 Signature Match)</p>
                <p><span className="text-slate-500">[09:12:45]</span> <span className="text-emerald-400">INFO</span> Request token tokenized: <span className="text-slate-200">vsh_a41b2c...9e3f</span></p>
                <p><span className="text-slate-500">[09:12:46]</span> <span className="text-indigo-400">CONN</span> Biometric Registry node status: <span className="text-indigo-400">SUCCESS</span></p>
                <p><span className="text-slate-500">[09:12:46]</span> <span className="text-emerald-400">INFO</span> Fetching PAN validation record...</p>
                <p><span className="text-slate-500">[09:12:47]</span> <span className="text-indigo-400">SUCCESS</span> Verification Passport generated dynamically with Signature Stamp</p>
              </div>
              <div className="h-[2px] bg-slate-700/60"></div>
              <div className="flex items-center justify-between text-slate-500 text-[9px] font-bold">
                <span>ESTABLISHED TIMEOUT: 0.2ms</span>
                <span>STATUS CODE: 200 OK</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="w-full border-t border-slate-700 py-20 bg-slate-900 relative z-10 text-center">
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center gap-6">
          <h3 className="text-3xl font-black tracking-tight text-slate-100">
            Ready to secure your hiring workflow?
          </h3>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-md">
            Create a workspace sandbox, add a candidate, and trigger direct cryptographic background audits immediately.
          </p>
          <button
            onClick={handleCTA}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-extrabold text-sm px-7 py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/10 active:scale-[0.98] mt-2"
          >
            Launch Console Console
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-700 py-8 bg-slate-900 relative z-10 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} VShield Technology Labs. All sovereign rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-slate-400">Terms of Audit</a>
            <a href="#security" className="hover:text-slate-400">Privacy Safeguards</a>
            <a href="#process" className="hover:text-slate-400">Sandbox API Specs</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
