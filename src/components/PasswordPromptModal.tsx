import React, { useState } from 'react';
import { ShieldCheck, GraduationCap, Lock, Eye, EyeOff, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { SchoolSettings, ActivityLog } from '../types';

interface PasswordPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole: 'teacher' | 'admin';
  schoolSettings: SchoolSettings;
  onSuccess: (role: 'teacher' | 'admin', email?: string) => void;
  onLogActivity: (entry: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
}

export const PasswordPromptModal: React.FC<PasswordPromptModalProps> = ({
  isOpen,
  onClose,
  targetRole,
  schoolSettings,
  onSuccess,
  onLogActivity,
}) => {
  const [adminEmail, setAdminEmail] = useState('ismailkasumba8@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isAdmin = targetRole === 'admin';
  const title = isAdmin ? 'Administrator Master Authentication' : 'Teacher Gradebook Verification';
  const roleName = isAdmin ? `Administrator (ismailkasumba8@gmail.com)` : 'Authorized Subject Teacher';

  const getDeviceHint = () => {
    if (typeof window === 'undefined') return 'Unknown';
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'Android Device';
    if (/iphone|ipad|ipod/i.test(ua)) return 'iOS Device';
    if (/windows/i.test(ua)) return 'Windows PC';
    if (/macintosh|mac os x/i.test(ua)) return 'Mac Computer';
    if (/linux/i.test(ua)) return 'Linux Workstation';
    return 'Web Client';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (isAdmin) {
      const normalizedEmail = adminEmail.trim().toLowerCase();
      if (normalizedEmail !== 'ismailkasumba8@gmail.com') {
        setError('Access Denied: Only ismailkasumba8@gmail.com is authorized for master administrator access across all portals.');
        setIsSubmitting(false);
        onLogActivity({
          status: 'FAILED',
          role: 'admin',
          action: 'Master Admin Access Rejected',
          identifier: normalizedEmail || '(Unknown Email)',
          details: `Unauthorized email attempted administrator master access. Denied.`,
          deviceInfo: getDeviceHint(),
        });
        return;
      }
    }

    const expectedPassword = isAdmin
      ? schoolSettings.adminPassword || 'admin2026'
      : schoolSettings.teacherPassword || 'teacher2026';

    if (password.trim() === expectedPassword.trim()) {
      onLogActivity({
        status: 'SUCCESS',
        role: targetRole,
        action: isAdmin ? 'Admin Master Password Verification' : 'Teacher Gradebook Verification',
        identifier: isAdmin ? 'ismailkasumba8@gmail.com' : 'Authorized Staff',
        details: `Privileged access granted to ${isAdmin ? 'Admin Master Control Center' : 'Continuous Gradebook'}.`,
        deviceInfo: getDeviceHint(),
      });

      setPassword('');
      setIsSubmitting(false);
      onSuccess(targetRole, isAdmin ? 'ismailkasumba8@gmail.com' : undefined);
      onClose();
    } else {
      const maskedInput = password.length > 2 ? password.slice(0, 2) + '•••' : '•••';
      onLogActivity({
        status: 'FAILED',
        role: targetRole,
        action: 'Privileged Access Denied',
        identifier: maskedInput,
        details: `Failed password verification for ${isAdmin ? 'Administrator' : 'Teacher'} portal access.`,
        deviceInfo: getDeviceHint(),
      });

      setError('Incorrect password. Access denied. This attempt has been recorded in the security audit log.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className={`p-5 text-white flex items-center justify-between ${
          isAdmin 
            ? 'bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900' 
            : 'bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isAdmin ? 'bg-amber-400/20 text-amber-300' : 'bg-indigo-400/20 text-indigo-200'
            }`}>
              {isAdmin ? <ShieldCheck className="w-6 h-6" /> : <GraduationCap className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-bold text-base font-['Outfit',sans-serif]">{title}</h3>
              <p className="text-xs text-slate-300">Protected School Record Verification</p>
            </div>
          </div>
          <button
            onClick={() => {
              setPassword('');
              setError('');
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isAdmin && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Authorized Master Email:
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => {
                  setAdminEmail(e.target.value);
                  setError('');
                }}
                placeholder="ismailkasumba8@gmail.com"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
              <p className="text-[11px] text-amber-900 mt-1">
                Only <strong>ismailkasumba8@gmail.com</strong> has master privileges across all three portals.
              </p>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-700">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Enter {isAdmin ? 'Master Administrator' : 'Teacher Staff'} Password:</span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                autoFocus={!isAdmin}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter password..."
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="mt-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Unauthorized access or changes to marks & settings are strictly restricted.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setPassword('');
                setError('');
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!password || isSubmitting}
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                isAdmin 
                  ? 'bg-slate-950 hover:bg-black text-amber-300' 
                  : 'bg-indigo-700 hover:bg-indigo-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify & Unlock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
