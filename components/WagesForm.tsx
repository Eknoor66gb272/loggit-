
import React, { useState, useEffect } from 'react';
import { User, WorkEntry } from '../types';

interface WagesFormProps {
  user: User;
  onAddEntry: (entry: WorkEntry) => void;
  isMaster?: boolean;
  activeEmployees?: User[];
  initialEntry?: WorkEntry | null;
  onCancel?: () => void;
}

const WagesForm: React.FC<WagesFormProps> = ({ user, onAddEntry, isMaster, activeEmployees = [], initialEntry, onCancel }) => {
  const today = new Date();
  const initialDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

  const [formData, setFormData] = useState({
    userId: user.id,
    date: initialDate,
    timeIn: '08:00',
    timeOut: '17:00',
    morningBreak: 15,
    lunch: 45,
    afternoonBreak: 15,
  });

  const monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const minutes = ["00", "15", "30", "45"];
  const hours = Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0'));

  useEffect(() => {
    if (initialEntry) {
      setFormData({
        userId: initialEntry.userId,
        date: initialEntry.date,
        timeIn: initialEntry.timeIn,
        timeOut: initialEntry.timeOut,
        morningBreak: initialEntry.morningBreak,
        lunch: initialEntry.lunch,
        afternoonBreak: initialEntry.afternoonBreak,
      });
    } else if (isMaster && activeEmployees.length > 0) {
      // Default Master to first employee if not already set
      if (formData.userId === user.id) {
         setFormData(prev => ({ ...prev, userId: activeEmployees[0].id }));
      }
    }
  }, [initialEntry, isMaster, activeEmployees]);

  const handleDateChange = (type: 'day' | 'month' | 'year', val: string) => {
    const [y, m, d] = formData.date.split('-').map(Number);
    let ny = y, nm = m, nd = d;
    if (type === 'day') nd = parseInt(val);
    if (type === 'month') nm = parseInt(val) + 1; // monthsList index to 1-based
    if (type === 'year') ny = parseInt(val);
    
    const dateStr = `${ny}-${nm.toString().padStart(2, '0')}-${nd.toString().padStart(2, '0')}`;
    setFormData({ ...formData, date: dateStr });
  };

  const handleTimeChange = (field: 'timeIn' | 'timeOut', part: 'h' | 'm', val: string) => {
    const parts = formData[field].split(':');
    if (part === 'h') parts[0] = val;
    else parts[1] = val;
    setFormData({ ...formData, [field]: parts.join(':') });
  };

  const calculateHours = () => {
    const [h1, m1] = formData.timeIn.split(':').map(Number);
    const [h2, m2] = formData.timeOut.split(':').map(Number);
    let inMin = h1 * 60 + m1;
    let outMin = h2 * 60 + m2;
    
    // Handle overnight shifts if necessary, though usually standard
    if (outMin < inMin) outMin += 24 * 60;
    
    const totalMin = outMin - inMin;
    const breaks = formData.morningBreak + formData.lunch + formData.afternoonBreak;
    return Math.max(0, (totalMin - breaks) / 60);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEntry({
      id: initialEntry?.id || Math.random().toString(36).substr(2, 9),
      ...formData,
      totalHours: calculateHours(),
      createdAt: initialEntry?.createdAt || Date.now()
    });
  };

  const currentTotal = calculateHours();
  const [currY, currM, currD] = formData.date.split('-').map(Number);

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full">
      <div className="flex flex-col gap-6">
        
        {isMaster && (
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-[#10b981] tracking-[0.3em] ml-2 logo-font">Allocate To Personnel</label>
            <select 
              value={formData.userId} 
              onChange={e => setFormData({...formData, userId: e.target.value})}
              className="w-full bg-black border-4 border-[#10b981]/30 p-4 rounded-xl text-xl font-black text-white outline-none focus:border-[#10b981] logo-font"
            >
              <option value={user.id}>MASTER (SELF)</option>
              {activeEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.fullName.toUpperCase()}</option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase text-[#E8B49A] tracking-[0.3em] ml-2 logo-font">Work Date</label>
          <div className="grid grid-cols-3 gap-3">
            <select value={currD} onChange={e => handleDateChange('day', e.target.value)} className="bg-black border-4 border-slate-800 p-4 rounded-xl text-xl font-black text-white outline-none focus:border-[#10b981]">
              {[...Array(31)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
            </select>
            <select value={currM - 1} onChange={e => handleDateChange('month', e.target.value)} className="bg-black border-4 border-slate-800 p-4 rounded-xl text-xl font-black text-white outline-none focus:border-[#10b981]">
              {monthsList.map((m, i) => <option key={m} value={i}>{m.toUpperCase()}</option>)}
            </select>
            <select value={currY} onChange={e => handleDateChange('year', e.target.value)} className="bg-black border-4 border-slate-800 p-4 rounded-xl text-xl font-black text-white outline-none focus:border-[#10b981]">
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-[#E8B49A] tracking-[0.3em] ml-2 logo-font">Arrival</label>
            <div className="grid grid-cols-2 gap-3">
              <select value={formData.timeIn.split(':')[0]} onChange={e => handleTimeChange('timeIn', 'h', e.target.value)} className="bg-black border-4 border-slate-800 p-4 rounded-xl text-xl font-black text-white outline-none focus:border-[#10b981]">{hours.map(h => <option key={h} value={h}>{h}</option>)}</select>
              <select value={formData.timeIn.split(':')[1]} onChange={e => handleTimeChange('timeIn', 'm', e.target.value)} className="bg-black border-4 border-slate-800 p-4 rounded-xl text-xl font-black text-white outline-none focus:border-[#10b981]">{minutes.map(m => <option key={m} value={m}>{m}</option>)}</select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-[#E8B49A] tracking-[0.3em] ml-2 logo-font">Departure</label>
            <div className="grid grid-cols-2 gap-3">
              <select value={formData.timeOut.split(':')[0]} onChange={e => handleTimeChange('timeOut', 'h', e.target.value)} className="bg-black border-4 border-slate-800 p-4 rounded-xl text-xl font-black text-white outline-none focus:border-[#10b981]">{hours.map(h => <option key={h} value={h}>{h}</option>)}</select>
              <select value={formData.timeOut.split(':')[1]} onChange={e => handleTimeChange('timeOut', 'm', e.target.value)} className="bg-black border-4 border-slate-800 p-4 rounded-xl text-xl font-black text-white outline-none focus:border-[#10b981]">{minutes.map(m => <option key={m} value={m}>{m}</option>)}</select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] ml-2 logo-font">Break Intervals</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/40 border-4 border-slate-800 p-4 rounded-2xl flex flex-col gap-1">
              <span className="text-[8px] font-black text-white uppercase tracking-widest logo-font">Morning</span>
              <select value={formData.morningBreak} onChange={e => setFormData({...formData, morningBreak: Number(e.target.value)})} className="bg-transparent text-2xl font-black text-[#10b981] outline-none">
                {[0, 15, 30, 45, 60].map(v => <option key={v} value={v}>{v}m</option>)}
              </select>
            </div>
            <div className="bg-black/40 border-4 border-slate-800 p-4 rounded-2xl flex flex-col gap-1">
              <span className="text-[8px] font-black text-white uppercase tracking-widest logo-font">Lunch</span>
              <select value={formData.lunch} onChange={e => setFormData({...formData, lunch: Number(e.target.value)})} className="bg-transparent text-2xl font-black text-[#10b981] outline-none">
                {[0, 15, 30, 45, 60, 75, 90].map(v => <option key={v} value={v}>{v}m</option>)}
              </select>
            </div>
            <div className="bg-black/40 border-4 border-slate-800 p-4 rounded-2xl flex flex-col gap-1">
              <span className="text-[8px] font-black text-white uppercase tracking-widest logo-font">Afternoon</span>
              <select value={formData.afternoonBreak} onChange={e => setFormData({...formData, afternoonBreak: Number(e.target.value)})} className="bg-transparent text-2xl font-black text-[#10b981] outline-none">
                {[0, 15, 30, 45, 60].map(v => <option key={v} value={v}>{v}m</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t-2 border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <span className="text-[9px] font-black uppercase text-[#E8B49A] tracking-[0.4em] block mb-1 logo-font">Yield</span>
          <span className="text-6xl font-black text-white tracking-tighter leading-none tabular-nums">{currentTotal.toFixed(2)}h</span>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          {onCancel && (
            <button type="button" onClick={onCancel} className="flex-1 md:px-8 py-5 bg-slate-800 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-700 transition-all logo-font">Cancel</button>
          )}
          <button type="submit" className="flex-[2] md:px-12 py-5 bg-[#10b981] text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl logo-font">Commit Entry</button>
        </div>
      </div>
    </form>
  );
};

export default WagesForm;
