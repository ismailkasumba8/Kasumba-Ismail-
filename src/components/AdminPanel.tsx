import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert,
  Download, 
  Settings, 
  FileSpreadsheet, 
  FileJson, 
  Ticket, 
  Lock, 
  Unlock, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Upload, 
  Eye, 
  EyeOff,
  Users, 
  GraduationCap, 
  TreePine, 
  Printer, 
  Sparkles, 
  School,
  Clock,
  LogOut
} from 'lucide-react';
import { Student, SchoolSettings, ActivityLog } from '../types';
import { 
  downloadStudentsCSV, 
  downloadBackupJSON, 
  downloadParentCodesCSV 
} from '../utils/exportHelpers';
import { ActivityLogTab } from './ActivityLogTab';

interface AdminPanelProps {
  schoolSettings: SchoolSettings;
  onUpdateSettings: (settings: SchoolSettings) => void;
  students: Student[];
  onRestoreBackup: (students: Student[], settings?: SchoolSettings) => void;
  onResetData: () => void;
  onNavigateToTab: (tab: 'parent' | 'teacher' | 'problem' | 'eco') => void;
  activityLogs?: ActivityLog[];
  onClearActivityLogs?: () => void;
  onAddActivityLog?: (entry: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  onLogout?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  schoolSettings,
  onUpdateSettings,
  students,
  onRestoreBackup,
  onResetData,
  onNavigateToTab,
  activityLogs = [],
  onClearActivityLogs = () => {},
  onAddActivityLog,
  onLogout,
}) => {
  const [formData, setFormData] = useState<SchoolSettings>(schoolSettings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importError, setImportError] = useState('');
  const [adminSubTab, setAdminSubTab] = useState<'logs' | 'profile' | 'exports'>('logs');
  const [showTeacherPw, setShowTeacherPw] = useState(false);
  const [showAdminPw, setShowAdminPw] = useState(false);

  const failedLogsCount = activityLogs.filter((l) => l.status === 'FAILED').length;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTogglePublish = () => {
    const updated = {
      ...formData,
      reportsPublished: !formData.reportsPublished,
    };
    setFormData(updated);
    onUpdateSettings(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.students && Array.isArray(parsed.students)) {
          onRestoreBackup(parsed.students, parsed.schoolSettings);
          setImportError('');
          alert(`Successfully imported ${parsed.students.length} students into the database!`);
        } else if (Array.isArray(parsed)) {
          onRestoreBackup(parsed);
          setImportError('');
          alert(`Successfully imported ${parsed.length} students into the database!`);
        } else {
          setImportError('Invalid backup file format.');
        }
      } catch (err) {
        setImportError('Error parsing JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Administrator Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Administrator Level • Chief Authority</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-['Outfit',sans-serif] tracking-tight">
              {formData.adminName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-2">
              <span>Director of Studies / Administrator</span>
              <span>•</span>
              <span className="text-emerald-300 font-semibold">{formData.schoolName}</span>
              <span>•</span>
              <span>{formData.adminEmail}</span>
            </p>
          </div>

          {/* Actions: Quick Publish Toggle & Quick Log Out */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-4 rounded-xl flex items-center gap-4">
              <div>
                <span className="text-xs font-semibold block text-slate-200">
                  Parent Portal Release Status
                </span>
                <span className="text-[11px] text-slate-300">
                  {formData.reportsPublished ? 'Parents can lookup BDN codes' : 'Reports hidden during grading'}
                </span>
              </div>
              <button
                onClick={handleTogglePublish}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                  formData.reportsPublished 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs'
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                }`}
              >
                {formData.reportsPublished ? (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Published</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Unpublished (Grading)</span>
                  </>
                )}
              </button>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                id="admin-header-quick-logout-btn"
                className="px-4 py-3.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition cursor-pointer bg-rose-600 hover:bg-rose-500 text-white shadow-md shrink-0"
                title="Quick Log Out and secure Administrator Portal"
              >
                <LogOut className="w-4 h-4" />
                <span>Quick Log Out</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Admin Panel Sub-Tabs Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {/* Activity Log Tab */}
        <button
          onClick={() => setAdminSubTab('logs')}
          id="admin-subtab-logs"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
            adminSubTab === 'logs'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <ShieldAlert className={`w-4 h-4 ${adminSubTab === 'logs' ? 'text-amber-300' : 'text-emerald-700'}`} />
          <span>Activity Log & Audit Trail</span>
          {failedLogsCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white animate-pulse">
              {failedLogsCount} Failed
            </span>
          ) : (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              adminSubTab === 'logs' ? 'bg-emerald-950 text-emerald-200' : 'bg-slate-100 text-slate-600'
            }`}>
              {activityLogs.length}
            </span>
          )}
        </button>

        {/* School Profile Tab */}
        <button
          onClick={() => setAdminSubTab('profile')}
          id="admin-subtab-profile"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
            adminSubTab === 'profile'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <School className={`w-4 h-4 ${adminSubTab === 'profile' ? 'text-amber-300' : 'text-slate-600'}`} />
          <span>School Profile & Term Settings</span>
        </button>

        {/* Downloads & Exports Tab */}
        <button
          onClick={() => setAdminSubTab('exports')}
          id="admin-subtab-exports"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
            adminSubTab === 'exports'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Download className={`w-4 h-4 ${adminSubTab === 'exports' ? 'text-amber-300' : 'text-slate-600'}`} />
          <span>Download & Data Export Center</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            adminSubTab === 'exports' ? 'bg-emerald-950 text-emerald-200' : 'bg-slate-100 text-slate-600'
          }`}>
            CSV / JSON
          </span>
        </button>
      </div>

      {/* SUB-TAB 1: ACTIVITY LOG TAB */}
      {adminSubTab === 'logs' && (
        <ActivityLogTab
          logs={activityLogs}
          schoolSettings={formData}
          onClearLogs={onClearActivityLogs}
          onAddSimulatedLog={onAddActivityLog}
        />
      )}

      {/* SUB-TAB 2: DOWNLOAD & EXPORT CENTER */}
      {adminSubTab === 'exports' && (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
                Download & Data Export Center
              </h3>
              <p className="text-xs text-slate-500">
                Directly download official marks sheets, guardian codes, and system backups.
              </p>
            </div>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium">
            {students.length} Learners in Database
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Download CSV / Excel */}
          <div className="border border-slate-200 rounded-xl p-5 hover:border-emerald-500 hover:shadow-xs transition bg-slate-50/50 flex flex-col justify-between space-y-4">
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Student Marks Gradebook (CSV / Excel)
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Download all students, BDN codes, subject scores, teacher comments, and GPA rankings in spreadsheet format.
              </p>
            </div>
            <button
              onClick={() => downloadStudentsCSV(students, formData)}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg transition cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download Excel / CSV</span>
            </button>
          </div>

          {/* Download Parent BDN Codes List */}
          <div className="border border-slate-200 rounded-xl p-5 hover:border-amber-500 hover:shadow-xs transition bg-slate-50/50 flex flex-col justify-between space-y-4">
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <Ticket className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Parent Access Codes List (CSV)
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Download a clean list of BDN access codes paired with student names and phone numbers for SMS distribution.
              </p>
            </div>
            <button
              onClick={() => downloadParentCodesCSV(students, formData)}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download BDN Codes</span>
            </button>
          </div>

          {/* Download Complete JSON Backup */}
          <div className="border border-slate-200 rounded-xl p-5 hover:border-blue-500 hover:shadow-xs transition bg-slate-50/50 flex flex-col justify-between space-y-4">
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                <FileJson className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Full System Backup (JSON)
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Save an entire snapshot of student marks, configurations, and comments to safely store or restore at any time.
              </p>
            </div>
            <button
              onClick={() => downloadBackupJSON(students, formData)}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg transition cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download Backup JSON</span>
            </button>
          </div>
        </div>

        {/* Restore Backup Section */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-slate-500" />
            <span className="text-slate-700 font-medium">Restore Database from JSON Backup:</span>
            <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-300 font-semibold">
              <span>Choose Backup File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {importError && (
            <span className="text-rose-600 font-semibold">{importError}</span>
          )}

          <button
            onClick={onResetData}
            className="text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default BDN Data</span>
          </button>
        </div>
      </div>
      )}

      {/* SUB-TAB 3: SCHOOL & INSTITUTION CONFIGURATION FORM */}
      {adminSubTab === 'profile' && (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 border-b border-slate-200 pb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
              School Profile & Term Settings
            </h3>
            <p className="text-xs text-slate-500">
              Customize the institutional information printed on official report cards.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Full School Name
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Short Name / Code Prefix
              </label>
              <input
                type="text"
                value={formData.shortName}
                onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                UNEB Centre / Registration Number
              </label>
              <input
                type="text"
                value={formData.centerNumber}
                onChange={(e) => setFormData({ ...formData, centerNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Current Term
              </label>
              <select
                value={formData.currentTerm}
                onChange={(e) => setFormData({ ...formData, currentTerm: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Academic Year
              </label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                School Motto
              </label>
              <input
                type="text"
                value={formData.motto}
                onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Headteacher Name / Endorsement Title
              </label>
              <input
                type="text"
                value={formData.headteacherName}
                onChange={(e) => setFormData({ ...formData, headteacherName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Administrator Name
              </label>
              <input
                type="text"
                value={formData.adminName}
                onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Administrator Email Address
              </label>
              <input
                type="email"
                value={formData.adminEmail}
                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-800 text-xs">
                  Teacher Access Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowTeacherPw(!showTeacherPw)}
                  className="text-[11px] text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer font-medium"
                >
                  {showTeacherPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showTeacherPw ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type={showTeacherPw ? 'text' : 'password'}
                  value={formData.teacherPassword || ''}
                  onChange={(e) => setFormData({ ...formData, teacherPassword: e.target.value })}
                  placeholder="Set confidential teacher password..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Used by authorized teachers to access continuous marks entry</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-800 text-xs">
                  Administrator Access Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowAdminPw(!showAdminPw)}
                  className="text-[11px] text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer font-medium"
                >
                  {showAdminPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showAdminPw ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <input
                  type={showAdminPw ? 'text' : 'password'}
                  value={formData.adminPassword || ''}
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                  placeholder="Set confidential administrator password..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Used by {formData.adminName} to access full administrative settings</span>
            </div>
          </div>

          {/* Role-Based Access Control (RBAC) Security Summary Card */}
          <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Portal Access Limitation & Security Rules (Active Enforcement)
                </h4>
              </div>
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded">
                Active & Enforced
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Master Administrator</span>
                </div>
                <p className="text-slate-300 text-[10px] leading-relaxed">
                  Restricted to <strong>ismailkasumba8@gmail.com</strong>. Exclusive authority to delete learners, manage passwords, restore backups, and configure system rules.
                </p>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1">
                <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Academic Staff / Teachers</span>
                </div>
                <p className="text-slate-300 text-[10px] leading-relaxed">
                  Requires teacher password. Permitted to score continuous assessments, edit marks, and write remarks. Student deletion is locked.
                </p>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 space-y-1">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Parents / Guardians</span>
                </div>
                <p className="text-slate-300 text-[10px] leading-relaxed">
                  <strong>Strictly Read-Only</strong>. Requires Student Number to view child's card. Cannot alter scores, view other learners, or access administrative settings.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-slate-200">
            {saveSuccess ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                School settings successfully updated!
              </span>
            ) : (
              <span className="text-slate-500">
                Changes apply across all report cards and digital parent views.
              </span>
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs transition cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
      )}
    </div>
  );
};
