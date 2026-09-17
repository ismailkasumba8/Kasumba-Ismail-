import { Student, SchoolSettings, ActivityLog, computeStudentSummary } from '../types';

/**
 * Trigger a browser file download of text content
 */
export function triggerDownload(filename: string, content: string, contentType: string = 'text/plain') {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export full student gradebook as CSV (Excel compatible)
 */
export function downloadStudentsCSV(students: Student[], school: SchoolSettings) {
  const headers = [
    'Student Code',
    'Full Name',
    'Gender',
    'Class / Stream',
    'Term',
    'Academic Year',
    'Roll Number',
    'Attendance Days',
    'Total School Days',
    'Attendance %',
    'Total Marks',
    'Overall %',
    'Overall Grade',
    'Fees Status',
    'Guardian Name',
    'Guardian Phone',
    'Class Teacher Remark',
    'Headteacher Endorsement'
  ];

  const rows = students.map((s) => {
    const summary = computeStudentSummary(s);
    return [
      `"${s.studentCode}"`,
      `"${s.fullName}"`,
      `"${s.gender}"`,
      `"${s.classGrade}"`,
      `"${s.term}"`,
      `"${s.academicYear}"`,
      `"${s.rollNumber}"`,
      s.attendanceDays,
      s.totalSchoolDays,
      `"${summary.attendanceRate}%"`,
      summary.totalMarks,
      `"${summary.percentage}%"`,
      `"${summary.overallGrade}"`,
      `"${s.feesStatus}"`,
      `"${s.guardianName}"`,
      `"${s.guardianPhone}"`,
      `"${s.classTeacherComment.replace(/"/g, '""')}"`,
      `"${s.headteacherComment.replace(/"/g, '""')}"`
    ].join(',');
  });

  const csvContent = [
    `# ${school.schoolName} - ${school.centerNumber}`,
    `# Official Marks & Assessment Database - ${school.currentTerm} ${school.academicYear}`,
    headers.join(','),
    ...rows
  ].join('\n');

  triggerDownload(
    `BDN_Memorial_SSS_Student_Database_${new Date().toISOString().split('T')[0]}.csv`,
    csvContent,
    'text/csv;charset=utf-8;'
  );
}

/**
 * Export parent access codes as CSV for SMS messaging or noticeboards
 */
export function downloadParentCodesCSV(students: Student[], school: SchoolSettings) {
  const headers = ['Access Code', 'Student Full Name', 'Class', 'Guardian Name', 'Guardian Phone', 'Portal Link'];
  const rows = students.map((s) => [
    `"${s.studentCode}"`,
    `"${s.fullName}"`,
    `"${s.classGrade}"`,
    `"${s.guardianName}"`,
    `"${s.guardianPhone}"`,
    `"https://bdn-portal.school?code=${s.studentCode}"`
  ].join(','));

  const csvContent = [
    `# ${school.schoolName} - Guardian Student Access Codes`,
    headers.join(','),
    ...rows
  ].join('\n');

  triggerDownload(
    `BDN_Parent_Access_Codes_${new Date().toISOString().split('T')[0]}.csv`,
    csvContent,
    'text/csv;charset=utf-8;'
  );
}

/**
 * Export complete backup JSON
 */
export function downloadBackupJSON(students: Student[], school: SchoolSettings) {
  const data = {
    exportedAt: new Date().toISOString(),
    schoolSettings: school,
    studentsCount: students.length,
    students
  };
  triggerDownload(
    `BDN_Memorial_SSS_Full_Backup_${new Date().toISOString().split('T')[0]}.json`,
    JSON.stringify(data, null, 2),
    'application/json'
  );
}

/**
 * Export Activity & Audit Logs as CSV
 */
export function downloadAuditLogsCSV(logs: ActivityLog[], school: SchoolSettings) {
  const headers = [
    'Log ID',
    'Timestamp (UTC)',
    'Event Status',
    'Role',
    'Action Type',
    'Identifier / Target',
    'Audit Details',
    'Device / Client Information',
    'IP Address'
  ];

  const rows = logs.map((log) => [
    `"${log.id}"`,
    `"${log.timestamp}"`,
    `"${log.status}"`,
    `"${log.role.toUpperCase()}"`,
    `"${log.action}"`,
    `"${log.identifier}"`,
    `"${log.details.replace(/"/g, '""')}"`,
    `"${log.deviceInfo || 'Standard Web Browser'}"`,
    `"${log.ipAddress || 'Client Node'}"`
  ]);

  const csvContent = [
    `# ${school.schoolName} - Security & Access Audit Trail`,
    `# Generated on: ${new Date().toLocaleString()}`,
    `# Total Audit Events: ${logs.length}`,
    '',
    headers.join(','),
    ...rows.map((r) => r.join(','))
  ].join('\n');

  triggerDownload(
    `BDN_Security_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`,
    csvContent,
    'text/csv;charset=utf-8;'
  );
}

