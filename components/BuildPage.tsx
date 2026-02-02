import React, { useState, useEffect } from 'react';
import { BuildComponent, DesignProject, User, WorkEntry } from '../types';
import { GeminiAssistant } from './GeminiAssistant';
import { storageService } from '../services/storageService';

type FoundryMode = 'ui-builder' | 'data-core';

export const BuildPage: React.FC = () => {
  const [mode, setMode] = useState<FoundryMode>('ui-builder');
  const [projects, setProjects] = useState<DesignProject[]>([]);
  const [activeProject, setActiveProject] = useState<DesignProject | null>(null);
  const [components, setComponents] = useState<BuildComponent[]>([]);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [projectName, setProjectName] = useState('New Blueprint');
  const [activeId, setActiveId] = useState<string | null>(null);

  // Data Core States
  const [rawUsers, setRawUsers] = useState<User[]>([]);
  const [rawEntries, setRawEntries] = useState<WorkEntry[]>([]);
  const [activeDataTable, setActiveDataTable] = useState<'users' | 'entries' | 'projects' | 'repair'>('repair');
  const [localCounts, setLocalCounts] = useState({ users: 0, entries: 0 });

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (mode === 'data-core') {
      fetchRawData();
    }
  }, [mode]);

  const fetchRawData = async () => {
    const [u, e, p] = await Promise.all([
      storageService.getUsers(),
      storageService.getEntries(),
      storageService.getProjects()
    ]);
    setRawUsers(u);
    setRawEntries(e);
    setProjects(p);

    const localUsers = JSON.parse(localStorage.getItem('loggit_v4_users') || '[]');
    const localEntries = JSON.parse(localStorage.getItem('loggit_v4_entries') || '[]');
    setLocalCounts({ users: localUsers.length, entries: localEntries.length });
  };

  const loadProjects = async () => {
    const list = await storageService.getProjects();
    setProjects(list);
    if (list.length > 0 && !activeProject) {
      selectProject(list[0]);
    }
  };

  const selectProject = (p: DesignProject) => {
    setActiveProject(p);
    setComponents(p.components || []);
    setProjectName(p.name || 'Untitled Blueprint');
    setActiveId(null);
  };

  const createNewProject = () => {
    const id = 'proj_' + Math.random().toString(36).substr(2, 9);
    const newProj: DesignProject = {
      id,
      name: 'System Alpha',
      components: [],
      updatedAt: Date.now()
    };
    setActiveProject(newProj);
    setComponents([]);
    setProjectName(newProj.name);
    setActiveId(null);
  };

  const addComponent = (type: BuildComponent['type'], content?: string) => {
    const id = 'comp_' + Math.random().toString(36).substr(2, 9);
    const newComp: BuildComponent = {
      id,
      type,
      content: content || (
        type === 'text' ? 'INITIATE SYSTEM PROTOCOL' : 
        type === 'button' ? 'EXECUTE ACTION' : 
        ''
      ),
      styles: {
        padding: type === 'container' ? '6rem' : '2rem',
        margin: '2rem 0',
        borderRadius: '2.5rem',
        backgroundColor: type === 'button' ? '#10b981' : type === 'container' ? 'rgba(30, 41, 59, 0.15)' : 'transparent',
        color: type === 'button' ? '#000000' : 'white',
        textAlign: 'center',
        fontWeight: '900',
        fontSize: type === 'text' ? '3.5rem' : '0.9rem',
        textTransform: 'uppercase',
        border: type === 'container' ? '4px dashed #1e293b' : 'none',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
        boxShadow: type === 'button' ? '0 20px 40px rgba(16, 185, 129, 0.2)' : 'none',
        letterSpacing: '0.05em'
      }
    };
    setComponents([...components, newComp]);
    setActiveId(id);
  };

  const updateActiveStyle = (style: Partial<React.CSSProperties>) => {
    if (!activeId) return;
    setComponents(prev => prev.map(c => 
      c.id === activeId ? { ...c, styles: { ...c.styles, ...style } } : c
    ));
  };

  const updateActiveContent = (val: string) => {
    if (!activeId) return;
    setComponents(prev => prev.map(c => 
      c.id === activeId ? { ...c, content: val } : c
    ));
  };

  const saveProject = async () => {
    setSaving(true);
    const project: DesignProject = {
      id: activeProject?.id || 'main_blueprint',
      name: projectName,
      components,
      updatedAt: Date.now()
    };
    await storageService.saveProject(project);
    await loadProjects();
    setTimeout(() => setSaving(false), 800);
  };

  const deleteProject = async (id: string) => {
    if (confirm("Permanently erase blueprint?")) {
      const remaining = projects.filter(p => p.id !== id);
      setProjects(remaining);
      localStorage.setItem('loggit_v4_projects', JSON.stringify(remaining));
      if (activeProject?.id === id) {
        if (remaining.length > 0) selectProject(remaining[0]);
        else createNewProject();
      }
    }
  };

  const resetGhostPasscode = async (user: User) => {
    if (confirm(`Repair Profile: Clear 'Ghost Passcode' for ${user.fullName}? This restores the account to PENDING ACTIVATION.`)) {
      await storageService.updateUser(user.id, { isPasswordSet: false, password: '' });
      fetchRawData();
      alert("Profile Repaired.");
    }
  };

  const activeComp = components.find(c => c.id === activeId);

  return (
    <div className="h-full flex flex-col lg:flex-row bg-[#050505] overflow-hidden">
      <aside className="w-full lg:w-[480px] bg-slate-900/40 backdrop-blur-3xl border-r-2 border-slate-800 flex flex-col h-full shrink-0 z-50 overflow-hidden">
        <div className="p-8 flex flex-col gap-8 overflow-y-auto custom-scrollbar flex-grow">
          
          <div className="flex bg-black p-2 rounded-2xl border-2 border-slate-800">
             <button onClick={() => setMode('ui-builder')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'ui-builder' ? 'bg-[#89CFF0] text-black shadow-lg' : 'text-slate-500'}`}>Foundry UI</button>
             <button onClick={() => setMode('data-core')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${mode === 'data-core' ? 'bg-[#10b981] text-black shadow-lg' : 'text-slate-500'}`}>Data Core</button>
          </div>

          {mode === 'ui-builder' ? (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Blueprints</h3>
                   <button onClick={createNewProject} className="text-[#89CFF0] text-[9px] font-black uppercase hover:underline">+ New Design</button>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {projects.map(p => (
                    <button 
                      key={p.id} 
                      onClick={() => selectProject(p)}
                      className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase whitespace-nowrap border-2 transition-all ${activeProject?.id === p.id ? 'bg-[#89CFF0] border-[#89CFF0] text-black' : 'bg-black/40 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-black/40 rounded-3xl border-2 border-slate-800">
                <div className="flex-grow">
                  <h2 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Blueprint Name</h2>
                  <input value={projectName} onChange={(e) => setProjectName(e.target.value)} className="bg-transparent text-xl font-black text-white uppercase outline-none w-full" />
                </div>
                {activeProject && projects.length > 1 && (
                  <button onClick={() => deleteProject(activeProject.id)} className="w-10 h-10 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                    <i className="fa-solid fa-trash-can text-[10px]"></i>
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <ToolButton icon="fa-heading" label="Manuscript" onClick={() => addComponent('text')} />
                <ToolButton icon="fa-bolt" label="Trigger" onClick={() => addComponent('button')} />
                <ToolButton icon="fa-camera-retro" label="Aesthetic" onClick={() => addComponent('image')} />
                <ToolButton icon="fa-layer-group" label="Structure" onClick={() => addComponent('container')} />
              </div>

              {activeComp && (
                <div className="bg-black/60 p-6 rounded-[2rem] border-2 border-slate-800 space-y-6 animate-in slide-in-from-right-2">
                   <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                      <h4 className="text-[10px] font-black text-[#89CFF0] uppercase tracking-widest">Property Inspector</h4>
                      <button onClick={() => setActiveId(null)} className="text-slate-500 hover:text-white"><i className="fa-solid fa-xmark"></i></button>
                   </div>
                   
                   <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-600 uppercase">Content Value</label>
                        <input 
                          type="text" 
                          value={activeComp.content} 
                          onChange={(e) => updateActiveContent(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 p-2 rounded-lg text-xs text-white outline-none focus:border-[#89CFF0]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-600 uppercase">Text Color</label>
                          <input 
                            type="color" 
                            value={String(activeComp.styles.color) || '#ffffff'} 
                            onChange={(e) => updateActiveStyle({ color: e.target.value })}
                            className="w-full h-8 bg-slate-900 border border-slate-700 rounded cursor-pointer"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-600 uppercase">BG Color</label>
                          <input 
                            type="color" 
                            value={String(activeComp.styles.backgroundColor) || '#000000'} 
                            onChange={(e) => updateActiveStyle({ backgroundColor: e.target.value })}
                            className="w-full h-8 bg-slate-900 border border-slate-700 rounded cursor-pointer"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-600 uppercase">Font Size (rem)</label>
                          <input 
                            type="number" step="0.5" min="0.5"
                            value={parseFloat(String(activeComp.styles.fontSize)) || 1}
                            onChange={(e) => updateActiveStyle({ fontSize: `${e.target.value}rem` })}
                            className="w-full bg-slate-900 border border-slate-700 p-2 rounded-lg text-xs text-white outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-600 uppercase">Corner Radius</label>
                          <input 
                            type="range" min="0" max="64" step="2"
                            value={parseInt(String(activeComp.styles.borderRadius)) || 0}
                            onChange={(e) => updateActiveStyle({ borderRadius: `${e.target.value}px` })}
                            className="w-full accent-[#89CFF0]"
                          />
                        </div>
                      </div>
                   </div>
                </div>
              )}

              <GeminiAssistant onAddContent={(type, content) => {
                if (type === 'text') addComponent('text', content);
                else addComponent('image', content);
              }} />

              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Active Architecture</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {components.map((c) => (
                    <div key={c.id} onClick={() => setActiveId(c.id)} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${activeId === c.id ? 'bg-[#89CFF0]/10 border-[#89CFF0] text-white shadow-xl' : 'bg-black/20 border-slate-800 text-slate-500 hover:border-slate-700'}`}>
                      <div className="flex items-center gap-3">
                        <i className={`fa-solid ${c.type === 'text' ? 'fa-heading' : c.type === 'button' ? 'fa-bolt' : c.type === 'image' ? 'fa-image' : 'fa-layer-group'} text-[10px]`}></i>
                        <span className="text-[10px] font-black uppercase truncate max-w-[120px]">{c.content || c.type}</span>
                      </div>
                      <button onClick={(e) => {e.stopPropagation(); setComponents(prev => prev.filter(x => x.id !== c.id))}} className="p-1 hover:text-red-500 transition-colors">
                        <i className="fa-solid fa-trash text-[10px]"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.4em]">Data Integrity Module</h3>
              <div className="space-y-4">
                <DataLink icon="fa-wrench" label="Repair & Sync" count={localCounts.entries} active={activeDataTable === 'repair'} onClick={() => setActiveDataTable('repair')} />
                <DataLink icon="fa-users" label="Personnel Table" count={rawUsers.length} active={activeDataTable === 'users'} onClick={() => setActiveDataTable('users')} />
                <DataLink icon="fa-receipt" label="Ledger Table" count={rawEntries.length} active={activeDataTable === 'entries'} onClick={() => setActiveDataTable('entries')} />
              </div>
            </div>
          )}
        </div>

        <div className="p-8 border-t-2 border-slate-800 bg-slate-900/80">
          <button onClick={saveProject} disabled={saving} className={`w-full py-6 rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl ${saving ? 'bg-[#10b981] text-black animate-pulse' : 'bg-white text-black hover:bg-[#89CFF0] active:scale-95'}`}>
            {saving ? 'UPDATING CORE...' : 'PUSH TO PRODUCTION'}
          </button>
        </div>
      </aside>

      <main className="flex-grow relative flex flex-col h-full bg-[#050505] overflow-hidden">
        {mode === 'ui-builder' ? (
          <div className="flex-grow overflow-y-auto p-12 lg:p-20 custom-scrollbar">
            <div className="min-h-full rounded-[4rem] p-16 flex flex-col items-center gap-12 transition-all border-4 border-dashed border-slate-800/40 bg-slate-950/20 shadow-inner">
              {components.map((comp) => (
                <div key={comp.id} onClick={() => setActiveId(comp.id)} className={`relative group w-full max-w-5xl transition-all cursor-pointer ${activeId === comp.id ? 'scale-[1.02] z-20' : 'hover:scale-[1.01]'}`}>
                  {activeId === comp.id && (
                    <div className="absolute -top-10 left-0 bg-[#89CFF0] text-black text-[9px] font-black px-4 py-1.5 rounded-t-xl uppercase tracking-widest shadow-xl">SELECTED ASSET</div>
                  )}
                  <div style={comp.styles} className={`logo-font ${activeId === comp.id ? 'ring-4 ring-[#89CFF0]' : ''}`}>
                    {comp.type === 'text' && <div className="whitespace-pre-wrap">{comp.content}</div>}
                    {comp.type === 'button' && <div className="w-full tracking-[0.3em] font-black">{comp.content}</div>}
                    {comp.type === 'image' && comp.content && <img src={comp.content} className="w-full h-full object-cover rounded-inherit" alt="Asset" />}
                  </div>
                </div>
              ))}
              {components.length === 0 && (
                <div className="flex flex-col items-center gap-6 py-48 opacity-20">
                   <i className="fa-solid fa-cube text-8xl text-slate-800"></i>
                   <div className="text-slate-500 font-black uppercase tracking-[0.4em]">Empty Architecture Stage</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-grow flex flex-col p-12 overflow-hidden">
             <div className="bg-slate-900/40 border-2 border-slate-800 rounded-[3rem] flex-grow flex flex-col overflow-hidden shadow-2xl">
                <div className="p-8 border-b-2 border-slate-800 flex items-center justify-between bg-black/40">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#10b981]/10 rounded-2xl flex items-center justify-center border border-[#10b981]/20">
                         <i className="fa-solid fa-database text-[#10b981]"></i>
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white uppercase logo-font">Core View: {activeDataTable}</h2>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Supabase High-Precision Mirror</p>
                      </div>
                   </div>
                   <button onClick={fetchRawData} className="px-6 py-3 bg-slate-800 rounded-xl text-[10px] font-black uppercase text-white hover:bg-white hover:text-black transition-all">Synchronize View</button>
                </div>
                <div className="flex-grow overflow-auto custom-scrollbar">
                   {activeDataTable === 'repair' ? (
                     <div className="p-12 space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="bg-black/40 p-10 rounded-[2.5rem] border-2 border-slate-800">
                              <h3 className="text-[10px] font-black uppercase text-[#89CFF0] tracking-widest mb-6 flex items-center gap-3">
                                <i className="fa-solid fa-user-check"></i> Personnel Alignment
                              </h3>
                              <div className="flex items-center justify-between mb-2">
                                 <span className="text-slate-500 text-xs font-black uppercase">Local Cache</span>
                                 <span className="text-white font-mono text-xl">{localCounts.users}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                 <span className="text-slate-500 text-xs font-black uppercase">Cloud Master</span>
                                 <span className="text-[#10b981] font-mono text-xl">{rawUsers.length}</span>
                              </div>
                           </div>
                           <div className="bg-black/40 p-10 rounded-[2.5rem] border-2 border-slate-800">
                              <h3 className="text-[10px] font-black uppercase text-[#89CFF0] tracking-widest mb-6 flex items-center gap-3">
                                <i className="fa-solid fa-receipt"></i> Log Alignment
                              </h3>
                              <div className="flex items-center justify-between mb-2">
                                 <span className="text-slate-500 text-xs font-black uppercase">Local Cache</span>
                                 <span className="text-white font-mono text-xl">{localCounts.entries}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                 <span className="text-slate-500 text-xs font-black uppercase">Cloud Master</span>
                                 <span className="text-[#10b981] font-mono text-xl">{rawEntries.length}</span>
                              </div>
                           </div>
                        </div>

                        <div className="bg-slate-950 p-10 rounded-[3.5rem] border-4 border-[#10b981]/10 flex flex-col items-center text-center shadow-2xl">
                           <div className="w-20 h-20 bg-[#10b981]/10 rounded-full flex items-center justify-center mb-8 border-2 border-[#10b981]/20">
                              <i className="fa-solid fa-wrench text-4xl text-[#10b981]"></i>
                           </div>
                           <h3 className="text-3xl font-black text-white uppercase logo-font mb-4">Master Repair Utility</h3>
                           <p className="text-slate-500 text-xs font-bold max-w-lg mb-10 leading-relaxed uppercase tracking-widest">
                             Fix "Ghost Passcodes" on repurposed accounts (like sam1) to force a fresh activation challenge.
                           </p>
                           <div className="w-full max-w-2xl space-y-4">
                             {rawUsers.filter(u => u.role === 'EMPLOYEE' && u.isPasswordSet).map(u => (
                               <div key={u.id} className="flex items-center justify-between p-5 bg-black rounded-2xl border-2 border-slate-800 group hover:border-[#89CFF0] transition-all">
                                 <div className="text-left">
                                   <div className="text-xs font-black text-white uppercase">{u.fullName}</div>
                                   <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">ID: {u.username} | STATUS: ACTIVATED</div>
                                 </div>
                                 <button 
                                   onClick={() => resetGhostPasscode(u)}
                                   className="px-6 py-3 bg-red-600/10 text-red-500 rounded-xl text-[9px] font-black uppercase border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                                 >
                                   Wipe Passcode
                                 </button>
                               </div>
                             ))}
                           </div>
                        </div>

                        <div className="bg-slate-950 p-10 rounded-[3.5rem] border-4 border-[#10b981]/10 flex flex-col items-center text-center shadow-2xl">
                           <div className="w-20 h-20 bg-[#10b981]/10 rounded-full flex items-center justify-center mb-8 border-2 border-[#10b981]/20">
                              <i className="fa-solid fa-cloud-arrow-up text-4xl text-[#10b981]"></i>
                           </div>
                           <h3 className="text-3xl font-black text-white uppercase logo-font mb-4">Cloud Overwrite</h3>
                           <button 
                             onClick={async () => {
                               if (confirm("Initiate Cloud Sync?")) {
                                 setSyncing(true);
                                 try {
                                   const localEntries = JSON.parse(localStorage.getItem('loggit_v4_entries') || '[]');
                                   for (const e of localEntries) await storageService.addEntry(e);
                                   alert("Cloud Alignment Successful.");
                                   fetchRawData();
                                 } finally {
                                   setSyncing(false);
                                 }
                               }
                             }}
                             disabled={syncing}
                             className={`px-12 py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl ${syncing ? 'bg-slate-800 text-slate-600' : 'bg-[#10b981] text-black hover:scale-105 active:scale-95'}`}
                           >
                             {syncing ? 'Sync Sequence Active...' : 'Overwrite Cloud with Local'}
                           </button>
                        </div>
                     </div>
                   ) : (
                     <table className="w-full text-left">
                        <thead className="sticky top-0 bg-black/60 backdrop-blur-md border-b border-slate-800 text-[10px] text-slate-500 uppercase font-black">
                          <tr>
                            <th className="px-8 py-6">Reference ID</th>
                            <th className="px-8 py-6">Primary Details</th>
                            <th className="px-8 py-6">Cloud Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                          {activeDataTable === 'users' && rawUsers.map(u => (
                            <tr key={u.id} className="hover:bg-white/[0.03] transition-colors group">
                              <td className="px-8 py-6 font-mono text-slate-500 text-[11px]">{u.id}</td>
                              <td className="px-8 py-6 font-black uppercase text-white group-hover:text-[#89CFF0]">{u.fullName}</td>
                              <td className="px-8 py-6">
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${u.status === 'active' ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                  {u.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {activeDataTable === 'entries' && rawEntries.map(e => (
                            <tr key={e.id} className="hover:bg-white/[0.03] transition-colors group">
                              <td className="px-8 py-6 font-mono text-slate-500 text-[11px]">{e.id}</td>
                              <td className="px-8 py-6 font-black uppercase text-white group-hover:text-[#E8B49A]">{e.date}</td>
                              <td className="px-8 py-6">
                                <span className="text-slate-400 font-mono font-bold text-lg">{e.totalHours.toFixed(2)}h</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                     </table>
                   )}
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

const ToolButton: React.FC<{ icon: string; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="bg-black/30 border-2 border-slate-800 p-6 rounded-3xl flex flex-col items-center gap-4 hover:border-[#89CFF0] transition-all group active:scale-95">
    <i className={`fa-solid ${icon} text-2xl text-slate-600 group-hover:text-[#89CFF0] group-hover:scale-110 transition-transform`}></i>
    <span className="text-[9px] font-black text-slate-700 uppercase group-hover:text-white tracking-widest">{label}</span>
  </button>
);

const DataLink: React.FC<{ icon: string, label: string, count: number, active: boolean, onClick: () => void }> = ({ icon, label, count, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${active ? 'bg-[#10b981]/10 border-[#10b981] text-white shadow-lg' : 'bg-black/20 border-slate-800 text-slate-500 hover:border-slate-700'}`}>
    <div className="flex items-center gap-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-[#10b981] text-black' : 'bg-slate-800'}`}>
        <i className={`fa-solid ${icon} text-xs`}></i>
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-[9px] font-mono opacity-40">[{count}]</span>
  </button>
);