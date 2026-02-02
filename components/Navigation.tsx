import React from 'react';
import { User } from '../types';
import Logo from './Logo';

interface NavigationProps {
  user: User;
  onLogout: () => void;
  activeTab: 'dashboard' | 'employees' | 'logWork' | 'build';
  onTabChange: (tab: 'dashboard' | 'employees' | 'logWork' | 'build') => void;
  onAddEmployee?: () => void;
  isAddingEmployee?: boolean;
  dbStatus?: 'connected' | 'local' | 'connecting';
}

const Navigation: React.FC<NavigationProps> = ({ 
  user, 
  onLogout, 
  activeTab, 
  onTabChange, 
  onAddEmployee,
  isAddingEmployee,
  dbStatus = 'connecting'
}) => {
  return (
    <header className="bg-slate-950/95 backdrop-blur-3xl border-b-2 border-slate-800 fixed top-0 left-0 right-0 z-[100] flex flex-col shadow-2xl">
      
      {/* ROW 1: Branding & User Profile */}
      <div className="max-w-[1920px] w-full mx-auto px-6 md:px-12 py-3 md:py-4 flex items-center justify-between gap-4 h-[70px] md:h-[90px]">
        <div className="shrink-0 scale-75 md:scale-100 origin-left">
          <Logo size="nav" subtitle="CORE" className="mt-[-5px]" />
        </div>

        <div className="flex items-center gap-3 md:gap-8 shrink-0">
          <div className="hidden sm:flex flex-col items-center mr-2">
            <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)] ${dbStatus === 'connected' ? 'bg-[#10b981]' : dbStatus === 'local' ? 'bg-amber-500' : 'bg-slate-700'}`}></div>
            <span className="text-[6px] font-black uppercase text-slate-500 tracking-widest mt-1">LINK</span>
          </div>

          <div className="flex flex-col items-end whitespace-nowrap min-w-0">
            <span className="text-sm md:text-lg font-black text-white uppercase tracking-tight logo-font leading-none mb-0.5 truncate max-w-[80px] md:max-w-none">
              {user.fullName}
            </span>
            <span className="text-[7px] md:text-[9px] font-black text-[#10b981] uppercase tracking-[0.4em] opacity-80">
              {user.role} ACCESS
            </span>
          </div>
          
          <button 
            onClick={onLogout} 
            className="flex items-center justify-center w-8 h-8 md:w-auto md:px-5 md:py-2.5 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-xl border border-red-500/20 transition-all active:scale-95 shadow-lg"
            title="Sign Out"
          >
            <i className="fa-solid fa-power-off text-[10px] md:text-xs"></i>
            <span className="hidden md:inline ml-3 text-[9px] font-black uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </div>

      {/* ROW 2: Command Hub - Horizontal Bar Stretching Across Screen */}
      <div className="w-full border-t border-slate-800/50 bg-black/60 px-4 py-2 md:py-3 h-[60px] md:h-[80px] flex items-center">
        <div className="max-w-7xl w-full mx-auto flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth">
          <NavTab 
            label="Read Ledger" 
            active={activeTab === 'dashboard'} 
            onClick={() => onTabChange('dashboard')} 
            color="#E8B49A" 
            icon="fa-receipt"
          />
          <NavTab 
            label="Log Work" 
            active={activeTab === 'logWork'} 
            onClick={() => onTabChange('logWork')} 
            color="#10b981" 
            icon="fa-pen-to-square"
          />
          
          {user.role === 'MASTER' && (
            <>
              <NavTab 
                label="Read Employee" 
                active={activeTab === 'employees'} 
                onClick={() => onTabChange('employees')} 
                color="#ffffff" 
                icon="fa-users"
              />
              <NavTab 
                label="Foundry Build" 
                active={activeTab === 'build'} 
                onClick={() => onTabChange('build')} 
                color="#89CFF0" 
                icon="fa-compass-drafting" 
              />
            </>
          )}

          {/* Contextual Action Button (Mobile/Tablet Add) */}
          {user.role === 'MASTER' && activeTab === 'employees' && onAddEmployee && (
            <button 
              onClick={onAddEmployee}
              className={`flex items-center justify-center h-full px-4 md:px-8 rounded-xl font-black uppercase text-[8px] md:text-[10px] tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shrink-0 ml-auto border-2 ${isAddingEmployee ? 'bg-red-600 border-red-500 text-white' : 'bg-[#10b981] border-[#10b981] text-black'}`}
            >
              <i className={`fa-solid ${isAddingEmployee ? 'fa-xmark' : 'fa-plus'} mr-2`}></i>
              {isAddingEmployee ? 'Cancel' : 'Register New'}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </header>
  );
};

const NavTab: React.FC<{ label: string, active: boolean, onClick: () => void, color: string, icon?: string }> = ({ label, active, onClick, color, icon }) => (
  <button 
    onClick={onClick} 
    style={{ 
      borderColor: active ? color : 'transparent',
      backgroundColor: active ? `${color}15` : 'transparent',
      color: active ? color : undefined 
    }}
    className={`flex-1 min-w-[120px] md:min-w-0 px-3 md:px-4 py-2 md:py-3.5 rounded-xl text-[8px] md:text-[11px] font-black uppercase transition-all tracking-[0.2em] whitespace-nowrap flex items-center justify-center gap-2 md:gap-3 border-2 ${!active ? 'text-slate-500 hover:text-white border-slate-800/40 bg-black/40' : 'shadow-[0_0_20px_rgba(0,0,0,0.4)] scale-[1.02] z-10'}`}
  >
    {icon && <i className={`fa-solid ${icon} text-[10px] md:text-xs`}></i>}
    <span className="font-black">{label}</span>
  </button>
);

export default Navigation;