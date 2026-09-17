import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Save, 
  Search, 
  CheckCircle2, 
  Sparkles, 
  Filter, 
  Users, 
  GraduationCap, 
  Layers, 
  Check, 
  RotateCcw,
  Clock,
  Send,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Student, SubjectScore, calculateGrade } from '../../types';

interface SubjectTeacherPortalProps {
  students: Student[];
  onBatchUpdateStudents: (updatedStudents: Student[]) => void;
  activeTeacherName?: string;
}

// Common secondary school subjects in Uganda
const SUBJECT_OPTIONS = [
  { name: 'Mathematics', category: 'Core' as const },
  { name: 'English Language & Literature', category: 'Languages' as const },
  { name: 'Physics & Chemistry', category: 'Sciences' as const },
  { name: 'Biology & Health Sciences', category: 'Sciences' as const },
  { name: 'Geography & Environmental Studies', category: 'Humanities' as const },
  { name: 'History & Political Educ.', category: 'Humanities' as const },
  { name: 'ICT & Digital Tech', category: 'Vocational' as const },
  { name: 'Agriculture & Nutrition', category: 'Vocational' as const },
  { name: 'Entrepreneurship Education', category: 'Vocational' as const },
  { name: 'Religious Education (CRE / IRE)', category: 'Humanities' as const },
];

const COMMENT_PRESETS = [
  'Exemplary grasp of core concepts and creative integration.',
  'Active participant with consistent, high-standard coursework.',
  'Good conceptual understanding; needs extra practice on exams.',
  'Demonstrates steady progress; encouraged to review calculations.',
  'Commendable effort; should focus on structured written analysis.',
];

