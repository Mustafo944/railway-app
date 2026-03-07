"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast, Toaster } from 'react-hot-toast';
import { 
  MapPin, Plus, History, User, CheckCircle, ArrowLeft, 
  ShieldCheck, Trash2, X, Loader2, Eye, EyeOff, Clock, Edit3, Save 
} from 'lucide-react';

const supabaseUrl = 'https://bcyrxgxcwngnlvmpklsf.supabase.co';
const supabaseAnonKey = 'sb_publishable_5RG2Pfx51e1Rifkk8LBGJg_p85XYwvH';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BEKATLAR = ["Malikobod", "Qizil tepa", "Elobod", "To’dako’l", "Azizobod", "Farovon", "Buxoro-1", "METS", "Poykent", "Murg’ak", "Yakkatut", "Blokpost", "Qorako’l", "Olot", "Xo’jadavlat", "Yangiobod", "Navbahor", "Yaxshilik", "Parvoz", "Qorli tog’", "Kiyikli", "Xizrbobo", "Jayhun", "Davtepa", "Turon", "Kogon", "Qorovul bozor", "PPS"];

const ISH_TURLARI = ["Relslarni ko'rikdan o'tkazish", "Svetofor qurilmalarini sozlash", "Akkumulyator batareyalarini tekshirish", "Aloqa liniyalarini profilaktika qilish", "Strelkali o'tkazgichlarni moylash", "Transformator podstansiyasini ko'zdan kechirish"];

export default function App() {
  const [view, setView] = useState('loading');
  const [currentWorker, setCurrentWorker] = useState(null);
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [selectedStation, setSelectedStation] = useState('');
  const [activeTasks, setActiveTasks] = useState([]);
  const [archive, setArchive] = useState([]);
  const [allTasksForBoss, setAllTasksForBoss] = useState([]);
  const [showTaskMenu, setShowTaskMenu] = useState(false);
  const [workersList, setWorkersList] = useState([]);
  const [newWorkerId, setNewWorkerId] = useState('');
  const [newWorkerPass, setNewWorkerPass] = useState('');
  const [newWorkerName, setNewWorkerName] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
const [showFaultModal, setShowFaultModal] = useState(false);
const [faultReason, setFaultReason] = useState("");
const [customFaultReason, setCustomFaultReason] = useState("");
const [activeFault, setActiveFault] = useState(null);
  const [editingWorker, setEditingWorker] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPass, setEditPass] = useState('');
const [showBigAlert, setShowBigAlert] = useState(false); // Katta oynani ko'rsatish uchun
  const loadWorkers = useCallback(async () => {
    const { data } = await supabase.from('allowed_emails').select('*').order('role', { ascending: true });
    if (data) setWorkersList(data);
  }, []);

  const loadAllTasks = useCallback(async () => {
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (data) setAllTasksForBoss(data);
  }, []);

  const loadStationData = useCallback(async (station) => {
    const { data } = await supabase.from('tasks').select('*').eq('station', station).order('created_at', { ascending: false });
    if (data) {
      setActiveTasks(data.filter(t => t.status === 'pending'));
      setArchive(data.filter(t => t.status === 'completed'));
    }
  }, []);

  // REALTIME OBUNA QISMI
// REALTIME OBUNA QISMI
useEffect(() => {

  const channel = supabase
    .channel('tasks-live')

    // YANGI TASK
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'tasks' },
      (payload) => {

        const newTask = payload.new

        setAllTasksForBoss(prev => [newTask, ...prev])

        if (newTask.station === selectedStation) {
          setActiveTasks(prev => [newTask, ...prev])
        }

        if (currentWorker?.role === 'boss') {
          toast.success("Yangi ish qo'shildi")
        }

      }
    )

    // TASK UPDATE
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'tasks' },
      (payload) => {

        const updatedTask = payload.new

        setAllTasksForBoss(prev =>
          prev.map(t => t.id === updatedTask.id ? updatedTask : t)
        )

        if (updatedTask.station === selectedStation) {

          if (updatedTask.status === "completed") {

            setActiveTasks(prev =>
              prev.filter(t => t.id !== updatedTask.id)
            )

            setArchive(prev => [updatedTask, ...prev])

          }

        }

      }
    )

    // NOSOZLIK REALTIME
