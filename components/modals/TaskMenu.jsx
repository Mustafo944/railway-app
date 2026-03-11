"use client"
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { hashPassword, playAlertSound, getFaultTimer } from '@/lib/utils';

// Layout
import Header from '@/components/layout/Header';

// Views
import LoginView from '@/components/views/LoginView';
import BossDashboard from '@/components/views/BossDashboard';
import StationView from '@/components/views/StationView';
import DashboardView from '@/components/views/DashboardView';
import ArchiveView from '@/components/views/ArchiveView';

// Modals
import AdminPanel from '@/components/modals/AdminPanel';
import RejaPanel from '@/components/modals/RejaPanel';
import TaskMenu from '@/components/modals/TaskMenu';
import FaultModal from '@/components/modals/FaultModal';
import FaultStats from '@/components/modals/FaultStats';
import FaultArchive from '@/components/modals/FaultArchive';
import BossArchive from '@/components/modals/BossArchive';
import StationFaultArchive from '@/components/modals/StationFaultArchive';
import FinishTaskConfirm from '@/components/modals/FinishTaskConfirm';
import BigAlert from '@/components/modals/BigAlert';

const BEKATLAR = ["Malikobod", "Qizil tepa", "Elobod", "To'dako'l", "Azizobod", "Farovon", "Buxoro-1", "METS", "Poykent", "Murg'ak", "Yakkatut", "Blokpost", "Qorako'l", "Olot", "Xo'jadavlat", "Yangiobod", "Navbahor", "Yaxshilik", "Parvoz", "Qorli tog'", "Kiyikli", "Xizrbobo", "Jayhun", "Davtepa", "Turon", "Kogon", "Qorovul bozor", "PPS"];

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
  const [confirmFaultSend, setConfirmFaultSend] = useState(false);
  const [faultHistory, setFaultHistory] = useState([]);
  const [showFaultStats, setShowFaultStats] = useState(false);
  const [showFaultModal, setShowFaultModal] = useState(false);
  const [faultReason, setFaultReason] = useState('');
  const [customFaultReason, setCustomFaultReason] = useState('');
  const [activeFaults, setActiveFaults] = useState([]);
  const [editingWorker, setEditingWorker] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPass, setEditPass] = useState('');
  const [editId, setEditId] = useState('');
  const [showBigAlert, setShowBigAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskMenuStep, setTaskMenuStep] = useState('main');
  const [selectedBolim, setSelectedBolim] = useState(null);
  const [selectedReja, setSelectedReja] = useState('yillik');
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [showRejaPanel, setShowRejaPanel] = useState(false);
  const [rejaStep, setRejaStep] = useState('main');
  const [rejaturi, setRejaTuri] = useState('yillik');
  const [rejaBolimlar, setRejaBolimlar] = useState([]);
  const [rejaSelectedBolim, setRejaSelectedBolim] = useState(null);
  const [rejaIshlar, setRejaIshlar] = useState([]);
  const [yangibolimNomi, setYangiBolimNomi] = useState('');
  const [yangiIsh, setYangiIsh] = useState({ ish: '', davriylik: '', bajaruvchi: '', jurnal: '' });
  const [isRejaSubmitting, setIsRejaSubmitting] = useState(false);
  const [bossArchive, setBossArchive] = useState({});
  const [showBossArchive, setShowBossArchive] = useState(null);
  const [bossArchiveDates, setBossArchiveDates] = useState([]);
  const [selectedArchiveDate, setSelectedArchiveDate] = useState(null);
  const [showFaultArchive, setShowFaultArchive] = useState(false);
  const [faultArchiveDates, setFaultArchiveDates] = useState([]);
  const [faultArchiveGrouped, setFaultArchiveGrouped] = useState({});
  const [selectedFaultDate, setSelectedFaultDate] = useState(null);
  const [confirmFinishTask, setConfirmFinishTask] = useState(null);
  const [photoConfirmed, setPhotoConfirmed] = useState(false);
  const [showStationFaultArchive, setShowStationFaultArchive] = useState(false);
  const [stationFaultArchiveGrouped, setStationFaultArchiveGrouped] = useState({});
  const [stationFaultArchiveDates, setStationFaultArchiveDates] = useState([]);
  const [selectedStationFaultDate, setSelectedStationFaultDate] = useState(null);
  const [selectedArchiveViewDate, setSelectedArchiveViewDate] = useState(null);

  const loadWorkers = useCallback(async () => {
    const { data } = await supabase.from('allowed_emails').select('*').order('role', { ascending: true });
    if (data) setWorkersList(data);
  }, []);

  const loadAllTasks = useCallback(async () => {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase.from('tasks').select('*')
      .gte('start_time', today + 'T00:00:00')
      .lte('start_time', today + 'T23:59:59')
      .order('created_at', { ascending: false });
    if (data) setAllTasksForBoss(data);
  }, []);

  const loadStationData = useCallback(async (station) => {
    setIsLoadingTasks(true);
    const today = new Date().toISOString().slice(0, 10);
    const { data: activaData } = await supabase.from('tasks').select('*')
      .eq('station', station).eq('status', 'pending')
      .gte('start_time', today + 'T00:00:00')
      .lte('start_time', today + 'T23:59:59')
      .order('created_at', { ascending: false });
    const { data: archiveData } = await supabase.from('tasks').select('*')
      .eq('station', station).eq('status', 'completed')
      .order('end_time', { ascending: false });
    if (activaData) setActiveTasks(activaData);
    if (archiveData) setArchive(archiveData);
    setIsLoadingTasks(false);
  }, []);

  const loadFaultStats = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase.from('faults').select('*')
      .gte('created_at', today + 'T00:00:00')
      .lte('created_at', today + 'T23:59:59')
      .order('created_at', { ascending: false });
    if (data) setFaultHistory(data);
  };

  const loadFaultArchive = async () => {
    const { data } = await supabase.from('faults').select('*')
      .eq('status', 'resolved').order('created_at', { ascending: false });
    if (data) {
      const grouped = {};
      data.forEach(f => {
        const date = f.created_at?.slice(0, 10);
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(f);
      });
      setFaultArchiveGrouped(grouped);
      setFaultArchiveDates(Object.keys(grouped).sort((a, b) => b.localeCompare(a)));
      setSelectedFaultDate(null);
      setShowFaultArchive(true);
    }
  };

  const loadBossArchive = async (station) => {
    const { data } = await supabase.from('tasks').select('*')
      .eq('station', station).eq('status', 'completed')
      .order('end_time', { ascending: false });
    if (data) {
      const grouped = {};
      data.forEach(task => {
        const date = task.end_time?.slice(0, 10) || task.start_time?.slice(0, 10);
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(task);
      });
      setBossArchive(grouped);
      setBossArchiveDates(Object.keys(grouped).sort((a, b) => b.localeCompare(a)));
      setSelectedArchiveDate(null);
      setShowBossArchive(station);
    }
  };

  const loadStationFaultArchive = async () => {
    const { data } = await supabase.from('faults').select('*')
      .eq('station', selectedStation).order('created_at', { ascending: false });
    if (data) {
      const grouped = {};
      data.forEach(f => {
        const date = f.created_at?.slice(0, 10);
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(f);
      });
      setStationFaultArchiveGrouped(grouped);
      setStationFaultArchiveDates(Object.keys(grouped).sort((a, b) => b.localeCompare(a)));
      setSelectedStationFaultDate(null);
      setShowStationFaultArchive(true);
    }
  };

  const loadRejaBolimlar = async (turi) => {
    const { data } = await supabase.from('reja_bolimlar').select('*')
      .eq('reja_turi', turi).order('created_at', { ascending: true });
    if (data) setRejaBolimlar(data);
  };

  const loadRejaIshlar = async (bolimId) => {
    const { data } = await supabase.from('reja_ishlar').select('*')
      .eq('bolim_id', bolimId).order('created_at', { ascending: true });
    if (data) setRejaIshlar(data);
  };

  const addRejaBolim = async () => {
    if (!yangibolimNomi.trim()) return toast.error("Bo'lim nomini kiriting!");
    setIsRejaSubmitting(true);
    const { error } = await supabase.from('reja_bolimlar').insert([{
      reja_turi: rejaturi, bolim: yangibolimNomi.trim()
    }]);
    if (!error) {
      toast.success("Bo'lim qo'shildi!");
      setYangiBolimNomi('');
      loadRejaBolimlar(rejaturi);
      setRejaStep('bolimlar');
    } else toast.error("Xatolik yuz berdi!");
    setIsRejaSubmitting(false);
  };

  const addRejaIsh = async () => {
    if (!yangiIsh.ish.trim()) return toast.error("Ish nomini kiriting!");
    setIsRejaSubmitting(true);
    const { error } = await supabase.from('reja_ishlar').insert([{
      bolim_id: rejaSelectedBolim.id,
      ish: yangiIsh.ish.trim(),
      davriylik: yangiIsh.davriylik,
      bajaruvchi: yangiIsh.bajaruvchi,
      jurnal: yangiIsh.jurnal,
    }]);
    if (!error) {
      toast.success("Ish qo'shildi!");
      setYangiIsh({ ish: '', davriylik: '', bajaruvchi: '', jurnal: '' });
      loadRejaIshlar(rejaSelectedBolim.id);
      setRejaStep('ishlar');
    } else toast.error("Xatolik yuz berdi!");
    setIsRejaSubmitting(false);
  };

  const deleteRejaIsh = async (ishId) => {
    if (!window.confirm("Bu ishni o'chirmoqchimisiz?")) return;
    const { error } = await supabase.from('reja_ishlar').delete().eq('id', ishId);
    if (!error) { toast.success("Ish o'chirildi!"); loadRejaIshlar(rejaSelectedBolim.id); }
  };

  const deleteRejaBolim = async (bolimId) => {
    if (!window.confirm("Bu bo'limni barcha ishlari bilan o'chirmoqchimisiz?")) return;
    const { error } = await supabase.from('reja_bolimlar').delete().eq('id', bolimId);
    if (!error) {
      toast.success("Bo'lim o'chirildi!");
      loadRejaBolimlar(rejaturi);
      setRejaStep('bolimlar');
    }
  };

  const tasksByStation = useMemo(() => {
    const map = {};
    allTasksForBoss.forEach(task => {
      if (!map[task.station]) map[task.station] = [];
      map[task.station].push(task);
    });
    return map;
  }, [allTasksForBoss]);

  const groupedArchive = useMemo(() => {
    const grouped = {};
    archive.forEach(item => {
      const sana = item.end_time?.slice(0, 10) || item.start_time?.slice(0, 10) || "Noma'lum";
      if (!grouped[sana]) grouped[sana] = [];
      grouped[sana].push(item);
    });
    return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
  }, [archive]);

  // REALTIME
  useEffect(() => {
    const channel = supabase.channel(`tasks-live-${Date.now()}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tasks' }, (payload) => {
        const newTask = payload.new;
        setAllTasksForBoss(prev => prev.some(t => t.id === newTask.id) ? prev : [newTask, ...prev]);
        setSelectedStation(curr => {
          if (newTask.station === curr) {
            setActiveTasks(prev => prev.some(t => t.id === newTask.id) ? prev : [newTask, ...prev]);
          }
          return curr;
        });
        setCurrentWorker(curr => {
          if (curr?.role === 'boss') toast.success("Yangi ish qo'shildi");
          return curr;
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks' }, (payload) => {
        const updatedTask = payload.new;
        setAllTasksForBoss(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        setSelectedStation(curr => {
          if (updatedTask.station === curr && updatedTask.status === 'completed') {
            setActiveTasks(prev => prev.filter(t => t.id !== updatedTask.id));
            setArchive(prev => [updatedTask, ...prev]);
          }
          return curr;
        });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'faults' }, (payload) => {
        const fault = payload.new;
        setActiveFaults(prev => prev.some(f => f.id === fault.id) ? prev : [...prev, fault]);
        setCurrentWorker(curr => {
          if (curr?.role === 'boss' || curr?.role === 'admin') {
            setShowBigAlert(true);
            setTimeout(() => toast.error("🚨 NOSOZLIK KELIB TUSHDI!", { id: `fault-${fault.id}` }), 0);
            setTimeout(() => playAlertSound(), 0);
          } else if (curr?.role === 'worker') {
            setSelectedStation(s => {
              if (fault.station === s) {
                setTimeout(() => toast.error(`🚨 Nosozlik: ${fault.reason === 'Boshqa' ? fault.custom_reason : fault.reason}`, { id: `fault-${fault.id}` }), 0);
              }
              return s;
            });
          }
          return curr;
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'faults' }, (payload) => {
        const fault = payload.new;
        if (fault.status === 'resolved') {
          setActiveFaults(prev => {
            const updated = prev.filter(f => f.id !== fault.id);
            if (updated.length === 0) setShowBigAlert(false);
            return updated;
          });
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  // AUTH CHECK
  useEffect(() => {
    const savedUser = localStorage.getItem('railway_user');
    const savedStation = localStorage.getItem('railway_station');
    if (savedUser) {
      const localUser = JSON.parse(savedUser);
      supabase.from('allowed_emails').select('*').eq('worker_id', localUser.worker_id).single()
        .then(({ data, error }) => {
          if (error || !data) {
            localStorage.removeItem('railway_user');
            localStorage.removeItem('railway_station');
            setView('login');
            return;
          }
          setCurrentWorker(data);
          setIsAdmin(data.role === 'admin');
          localStorage.setItem('railway_user', JSON.stringify(data));
          if (data.role === 'admin') {
            supabase.from('allowed_emails').select('*').order('role', { ascending: true })
              .then(({ data }) => { if (data) setWorkersList(data); });
          }
          supabase.from('faults').select('*').eq('status', 'active').order('created_at', { ascending: false })
            .then(({ data: faultData }) => {
              if (faultData && faultData.length > 0) setActiveFaults(faultData);
            });
          if (data.role === 'boss' || data.role === 'admin') {
            setView('boss_dashboard');
            const today = new Date().toISOString().slice(0, 10);
            supabase.from('tasks').select('*')
              .gte('start_time', today + 'T00:00:00')
              .lte('start_time', today + 'T23:59:59')
              .order('created_at', { ascending: false })
              .then(({ data }) => { if (data) setAllTasksForBoss(data); });
          } else if (savedStation) {
            setSelectedStation(savedStation);
            setView('dashboard');
            setIsLoadingTasks(true);
            supabase.from('tasks').select('*').eq('station', savedStation).order('created_at', { ascending: false })
              .then(({ data }) => {
                if (data) {
                  const today = new Date().toISOString().slice(0, 10);
                  setActiveTasks(data.filter(t => t.status === 'pending' && t.start_time?.slice(0, 10) === today));
                  setArchive(data.filter(t => t.status === 'completed'));
                }
                setIsLoadingTasks(false);
              });
          } else {
            setView('station');
          }
        });
    } else {
      setView('login');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    const hashedPass = await hashPassword(loginPass.trim());
    try {
      const { data, error } = await supabase.from('allowed_emails').select('*')
        .eq('worker_id', loginId.trim()).eq('password', hashedPass);
      if (error) throw error;
      if (data && data.length > 0) {
        const userObj = data[0];
        setCurrentWorker(userObj);
        setIsAdmin(userObj.role === 'admin');
        localStorage.setItem('railway_user', JSON.stringify(userObj));
        toast.success(`Xush kelibsiz, ${userObj.full_name}!`);
        if (userObj.role === 'boss' || userObj.role === 'admin') {
          setView('boss_dashboard'); loadAllTasks();
        } else { setView('station'); }
      } else {
        setAuthError('ID yoki Parol xato!');
        toast.error("Ma'lumot topilmadi!");
      }
    } catch { toast.error('Bazaga ulanishda xatolik!'); }
  };

  const addWorker = async () => {
    if (!newWorkerId || !newWorkerPass || !newWorkerName) return toast.error("Maydonlarni to'ldiring!");
    if (workersList.some(w => w.worker_id === newWorkerId)) return toast.error('Bu ID allaqachon mavjud!');
    const hashedPass = await hashPassword(newWorkerPass);
    const { error } = await supabase.from('allowed_emails').insert([{
      worker_id: newWorkerId, password: hashedPass, full_name: newWorkerName, role: 'worker'
    }]);
    if (!error) {
      setNewWorkerId(''); setNewWorkerPass(''); setNewWorkerName('');
      loadWorkers(); toast.success("Yangi ishchi qo'shildi! 👤");
    } else toast.error('Xato yuz berdi.');
  };

  const removeWorker = async (worker) => {
    if (worker.role === 'admin' || worker.role === 'boss') return toast.error("Tizim rahbarlarini o'chirib bo'lmaydi!");
    if (window.confirm(`${worker.full_name}ni tizimdan o'chirmoqchimisiz?`)) {
      const { error } = await supabase.from('allowed_emails').delete().eq('id', worker.id);
      if (!error) { loadWorkers(); toast.success("Ishchi tizimdan o'chirildi."); }
    }
  };

  const handleEditClick = (worker) => {
    setEditingWorker(worker); setEditName(worker.full_name);
    setEditPass(''); setEditId(worker.worker_id);
  };

  const saveEdit = async () => {
    const hashedPass = editPass ? await hashPassword(editPass) : editingWorker.password;
    const { error } = await supabase.from('allowed_emails')
      .update({ full_name: editName, password: hashedPass, worker_id: editId })
      .eq('id', editingWorker.id);
    if (!error) { toast.success("Ma'lumotlar yangilandi!"); setEditingWorker(null); loadWorkers(); }
    else toast.error('Yangilashda xatolik!');
  };

  const handleAddTask = async (ishObj) => {
    if (!currentWorker || !selectedStation || isSubmitting) return;
    setIsSubmitting(true);
    const { error } = await supabase.from('tasks').insert([{
      worker_id: currentWorker.full_name, name: ishObj.ish,
      station: selectedStation, start_time: new Date().toISOString(),
      status: 'pending', bolim: selectedBolim?.bolim || '',
      davriylik: ishObj.davriylik || '', bajaruvchi: ishObj.bajaruvchi || '',
      jurnal: ishObj.jurnal || '',
    }]);
    if (error) toast.error('Xatolik yuz berdi!');
    else {
      setShowTaskMenu(false); setTaskMenuStep('main');
      setSelectedBolim(null); toast.success("Yangi ish qo'shildi!");
    }
    setIsSubmitting(false);
  };

  const finishTask = async (taskId) => {
    const { error } = await supabase.from('tasks')
      .update({ status: 'completed', end_time: new Date().toISOString() })
      .eq('id', taskId).eq('station', selectedStation);
    if (error) { toast.error('Ishni yakunlashda xato!'); return; }
    toast.success('Ish muvaffaqiyatli yakunlandi!');
    setConfirmFinishTask(null); setPhotoConfirmed(false);
  };

  const sendFault = async () => {
  if (isSubmitting) return;
  setIsSubmitting(true);
  const { error } = await supabase.from('faults').insert({
    station: selectedStation,
    reason: faultReason,
    custom_reason: customFaultReason,
    status: 'active',
    created_at: new Date(),
    worker_name: currentWorker?.full_name  // ← QO'SHING
  });
  if (error) { toast.error('Nosozlik yuborishda xato!'); setIsSubmitting(false); return; }
  toast.success('Nosozlik yuborildi');
  setShowFaultModal(false); setConfirmFaultSend(false);
  setFaultReason(''); setCustomFaultReason('');
  setIsSubmitting(false);
};

  const resolveFault = async (fault) => {
    if (!window.confirm('Nosozlik bartaraf etildi. Tasdiqlaysizmi?')) return;
    const { error } = await supabase.from('faults')
      .update({ status: 'resolved', resolved_at: new Date() }).eq('id', fault.id);
    if (!error) {
      setActiveFaults(prev => prev.filter(f => f.id !== fault.id));
      toast.success('Nosozlik bartaraf etildi!');
    } else toast.error('Xatolik yuz berdi!');
  };

  if (view === 'loading') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-900 border-t-transparent"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans select-none">
      <Toaster position="top-center" reverseOrder={false} />

      {view !== 'login' && (
        <Header
          currentWorker={currentWorker}
          selectedStation={selectedStation}
          activeFaults={activeFaults}
          isAdmin={isAdmin}
          onAdminClick={() => { setShowAdminPanel(true); loadWorkers(); }}
          onRejaClick={() => { setShowRejaPanel(true); setRejaStep('main'); }}
          onLogout={() => {
            localStorage.removeItem('railway_user');
            localStorage.removeItem('railway_station');
            setView('login');
            toast.success('Tizimdan chiqildi.');
          }}
        />
      )}

      <main className="max-w-6xl mx-auto p-4 sm:p-6">
        {view === 'login' && (
          <LoginView
            loginId={loginId} loginPass={loginPass}
            showPassword={showPassword} authError={authError}
            onLoginIdChange={e => setLoginId(e.target.value)}
            onLoginPassChange={e => setLoginPass(e.target.value)}
            onShowPasswordToggle={() => setShowPassword(!showPassword)}
            onSubmit={handleLogin}
          />
        )}
        {view === 'boss_dashboard' && (
          <BossDashboard
            allTasksForBoss={allTasksForBoss}
            activeFaults={activeFaults}
            tasksByStation={tasksByStation}
            onShowFaultStats={() => { loadFaultStats(); setShowFaultStats(true); }}
            onLoadFaultArchive={loadFaultArchive}
            onLoadBossArchive={loadBossArchive}
          />
        )}
        {view === 'station' && (
          <StationView
            activeFaults={activeFaults}
            onSelectStation={(s) => {
              setActiveTasks([]); setArchive([]);
              setSelectedStation(s);
              localStorage.setItem('railway_station', s);
              setView('dashboard');
              loadStationData(s);
            }}
          />
        )}
        {view === 'dashboard' && (
          <DashboardView
            selectedStation={selectedStation}
            activeTasks={activeTasks}
            activeFaults={activeFaults}
            currentWorker={currentWorker}
            isLoadingTasks={isLoadingTasks}
            onBack={() => { setView('station'); setSelectedStation(''); localStorage.removeItem('railway_station'); }}
            onShowFaultModal={() => setShowFaultModal(true)}
            onShowArchive={() => { setView('archive'); setSelectedArchiveViewDate(null); }}
            onShowStationFaultArchive={loadStationFaultArchive}
            onShowTaskMenu={() => setShowTaskMenu(true)}
            onSetConfirmFinishTask={setConfirmFinishTask}
            onResolveFault={resolveFault}
          />
        )}
        {view === 'archive' && (
          <ArchiveView
            archive={archive}
            selectedStation={selectedStation}
            selectedArchiveViewDate={selectedArchiveViewDate}
            groupedArchive={groupedArchive}
            onBack={() => setView('dashboard')}
            onSelectDate={setSelectedArchiveViewDate}
          />
        )}
      </main>

      {/* MODALS */}
      {showAdminPanel && (
        <AdminPanel
          workersList={workersList}
          newWorkerName={newWorkerName} newWorkerId={newWorkerId} newWorkerPass={newWorkerPass}
          editingWorker={editingWorker} editName={editName} editId={editId} editPass={editPass}
          onNewWorkerNameChange={e => setNewWorkerName(e.target.value)}
          onNewWorkerIdChange={e => setNewWorkerId(e.target.value)}
          onNewWorkerPassChange={e => setNewWorkerPass(e.target.value)}
          onAddWorker={addWorker}
          onEditClick={handleEditClick}
          onSaveEdit={saveEdit}
          onRemoveWorker={removeWorker}
          onEditNameChange={e => setEditName(e.target.value)}
          onEditIdChange={e => setEditId(e.target.value)}
          onEditPassChange={e => setEditPass(e.target.value)}
          onCancelEdit={() => setEditingWorker(null)}
          onClose={() => setShowAdminPanel(false)}
        />
      )}
      {showRejaPanel && (
        <RejaPanel
          rejaStep={rejaStep} rejaturi={rejaturi}
          rejaBolimlar={rejaBolimlar} rejaSelectedBolim={rejaSelectedBolim}
          rejaIshlar={rejaIshlar} yangibolimNomi={yangibolimNomi}
          yangiIsh={yangiIsh} isRejaSubmitting={isRejaSubmitting}
          onStepChange={setRejaStep}
          onRejaTuriChange={(turi) => { setRejaTuri(turi); loadRejaBolimlar(turi); }}
          onSelectBolim={(bolim) => { setRejaSelectedBolim(bolim); loadRejaIshlar(bolim.id); }}
          onYangiBolimNomiChange={e => setYangiBolimNomi(e.target.value)}
          onYangiIshChange={setYangiIsh}
          onAddRejaBolim={addRejaBolim}
          onAddRejaIsh={addRejaIsh}
          onDeleteRejaBolim={deleteRejaBolim}
          onDeleteRejaIsh={deleteRejaIsh}
          onClose={() => { setShowRejaPanel(false); setRejaStep('main'); setRejaSelectedBolim(null); }}
        />
      )}
      {showTaskMenu && (
        <TaskMenu
          taskMenuStep={taskMenuStep} selectedBolim={selectedBolim}
          selectedReja={selectedReja} rejaBolimlar={rejaBolimlar}
          rejaIshlar={rejaIshlar} isSubmitting={isSubmitting}
          onStepChange={setTaskMenuStep}
          onSelectBolim={setSelectedBolim}
          onSelectReja={setSelectedReja}
          onAddTask={handleAddTask}
          onLoadRejaIshlar={loadRejaIshlar}
          onClose={() => { setShowTaskMenu(false); setTaskMenuStep('main'); setSelectedBolim(null); }}
        />
      )}
      {showFaultModal && (
        <FaultModal
          faultReason={faultReason} customFaultReason={customFaultReason}
          confirmFaultSend={confirmFaultSend} isSubmitting={isSubmitting}
          onFaultReasonChange={e => setFaultReason(e.target.value)}
          onCustomReasonChange={e => setCustomFaultReason(e.target.value)}
          onConfirm={() => setConfirmFaultSend(true)}
          onSend={sendFault}
          onClose={() => { setShowFaultModal(false); setFaultReason(''); setCustomFaultReason(''); setConfirmFaultSend(false); }}
          onCancelConfirm={() => setConfirmFaultSend(false)}
        />
      )}
      {showFaultStats && (
        <FaultStats
          faultHistory={faultHistory}
          onClose={() => setShowFaultStats(false)}
        />
      )}
      {showFaultArchive && (
        <FaultArchive
          faultArchiveDates={faultArchiveDates}
          faultArchiveGrouped={faultArchiveGrouped}
          selectedFaultDate={selectedFaultDate}
          onSelectDate={setSelectedFaultDate}
          onClose={() => { setShowFaultArchive(false); setSelectedFaultDate(null); }}
        />
      )}
      {showBossArchive && (
        <BossArchive
          showBossArchive={showBossArchive}
          bossArchive={bossArchive}
          bossArchiveDates={bossArchiveDates}
          selectedArchiveDate={selectedArchiveDate}
          onSelectDate={setSelectedArchiveDate}
          onClose={() => { setShowBossArchive(null); setSelectedArchiveDate(null); }}
        />
      )}
      {showStationFaultArchive && (
        <StationFaultArchive
          selectedStation={selectedStation}
          stationFaultArchiveDates={stationFaultArchiveDates}
          stationFaultArchiveGrouped={stationFaultArchiveGrouped}
          selectedStationFaultDate={selectedStationFaultDate}
          onSelectDate={setSelectedStationFaultDate}
          onClose={() => { setShowStationFaultArchive(false); setSelectedStationFaultDate(null); }}
        />
      )}
      {confirmFinishTask && (
        <FinishTaskConfirm
          taskId={confirmFinishTask}
          photoConfirmed={photoConfirmed}
          onPhotoConfirmChange={e => setPhotoConfirmed(e.target.checked)}
          onFinish={finishTask}
          onCancel={() => { setConfirmFinishTask(null); setPhotoConfirmed(false); }}
        />
      )}
      {showBigAlert && (
        <BigAlert
          activeFaults={activeFaults}
          onClose={() => setShowBigAlert(false)}
        />
      )}
    </div>
  );
}