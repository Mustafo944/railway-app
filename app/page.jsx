"use client"
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast, Toaster } from 'react-hot-toast';
import { YILLIK_REJA } from './yillik_reja';
import { TORT_HAFTALIK_REJA } from './tort_haftalik_reja';
import Du46Journal from '../components/Du46Journal';
import Shu2Journal from '../components/Shu2Journal';
import FaultPage from '../components/FaultPage';
import BossDashboard from '../components/views/BossDashboard';
import JournalPage from '../components/JournalPage';
import DashboardView from '../components/views/DashboardView';
import ArchiveView from '../components/views/ArchiveView';
import StationView from '../components/views/StationView';
import AdminPanel from '../components/modals/AdminPanel';
import RejaPanel from '../components/modals/RejaPanel';
import TaskMenu from '../components/modals/TaskMenu';
import BigAlert from '../components/modals/BigAlert';
import FaultModal from '../components/modals/FaultModal';
import FinishTaskConfirm from '../components/modals/FinishTaskConfirm';
import FaultStats from '../components/modals/FaultStats';
import FaultArchive from '../components/modals/FaultArchive';
import BossArchive from '../components/modals/BossArchive';
import StationFaultArchive from '../components/modals/StationFaultArchive';
import ConfirmResolve from '../components/modals/ConfirmResolve';
import BossJournalModal from '../components/modals/BossJournalModal'
import { 
  MapPin, Plus, History, User, CheckCircle, ArrowLeft, 
  ShieldCheck, Trash2, X, Loader2, Eye, EyeOff, Clock, Edit3, Save,
  BarChart, AlertTriangle
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BEKATLAR = ["Malikobod", "Qizil tepa", "Elobod", "To’dako’l", "Azizobod", "Farovon", "Buxoro-1", "METS", "Poykent", "Murg’ak", "Yakkatut", "Blokpost", "Qorako’l", "Olot", "Xo’jadavlat", "Yangiobod", "Navbahor", "Yaxshilik", "Parvoz", "Qorli tog’", "Kiyikli", "Xizrbobo", "Jayhun", "Davtepa", "Turon", "Kogon", "Qorovul bozor", "PPS"];
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
  const [faultReason, setFaultReason] = useState("");
  const [customFaultReason, setCustomFaultReason] = useState("");
const [activeFaults, setActiveFaults] = useState([]);
  const [editingWorker, setEditingWorker] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPass, setEditPass] = useState('');
  const [showBigAlert, setShowBigAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskMenuStep, setTaskMenuStep] = useState('main'); // 'main' | 'bolimlar' | 'ishlar' | 'oy'
const [selectedBolim, setSelectedBolim] = useState(null);
const [selectedReja, setSelectedReja] = useState('yillik');
const [isLoadingTasks, setIsLoadingTasks] = useState(false);
const [showRejaPanel, setShowRejaPanel] = useState(false);
const [rejaStep, setRejaStep] = useState('main'); // 'main' | 'bolimlar' | 'yangi_bolim' | 'ishlar' | 'yangi_ish'
const [rejaturi, setRejaTuri] = useState('yillik');
const [rejaBolimlar, setRejaBolimlar] = useState([]);
const [rejaSelectedBolim, setRejaSelectedBolim] = useState(null);
const [rejaIshlar, setRejaIshlar] = useState([]);
const [yangibolimNomi, setYangiBolimNomi] = useState('');
const [yangiIsh, setYangiIsh] = useState({ ish: '', davriylik: '', bajaruvchi: '', jurnal: '' });
const [isRejaSubmitting, setIsRejaSubmitting] = useState(false);
const [editId, setEditId] = useState('');
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
const [confirmResolve, setConfirmResolve] = useState(null);
const [showDu46, setShowDu46] = useState(false);
const [showShu2, setShowShu2] = useState(false);
const [showDu46Archive, setShowDu46Archive] = useState(false);
const [showShu2Archive, setShowShu2Archive] = useState(false);
const [bossJournalStation, setBossJournalStation] = useState(null);
const [bossJournalType, setBossJournalType] = useState(null); // 'du46' | 'shu2'
const [newWorkerStation, setNewWorkerStation] = useState('');
const [editStation, setEditStation] = useState('');
const [newWorkerRole, setNewWorkerRole] = useState('');
const [editRole, setEditRole] = useState('');
const [menuView, setMenuView] = useState('main'); // 'main' | 'fault' | 'journal' | 'workers'
const [newWorkerPhone, setNewWorkerPhone] = useState('');
const [editPhone, setEditPhone] = useState('');
  const loadWorkers = useCallback(async () => {
    const { data } = await supabase.from('allowed_emails').select('*').order('role', { ascending: true });
    if (data) setWorkersList(data);
  }, []);

const loadAllTasks = useCallback(async () => {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .gte('start_time', today + 'T00:00:00')
    .lte('start_time', today + 'T23:59:59')
    .order('created_at', { ascending: false });
  if (data) setAllTasksForBoss(data);
}, []);

const stationCache = useRef({});

