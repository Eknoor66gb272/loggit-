
import React, { useState, useEffect } from 'react';
import { User, WorkEntry, MonthSummary, VerificationRecord } from './types';
import { storageService } from './services/storageService';
import { MASTER_CREDENTIALS } from './constants';
import DigitalClock from './components/DigitalClock';
import WagesForm from './components/WagesForm';
import SummaryDashboard from './components/SummaryDashboard';
import HistoryList from './components/HistoryList';
import Logo from './components/Logo';
import SplashSequence from './components/SplashSequence';
import Navigation from './components/Navigation';

// Fix: Updated Tab type to match Navigation component's expected types
type Tab = 'dashboard' | 'employees' | 'logWork';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [summaries, setSummaries] = useState<MonthSummary[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [showJkkEntryCard, setShowJkkEntryCard] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WorkEntry | null>(null);

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginDob, setLoginDob] = useState('1990-01-01');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [tempUser, setTempUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showSplash, setShowSplash] = useState(true);

  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [newEmp, setNewEmp] = useState({ fullName: '', username: '', dob: '1995-01-01', email: '', tel: '', address: '' });

  const monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const yearsList = [2024, 2025, 2026];

  // Fix: storageService methods are async, must await them
  useEffect(() => {
    const initApp = async () => {
        await storageService.init();
        const savedUser = sessionStorage.getItem('logged_user');
        if (savedUser) {
          const u = JSON.parse(savedUser);
          const latestUsers = await storageService.getUsers();
          const latest = latestUsers.find(x => x.id === u.id);
          if (latest && latest.isActive) {
            setCurrentUser(latest);
            refreshData(latest.id, latest.role === 'MASTER');
          } else {
            handleLogout();
          }
        }
    };
    initApp();
  }, []);

  const parseLocalDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  // Fix: refreshData must be async to await storageService calls
  const refreshData = async (userId: string, isMaster: boolean) => {
    try {
        const [users, allEntries, allVerifications] = await Promise.all([
            storageService.getUsers(),
            storageService.getEntries(),
            storageService.getVerifications()
        ]);
        
        setAllUsers(users);
        setVerifications(allVerifications);

        let allRelevantEntries: WorkEntry[] = [];
        if (isMaster && !viewingUser) {
          allRelevantEntries = allEntries.filter(e => {
            const owner = users.find(u => u.id === e.userId);
            return owner && owner.role !== 'MASTER';
          });
        } else {
          const targetId = viewingUser ? viewingUser.id : userId;
          allRelevantEntries = allEntries.filter(e => e.userId === targetId);
        }

        if (viewingUser) {
          setEntries(allRelevantEntries);
          // Fix: Passed missing verification data and userId to getSummariesFromEntries
          setSummaries(storageService.getSummariesFromEntries(allRelevantEntries, allVerifications, viewingUser.id));
        } else {
          const filtered = allRelevantEntries.filter(e => {
            const d = parseLocalDate(e.date);
            return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
          });
          setEntries(filtered);
          // Fix: Passed missing verification data and userId to getSummariesFromEntries
          setSummaries(storageService.getSummariesFromEntries(filtered, allVerifications, userId));
        }
    } catch (err) {
        console.error("Refresh Error:", err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshData(currentUser.id, currentUser.role === 'MASTER');
    }
  }, [activeTab, viewingUser, currentUser, selectedYear, selectedMonth]);

  // Fix: async/await for storageService.getUsers()
  const handleInitialVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const uTrim = loginUsername.trim();
    const pTrim = loginPassword.trim();
    const users = await storageService.getUsers();
    
    if (uTrim.toLowerCase() === MASTER_CREDENTIALS.username.toLowerCase() && pTrim === MASTER_CREDENTIALS.accessCode) {
      const master = users.find(u => u.role === 'MASTER');
      if (master) { loginUser(master); return; }
    }
    const user = users.find(u => u.username === uTrim);
    if (!user) { setError('Identity not recognized.'); return; }
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
    sessionStorage.setItem('logged_user', JSON.stringify(user));
    setShowSplash(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setViewingUser(null);
    setActiveTab('dashboard');
    setIsVerifying(false);
    setTempUser(null);
    setShowJkkEntryCard(false);
    setEditingEntry(null);
    setIsAddingEmployee(false);
    setEditingUser(null);
    sessionStorage.removeItem('logged_user');
  };

  // Fix: async/await for storageService calls
  const handleAddEntry = async (entry: WorkEntry) => {
    if (currentUser?.role === 'EMPLOYEE' && await storageService.isMonthVerified(currentUser.id, entry.date)) {
      alert("CRITICAL: LOCKED LEDGER.");
      return;
    }
    if (editingEntry) {
      await storageService.deleteEntry(editingEntry.id);
    }
    await storageService.addEntry(entry);
    setShowJkkEntryCard(false);
    setEditingEntry(null);
    await refreshData(currentUser!.id, currentUser!.role === 'MASTER');
  };

  const handleEditEntry = (entry: WorkEntry) => {
    setEditingEntry(entry);
    if (currentUser?.role === 'MASTER') {
      setShowJkkEntryCard(true);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fix: async/await for setVerification
  const handleVerifyChange = async (monthYear: string, isVerified: boolean) => {
    if (currentUser?.role === 'MASTER' && viewingUser) {
      await storageService.setVerification(viewingUser.id, monthYear, isVerified);
      await refreshData(currentUser.id, true);
    }
  };

  // Fix: async/await for addUser
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    await storageService.addUser(newEmp as any);
    setIsAddingEmployee(false);
    setNewEmp({ fullName: '', username: '', dob: '1995-01-01', email: '', tel: '', address: '' });
    await refreshData(currentUser!.id, currentUser!.role === 'MASTER');
  };

  // Fix: async/await for updateUser
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      await storageService.updateUser(editingUser.id, editingUser);
      setEditingUser(null);
      await refreshData(currentUser!.id, true);
    }
  };

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setViewingUser(null);
    setIsAddingEmployee(false);
    setEditingUser(null);
    setShowJkkEntryCard(false);
    setEditingEntry(null);
  };

  const startInspecting = (user: User) => {
    setViewingUser(user);
    setActiveTab('dashboard');
    setIsAddingEmployee(false);
    setEditingUser(null);
    setShowJkkEntryCard(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const DobSelector = ({ value, onChange, label, isLarge = false }: { value: string, onChange: (val: string) => void, label: string, isLarge?: boolean }) => {
    const safeValue = value || '1990-01-01';
    const [y, m, d] = safeValue.split('-').map(Number);
    const update = (ny: number, nm: number, nd: number) => {
      onChange(`${ny}-${nm.toString().padStart(2, '0')}-${nd.toString().padStart(2, '0')}`);
    };
    return (
      <div className="space-y-1.5">
        <label className={`${isLarge ? 'text-xs' : 'text-[9px]'} font-black uppercase text-[#FFC4A3] tracking-[0.2em] ml-1 logo-font`}>{label}</label>
        <div className={`grid grid-cols-3 gap-1.5`}>
          <select value={d} onChange={e => update(y, m, Number(e.target.value))} className={`bg-slate-950 border-2 border-slate-800 text-white rounded-lg font-black focus:border-[#FFC4A3] outline-none ${isLarge ? 'px-2 py-2 text-base' : 'px-2 py-1.5 text-[11px]'} logo-font`}>{[...Array(31)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}</select>
          <select value={m} onChange={e => update(y, Number(e.target.value), d)} className={`bg-slate-950 border-2 border-slate-800 text-white rounded-lg font-black focus:border-[#FFC4A3] outline-none ${isLarge ? 'px-2 py-2 text-base' : 'px-2 py-1.5 text-[11px]'} logo-font`}>{monthsList.map((mn, i) => <option key={mn} value={i+1}>{mn.substring(0, 3).toUpperCase()}</option>)}</select>
          <select value={y} onChange={e => update(Number(e.target.value), m, d)} className={`bg-slate-950 border-2 border-slate-800 text-white rounded-lg font-black focus:border-[#FFC4A3] outline-none ${isLarge ? 'px-2 py-2 text-base' : 'px-2 py-1.5 text-[11px]'} logo-font`}>{[...Array(80)].map((_, i) => <option key={i} value={2025 - i}>{2025 - i}</option>)}</select>
        </div>
      </div>
    );
  };

  if (showSplash && currentUser) return <SplashSequence onComplete={() => setShowSplash(false)} />;

  if (isVerifying && tempUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-sm bg-slate-900 rounded-[2.5rem] px-8 py-28 border-4 border-slate-800 text-center shadow-2xl relative">
          <div className="mb-8 mt-[-3rem] flex justify-center items-center overflow-visible">
            <Logo size="lg" subtitle="Payroll System" />
          </div>
          <h2 className="text-xs font-bold text-[#FFC4A3] mb-8 uppercase tracking-widest logo-font">Security Setup</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            storageService.setUserPassword(tempUser.id, newPassword);
            loginUser({...tempUser, password: newPassword, isPasswordSet: true});
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-[400px] bg-slate-900 rounded-[2.5rem] px-8 py-28 md:px-10 md:py-40 border-[6px] border-slate-800 shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col items-center relative transition-all duration-300">
          <div className="mb-12 mt-[-4rem] flex justify-center items-center w-full overflow-visible">
            <Logo size="xl" subtitle="Payroll System" />
          </div>
          <form onSubmit={handleInitialVerify} className="space-y-7 w-full mt-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2 logo-font">Authorized ID</label>
              <input type="text" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} className="w-full px-6 py-5 bg-slate-950 border-[3px] border-slate-800 rounded-xl text-white outline-none font-black text-xl focus:border-[#10b981] transition-all logo-font" placeholder="Username" required />
            </div>
            {!tempUser ? (
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-2 logo-font">Access Key</label>
                <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full px-6 py-5 bg-slate-950 border-[3px] border-slate-800 rounded-xl text-white outline-none font-black text-xl focus:border-[#FFC4A3] transition-all logo-font" placeholder="••••••••" required />
              </div>
            ) : (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <DobSelector label="Verify Birth Date" value={loginDob} onChange={setLoginDob} isLarge={false} />
              </div>
            )}
            {error && <p className="text-red-500 text-[9px] font-black text-center uppercase tracking-widest bg-red-500/10 py-4 rounded-lg logo-font">{error}</p>}
            <button type="submit" className="w-full bg-white text-black py-5 rounded-xl font-black uppercase tracking-[0.1em] text-lg border-4 border-transparent hover:bg-[#10b981] hover:scale-[1.01] active:scale-95 transition-all logo-font">Initialize Session</button>
            {tempUser && <button type="button" onClick={() => setTempUser(null)} className="w-full text-[9px] font-black uppercase tracking-widest text-slate-600 mt-4 logo-font">Abort & Switch</button>}
          </form>
        </div>
      </div>
    );
  }

  // Fix: activeEmployees from state instead of Promise.filter
  const activeEmployees = allUsers.filter(u => u.role === 'EMPLOYEE' && !u.isArchived);

  return (
    <div className="min-h-screen bg-black text-white pt-16 lg:pt-0">
      <Navigation 
        user={currentUser} 
        onLogout={handleLogout} 
        activeTab={activeTab} 
        onTabChange={switchTab} 
      />
      
      <header className="bg-slate-900 border-b-2 border-slate-800 sticky top-0 z-50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo className="hidden lg:flex" size="lg" />
          {currentUser.role === 'MASTER' && (
            <div className="flex bg-black p-1 rounded-2xl border-2 border-slate-800">
              <button onClick={() => switchTab('dashboard')} className={`px-4 lg:px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all logo-font ${activeTab === 'dashboard' && !viewingUser ? 'bg-[#10b981] text-black' : 'text-slate-500 hover:text-white'}`}>Dashboard</button>
              <button onClick={() => { setShowJkkEntryCard(!showJkkEntryCard); setIsAddingEmployee(false); setEditingUser(null); }} className={`px-4 lg:px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all logo-font ${showJkkEntryCard ? 'bg-slate-500 text-black' : 'text-slate-500 hover:text-white'}`}>Manual Entry</button>
              <button onClick={() => switchTab('employees')} className={`px-4 lg:px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all logo-font ${activeTab === 'employees' ? 'bg-[#FFC4A3] text-black' : 'text-slate-500 hover:text-white'}`}>Registry</button>
            </div>
          )}
          <button onClick={handleLogout} className="px-5 py-2 bg-red-500/10 text-red-500 border-2 border-red-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all logo-font">Sign Out</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 lg:p-10 flex flex-col lg:flex-row gap-10">
        {activeTab === 'dashboard' && !viewingUser && (
          <aside className="lg:w-40 shrink-0 lg:sticky lg:top-32 h-fit space-y-6 order-2 lg:order-1">
            <div className="flex lg:flex-col gap-3 overflow-x-auto pb-3 lg:pb-0">
              {yearsList.map(year => (
                <div key={year} className="flex flex-col gap-2 min-w-[80px]">
                  <button 
                    onClick={() => setSelectedYear(year)} 
                    className={`text-xl font-black logo-font px-5 py-3 rounded-xl transition-all shadow-sm ${
                      selectedYear === year 
                        ? (year === 2026 ? 'bg-[#10b981] text-black' : 'bg-yellow-400 text-black') 
                        : 'bg-slate-900 text-slate-500 hover:text-white'
                    }`}
                  >
                    {year}
                  </button>
                  {selectedYear === year && (
                    <div className={`hidden lg:flex flex-col items-start gap-2 pl-4 border-l-2 ml-4 ${year === 2026 ? 'border-[#10b981]' : 'border-yellow-400'}`}>
                      {monthsList.map((month, idx) => (
                        <button key={month} onClick={() => setSelectedMonth(idx)} className={`text-[10px] font-black uppercase tracking-widest logo-font ${selectedMonth === idx ? (year === 2026 ? 'text-[#10b981]' : 'text-yellow-400') : 'text-slate-600 hover:text-white'}`}>{month.substring(0,3).toUpperCase()}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>
        )}

        <div className="flex-grow space-y-12 order-1 lg:order-2">
          {(showJkkEntryCard || activeTab === 'logWork') && currentUser.role === 'MASTER' && (
            <div className="animate-in slide-in-from-top-6 duration-500">
               <WagesForm user={currentUser} onAddEntry={handleAddEntry} isMaster={true} activeEmployees={activeEmployees} initialEntry={editingEntry} onCancel={() => {setEditingEntry(null); setShowJkkEntryCard(false); if(activeTab === 'logWork') switchTab('dashboard');}} />
            </div>
          )}

          {activeTab === 'dashboard' ? (
            <div className="space-y-12 animate-in fade-in duration-500">
              <div className="flex flex-col gap-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl md:text-4xl font-black logo-font text-white uppercase tracking-tight">{viewingUser ? viewingUser.fullName.toUpperCase() : (currentUser.role === 'MASTER' ? 'HQ LEDGER' : 'ACTIVITY LOG')}</h2>
                  </div>
                  {viewingUser && <button onClick={() => setViewingUser(null)} className="px-7 py-3 bg-[#FFC4A3] text-black rounded-lg text-xs font-black uppercase tracking-widest shadow-md hover:scale-105 transition-transform logo-font">End Audit</button>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
                  <div className="md:col-span-2 lg:col-span-3">
                    <SummaryDashboard entries={entries} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <DigitalClock />
                  </div>
                </div>

                {currentUser.role === 'EMPLOYEE' && !viewingUser && (
                  <div className="animate-in slide-in-from-bottom-6 duration-500 w-full flex justify-center">
                    <div className="w-full max-w-2xl bg-slate-900 p-8 rounded-[3.5rem] border-2 border-slate-800 shadow-2xl">
                        <WagesForm user={currentUser} onAddEntry={handleAddEntry} initialEntry={editingEntry} onCancel={editingEntry ? () => setEditingEntry(null) : undefined} />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-8">
                   <div className="flex items-center gap-6">
                      <div className="h-px flex-grow bg-slate-800"></div>
                      <h3 className="text-sm font-black logo-font text-white uppercase tracking-widest">AUDIT TRAIL</h3>
                      <div className="h-px flex-grow bg-slate-800"></div>
                   </div>
                   <HistoryList summaries={summaries} onDelete={async (id) => { if(confirm("Confirm deletion?")) { await storageService.deleteEntry(id); refreshData(currentUser.id, currentUser.role === 'MASTER'); } }} onEdit={handleEditEntry} onVerifyChange={handleVerifyChange} currentUser={currentUser} viewingUser={viewingUser} />
              </div>
            </div>
          ) : activeTab === 'employees' ? (
            <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-500">
              <div className="flex flex-col md:flex-row justify-between items-center border-b-2 border-slate-800 pb-6 gap-6">
                  <h2 className="text-3xl md:text-5xl font-black logo-font text-white uppercase">REGISTRY</h2>
                  <button onClick={() => { setIsAddingEmployee(!isAddingEmployee); setEditingUser(null); setShowJkkEntryCard(false); }} className={`px-8 py-4 font-black uppercase text-xs tracking-widest rounded-xl shadow-lg transition-all active:scale-95 logo-font ${isAddingEmployee ? 'bg-red-600 text-white' : 'bg-[#FFC4A3] text-black'}`}>{isAddingEmployee ? 'Cancel' : 'Register New'}</button>
              </div>

              {(isAddingEmployee || editingUser) && (
                <div className="bg-slate-900 p-8 rounded-[3rem] border-2 border-slate-800 animate-in zoom-in duration-300 shadow-xl w-full max-w-2xl mx-auto">
                  <h3 className="text-2xl font-black logo-font text-white mb-8 uppercase text-center">{isAddingEmployee ? 'ENLISTMENT' : 'MODIFY ASSET'}</h3>
                  <form onSubmit={isAddingEmployee ? handleCreateEmployee : handleUpdateProfile} className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <input type="text" value={isAddingEmployee ? newEmp.fullName : editingUser?.fullName} onChange={e => isAddingEmployee ? setNewEmp({...newEmp, fullName: e.target.value}) : setEditingUser({...editingUser!, fullName: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 p-4 rounded-xl text-white text-base outline-none font-black focus:border-[#FFC4A3] logo-font" placeholder="Full Name" required />
                       <input type="text" value={isAddingEmployee ? newEmp.username : editingUser?.username} onChange={e => isAddingEmployee ? setNewEmp({...newEmp, username: e.target.value}) : setEditingUser({...editingUser!, username: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 p-4 rounded-xl text-white text-base outline-none font-black focus:border-[#FFC4A3] logo-font" placeholder="Username" required />
                       <input type="email" value={isAddingEmployee ? newEmp.email : editingUser?.email} onChange={e => isAddingEmployee ? setNewEmp({...newEmp, email: e.target.value}) : setEditingUser({...editingUser!, email: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 p-4 rounded-xl text-white text-base outline-none font-black focus:border-[#FFC4A3] logo-font" placeholder="Email (Optional)" />
                       <input type="tel" value={isAddingEmployee ? newEmp.tel : editingUser?.tel} onChange={e => isAddingEmployee ? setNewEmp({...newEmp, tel: e.target.value}) : setEditingUser({...editingUser!, tel: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 p-4 rounded-xl text-white text-base outline-none font-black focus:border-[#FFC4A3] logo-font" placeholder="Telephone" />
                     </div>
                     <DobSelector label="Date of Birth" value={isAddingEmployee ? newEmp.dob : editingUser?.dob || '1990-01-01'} onChange={val => isAddingEmployee ? setNewEmp({...newEmp, dob: val}) : setEditingUser({...editingUser!, dob: val})} />
                     <button type="submit" className="w-full py-5 bg-[#FFC4A3] text-black font-black uppercase text-sm tracking-widest rounded-xl border border-black logo-font">{isAddingEmployee ? 'Commit Asset' : 'Save Changes'}</button>
                     <button type="button" onClick={() => {setIsAddingEmployee(false); setEditingUser(null);}} className="w-full py-3 text-[11px] font-black uppercase text-slate-500 logo-font">Discard</button>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 w-full">
                  {activeEmployees.map(u => (
                    <div key={u.id} className="bg-slate-900 p-6 rounded-[2rem] border-2 border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 group hover:bg-slate-800 shadow-xl transition-all">
                        <div className="flex items-center gap-6 w-full sm:w-auto">
                           <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center font-black text-2xl text-[#10b981] border-2 border-slate-800 group-hover:border-[#10b981] transition-all shrink-0 logo-font">{u.fullName.charAt(0).toUpperCase()}</div>
                           <div className="min-0">
                              <h4 className="font-black text-lg text-white truncate logo-font tracking-tight uppercase">{u.fullName}</h4>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate logo-font">{u.tel || u.email?.toUpperCase() || 'NO CONTACT'}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                           <button onClick={() => startInspecting(u)} className="px-5 py-2.5 bg-slate-500 text-black rounded-xl text-[10px] font-black uppercase shadow-lg hover:scale-105 transition-transform logo-font">Audit</button>
                           <button onClick={() => { setEditingUser(u); setIsAddingEmployee(false); setShowJkkEntryCard(false); }} className="px-5 py-2.5 bg-white text-black rounded-xl text-[10px] font-black uppercase shadow-lg hover:scale-105 transition-transform logo-font">Edit</button>
                           <button onClick={async () => {if(confirm(`Permanent wipe?`)) { await storageService.deleteUser(u.id); refreshData(currentUser.id, true); }}} className="px-5 py-2.5 bg-red-600/10 text-red-500 rounded-xl text-[10px] font-black uppercase border border-red-500/20 hover:bg-red-500 hover:text-white transition-all logo-font">Delete</button>
                        </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-bottom-6 duration-500 w-full flex justify-center">
              <div className="w-full max-w-2xl bg-slate-900 p-8 rounded-[3.5rem] border-2 border-slate-800 shadow-2xl">
                  <h2 className="text-2xl font-black text-white uppercase mb-8 logo-font">Log Work</h2>
                  <WagesForm user={currentUser} onAddEntry={handleAddEntry} initialEntry={editingEntry} onCancel={() => switchTab('dashboard')} isMaster={currentUser.role === 'MASTER'} activeEmployees={activeEmployees} />
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-24 opacity-20 flex flex-col items-center">
        <Logo className="grayscale scale-75 mb-6" />
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-center text-slate-400 logo-font">PRECISION ENGINE CORE &copy; 2025</p>
      </footer>
    </div>
  );
};

export default App;
