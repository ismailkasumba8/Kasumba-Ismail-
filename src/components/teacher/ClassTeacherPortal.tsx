import React, { useState, useMemo } from 'react';
import { 
  Users, 
  GraduationCap, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  Eye, 
  Save, 
  Edit3, 
  Sparkles, 
  Send, 
  Check, 
  X, 
  ChevronRight,
  TrendingUp,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { Student, SchoolSettings, computeStudentSummary } from '../../types';

interface ClassTeacherPortalProps {
  students: Student[];
  schoolSettings?: SchoolSettings;
  onUpdateStudent: (student: Student) => void;
  onViewStudentReport: (studentCode: string) => void;
}

const COMMON_CURRICULUM_SUBJECTS = [
  { name: 'Mathematics', teacher: 'Mr. Patrick Ssemwogerere', category: 'Core' },
  { name: 'English Language & Literature', teacher: 'Ms. Grace Atim', category: 'Languages' },
  { name: 'Physics & Chemistry', teacher: 'Mr. David Okello', category: 'Sciences' },
  { name: 'Biology & Health Sciences', teacher: 'Dr. Jane Nakato', category: 'Sciences' },
  { name: 'Geography & Environmental Studies', teacher: 'Mr. Ronald Musoke', category: 'Humanities' },
  { name: 'History & Political Educ.', teacher: 'Mrs. Florence Namubiru', category: 'Humanities' },
  { name: 'ICT & Digital Tech', teacher: 'Eng. Isaac Katende', category: 'Vocational' },
  { name: 'Agriculture & Nutrition', teacher: 'Mr. Samuel Mukasa', category: 'Vocational' },
  { name: 'Entrepreneurship Education', teacher: 'Ms. Betty Nabawanuka', category: 'Vocational' },
  { name: 'Religious Education (CRE / IRE)', teacher: 'Rev. J. Wamala', category: 'Humanities' },
];

const PRESET_SUMMARY_COMMENTS = [
  'A disciplined, hardworking learner who has shown outstanding academic growth this term.',
  'Demonstrates great potential and peer leadership. Needs to balance revision time across all sciences.',
  'Pleasant attitude and consistent effort. Encouraged to participate more actively in classroom discussions.',
  'Very focused in continuous assessments. Continued practice will secure distinctions in terminal UNEB papers.',
  'Shows commendable dedication to co-curricular and environmental duties. Keep up the high standard.',
];

export const ClassTeacherPortal: React.FC<ClassTeacherPortalProps> = ({
  students,
  schoolSettings,
  onUpdateStudent,
  onViewStudentReport,
}) => {
  // Extract classes and streams
  const classGrades = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => set.add(s.classGrade));
    return Array.from(set);
  }, [students]);

  const [selectedClassGrade, setSelectedClassGrade] = useState<string>(
    classGrades[0] || 'Senior 2 - Baobab'
  );

  // Active student for the final summary comment modal/drawer
  const [commentingStudent, setCommentingStudent] = useState<Student | null>(null);
  const [draftComment, setDraftComment] = useState<string>('');
  const [draftDiscipline, setDraftDiscipline] = useState<'Excellent' | 'Very Good' | 'Good' | 'Needs Improvement'>('Very Good');
  const [draftPunctuality, setDraftPunctuality] = useState<'Excellent' | 'Very Good' | 'Good' | 'Needs Improvement'>('Very Good');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Students belonging to this specific class & stream
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classGrade === selectedClassGrade);
  }, [students, selectedClassGrade]);

  // Compute Subject Submission Tracker data
  const submissionTracker = useMemo(() => {
    if (classStudents.length === 0) return [];

    return COMMON_CURRICULUM_SUBJECTS.map((curricSub) => {
      // Check how many students in this class have marks for this subject
      let submittedCount = 0;
      let latestTimestamp: string | undefined = undefined;

      classStudents.forEach((st) => {
        const matchingSub = st.subjects.find(
          (sub) => sub.name.toLowerCase().includes(curricSub.name.toLowerCase()) ||
                   curricSub.name.toLowerCase().includes(sub.name.toLowerCase())
        );

        if (matchingSub && matchingSub.totalScore > 0) {
          submittedCount++;
          if (matchingSub.submittedAt) {
            latestTimestamp = matchingSub.submittedAt;
          }
        }
      });

      const isCompleted = submittedCount === classStudents.length;
      const isPartiallySubmitted = submittedCount > 0 && submittedCount < classStudents.length;

      return {
        ...curricSub,
        submittedCount,
        totalStudents: classStudents.length,
        status: isCompleted ? ('COMPLETED' as const) : isPartiallySubmitted ? ('PARTIAL' as const) : ('PENDING' as const),
        latestTimestamp: latestTimestamp || (submittedCount > 0 ? 'Today' : undefined),
      };
    });
  }, [classStudents]);

  const completedSubjectsCount = submissionTracker.filter((s) => s.status === 'COMPLETED').length;
  const totalSubjectsCount = submissionTracker.length;
  const progressPercent = totalSubjectsCount > 0 ? Math.round((completedSubjectsCount / totalSubjectsCount) * 100) : 0;

  // Open modal to edit Class Teacher Comment
  const handleOpenCommentModal = (student: Student) => {
    setCommentingStudent(student);
    setDraftComment(student.classTeacherComment || '');
    setDraftDiscipline(student.conduct?.discipline || 'Very Good');
    setDraftPunctuality(student.conduct?.punctuality || 'Very Good');
  };

  // Save final Class Teacher Comment
  const handleSaveClassTeacherComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentingStudent) return;

    const updated: Student = {
      ...commentingStudent,
      classTeacherComment: draftComment.trim() || 'Satisfactory academic progress and good character conduct.',
      conduct: {
        ...commentingStudent.conduct,
        discipline: draftDiscipline,
        punctuality: draftPunctuality,
      },
    };

    onUpdateStudent(updated);
    setCommentingStudent(null);
    setSaveToast(`✓ Final class teacher remarks successfully saved for ${updated.fullName}!`);
    setTimeout(() => setSaveToast(null), 4000);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* HEADER & CLASS STREAM SELECTOR */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-700 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
                Class Teacher Portal & Report Card Review
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Oversee aggregated learner records, track subject submissions from department teachers, and enter final summary comments.
              </p>
            </div>
          </div>
        </div>

        {/* Class Selection Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider shrink-0">
            Active Class:
          </label>
          <select
            value={selectedClassGrade}
            onChange={(e) => setSelectedClassGrade(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
          >
            {classGrades.map((cg) => (
              <option key={cg} value={cg}>
                {cg}
              </option>
            ))}
          </select>
        </div>
      </div>

      {saveToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* SUBMISSION TRACKER: DASHBOARD VIEW SHOWING SUBJECT TEACHERS MARKS / AOI STATUS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-indigo-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 font-['Outfit',sans-serif]">
                Subject Teacher Marks & AOI Submission Tracker
              </h4>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                progressPercent === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
              }`}>
                {completedSubjectsCount}/{totalSubjectsCount} Submitted ({progressPercent}%)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live audit showing which subject teachers have completed vs. have pending mark submissions for {selectedClassGrade}.
            </p>
          </div>

          {/* Mini progress bar */}
          <div className="w-full sm:w-48 space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-600">
              <span>Class Clearance</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-700 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* TRACKER GRID */}
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {submissionTracker.map((item, idx) => {
              const isDone = item.status === 'COMPLETED';
              const isPartial = item.status === 'PARTIAL';

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all text-xs space-y-2 ${
                    isDone
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : isPartial
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-slate-900 truncate" title={item.name}>
                      {item.name}
                    </span>
                    {isDone ? (
                      <span className="shrink-0 inline-flex items-center text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                        <Check className="w-3 h-3 mr-0.5" />
                        Submitted
                      </span>
                    ) : isPartial ? (
                      <span className="shrink-0 inline-flex items-center text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                        <Clock className="w-3 h-3 mr-0.5" />
                        Partial
                      </span>
                    ) : (
                      <span className="shrink-0 inline-flex items-center text-[10px] font-bold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-600">
                    <div className="truncate font-medium">{item.teacher}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                      <span>
                        {item.submittedCount} / {item.totalStudents} learners
                      </span>
                      {item.latestTimestamp && (
                        <span className="text-emerald-700 font-semibold">{item.latestTimestamp}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AGGREGATED MAIN REPORT CARDS & FINAL CLASS TEACHER COMMENTS ROSTER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                Aggregated Learner Terminal Cards ({classStudents.length} Students)
              </h4>
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[10px] font-bold">
                {selectedClassGrade}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review finalized subject scores, total academic averages, and enter or edit the official Class Teacher Summary Comment.
            </p>
          </div>
        </div>

        {classStudents.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">
            No learners found for this class grade.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {classStudents.map((student, sIdx) => {
              const summary = computeStudentSummary(student);

              return (
                <div
                  key={student.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/60 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Student Basic Info & Averages */}
                  <div className="space-y-1 min-w-[240px]">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
                        {sIdx + 1}
                      </span>
                      <span className="font-bold text-sm text-slate-900 font-['Outfit',sans-serif]">
                        {student.fullName}
                      </span>
                      <span className="font-mono text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {student.studentCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 pl-8">
                      <span>Roll: {student.rollNumber}</span>
                      <span>•</span>
                      <span>Attendance: {summary.attendanceRate}%</span>
                      <span>•</span>
                      <span
                        className={`font-semibold ${
                          student.feesStatus === 'Cleared'
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        Fees: {student.feesStatus}
                      </span>
                    </div>

                    {/* Performance Summary Pill */}
                    <div className="flex items-center gap-2 pl-8 pt-1">
                      <span className="text-xs font-bold text-slate-700">
                        Average: {summary.percentage}%
                      </span>
                      <span className="text-[11px] px-2 py-0.2 rounded bg-indigo-100 text-indigo-900 font-bold">
                        Grade {summary.overallGrade}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        ({student.subjects.length} subjects recorded)
                      </span>
                    </div>
                  </div>

                  {/* Class Teacher Comment Display / Edit Trigger */}
                  <div className="flex-1 max-w-xl pl-0 sm:pl-8 lg:pl-0">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-indigo-600" />
                          <span>Class Teacher Final Summary Comment</span>
                        </span>
                        <button
                          onClick={() => handleOpenCommentModal(student)}
                          className="text-[11px] text-indigo-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit Remark</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate-700 italic line-clamp-2">
                        "{student.classTeacherComment || 'No comment added yet. Click to insert term summary remark.'}"
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 font-medium">
                        <span>Discipline: <strong>{student.conduct?.discipline || 'Good'}</strong></span>
                        <span>•</span>
                        <span>Punctuality: <strong>{student.conduct?.punctuality || 'Good'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: View Complete Aggregated Terminal Card */}
                  <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                    <button
                      onClick={() => handleOpenCommentModal(student)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Comment</span>
                    </button>

                    <button
                      onClick={() => onViewStudentReport(student.studentCode)}
                      className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Full Card</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: INPUT FIELD ON MAIN REPORT CARD FOR CLASS TEACHER SUMMARY COMMENT */}
      {commentingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                  Official Terminal Evaluation
                </span>
                <h3 className="text-base font-bold font-['Outfit',sans-serif]">
                  Final Summary Comment for {commentingStudent.fullName}
                </h3>
                <span className="text-xs text-slate-300">
                  {commentingStudent.studentCode} • {commentingStudent.classGrade}
                </span>
              </div>
              <button
                onClick={() => setCommentingStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveClassTeacherComment} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Class Teacher's Summary Remark:
                </label>
                <textarea
                  rows={4}
                  value={draftComment}
                  onChange={(e) => setDraftComment(e.target.value)}
                  placeholder="Write an insightful assessment of the learner's academic growth, discipline, and personal conduct..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:bg-white focus:outline-none transition leading-relaxed"
                />
              </div>

              {/* Preset Comments Chips */}
              <div>
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Click to insert quick standard remarks:</span>
                </span>
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {PRESET_SUMMARY_COMMENTS.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setDraftComment(preset)}
                      className="w-full text-left text-[11px] p-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-slate-700 transition cursor-pointer"
                    >
                      "{preset}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Conduct Evaluation Selectors */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Discipline Rating:
                  </label>
                  <select
                    value={draftDiscipline}
                    onChange={(e) => setDraftDiscipline(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Very Good">Very Good</option>
                    <option value="Good">Good</option>
                    <option value="Needs Improvement">Needs Improvement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Punctuality & Attendance:
                  </label>
                  <select
                    value={draftPunctuality}
                    onChange={(e) => setDraftPunctuality(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Very Good">Very Good</option>
                    <option value="Good">Good</option>
                    <option value="Needs Improvement">Needs Improvement</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCommentingStudent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-700 hover:bg-indigo-800 text-white transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Summary Remark</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