const loadStationData = useCallback(async (station) => {
  // Cache bor bo'lsa — darhol ko'rsat
  if (stationCache.current[station]) {
    setActiveTasks(stationCache.current[station].active);
    setArchive(stationCache.current[station].archive);
    setIsLoadingTasks(false);
    // Background da yangilash
    fetchStationData(station);
    return;
  }

  setIsLoadingTasks(true);
  await fetchStationData(station);
}, []);

const fetchStationData = async (station) => {
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: activaData }, { data: archiveData }] = await Promise.all([
    supabase.from('tasks').select('*')
      .eq('station', station).eq('status', 'pending')
      .gte('start_time', today + 'T00:00:00')
      .lte('start_time', today + 'T23:59:59')
      .order('created_at', { ascending: false }),
    supabase.from('tasks').select('*')
      .eq('station', station).eq('status', 'completed')
      .order('end_time', { ascending: false })
      .limit(30)
  ]);

  const active = activaData || [];
  const archive = archiveData || [];

  stationCache.current[station] = { active, archive };
  setActiveTasks(active);
  setArchive(archive);
  setIsLoadingTasks(false);
};
  const loadFaultStats = async () => {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("faults")
    .select("*")
    .gte("created_at", today + "T00:00:00")
    .lte("created_at", today + "T23:59:59")
    .order("created_at", { ascending: false });
  if (data) setFaultHistory(data);
};
  const loadFaultArchive = async () => {
  const { data } = await supabase
    .from('faults')
    .select('*')
    .eq('status', 'resolved')
    .order('created_at', { ascending: false });
  
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
  // Avval modalni och — tez ko'rinadi
  setShowBossArchive(station);
  setBossArchive({});
  setBossArchiveDates([]);
  setSelectedArchiveDate(null);

  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('station', station)
    .eq('status', 'completed')
    .order('end_time', { ascending: false })
    .limit(100);
  
  if (data) {
    const grouped = {};
    data.forEach(task => {
      const date = task.end_time?.slice(0, 10) || task.start_time?.slice(0, 10);
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(task);
    });
    setBossArchive(grouped);
    setBossArchiveDates(Object.keys(grouped).sort((a, b) => b.localeCompare(a)));
  }
};
const loadStationFaultArchive = async () => {
  const { data } = await supabase
    .from('faults')
    .select('*')
    .eq('station', selectedStation)
    .order('created_at', { ascending: false });
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
  const { data } = await supabase
    .from('reja_bolimlar')
    .select('*')
    .eq('reja_turi', turi)
    .order('created_at', { ascending: true });
  if (data) setRejaBolimlar(data);
};

const loadRejaIshlar = async (bolimId) => {
  const { data } = await supabase
    .from('reja_ishlar')
    .select('*')
    .eq('bolim_id', bolimId)
    .order('created_at', { ascending: true });
  if (data) setRejaIshlar(data);
};

const addRejaBolim = async () => {
  if (!yangibolimNomi.trim()) return toast.error("Bo'lim nomini kiriting!");
  setIsRejaSubmitting(true);
  const { error } = await supabase.from('reja_bolimlar').insert([{
    reja_turi: rejaturi,
    bolim: yangibolimNomi.trim()
  }]);
  if (!error) {
    toast.success("Bo'lim qo'shildi!");
    setYangiBolimNomi('');
    loadRejaBolimlar(rejaturi);
    setRejaStep('bolimlar');
  } else {
    toast.error("Xatolik yuz berdi!");
  }
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
  } else {
    toast.error("Xatolik yuz berdi!");
  }
  setIsRejaSubmitting(false);
};

const deleteRejaIsh = async (ishId) => {
  if (!window.confirm("Bu ishni o'chirmoqchimisiz?")) return;
  const { error } = await supabase.from('reja_ishlar').delete().eq('id', ishId);
  if (!error) {
    toast.success("Ish o'chirildi!");
    loadRejaIshlar(rejaSelectedBolim.id);
  }
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
      if (!map[task.station]) {
        map[task.station] = [];
      }
      map[task.station].push(task);
    });
    return map;
  }, [allTasksForBoss]);
const playAlertSound = () => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const beep = (freq, start, duration) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = 'square';
    gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
    osc.start(ctx.currentTime + start);
    osc.stop(ctx.currentTime + start + duration);
  };
  beep(880, 0, 0.3);
  beep(660, 0.35, 0.3);
  beep(880, 0.7, 0.3);
  beep(660, 1.05, 0.5);
};

  // Taymer funksiyasi
const getFaultTimer = (start) => {
  if (!start) return "0 s";
  const diff = Date.now() - new Date(start).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 0) return `${h} soat ${m} min ${s} s`;
  if (m > 0) return `${m} min ${s} s`;
  return `${s} s`;
};
  // REALTIME OBUNA QISMI
