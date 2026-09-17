import { Student, TermProgressRecord, computeStudentSummary } from '../types';

/**
 * Returns term-over-term academic progression records for a student.
 * Uses student.termHistory if explicitly populated, or builds a coherent
 * multi-term progression trajectory based on the student's current subjects.
 */
export function getStudentTermProgress(student: Student): TermProgressRecord[] {
  if (student.termHistory && student.termHistory.length > 0) {
    return student.termHistory;
  }

  const currentSummary = computeStudentSummary(student);
  const currentAvg = currentSummary.percentage;
  const currentAttendance = currentSummary.attendanceRate;

  // Derive historical terms preceding the current term
  // e.g., for Senior 2 Term 2:
  // S1 Term 1, S1 Term 2, S1 Term 3, S2 Term 1, S2 Term 2 (Current)
  const isSenior2 = student.classGrade.includes('Senior 2') || student.classGrade.includes('S2');
  const isSenior3 = student.classGrade.includes('Senior 3') || student.classGrade.includes('S3');
  const isSenior4 = student.classGrade.includes('Senior 4') || student.classGrade.includes('S4');

  // Multipliers or deltas to create realistic historical trajectory
  // E.g. student gradually improved or maintained high standing
  let deltas: number[];
  if (currentAvg >= 85) {
    // High achiever with consistent high performance
    deltas = [-7, -4, -2, -1, 0];
  } else if (currentAvg >= 75) {
    // Solid steady learner with upward trend
    deltas = [-9, -6, -4, -2, 0];
  } else if (currentAvg >= 60) {
    // Moderate performer with gradual improvement
    deltas = [-5, -8, -4, -2, 0];
  } else {
    // Struggling or recovering learner
    deltas = [-3, -6, -4, -1, 0];
  }

  const termsConfig = [
    { termId: 'term-s1-t1', termName: 'Term 1', academicYear: '2024/2025', label: 'S1 Term 1', classAvg: 65, posOffset: 4 },
    { termId: 'term-s1-t2', termName: 'Term 2', academicYear: '2024/2025', label: 'S1 Term 2', classAvg: 67, posOffset: 3 },
    { termId: 'term-s1-t3', termName: 'Term 3', academicYear: '2024/2025', label: 'S1 Term 3', classAvg: 68, posOffset: 2 },
    { termId: 'term-s2-t1', termName: 'Term 1', academicYear: '2025/2026', label: 'S2 Term 1', classAvg: 70, posOffset: 1 },
    { termId: 'term-s2-t2', termName: 'Term 2', academicYear: '2025/2026', label: 'S2 Term 2 (Current)', classAvg: 72, posOffset: 0 },
  ];

  // If senior 1, just show S1 Term 1, S1 Mid-Term, S1 Term 2
  const sliceConfig = isSenior3 || isSenior4 || isSenior2 ? termsConfig : termsConfig.slice(2);

  return sliceConfig.map((cfg, idx) => {
    const isCurrent = idx === sliceConfig.length - 1;
    const offset = deltas[idx] ?? 0;
    const avg = isCurrent ? currentAvg : Math.max(40, Math.min(99, Math.round(currentAvg + offset)));
    
    let grade = 'F';
    if (avg >= 90) grade = 'A+';
    else if (avg >= 80) grade = 'A';
    else if (avg >= 70) grade = 'B';
    else if (avg >= 60) grade = 'C';
    else if (avg >= 50) grade = 'D';

    // Position calculation
    const basePos = currentAvg >= 90 ? 1 : currentAvg >= 80 ? 4 : currentAvg >= 70 ? 9 : 18;
    const position = Math.max(1, basePos + (isCurrent ? 0 : cfg.posOffset));

    // Subject breakdown
    const subjectScores = student.subjects.map((sub) => {
      const subScore = isCurrent 
        ? sub.totalScore 
        : Math.max(35, Math.min(100, Math.round(sub.totalScore + offset + (Math.sin(sub.totalScore + idx) * 3))));
      
      let subGrade = 'F';
      if (subScore >= 90) subGrade = 'A+';
      else if (subScore >= 80) subGrade = 'A';
      else if (subScore >= 70) subGrade = 'B';
      else if (subScore >= 60) subGrade = 'C';
      else if (subScore >= 50) subGrade = 'D';

      return {
        subjectName: sub.name,
        score: subScore,
        grade: subGrade,
      };
    });

    const attendance = isCurrent 
      ? currentAttendance 
      : Math.max(82, Math.min(100, Math.round(currentAttendance - (sliceConfig.length - 1 - idx) * 1.5)));

    return {
      termId: cfg.termId,
      termName: cfg.termName,
      academicYear: cfg.academicYear,
      label: cfg.label,
      overallAverage: avg,
      classAverage: cfg.classAvg,
      overallGrade: grade,
      classPosition: position,
      totalStudents: 36,
      attendanceRate: attendance,
      subjectScores,
    };
  });
}

export interface TrendAnalysis {
  delta: number; // change from previous term to current
  trajectoryText: string;
  trajectoryType: 'positive' | 'steady' | 'negative';
  bestTerm: TermProgressRecord;
  lowestTerm: TermProgressRecord;
  overallHistoricalAverage: number;
  distinctiveCount: number;
}

export function analyzeProgressTrend(records: TermProgressRecord[]): TrendAnalysis {
  if (!records || records.length === 0) {
    return {
      delta: 0,
      trajectoryText: 'Initial term baseline',
      trajectoryType: 'steady',
      bestTerm: {} as TermProgressRecord,
      lowestTerm: {} as TermProgressRecord,
      overallHistoricalAverage: 0,
      distinctiveCount: 0,
    };
  }

  const current = records[records.length - 1];
  const previous = records.length > 1 ? records[records.length - 2] : current;
  const delta = Math.round((current.overallAverage - previous.overallAverage) * 10) / 10;

  let trajectoryText = 'Consistent academic delivery';
  let trajectoryType: 'positive' | 'steady' | 'negative' = 'steady';

  if (delta > 2) {
    trajectoryText = `Strong growth (+${delta}% from previous term)`;
    trajectoryType = 'positive';
  } else if (delta > 0) {
    trajectoryText = `Positive progression (+${delta}% gain)`;
    trajectoryType = 'positive';
  } else if (delta < -2) {
    trajectoryText = `Noticeable drop (${delta}% from previous term)`;
    trajectoryType = 'negative';
  } else if (delta < 0) {
    trajectoryText = `Slight dip (${delta}%)`;
    trajectoryType = 'steady';
  } else {
    trajectoryText = `Stable performance across terms`;
    trajectoryType = 'steady';
  }

  // Find best and lowest terms
  let bestTerm = records[0];
  let lowestTerm = records[0];
  let totalSum = 0;
  let distinctiveCount = 0;

  records.forEach((r) => {
    totalSum += r.overallAverage;
    if (r.overallAverage > bestTerm.overallAverage) {
      bestTerm = r;
    }
    if (r.overallAverage < lowestTerm.overallAverage) {
      lowestTerm = r;
    }
    if (r.overallAverage >= 80) {
      distinctiveCount++;
    }
  });

  const overallHistoricalAverage = Math.round((totalSum / records.length) * 10) / 10;

  return {
    delta,
    trajectoryText,
    trajectoryType,
    bestTerm,
    lowestTerm,
    overallHistoricalAverage,
    distinctiveCount,
  };
}
