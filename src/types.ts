export interface ActivityLog {
  id: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED';
  role: 'parent' | 'teacher' | 'admin';
  action: string;
  identifier: string;
  details: string;
  ipAddress?: string;
  deviceInfo?: string;
}

export interface SubjectScore {
  id: string;
  name: string;
  category: 'Core' | 'Sciences' | 'Humanities' | 'Languages' | 'Vocational';
  midtermScore: number; // out of 30 (often representing AOI / continuous assessment)
  aoiScore?: number;    // Activities of Integration (AOI score, e.g. out of 30 or 20)
  endtermScore: number; // out of 70 (End of term exam)
  maxScore: number;     // total 100
  totalScore: number;   // calculated
  grade: string;        // A+, A, B, C, D, E, F
  classAverage: number; // reference point for parents
  teacherComment: string;
  teacherName: string;
  isSubmitted?: boolean; // track if subject teacher submitted marks/AOI
  submittedAt?: string;  // timestamp of submission
}

export interface TermProgressRecord {
  termId: string;
  termName: string; // e.g., 'Term 1', 'Term 2', 'Term 3'
  academicYear: string; // e.g., '2024/2025', '2025/2026'
  label: string; // e.g., 'S1 T1', 'S1 T2', 'S1 T3', 'S2 T1', 'Current (S2 T2)'
  overallAverage: number;
  classAverage: number;
  overallGrade: string;
  classPosition: number;
  totalStudents: number;
  attendanceRate: number;
  subjectScores: {
    subjectName: string;
    score: number;
    grade: string;
  }[];
}

export interface Student {
  id: string;
  studentCode: string; // e.g., 'BDN-7821'
  fullName: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  classGrade: string; // e.g., 'Senior 2 - Nile', 'Senior 3 - Baobab'
  academicYear: string; // '2025/2026'
  term: 'Term 1' | 'Term 2' | 'Term 3';
  rollNumber: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  attendanceDays: number;
  totalSchoolDays: number;
  conduct: {
    discipline: 'Excellent' | 'Very Good' | 'Good' | 'Needs Improvement';
    punctuality: 'Excellent' | 'Very Good' | 'Good' | 'Needs Improvement';
    leadership: 'Excellent' | 'Very Good' | 'Good' | 'Needs Improvement';
    teamwork: 'Excellent' | 'Very Good' | 'Good' | 'Needs Improvement';
  };
  classTeacherComment: string;
  classTeacherName: string;
  headteacherComment: string;
  headteacherName: string;
  nextTermBegins: string;
  feesStatus: 'Cleared' | 'Pending Balance' | 'Scholarship Recipient';
  subjects: SubjectScore[];
  guardianNotes?: string[];
  termHistory?: TermProgressRecord[];
}

export interface SchoolSettings {
  schoolName: string;
  shortName: string;
  centerNumber: string;
  motto: string;
  poBox: string;
  telephone: string;
  currentTerm: 'Term 1' | 'Term 2' | 'Term 3';
  academicYear: string;
  headteacherName: string;
  adminName: string;
  adminEmail: string;
  teacherPassword?: string;
  adminPassword?: string;
  reportsPublished: boolean;
  publishReleaseDate: string;
}

export type UserRole = 'admin' | 'teacher' | 'parent' | 'guest';

export interface EcoMetrics {
  totalStudents: number;
  totalReportsGenerated: number;
  sheetsOfPaperSaved: number;
  treesSpared: number; // 1 tree ~ 8,333 sheets of A4 paper
  litersWaterSaved: number; // ~10 liters per sheet of paper
  kgCO2Prevented: number; // ~0.011 kg CO2 per sheet
  estimatedCostSavedUSD: number; // ~$0.08 per printed page with ink & logistics
}

export function calculateGrade(score: number): { grade: string; remark: string } {
  if (score >= 90) return { grade: 'A+', remark: 'Distinction 1: Outstanding mastery' };
  if (score >= 80) return { grade: 'A', remark: 'Distinction 2: Excellent comprehension' };
  if (score >= 70) return { grade: 'B', remark: 'Credit 3: Good performance' };
  if (score >= 60) return { grade: 'C', remark: 'Credit 4: Satisfactory effort' };
  if (score >= 50) return { grade: 'D', remark: 'Pass 7: Basic pass; needs extra practice' };
  return { grade: 'F', remark: 'Fail 9: Immediate intervention required' };
}

export function computeStudentSummary(student: Student) {
  const totalMarks = student.subjects.reduce((sum, s) => sum + s.totalScore, 0);
  const maxMarks = student.subjects.length * 100;
  const percentage = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0;
  
  let overallGrade = 'F';
  if (percentage >= 90) overallGrade = 'A+';
  else if (percentage >= 80) overallGrade = 'A';
  else if (percentage >= 70) overallGrade = 'B';
  else if (percentage >= 60) overallGrade = 'C';
  else if (percentage >= 50) overallGrade = 'D';

  const attendanceRate = student.totalSchoolDays > 0 
    ? Math.round((student.attendanceDays / student.totalSchoolDays) * 100) 
    : 100;

  return {
    totalMarks,
    maxMarks,
    percentage,
    overallGrade,
    attendanceRate,
    subjectsCount: student.subjects.length
  };
}
