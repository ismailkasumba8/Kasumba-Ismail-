import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  FileSpreadsheet, 
  TreePine, 
  CheckCircle2, 
  X, 
  Save, 
  Ticket, 
  UserPlus, 
  GraduationCap,
  Sparkles,
  BookOpen,
  Send,
  MessageSquare,
  Download,
  LogOut,
  ShieldCheck,
  Lock,
  AlertCircle,
  Users,
  CheckSquare,
  BarChart3
} from 'lucide-react';
import { Student, SubjectScore, SchoolSettings, UserRole, calculateGrade, computeStudentSummary } from '../types';
import { downloadStudentsCSV } from '../utils/exportHelpers';
import { SubjectTeacherPortal } from './teacher/SubjectTeacherPortal';
import { ClassTeacherPortal } from './teacher/ClassTeacherPortal';

interface TeacherPortalProps {
  students: Student[];
  schoolSettings?: SchoolSettings;
  userRole?: UserRole;
  onUpdateStudent: (student: Student) => void;
  onBatchUpdateStudents?: (students: Student[]) => void;
  onAddStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onViewStudentReport: (studentCode: string) => void;
  onLogout?: () => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  students,
  schoolSettings,
  userRole = 'teacher',
  onUpdateStudent,
  onBatchUpdateStudents,
  onAddStudent,
  onDeleteStudent,
  onViewStudentReport,
  onLogout,
}) => {
  // Sub-portal active view switcher
  const [activeSubView, setActiveSubView] = useState<'subject-teacher' | 'class-teacher' | 'directory'>('subject-teacher');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCodeSlipsOpen, setIsCodeSlipsOpen] = useState(false);

  // New student form state
  const [newFullName, setNewFullName] = useState('');
  const [newGender, setNewGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [newClass, setNewClass] = useState('Senior 2 - Baobab');
  const [newGuardianName, setNewGuardianName] = useState('');
  const [newGuardianPhone, setNewGuardianPhone] = useState('');
  const [newGuardianEmail, setNewGuardianEmail] = useState('');

  // Filtering for directory
  const classesList = Array.from(new Set(students.map((s) => s.classGrade)));

  const filteredStudents = students.filter((s) => {
    const matchesSearch = 
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass = selectedClass === 'ALL' || s.classGrade === selectedClass;

    return matchesSearch && matchesClass;
  });

  // High level metrics
  const totalStudents = students.length;
  const allSummaries = students.map(computeStudentSummary);
  const overallAvg = allSummaries.length > 0 
    ? Math.round(allSummaries.reduce((sum, s) => sum + s.percentage, 0) / allSummaries.length)
    : 0;
  const paperSavedTotal = totalStudents * 8; // 8 sheets of paper saved per report card

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(JSON.parse(JSON.stringify(student)));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    onUpdateStudent(editingStudent);
    setEditingStudent(null);
  };

  const handleSubjectScoreChange = (
    index: number,
    field: 'midtermScore' | 'endtermScore',
    value: number
  ) => {
    if (!editingStudent) return;
    const updatedSubjects = [...editingStudent.subjects];
    const sub = { ...updatedSubjects[index] };

    if (field === 'midtermScore') {
      sub.midtermScore = Math.min(30, Math.max(0, value));
      sub.aoiScore = sub.midtermScore;
    } else {
      sub.endtermScore = Math.min(70, Math.max(0, value));
    }

    sub.totalScore = sub.midtermScore + sub.endtermScore;
    const { grade } = calculateGrade(sub.totalScore);
    sub.grade = grade;

    updatedSubjects[index] = sub;
    setEditingStudent({ ...editingStudent, subjects: updatedSubjects });
  };

  const handleSubjectRemarkChange = (index: number, remark: string) => {
    if (!editingStudent) return;
    const updatedSubjects = [...editingStudent.subjects];
    updatedSubjects[index] = {
      ...updatedSubjects[index],
      teacherComment: remark,
    };
    setEditingStudent({ ...editingStudent, subjects: updatedSubjects });
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim()) return;

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newCode = `BDN-${randomDigits}`;

    const defaultSubjects: SubjectScore[] = [
      {
        id: `sub-m-${Date.now()}`,
        name: 'Mathematics',
        category: 'Core',
        midtermScore: 22,
        aoiScore: 22,
        endtermScore: 54,
        maxScore: 100,
        totalScore: 76,
        grade: 'B',
        classAverage: 65,
        teacherComment: 'Good analytical potential.',
        teacherName: 'Mr. Patrick Ssemwogerere',
      },
      {
        id: `sub-e-${Date.now()}`,
        name: 'English Language & Literature',
        category: 'Languages',
        midtermScore: 24,
        aoiScore: 24,
        endtermScore: 56,
        maxScore: 100,
        totalScore: 80,
        grade: 'A',
        classAverage: 68,
        teacherComment: 'Active participant in discussions.',
        teacherName: 'Ms. Grace Atim',
      },
      {
        id: `sub-s-${Date.now()}`,
        name: 'Physics & Chemistry',
        category: 'Sciences',
        midtermScore: 20,
        aoiScore: 20,
        endtermScore: 48,
        maxScore: 100,
        totalScore: 68,
        grade: 'C',
        classAverage: 62,
        teacherComment: 'Steady laboratory participation.',
        teacherName: 'Mr. David Okello',
      },
    ];

    const newStudentObj: Student = {
      id: `stu-${Date.now()}`,
      studentCode: newCode,
      fullName: newFullName.trim(),
      gender: newGender,
      dateOfBirth: '2011-03-15',
      classGrade: newClass,
      academicYear: schoolSettings?.academicYear || '2025/2026',
      term: schoolSettings?.currentTerm || 'Term 2',
      rollNumber: `S2-0${Math.floor(20 + Math.random() * 80)}`,
      guardianName: newGuardianName.trim() || 'Parent / Guardian',
      guardianPhone: newGuardianPhone.trim() || '+256 700 000 000',
      guardianEmail: newGuardianEmail.trim() || 'parent@example.com',
      attendanceDays: 60,
      totalSchoolDays: 65,
      conduct: {
        discipline: 'Very Good',
        punctuality: 'Very Good',
        leadership: 'Good',
        teamwork: 'Very Good',
      },
      classTeacherComment: 'Enrolled into Bishop Dunstan Nsubuga Memorial SSS academic register.',
      classTeacherName: 'Mr. David Okello',
      headteacherComment: 'Welcome to the school community.',
      headteacherName: schoolSettings?.headteacherName || 'Rev. Canon Dr. E. Ssentongo',
      nextTermBegins: '2026-09-22',
      feesStatus: 'Cleared',
      subjects: defaultSubjects,
      guardianNotes: [],
    };

    onAddStudent(newStudentObj);
    setIsAddModalOpen(false);
    setNewFullName('');
    setNewGuardianName('');
    setNewGuardianPhone('');
    setNewGuardianEmail('');
  };

  const handleBatchUpdate = onBatchUpdateStudents || ((stList: Student[]) => {
    stList.forEach(onUpdateStudent);
  });

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Role Protection & Permission Status Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white font-['Outfit',sans-serif]">
                Teacher Gradebook & Academic Portals
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                userRole === 'admin'
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-indigo-500 text-white'
              }`}>
                {userRole === 'admin' ? 'Master Admin Mode' : 'Teacher Mode'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Authorized academic session active. Subject teachers enter marks & AOI directly; Class teachers review compiled reports & tracking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 text-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Audit Trail Protected</span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Session</span>
            </button>
          )}
        </div>
      </div>

      {/* SUB-PORTAL WORKFLOW NAVIGATION TABS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* TAB 1: SUBJECT TEACHER SUB-PORTAL */}
          <button
            onClick={() => setActiveSubView('subject-teacher')}
            className={`p-3.5 rounded-xl text-left transition-all cursor-pointer flex items-center gap-3 ${
              activeSubView === 'subject-teacher'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              activeSubView === 'subject-teacher'
                ? 'bg-white/20 text-white'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold font-['Outfit',sans-serif]">
                  Subject Teacher Portal
                </span>
                <span className={`px-1.5 py-0.2 text-[9px] font-extrabold rounded uppercase ${
                  activeSubView === 'subject-teacher'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-200 text-emerald-950'
                }`}>
                  Direct Input
                </span>
              </div>
              <p className={`text-[11px] mt-0.5 line-clamp-1 ${
                activeSubView === 'subject-teacher' ? 'text-emerald-100' : 'text-slate-500'
              }`}>
                Batch entry for Marks, AOI & comments by Class, Stream & Subject
              </p>
            </div>
          </button>

          {/* TAB 2: CLASS TEACHER SUB-PORTAL */}
          <button
            onClick={() => setActiveSubView('class-teacher')}
            className={`p-3.5 rounded-xl text-left transition-all cursor-pointer flex items-center gap-3 ${
              activeSubView === 'class-teacher'
                ? 'bg-indigo-700 text-white shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              activeSubView === 'class-teacher'
                ? 'bg-white/20 text-white'
                : 'bg-indigo-100 text-indigo-800'
            }`}>
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold font-['Outfit',sans-serif]">
                  Class Teacher Portal
                </span>
                <span className={`px-1.5 py-0.2 text-[9px] font-extrabold rounded uppercase ${
                  activeSubView === 'class-teacher'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-200 text-indigo-950'
                }`}>
                  Tracker & Comments
                </span>
              </div>
              <p className={`text-[11px] mt-0.5 line-clamp-1 ${
                activeSubView === 'class-teacher' ? 'text-indigo-100' : 'text-slate-500'
              }`}>
                Submission tracker & aggregated report cards with final remarks
              </p>
            </div>
          </button>

          {/* TAB 3: MASTER LEARNER DIRECTORY */}
          <button
            onClick={() => setActiveSubView('directory')}
            className={`p-3.5 rounded-xl text-left transition-all cursor-pointer flex items-center gap-3 ${
              activeSubView === 'directory'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              activeSubView === 'directory'
                ? 'bg-white/20 text-white'
                : 'bg-slate-200 text-slate-700'
            }`}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold font-['Outfit',sans-serif]">
                  Learners Directory
                </span>
                <span className="text-[10px] text-slate-400">
                  ({totalStudents} Students)
                </span>
              </div>
              <p className={`text-[11px] mt-0.5 line-clamp-1 ${
                activeSubView === 'directory' ? 'text-slate-300' : 'text-slate-500'
              }`}>
                Register, individual score editing, slips & CSV exports
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* VIEW 1: SUBJECT TEACHER SUB-PORTAL (Direct Input, Class/Stream/Subject Filter, Batch Marks/AOI Roster & Save All) */}
      {activeSubView === 'subject-teacher' && (
        <SubjectTeacherPortal
          students={students}
          onBatchUpdateStudents={handleBatchUpdate}
          activeTeacherName={schoolSettings?.headteacherName || 'Department Subject Teacher'}
        />
      )}

      {/* VIEW 2: CLASS TEACHER SUB-PORTAL (Submission Tracker Dashboard & Main Report Card Final Summary Comments) */}
      {activeSubView === 'class-teacher' && (
        <ClassTeacherPortal
          students={students}
          schoolSettings={schoolSettings}
          onUpdateStudent={onUpdateStudent}
          onViewStudentReport={onViewStudentReport}
        />
      )}

      {/* VIEW 3: REGISTRAR & DIRECTORY */}
      {activeSubView === 'directory' && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Enrolled Learners
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 font-['Outfit',sans-serif]">
                  {totalStudents}
                </span>
                <span className="text-xs text-slate-500">Students</span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                Active in School Database
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Academic Average
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 font-['Outfit',sans-serif]">
                  {overallAvg}%
                </span>
                <span className="text-xs text-slate-500">Term 2</span>
              </div>
              <p className="text-[11px] text-blue-700 mt-1 font-medium">
                Across All Departments
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Paper Saved
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <TreePine className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-emerald-800 font-['Outfit',sans-serif]">
                  {paperSavedTotal}
                </span>
                <span className="text-xs text-emerald-700">Sheets</span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                Zero physical booklets printed
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Parent Code Slips
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Ticket className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <button
                  onClick={() => setIsCodeSlipsOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Print Code Slips</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">
                8 recyclable slips per sheet
              </p>
            </div>
          </div>

          {/* Controls: Search, Filter & Add Student */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-2 max-w-md">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by student name or BDN code..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="ALL">All Classes</option>
                  {classesList.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (schoolSettings) {
                      downloadStudentsCSV(students, schoolSettings);
                    }
                  }}
                  title="Download full marks sheet in Excel/CSV format"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition cursor-pointer border border-slate-300"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>Download CSV</span>
                </button>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  id="add-student-modal-btn"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-xl text-xs transition cursor-pointer shadow-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Add Learner</span>
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <th className="p-3">Access Code</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Class / Stream</th>
                    <th className="p-3 text-center">Term Avg %</th>
                    <th className="p-3 text-center">Grade</th>
                    <th className="p-3 text-center">Attendance</th>
                    <th className="p-3">Guardian</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        No learners match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => {
                      const summary = computeStudentSummary(s);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/70 transition">
                          <td className="p-3">
                            <span className="font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs">
                              {s.studentCode}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{s.fullName}</span>
                            <span className="text-[10px] text-slate-400">Roll: {s.rollNumber} • {s.gender}</span>
                          </td>
                          <td className="p-3 font-medium text-slate-700">{s.classGrade}</td>
                          <td className="p-3 text-center font-bold text-slate-900 text-sm">
                            {summary.percentage}%
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-bold text-xs ${
                              summary.overallGrade.startsWith('A') 
                                ? 'bg-emerald-100 text-emerald-800'
                                : summary.overallGrade === 'B'
                                ? 'bg-blue-100 text-blue-800'
                                : summary.overallGrade === 'C'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {summary.overallGrade}
                            </span>
                          </td>
                          <td className="p-3 text-center text-slate-600">
                            {s.attendanceDays}/{s.totalSchoolDays} ({summary.attendanceRate}%)
                          </td>
                          <td className="p-3">
                            <span className="text-slate-800 font-medium block">{s.guardianName}</span>
                            <span className="text-[10px] text-slate-500">{s.guardianPhone}</span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEdit(s)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer border border-slate-200"
                                title="Edit individual student marks"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>

                              <button
                                onClick={() => onViewStudentReport(s.studentCode)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer border border-slate-200"
                                title="View as parent report card"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-600" />
                              </button>

                              <button
                                onClick={() => {
                                  if (userRole !== 'admin') {
                                    alert('Security Restriction: Only Master Administrator (ismailkasumba8@gmail.com) can remove student records.');
                                    return;
                                  }
                                  if (confirm(`Remove student ${s.fullName} from database?`)) {
                                    onDeleteStudent(s.id);
                                  }
                                }}
                                className={`p-1.5 rounded-lg transition cursor-pointer ${
                                  userRole === 'admin'
                                    ? 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                                    : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100 opacity-60'
                                }`}
                                title={userRole === 'admin' ? "Delete student from database" : "Deletion locked: Requires Master Administrator authorization"}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* INDIVIDUAL EDIT STUDENT MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base">
                  {editingStudent.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif] flex items-center gap-2">
                    <span>Edit Marks & Evaluation: {editingStudent.fullName}</span>
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {editingStudent.studentCode}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingStudent.classGrade} • Roll: {editingStudent.rollNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{userRole === 'admin' ? 'Master Admin Clearance' : 'Teacher Clearance'}</span>
                </div>
                <button
                  onClick={() => setEditingStudent(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* SUBJECT SCORES TABLE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Subject Marks & Competencies
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    AOI Continuous Assessment (/30) + End of Term Exam (/70)
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <th className="p-2.5">Subject</th>
                        <th className="p-2.5 w-24 text-center">AOI (/30)</th>
                        <th className="p-2.5 w-24 text-center">Exam (/70)</th>
                        <th className="p-2.5 w-20 text-center">Total (100)</th>
                        <th className="p-2.5 w-16 text-center">Grade</th>
                        <th className="p-2.5">Teacher Remark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {editingStudent.subjects.map((sub, idx) => (
                        <tr key={sub.id} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-medium text-slate-900">
                            {sub.name}
                            <span className="text-[10px] text-slate-400 block">{sub.category}</span>
                          </td>
                          <td className="p-2.5 text-center">
                            <input
                              type="number"
                              min="0"
                              max="30"
                              value={sub.aoiScore ?? sub.midtermScore}
                              onChange={(e) =>
                                handleSubjectScoreChange(idx, 'midtermScore', parseInt(e.target.value) || 0)
                              }
                              className="w-16 text-center p-1 font-bold border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                            />
                          </td>
                          <td className="p-2.5 text-center">
                            <input
                              type="number"
                              min="0"
                              max="70"
                              value={sub.endtermScore}
                              onChange={(e) =>
                                handleSubjectScoreChange(idx, 'endtermScore', parseInt(e.target.value) || 0)
                              }
                              className="w-16 text-center p-1 font-bold border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                            />
                          </td>
                          <td className="p-2.5 text-center font-bold text-slate-900">
                            {sub.totalScore}%
                          </td>
                          <td className="p-2.5 text-center">
                            <span className="font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                              {sub.grade}
                            </span>
                          </td>
                          <td className="p-2.5">
                            <input
                              type="text"
                              value={sub.teacherComment}
                              onChange={(e) => handleSubjectRemarkChange(idx, e.target.value)}
                              placeholder="Add observation..."
                              className="w-full text-xs p-1 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* OVERALL TEACHER REMARKS & CONDUCT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Class Teacher's General Remarks
                  </label>
                  <textarea
                    rows={3}
                    value={editingStudent.classTeacherComment}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, classTeacherComment: e.target.value })
                    }
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Headteacher's Formal Remarks
                  </label>
                  <textarea
                    rows={3}
                    value={editingStudent.headteacherComment}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, headteacherComment: e.target.value })
                    }
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              {/* ATTENDANCE & CONDUCT */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block">Days Present</label>
                  <input
                    type="number"
                    value={editingStudent.attendanceDays}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        attendanceDays: Math.max(0, parseInt(e.target.value) || 0),
                      })
                    }
                    className="w-full p-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 mt-1 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block">Total Days</label>
                  <input
                    type="number"
                    value={editingStudent.totalSchoolDays}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        totalSchoolDays: Math.max(1, parseInt(e.target.value) || 65),
                      })
                    }
                    className="w-full p-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 mt-1 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block">Discipline</label>
                  <select
                    value={editingStudent.conduct?.discipline || 'Very Good'}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        conduct: { ...editingStudent.conduct, discipline: e.target.value as any },
                      })
                    }
                    className="w-full p-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 mt-1"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Very Good">Very Good</option>
                    <option value="Good">Good</option>
                    <option value="Needs Improvement">Needs Improvement</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block">Fees Status</label>
                  <select
                    value={editingStudent.feesStatus}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        feesStatus: e.target.value as any,
                      })
                    }
                    className="w-full p-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 mt-1"
                  >
                    <option value="Cleared">Cleared</option>
                    <option value="Pending Balance">Pending Balance</option>
                    <option value="Scholarship Recipient">Scholarship</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW STUDENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-800" />
                Register New Learner
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Learner Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g., Kato Brian Ssemanda"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Class & Stream
                  </label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  >
                    <option value="Senior 1 - Nile">Senior 1 - Nile</option>
                    <option value="Senior 1 - Baobab">Senior 1 - Baobab</option>
                    <option value="Senior 2 - Baobab">Senior 2 - Baobab</option>
                    <option value="Senior 2 - Nile">Senior 2 - Nile</option>
                    <option value="Senior 3 - Acacia">Senior 3 - Acacia</option>
                    <option value="Senior 4 - Crane">Senior 4 - Crane</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Guardian / Parent Full Name
                </label>
                <input
                  type="text"
                  value={newGuardianName}
                  onChange={(e) => setNewGuardianName(e.target.value)}
                  placeholder="e.g., Mrs. Florence Namubiru"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Guardian Phone
                  </label>
                  <input
                    type="tel"
                    value={newGuardianPhone}
                    onChange={(e) => setNewGuardianPhone(e.target.value)}
                    placeholder="+256 701 ..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Guardian Email
                  </label>
                  <input
                    type="email"
                    value={newGuardianEmail}
                    onChange={(e) => setNewGuardianEmail(e.target.value)}
                    placeholder="parent@example.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900">
                <p className="font-semibold">🌿 Paperless Automation:</p>
                <p>A unique Student Access Code (e.g. <code>BDN-XXXX</code>) will be auto-generated for the guardian to lookup results instantly.</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-xl transition cursor-pointer shadow-xs"
                >
                  Register & Generate Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PARENT CODE SLIPS MODAL (Eco-Friendly Cutout Slips) */}
      {isCodeSlipsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif] flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-amber-600" />
                  Parent Access Code Slips (Eco-Friendly)
                </h3>
                <p className="text-xs text-slate-500">
                  Instead of printing 8-page paper booklets per student, print this single sheet of recyclable slips (8 students per page).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Print Slips
                </button>
                <button
                  onClick={() => setIsCodeSlipsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
              {students.map((s) => (
                <div key={s.id} className="border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/70 text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-emerald-900 text-xs uppercase tracking-wider">
                      {schoolSettings?.schoolName || 'Bishop Dunstan Nsubuga Memorial SSS'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {schoolSettings?.currentTerm || 'Term 2'}, {schoolSettings?.academicYear || '2025/2026'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Student Name</span>
                    <strong className="text-slate-900 text-sm font-bold block">{s.fullName}</strong>
                    <span className="text-slate-600 text-[11px]">{s.classGrade}</span>
                  </div>
                  <div className="bg-white border border-emerald-200 rounded-lg p-2.5 text-center">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Parent Portal Access Code</span>
                    <span className="font-mono text-lg font-extrabold text-emerald-800 tracking-wider">
                      {s.studentCode}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight text-center">
                    Scan school link or enter code at <strong>portal.ecoreport.school</strong> to view your child's complete digital marks & teacher comments.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
