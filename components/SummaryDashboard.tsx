
import React, { useMemo } from 'react';
import { WorkEntry } from '../types';

interface SummaryDashboardProps {
  entries: WorkEntry[];
}

const SummaryDashboard: React.FC<SummaryDashboardProps> = ({ entries }) => {
  const monthGroups = useMemo(() => {
    const groups: Record<string, { total: number; m: number; y: number; name: string }> = {};
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    entries.forEach(e => {
      if (!e.date) return;
      const [y, m] = e.date.split('-').map(Number);
      const key = `${y}-${m.toString().padStart(2, '0')}`;
      if (!groups[key]) {
        groups[key] = { total: 0, m, y, name: months[m - 1].toUpperCase() };
      }
      groups[key].total += (Number(e.totalHours) || 0);
    });

    return Object.entries(groups)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([_, data]) => data);
  }, [entries]);

  const currentCycle = monthGroups.length > 0 ? monthGroups[0] : null;
  const previousCycle = monthGroups.length > 1 ? monthGroups[1] : null;

  const now = useMemo(() => new Date(), []);
  const currentNameFallback = now.toLocaleString('default', { month: 'long' }).toUpperCase();
  const currentYearFallback = now.getFullYear();

  const weeklyTotal = useMemo(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const filtered = entries.filter(e => {
      if (!e.date) return false;
      const [y, m, d] = e.date.split('-').map(Number);
      const entryDate = new Date(y, m - 1, d);
      return entryDate >= sevenDaysAgo;
    });
    
    return filtered.reduce((sum, e) => sum + (Number(e.totalHours) || 0), 0);
  }, [entries]);

  const yearToDateTotal = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const filtered = entries.filter(e => {
      if (!e.date) return false;
      return e.date.startsWith(currentYear.toString());
    });
    return filtered.reduce((sum, e) => sum + (Number(e.totalHours) || 0), 0);
  }, [entries]);

  // High precision currency/hour format
  const formatVal = (val: number) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 w-full h-full">
      {/* Box 1: This Month */}
      <div className="bg-[#10b981] p-6 lg:p-10 rounded-[4rem] shadow-2xl border-4 border-black/10 flex flex-col justify-between min-h-[240px] relative overflow-visible group transform hover:scale-[1.02] transition-all">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
             <h4 className="text-[11px] font-black uppercase text-black/60 tracking-[0.4em] logo-font">This Month</h4>
             <div className="w-4 h-4 bg-white/40 rounded-full animate-pulse shadow-sm"></div>
          </div>
          <div className="flex items-baseline gap-2 overflow-visible">
            <span className="text-5xl md:text-6xl lg:text-7xl font-black text-black tabular-nums leading-none tracking-tighter">
              {formatVal(currentCycle?.total || 0)}
            </span>
            <span className="text-sm lg:text-base font-black uppercase text-black/40 tracking-widest logo-font">hrs</span>
          </div>
        </div>
        <div className="text-[9px] font-black text-black/40 logo-font uppercase tracking-[0.4em] pt-6 border-t border-black/10 mt-6">
          IDENTIFIER: {currentCycle?.name || currentNameFallback} {currentCycle?.y || currentYearFallback}
        </div>
      </div>

      {/* Box 2: Last Month */}
      <div className="bg-[#E8B49A] p-6 lg:p-10 rounded-[4rem] shadow-2xl border-4 border-black/10 flex flex-col justify-between min-h-[240px] relative overflow-visible group transform hover:scale-[1.02] transition-all">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
             <h4 className="text-[11px] font-black uppercase text-black/60 tracking-[0.4em] logo-font">Last Month</h4>
             <i className="fa-solid fa-clock-rotate-left text-black/20 text-2xl"></i>
          </div>
          <div className="flex items-baseline gap-2 overflow-visible">
            <span className="text-5xl md:text-6xl lg:text-7xl font-black text-black tabular-nums leading-none tracking-tighter">
              {formatVal(previousCycle?.total || 0)}
            </span>
            <span className="text-sm lg:text-base font-black uppercase text-black/40 tracking-widest logo-font">hrs</span>
          </div>
        </div>
        <div className="text-[9px] font-black text-black/40 logo-font uppercase tracking-[0.4em] pt-6 border-t border-black/10 mt-6">
          ARCHIVE: {previousCycle?.name || "RECORDS"} {previousCycle?.y || ""}
        </div>
      </div>

      {/* Box 3: Current Week */}
      <div className="bg-slate-900 p-6 lg:p-10 rounded-[4rem] shadow-2xl border-4 border-slate-800 flex flex-col justify-between min-h-[240px] relative overflow-visible group transform hover:scale-[1.02] transition-all">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
             <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] logo-font">Current Week</h4>
             <div className="flex gap-2">
               <div className="w-2.5 h-2.5 bg-[#10b981] rounded-full"></div>
               <div className="w-2.5 h-2.5 bg-slate-700 rounded-full"></div>
             </div>
          </div>
          <div className="flex items-baseline gap-2 overflow-visible">
            <span className="text-5xl md:text-6xl lg:text-7xl font-black text-white tabular-nums leading-none tracking-tighter">
              {formatVal(weeklyTotal)}
            </span>
            <span className="text-sm lg:text-base font-black uppercase text-slate-600 tracking-widest logo-font">hrs</span>
          </div>
        </div>
        <div className="text-[9px] font-black text-[#10b981] logo-font uppercase tracking-[0.4em] pt-6 border-t border-slate-800 flex items-center gap-3 mt-6">
          <i className="fa-solid fa-chart-area text-[11px]"></i>
          PRECISION TRACKING ACTIVE
        </div>
      </div>

      {/* Box 4: Year to Date */}
      <div className="bg-[#89CFF0] p-6 lg:p-10 rounded-[4rem] shadow-2xl border-4 border-black/10 flex flex-col justify-between min-h-[240px] relative overflow-visible group transform hover:scale-[1.02] transition-all">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
             <h4 className="text-[11px] font-black uppercase text-black/60 tracking-[0.4em] logo-font">Year to Date</h4>
             <i className="fa-solid fa-award text-black/20 text-2xl"></i>
          </div>
          <div className="flex items-baseline gap-2 overflow-visible">
            <span className="text-5xl md:text-6xl lg:text-7xl font-black text-black tabular-nums leading-none tracking-tighter">
              {formatVal(yearToDateTotal)}
            </span>
            <span className="text-sm lg:text-base font-black uppercase text-black/40 tracking-widest logo-font">hrs</span>
          </div>
        </div>
        <div className="text-[9px] font-black text-black/40 logo-font uppercase tracking-[0.4em] pt-6 border-t border-black/10 mt-6">
          YTD AGGREGATE: {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default SummaryDashboard;