.on(
  'postgres_changes',
  { event: 'INSERT', schema: 'public', table: 'faults' },
  (payload) => {
    const fault = payload.new;
    if (currentWorker?.role === "boss" || currentWorker?.role === "admin") {
      setActiveFault(fault);      // Ma'lumotni vidjet uchun saqlaydi
      setShowBigAlert(true);     // Katta qizil oynani ochadi
      toast.error("🚨 NOSOZLIK KELIB TUSHDI!");
    }
  }
)
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }

}, [selectedStation, currentWorker])

  useEffect(() => {
    const savedUser = localStorage.getItem('railway_user');
    const savedStation = localStorage.getItem('railway_station');
    
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentWorker(user);
      setIsAdmin(user.role === 'admin');
      
      if (user.role === 'admin') loadWorkers();
      if (user.role === 'boss') {
        setView('boss_dashboard');
        loadAllTasks();
      } else if (savedStation) {
        setSelectedStation(savedStation);
        setView('dashboard');
        loadStationData(savedStation);
      } else {
        setView('station');
      }
    } else {
      setView('login');
    }
  }, [loadWorkers, loadAllTasks, loadStationData]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const id = loginId.trim();
    const pass = loginPass.trim();

    try {
      const { data, error } = await supabase
        .from('allowed_emails')
        .select('*')
        .eq('worker_id', id)
        .eq('password', pass);

      if (error) throw error;

      if (data && data.length > 0) {
        const userObj = data[0];
        setCurrentWorker(userObj);
        setIsAdmin(userObj.role === 'admin');
        localStorage.setItem('railway_user', JSON.stringify(userObj));
        toast.success(`Xush kelibsiz, ${userObj.full_name}!`);
        
        if (userObj.role === 'boss') {
          setView('boss_dashboard');
          loadAllTasks();
        } else {
          setView('station');
        }
      } else {
        setAuthError("ID yoki Parol xato!");
        toast.error("Ma'lumot topilmadi!");
      }
    } catch (err) {
      toast.error("Bazaga ulanishda xatolik!");
    }
  };

  const addWorker = async () => {
    if (!newWorkerId || !newWorkerPass || !newWorkerName) return toast.error("Maydonlarni to'ldiring!");
    const { error } = await supabase.from('allowed_emails').insert([{ 
      worker_id: newWorkerId, 
      password: newWorkerPass, 
      full_name: newWorkerName,
      role: 'worker'
    }]);
    
    if (!error) {
      setNewWorkerId(''); setNewWorkerPass(''); setNewWorkerName('');
      loadWorkers();
      toast.success("Yangi ishchi qo'shildi! 👤");
    } else {
      toast.error("Xato yuz berdi.");
    }
  };

  const removeWorker = async (worker) => {
    if (worker.role === 'admin' || worker.role === 'boss') {
      toast.error("Tizim rahbarlarini o'chirib bo'lmaydi!");
      return;
    }
    const confirmDelete = window.confirm(`${worker.full_name}ni tizimdan o'chirmoqchimisiz?`);
    if (confirmDelete) {
      const { error } = await supabase.from('allowed_emails').delete().eq('id', worker.id);
      if (!error) {
        loadWorkers();
        toast.success("Ishchi tizimdan o'chirildi.");
      }
    }
  };

  const handleEditClick = (worker) => {
    setEditingWorker(worker);
    setEditName(worker.full_name);
    setEditPass(worker.password);
  };

  const saveEdit = async () => {
    const { error } = await supabase
      .from('allowed_emails')
      .update({ full_name: editName, password: editPass })
      .eq('id', editingWorker.id);

    if (!error) {
      toast.success("Ma'lumotlar yangilandi!");
      setEditingWorker(null);
      loadWorkers();
    } else {
      toast.error("Yangilashda xatolik!");
    }
  };

