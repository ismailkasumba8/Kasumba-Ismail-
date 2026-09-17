/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  ActivityLog, 
  SchoolSettings 
} from '../types';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  GraduationCap, 
  BookOpen, 
  Shield, 
  Clock, 
  Smartphone, 
  Laptop, 
  Globe, 
  ArrowUpDown,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { downloadAuditLogsCSV } from '../utils/exportHelpers';

interface ActivityLogTabProps {
  logs: ActivityLog[];
  schoolSettings: SchoolSettings;
  onClearLogs: () => void;
  onAddSimulatedLog?: (entry: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
}

export const ActivityLogTab: React.FC<ActivityLogTabProps> = ({
  logs,
  schoolSettings,
  onClearLogs,
  onAddSimulatedLog,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'FAILED'>('ALL');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'parent' | 'teacher' | 'admin'>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filtered & Sorted Logs
  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => {
        // Status filter
        if (statusFilter !== 'ALL' && log.status !== statusFilter) return false;

        // Role filter
        if (roleFilter !== 'ALL' && log.role !== roleFilter) return false;

        // Search query
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchAction = log.action.toLowerCase().includes(q);
          const matchIdentifier = log.identifier.toLowerCase().includes(q);
          const matchDetails = log.details.toLowerCase().includes(q);
          const matchDevice = (log.deviceInfo || '').toLowerCase().includes(q);
          const matchIp = (log.ipAddress || '').toLowerCase().includes(q);
          const matchRole = log.role.toLowerCase().includes(q);
          return matchAction || matchIdentifier || matchDetails || matchDevice || matchIp || matchRole;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [logs, statusFilter, roleFilter, searchTerm, sortOrder]);

  // Statistics calculation
  const totalCount = logs.length;
  const successCount = logs.filter((l) => l.status === 'SUCCESS').length;
  const failedCount = logs.filter((l) => l.status === 'FAILED').length;
  const parentCount = logs.filter((l) => l.role === 'parent').length;
  const staffCount = logs.filter((l) => l.role === 'teacher' || l.role === 'admin').length;

  // Format date helper
  const formatTimestamp = (iso: string) => {
    try {
      const date = new Date(iso);
      if (isNaN(date.getTime())) return { formatted: iso, relativeTime: '' };
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMin = Math.round(diffMs / 60000);

      let relativeTime = '';
      if (diffMin < 1) relativeTime = 'Just now';
      else if (diffMin < 60) relativeTime = `${diffMin}m ago`;
      else if (diffMin < 1440) relativeTime = `${Math.round(diffMin / 60)}h ago`;
      else relativeTime = `${Math.round(diffMin / 1440)}d ago`;

      const formatted = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      return { formatted, relativeTime };
    } catch {
      return { formatted: iso, relativeTime: '' };
    }
  };

  // Helper for role icon & badge styling
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'parent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <GraduationCap className="w-3 h-3" />
            <span>Parent</span>
          </span>
        );
      case 'teacher':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <BookOpen className="w-3 h-3" />
            <span>Teacher</span>
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            <Shield className="w-3 h-3 text-amber-700" />
            <span>Administrator</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
            <User className="w-3 h-3" />
            <span>{role}</span>
          </span>
        );
    }
  };

  // Helper for device icon
  const getDeviceIcon = (deviceInfo?: string) => {
    const info = (deviceInfo || '').toLowerCase();
    if (info.includes('mobile') || info.includes('phone') || info.includes('android') || info.includes('iphone')) {
      return <Smartphone className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
    }
    if (info.includes('laptop') || info.includes('mac') || info.includes('desktop') || info.includes('windows')) {
      return <Laptop className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
    }
    return <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
  };

  return (
    <div className="space-y-6">
      
      {/* AUDIT SUMMARY STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Events */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Audit Logs</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
            {totalCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Active retention in database
          </p>
        </div>

        {/* Successful Access */}
        <div className="bg-white rounded-2xl border border-emerald-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">Successful Access</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-700 font-['Outfit',sans-serif]">
            {successCount}
          </div>
          <p className="text-[11px] text-emerald-600/80 mt-0.5">
            {totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0}% authorized access
          </p>
        </div>

        {/* Failed Attempts */}
        <div className={`rounded-2xl border p-4 sm:p-5 shadow-xs ${
          failedCount > 0 
            ? 'bg-rose-50/70 border-rose-300' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${failedCount > 0 ? 'text-rose-800' : 'text-slate-500'}`}>
              Failed Attempts
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              failedCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`mt-2 text-2xl font-extrabold font-['Outfit',sans-serif] ${
            failedCount > 0 ? 'text-rose-700' : 'text-slate-900'
          }`}>
            {failedCount}
          </div>
          <p className={`text-[11px] mt-0.5 ${failedCount > 0 ? 'text-rose-600 font-medium' : 'text-slate-500'}`}>
            {failedCount > 0 ? 'Invalid codes or passwords' : 'No authentication violations'}
          </p>
        </div>

        {/* Access Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Access Ratio</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-lg font-bold text-slate-900 font-['Outfit',sans-serif]">
            {parentCount} <span className="text-xs text-slate-400 font-normal">Parents</span> / {staffCount} <span className="text-xs text-slate-400 font-normal">Staff</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Portal engagement breakdown
          </p>
        </div>
      </div>

      {/* SECURITY NOTICE & FAILED LOGINS ALERT BANNER */}
      {failedCount > 0 ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-rose-900">
                Security Audit Notice: {failedCount} Failed Access Attempt{failedCount > 1 ? 's' : ''} Logged
              </h4>
              <p className="text-[11px] sm:text-xs text-rose-700 mt-0.5 leading-relaxed">
                The continuous assessment portal recorded invalid learner code inputs or incorrect password attempts. All events include originating device signatures and timestamps for school inspection.
              </p>
            </div>
          </div>

          <button
            onClick={() => setStatusFilter(statusFilter === 'FAILED' ? 'ALL' : 'FAILED')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-xs shrink-0 self-end sm:self-center"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{statusFilter === 'FAILED' ? 'Show All Events' : 'Filter Failed Only'}</span>
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-xs text-emerald-900 leading-relaxed">
            <strong>Audit Integrity Clean:</strong> All recent access attempts to the Bishop Dunstan Nsubuga Memorial SSS Continuous Assessment System have completed with valid authentication.
          </p>
        </div>
      )}

      {/* AUDIT CONTROLS & FILTER TOOLBAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student code, guardian, role, IP, or details..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Download CSV */}
            <button
              onClick={() => downloadAuditLogsCSV(filteredLogs, schoolSettings)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-xs"
              title="Download filtered activity log as CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit CSV</span>
            </button>

            {/* Sort Order Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition cursor-pointer"
              title="Toggle sort order"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
            </button>

            {/* Clear Logs Button */}
            <button
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 text-xs font-semibold rounded-xl border border-slate-200 hover:border-rose-300 transition cursor-pointer"
              title="Clear all log history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Status filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500 font-medium mr-1">Status:</span>
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('SUCCESS')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                statusFilter === 'SUCCESS'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Authorized ({successCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('FAILED')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                statusFilter === 'FAILED'
                  ? 'bg-rose-700 text-white'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Failed ({failedCount})</span>
            </button>
          </div>

          {/* Role filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500 font-medium mr-1">Role:</span>
            {(['ALL', 'parent', 'teacher', 'admin'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition cursor-pointer capitalize ${
                  roleFilter === r
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r === 'ALL' ? 'All Roles' : r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LOGS TABLE / FEED */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900 font-['Outfit',sans-serif]">
              Chronological Audit Trail
            </h3>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium">
              Showing {filteredLogs.length} of {totalCount} events
            </span>
          </div>

          <div className="text-[11px] text-slate-500">
            Compliance Standard: UNEB Zero-Paper Security
          </div>
        </div>

        {/* Content list */}
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700">
              No activity logs match your criteria
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms, status filters, or role selection to see previous audit records.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setRoleFilter('ALL');
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => {
              const { formatted, relativeTime } = formatTimestamp(log.timestamp);
              const isFailed = log.status === 'FAILED';

              return (
                <div 
                  key={log.id} 
                  className={`p-4 sm:p-5 transition hover:bg-slate-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isFailed ? 'bg-rose-50/30' : ''
                  }`}
                >
                  {/* Left Column: Status Badge, Role, Action & Details */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status badge */}
                      {isFailed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-300">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>FAILED ATTEMPT</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>AUTHORIZED</span>
                        </span>
                      )}

                      {/* Role Badge */}
                      {getRoleBadge(log.role)}

                      {/* Action Title */}
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {log.action}
                      </span>

                      {/* Identifier tag if present */}
                      {log.identifier && (
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono font-bold rounded border border-slate-200">
                          {log.identifier}
                        </span>
                      )}
                    </div>

                    {/* Description Details */}
                    <p className="text-xs text-slate-600 leading-relaxed pr-2">
                      {log.details}
                    </p>

                    {/* Device & IP signature */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                      <div className="inline-flex items-center gap-1">
                        {getDeviceIcon(log.deviceInfo)}
                        <span>{log.deviceInfo || 'Standard Web Client'}</span>
                      </div>

                      {log.ipAddress && (
                        <div className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-400">
                          <span>IP: {log.ipAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Timestamps */}
                  <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 w-full sm:w-auto">
                    <div className="text-xs font-semibold text-slate-800 flex items-center sm:justify-end gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatted}</span>
                    </div>
                    {relativeTime && (
                      <span className="text-[11px] text-slate-500 block mt-0.5 font-medium">
                        {relativeTime}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer info bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Real-time continuous audit logging active for Bishop Dunstan Nsubuga Memorial SSS</span>
          </div>

          <div>
            <span>Retention: Persistent Local Encrypted Store</span>
          </div>
        </div>
      </div>

      {/* CONFIRM CLEAR MODAL */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Clear All Activity Logs?
                </h3>
                <p className="text-xs text-slate-500">
                  This action will delete all recorded authentication logs.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              For institutional compliance and security audits, clearing history is usually restricted to term resets. Are you sure you want to proceed?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearLogs();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-xs"
              >
                Yes, Clear Audit History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
