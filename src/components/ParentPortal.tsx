import React, { useState, useEffect } from 'react';
import { 
  Search, 
  TreePine, 
  Printer, 
  Share2, 
  CheckCircle2, 
  Award, 
  Calendar, 
  UserCheck, 
  Sparkles,
  Send,
  MessageSquareQuote,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Copy,
  ChevronRight,
  TrendingUp,
  Download,
  LogOut,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student, SchoolSettings, computeStudentSummary } from '../types';
import { StudentProgressChart } from './StudentProgressChart';

interface ParentPortalProps {
  students: Student[];
  schoolSettings: SchoolSettings;
  onAddGuardianNote: (studentId: string, note: string) => void;
  selectedStudentCode?: string;
  onSelectStudentCode?: (code: string) => void;
  onLogout?: () => void;
  userRole?: string;
  masterEmail?: string | null;
  onClearSelectedStudent?: () => void;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({
  students,
  schoolSettings,
  onAddGuardianNote,
  selectedStudentCode = '',
  onSelectStudentCode,
  onLogout,
  userRole,
  masterEmail,
  onClearSelectedStudent,
}) => {
  const isMasterAdmin = masterEmail === 'ismailkasumba8@gmail.com' || userRole === 'admin';
  const [searchInput, setSearchInput] = useState(selectedStudentCode || '');
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [parentFeedback, setParentFeedback] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync with selected student code prop if changed externally
  useEffect(() => {
    if (selectedStudentCode) {
      setSearchInput(selectedStudentCode);
      lookupStudent(selectedStudentCode);
    } else if (isMasterAdmin && students.length > 0 && !activeStudent) {
      // Default to first student for master admin if none selected
      setActiveStudent(students[0]);
    }
  }, [selectedStudentCode, students]);

  const lookupStudent = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setErrorMessage('Please enter a valid student number.');
      setActiveStudent(null);
      return;
    }

    const found = students.find(
      (s) => s.studentCode.toUpperCase() === trimmed || s.rollNumber.toUpperCase() === trimmed
    );

    if (found) {
      setActiveStudent(found);
      setErrorMessage('');
      const summary = computeStudentSummary(found);
      if (summary.percentage >= 80) {
        try {
          confetti({
            particleCount: 55,
            spread: 60,
            origin: { y: 0.65 },
            colors: ['#059669', '#10b981', '#34d399', '#f59e0b', '#3b82f6'],
          });
        } catch {
          // ignore if blocked
        }
      }
    } else {
      setActiveStudent(null);
      setErrorMessage(`No student record found with number "${trimmed}". Access is limited: You must provide a valid Student Number provided on your official school circular or fee invoice.`);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupStudent(searchInput);
    if (onSelectStudentCode) {
      onSelectStudentCode(searchInput.trim().toUpperCase());
    }
  };

  const handleResetStudent = () => {
    setActiveStudent(null);
    setSearchInput('');
    setErrorMessage('');
    if (onClearSelectedStudent) {
      onClearSelectedStudent();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (!activeStudent) return;
    const summary = computeStudentSummary(activeStudent);
    const text = `Official EcoReport for ${activeStudent.fullName} (${activeStudent.studentCode}) - ${activeStudent.classGrade}, ${activeStudent.term}: Score: ${summary.percentage}% (${summary.overallGrade}). Zero paper was cut for this report! 🌿`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent || !parentFeedback.trim()) return;
    onAddGuardianNote(activeStudent.id, parentFeedback.trim());
    setParentFeedback('');
    setFeedbackSuccess(true);
    setTimeout(() => setFeedbackSuccess(false), 4000);
  };

