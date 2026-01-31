
import React from 'react';
import { MonthSummary, User, WorkEntry } from '../types';

interface HistoryListProps {
  summaries: MonthSummary[];
  onDelete: (id: string) => void;
  onEdit: (entry: WorkEntry) => void;
  onVerifyChange: (monthYear: string, isVerified: boolean) => void;
  currentUser: User;
  viewingUser: User | null;
}

const HistoryList: React.FC<HistoryListProps> = ({ summaries, onDelete, onEdit, onVerifyChange, currentUser, viewingUser }) => {
  if (summaries.length === 0) {
    return (
      <div className="py-24 text-center border-4 border-dashed border-slate-800 rounded-[4rem]">
        <i className="fa-solid fa-receipt text-6xl text-slate-800 mb-8"></i>
        <p className="text-slate-600 font-black uppercase text-sm tracking-[0.6em] logo-font">No transaction history detected</p>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {summaries.map((summary) => (
        <div key={summary.monthYear} className="space-y-6">
          <div className="bg-slate-900/40 p-8 rounded-[3rem] border-2 border-slate-800 flex flex-col xl:flex-row xl:items-center justify-between gap-6 shadow-2xl relative">
            <div className="flex flex-col md:flex-row md:items-center gap-8">
               <div className="flex flex-col">
                  <h4 className="text-3xl font-black text-white logo-font uppercase tracking-tight">{summary.monthYear}</h4>
                  <p className="text-[#E8B49A] text-[9px] font-black uppercase tracking-[0.4em] mt-1 logo-font">Consolidated Period Report</p>
               </div>
               {summary.isVerified ? (
                 <div className="px-4 py-2 bg-[#10b981]/10 text-[#10b981] text-[9px] font-black uppercase border-2 border-[#10b981]/20 rounded-full tracking-[0.1em] logo-font flex items-center gap-2 w-fit">
                   <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-pulse"></div>
                   Authenticated
                 </div>
               ) : (
                 <div className="px-4 py-2 bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase border-2 border-amber-500/20 rounded-full tracking-[0.1em] logo-font flex items-center gap-2 w-fit">
                   <i className="fa-solid fa-hourglass-half text-[8px] animate-spin-slow"></i>
                   Pending
                 </div>
               )}
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="text-center md:text-right">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-1">Total Period Hours</span>
                <span className="text-4xl font-black text-[#10b981] logo-font tabular-nums tracking-tighter">{summary.totalHours.toFixed(2)}h</span>
              </div>
              
              {currentUser.role === 'MASTER' && (
                <button 
                  onClick={() => onVerifyChange(summary.monthYear, !summary.isVerified)}
                  className={`w-full md:w-auto px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all shadow-xl logo-font transform active:scale-95 ${
                    summary.isVerified ? 'bg-red-600/10 text-red-500 border-2 border-red-500/20 hover:bg-red-600 hover:text-white' : 'bg-white text-black hover:bg-[#10b981]'
                  }`}
                >
                  {summary.isVerified ? 'Revoke Auth' : 'Verify Ledger'}
                </button>
              )}
            </div>
          </div>

          <div className="bg-slate-900/20 border-2 border-slate-800 rounded-[2rem] overflow-hidden shadow-xl">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/40 border-b border-slate-800">
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest logo-font">Date</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest logo-font">Shift Period</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest logo-font text-center">Breaks</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest logo-font text-right">Yield</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest logo-font text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {summary.entries.map((entry) => (
                    <tr key={entry.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center font-black text-[11px] text-white logo-font">
                            {new Date(entry.date).getDate()}
                          </div>
                          <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                            {new Date(entry.date).toLocaleDateString('en-GB', { weekday: 'short' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[12px] font-mono font-bold text-white tracking-tight">
                          {entry.timeIn} <span className="text-slate-600 mx-1">→</span> {entry.timeOut}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                          {entry.morningBreak + entry.lunch + entry.afternoonBreak} min
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[14px] font-mono font-black text-[#10b981] tabular-nums">
                          {entry.totalHours.toFixed(2)}h
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {(!summary.isVerified || currentUser.role === 'MASTER') ? (
                            <>
                              <button 
                                onClick={() => onEdit(entry)} 
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:bg-white hover:text-black transition-all"
                                title="Edit Entry"
                              >
                                <i className="fa-solid fa-pen-to-square text-[10px]"></i>
                              </button>
                              <button 
                                onClick={() => onDelete(entry.id)} 
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/5 text-red-500/40 hover:bg-red-500 hover:text-white transition-all"
                                title="Delete Entry"
                              >
                                <i className="fa-solid fa-trash-can text-[10px]"></i>
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-700 opacity-50">
                               <i className="fa-solid fa-lock text-[10px]"></i>
                               <span className="text-[8px] font-black uppercase tracking-widest">Locked</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
      <style>{`
        .animate-spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default HistoryList;
