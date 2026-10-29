import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Info,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { store } from '../services/store';
import { Profile } from '../types';

interface AdminLoginProps {
  onLoginSuccess: (adminProfile: Profile) => void;
  onSwitchToStudentView: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onSwitchToStudentView,
}) => {
  const [email, setEmail] = useState('david.chen@unisync.edu');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      const profiles = store.getProfiles();
      const user = profiles.find((p) => p.email.toLowerCase() === email.trim().toLowerCase());

      if (!user) {
        setErrorMessage('No staff account found with this email address.');
        return;
      }

      if (user.is_suspended) {
        setErrorMessage('This administrative account has been suspended. Please contact the security team.');
        return;
      }

      if (user.role !== 'admin' && user.role !== 'developer') {
        setErrorMessage('Access Denied: Student accounts cannot access the administrative dashboard. Please use the UniSync Student Mobile Application.');
        return;
      }

      onLoginSuccess(user);
    }, 450);
  };

  const handleQuickFill = (role: 'developer' | 'admin' | 'student') => {
    const profiles = store.getProfiles();
    const found = profiles.find((p) => p.role === role);
    if (found) {
      setEmail(found.email);
      setPassword('password123');
      setErrorMessage(null);
    }
  };

  return (
    <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-900 text-slate-100 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand US Logo */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/20 mb-4 border border-blue-400/30">
          US
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          UniSync Administration
        </h2>
        <p className="mt-1.5 text-xs text-slate-400">
          Authorized Developer & University Staff Portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-950/80 backdrop-blur-xl py-7 px-6 sm:px-8 shadow-2xl rounded-3xl border border-slate-800">
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
              <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Staff / Developer Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@unisync.edu"
                  className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to Administration</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
              Quick Test Credentials
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('developer')}
                className="px-2.5 py-1.5 rounded-lg bg-purple-950/40 border border-purple-800/50 hover:bg-purple-900/40 text-purple-300 text-[11px] font-medium text-left transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span className="truncate">Developer Superadmin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="px-2.5 py-1.5 rounded-lg bg-blue-950/40 border border-blue-800/50 hover:bg-blue-900/40 text-blue-300 text-[11px] font-medium text-left transition-colors flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span className="truncate">Faculty Admin</span>
              </button>
            </div>

            {/* Test unauthorized access button */}
            <div className="mt-2">
              <button
                type="button"
                onClick={() => handleQuickFill('student')}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px] text-center transition-colors"
              >
                Test Unauthorized Student Attempt (Alex Morgan)
              </button>
            </div>
          </div>

          {/* Switch to Student Interface */}
          <div className="mt-5 text-center">
            <button
              onClick={onSwitchToStudentView}
              className="text-xs text-slate-400 hover:text-blue-400 transition-colors"
            >
              Are you a student? Open the <b>Student Mobile Portal →</b>
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-left shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Reset Password</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your verified university staff email to receive password reset instructions.
            </p>
            {resetSuccess ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Password reset link sent to {resetEmail || email}.</span>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="email"
                  value={resetEmail || email}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="staff@unisync.edu"
                  className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
                <button
                  type="button"
                  onClick={() => setResetSuccess(true)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 rounded-xl"
                >
                  Send Reset Link
                </button>
              </div>
            )}
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setResetSuccess(false);
                }}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