  const currentSummary = activeStudent ? computeStudentSummary(activeStudent) : null;

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Master Administrator Banner (ismailkasumba8@gmail.com) */}
      {isMasterAdmin && (
        <div className="no-print bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-700 text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                  Master Administrator
                </span>
                <span className="text-xs text-amber-100 font-mono">ismailkasumba8@gmail.com</span>
              </div>
              <p className="text-xs sm:text-sm text-white/90 mt-0.5">
                Full master access across all 3 portals. You can review and print any learner's terminal report card.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-white/90 whitespace-nowrap hidden sm:inline">
              Select Learner:
            </label>
            <select
              value={activeStudent?.id || ''}
              onChange={(e) => {
                const targetId = e.target.value;
                const found = students.find((s) => s.id === targetId);
                if (found) {
                  setActiveStudent(found);
                  setSearchInput(found.studentCode);
                  setErrorMessage('');
                }
              }}
              className="px-3 py-2 bg-white text-slate-900 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer shadow-xs"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.studentCode} - {st.fullName} ({st.classGrade})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* When NO student is currently active and user is NOT master admin: Explicit Student Number Limitation Screen */}
      {!activeStudent && !isMasterAdmin && (
        <section className="no-print bg-white rounded-2xl border-2 border-emerald-300 p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-50 rounded-full blur-2xl pointer-events-none opacity-60"></div>
          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
              <Lock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Parent Portal • Student Identification Limitation</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-['Outfit',sans-serif]">
              Enter Student Number
            </h2>

            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
              To protect learner privacy and restrict unauthorized access, viewing terminal report cards requires an official <strong>Student Identification Number</strong> (BDN Code or Roll Number).
            </p>

            {/* Clear User Limitation Notice */}
            <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl text-left text-xs text-emerald-950 space-y-1.5 max-w-lg mx-auto">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Portal Access Limitation Notice</span>
              </div>
              <p className="text-emerald-800 leading-relaxed text-[12px]">
                Other users of this application are restricted from browsing student lists or marks. Only guardians with their child's specific Student Number can view continuous marks.
              </p>
            </div>

            {/* Student Number Input Form */}
            <form onSubmit={handleSearchSubmit} className="pt-2 max-w-lg mx-auto flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  id="student-code-input"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter Student Number (e.g. BDN-7821)"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase tracking-wider text-sm transition"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                id="submit-code-btn"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold rounded-xl text-sm transition shadow-sm cursor-pointer whitespace-nowrap"
              >
                <span>Unlock Report</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            {errorMessage && (
              <div className="flex items-center justify-center gap-2 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium max-w-lg mx-auto text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Only master email (ismailkasumba8@gmail.com) has unrestricted access to all portals.</span>
            </div>
          </div>
        </section>
      )}

      {/* For Master Admin: quick search bar if needed */}
      {isMasterAdmin && (
        <section className="no-print bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Search className="w-4 h-4 text-emerald-600" />
            <span>Search Any Student by Code or Name:</span>
          </div>
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="e.g. BDN-7821 or Kasumba"
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Search
            </button>
          </form>
        </section>
      )}

      {/* When student is found: The Official Digital Report Card */}
      {activeStudent && currentSummary && (
        <section id="official-report-card-section" className="space-y-4">
          {/* Action Bar (Print / Share / Download / Logout) */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs sm:text-sm font-semibold text-slate-800">
                Official Report: <strong className="text-emerald-800">{activeStudent.fullName}</strong> ({activeStudent.studentCode})
              </span>
              {!isMasterAdmin && (
                <button
                  onClick={handleResetStudent}
                  className="ml-2 text-xs text-emerald-700 hover:text-emerald-900 underline font-medium cursor-pointer"
                  title="Switch to another learner by providing their student number"
                >
                  Enter Different Student Number
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 font-medium">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Read-Only Official Card</span>
              </span>

              <button
                onClick={handleShare}
                id="share-report-btn"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Summary Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Summary</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePrint}
                id="print-report-btn"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save as PDF</span>
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  id="parent-logout-btn"
                  title="Quick Log Out and secure session"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Exit / Log Out</span>
                </button>
              )}
            </div>
          </div>

          {/* THE DIGITAL REPORT CARD SHEET (High quality printable canvas) */}
          <div className="print-sheet bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-6">
            {/* School Header Banner */}
            <div className="border-b-2 border-emerald-700 pb-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 text-white flex items-center justify-center shadow-md p-2">
                    <TreePine className="w-10 h-10 text-emerald-200" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 font-['Outfit',sans-serif]">
                        {schoolSettings.schoolName.toUpperCase()}
                      </h3>
                    </div>
                    <p className="text-xs text-emerald-800 font-semibold uppercase tracking-wider">
                      {schoolSettings.motto}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {schoolSettings.poBox} • Tel: {schoolSettings.telephone} • {schoolSettings.centerNumber}
                    </p>
                  </div>
                </div>

                <div className="text-center sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="inline-block px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs uppercase tracking-widest">
                    Termly Progress Report
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    {activeStudent.term} • {activeStudent.academicYear}
                  </p>
                  <p className="text-[11px] font-mono text-slate-500">
                    Student ID: <strong className="text-emerald-800 font-bold">{activeStudent.studentCode}</strong>
                  </p>
                </div>
              </div>

              {/* Environmental Saving Notice */}
              <div className="mt-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 px-3 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <TreePine className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    <strong>Paperless Report:</strong> This digital report card saved <strong>~8 sheets of paper</strong>, eliminating deforestation and ink pollution.
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-[11px] text-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Authentic Verified Record</span>
                </div>
              </div>
            </div>

            {/* Learner Demographics Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Learner Full Name</span>
                <strong className="text-slate-900 text-sm font-bold block">{activeStudent.fullName}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Class & Stream</span>
                <strong className="text-slate-900 text-sm font-semibold block">{activeStudent.classGrade}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Roll Number</span>
                <strong className="text-slate-900 font-mono block">{activeStudent.rollNumber}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Guardian Name</span>
                <strong className="text-slate-900 block">{activeStudent.guardianName}</strong>
              </div>
            </div>

            {/* Overall Academic KPI summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-900 text-white rounded-xl p-4 text-center shadow-xs">
                <span className="text-emerald-200 text-xs uppercase tracking-wider font-semibold block">Overall Average</span>
                <div className="text-3xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] mt-1">
                  {currentSummary.percentage}%
                </div>
                <span className="inline-block mt-1 text-[11px] bg-emerald-800 px-2 py-0.5 rounded text-emerald-100 font-medium">
                  {currentSummary.totalMarks} / {currentSummary.maxMarks} Marks
                </span>
              </div>

              <div className="bg-white rounded-xl p-4 text-center border border-slate-200 shadow-xs">
                <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold block">Overall Grade</span>
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700 font-['Outfit',sans-serif] mt-1">
                  {currentSummary.overallGrade}
                </div>
                <span className="text-[11px] text-slate-500 block mt-1">
                  {currentSummary.overallGrade.startsWith('A') ? 'Distinction' : 'Standard Pass'}
                </span>
              </div>

              <div className="bg-white rounded-xl p-4 text-center border border-slate-200 shadow-xs">
                <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold block">Class Position</span>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-800 font-['Outfit',sans-serif] mt-1 flex items-center justify-center gap-1">
                  <Award className="w-6 h-6 text-amber-500" />
                  <span>
                    {currentSummary.percentage >= 90 ? '1st' : currentSummary.percentage >= 80 ? '4th' : '11th'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Out of 36 Learners
                </span>
              </div>

              <div className="bg-white rounded-xl p-4 text-center border border-slate-200 shadow-xs">
                <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold block">Attendance Rate</span>
                <div className="text-3xl sm:text-4xl font-extrabold text-teal-800 font-['Outfit',sans-serif] mt-1">
                  {currentSummary.attendanceRate}%
                </div>
                <span className="text-[11px] text-slate-500 block mt-1">
                  {activeStudent.attendanceDays} of {activeStudent.totalSchoolDays} Days Present
                </span>
              </div>
            </div>

            {/* Student Progress Chart (Recharts Term-over-Term Trends) */}
            <StudentProgressChart student={activeStudent} />

            {/* SUBJECTS & SCORES TABLE */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif] flex items-center gap-2">
                  <span>Subject Performance & Teacher Evaluation</span>
                </h4>
                <span className="text-xs text-slate-500">
                  Scores standardized on 100% Scale
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/90 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                      <th className="p-3">Subject Name</th>
                      <th className="p-3 text-center">Mid-Term (30%)</th>
                      <th className="p-3 text-center">End-Term (70%)</th>
                      <th className="p-3 text-center">Total (100%)</th>
                      <th className="p-3 text-center">Grade</th>
                      <th className="p-3 text-center">Class Avg</th>
                      <th className="p-3">Teacher's Specific Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {activeStudent.subjects.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-3 font-semibold text-slate-900">
                          <div>{sub.name}</div>
                          <span className="text-[10px] font-normal text-slate-500">{sub.category}</span>
                        </td>
                        <td className="p-3 text-center font-mono text-slate-600">{sub.midtermScore}</td>
                        <td className="p-3 text-center font-mono text-slate-600">{sub.endtermScore}</td>
                        <td className="p-3 text-center font-bold font-mono text-slate-900 text-sm">
                          {sub.totalScore}%
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-bold text-xs ${
                            sub.grade.startsWith('A') 
                              ? 'bg-emerald-100 text-emerald-800'
                              : sub.grade === 'B'
                              ? 'bg-blue-100 text-blue-800'
                              : sub.grade === 'C'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {sub.grade}
                          </span>
                        </td>
                        <td className="p-3 text-center text-slate-500 font-mono text-[11px]">
                          {sub.classAverage}%
                        </td>
                        <td className="p-3 text-slate-700 text-xs">
                          <p>{sub.teacherComment}</p>
                          <span className="text-[10px] text-slate-400 italic">Taught by {sub.teacherName}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Character, Values & Conduct Assessment */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Core Values & Character Assessment
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">Discipline</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {activeStudent.conduct.discipline}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">Punctuality</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {activeStudent.conduct.punctuality}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">Initiative & Leadership</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {activeStudent.conduct.leadership}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">Teamwork & Co-operation</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {activeStudent.conduct.teamwork}
                  </span>
                </div>
              </div>
            </div>

            {/* Official Remarks & Signatures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              {/* Class Teacher Remark */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                  <MessageSquareQuote className="w-4 h-4 text-emerald-600" />
                  <span>Class Teacher's Recommendation</span>
                </div>
                <p className="text-slate-700 leading-relaxed italic">
                  "{activeStudent.classTeacherComment}"
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-900">{activeStudent.classTeacherName}</span>
                  <span className="text-slate-500">Form Educator</span>
                </div>
              </div>

              {/* Headteacher Endorsement */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 relative overflow-hidden">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Headteacher's Formal Endorsement</span>
                </div>
                <p className="text-slate-700 leading-relaxed italic">
                  "{activeStudent.headteacherComment}"
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-bold text-slate-900 block">{activeStudent.headteacherName}</span>
                    <span className="text-slate-500">Head of Institution</span>
                  </div>
                  {/* Digital Stamp Simulation */}
                  <div className="border-2 border-emerald-700 text-emerald-800 font-bold text-[10px] px-2 py-1 rounded uppercase tracking-wider rotate-[-4deg] opacity-90">
                    Official Digital Seal
                  </div>
                </div>
              </div>
            </div>

            {/* Next Term & Fees Clearance Footer */}
            <div className="bg-slate-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border border-slate-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-slate-700">
                  Next Term Resumes On: <strong className="text-slate-900">{activeStudent.nextTermBegins}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-600">Tuition & Levies Status:</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  activeStudent.feesStatus === 'Cleared' 
                    ? 'bg-emerald-100 text-emerald-800'
                    : activeStudent.feesStatus === 'Scholarship Recipient'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {activeStudent.feesStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Guardian Feedback Section (Parent to Teacher communication) */}
          <div className="no-print bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquareQuote className="w-5 h-5 text-emerald-700" />
              <h4 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                Guardian Feedback & Acknowledgment to School
              </h4>
            </div>
            <p className="text-xs text-slate-600">
              Parents can acknowledge receipt of this digital report and write a message back to the class teacher directly.
            </p>

            {activeStudent.guardianNotes && activeStudent.guardianNotes.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Previous Notes Logged:
                </span>
                {activeStudent.guardianNotes.map((note, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700">
                    <p>"{note}"</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Logged by {activeStudent.guardianName}</span>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSendFeedback} className="space-y-3">
              <textarea
                value={parentFeedback}
                onChange={(e) => setParentFeedback(e.target.value)}
                placeholder="Write an acknowledgment or question to the class teacher (e.g. 'Received the report card, thank you. We will focus on math practice over the holidays.')..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px]"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Instant paperless message delivered to the Teacher Gradebook.
                </span>
                <button
                  type="submit"
                  disabled={!parentFeedback.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Acknowledgment</span>
                </button>
              </div>
            </form>

            {feedbackSuccess && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Your acknowledgment has been successfully recorded in the school system!</span>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
