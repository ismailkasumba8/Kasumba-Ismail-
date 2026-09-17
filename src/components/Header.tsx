import React, { useState } from 'react';
import { 
  TreePine, 
  GraduationCap, 
  Users, 
  FileText, 
  RotateCcw,
  Sparkles,
  KeyRound,
  ShieldCheck,
  Download,
  School,
  Lock,
  ChevronDown,
  LogOut,
  Smartphone
} from 'lucide-react';
import { SchoolSettings, UserRole } from '../types';

interface HeaderProps {
  activeTab: 'gateway' | 'parent' | 'teacher' | 'eco' | 'admin';
  setActiveTab: (tab: 'gateway' | 'parent' | 'teacher' | 'eco' | 'admin') => void;
  onOpenInstallGuide: () => void;
  treesSavedCount: number;
  schoolSettings: SchoolSettings;
  userRole: UserRole;
  onQuickDownloadCSV: () => void;
  onLogout: () => void;
  onRequestAuth: (targetRole: 'teacher' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenInstallGuide,
  treesSavedCount,
  schoolSettings,
  userRole,
  onQuickDownloadCSV,
  onLogout,
  onRequestAuth,
}) => {
  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top institution & eco bar */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded text-[11px] border border-emerald-400/30">
              <School className="w-3 h-3 mr-1 text-emerald-300" />
              {schoolSettings.centerNumber}
            </span>
            <span className="hidden sm:inline text-emerald-200">
              {schoolSettings.schoolName} • {schoolSettings.motto}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-emerald-300 font-medium">
              🌲 Trees Saved: <strong className="text-white">{treesSavedCount.toFixed(3)}</strong>
            </span>

            {/* Google Play Store & Install App Button */}
            <button
              onClick={onOpenInstallGuide}
              className="inline-flex items-center gap-1.5 text-[11px] bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-2.5 py-0.5 rounded-lg transition cursor-pointer shadow-xs"
              title="Download from Google Play Store or install on your phone"
            >
              <Smartphone className="w-3.5 h-3.5 text-slate-950" />
              <span>Play Store & App</span>
            </button>

            {/* Authenticated Session Badge & Quick Log Out */}
            {userRole !== 'guest' ? (
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-semibold ${
                  userRole === 'admin'
                    ? 'bg-amber-400 text-slate-950'
                    : userRole === 'teacher'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-emerald-800 text-emerald-100'
                }`}>
                  <ShieldCheck className="w-3 h-3" />
                  <span>
                    {userRole === 'admin' ? `Admin: ${schoolSettings.adminName}` : userRole === 'teacher' ? 'Teacher Mode' : 'Parent Mode'}
                  </span>
                </span>

                <button
                  onClick={onLogout}
                  id="header-quick-logout-btn"
                  className="inline-flex items-center gap-1 text-[11px] bg-rose-600 hover:bg-rose-500 text-white font-bold px-2.5 py-0.5 rounded transition cursor-pointer shadow-xs"
                  title="Quick Log Out and secure session"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Quick Log Out</span>
                </button>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 text-[11px] bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded border border-emerald-700/50">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Locked • Sign In to Edit</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & School Name */}
          <div 
            onClick={() => setActiveTab('gateway')}
            className="flex items-center gap-3 cursor-pointer group"
            title="Click to go to 3-options entry display"
          >
            <img
              src="/bdn-icon.jpg"
              alt="BDN Logo"
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-xl shadow-md border border-emerald-500/30 object-cover group-hover:scale-105 transition-transform shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 font-['Outfit',sans-serif] leading-tight group-hover:text-emerald-800 transition-colors">
                  Bishop Dunstan Nsubuga Memorial SSS
                </h1>
                <span className="hidden md:inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Paperless System
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                BDN Portal • {schoolSettings.currentTerm}, {schoolSettings.academicYear} • Kalisizo, Masaka
              </p>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Gateway 3 Options Return Button */}
            <button
              onClick={() => setActiveTab('gateway')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                activeTab === 'gateway'
                  ? 'bg-emerald-900 text-white border-emerald-950 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <span>3 Options Screen</span>
            </button>

            <nav className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium">
              <button
                onClick={() => setActiveTab('parent')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'parent'
                    ? 'bg-white text-emerald-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Parent Portal</span>
              </button>

              <button
                onClick={() => {
                  if (userRole === 'teacher' || userRole === 'admin') {
                    setActiveTab('teacher');
                  } else {
                    onRequestAuth('teacher');
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'teacher'
                    ? 'bg-white text-emerald-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>Teacher Gradebook</span>
                {userRole !== 'teacher' && userRole !== 'admin' && (
                  <Lock className="w-3 h-3 text-slate-400 ml-0.5" />
                )}
              </button>

              {/* Admin Panel Tab */}
              <button
                onClick={() => {
                  if (userRole === 'admin') {
                    setActiveTab('admin');
                  } else {
                    onRequestAuth('admin');
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-emerald-900 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 ${activeTab === 'admin' ? 'text-amber-400' : 'text-emerald-700'}`} />
                <span className="font-semibold">Administrator</span>
                {userRole !== 'admin' && (
                  <Lock className="w-3 h-3 text-amber-500 ml-0.5" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('eco')}
                className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'eco'
                    ? 'bg-white text-emerald-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <TreePine className="w-4 h-4 text-emerald-600" />
                <span>Eco Impact</span>
              </button>
            </nav>

            {/* Quick Download CSV button */}
            <button
              onClick={onQuickDownloadCSV}
              title="Download entire student database as CSV (Excel)"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {/* Quick Log Out button in navigation bar when logged in */}
            {userRole !== 'guest' && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                title="Quick Log Out"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
