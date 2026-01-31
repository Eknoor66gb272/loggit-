
import React from 'react';

interface SidebarProps {
  activeTab: 'build' | 'settings' | 'history';
  onTabChange: (tab: 'build' | 'settings' | 'history') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'build', icon: 'fa-wand-magic-sparkles', label: 'Build' },
    { id: 'history', icon: 'fa-clock-rotate-left', label: 'History' },
    { id: 'settings', icon: 'fa-gear', label: 'Settings' },
  ] as const;

  return (
    <aside className="w-20 md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col p-4 gap-2">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
            activeTab === item.id 
              ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' 
              : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'
          }`}
        >
          <i className={`fa-solid ${item.icon} text-lg w-6`}></i>
          <span className="hidden md:block font-medium">{item.label}</span>
        </button>
      ))}
      
      <div className="mt-auto pt-4 border-t border-slate-800">
        <div className="hidden md:block p-4 bg-gradient-to-br from-indigo-900/50 to-blue-900/50 rounded-xl border border-blue-500/20">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Upgrade Pro</p>
          <p className="text-sm text-slate-400 mb-3">Unlock advanced AI components and unlimited exports.</p>
          <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </aside>
  );
};