export const SubjectTeacherPortal: React.FC<SubjectTeacherPortalProps> = ({
  students,
  onBatchUpdateStudents,
  activeTeacherName = 'Subject Teacher',
}) => {
  // Extract distinct classes and streams from students
  const { classes, streams } = useMemo(() => {
    const classSet = new Set<string>();
    const streamSet = new Set<string>();

    students.forEach((s) => {
      // Handles formats like "Senior 2 - Baobab" or "Senior 1"
      if (s.classGrade.includes('-')) {
        const [cls, strm] = s.classGrade.split('-').map((str) => str.trim());
        if (cls) classSet.add(cls);
        if (strm) streamSet.add(strm);
      } else {
        classSet.add(s.classGrade.trim());
      }
    });

    const defaultClasses = ['Senior 1', 'Senior 2', 'Senior 3', 'Senior 4'];
    defaultClasses.forEach((c) => classSet.add(c));

    const defaultStreams = ['Baobab', 'Nile', 'Acacia', 'Crane', 'East', 'West'];
    defaultStreams.forEach((st) => streamSet.add(st));

    return {
      classes: Array.from(classSet),
      streams: Array.from(streamSet),
    };
  }, [students]);

  // Selection states (Class, Stream, Subject)
  const [selectedClass, setSelectedClass] = useState<string>('Senior 2');
  const [selectedStream, setSelectedStream] = useState<string>('Baobab');
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [rosterSearch, setRosterSearch] = useState<string>('');
  const [saveStatusMessage, setSaveStatusMessage] = useState<string | null>(null);

  // Filter students by Class & Stream
  const streamStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = selectedClass === 'ALL' || s.classGrade.toLowerCase().includes(selectedClass.toLowerCase());
      const matchStream = selectedStream === 'ALL' || s.classGrade.toLowerCase().includes(selectedStream.toLowerCase());
      return matchClass && matchStream;
    });
  }, [students, selectedClass, selectedStream]);

  // Local draft state for batch input: Map student id -> draft values
  interface DraftScore {
    aoiScore: number;     // Activity of Integration (0 - 30)
    endtermScore: number; // End of Term Exam (0 - 70)
    teacherComment: string;
    isTouched: boolean;
  }

  const [draftScores, setDraftScores] = useState<Record<string, DraftScore>>({});

  // Initialize or re-sync drafts when streamStudents or selectedSubject changes
  React.useEffect(() => {
    const initial: Record<string, DraftScore> = {};
    streamStudents.forEach((student) => {
      const existingSub = student.subjects.find(
        (sub) => sub.name.toLowerCase() === selectedSubject.toLowerCase()
      );
      initial[student.id] = {
        aoiScore: existingSub?.aoiScore ?? existingSub?.midtermScore ?? 20,
        endtermScore: existingSub?.endtermScore ?? 50,
        teacherComment: existingSub?.teacherComment || '',
        isTouched: false,
      };
    });
    setDraftScores(initial);
  }, [streamStudents, selectedSubject]);

  // Search filtered roster
  const displayRoster = useMemo(() => {
    if (!rosterSearch.trim()) return streamStudents;
    const q = rosterSearch.toLowerCase();
    return streamStudents.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q) ||
        s.rollNumber.toLowerCase().includes(q)
    );
  }, [streamStudents, rosterSearch]);

  const handleScoreChange = (
    studentId: string,
    field: 'aoiScore' | 'endtermScore',
    val: number
  ) => {
    setDraftScores((prev) => {
      const current = prev[studentId] || {
        aoiScore: 0,
        endtermScore: 0,
        teacherComment: '',
        isTouched: false,
      };

      let clampedVal = val;
      if (field === 'aoiScore') {
        clampedVal = Math.min(30, Math.max(0, isNaN(val) ? 0 : val));
      } else {
        clampedVal = Math.min(70, Math.max(0, isNaN(val) ? 0 : val));
      }

      return {
        ...prev,
        [studentId]: {
          ...current,
          [field]: clampedVal,
          isTouched: true,
        },
      };
    });
  };

  const handleCommentChange = (studentId: string, comment: string) => {
    setDraftScores((prev) => {
      const current = prev[studentId] || {
        aoiScore: 0,
        endtermScore: 0,
        teacherComment: '',
        isTouched: false,
      };
      return {
        ...prev,
        [studentId]: {
          ...current,
          teacherComment: comment,
          isTouched: true,
        },
      };
    });
  };

  // Commit and batch save all marks to the central database
  const handleSaveAll = () => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const targetSubject = SUBJECT_OPTIONS.find((s) => s.name === selectedSubject) || {
      name: selectedSubject,
      category: 'Core' as const,
    };

    const updatedStudentsList = students.map((originalStudent) => {
      // Check if this student is in the current stream batch
      const draft = draftScores[originalStudent.id];
      if (!draft) return originalStudent;

      const aoi = draft.aoiScore;
      const exam = draft.endtermScore;
      const total = Math.min(100, aoi + exam);
      const { grade } = calculateGrade(total);

      // Check if student already has this subject
      const existingIdx = originalStudent.subjects.findIndex(
        (sub) => sub.name.toLowerCase() === selectedSubject.toLowerCase()
      );

      let newSubjects = [...originalStudent.subjects];

      const newSubjectEntry: SubjectScore = {
        id: existingIdx >= 0 ? newSubjects[existingIdx].id : `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: selectedSubject,
        category: existingIdx >= 0 ? newSubjects[existingIdx].category : targetSubject.category,
        midtermScore: aoi,
        aoiScore: aoi,
        endtermScore: exam,
        maxScore: 100,
        totalScore: total,
        grade,
        classAverage: 68,
        teacherComment: draft.teacherComment.trim() || 'Demonstrates dedicated effort throughout this term.',
        teacherName: activeTeacherName,
        isSubmitted: true,
        submittedAt: timestamp,
      };

      if (existingIdx >= 0) {
        newSubjects[existingIdx] = newSubjectEntry;
      } else {
        newSubjects.push(newSubjectEntry);
      }

      return {
        ...originalStudent,
        subjects: newSubjects,
      };
    });

    onBatchUpdateStudents(updatedStudentsList);
    setSaveStatusMessage(
      `✓ Successfully saved and committed marks for ${streamStudents.length} learners in ${selectedClass} (${selectedStream}) for ${selectedSubject}. Aggregated into central report cards!`
    );

    setTimeout(() => {
      setSaveStatusMessage(null);
    }, 6000);
  };

  // Quick helper to fill suggested comment
  const applyPresetComment = (studentId: string, preset: string) => {
    handleCommentChange(studentId, preset);
  };

  return (
    <div className="space-y-6">
      {/* DIRECT INPUT BANNER & SELECTION FLOW */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-700/10 text-emerald-800 border border-emerald-700/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
                  Subject Teacher Portal — Direct AOI & Marks Input
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  Direct Submission
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter student marks, Activities of Integration (AOI), and subject comments directly. Submissions auto-populate the central report cards in the Class Teacher Portal.
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={streamStudents.length === 0}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition cursor-pointer shrink-0 ${
              streamStudents.length > 0
                ? 'bg-emerald-800 hover:bg-emerald-900 text-white active:scale-98'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>Save All ({streamStudents.length} Students)</span>
          </button>
        </div>

        {/* SELECTION BAR: CLASS, STREAM, SUBJECT */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Class Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
              <span>1. Select Class</span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-none transition"
            >
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Stream Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              <span>2. Select Stream</span>
            </label>
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-none transition"
            >
              {streams.map((strm) => (
                <option key={strm} value={strm}>
                  {strm} Stream
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
              <span>3. Select Subject</span>
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-700 focus:bg-white focus:outline-none transition"
            >
              {SUBJECT_OPTIONS.map((sub) => (
                <option key={sub.name} value={sub.name}>
                  {sub.name} ({sub.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* FEEDBACK STATUS NOTICE */}
        {saveStatusMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-semibold">{saveStatusMessage}</span>
          </div>
        )}
      </div>

      {/* ROSTER HEADER & SEARCH */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              {streamStudents.length}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-['Outfit',sans-serif]">
                Stream Roster: {selectedClass} — {selectedStream} ({selectedSubject})
              </h4>
              <p className="text-[11px] text-slate-500">
                Continuous assessment AOI is standardized /30; End of term examination is scored /70.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                placeholder="Search learner in stream..."
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 transition"
              />
            </div>

            <button
              onClick={handleSaveAll}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save All</span>
            </button>
          </div>
        </div>

        {/* BATCH MARKS ROSTER TABLE */}
        {displayRoster.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">
              No learners enrolled in {selectedClass} ({selectedStream} Stream).
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Select another stream or add new learners in the registrar view.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/90 text-slate-700 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-10 text-center">#</th>
                  <th className="py-3 px-4 min-w-[160px]">Learner Details</th>
                  <th className="py-3 px-3 w-28 text-center bg-emerald-50/60 text-emerald-950">
                    AOI Score (Max 30)
                  </th>
                  <th className="py-3 px-3 w-28 text-center bg-blue-50/60 text-blue-950">
                    Exam Mark (Max 70)
                  </th>
                  <th className="py-3 px-3 w-24 text-center">
                    Total (100%)
                  </th>
                  <th className="py-3 px-3 w-20 text-center">
                    Grade
                  </th>
                  <th className="py-3 px-4 min-w-[280px]">
                    Subject Teacher Comment & Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayRoster.map((student, idx) => {
                  const draft = draftScores[student.id] || {
                    aoiScore: 0,
                    endtermScore: 0,
                    teacherComment: '',
                    isTouched: false,
                  };

                  const total = Math.min(100, draft.aoiScore + draft.endtermScore);
                  const { grade } = calculateGrade(total);

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        draft.isTouched ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{student.fullName}</div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-mono text-emerald-800 font-semibold">{student.studentCode}</span>
                          <span>•</span>
                          <span>{student.gender}</span>
                          <span>•</span>
                          <span>Roll: {student.rollNumber}</span>
                        </div>
                      </td>

                      {/* AOI INPUT FIELD */}
                      <td className="py-3.5 px-3 text-center bg-emerald-50/30">
                        <div className="inline-flex items-center justify-center">
                          <input
                            type="number"
                            min="0"
                            max="30"
                            value={draft.aoiScore}
                            onChange={(e) =>
                              handleScoreChange(student.id, 'aoiScore', parseInt(e.target.value) || 0)
                            }
                            className="w-16 text-center font-bold text-sm bg-white border border-emerald-300 rounded-lg py-1.5 text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700 shadow-2xs"
                          />
                        </div>
                        <span className="block text-[10px] text-slate-400 mt-0.5">/ 30 pts</span>
                      </td>

                      {/* EXAM INPUT FIELD */}
                      <td className="py-3.5 px-3 text-center bg-blue-50/30">
                        <div className="inline-flex items-center justify-center">
                          <input
                            type="number"
                            min="0"
                            max="70"
                            value={draft.endtermScore}
                            onChange={(e) =>
                              handleScoreChange(student.id, 'endtermScore', parseInt(e.target.value) || 0)
                            }
                            className="w-16 text-center font-bold text-sm bg-white border border-blue-300 rounded-lg py-1.5 text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-700 shadow-2xs"
                          />
                        </div>
                        <span className="block text-[10px] text-slate-400 mt-0.5">/ 70 pts</span>
                      </td>

                      {/* TOTAL COMPUTED SCORE */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="text-base font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                          {total}%
                        </span>
                      </td>

                      {/* GRADE BADGE */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xs ${
                            grade === 'A+' || grade === 'A'
                              ? 'bg-emerald-100 text-emerald-800'
                              : grade === 'B' || grade === 'C'
                              ? 'bg-blue-100 text-blue-800'
                              : grade === 'D'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {grade}
                        </span>
                      </td>

                      {/* TEACHER COMMENT FIELD */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            value={draft.teacherComment}
                            onChange={(e) => handleCommentChange(student.id, e.target.value)}
                            placeholder={`Enter remark for ${student.fullName.split(' ')[0]}...`}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 shadow-2xs"
                          />
                          {/* Quick suggested comment chips */}
                          <div className="flex flex-wrap gap-1">
                            {COMMENT_PRESETS.slice(0, 2).map((preset, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => applyPresetComment(student.id, preset)}
                                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded border border-slate-200 transition cursor-pointer truncate max-w-[200px]"
                                title={preset}
                              >
                                + {preset}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* BOTTOM ACTION BAR */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4 text-slate-400" />
            <span>
              Changes are held in real-time memory until committed. Click <strong>Save All</strong> to update the central report card database.
            </span>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={streamStudents.length === 0}
            className={`inline-flex items-center justify-center gap-2 px-6 py-2 rounded-xl font-bold text-xs shadow-sm transition cursor-pointer ${
              streamStudents.length > 0
                ? 'bg-emerald-800 hover:bg-emerald-900 text-white active:scale-98'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>Save All ({streamStudents.length} Students)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
