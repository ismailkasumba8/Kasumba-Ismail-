/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  SchoolSettings, 
  Student,
  ActivityLog
} from '../types';
import { 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  Search, 
  Lock, 
  KeyRound, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Download, 
  Smartphone, 
  TreePine,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { InstallAppModal } from './InstallAppModal';

interface PortalGatewayProps {
  schoolSettings: SchoolSettings;
  students: Student[];
  onSelectParent: (studentCode: string) => void;
  onSelectTeacher: () => void;
  onSelectAdmin: (email?: string) => void;
  onLogActivity?: (entry: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
}

export const PortalGateway: React.FC<PortalGatewayProps> = ({
  schoolSettings,
  students,
  onSelectParent,
  onSelectTeacher,
  onSelectAdmin,
  onLogActivity,
}) => {
  // Parent state
  const [parentCode, setParentCode] = useState('');
  const [parentError, setParentError] = useState('');

  // Teacher state
  const [teacherPassword, setTeacherPassword] = useState('');
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);
  const [teacherError, setTeacherError] = useState('');

  // Admin state
  const [adminEmail, setAdminEmail] = useState('ismailkasumba8@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Google Play & Download Modal
  const [isPlayStoreModalOpen, setIsPlayStoreModalOpen] = useState(false);

  // Helper to detect device hint
  const getDeviceHint = () => {
    if (typeof window === 'undefined') return 'Standard Web Browser';
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'Mobile (Chrome Android)';
    if (/iPad|iPhone|iPod/.test(ua)) return 'Mobile (Safari iOS)';
    if (/Macintosh/.test(ua)) return 'Laptop (macOS)';
    if (/Windows/.test(ua)) return 'Desktop (Windows PC)';
    return 'Web Browser';
  };

  // Parent Submit - Strictly requires student number
  const handleParentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParentError('');
    const cleanCode = parentCode.trim().toUpperCase();

    if (!cleanCode) {
      setParentError('Student Number is required. Enter your learner BDN Code or Roll Number.');
      onLogActivity?.({
        status: 'FAILED',
        role: 'parent',
        action: 'Parent Access Attempt Without Student Number',
        identifier: '(None Provided)',
        details: 'Parent portal access blocked: No student number was provided.',
        deviceInfo: getDeviceHint()
      });
      return;
    }

    const found = students.find(
      (s) => s.studentCode.toUpperCase() === cleanCode || s.rollNumber.toUpperCase() === cleanCode
    );

    if (!found) {
      const msg = `Student number "${cleanCode}" not found. Access is limited to verified learner numbers only.`;
      setParentError(msg);
      onLogActivity?.({
        status: 'FAILED',
        role: 'parent',
        action: 'Parent Access Denied (Invalid Student Number)',
        identifier: cleanCode,
        details: `Invalid student number entered: "${cleanCode}". Record not found in school database.`,
        deviceInfo: getDeviceHint()
      });
      return;
    }

    onLogActivity?.({
      status: 'SUCCESS',
      role: 'parent',
      action: 'Parent Report Card Unlocked',
      identifier: cleanCode,
      details: `Official term report card accessed with student number for ${found.fullName} (${found.classGrade}).`,
      deviceInfo: getDeviceHint()
    });

    onSelectParent(found.studentCode);
  };

  // Teacher Submit
  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherError('');
    const entered = teacherPassword.trim();

    const validTeacherPass = schoolSettings.teacherPassword || 'teacher2026';
    if (!entered) {
      setTeacherError('Please enter the teacher access password.');
      onLogActivity?.({
        status: 'FAILED',
        role: 'teacher',
        action: 'Failed Teacher Password Attempt',
        identifier: '(Empty)',
        details: 'Teacher login attempted without entering password.',
        deviceInfo: getDeviceHint()
      });
      return;
    }

    if (entered === validTeacherPass) {
      onLogActivity?.({
        status: 'SUCCESS',
        role: 'teacher',
        action: 'Teacher Gradebook Access',
        identifier: 'Authorized Staff',
        details: `Teacher successfully authenticated into Continuous Assessment Gradebook.`,
        deviceInfo: getDeviceHint()
      });
      onSelectTeacher();
    } else {
      setTeacherError('Incorrect teacher password. Please verify with school administration.');
      onLogActivity?.({
        status: 'FAILED',
        role: 'teacher',
        action: 'Failed Teacher Password Attempt',
        identifier: '••••••••',
        details: `Incorrect password entered on Teacher Gradebook portal. Access denied.`,
        deviceInfo: getDeviceHint()
      });
    }
  };

  // Admin Submit - Exclusively restricted to ismailkasumba8@gmail.com
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    const normalizedEmail = adminEmail.trim().toLowerCase();
    const enteredPass = adminPassword.trim();

    if (normalizedEmail !== 'ismailkasumba8@gmail.com') {
      setAdminError('Access Denied: Only ismailkasumba8@gmail.com is authorized for master access to all 3 portals.');
      onLogActivity?.({
        status: 'FAILED',
        role: 'admin',
        action: 'Master Admin Access Rejected',
        identifier: normalizedEmail || '(Unknown Email)',
        details: `Unauthorized email "${normalizedEmail}" attempted administrator master access. Denied.`,
        deviceInfo: getDeviceHint()
      });
      return;
    }

    const validAdminPass = schoolSettings.adminPassword || 'admin2026';
    if (!enteredPass) {
      setAdminError('Please enter the administrator password.');
      return;
    }

    if (enteredPass === validAdminPass) {
      onLogActivity?.({
        status: 'SUCCESS',
        role: 'admin',
        action: 'Master Administrator Access Granted',
        identifier: 'ismailkasumba8@gmail.com',
        details: `Master administrator ismailkasumba8@gmail.com granted full access to all three portals.`,
        deviceInfo: getDeviceHint()
      });
      onSelectAdmin('ismailkasumba8@gmail.com');
    } else {
      setAdminError('Incorrect administrator password. Access denied.');
      onLogActivity?.({
        status: 'FAILED',
        role: 'admin',
        action: 'Failed Administrator Password Attempt',
        identifier: 'ismailkasumba8@gmail.com',
        details: `Incorrect password entered for ismailkasumba8@gmail.com. Access denied.`,
        deviceInfo: getDeviceHint()
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between py-6 sm:py-10">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        
        {/* Top Institutional Header with App Icon */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* App Icon */}
            <div className="relative group cursor-pointer" onClick={() => setIsPlayStoreModalOpen(true)}>
              <img
                src="/bdn-icon.jpg"
                alt="Bishop Dunstan Nsubuga Memorial SSS App Icon"
                referrerPolicy="no-referrer"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl shadow-lg border-2 border-emerald-500/30 object-cover transform transition-transform group-hover:scale-105"
              />
              <div className="absolute -bottom-2 -right-2 bg-amber-400 text-emerald-950 p-1.5 rounded-full shadow-md border-2 border-white">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-semibold mb-1">
                <TreePine className="w-3.5 h-3.5 text-emerald-700" />
                <span>Zero-Paper Continuous Assessment System</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-['Outfit',sans-serif]">
                {schoolSettings.schoolName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                {schoolSettings.centerNumber} • {schoolSettings.poBox}
              </p>
            </div>
          </div>

          {/* Google Play Store & Download App Action Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {/* Google Play Styled Button */}
            <button
              onClick={() => setIsPlayStoreModalOpen(true)}
              className="bg-slate-950 hover:bg-black text-white border border-slate-700 hover:border-emerald-500 rounded-xl px-4 py-2 flex items-center gap-2.5 shadow-md transition cursor-pointer group"
              title="Download from Play Store or Install App"
            >
              {/* Google Play Icon */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 512 512">
                <path fill="#4285F4" d="M48.7 15.6C44.4 20.3 42 27.5 42 36.8v438.4c0 9.3 2.4 16.5 6.7 21.2l1.2 1.2 245.4-245.4v-5.8L50 14.4l-1.3 1.2z" />
                <path fill="#FFBB00" d="M376.5 329.8l-81.2-81.2v-5.8l81.2-81.2 1.8 1 96.3 54.7c27.5 15.6 27.5 41.2 0 56.8l-96.3 54.7-1.8 1z" />
                <path fill="#EA4335" d="M378.3 328.8L295.3 245.8 48.7 492.4c9.1 9.6 24 10.8 41 1.2l288.6-164.8" />
                <path fill="#34A853" d="M378.3 183.2L89.7 19.4c-17-9.6-31.9-8.4-41 1.2l246.6 246.6 83-84z" />
              </svg>
              <div className="text-left">
                <div className="text-[8px] uppercase tracking-wider text-slate-300 leading-none">Download App on</div>
                <div className="text-xs font-bold text-white leading-tight font-sans">Google Play & Android</div>
              </div>
            </button>

            {/* Direct Phone Install Button */}
            <button
              onClick={() => setIsPlayStoreModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-amber-300" />
              <span>Install to Phone / PC</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* The 3 Core Entry Options Display */}
        <div>
          <div className="text-center mb-6">
            <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
              School Information Access Gateway
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto mt-1">
              <strong>Parent Portal</strong> requires entering a valid <strong>Student Number</strong> (strictly limited to protect learner privacy). 
              <strong> Teacher Portal</strong> requires academic staff authorization. 
              Only <strong>ismailkasumba8@gmail.com</strong> possesses master authorization to access all three portals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* OPTION 1: PARENT ACCESS (REQUIRES STUDENT NUMBER - LIMITATION TO OTHER USERS) */}
            <div className="bg-white rounded-2xl border-2 border-emerald-400 shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0 pointer-events-none" />
              
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-emerald-700" />
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 border border-emerald-300 text-emerald-900 text-[11px] font-extrabold rounded-full uppercase tracking-wider">
                    Option 1: Parent
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
                    Parent Portal
                  </h3>
                  <div className="text-xs font-semibold text-emerald-800 mt-0.5 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-700" />
                    <span>Student Number Required</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Access is strictly limited. Parents and guardians must provide the official Student Number (BDN Code or Roll No) to view terminal report cards.
                  </p>
                </div>

                {/* Privacy Limitation Callout */}
                <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block">Access Limitation:</strong>
                    <span>Other users cannot view reports without the verified student number.</span>
                  </div>
                </div>

                <form onSubmit={handleParentSubmit} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Learner Student Number:
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Search className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={parentCode}
                        onChange={(e) => {
                          setParentCode(e.target.value);
                          setParentError('');
                        }}
                        placeholder="Enter Student Number (e.g. BDN-7821)"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold tracking-wider text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                      />
                    </div>
                    {parentError && (
                      <p className="text-[11px] text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{parentError}</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    id="parent-access-btn"
                    className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Verify Student Number & View Report</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Confidential Learner Access Note */}
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Confidential record access. No passwords needed for parents.</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-emerald-800 font-medium text-center">
                ✓ Verified Student Identification Required
              </div>
            </div>

            {/* OPTION 2: TEACHER ACCESS (STAFF PASSWORD) */}
            <div className="bg-white rounded-2xl border-2 border-indigo-300 shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-0 pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-indigo-700" />
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-100 border border-indigo-300 text-indigo-900 text-[11px] font-extrabold rounded-full uppercase tracking-wider">
                    Option 2: Teacher
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
                    Teacher Gradebook
                  </h3>
                  <div className="text-xs font-semibold text-indigo-800 mt-0.5">
                    Authorized Staff Access
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Digital continuous assessment gradebook. Enter midterm (/30) and endterm (/70) marks, compute aggregates, and log remarks.
                  </p>
                </div>

                <form onSubmit={handleTeacherSubmit} className="space-y-3 pt-1">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Teacher Staff Password:
                      </label>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showTeacherPassword ? 'text' : 'password'}
                        value={teacherPassword}
                        onChange={(e) => {
                          setTeacherPassword(e.target.value);
                          setTeacherError('');
                        }}
                        placeholder="Enter staff password..."
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showTeacherPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {teacherError && (
                      <p className="text-[11px] text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{teacherError}</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    id="teacher-access-btn"
                    className="w-full py-2.5 px-4 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Enter Teacher Gradebook</span>
                  </button>
                </form>

                <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                  <span>Authorized teaching staff only. All marks entry is logged.</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-indigo-900 font-medium text-center">
                ✓ Continuous assessment & marks management
              </div>
            </div>

            {/* OPTION 3: ADMINISTRATOR ACCESS (EXCLUSIVELY ismailkasumba8@gmail.com - ACCESS TO ALL 3 PORTALS) */}
            <div className="bg-white rounded-2xl border-2 border-amber-400 shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-0 pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-amber-800" />
                  </div>
                  <span className="px-2.5 py-1 bg-amber-100 border border-amber-300 text-amber-950 text-[11px] font-extrabold rounded-full uppercase tracking-wider">
                    Option 3: Admin
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif] flex items-center gap-1.5">
                    <span>Administrator Portal</span>
                  </h3>
                  <div className="text-xs font-semibold text-amber-900 mt-0.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Master Access to All 3 Portals</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Exclusive master control. Only <strong className="text-amber-950">ismailkasumba8@gmail.com</strong> has master privileges to access Parent, Teacher, and Administrator portals.
                  </p>
                </div>

                <form onSubmit={handleAdminSubmit} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Administrator Email:
                    </label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => {
                        setAdminEmail(e.target.value);
                        setAdminError('');
                      }}
                      placeholder="ismailkasumba8@gmail.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Administrator Password:
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showAdminPassword ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => {
                          setAdminPassword(e.target.value);
                          setAdminError('');
                        }}
                        placeholder="Enter admin password..."
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {adminError && (
                      <p className="text-[11px] text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{adminError}</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    id="admin-access-btn"
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-black text-amber-400 font-semibold rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Master Login (All 3 Portals Access)</span>
                  </button>
                </form>

                <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-[11px] text-amber-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Only <strong>ismailkasumba8@gmail.com</strong> has master privileges.</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-amber-950 font-bold text-center">
                👑 Unrestricted master access to all portals
              </div>
            </div>
          </div>
        </div>

        {/* Environmental Stewardship & App Download Strip */}
        <div className="bg-emerald-900 text-emerald-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-emerald-300 flex items-center justify-center shrink-0">
              <TreePine className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-xs sm:text-sm">
                Environmental Stewardship & Zero-Paper Mandate
              </p>
              <p className="text-[11px] sm:text-xs text-emerald-200/80">
                Saving trees and printing costs at Bishop Dunstan Nsubuga Memorial SSS through digital access.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPlayStoreModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer shadow-xs shrink-0"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Download App for Android</span>
          </button>
        </div>
      </div>

      {/* Google Play & Install App Guide Modal */}
      <InstallAppModal
        isOpen={isPlayStoreModalOpen}
        onClose={() => setIsPlayStoreModalOpen(false)}
        schoolSettings={schoolSettings}
        students={students}
      />
    </div>
  );
};
