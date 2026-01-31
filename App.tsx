import React, { useState, useEffect, useCallback } from 'react';
import { User, WorkEntry, MonthSummary, UserStatus } from './types';
import { storageService } from './services/storageService';
import { MASTER_CREDENTIALS } from './constants';
import AnalogClock from './components/AnalogClock';
import WagesForm from './components/WagesForm';
import SummaryDashboard from './components/SummaryDashboard';
import HistoryList from './components/HistoryList';
import Logo from './components/Logo';
import SplashSequence from './components/SplashSequence';
import Navigation from './components/Navigation';
import { BuildPage } from './components/BuildPage';

type Tab = 'dashboard' | 'employees' | 'logWork' | 'build';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [summaries, setSummaries] = useState<MonthSummary[]>([]);
  const [activeTab, setActiveTab] = useState('build' as Tab); 
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'local' | 'connecting'>('connecting');
  
  const [editingEntry, setEditingEntry] = useState<WorkEntry | null>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginDob, setLoginDob] = useState('1990-01-01');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [tempUser, setTempUser] = useState<User | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  // Employee Registry States
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [newEmp, setNewEmp] = useState({ 
    fullName: '', 
    username: '', 
    dob: '1995-01-01', 
    email: '', 
    tel: '', 
    address: '', 
    status: 'active' as UserStatus 
  });

  // ROBUST PWA WAKE-UP TRIGGER
  useEffect(() => {
    const triggerWakeSplash = () => {
      // If app is revealed and we have a user, trigger intro overlay
      if (document.visibilityState === 'visible' && currentUser && !showSplash) {
        setShowSplash(true);
      }
    };

    document.addEventListener('visibilitychange', triggerWakeSplash);
    window.addEventListener('focus', triggerWakeSplash);
    window.addEventListener('pageshow', triggerWakeSplash);
    
    return () => {
      document.removeEventListener('visibilitychange', triggerWakeSplash);
      window.removeEventListener('focus', triggerWakeSplash);
      window.removeEventListener('pageshow', triggerWakeSplash);
    };
  }, [currentUser, showSplash]);

  const refreshData = useCallback(async (userId: string, isMaster: boolean, viewUser?: User | null) => {
    setLoading(true);
    try {
        const [latestUsers, allEntries, allVerifications] = await Promise.all([
            storageService.getUsers(),
            storageService.getEntries(),
            storageService.getVerifications()
        ]);
        
        setAllUsers(latestUsers);
        setDbStatus(storageService.getConnectionStatus());
        
        const targetViewUser = viewUser !== undefined ? viewUser : viewingUser;
        let filteredEntries: WorkEntry[] = [];

        if (isMaster && !targetViewUser) {
          filteredEntries = allEntries.filter(e => {
            const owner = latestUsers.find(u => u.id === e.userId);
            return owner && (owner.status === 'active' || owner.role === 'MASTER');
          });
          setSummaries(storageService.getSummariesFromEntries(filteredEntries, allVerifications, 'GLOBAL_LEDGER'));
        } else {
          const targetId = targetViewUser ? targetViewUser.id : userId;
          filteredEntries = allEntries.filter(e => e.userId === targetId);
          setSummaries(storageService.getSummariesFromEntries(filteredEntries, allVerifications, targetId));
        }
        setEntries(filteredEntries);
    } catch (err) {
        console.error("Ledger Synthesis Error:", err);
    } finally {
        setLoading(false);
    }
  }, [viewingUser]);

  useEffect(() => {
    const initApp = async () => {
        await storageService.init();
        setDbStatus(storageService.getConnectionStatus());
        // PERSISTENCE: Use localStorage so PWA doesn't logout
        const savedUser = localStorage.getItem('logged_user');
        const latestUsers = await storageService.getUsers();
        setAllUsers(latestUsers);

        if (savedUser) {
          const u = JSON.parse(savedUser);
          const latest = latestUsers.find(x => x.id === u.id);
          if (latest && (latest.role === 'MASTER' || latest.status === 'active')) {
            setCurrentUser(latest);
            refreshData(latest.id, latest.role === 'MASTER');
          }
        }
    };
    initApp();
  }, [refreshData]);

  const handleInitialVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const uTrim = loginUsername.trim();
    const pTrim = loginPassword.trim();
    
    if (uTrim.toLowerCase() === MASTER_CREDENTIALS.username.toLowerCase() && pTrim === MASTER_CREDENTIALS.accessCode) {
      const users = await storageService.getUsers();
      const master = users.find(u => u.role === 'MASTER');
      if (master) { loginUser(master); return; }
    }
    
    const users = await storageService.getUsers();
    const user = users.find(u => u.username === uTrim);
    
    if (!user || user.status === 'left') { 
      setError('UNAUTHORIZED: Access revoked by administration.'); 
      return; 
    }
    
    if (!user.isPasswordSet) {
      if (!tempUser) { setTempUser(user); setError(''); return; }
      if (user.dob === loginDob) { setIsVerifying(true); setError(''); }
      else { setError(`Security mismatch.`); }
    } else {
      if (user.password === pTrim) loginUser(user);
      else setError('Incorrect passcode.');
    }
  };

  const loginUser = (user: User) => {
    setCurrentUser(user);
    setIsVerifying(false);
    setTempUser(null);
    setLoginUsername('');
    setLoginPassword('');
    setError('');
    localStorage.setItem('logged_user', JSON.stringify(user));
    setShowSplash(true); 
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setViewingUser(null);
    setActiveTab('dashboard');
    setIsVerifying(false);
    setTempUser(null);
    setEditingEntry(null);
    setIsAddingEmployee(false);
    setEditingUser(null);
    localStorage.removeItem('logged_user');
  };

  const handleAddEntry = async (entry: WorkEntry) => {
    if (currentUser?.role === 'EMPLOYEE' && await storageService.isMonthVerified(currentUser.id, entry.date)) {
      alert("UNAUTHORIZED: Period is Locked.");
      return;
    }
    setLoading(true);
    if (editingEntry) await storageService.deleteEntry(editingEntry.id);
    await storageService.addEntry(entry);
    setEditingEntry(null);
    setActiveTab('dashboard');
    await refreshData(currentUser!.id, currentUser!.role === 'MASTER');
  };

  const handleEditEntry = async (entry: WorkEntry) => {
    if (currentUser?.role === 'EMPLOYEE' && await storageService.isMonthVerified(currentUser.id, entry.date)) {
      alert("ACCESS DENIED: Locked by Auth.");
      return;
    }
    setEditingEntry(entry);
    setActiveTab('logWork');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVerifyChange = async (monthYear: string, isVerified: boolean) => {
    if (currentUser?.role === 'MASTER') {
      const targetId = viewingUser ? viewingUser.id : (activeTab === 'dashboard' && !viewingUser ? 'GLOBAL_LEDGER' : currentUser.id);
      await storageService.setVerification(targetId, monthYear, isVerified);
      await refreshData(currentUser.id, true);
    }
  };

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (editingUser) {
      await storageService.updateUser(editingUser.id, editingUser);
      setEditingUser(null);
    } else {
      await storageService.addUser(newEmp);
      setIsAddingEmployee(false);
      setNewEmp({ fullName: '', username: '', dob: '1995-01-01', email: '', tel: '', address: '', status: 'active' });
    }
    await refreshData(currentUser!.id, currentUser!.role === 'MASTER');
  };

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setViewingUser(null);
    setIsAddingEmployee(false);
    setEditingUser(null);
    setEditingEntry(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startInspecting = (user: User) => {
    setViewingUser(user);
    setActiveTab('dashboard');
    setIsAddingEmployee(false);
    setEditingUser(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleUserStatus = async (user: User) => {
    const newStatus: UserStatus = user.status === 'active' ? 'left' : 'active';
    const msg = newStatus === 'left' ? 
      `Archive ${user.fullName}? This will block their login access.` : 
      `Restore ${user.fullName}? They will regain access.`;
    if (confirm(msg)) {
      await storageService.updateUser(user.id, { status: newStatus });
      await refreshData(currentUser!.id, true);
    }
  };

  if (isVerifying && tempUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-[400px] bg-slate-900 rounded-[2.5rem] px-8 py-20 border-[6px] border-slate-800 text-center shadow-[0_0_80px_rgba(0,0,0,0.8)] relative">
          <div className="mb-12 mt-[-3rem] flex justify-center items-center">
            <Logo size="lg" subtitle="SECURITY CHECK" />
          </div>
          <h2 className="text-xs font-bold text-[#E8B49A] mb-8 uppercase tracking-widest logo-font">Setup Passcode</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            storageService.setUserPassword(tempUser.id, newPassword);
            loginUser({...tempUser, password: newPassword, isPasswordSet: true});
            setActiveTab('dashboard');
          }} className="space-y-6">
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-4 bg-black border-4 border-slate-800 rounded-xl text-white text-center text-3xl tracking-[0.4em] outline-none focus:border-[#10b981] logo-font" placeholder="••••" required minLength={4} maxLength={8} />
            <button type="submit" className="w-full bg-[#10b981] text-black py-4.5 rounded-xl font-black uppercase tracking-[0.2em] text-sm hover:scale-[1.02] active:scale-95 transition-all logo-font">Activate Account</button>
          </form>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-[400px] bg-slate-900 rounded-[2.5rem] px-8 py-20 border-[6px] border-slate-800 shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col items-center relative">
          <div className="mb-12 mt-[-4rem] flex justify-center items-center w-full">
            <Logo size="xl" subtitle="Payroll System" />
          </div>
          <form onSubmit={handleInitialVerify} className="space-y-7 w-full">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2 logo-font">Authorized ID</label>
              <input type="text" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} className="w-full px-6 py-5 bg-slate-950 border-[3px] border-slate-800 rounded-xl text-white outline-none font-black text-xl focus:border-[#10b981] transition-all logo-font" placeholder="Username" required />
            </div>
            {!tempUser ? (
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2 logo-font">Access Key</label>
                <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full px-6 py-5 bg-slate-950 border-[3px] border-slate-800 rounded-xl text-white outline-none font-black text-xl focus:border-[#89CFF0] transition-all logo-font" placeholder="••••••••" required />
              </div>
            ) : (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <p className="text-xs text-slate-400 mb-4 logo-font">Security Challenge Active</p>
                <input type="date" value={loginDob} onChange={e => setLoginDob(e.target.value)} className="w-full bg-black border-2 border-slate-800 p-4 rounded-xl text-white outline-none font-black focus:border-[#10b981]" />
              </div>
            )}
            {error && <p className="text-red-500 text-[9px] font-black text-center uppercase tracking-widest bg-red-500/10 py-4 rounded-lg logo-font">{error}</p>}
            <button type="submit" className="w-full bg-white text-black py-5 rounded-xl font-black uppercase tracking-[0.1em] text-lg border-4 border-transparent hover:bg-[#10b981] hover:scale-[1.01] active:scale-95 transition-all logo-font">Initialize Session</button>
          </form>
        </div>
      </div>
    );
  }

  const activeEmployees = allUsers.filter(u => u.role === 'EMPLOYEE' && u.status === 'active');
  const leftEmployees = allUsers.filter(u => u.role === 'EMPLOYEE' && u.status === 'left');

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-[#89CFF0] selection:text-black">
      {/* CINEMATIC OVERLAY: Played on top so tab state is never lost */}
      {showSplash && currentUser && (
        <SplashSequence onComplete={() => setShowSplash(false)} />
      )}

      <Navigation 
        user={currentUser} 
        onLogout={handleLogout} 
        activeTab={activeTab} 
        onTabChange={switchTab} 
        onAddEmployee={() => { setIsAddingEmployee(!isAddingEmployee); setEditingUser(null); }}
        isAddingEmployee={isAddingEmployee}
        dbStatus={dbStatus}
      />
      
      <div className="flex-grow pt-[110px] md:pt-[130px]">
        {activeTab === 'build' ? (
          <div className="h-[calc(100vh-130px)] overflow-hidden">
            <BuildPage />
          </div>
        ) : (
          <main className="max-w-[1600px] mx-auto p-4 lg:px-12 lg:py-6 flex flex-col gap-6 min-h-screen pb-20">
            {activeTab === 'dashboard' ? (
              <div className="space-y-12 animate-in fade-in duration-500">
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                      <h2 className="text-5xl md:text-[6.5rem] font-black logo-font text-white uppercase tracking-[-0.05em] leading-[0.9] mb-0">
                        {viewingUser ? viewingUser.fullName.toUpperCase() : (currentUser.role === 'MASTER' ? "Queens Ledger" : 'LEDGER')}
                      </h2>
                    </div>
                    {viewingUser && <button onClick={() => setViewingUser(null)} className="px-7 py-3 bg-[#E8B49A] text-black rounded-lg text-xs font-black uppercase tracking-widest shadow-md hover:scale-105 transition-transform logo-font">End Inspection</button>}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full">
                    <div className="lg:col-span-8 flex flex-col">
                      <SummaryDashboard entries={entries} />
                    </div>
                    <div className="lg:col-span-4 w-full flex items-center justify-center p-4 bg-slate-900/40 rounded-[3rem] border-2 border-slate-800 shadow-2xl relative overflow-hidden min-h-[520px]">
                      {currentUser.role === 'EMPLOYEE' && !viewingUser && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
                           <i className="fa-solid fa-lock text-[32rem] text-white"></i>
                        </div>
                      )}
                      <AnalogClock />
                    </div>
                  </div>

                  {currentUser.role === 'EMPLOYEE' && !viewingUser && (
                    <div className="w-full flex justify-center mt-6">
                      <div className="w-full max-w-2xl bg-slate-900 p-10 rounded-[4rem] border-2 border-slate-800 shadow-2xl">
                          <WagesForm user={currentUser} onAddEntry={handleAddEntry} initialEntry={editingEntry} onCancel={editingEntry ? () => setEditingEntry(null) : undefined} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6 mt-6">
                     <div className="flex items-center gap-6">
                        <div className="h-px flex-grow bg-slate-800"></div>
                        <h3 className="text-[10px] font-black logo-font text-white uppercase tracking-[0.6em] opacity-40">
                          Historical Archives
                        </h3>
                        <div className="h-px flex-grow bg-slate-800"></div>
                     </div>
                     <HistoryList summaries={summaries} onDelete={async (id) => { if(confirm("PERMANENT ERASE?")) { await storageService.deleteEntry(id); refreshData(currentUser.id, currentUser.role === 'MASTER'); } }} onEdit={handleEditEntry} onVerifyChange={handleVerifyChange} currentUser={currentUser} viewingUser={viewingUser} />
                </div>
              </div>
            ) : activeTab === 'employees' ? (
              <div className="space-y-12 animate-in fade-in duration-500">
                 <div className="flex flex-col md:flex-row justify-between items-center border-b-2 border-slate-800 pb-10 gap-6">
                    <h2 className="text-4xl lg:text-7xl font-black text-white uppercase logo-font tracking-tight">Employee Registry</h2>
                    <button onClick={() => { setIsAddingEmployee(!isAddingEmployee); setEditingUser(null); }} className="px-10 py-5 bg-white text-black font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 logo-font">
                      {isAddingEmployee || editingUser ? 'Cancel Operation' : 'Add Employee'}
                    </button>
                 </div>
                 
                 {(isAddingEmployee || editingUser) && (
                    <div className="bg-slate-900 p-10 rounded-[3rem] border-4 border-slate-800 shadow-2xl max-w-4xl mx-auto animate-in zoom-in duration-300 mb-12">
                       <h3 className="text-3xl font-black logo-font text-white mb-10 uppercase text-center">{editingUser ? 'Modify Employee' : 'New Employee Registration'}</h3>
                       <form onSubmit={handleEmployeeSubmit} className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2 logo-font">Full Legal Name</label>
                              <input type="text" value={editingUser ? editingUser.fullName : newEmp.fullName} onChange={e => editingUser ? setEditingUser({...editingUser, fullName: e.target.value}) : setNewEmp({...newEmp, fullName: e.target.value})} className="w-full bg-black border-2 border-slate-800 p-5 rounded-2xl text-white outline-none font-black text-lg focus:border-[#89CFF0]" placeholder="Full Name" required />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2 logo-font">Authorized ID</label>
                              <input type="text" value={editingUser ? editingUser.username : newEmp.username} onChange={e => editingUser ? setEditingUser({...editingUser, username: e.target.value}) : setNewEmp({...newEmp, username: e.target.value})} className="w-full bg-black border-2 border-slate-800 p-5 rounded-2xl text-white outline-none font-black text-lg focus:border-[#89CFF0]" placeholder="Username" required />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2 logo-font">Service Status</label>
                              <div className="flex gap-2">
                                <button type="button" onClick={() => editingUser ? setEditingUser({...editingUser, status: 'active'}) : setNewEmp({...newEmp, status: 'active'})} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${(editingUser?.status || newEmp.status) === 'active' ? 'bg-[#10b981] border-[#10b981] text-black' : 'border-slate-800 text-slate-500'}`}>Active</button>
                                <button type="button" onClick={() => editingUser ? setEditingUser({...editingUser, status: 'left'}) : setNewEmp({...newEmp, status: 'left'})} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${(editingUser?.status || newEmp.status) === 'left' ? 'bg-amber-600 border-amber-600 text-white' : 'border-slate-800 text-slate-500'}`}>Left</button>
                              </div>
                            </div>
                            <div className="space-y-1 md:col-span-2">
                              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2 logo-font">Residential Address</label>
                              <input type="text" value={editingUser ? editingUser.address : newEmp.address} onChange={e => editingUser ? setEditingUser({...editingUser, address: e.target.value}) : setNewEmp({...newEmp, address: e.target.value})} className="w-full bg-black border-2 border-slate-800 p-5 rounded-2xl text-white outline-none font-black text-lg focus:border-[#89CFF0]" placeholder="Address" />
                            </div>
                          </div>
                          <button type="submit" className="w-full py-7 bg-[#10b981] text-black font-black uppercase text-lg tracking-[0.3em] rounded-2xl shadow-xl hover:scale-[1.01] transition-all">
                            {editingUser ? 'Update Employee Record' : 'Commit Entry'}
                          </button>
                       </form>
                    </div>
                 )}

                 <div className="space-y-12">
                   <div className="space-y-4">
                      <h3 className="text-[11px] font-black text-[#10b981] uppercase tracking-[0.5em] ml-4">Active Personnel</h3>
                      <div className="grid grid-cols-1 gap-4">
                        {activeEmployees.map(u => (
                          <div key={u.id} className="bg-slate-900/50 p-5 rounded-[2rem] border-2 border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 group transition-all shadow-lg hover:bg-slate-900">
                            <div className="flex items-center gap-6 w-full sm:w-auto">
                                <div className="w-14 h-14 rounded-[1.2rem] flex items-center justify-center font-black text-xl border-2 border-slate-800 shrink-0 bg-black text-[#89CFF0]">
                                  {u.fullName.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-left">
                                  <h4 className="text-lg font-black text-white uppercase logo-font tracking-tight">{u.fullName}</h4>
                                  <p className="text-[8px] font-black uppercase tracking-[0.3em] mt-1 text-[#10b981]">ACTIVE SERVICE</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap justify-center sm:justify-end gap-3 w-full sm:w-auto">
                                <button onClick={() => startInspecting(u)} className="px-6 py-4 bg-[#89CFF0] text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md">Ledger</button>
                                <button onClick={() => { setEditingUser(u); setIsAddingEmployee(false); }} className="px-6 py-4 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md">Edit Profile</button>
                                <button onClick={() => toggleUserStatus(u)} className="px-6 py-4 border-2 border-amber-500/20 text-amber-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Archive</button>
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>

                   {leftEmployees.length > 0 && (
                     <div className="space-y-4">
                        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] ml-4">Archived Personnel</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {leftEmployees.map(u => (
                            <div key={u.id} className="bg-slate-900/20 p-5 rounded-[2rem] border-2 border-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-4 opacity-50 grayscale transition-all">
                              <div className="flex items-center gap-6 w-full sm:w-auto">
                                  <div className="w-14 h-14 rounded-[1.2rem] flex items-center justify-center font-black text-xl border-2 border-slate-800/40 shrink-0 bg-black text-slate-600">
                                    {u.fullName.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="text-left">
                                    <h4 className="text-lg font-black text-slate-400 uppercase logo-font tracking-tight">{u.fullName}</h4>
                                    <p className="text-[8px] font-black uppercase tracking-[0.3em] mt-1 text-amber-500">SERVICE EXIT</p>
                                  </div>
                              </div>
                              <div className="flex flex-wrap justify-center sm:justify-end gap-3 w-full sm:w-auto">
                                  <button onClick={() => startInspecting(u)} className="px-6 py-4 bg-slate-800 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest">History</button>
                                  <button onClick={() => toggleUserStatus(u)} className="px-6 py-4 border-2 border-[#10b981]/20 text-[#10b981] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Restore</button>
                              </div>
                            </div>
                          ))}
                        </div>
                     </div>
                   )}
                 </div>
              </div>
            ) : (
              <div className="w-full flex justify-center animate-in fade-in duration-500">
                 <div className="w-full max-w-2xl bg-slate-900 p-12 rounded-[4rem] border-2 border-slate-800 shadow-2xl">
                     <h2 className="text-3xl font-black text-white uppercase mb-12 logo-font">Log Work</h2>
                     <WagesForm user={currentUser} onAddEntry={handleAddEntry} initialEntry={editingEntry} onCancel={() => switchTab('dashboard')} isMaster={currentUser.role === 'MASTER'} activeEmployees={activeEmployees} />
                 </div>
              </div>
            )}
            
            <footer className="py-24 opacity-10 flex flex-col items-center mt-auto">
              <Logo className="grayscale scale-75 mb-6" />
              <p className="text-[9px] font-black uppercase tracking-[0.8em] text-white logo-font">Precision Engine Core &copy; 2025</p>
            </footer>
          </main>
        )}
      </div>
    </div>
  );
};

export default App;