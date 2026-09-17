/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ParentPortal } from './components/ParentPortal';
import { TeacherPortal } from './components/TeacherPortal';
import { EcoImpactView } from './components/EcoImpactView';
import { AdminPanel } from './components/AdminPanel';
import { QuickCodesModal } from './components/QuickCodesModal';
import { PortalGateway } from './components/PortalGateway';
import { InstallAppModal } from './components/InstallAppModal';
import { PasswordPromptModal } from './components/PasswordPromptModal';
import { INITIAL_STUDENTS, DEFAULT_SCHOOL_SETTINGS } from './data/mockStudents';
import { INITIAL_ACTIVITY_LOGS } from './data/mockActivityLogs';
import { Student, SchoolSettings, UserRole, ActivityLog } from './types';
import { downloadStudentsCSV } from './utils/exportHelpers';
import { TreePine, ShieldCheck, Lock, AlertCircle, KeyRound, ArrowLeft } from 'lucide-react';

const STUDENTS_STORAGE_KEY = 'bdn_memorial_sss_students_db_v2';
const SETTINGS_STORAGE_KEY = 'bdn_memorial_sss_settings_v2';
const ACTIVITY_LOGS_STORAGE_KEY = 'bdn_memorial_sss_activity_logs_v1';

export default function App() {
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STUDENTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_STUDENTS;
  });

  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SCHOOL_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SCHOOL_SETTINGS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem(ACTIVITY_LOGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_ACTIVITY_LOGS;
  });

  const [activeTab, setActiveTab] = useState<'gateway' | 'parent' | 'teacher' | 'eco' | 'admin'>('gateway');
  // Default to guest to prevent unauthorized people from modifying data upon entry
  const [userRole, setUserRole] = useState<UserRole>('guest');
  const [masterEmail, setMasterEmail] = useState<string | null>(null);
  const [selectedStudentCode, setSelectedStudentCode] = useState<string>('');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [targetAuthRole, setTargetAuthRole] = useState<'teacher' | 'admin'>('teacher');

  // Sync to local storage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
    } catch {
      // ignore storage errors
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(schoolSettings));
    } catch {
      // ignore storage errors
    }
  }, [schoolSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVITY_LOGS_STORAGE_KEY, JSON.stringify(activityLogs));
    } catch {
      // ignore storage errors
    }
  }, [activityLogs]);

  // Activity Logger
  const handleLogActivity = (entry: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newLog: ActivityLog = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const handleClearActivityLogs = () => {
    setActivityLogs([]);
    try {
      localStorage.removeItem(ACTIVITY_LOGS_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  // Security-guarded Handlers (strictly enforces Teacher or Admin role)
  const handleUpdateStudent = (updatedStudent: Student) => {
    if (userRole !== 'teacher' && userRole !== 'admin') {
      handleLogActivity({
        status: 'FAILED',
        role: userRole,
        action: 'Unauthorized Gradebook Edit Blocked',
        identifier: updatedStudent.studentCode,
        details: `Access Denied: User role "${userRole}" attempted to alter student marks without teacher or admin clearance.`,
        deviceInfo: typeof window !== 'undefined' ? (navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser') : 'Browser',
      });
      alert('Security Block: You must be verified as a Teacher or Administrator to update marks or student records.');
      return;
    }

    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );

    handleLogActivity({
      status: 'SUCCESS',
      role: userRole,
      action: 'Student Academic Record Updated',
      identifier: updatedStudent.studentCode,
      details: `Marks/remarks updated for ${updatedStudent.fullName} (${updatedStudent.classGrade}) by ${userRole}.`,
      deviceInfo: typeof window !== 'undefined' ? (navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser') : 'Browser',
    });
  };

  const handleAddStudent = (newStudent: Student) => {
    if (userRole !== 'teacher' && userRole !== 'admin') {
      handleLogActivity({
        status: 'FAILED',
        role: userRole,
        action: 'Unauthorized Student Enrollment Blocked',
        identifier: newStudent.studentCode,
        details: `Access Denied: Attempted to enroll new student without teacher or admin clearance.`,
        deviceInfo: typeof window !== 'undefined' ? (navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser') : 'Browser',
      });
      alert('Security Block: Only authorized academic staff or administrators can enroll new learners.');
      return;
    }

    setStudents((prev) => [newStudent, ...prev]);

    handleLogActivity({
      status: 'SUCCESS',
      role: userRole,
      action: 'New Learner Enrolled',
      identifier: newStudent.studentCode,
      details: `Enrolled ${newStudent.fullName} into ${newStudent.classGrade} with access code ${newStudent.studentCode}.`,
      deviceInfo: typeof window !== 'undefined' ? (navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser') : 'Browser',
    });
  };

  const handleBatchUpdateStudents = (updatedStudentsList: Student[]) => {
    if (userRole !== 'teacher' && userRole !== 'admin') {
      handleLogActivity({
        status: 'FAILED',
        role: userRole,
        action: 'Unauthorized Batch Marks Update Blocked',
        identifier: 'Batch Marks Entry',
        details: `Access Denied: User role "${userRole}" attempted batch mark submission.`,
        deviceInfo: typeof window !== 'undefined' ? (navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser') : 'Browser',
      });
      alert('Security Block: You must be verified as a Teacher or Administrator to batch update marks.');
      return;
    }

    setStudents(updatedStudentsList);

    handleLogActivity({
      status: 'SUCCESS',
      role: userRole,
      action: 'Batch Marks & AOI Scores Committed',
      identifier: `${updatedStudentsList.length} Learners`,
      details: `Batch marks, AOI scores, and subject remarks committed to central report cards by ${userRole}.`,
      deviceInfo: typeof window !== 'undefined' ? (navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser') : 'Browser',
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    if (userRole !== 'admin') {
      handleLogActivity({
        status: 'FAILED',
        role: userRole,
        action: 'Unauthorized Learner Deletion Blocked',
        identifier: studentId,
        details: `Access Denied: Deleting student records requires Master Administrator privileges (ismailkasumba8@gmail.com).`,
        deviceInfo: typeof window !== 'undefined' ? (navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser') : 'Browser',
      });
      alert('Security Restriction: Only the Master Administrator (ismailkasumba8@gmail.com) is authorized to delete student records.');
      return;
    }

    const studentToDelete = students.find((s) => s.id === studentId);
    setStudents((prev) => prev.filter((s) => s.id !== studentId));

    handleLogActivity({
      status: 'SUCCESS',
      role: 'admin',
      action: 'Learner Record Deleted',
      identifier: studentToDelete?.studentCode || studentId,
      details: `Student ${studentToDelete?.fullName || studentId} permanently removed by Master Administrator.`,
      deviceInfo: typeof window !== 'undefined' ? (navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser') : 'Browser',
    });
  };

  const handleAddGuardianNote = (studentId: string, note: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const currentNotes = s.guardianNotes || [];
          return {
            ...s,
            guardianNotes: [...currentNotes, note],
          };
        }
        return s;
      })
    );
  };

  const handleResetData = () => {
    if (userRole !== 'admin') {
      alert('Security Restriction: Only the Master Administrator (ismailkasumba8@gmail.com) can reset the school database.');
      return;
    }

    if (confirm('Reset student database to original Bishop Dunstan Nsubuga Memorial SSS learners? Any custom marks entered will be restored to defaults.')) {
      setStudents(INITIAL_STUDENTS);
      setSchoolSettings(DEFAULT_SCHOOL_SETTINGS);
      setSelectedStudentCode('BDN-7821');
      localStorage.removeItem(STUDENTS_STORAGE_KEY);
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
      handleLogActivity({
        status: 'SUCCESS',
        role: 'admin',
        action: 'Database Restored to Baseline Defaults',
        identifier: 'System Reset',
        details: 'All learner marks and settings restored to school defaults by Master Administrator.',
        deviceInfo: typeof window !== 'undefined' ? (navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser') : 'Browser',
      });
    }
  };

  const handleRestoreBackup = (loadedStudents: Student[], loadedSettings?: SchoolSettings) => {
    if (userRole !== 'admin') {
      alert('Security Restriction: Only the Master Administrator can restore database backups.');
      return;
    }

    setStudents(loadedStudents);
    if (loadedSettings) {
      setSchoolSettings(loadedSettings);
    }
    handleLogActivity({
      status: 'SUCCESS',
      role: 'admin',
      action: 'Database Backup Restored',
      identifier: `${loadedStudents.length} Records`,
      details: `Database restored from backup with ${loadedStudents.length} students.`,
      deviceInfo: typeof window !== 'undefined' ? (navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser') : 'Browser',
    });
  };

  const handleUpdateSchoolSettings = (newSettings: SchoolSettings) => {
    if (userRole !== 'admin') {
      alert('Security Restriction: Only Master Administrator (ismailkasumba8@gmail.com) can update school settings.');
      return;
    }
    setSchoolSettings(newSettings);
    handleLogActivity({
      status: 'SUCCESS',
      role: 'admin',
      action: 'School Configurations & Passwords Updated',
      identifier: newSettings.schoolName,
      details: `Term settings and staff passwords updated by Master Administrator.`,
      deviceInfo: typeof window !== 'undefined' ? (navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser') : 'Browser',
    });
  };

  const handleViewStudentReport = (studentCode: string) => {
    setSelectedStudentCode(studentCode);
    setActiveTab('parent');
  };

  const handleSelectParent = (studentCode: string) => {
    setSelectedStudentCode(studentCode);
    setUserRole('parent');
    setActiveTab('parent');
  };

  const handleSelectTeacher = () => {
    setUserRole('teacher');
    setActiveTab('teacher');
  };

  const handleSelectAdmin = (email?: string) => {
    if (email) {
      setMasterEmail(email);
    }
    setUserRole('admin');
    setActiveTab('admin');
  };

  const handleQuickLogout = () => {
    const prevRole = userRole;
    setUserRole('guest');
    setMasterEmail(null);
    setSelectedStudentCode('');
    setActiveTab('gateway');
    handleLogActivity({
      status: 'SUCCESS',
      role: prevRole === 'guest' ? 'guest' : prevRole,
      action: 'Quick Logout & Session Lock',
      identifier: prevRole === 'admin' ? (masterEmail || schoolSettings.adminName) : (prevRole === 'teacher' ? 'Teacher' : (selectedStudentCode || 'Guest User')),
      details: 'Active session securely signed out and locked. Switched to protected 3-options entry screen.',
      deviceInfo: typeof window !== 'undefined' ? (navigator.userAgent.includes('Mobile') ? 'Mobile Device' : 'Desktop Browser') : 'Browser',
    });
  };

  const handleQuickDownloadCSV = () => {
    downloadStudentsCSV(students, schoolSettings);
  };

  // Math: 8 sheets per report card booklet * 3 terms * students count / 8,333 sheets per tree
  const estimatedTreesSpared = (students.length * 8 * 3) / 8333;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Application Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenInstallGuide={() => setIsInstallModalOpen(true)}
        treesSavedCount={estimatedTreesSpared}
        schoolSettings={schoolSettings}
        userRole={userRole}
        onQuickDownloadCSV={handleQuickDownloadCSV}
        onLogout={handleQuickLogout}
        onRequestAuth={(targetRole) => {
          setTargetAuthRole(targetRole);
          setAuthPromptOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'gateway' && (
          <PortalGateway
            schoolSettings={schoolSettings}
            students={students}
            onSelectParent={handleSelectParent}
            onSelectTeacher={handleSelectTeacher}
            onSelectAdmin={handleSelectAdmin}
            onLogActivity={handleLogActivity}
          />
        )}

        {activeTab === 'admin' && (
          userRole === 'admin' ? (
            <AdminPanel
              schoolSettings={schoolSettings}
              onUpdateSettings={handleUpdateSchoolSettings}
              students={students}
              onRestoreBackup={handleRestoreBackup}
              onResetData={handleResetData}
              onNavigateToTab={setActiveTab}
              activityLogs={activityLogs}
              onClearActivityLogs={handleClearActivityLogs}
              onAddActivityLog={handleLogActivity}
              onLogout={handleQuickLogout}
            />
          ) : (
            <div className="max-w-md mx-auto my-12 bg-white rounded-2xl p-8 border border-amber-200 shadow-md text-center space-y-4">
              <div className="w-14 h-14 bg-amber-100 text-amber-900 rounded-2xl flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-['Outfit',sans-serif]">
                Administrator Master Access Restricted
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Only <strong>ismailkasumba8@gmail.com</strong> is authorized to access all three portals and make administrative modifications to marks and records.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  onClick={() => {
                    setTargetAuthRole('admin');
                    setAuthPromptOpen(true);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-black text-amber-400 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Master Administrator Login</span>
                </button>
                <button
                  onClick={() => setActiveTab('gateway')}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to 3-Options</span>
                </button>
              </div>
            </div>
          )
        )}

        {activeTab === 'parent' && (
          <ParentPortal
            students={students}
            schoolSettings={schoolSettings}
            onAddGuardianNote={handleAddGuardianNote}
            selectedStudentCode={selectedStudentCode}
            onSelectStudentCode={(code) => setSelectedStudentCode(code)}
            onLogout={handleQuickLogout}
            userRole={userRole}
            masterEmail={masterEmail}
            onClearSelectedStudent={() => setSelectedStudentCode('')}
          />
        )}

        {activeTab === 'teacher' && (
          userRole === 'teacher' || userRole === 'admin' ? (
            <TeacherPortal
              students={students}
              schoolSettings={schoolSettings}
              userRole={userRole}
              onUpdateStudent={handleUpdateStudent}
              onBatchUpdateStudents={handleBatchUpdateStudents}
              onAddStudent={handleAddStudent}
              onDeleteStudent={handleDeleteStudent}
              onViewStudentReport={handleViewStudentReport}
              onLogout={handleQuickLogout}
            />
          ) : (
            <div className="max-w-md mx-auto my-12 bg-white rounded-2xl p-8 border border-indigo-200 shadow-md text-center space-y-4">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-900 rounded-2xl flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8 text-indigo-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-['Outfit',sans-serif]">
                Teacher Gradebook Restricted
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Unauthorized entry is blocked. Only authorized academic staff may input midterm marks, endterm exam scores, and learner remarks.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  onClick={() => {
                    setTargetAuthRole('teacher');
                    setAuthPromptOpen(true);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Enter Teacher Password</span>
                </button>
                <button
                  onClick={() => setActiveTab('gateway')}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to 3-Options</span>
                </button>
              </div>
            </div>
          )
        )}

        {activeTab === 'eco' && (
          <EcoImpactView
            students={students}
            onGoToParentPortal={() => setActiveTab('parent')}
          />
        )}
      </main>

      {/* Password Challenge Verification Modal */}
      <PasswordPromptModal
        isOpen={authPromptOpen}
        onClose={() => setAuthPromptOpen(false)}
        targetRole={targetAuthRole}
        schoolSettings={schoolSettings}
        onSuccess={(role, email) => {
          setUserRole(role);
          if (email) {
            setMasterEmail(email);
          }
          setActiveTab(role === 'admin' ? 'admin' : 'teacher');
        }}
        onLogActivity={handleLogActivity}
      />

      {/* Install App / Access Guide Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        schoolSettings={schoolSettings}
        students={students}
      />

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TreePine className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold text-slate-800">
              {schoolSettings.schoolName}
            </span>
            <span className="text-slate-400">|</span>
            <span>Paperless Digital Database & Parent Access Portal</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Administrator: {schoolSettings.adminName}
            </span>
            <span>{schoolSettings.centerNumber} • Masaka, Uganda</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
