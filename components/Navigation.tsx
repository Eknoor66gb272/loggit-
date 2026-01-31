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
    <header className="bg-slate-950/95 backdrop-blur-3xl border-b-2 border-slate-800 fixed top-0 left-0 right-0 z-[100] px-3 md:px-12 py-2 h-[110px] md:h-[130px] flex items-center shadow-2xl">
      <div className="max-w-[1920px] w-full mx-auto flex items-center justify-between gap-2 md:gap-6 h-full relative">
        
        {/* Brand & Menu Zone - Left Aligned */}
        <div className="flex items-center gap-2 md:gap-8 overflow-hidden">
          <div className="shrink-0 scale-90 md:scale-100 origin-left">
            <Logo size="nav" subtitle="CORE" className="md:mt-[-5px]" />
          </div>
          
          {/* Main Command Hub */}
          <div className="flex overflow-x-auto no-scrollbar py-1">
            <div className="flex bg-black/80 p-1 rounded-xl border border-slate-800 shadow-2xl shrink-0">
              <NavTab label="Read Ledger" active={activeTab === 'dashboard'} onClick={() => onTabChange('dashboard')} color="#E8B49A" />
              <NavTab label="Log Work" active={activeTab === 'logWork'} onClick={() => onTabChange('logWork')} color="#10b981" />
              
              {user.role === 'MASTER' && (
                <>
                  <NavTab label="Employee" active={activeTab === 'employees'} onClick={() => onTabChange('employees')} color="#ffffff" />
                  <NavTab label="Build" active={activeTab === 'build'} onClick={() => onTabChange('build')} color="#89CFF0" icon="fa-compass-drafting" />
                </>
              )}
            </div>
          </div>
        </div>

        {/* System Control Hub - Compact Right Side */}
        <div className="flex items-center gap-2 md:gap-8 shrink-0">
          <div className="hidden sm:flex flex-col items-center mr-2">
            <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)] ${dbStatus === 'connected' ? 'bg-[#10b981]' : dbStatus === 'local' ? 'bg-amber-500' : 'bg-slate-700'}`}></div>
            <span className="text-[6px] font-black uppercase text-slate-500 tracking-widest mt-1">LINK</span>
          </div>

          {user.role === 'MASTER' && activeTab === 'employees' && onAddEmployee && (
            <button 
              onClick={onAddEmployee}
              className={`hidden xl:flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl ${isAddingEmployee ? 'bg-red-600 text-white' : 'bg-[#10b981] text-black'}`}
            >
              <i className={`fa-solid ${isAddingEmployee ? 'fa-xmark' : 'fa-plus-circle'}`}></i>
              {isAddingEmployee ? 'Cancel' : 'Add Employee'}
            </button>
          )}

          {/* User Profile */}
          <div className="flex flex-col items-end whitespace-nowrap min-w-0">
            <span className="text-[10px] md:text-[18px] font-black text-white uppercase tracking-tight logo-font leading-none mb-0.5 truncate max-w-[60px] md:max-w-none">
              {user.fullName.split(' ')[0]}
            </span>
            <span className="text-[6px] md:text-[9px] font-black text-[#10b981] uppercase tracking-[0.4em] opacity-80">
              {user.role}
            </span>
          </div>
          
          <button 
            onClick={onLogout} 
            className="flex items-center justify-center w-9 h-9 md:w-auto md:px-5 md:py-3.5 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-xl border border-red-500/20 transition-all active:scale-95 shadow-lg"
            title="Sign Out"
          >
            <i className="fa-solid fa-power-off text-[10px] md:text-xs"></i>
            <span className="hidden md:inline ml-3 text-[10px] font-black uppercase tracking-widest">Exit</span>
          </button>
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
    style={{ backgroundColor: active ? color : 'transparent', color: active ? 'black' : undefined }}
    className={`px-3 md:px-8 py-2 md:py-2.5 rounded-lg text-[8px] md:text-[10px] font-black uppercase transition-all tracking-widest whitespace-nowrap flex items-center gap-1.5 ${!active ? 'text-slate-500 hover:text-white' : 'shadow-xl scale-105 z-10'}`}
  >
    {icon && <i className={`fa-solid ${icon} text-[7px] md:text-[9px]`}></i>}
    {label}
  </button>
);

export default Navigation;