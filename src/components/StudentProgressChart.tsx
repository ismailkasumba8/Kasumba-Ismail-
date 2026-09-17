import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  HelpCircle,
  BarChart3,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Student } from '../types';
import { getStudentTermProgress, analyzeProgressTrend } from '../utils/studentProgress';

interface StudentProgressChartProps {
  student: Student;
  className?: string;
}

type ChartViewMode = 'overall' | 'subjects' | 'metrics';

// Palette for subject lines (anti-slop, harmonious palette)
const SUBJECT_COLORS = [
  '#059669', // emerald-600
  '#0284c7', // sky-600
  '#d97706', // amber-600
  '#7c3aed', // violet-600
  '#db2777', // pink-600
  '#0d9488', // teal-600
  '#475569', // slate-600
];

export const StudentProgressChart: React.FC<StudentProgressChartProps> = ({
  student,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<ChartViewMode>('overall');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [showDataTable, setShowDataTable] = useState(false);

  // Compute records
  const records = useMemo(() => getStudentTermProgress(student), [student]);
  const analysis = useMemo(() => analyzeProgressTrend(records), [records]);

  // Extract all unique subjects across terms
  const availableSubjects = useMemo(() => {
    if (!student.subjects || student.subjects.length === 0) return [];
    return student.subjects.map((s) => s.name);
  }, [student.subjects]);

  // Format data for Recharts
  const chartData = useMemo(() => {
    return records.map((rec) => {
      const subjectMap: Record<string, number> = {};
      rec.subjectScores.forEach((s) => {
        subjectMap[s.subjectName] = s.score;
      });

      return {
        termId: rec.termId,
        termLabel: rec.label,
        academicYear: rec.academicYear,
        termName: rec.termName,
        overallAverage: rec.overallAverage,
        classAverage: rec.classAverage,
        overallGrade: rec.overallGrade,
        classPosition: rec.classPosition,
        attendanceRate: rec.attendanceRate,
        ...subjectMap,
      };
    });
  }, [records]);

  // Custom tooltip component for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const currentRec = records.find((r) => r.label === label);

    return (
      <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-2 max-w-xs z-50">
        <div className="border-b border-slate-800 pb-1.5 flex items-center justify-between gap-3">
          <span className="font-bold text-white text-sm">{label}</span>
          <span className="text-[10px] text-slate-400">{currentRec?.academicYear}</span>
        </div>

        {viewMode === 'overall' && currentRec && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                Learner Average:
              </span>
              <span className="font-extrabold text-emerald-300 text-sm">
                {currentRec.overallAverage}% ({currentRec.overallGrade})
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                Class Average:
              </span>
              <span className="font-semibold text-slate-300">
                {currentRec.classAverage}%
              </span>
            </div>

            <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Position: <strong className="text-amber-300 font-bold">{currentRec.classPosition} of {currentRec.totalStudents}</strong></span>
              <span>Attendance: <strong className="text-teal-300 font-bold">{currentRec.attendanceRate}%</strong></span>
            </div>
          </div>
        )}

        {viewMode === 'subjects' && (
          <div className="space-y-1">
            {payload.map((item: any) => (
              <div key={item.dataKey} className="flex items-center justify-between gap-3 py-0.5">
                <span className="text-slate-300 flex items-center gap-1.5 truncate max-w-[140px]" title={item.name}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                  {item.name}:
                </span>
                <span className="font-mono font-bold" style={{ color: item.color }}>
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'metrics' && currentRec && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-300">Class Rank Position:</span>
              <span className="font-bold text-amber-300">#{currentRec.classPosition} of {currentRec.totalStudents}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-300">Attendance Rate:</span>
              <span className="font-bold text-teal-300">{currentRec.attendanceRate}%</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      id="student-progress-chart-card"
      className={`bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-5 ${className}`}
    >
      {/* Header Section with Title & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-slate-900 font-['Outfit',sans-serif] flex items-center gap-2">
                <span>Student Academic Progress & Term Trends</span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 text-[11px] font-semibold">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Continuous Evaluation
                </span>
              </h4>
              <p className="text-xs text-slate-500">
                Term-over-term comparative trajectory for <strong className="text-slate-700">{student.fullName}</strong> across multiple academic reporting periods.
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Segmented Controls */}
        <div className="no-print flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-start lg:self-center">
          <button
            onClick={() => setViewMode('overall')}
            id="view-overall-trend-btn"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'overall'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Overall Trajectory</span>
          </button>

          <button
            onClick={() => setViewMode('subjects')}
            id="view-subjects-trend-btn"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'subjects'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Subject Analysis</span>
          </button>

          <button
            onClick={() => setViewMode('metrics')}
            id="view-rank-trend-btn"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'metrics'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Rank & Attendance</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Term-over-Term Delta */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-slate-500 font-medium text-[11px] block">Term-over-Term Delta</span>
          <div className="flex items-center gap-1.5 mt-1">
            {analysis.delta > 0 ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-sm bg-emerald-100/80 px-2 py-0.5 rounded-md">
                <TrendingUp className="w-4 h-4" />
                +{analysis.delta}%
              </span>
            ) : analysis.delta < 0 ? (
              <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-sm bg-rose-100/80 px-2 py-0.5 rounded-md">
                <TrendingDown className="w-4 h-4" />
                {analysis.delta}%
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-700 font-bold text-sm bg-slate-200 px-2 py-0.5 rounded-md">
                <Minus className="w-4 h-4" />
                0.0%
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 truncate">
            {analysis.trajectoryText}
          </span>
        </div>

        {/* Historical Mean */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-slate-500 font-medium text-[11px] block">Historical Average</span>
          <div className="text-slate-900 font-extrabold text-base font-['Outfit',sans-serif] mt-1">
            {analysis.overallHistoricalAverage}%
          </div>
          <span className="text-[10px] text-slate-500 mt-1">
            Across {records.length} recorded terms
          </span>
        </div>

        {/* Peak Performance Term */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-slate-500 font-medium text-[11px] block">Best Recorded Term</span>
          <div className="text-emerald-800 font-extrabold text-base font-['Outfit',sans-serif] mt-1 truncate">
            {analysis.bestTerm.label} ({analysis.bestTerm.overallAverage}%)
          </div>
          <span className="text-[10px] text-slate-500 mt-1">
            Grade {analysis.bestTerm.overallGrade} • Rank #{analysis.bestTerm.classPosition}
          </span>
        </div>

        {/* Current Class Comparison */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-slate-500 font-medium text-[11px] block">Class Benchmark Margin</span>
          <div className="text-teal-800 font-extrabold text-base font-['Outfit',sans-serif] mt-1">
            {records[records.length - 1].overallAverage >= records[records.length - 1].classAverage ? '+' : ''}
            {Math.round((records[records.length - 1].overallAverage - records[records.length - 1].classAverage) * 10) / 10}%
          </div>
          <span className="text-[10px] text-slate-500 mt-1">
            Above cohort mean ({records[records.length - 1].classAverage}%)
          </span>
        </div>
      </div>

      {/* Sub-filter bar when in 'subjects' mode */}
      {viewMode === 'subjects' && availableSubjects.length > 0 && (
        <div className="no-print flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-slate-500 font-semibold mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            Filter Subject:
          </span>
          <button
            onClick={() => setSelectedSubject('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              selectedSubject === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Core Subjects
          </button>
          {availableSubjects.map((subName) => (
            <button
              key={subName}
              onClick={() => setSelectedSubject(subName)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                selectedSubject === subName
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {subName}
            </button>
          ))}
        </div>
      )}

      {/* MAIN RECHARTS CANVAS */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'overall' ? (
            <ComposedChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="studentScoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="termLabel"
                tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                domain={[30, 100]}
                tick={{ fontSize: 11, fill: '#475569' }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontWeight: 600 }}
              />
              <ReferenceLine
                y={80}
                stroke="#d97706"
                strokeDasharray="4 4"
                label={{
                  value: 'Distinction (80%)',
                  fill: '#b45309',
                  fontSize: 10,
                  position: 'right',
                }}
              />
              <ReferenceLine
                y={50}
                stroke="#94a3b8"
                strokeDasharray="3 3"
                label={{
                  value: 'Pass Mark (50%)',
                  fill: '#64748b',
                  fontSize: 10,
                  position: 'right',
                }}
              />
              <Area
                type="monotone"
                dataKey="overallAverage"
                name="Learner Average"
                stroke="#059669"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#studentScoreGrad)"
                activeDot={{ r: 6, stroke: '#047857', strokeWidth: 2, fill: '#ffffff' }}
              />
              <Line
                type="monotone"
                dataKey="classAverage"
                name="Class Average Benchmark"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: '#94a3b8' }}
              />
            </ComposedChart>
          ) : viewMode === 'subjects' ? (
            <ComposedChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="termLabel"
                tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                domain={[30, 100]}
                tick={{ fontSize: 11, fill: '#475569' }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontWeight: 600 }}
              />
              <ReferenceLine
                y={80}
                stroke="#d97706"
                strokeDasharray="3 3"
                label={{ value: 'Distinction (80%)', fill: '#b45309', fontSize: 10 }}
              />

              {/* Render either the selected subject or multiple core subjects */}
              {availableSubjects
                .filter((sub) => selectedSubject === 'ALL' || selectedSubject === sub)
                .map((subName, i) => {
                  const color = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
                  return (
                    <Line
                      key={subName}
                      type="monotone"
                      dataKey={subName}
                      name={subName}
                      stroke={color}
                      strokeWidth={selectedSubject === subName ? 3 : 2}
                      dot={{ r: 4, fill: color }}
                      activeDot={{ r: 6 }}
                    />
                  );
                })}
            </ComposedChart>
          ) : (
            // Metrics view: Class Position & Attendance
            <ComposedChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="termLabel"
                tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                yAxisId="left"
                domain={[60, 100]}
                tick={{ fontSize: 11, fill: '#0f766e' }}
                tickLine={false}
                axisLine={{ stroke: '#0f766e' }}
                unit="%"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                reversed
                domain={[1, 36]}
                tick={{ fontSize: 11, fill: '#b45309' }}
                tickLine={false}
                axisLine={{ stroke: '#b45309' }}
                label={{ value: 'Rank in Class (1st = Top)', angle: 90, position: 'insideRight', fill: '#b45309', fontSize: 10 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontWeight: 600 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="attendanceRate"
                name="Attendance Rate (%)"
                stroke="#0f766e"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#0f766e' }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="classPosition"
                name="Class Position (Rank)"
                stroke="#d97706"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#d97706' }}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Pedagogical Guidance & Actionable Analysis for Guardians */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-950">
        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-emerald-900 block">
              Academic Trend Summary for Guardians:
            </span>
            <span className="text-emerald-800 leading-relaxed text-[11px] block mt-0.5">
              {analysis.trajectoryType === 'positive'
                ? `${student.fullName} has demonstrated commendable academic resilience, improving by +${analysis.delta}% in the most recent term while consistently ranking in the top tier.`
                : `${student.fullName} maintains a stable performance trajectory with strong foundations across core subjects and steady attendance.`}
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowDataTable(!showDataTable)}
          id="toggle-term-table-btn"
          className="no-print px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-semibold rounded-lg text-xs transition cursor-pointer whitespace-nowrap self-end sm:self-center shadow-xs"
        >
          {showDataTable ? 'Hide Data Table' : 'View Term Table'}
        </button>
      </div>

      {/* Expandable Term-by-Term Detailed Score Table */}
      {showDataTable && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 animate-fadeIn">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="p-2.5">Academic Term</th>
                <th className="p-2.5 text-center">Student Score</th>
                <th className="p-2.5 text-center">Cohort Benchmark</th>
                <th className="p-2.5 text-center">Letter Grade</th>
                <th className="p-2.5 text-center">Class Rank</th>
                <th className="p-2.5 text-center">Attendance</th>
                <th className="p-2.5">Academic Trajectory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {records.map((r, i) => {
                const prev = i > 0 ? records[i - 1] : null;
                const change = prev ? Math.round((r.overallAverage - prev.overallAverage) * 10) / 10 : 0;
                return (
                  <tr key={r.termId} className="hover:bg-slate-50/80 transition">
                    <td className="p-2.5 font-semibold text-slate-900">
                      <div>{r.label}</div>
                      <span className="text-[10px] font-normal text-slate-500">{r.academicYear}</span>
                    </td>
                    <td className="p-2.5 text-center font-bold font-mono text-emerald-700">
                      {r.overallAverage}%
                    </td>
                    <td className="p-2.5 text-center text-slate-600 font-mono">
                      {r.classAverage}%
                    </td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded font-bold text-xs bg-slate-100 text-slate-800">
                        {r.overallGrade}
                      </span>
                    </td>
                    <td className="p-2.5 text-center font-semibold text-slate-800">
                      #{r.classPosition} / {r.totalStudents}
                    </td>
                    <td className="p-2.5 text-center text-slate-600">
                      {r.attendanceRate}%
                    </td>
                    <td className="p-2.5 text-xs">
                      {i === 0 ? (
                        <span className="text-slate-400 italic">Baseline term</span>
                      ) : change > 0 ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" /> +{change}%
                        </span>
                      ) : change < 0 ? (
                        <span className="text-rose-700 font-semibold flex items-center gap-1">
                          <TrendingDown className="w-3.5 h-3.5" /> {change}%
                        </span>
                      ) : (
                        <span className="text-slate-500">Unchanged</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