useEffect(() => {
  const channelName = `tasks-live-${Date.now()}`;
  const channel = supabase
    .channel(channelName)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tasks' },
      (payload) => {
        const newTask = payload.new;
        setAllTasksForBoss(prev => {
          if (prev.some(t => t.id === newTask.id)) return prev;
          return [newTask, ...prev];
        });
        setSelectedStation(curr => {
          if (newTask.station === curr) {
            setActiveTasks(prev => {
              if (prev.some(t => t.id === newTask.id)) return prev;
              return [newTask, ...prev];
            });
          }
          return curr;
        });
        setCurrentWorker(curr => {
          if (curr?.role === 'boss') toast.success("Yangi ish qo'shildi");
          return curr;
        });
      }
    )
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks' },
      (payload) => {
        const updatedTask = payload.new;
        setAllTasksForBoss(prev =>
          prev.map(t => t.id === updatedTask.id ? updatedTask : t)
        );
        setSelectedStation(curr => {
          if (updatedTask.station === curr && updatedTask.status === "completed") {
            setActiveTasks(prev => prev.filter(t => t.id !== updatedTask.id));
            setArchive(prev => [updatedTask, ...prev]);
          }
          return curr;
        });
      }
    )
.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'faults' },
  (payload) => {
    const fault = payload.new;
    setActiveFaults(prev => {
      if (prev.some(f => f.id === fault.id)) return prev;
      return [...prev, fault];
    });
    setCurrentWorker(curr => {
if (curr?.role === "boss" || curr?.role === "admin") {
  const seenFaults = JSON.parse(localStorage.getItem('seen_faults') || '[]');
  if (!seenFaults.includes(fault.id)) {
    setShowBigAlert(true);
  }
        setTimeout(() => toast.error("🚨 NOSOZLIK KELIB TUSHDI!", { id: `fault-${fault.id}` }), 0);
        setTimeout(() => playAlertSound(), 0);
      } else if (curr?.role === "worker") {
        setSelectedStation(s => {
          if (fault.station === s) {
            setTimeout(() => toast.error(`🚨 Nosozlik: ${fault.reason === "Boshqa" ? fault.custom_reason : fault.reason}`, { id: `fault-${fault.id}` }), 0);
          }
          return s;
        });
      }
      return curr;
    });
  }
)
.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'faults' },
  (payload) => {
    const fault = payload.new;
    if (fault.status === "resolved") {
      setActiveFaults(prev => {
        const updated = prev.filter(f => f.id !== fault.id);
        if (updated.length === 0) setShowBigAlert(false);
        return updated;
      });
    }
  }
)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []); // Bo'sh array — faqat 1 marta ochiladi!
useEffect(() => {
  const savedUser = localStorage.getItem('railway_user');
  const savedStation = localStorage.getItem('railway_station');
  
  if (savedUser) {
    const localUser = JSON.parse(savedUser);
    
    supabase
      .from('allowed_emails')
      .select('*')
      .eq('worker_id', localUser.worker_id)
      .single()
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
supabase
  .from('faults')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .then(({ data: faultData }) => {
    if (faultData) {
      setActiveFaults(faultData);
      if (faultData.length > 0) {
        const seenFaults = JSON.parse(localStorage.getItem('seen_faults') || '[]');
        const hasNew = faultData.some(f => !seenFaults.includes(f.id));
        if (hasNew) {
          setTimeout(() => setShowBigAlert(true), 0);
        }
      }
    }
  });
        if (data.role === 'boss' || data.role === 'admin') {
  setView('boss_dashboard');
const today = new Date().toISOString().slice(0, 10);
supabase.from('tasks').select('*')
  .gte('start_time', today + 'T00:00:00')
  .lte('start_time', today + 'T23:59:59')
  .order('created_at', { ascending: false })
  .then(({ data }) => { if (data) setAllTasksForBoss(data); });


} else {
  if (data.station) {
    setView('menu');
  } else if (savedStation) {
    setSelectedStation(savedStation);
    setView('dashboard');
    loadStationData(savedStation);
  } else {
    setView('station');
  }
}
      });
  } else {
    setView('login');
  }
}, []);

  const hashPassword = async (password) => {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const handleLogin = async (e) => {
  e.preventDefault();
  setAuthError("");
  const id = loginId.trim();
  const hashedPass = await hashPassword(loginPass.trim());

  try {
    const { data, error } = await supabase
      .from('allowed_emails')
      .select('*')
      .eq('worker_id', id)
      .eq('password', hashedPass);

    if (error) throw error;

    if (data && data.length > 0) {
      const userObj = data[0];
      setCurrentWorker(userObj);
      setIsAdmin(userObj.role === 'admin');
      localStorage.setItem('railway_user', JSON.stringify(userObj));
      toast.success(`Xush kelibsiz, ${userObj.full_name}!`);
      
if (userObj.role === 'boss' || userObj.role === 'admin') {
  setView('boss_dashboard');
  loadAllTasks();
} else {
  setView('menu');
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
if (!newWorkerId || !newWorkerPass || !newWorkerName) {
  return toast.error("Maydonlarni to'ldiring!");
}
if (!newWorkerRole) {
  return toast.error("Lavozim tanlang!");
}
  if (workersList.some(w => w.worker_id === newWorkerId)) {
    toast.error("Bu ID allaqachon mavjud!");
    return;
  }
  const hashedPass = await hashPassword(newWorkerPass);
  const { error } = await supabase.from('allowed_emails').insert([{ 
  worker_id: newWorkerId, 
  password: hashedPass, 
  full_name: newWorkerName,
  role: newWorkerRole || 'elektromontyor',
station: Array.isArray(newWorkerStation) ? newWorkerStation.join(',') : newWorkerStation || null,
phone: newWorkerPhone || null
}]);
// Reset:
setNewWorkerRole('');
  if (!error) {
setNewWorkerId(''); setNewWorkerPass(''); setNewWorkerName(''); setNewWorkerPhone('');
    loadWorkers();setNewWorkerStation('');
    toast.success("Yangi ishchi qo'shildi! 👤");
  } else {
    console.error("Supabase xato:", error);
    toast.error("Xato yuz berdi: " + error.message);
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
  setEditPass('');
  setEditId(worker.worker_id);
  setEditPhone(worker.phone || '');
  setEditStation(worker.station || '');
  setEditRole(worker.role);
};
const saveEdit = async () => {
  const hashedPass = editPass ? await hashPassword(editPass) : editingWorker.password;
const { error } = await supabase
  .from('allowed_emails')
.update({ 
    full_name: editName, 
    password: hashedPass,
    worker_id: editId,
    station: Array.isArray(editStation) ? editStation.join(',') : editStation || null,
    role: editRole || editingWorker.role,
    phone: editPhone || null
  })
  .eq('id', editingWorker.id);

  if (!error) {
    toast.success("Ma'lumotlar yangilandi!");
    setEditingWorker(null);
    loadWorkers();
  } else {
    toast.error("Yangilashda xatolik!");
  }
};

const handleAddTask = async (ishObj) => {
  if (!currentWorker || !selectedStation) return;
  if (isSubmitting) return;
  setIsSubmitting(true);

  const newTask = {
    worker_id: currentWorker.full_name,
    name: ishObj.ish,
    station: selectedStation,
    start_time: new Date().toISOString(),
    status: 'pending',
    bolim: selectedBolim?.bolim || '',
    davriylik: ishObj.davriylik || '',
    bajaruvchi: ishObj.bajaruvchi || '',
    jurnal: ishObj.jurnal || '',
  };

  const { error } = await supabase.from('tasks').insert([newTask]);

  if (error) {
    toast.error("Xatolik yuz berdi!");
  } else {
    setShowTaskMenu(false);
    setTaskMenuStep('main');
    setSelectedBolim(null);
    toast.success("Yangi ish qo'shildi!");
  }
  setIsSubmitting(false);
};
const finishTask = async (taskId) => {
  const { error } = await supabase.from('tasks').update({ 
    status: 'completed', 
    end_time: new Date().toISOString() 
  })
  .eq('id', taskId)
  .eq('station', selectedStation);
    
  if (error) {
    toast.error("Ishni yakunlashda xato!");
    return;
  }
  toast.success("Ish muvaffaqiyatli yakunlandi!");
  setConfirmFinishTask(null);
  setPhotoConfirmed(false);
};

const sendFault = async () => {
  if (isSubmitting) return;
  setIsSubmitting(true);
const { error } = await supabase
  .from("faults")
  .insert({
    station: selectedStation,
    reason: faultReason,
    custom_reason: customFaultReason,
    status: "active",
    worker_name: currentWorker?.full_name
  });
  if (error) {
    toast.error("Nosozlik yuborishda xato!");
    setIsSubmitting(false);
    return;
  }

  toast.success("Nosozlik yuborildi");
  setShowFaultModal(false);
  setConfirmFaultSend(false);
  setFaultReason("");
  setCustomFaultReason("");
  setIsSubmitting(false);
};
  const resolveFault = async () => {
  if (!activeFaults.length) return;
  const { error } = await supabase
    .from("faults")
    .update({ status: "resolved", resolved_at: new Date() })
    .eq("id", activeFaults[0].id);
    if (error) {
      toast.error("Xatolik yuz berdi!");
    } else {
      toast.success("Nosozlik bartaraf etildi");
    }
  };

  const formatFullDateTime = (isoString) => {
    if (!isoString) return "--:--";
    const date = new Date(isoString);
    return date.toLocaleString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
const groupedArchive = useMemo(() => {
  const grouped = {};
  archive.forEach(item => {
    const sana = item.end_time?.slice(0, 10) || item.start_time?.slice(0, 10) || "Noma'lum";
    if (!grouped[sana]) grouped[sana] = [];
    grouped[sana].push(item);
  });
  return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
}, [archive]);
  if (view === 'loading') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-900" size={48} />
      </div>
    );
  }

  return (
<div className="min-h-screen bg-slate-100 text-slate-900 font-sans select-none">
      <Toaster position="top-center" reverseOrder={false} />

      {view !== 'login' && (
        <header className="bg-blue-900 text-white p-3 sticky top-0 z-10 shadow-lg">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
<img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
              <div className="flex flex-col leading-none">
                <span className="text-[10px] text-yellow-300 font-black uppercase tracking-widest leading-none">
  SHCH BUXORO
</span>
                <span className="text-[10px] text-blue-300 font-bold uppercase tracking-widest leading-none mt-1">
                  {selectedStation || currentWorker?.full_name}
                </span>
              </div>
            </div>
 <div className="flex gap-2 justify-evenly">
  {isAdmin && (
    <button 
      onClick={() => { setShowAdminPanel(true); loadWorkers(); }} 
     className="bg-orange-500 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-black text-[10px] sm:text-xs cursor-pointer shadow-md uppercase transition-all"
    >
      ADMIN
    </button>
  )}
  {isAdmin && (
    <button 
      onClick={() => { setShowRejaPanel(true); setRejaStep('main'); }}
      className="bg-purple-600 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-black text-[10px] sm:text-xs cursor-pointer shadow-md uppercase transition-all text-white"
    >
      REJA
    </button>
  )}
  {activeFaults.length > 0 && (
  <span className="relative flex h-3 w-3 self-center">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 border border-white"></span>
  </span>
)}
<button 
  onClick={() => { 
    localStorage.removeItem('railway_user');
    localStorage.removeItem('railway_station');
    setView('login'); 
    toast.success("Tizimdan chiqildi."); 
  }}
  className="bg-red-600 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-bold text-[10px] sm:text-xs cursor-pointer shadow-md transition-all"
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
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm border-t-12px border-blue-900 text-center">
<img src="/logo.png" alt="Logo" className="w-48 h-48 object-contain mb-2 mx-auto" />
<p className="text-2xl font-black text-blue-900 uppercase tracking-widest mb-6">SHCH BUXORO</p>
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
<BossDashboard
  activeFaults={activeFaults}
  allTasksForBoss={allTasksForBoss}
  tasksByStation={tasksByStation}
  BEKATLAR={BEKATLAR}
  workersList={workersList}
    getFaultTimer={getFaultTimer}
    formatFullDateTime={formatFullDateTime}
    loadFaultStats={loadFaultStats}
    loadFaultArchive={loadFaultArchive}
    loadBossArchive={loadBossArchive}
    setBossJournalStation={setBossJournalStation}
    setShowFaultStats={setShowFaultStats}
    setShowBigAlert={setShowBigAlert}
  />
)}
{view === 'menu' && menuView === 'main' && (
  <div className="pt-6 pb-24 animate-in fade-in duration-500">

    {currentWorker?.station?.includes(',') ? (
      // KO'P BEKAT
      <div className="flex gap-4 justify-center flex-wrap">
        {currentWorker.station.split(',').map(s => (
          <div key={s} className="bg-white rounded-3xl shadow-xl border-2 border-slate-100 overflow-hidden w-72">
            <div className="bg-blue-900 text-white px-4 py-4 text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-300 mb-1">Bekat</p>
              <h2 className="text-sm font-black uppercase tracking-tighter flex items-center gap-1 justify-center">
                <MapPin size={14}/> {s}
              </h2>
              <p className="text-[10px] text-blue-200 mt-1 font-bold">{currentWorker?.full_name}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 p-3">
              <button onClick={() => { setSelectedStation(s); loadStationData(s); setView('dashboard'); }}
                className="bg-slate-50 border-2 border-blue-100 hover:bg-blue-900 hover:text-white p-3 rounded-2xl flex flex-col items-center gap-2 cursor-pointer group transition-all">
                <span className="text-xl">📋</span>
                <p className="font-black text-[9px] uppercase text-center">Ish grafigi</p>
              </button>
              <button onClick={() => { setSelectedStation(s); setMenuView('fault'); }}
                className="bg-slate-50 border-2 border-red-100 hover:bg-red-600 hover:text-white p-3 rounded-2xl flex flex-col items-center gap-2 cursor-pointer group transition-all">
                <span className="text-xl">🚨</span>
                <p className="font-black text-[9px] uppercase text-center">Nosozlik</p>
              </button>
              <button onClick={() => { setSelectedStation(s); setMenuView('journal'); }}
                className="bg-slate-50 border-2 border-indigo-100 hover:bg-indigo-700 hover:text-white p-3 rounded-2xl flex flex-col items-center gap-2 cursor-pointer group transition-all">
                <span className="text-xl">📔</span>
                <p className="font-black text-[9px] uppercase text-center">Jurnallar</p>
              </button>
<button onClick={() => { setSelectedStation(s); loadWorkers(); setMenuView('workers'); }}
  className="bg-slate-50 border-2 border-purple-100 hover:bg-purple-700 hover:text-white p-3 rounded-2xl flex flex-col items-center gap-2 cursor-pointer group transition-all">
  <span className="text-xl">👥</span>
  <p className="font-black text-[9px] uppercase text-center">Ishchilar</p>
</button>
            </div>
          </div>
        ))}
      </div>

    ) : (
      // BITTA BEKAT
      <div className="max-w-sm mx-auto">
        <div className="bg-blue-900 text-white px-6 py-5 rounded-3xl shadow-2xl mb-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-1">Sizning bekat</p>
          <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2 justify-center">
            <MapPin size={22}/> {currentWorker?.station}
          </h2>
          <p className="text-sm text-blue-200 mt-1 font-bold">{currentWorker?.full_name}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => { setSelectedStation(currentWorker.station); loadStationData(currentWorker.station); setView('dashboard'); }}
            className="bg-white border-2 border-blue-100 hover:bg-blue-900 hover:text-white hover:border-blue-900 p-5 rounded-3xl shadow-md flex flex-col items-center gap-3 cursor-pointer group transition-all">
            <div className="bg-blue-100 group-hover:bg-white/20 p-3 rounded-2xl transition-all text-2xl">📋</div>
            <p className="font-black text-xs uppercase tracking-tight text-center">Ish grafigini bajarish</p>
          </button>
          <button onClick={() => setMenuView('fault')}
            className="bg-white border-2 border-red-100 hover:bg-red-600 hover:text-white hover:border-red-600 p-5 rounded-3xl shadow-md flex flex-col items-center gap-3 cursor-pointer group transition-all">
            <div className="bg-red-100 group-hover:bg-white/20 p-3 rounded-2xl transition-all text-2xl">🚨</div>
            <p className="font-black text-xs uppercase tracking-tight text-center">Nosozlik haqida xabar</p>
          </button>
          <button onClick={() => setMenuView('journal')}
            className="bg-white border-2 border-indigo-100 hover:bg-indigo-700 hover:text-white hover:border-indigo-700 p-5 rounded-3xl shadow-md flex flex-col items-center gap-3 cursor-pointer group transition-all">
            <div className="bg-indigo-100 group-hover:bg-white/20 p-3 rounded-2xl transition-all text-2xl">📔</div>
            <p className="font-black text-xs uppercase tracking-tight text-center">Jurnallar</p>
          </button>
          <button onClick={() => { loadWorkers(); setMenuView('workers'); }}
            className="bg-white border-2 border-purple-100 hover:bg-purple-700 hover:text-white hover:border-purple-700 p-5 rounded-3xl shadow-md flex flex-col items-center gap-3 cursor-pointer group transition-all">
            <div className="bg-purple-100 group-hover:bg-white/20 p-3 rounded-2xl transition-all text-2xl">👥</div>
            <p className="font-black text-xs uppercase tracking-tight text-center">Ishchilar ro'yxati</p>
          </button>
        </div>
      </div>
    )}
  </div>
)}
{/* NOSOZLIK SAHIFASI */}
{view === 'menu' && menuView === 'fault' && (
  <FaultPage
    station={selectedStation || currentWorker?.station}
    workerName={currentWorker?.full_name}
    onBack={() => setMenuView('main')}
    supabase={supabase}
    formatFullDateTime={formatFullDateTime}
  />
)}

{/* JURNAL SAHIFASI */}
{view === 'menu' && menuView === 'journal' && (
  <JournalPage
    station={currentWorker?.station}
    workerName={currentWorker?.full_name}
    onBack={() => setMenuView('main')}
    supabase={supabase}
  />
)}

{/* ISHCHILAR SAHIFASI */}
{view === 'menu' && menuView === 'workers' && (
  <div className="max-w-md mx-auto animate-in fade-in duration-300">
    <button onClick={() => setMenuView('main')} className="flex items-center gap-2 font-black text-blue-900 text-xs mb-4 cursor-pointer hover:underline">
      <ArrowLeft size={16}/> Ortga
    </button>
<h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
  👥 {selectedStation} — Ishchilar
</h2>
    <div className="space-y-3">
{workersList.filter(w => {
  if (!w.station) return false;
  const workerStations = w.station.split(',').map(s => s.trim());
  return workerStations.includes(selectedStation);
}).sort((a, b) => {
  const order = {
    'katta_elektromexanik': 1,
    'elektromexanik': 2,
    'elektromontyor': 3,
  };
  return (order[a.role] || 99) - (order[b.role] || 99);
}).map(w => (
<div key={w.id} className="bg-white p-4 rounded-2xl flex items-center gap-3 border-2 border-slate-100 shadow-sm">
  <div className="bg-purple-100 p-4 rounded-full">
    <User size={26} className="text-purple-700"/>
  </div>
  <div>
    <p className="font-black text-base">{w.full_name}</p>
    <p className="text-xs font-bold text-slate-500 mt-0.5">
  {w.role === 'admin' ? '🔴 Admin' 
  : w.role === 'boss' ? '🔵 Nazoratchi'
  : w.role === 'bosh_muhandis' ? '🟣 Bosh muhandis'
  : w.role === 'boshliq_muovini' ? '🔵 Boshliq muovini'
  : w.role === 'bekat_boshlig' ? '🟤 Bekat boshlig\'i'
  : w.role === 'katta_elektromexanik' ? '🟠 Katta elektromexanik'
  : w.role === 'elektromexanik' ? '🟢 Elektromexanik'
  : '🟢 Elektromontyor'}
</p>
<p className="text-xs font-bold text-purple-700">📍 {w.station}</p>
{w.phone && (
  <p className="text-xs font-bold text-green-700">📞 {w.phone}</p>
)}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
{view === 'station' && (
  <StationView
    currentWorker={currentWorker}
    activeFaults={activeFaults}
    BEKATLAR={BEKATLAR}
    setActiveTasks={setActiveTasks}
    setArchive={setArchive}
    setSelectedStation={setSelectedStation}
    setView={setView}
    loadStationData={loadStationData}
  />
)}

{view === 'dashboard' && (
  <DashboardView
    currentWorker={currentWorker}
    selectedStation={selectedStation}
    activeTasks={activeTasks}
    activeFaults={activeFaults}
    isLoadingTasks={isLoadingTasks}
    setView={setView}
    setMenuView={setMenuView}
    setSelectedArchiveViewDate={setSelectedArchiveViewDate}
    setShowTaskMenu={setShowTaskMenu}
    setConfirmFinishTask={setConfirmFinishTask}
    setConfirmResolve={setConfirmResolve}
    formatFullDateTime={formatFullDateTime}
    supabase={supabase}
  />
)}
{view === 'archive' && (
  <ArchiveView
    selectedStation={selectedStation}
    archive={archive}
    groupedArchive={groupedArchive}
    selectedArchiveViewDate={selectedArchiveViewDate}
    setView={setView}
    setSelectedArchiveViewDate={setSelectedArchiveViewDate}
    formatFullDateTime={formatFullDateTime}
  />
)}
      </main>
{showRejaPanel && (
  <RejaPanel
    rejaStep={rejaStep} setRejaStep={setRejaStep}
    rejaturi={rejaturi} setRejaTuri={setRejaTuri}
    rejaBolimlar={rejaBolimlar}
    rejaSelectedBolim={rejaSelectedBolim} setRejaSelectedBolim={setRejaSelectedBolim}
    rejaIshlar={rejaIshlar}
    yangibolimNomi={yangibolimNomi} setYangiBolimNomi={setYangiBolimNomi}
    yangiIsh={yangiIsh} setYangiIsh={setYangiIsh}
    isRejaSubmitting={isRejaSubmitting}
    loadRejaBolimlar={loadRejaBolimlar}
    loadRejaIshlar={loadRejaIshlar}
    addRejaBolim={addRejaBolim}
    addRejaIsh={addRejaIsh}
    deleteRejaIsh={deleteRejaIsh}
    deleteRejaBolim={deleteRejaBolim}
    onClose={() => { setShowRejaPanel(false); setRejaStep('main'); setRejaSelectedBolim(null); }}
  />
)}
{showAdminPanel && (
  <AdminPanel
    workersList={workersList}
    newWorkerName={newWorkerName} setNewWorkerName={setNewWorkerName}
    newWorkerId={newWorkerId} setNewWorkerId={setNewWorkerId}
    newWorkerPass={newWorkerPass} setNewWorkerPass={setNewWorkerPass}
newWorkerPhone={newWorkerPhone} setNewWorkerPhone={setNewWorkerPhone}
newWorkerStation={newWorkerStation} setNewWorkerStation={setNewWorkerStation}
    // ↓ SHUNGA QO'SHING:
    newWorkerRole={newWorkerRole} setNewWorkerRole={setNewWorkerRole}
    editingWorker={editingWorker} setEditingWorker={setEditingWorker}
    editName={editName} setEditName={setEditName}
    editPass={editPass} setEditPass={setEditPass}
    editId={editId} setEditId={setEditId}
editPhone={editPhone} setEditPhone={setEditPhone}
editStation={editStation} setEditStation={setEditStation}
    // ↓ SHUNGA QO'SHING:
    editRole={editRole} setEditRole={setEditRole}
    BEKATLAR={BEKATLAR}
    addWorker={addWorker}
    removeWorker={removeWorker}
    saveEdit={saveEdit}
    handleEditClick={handleEditClick}
    onClose={() => setShowAdminPanel(false)}
  />
)}
{showTaskMenu && (
  <TaskMenu
    taskMenuStep={taskMenuStep} setTaskMenuStep={setTaskMenuStep}
    selectedBolim={selectedBolim} setSelectedBolim={setSelectedBolim}
    selectedReja={selectedReja} setSelectedReja={setSelectedReja}
    rejaBolimlar={rejaBolimlar}
    rejaIshlar={rejaIshlar}
    isSubmitting={isSubmitting}
    YILLIK_REJA={YILLIK_REJA}
    TORT_HAFTALIK_REJA={TORT_HAFTALIK_REJA}
    loadRejaBolimlar={loadRejaBolimlar}
    loadRejaIshlar={loadRejaIshlar}
    handleAddTask={handleAddTask}
    onClose={() => {
      setShowTaskMenu(false);
      setTaskMenuStep('main');
      setSelectedBolim(null);
    }}
  />
)}

      {/* NOSOZLIK MODALI */}
{showFaultModal && (
  <FaultModal
    faultReason={faultReason} setFaultReason={setFaultReason}
    customFaultReason={customFaultReason} setCustomFaultReason={setCustomFaultReason}
    confirmFaultSend={confirmFaultSend} setConfirmFaultSend={setConfirmFaultSend}
    isSubmitting={isSubmitting}
    sendFault={sendFault}
    onClose={() => { setShowFaultModal(false); setFaultReason(""); setCustomFaultReason(""); setConfirmFaultSend(false); }}
  />
)}
{showDu46 && (
  <Du46Journal
    station={selectedStation}
    workerName={currentWorker?.full_name}
    mode="form"
    onClose={() => setShowDu46(false)}
  />
)}
{showDu46Archive && (
  <Du46Journal
    station={selectedStation}
    workerName={currentWorker?.full_name}
    mode="archive"
    onClose={() => setShowDu46Archive(false)}
  />
)}
{showShu2 && (
  <Shu2Journal
    station={selectedStation}
    workerName={currentWorker?.full_name}
    mode="form"
    onClose={() => setShowShu2(false)}
  />
)}
{showShu2Archive && (
  <Shu2Journal
    station={selectedStation}
    workerName={currentWorker?.full_name}
    mode="archive"
    onClose={() => setShowShu2Archive(false)}
  />
)}

<BossJournalModal
  bossJournalStation={bossJournalStation}
  setBossJournalStation={setBossJournalStation}
  bossJournalType={bossJournalType}
  setBossJournalType={setBossJournalType}
  currentWorker={currentWorker}
/>
{bossJournalStation && bossJournalType === 'du46' && (
  <Du46Journal
    station={bossJournalStation}
    workerName={currentWorker?.full_name}
    mode="archive"
    onClose={() => { setBossJournalType(null); setBossJournalStation(null); }}
  />
)}

{bossJournalStation && bossJournalType === 'shu2' && (
  <Shu2Journal
    station={bossJournalStation}
    workerName={currentWorker?.full_name}
    mode="archive"
    onClose={() => { setBossJournalType(null); setBossJournalStation(null); }}
  />
)}
<ConfirmResolve
  confirmResolve={confirmResolve}
  setConfirmResolve={setConfirmResolve}
  setActiveFaults={setActiveFaults}
  supabase={supabase}
/>
{confirmFinishTask && (
  <FinishTaskConfirm
    taskId={confirmFinishTask}
    photoConfirmed={photoConfirmed} setPhotoConfirmed={setPhotoConfirmed}
    finishTask={finishTask}
    onClose={() => { setConfirmFinishTask(null); setPhotoConfirmed(false); }}
  />
)}
      {/* KATTA QIZIL OGOHLANTIRISH */}
{showBigAlert && activeFaults.length > 0 && (
  <BigAlert 
    activeFaults={activeFaults} 
    onClose={() => {
      const seenFaults = JSON.parse(localStorage.getItem('seen_faults') || '[]');
      const newSeen = [...new Set([...seenFaults, ...activeFaults.map(f => f.id)])];
      localStorage.setItem('seen_faults', JSON.stringify(newSeen));
      setShowBigAlert(false);
    }} 
  />
)}
      {/* NOSOZLIKLAR STATISTIKA MODALI */}
{showFaultStats && (
  <FaultStats
    faultHistory={faultHistory}
    formatFullDateTime={formatFullDateTime}
    onClose={() => setShowFaultStats(false)}
  />
)}
{showFaultArchive && (
  <FaultArchive
    faultArchiveDates={faultArchiveDates}
    faultArchiveGrouped={faultArchiveGrouped}
    selectedFaultDate={selectedFaultDate} setSelectedFaultDate={setSelectedFaultDate}
    formatFullDateTime={formatFullDateTime}
    onClose={() => { setShowFaultArchive(false); setSelectedFaultDate(null); }}
  />
)}
{showBossArchive && (
  <BossArchive
    showBossArchive={showBossArchive}
    bossArchive={bossArchive}
    bossArchiveDates={bossArchiveDates}
    selectedArchiveDate={selectedArchiveDate} setSelectedArchiveDate={setSelectedArchiveDate}
    formatFullDateTime={formatFullDateTime}
    onClose={() => { setShowBossArchive(null); setSelectedArchiveDate(null); }}
  />
)}

{showStationFaultArchive && (
  <StationFaultArchive
    selectedStation={selectedStation}
    stationFaultArchiveDates={stationFaultArchiveDates}
    stationFaultArchiveGrouped={stationFaultArchiveGrouped}
    selectedStationFaultDate={selectedStationFaultDate} setSelectedStationFaultDate={setSelectedStationFaultDate}
    formatFullDateTime={formatFullDateTime}
    onClose={() => { setShowStationFaultArchive(false); setSelectedStationFaultDate(null); }}
  />
)}
    </div>
  );
}