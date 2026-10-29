import React, { useState } from 'react';
import {
  LayoutDashboard,
  Smartphone,
  Code2,
  Database,
  ShieldCheck,
  LogOut,
  User,
} from 'lucide-react';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { MobileSimulator } from './components/MobileSimulator';
import { FlutterExplorer } from './components/FlutterExplorer';
import { store } from './services/store';
import { Profile } from './types';

export default function App() {
  const [viewMode, setViewMode] = useState<'admin' | 'mobile' | 'code'>('admin');
  const profiles = store.getProfiles();

  // Active authenticated admin for the web dashboard (starts on developer, can log out to AdminLogin)
  const developerUser = profiles.find((p) => p.role === 'developer') || profiles[0];
  const adminUser = profiles.find((p) => p.role === 'admin') || profiles[1];
  const [activeAdmin, setActiveAdmin] = useState<Profile | null>(developerUser);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* Top Application Switcher Bar */}
      <header className="h-12 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between flex-shrink-0 z-40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 text-white font-black text-xs flex items-center justify-center">
              US
            </div>
            <span className="font-bold text-sm text-white tracking-tight">UniSync</span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">| Your University, Connected.</span>
        </div>

        {/* Workspace Mode Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setViewMode('admin')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
              viewMode === 'admin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Developer Admin Dashboard</span>
          </button>

          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
              viewMode === 'mobile'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android Student App Preview</span>
          </button>

          <button
            onClick={() => setViewMode('code')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
              viewMode === 'code'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Flutter & Supabase Source Code</span>
          </button>
        </div>

        {/* Right Info: Role switcher / Log In & Out status */}
        <div className="flex items-center gap-3">
          {viewMode === 'admin' && activeAdmin && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <select
                value={activeAdmin.id}
                onChange={(e) => {
                  const p = profiles.find((x) => x.id === e.target.value);
                  if (p) setActiveAdmin(p);
                }}
                className="bg-transparent text-white font-medium text-[11px] focus:outline-none cursor-pointer"
              >
                <option value={developerUser.id} className="bg-slate-900 text-white">
                  {developerUser.full_name} (Developer Superadmin)
                </option>
                <option value={adminUser.id} className="bg-slate-900 text-white">
                  {adminUser.full_name} (Administrator)
                </option>
              </select>
              <button
                onClick={() => setActiveAdmin(null)}
                title="Sign out of Admin Dashboard"
                className="text-[11px] text-rose-400 hover:text-rose-300 font-medium pl-1.5 border-l border-slate-700 flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Log Out</span>
              </button>
            </div>
          )}

          {viewMode === 'admin' && !activeAdmin && (
            <div className="text-[11px] text-amber-400 flex items-center gap-1.5 bg-amber-950/40 border border-amber-800/40 px-2.5 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Admin Login Page</span>
            </div>
          )}

          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Supabase Active</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'admin' && (
          activeAdmin ? (
            <AdminDashboard
              currentAdmin={activeAdmin}
              onLogout={() => setActiveAdmin(null)}
            />
          ) : (
            <AdminLogin
              onLoginSuccess={(admin) => setActiveAdmin(admin)}
              onSwitchToStudentView={() => setViewMode('mobile')}
            />
          )
        )}

        {viewMode === 'mobile' && (
          <MobileSimulator onSwitchToAdmin={() => setViewMode('admin')} />
        )}

        {viewMode === 'code' && <FlutterExplorer />}
      </div>
    </div>
  );
}