const handleAddTask = async (ishNomi) => {
  if (!currentWorker || !selectedStation) return;
  
  // Tugmani bir marta bosish uchun (agar loading state qo'shmoqchi bo'lsangiz)
  // setIsSubmitting(true);
  
  const newTask = { 
    worker_id: currentWorker.full_name, 
    name: ishNomi, 
    station: selectedStation, 
    start_time: new Date().toISOString(), 
    status: 'pending' 
  };
  
  const { error } = await supabase.from('tasks').insert([newTask]);
  
  if (!error) {
    // Local state'ni yangilashni realtime obunaga qoldiramiz
    setShowTaskMenu(false);
    toast.success("Yangi ish qo'shildi!");
  } else {
    toast.error("Xatolik yuz berdi!");
  }
  
  // setIsSubmitting(false);
};

  const finishTask = async (taskId) => {
  const { error } = await supabase.from('tasks').update({ 
    status: 'completed', 
    end_time: new Date().toISOString() 
  }).eq('id', taskId);
  
  if (!error) {
    // Local state'ni yangilashni realtime obunaga qoldiramiz
    toast.success("Ish muvaffaqiyatli yakunlandi! ✅");
  } else {
    toast.error("Xatolik yuz berdi!");
  }
};
const sendFault = async () => {

  if (!faultReason) return;

  if (faultReason === "Boshqa" && !customFaultReason) return;

  const confirmSend = window.confirm("Nosozlik yuborilsinmi?");

  if (!confirmSend) return;

  const { error } = await supabase
    .from("faults")
    .insert({
      station: selectedStation,
      reason: faultReason,
      custom_reason: customFaultReason
    });

  if (!error) {
    toast.success("Nosozlik yuborildi");
    setShowFaultModal(false);
    setFaultReason("");
    setCustomFaultReason("");
  }
};
  const formatFullDateTime = (isoString) => {
    if (!isoString) return "--:--";
    return new Date(isoString).toLocaleString('uz-UZ', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  if (view === 'loading') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-900" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans cursor-default select-none">
      <Toaster position="top-center" reverseOrder={false} />

      {view !== 'login' && (
        <header className="bg-blue-900 text-white p-3 sticky top-0 z-10 shadow-lg">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1 rounded-full shadow-md">
                <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain rounded-full" />
              </div>
              <div className="flex flex-col leading-none">
                <h1 className="font-black text-lg uppercase tracking-tighter flex items-center gap-2">
  Railway
  {activeFault && (
    <span className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 border border-white"></span>
    </span>
  )}
</h1>
                <span className="text-[10px] text-blue-300 font-bold uppercase tracking-widest leading-none mt-1">
                  {selectedStation || currentWorker?.full_name}
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              {isAdmin && (
                <button 
                  onClick={() => { setShowAdminPanel(true); loadWorkers(); }} 
                  className="bg-orange-500 px-4 py-1.5 rounded-lg font-black text-[10px] cursor-pointer shadow-md uppercase transition-all"
                >
                  ADMIN
                </button>
              )}
              <button 
                onClick={() => { localStorage.clear(); setView('login'); toast.success("Tizimdan chiqildi."); }} 
                className="bg-red-600 px-4 py-1.5 rounded-lg font-bold text-xs cursor-pointer shadow-md transition-all"
              >
                Chiqish
              </button>
            </div>
          </div>
        </header>
      )}

      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        {view === 'login' && (
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm border-t-[12px] border-blue-900 text-center">
              <div className="mb-6 inline-block bg-white p-2 rounded-full shadow-lg border border-slate-100">
                <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain rounded-full" />
              </div>
              <h2 className="text-3xl font-black mb-8 text-slate-800 tracking-tighter uppercase">Kirish</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <input 
                  type="text" 
                  placeholder="ID raqami" 
                  required 
                  className="w-full p-4 border-2 rounded-2xl outline-none focus:border-blue-900 bg-slate-50 font-bold cursor-text" 
                  value={loginId} 
                  onChange={(e) => setLoginId(e.target.value)}
                />
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Parol" 
                    required 
                    className="w-full p-4 border-2 rounded-2xl outline-none focus:border-blue-900 bg-slate-50 font-bold cursor-text" 
                    value={loginPass} 
                    onChange={(e) => setLoginPass(e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-900 cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {authError && <div className="text-red-600 font-black text-xs uppercase">{authError}</div>}
                <button className="w-full bg-blue-900 text-white py-5 rounded-2xl font-black text-xl shadow-xl active:scale-95 transition-all cursor-pointer uppercase tracking-widest">KIRISH</button>
              </form>
            </div>
          </div>
        )}

{view === 'boss_dashboard' && (
  <div className="space-y-6 animate-in fade-in duration-500">
    
    {/* DOIMIY QIZIL VIDJET (PANEL) */}
    {activeFault && (
      <div className="mb-6 animate-in slide-in-from-top duration-500">
        <div 
          className="bg-red-600 text-white p-4 rounded-[24px] shadow-xl flex justify-between items-center border-b-4 border-red-800"
        >
          {/* Vidjet ustiga bossa, katta oyna qayta ochiladi */}
          <div 
            className="flex items-center gap-3 cursor-pointer flex-1" 
            onClick={() => setShowBigAlert(true)} 
          >
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase opacity-70 leading-none mb-1 text-white">Faol nosozlik:</p>
              <p className="font-black text-sm uppercase text-white leading-tight">
                {activeFault.station} — {activeFault.reason === "Boshqa" ? activeFault.custom_reason : activeFault.reason}
              </p>
            </div>
          </div>
          
          {/* O'chirish tugmasi */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if(window.confirm("Nosozlik bartaraf etildimi? Panelni o'chirmoqchimisiz?")) {
                setActiveFault(null);
              }
            }}
            className="bg-red-900/50 hover:bg-red-900 p-2 rounded-xl transition-colors ml-4"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    )}

    {/* NAZORAT PANELI SARLAVHASI */}
    <div className="bg-white p-6 rounded-[32px] shadow-xl border-b-8 border-blue-900 flex flex-col md:flex-row justify-between items-center gap-4">
      <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
        <ShieldCheck className="text-blue-900"/> Nazorat Paneli
      </h2>
      <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl border border-green-200">
         <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
         <span className="text-[10px] font-black text-green-700 uppercase">Live Rejim Yoqilgan</span>
      </div>
    </div>
            <div className="grid gap-8">
              {BEKATLAR.map(station => {
                const sTasks = allTasksForBoss.filter(t => t.station === station);
                if (sTasks.length === 0) return null;
                return (
                  <div key={station} className="bg-white rounded-[32px] shadow-lg overflow-hidden border border-slate-200">
                    <div className="bg-slate-50 p-5 border-b flex justify-between items-center">
                      <h3 className="text-lg font-black text-blue-900 flex items-center gap-2 uppercase tracking-tighter">
                        <MapPin size={20}/> {station} bekati
                      </h3>
                      <span className="text-[10px] font-black bg-blue-900 text-white px-3 py-1 rounded-full uppercase tracking-widest">
                        Soni: {sTasks.length} ta
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-bold">
                        <thead className="bg-slate-100 text-slate-500 uppercase border-b">
                          <tr>
                            <th className="p-4">Ish nomi</th>
                            <th className="p-4">Bajardi</th>
                            <th className="p-4">Vaqt</th>
                            <th className="p-4 text-center">Holat</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sTasks.map(task => (
                            <tr key={task.id} className="hover:bg-blue-50/50 transition-colors text-slate-800">
                              <td className="p-4">{task.name}</td>
                              <td className="p-4 text-blue-900">{task.worker_id}</td>
                              <td className="p-4 text-slate-500 font-mono">
                                {formatFullDateTime(task.start_time)}
                              </td>
                              <td className="p-4 text-center">
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${task.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700 animate-pulse'}`}>
                                  {task.status === 'completed' ? 'Bajarildi' : 'Jarayonda'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === 'station' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in zoom-in-95 duration-500">
            {BEKATLAR.map(s => (
              <button 
                key={s} 
                onClick={() => { setSelectedStation(s); localStorage.setItem('railway_station', s); setView('dashboard'); loadStationData(s); }} 
                className="bg-white p-6 rounded-3xl shadow-md border-b-8 border-slate-200 hover:border-blue-900 hover:-translate-y-1 transition-all font-black text-xs text-slate-700 flex flex-col items-center gap-3 cursor-pointer uppercase"
              >
                <div className="bg-slate-50 p-3 rounded-2xl"><MapPin className="text-slate-400" size={24} /></div>{s}
              </button>
              
            ))}
          </div>
        )}

        {view === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center gap-4">
              <button 
                onClick={() => { setView('station'); setSelectedStation(''); localStorage.removeItem('railway_station'); }} 
                className="bg-white text-blue-900 font-black flex items-center gap-2 px-6 py-3 rounded-2xl shadow border-2 border-blue-900 hover:bg-blue-50 transition cursor-pointer text-[10px] uppercase"
              >
                <ArrowLeft size={16}/> Bekatlar
              </button>
              <div className="flex gap-2 font-black text-[10px] uppercase">
                <button
  onClick={() => setShowFaultModal(true)}
  className="bg-red-600 text-white px-6 py-3 rounded-2xl shadow-xl"
>
  NOSOZLIK
</button>
                <button onClick={() => setView('archive')} className="bg-slate-200 text-slate-700 px-6 py-3 rounded-2xl">Arxiv</button>
                <button onClick={() => setShowTaskMenu(true)} className="bg-blue-900 text-white px-6 py-3 rounded-2xl shadow-xl">+ Ish qo'shish</button>
              </div>
            </div>
            <div className="grid gap-4">
              <h3 className="font-black text-orange-600 flex items-center gap-2 text-xl uppercase tracking-widest leading-none">
                <Clock size={24}/> Navbatchilikda ({activeTasks.length})
              </h3>
              {activeTasks.map(task => (
                <div key={task.id} className="bg-white p-6 rounded-[32px] shadow-xl border-l-[12px] border-l-orange-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 animate-in slide-in-from-left duration-300">
                  <div className="space-y-2">
                    <p className="font-black text-xl text-slate-800 tracking-tight leading-tight">{task.name}</p>
                    <div className="flex flex-wrap gap-4 font-black text-[10px] uppercase tracking-tighter">
                       <span className="bg-blue-900 text-white px-3 py-1 rounded-lg flex items-center gap-1 shadow-md">
                         <User size={12}/> {task.worker_id}
                       </span>
                       <span className="bg-orange-100 text-orange-900 px-3 py-1 rounded-lg border border-orange-200 flex items-center gap-1">
                         <Clock size={12}/> {formatFullDateTime(task.start_time)}
                       </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => finishTask(task.id)} 
                    className="bg-green-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-green-700 transition active:scale-95 cursor-pointer uppercase tracking-tighter"
                  >
                    Tugatish
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'archive' && (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <button 
              onClick={() => setView('dashboard')} 
              className="bg-white text-blue-900 font-black flex items-center gap-2 px-6 py-3 rounded-2xl shadow border-2 border-blue-900 hover:bg-blue-50 transition cursor-pointer text-[10px] uppercase"
            >
              <ArrowLeft size={16}/> Ortga
            </button>
            <h2 className="text-2xl font-black flex items-center gap-2 text-slate-800 uppercase tracking-tighter leading-none">
              <History className="text-blue-900" /> Arxiv: {selectedStation}
            </h2>
            <div className="grid gap-4">
              {archive.map(item => (
                <div key={item.id} className="bg-white p-6 rounded-[32px] border-l-8 border-l-green-600 shadow-md text-slate-800">
                  <p className="font-black text-lg tracking-tight leading-tight">{item.name}</p>
                  <div className="mt-3 flex flex-wrap gap-3 text-[10px] font-black uppercase tracking-tighter opacity-70">
                    <span className="text-blue-900">Bajardi: {item.worker_id}</span>
                    <span>Boshlandi: {formatFullDateTime(item.start_time)}</span>
                    <span>Tugadi: {formatFullDateTime(item.end_time)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showAdminPanel && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="p-8 border-b-8 border-orange-200 flex justify-between items-center bg-orange-50/50">
              <h2 className="text-3xl font-black text-orange-900 uppercase tracking-tighter flex items-center gap-3">
                <ShieldCheck size={40}/> Ishchilarni boshqarish
              </h2>
              <button onClick={() => setShowAdminPanel(false)} className="bg-white p-3 rounded-full text-orange-600 hover:bg-orange-100 transition-all cursor-pointer shadow-md">
                <X size={32}/>
              </button>
            </div>
            <div className="p-8 flex-1 overflow-y-auto space-y-8 text-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input placeholder="F.I.SH" className="p-4 border-2 rounded-2xl outline-none focus:border-orange-500 font-bold bg-slate-50 text-sm" value={newWorkerName} onChange={e => setNewWorkerName(e.target.value)} />
                <input placeholder="ID raqami" className="p-4 border-2 rounded-2xl outline-none focus:border-orange-500 font-bold bg-slate-50 text-sm" value={newWorkerId} onChange={e => setNewWorkerId(e.target.value)} />
                <input placeholder="Parol" className="p-4 border-2 rounded-2xl outline-none focus:border-orange-500 font-bold bg-slate-50 text-sm" value={newWorkerPass} onChange={e => setNewWorkerPass(e.target.value)} />
                <button onClick={addWorker} className="bg-orange-600 text-white p-4 rounded-2xl font-black shadow-xl hover:bg-orange-700 transition active:scale-95 cursor-pointer uppercase tracking-widest">QO'SHISH</button>
              </div>
              <div className="bg-slate-50 rounded-3xl border-2 border-slate-100 overflow-hidden">
                <table className="w-full text-left font-bold text-sm">
                  <thead className="bg-orange-100 text-orange-900 uppercase text-xs">
                    <tr><th className="p-6">Foydalanuvchi</th><th className="p-6">ID raqami</th><th className="p-6 text-right">Amallar</th></tr>
                  </thead>
                  <tbody className="divide-y-2 divide-orange-50 font-bold text-xs uppercase">
                    {workersList.map((w) => (
                      <tr key={w.id} className={`hover:bg-white transition-colors ${w.role !== 'worker' ? 'bg-orange-50/50' : ''}`}>
                        <td className="p-6">
                          {editingWorker?.id === w.id ? (
                            <input className="p-2 border rounded w-full" value={editName} onChange={e => setEditName(e.target.value)} />
                          ) : (
                            <div className="flex items-center gap-2">
                              {w.full_name}
                              {w.role === 'admin' && <span className="bg-red-600 text-white text-[8px] px-2 py-0.5 rounded-full">ADMIN</span>}
                              {w.role === 'boss' && <span className="bg-blue-900 text-white text-[8px] px-2 py-0.5 rounded-full">BOSS</span>}
                            </div>
                          )}
                        </td>
                        <td className="p-6 font-mono text-orange-700">
                          {editingWorker?.id === w.id ? (
                             <input className="p-2 border rounded w-full" value={editPass} placeholder="Yangi parol" onChange={e => setEditPass(e.target.value)} />
                          ) : w.worker_id}
                        </td>
                        <td className="p-6 text-right flex justify-end gap-2">
                          {editingWorker?.id === w.id ? (
                            <button onClick={saveEdit} className="text-green-600 p-2 hover:bg-green-50 rounded-full cursor-pointer"><Save size={24}/></button>
                          ) : (
                            <button onClick={() => handleEditClick(w)} className="text-blue-600 p-2 hover:bg-blue-50 rounded-full cursor-pointer"><Edit3 size={24}/></button>
                          )}
                          {w.role === 'worker' ? (
                            <button onClick={() => removeWorker(w)} className="text-red-500 p-2 hover:bg-red-50 rounded-full cursor-pointer"><Trash2 size={24}/></button>
                          ) : (
                            <div className="p-2"><ShieldCheck size={24} className="text-orange-400" /></div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTaskMenu && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[50px] shadow-2xl p-10 border-t-[16px] border-blue-900 animate-in zoom-in-95 duration-200 text-slate-800">
            <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-slate-50">
              <h3 className="text-2xl font-black tracking-tighter uppercase">ISHNI TANLANG</h3>
              <button onClick={() => setShowTaskMenu(false)} className="bg-slate-100 p-3 rounded-full hover:bg-slate-200 cursor-pointer transition-colors"><X size={32}/></button>
            </div>
            <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto pr-2 font-black uppercase tracking-tighter text-xs">
              {ISH_TURLARI.map(ish => (
                <button 
                  key={ish} 
                  onClick={() => handleAddTask(ish)} 
                  className="w-full text-left p-6 rounded-[30px] bg-slate-50 hover:bg-blue-900 hover:text-white border-2 border-slate-100 transition-all flex justify-between items-center group cursor-pointer shadow-sm"
                >
                  {ish} <Plus size={24} className="group-hover:text-white transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {showFaultModal && (
<div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">

<div className="bg-white w-full max-w-md p-8 rounded-3xl space-y-4">

<h2 className="text-2xl font-black text-red-600 uppercase">
Nosozlik sababi
</h2>

<select
value={faultReason}
onChange={(e)=>setFaultReason(e.target.value)}
className="w-full border p-3 rounded-xl"
>

<option value="">Sababni tanlang</option>
<option value="Rels zanjiri">Rels zanjiri</option>
<option value="Strelkali o'tkazgich">Strelkali o'tkazgich</option>
<option value="Yolg'on bandlik">Yolg'on bandlik</option>
<option value="Yo'nalishni o'zgartirish">Yo'nalishni o'zgartirish</option>
<option value="Boshqa">Boshqa sabab</option>

</select>

{faultReason === "Boshqa" && (

<textarea
placeholder="Sababni yozing"
value={customFaultReason}
onChange={(e)=>setCustomFaultReason(e.target.value)}
className="w-full border p-3 rounded-xl"
/>

)}

<div className="flex gap-3">

<button
disabled={!faultReason || (faultReason==="Boshqa" && !customFaultReason)}
onClick={sendFault}
className="flex-1 bg-red-600 text-white py-3 rounded-xl disabled:bg-gray-400"
>
Yuborish
</button>

<button
onClick={()=>setShowFaultModal(false)}
className="flex-1 bg-gray-200 py-3 rounded-xl"
>
Bekor qilish
</button>

</div>

</div>
</div>
)}

{activeFault && (

<div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">

<div className="bg-red-600 text-white p-10 rounded-3xl text-center max-w-md">

<h2 className="text-3xl font-black mb-4">
🚨 NOSOZLIK
</h2>

<p className="text-xl">
Bekat: <b>{activeFault.station}</b>
</p>

<p className="mt-2">
Sabab:
<b>
{/* KATTA QIZIL OGOHLANTIRISH (FAQAT showBigAlert BO'LSA) */}
{showBigAlert && activeFault && (
  <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
    <div className="bg-red-600 text-white p-10 rounded-[40px] text-center max-w-md shadow-2xl animate-in zoom-in-95 border-4 border-white">
      <div className="mb-4 flex justify-center text-white">
        <ShieldCheck size={80} className="animate-bounce" />
      </div>
      <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter text-white">🚨 Nosozlik!</h2>
      
      <div className="space-y-2 bg-white/10 p-4 rounded-2xl">
        <p className="text-xl text-white">Bekat: <b className="text-yellow-300">{activeFault.station}</b></p>
        <p className="text-lg text-white">
          Sabab: <b>{activeFault.reason === "Boshqa" ? activeFault.custom_reason : activeFault.reason}</b>
        </p>
      </div>

      <button
        onClick={() => setShowBigAlert(false)} 
        className="mt-8 bg-white text-red-600 w-full py-4 rounded-2xl font-black text-xl hover:bg-slate-100 active:scale-95 transition-all shadow-lg uppercase"
      >
        Tushunarli
      </button>
    </div>
  </div>
)}
</b>
</p>

<button
onClick={()=>setActiveFault(null)}
className="mt-6 bg-white text-red-600 px-6 py-3 rounded-xl font-bold"
>
Yopish
</button>

</div>
</div>

)}
    </div>
  );
}