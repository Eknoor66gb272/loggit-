
import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <nav className="h-14 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <i className="fa-solid fa-layer-group text-white"></i>
        </div>
        <span className="font-bold text-lg tracking-tight">BuildStudio<span className="text-blue-500">PRO</span></span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center bg-slate-900 rounded-full px-4 py-1.5 border border-slate-800">
          <i className="fa-solid fa-magnifying-glass text-slate-500 mr-2 text-sm"></i>
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="bg-transparent border-none outline-none text-sm w-48 placeholder-slate-500"
          />
        </div>
        <button className="p-2 hover:bg-slate-800 rounded-full transition-colors relative">
          <i className="fa-regular fa-bell"></i>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 overflow-hidden">
          <img src="https://picsum.photos/32/32?random=1" alt="Profile" />
        </div>
      </div>
    </nav>
  );
};
