import React from 'react';
import { X, KeyRound, ArrowRight, UserCheck, Sparkles } from 'lucide-react';
import { Student } from '../types';

interface QuickCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onSelectStudent: (code: string) => void;
}

export const QuickCodesModal: React.FC<QuickCodesModalProps> = ({
  isOpen,
  onClose,
  students,
  onSelectStudent,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
                Bishop Dunstan Nsubuga Memorial SSS — BDN Codes
              </h3>
              <p className="text-xs text-slate-500">
                Click any BDN code below to instantly open that student's official digital report card.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-2.5 max-h-[70vh] overflow-y-auto">
          {students.map((student) => (
            <button
              key={student.id}
              onClick={() => {
                onSelectStudent(student.studentCode);
                onClose();
              }}
              className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition flex items-center justify-between group cursor-pointer bg-white"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300">
                    {student.studentCode}
                  </span>
                  <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-900">
                    {student.fullName}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {student.classGrade} • {student.term} • Roll: {student.rollNumber}
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition">
                <span>View Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
          <p className="text-xs text-slate-500">
            Parents can access these codes directly via SMS, WhatsApp, or small printed slips.
          </p>
        </div>
      </div>
    </div>
  );
};
