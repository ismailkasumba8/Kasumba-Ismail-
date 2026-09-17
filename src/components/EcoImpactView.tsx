import React from 'react';
import { 
  TreePine, 
  Droplet, 
  Wind, 
  DollarSign, 
  Leaf, 
  Award, 
  Sparkles,
  ArrowRight,
  TrendingDown,
  ShieldCheck
} from 'lucide-react';
import { Student } from '../types';

interface EcoImpactViewProps {
  students: Student[];
  onGoToParentPortal: () => void;
}

export const EcoImpactView: React.FC<EcoImpactViewProps> = ({
  students,
  onGoToParentPortal,
}) => {
  const totalStudents = students.length;
  // Let's model a realistic academic year (3 terms, 8 pages per standard printed report card booklet)
  const pagesPerReport = 8;
  const currentTermPagesSaved = totalStudents * pagesPerReport;
  const annualPagesSaved = currentTermPagesSaved * 3;
  
  // 1 tree = ~8,333 sheets of standard copy paper
  const treesSparedAnnual = (annualPagesSaved / 8333);
  // 10 Liters water per page
  const waterSavedLitersAnnual = annualPagesSaved * 10;
  // 11 grams CO2 per page
  const co2AvoidedKgAnnual = (annualPagesSaved * 0.011);
  // ~$0.08 per page (paper + toner + photocopier repairs)
  const costSavedUSDAnnual = (annualPagesSaved * 0.08);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-10 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-400/30 text-emerald-200 text-xs font-semibold">
            <Leaf className="w-3.5 h-3.5 text-emerald-300" />
            Environmental Impact & Forest Conservation
          </div>
          
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-['Outfit',sans-serif]">
            Every Digital Report Protects Our Living Forests
          </h2>

          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            By switching from physical 8-page paper report booklets to instant student-code access, 
            Bishop Dunstan Nsubuga Memorial SSS directly eliminates deforestation, chemical paper bleaching, 
            and carbon emissions while saving thousands in administrative printing budgets.
          </p>
        </div>
      </div>

      {/* Environmental Impact Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <TreePine className="w-6 h-6 text-emerald-600" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Annual Trees Spared
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-800 font-['Outfit',sans-serif] mt-1">
            {treesSparedAnnual.toFixed(3)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Based on {annualPagesSaved.toLocaleString()} paper pages eliminated annually.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
            <Droplet className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Freshwater Conserved
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-blue-700 font-['Outfit',sans-serif] mt-1">
            {waterSavedLitersAnnual.toLocaleString()} L
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manufacturing 1 paper sheet requires ~10 liters of water.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
            <Wind className="w-6 h-6 text-teal-600" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            CO₂ Emissions Avoided
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-teal-800 font-['Outfit',sans-serif] mt-1">
            {co2AvoidedKgAnnual.toFixed(1)} kg
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Eliminates industrial pulp refining and transport fuel.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
            <DollarSign className="w-6 h-6 text-amber-600" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Printing Budget Saved
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-['Outfit',sans-serif] mt-1">
            ${costSavedUSDAnnual.toFixed(0)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reallocated toward books, science labs, and teacher resources.
          </p>
        </div>
      </div>

      {/* Comparison: Paper Reports vs. EcoReport Digital Codes */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-['Outfit',sans-serif]">
          System Comparison: Traditional Paper vs. Digital Student Codes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
          {/* Traditional Paper */}
          <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-bold uppercase tracking-wider text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>Traditional Physical Report Cards</span>
            </div>
            <ul className="space-y-2 text-slate-700 text-xs">
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✕</span>
                <span>Fells trees continuously; creates tons of non-recyclable toner waste.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✕</span>
                <span>High recurring expenditure on bond paper, envelopes, and toner cartridges.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✕</span>
                <span>Frequently lost in backpacks, soaked by rain, or concealed by struggling students.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">✕</span>
                <span>One-way communication with zero acknowledgment mechanism for busy parents.</span>
              </li>
            </ul>
          </div>

          {/* EcoReport Digital */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold uppercase tracking-wider text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>EcoReport Digital Student Code Portal</span>
            </div>
            <ul className="space-y-2 text-slate-700 text-xs">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>100% Tree-Friendly: zero pages printed; persistent cloud storage.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Cuts institutional stationery overhead by up to 90%.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Friction-free access for parents: just enter the student's unique access code.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Two-way feedback channel: parents can send messages directly back to teachers.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onGoToParentPortal}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-xs"
          >
            <span>Try Parent Portal Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
