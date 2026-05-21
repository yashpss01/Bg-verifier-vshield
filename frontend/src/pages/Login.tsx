import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Key, Mail, User, AlertCircle, Loader2 } from 'lucide-react';
import { authService } from '../services/api';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

interface LoginProps {
  onLoginSuccess: (user: any, token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLoginForm,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: localStorage.getItem('vshield_remember_email') || '',
      password: '',
      rememberMe: !!localStorage.getItem('vshield_remember_email'),
    }
  });

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    reset: resetRegisterForm,
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onLogin = async (data: any) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await authService.login({
        email: data.email,
        password: data.password,
      });
      
      if (data.rememberMe) {
        localStorage.setItem('vshield_remember_email', data.email);
      } else {
        localStorage.removeItem('vshield_remember_email');
      }

      onLoginSuccess(res.data.user, res.data.token);
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegister = async (data: any) => {
    setIsLoading(true);
    setApiError(null);
    try {
      await authService.register(data);
      // Automatically switch to login on success
      setIsLogin(true);
      resetLoginForm({ email: data.email, password: '' });
      setApiError('Registration successful! Please login with your credentials.');
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Registration failed. Email might already be taken.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4">
      {/* Background design elements */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-indigo-500/10 glow-bubble rounded-full"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-emerald-500/5 glow-bubble rounded-full" style={{ animationDelay: '-5s' }}></div>

      <div className="w-full max-w-md glass-panel rounded-2xl overflow-hidden p-8 relative z-10">
        <div className="flex flex-col items-center gap-3 mb-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-100 font-sans">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {isLogin
                ? 'Sign in to access background verification portal'
                : 'Register recruiter administrator credentials'}
            </p>
          </div>
        </div>

        {apiError && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 mb-6 ${
            apiError.includes('successful') 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs font-medium leading-relaxed">{apiError}</p>
          </div>
        )}

        {isLogin ? (
          /* Login Form */
          <form onSubmit={handleLoginSubmit(onLogin)} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-4 pointer-events-none">
                  <Mail className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@vshield.com"
                  className="w-full glass-input pl-11 text-sm"
                  {...loginRegister('email')}
                />
              </div>
              {loginErrors.email && (
                <span className="text-[11px] text-red-400 font-semibold">{loginErrors.email.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-4 pointer-events-none">
                  <Key className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full glass-input pl-11 text-sm"
                  {...loginRegister('password')}
                />
              </div>
              {loginErrors.password && (
                <span className="text-[11px] text-red-400 font-semibold">{loginErrors.password.message}</span>
              )}
            </div>

            <div className="flex items-center justify-between mt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950/40 text-indigo-600 focus:ring-indigo-500/50 focus:ring-offset-0 focus:ring-1"
                  {...loginRegister('rememberMe')}
                />
                <span className="text-xs text-slate-400 font-medium">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit(onRegister)} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-4 pointer-events-none">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="Admin Recruiter"
                  className="w-full glass-input pl-11 text-sm"
                  {...registerRegister('name')}
                />
              </div>
              {registerErrors.name && (
                <span className="text-[11px] text-red-400 font-semibold">{registerErrors.name.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="reg-email" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-4 pointer-events-none">
                  <Mail className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  id="reg-email"
                  type="email"
                  placeholder="recruiter@vshield.com"
                  className="w-full glass-input pl-11 text-sm"
                  {...registerRegister('email')}
                />
              </div>
              {registerErrors.email && (
                <span className="text-[11px] text-red-400 font-semibold">{registerErrors.email.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="reg-password" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-4 h-4 pointer-events-none">
                  <Key className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  id="reg-password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full glass-input pl-11 text-sm"
                  {...registerRegister('password')}
                />
              </div>
              {registerErrors.password && (
                <span className="text-[11px] text-red-400 font-semibold">{registerErrors.password.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Recruiter Admin'
              )}
            </button>
          </form>
        )}

        <div className="mt-8 border-t border-slate-700/40 pt-6 text-center">
          <p className="text-xs text-slate-400 font-medium">
            {isLogin ? "Don't have an administrator account?" : 'Already have a recruiter account?'}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setApiError(null);
                resetLoginForm();
                resetRegisterForm();
              }}
              className="ml-1.5 font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {isLogin ? 'Register now' : 'Sign in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
