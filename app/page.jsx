"use client"
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast, Toaster } from 'react-hot-toast';
import { YILLIK_REJA } from './yillik_reja';
import { TORT_HAFTALIK_REJA } from './tort_haftalik_reja';
import Du46Journal from '../components/Du46Journal';
import Shu2Journal from '../components/Shu2Journal';
import FaultPage from '../components/FaultPage';
import JournalPage from '../components/JournalPage';
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
  const [faultTimer, setFaultTimer] = useState("0 min 0 s");
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
const [stationFaultArchive, setStationFaultArchive] = useState([]);
const [stationFaultArchiveGrouped, setStationFaultArchiveGrouped] = useState({});
const [stationFaultArchiveDates, setStationFaultArchiveDates] = useState([]);
const [selectedStationFaultDate, setSelectedStationFaultDate] = useState(null);
const [selectedArchiveViewDate, setSelectedArchiveViewDate] = useState(null);
const [confirmResolve, setConfirmResolve] = useState(null);
const [showDu46, setShowDu46] = useState(false);
const [showShu2, setShowShu2] = useState(false);
const [showJournalMenu, setShowJournalMenu] = useState(false);
const [showDu46Archive, setShowDu46Archive] = useState(false);
const [showShu2Archive, setShowShu2Archive] = useState(false);
const [bossJournalStation, setBossJournalStation] = useState(null);
const [bossJournalType, setBossJournalType] = useState(null); // 'du46' | 'shu2'
const [newWorkerStation, setNewWorkerStation] = useState('');
const [editStation, setEditStation] = useState('');
const [showStationWorkers, setShowStationWorkers] = useState(false);
const [menuView, setMenuView] = useState('main'); // 'main' | 'fault' | 'journal' | 'workers'
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

const loadStationData = useCallback(async (station) => {
  setIsLoadingTasks(true);
  const today = new Date().toISOString().slice(0, 10);

  // Bugungi pending tasklar
  const { data: activaData } = await supabase
    .from('tasks')
    .select('*')
    .eq('station', station)
    .eq('status', 'pending')
    .gte('start_time', today + 'T00:00:00')
    .lte('start_time', today + 'T23:59:59')
    .order('created_at', { ascending: false });

  // Completed tasklar (arxiv)
  const { data: archiveData } = await supabase
    .from('tasks')
    .select('*')
    .eq('station', station)
    .eq('status', 'completed')
    .order('end_time', { ascending: false });

  if (activaData) setActiveTasks(activaData);
  if (archiveData) setArchive(archiveData);
  setIsLoadingTasks(false);
}, []);
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
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('station', station)
    .eq('status', 'completed')
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
    if (!start) return "0 min 0 s";
    const diff = Date.now() - new Date(start).getTime();
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${m} min ${s} s`;
  };

  // Taymerni yangilash
useEffect(() => {
  if (!activeFaults.length) return;
  const interval = setInterval(() => {
    setFaultTimer(getFaultTimer(activeFaults[0].created_at));
  }, 1000);
  return () => clearInterval(interval);
}, [activeFaults]);

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
  setShowBigAlert(true);
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
  if (workersList.some(w => w.worker_id === newWorkerId)) {
    toast.error("Bu ID allaqachon mavjud!");
    return;
  }
  const hashedPass = await hashPassword(newWorkerPass);
  const { error } = await supabase.from('allowed_emails').insert([{ 
  worker_id: newWorkerId, 
  password: hashedPass, 
  full_name: newWorkerName,
  role: 'worker',
  station: newWorkerStation || null
}]);
  
  if (!error) {
    setNewWorkerId(''); setNewWorkerPass(''); setNewWorkerName('');
    loadWorkers();setNewWorkerStation('');
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
  setEditPass('');
  setEditId(worker.worker_id);
  setEditStation(worker.station || '');
};
const saveEdit = async () => {
  const hashedPass = editPass ? await hashPassword(editPass) : editingWorker.password;
const { error } = await supabase
  .from('allowed_emails')
  .update({ 
    full_name: editName, 
    password: hashedPass,
    worker_id: editId,
    station: editStation || null
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
      created_at: new Date(),
      worker_name: currentWorker?.full_name  // ← QO'SHING
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
                <h1 className="font-black text-lg uppercase tracking-tighter flex items-center gap-2">
                  Railway
{activeFaults.length > 0 && (
  <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 border border-white"></span>
                    </span>
                  )}
                </h1>
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
          <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* DOIMIY QIZIL VIDJET (PANEL) */}
{activeFaults.length > 0 && (
  <div className="mb-6 space-y-3 animate-in slide-in-from-top duration-500">
    {activeFaults.map(fault => (
      <div key={fault.id} className="bg-red-600 text-white p-4 rounded-3xl shadow-xl border-b-4 border-red-800">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase opacity-70 leading-none mb-1 text-white">Faol nosozlik:</p>
<p className="font-black text-sm uppercase text-white leading-tight">
  {fault.station} — {fault.reason === "Boshqa" ? fault.custom_reason : fault.reason}
</p>
<p className="text-xs text-yellow-200 mt-0.5">👤 {fault.worker_name || "Noma'lum"}</p>
<p className="text-xs text-yellow-200 mt-1">⏱ {getFaultTimer(fault.created_at)}</p>
            </div>
          </div>
          <button 
            onClick={() => { loadFaultStats(); setShowFaultStats(true); }}
            className="bg-red-900/50 hover:bg-red-900 p-2 rounded-xl transition-colors cursor-pointer"
          >
            <BarChart size={18} />
          </button>
        </div>
      </div>
    ))}
  </div>
)}
            {/* NAZORAT PANELI SARLAVHASI */}
            <div className="bg-white p-6 rounded-[32px] shadow-xl border-b-8 border-blue-900 flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
                <ShieldCheck className="text-blue-900"/> Nazorat Paneli
              </h2>
              <div className="flex items-center gap-2">
                {/* NOSOZLIKLAR STATISTIKA TUGMASI */}
                <button
                  onClick={() => {
                    loadFaultStats();
                    setShowFaultStats(true);
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold cursor-pointer"
                >
                  <BarChart size={18} /> Nosozliklar
                </button>
                <button
  onClick={loadFaultArchive}
  className="bg-slate-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold cursor-pointer"
>
  <History size={18} /> Arxiv
</button>
<div className="flex items-center gap-1 bg-green-50 px-2 py-2 rounded-xl border border-green-200">
  <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
  <span className="text-[10px] font-black text-green-700 uppercase hidden sm:inline">Live Rejim Yoqilgan</span>
</div>
              </div>
            </div>
{/* LIVE STATISTIKA */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* FAOL NOSOZLIKLAR */}
  <div className="bg-red-600 text-white p-6 rounded-[28px] shadow-xl flex items-center gap-4">
    <div className="bg-white/20 p-4 rounded-2xl">
      <AlertTriangle size={32} />
    </div>
    <div>
      <p className="text-[11px] font-black uppercase opacity-70">Faol nosozliklar</p>
      <p className="text-4xl font-black">
{activeFaults.length}
      </p>
    </div>
  </div>

  {/* FAOL ISHLAR */}
  <div className="bg-orange-500 text-white p-6 rounded-[28px] shadow-xl flex items-center gap-4">
    <div className="bg-white/20 p-4 rounded-2xl">
      <Clock size={32} />
    </div>
    <div>
      <p className="text-[11px] font-black uppercase opacity-70">Faol ishlar</p>
      <p className="text-4xl font-black">
        {allTasksForBoss.filter(t => t.status === 'pending').length}
      </p>
    </div>
  </div>

  {/* BUGUNGI BAJARILGAN */}
  <div className="bg-green-600 text-white p-6 rounded-[28px] shadow-xl flex items-center gap-4">
    <div className="bg-white/20 p-4 rounded-2xl">
      <CheckCircle size={32} />
    </div>
    <div>
      <p className="text-[11px] font-black uppercase opacity-70">Bugungi bajarilgan</p>
      <p className="text-4xl font-black">
        {allTasksForBoss.filter(t => 
          t.status === 'completed' && 
          t.end_time?.slice(0, 10) === new Date().toISOString().slice(0, 10)
        ).length}
      </p>
    </div>
  </div>
</div>
            <div className="grid gap-8">
{BEKATLAR.map(station => {
  const sTasks = tasksByStation[station] || [];
  const hasFault = activeFaults.some(f => f.station === station && f.status === "active");
  
  return (
    <div key={station} className={`bg-white rounded-[32px] shadow-lg overflow-hidden border ${
      hasFault ? 'border-red-500 border-2' : 'border-slate-200'
    }`}>
      
      {/* HEADER - bekati so'zi tagida */}
      <div className={`p-3 sm:p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center ${
        hasFault ? 'bg-red-50' : 'bg-slate-50'
      }`}>
        <div className="flex items-start gap-2 w-full sm:w-auto mb-2 sm:mb-0">
          <MapPin size={14} className="sm:w-4 sm:h-4 mt-0.5 text-blue-900" />
          <div className="flex flex-col">
            <h3 className="text-sm sm:text-base font-black text-blue-900 uppercase tracking-tighter">
              {station}
            </h3>
            <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              bekati
            </span>
          </div>
          
          {hasFault && (
            <span className="bg-red-600 text-white text-[7px] sm:text-[8px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 whitespace-nowrap ml-auto sm:ml-2">
              <AlertTriangle size={8} /> Nosozlik
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => loadBossArchive(station)}
            className="text-[8px] sm:text-[10px] font-black bg-slate-700 text-white px-2 sm:px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 cursor-pointer hover:bg-slate-900 whitespace-nowrap"
          >
            <History size={10} /> Arxiv
          </button>
          
          <button
            onClick={() => setBossJournalStation(station)}
            className="text-[8px] sm:text-[10px] font-black bg-purple-700 text-white px-2 sm:px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 cursor-pointer hover:bg-purple-900 whitespace-nowrap"
          >
            📔 Jurnallar
          </button>
          
          <span className="text-[8px] sm:text-[10px] font-black bg-blue-900 text-white px-2 sm:px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap">
            {sTasks.length} ta
          </span>
        </div>
      </div>

      {/* TASKS TABLE - kichraytirildi */}
      {sTasks.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px] sm:text-xs font-bold">
            <thead className="bg-slate-100 text-slate-500 uppercase border-b text-[8px] sm:text-[10px]">
              <tr>
                <th className="p-2 sm:p-3">Ish nomi</th>
                <th className="p-2 sm:p-3">Bajardi</th>
                <th className="p-2 sm:p-3">Vaqt</th>
                <th className="p-2 sm:p-3 text-center">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sTasks.map(task => (
                <tr key={task.id} className="hover:bg-blue-50/50 transition-colors text-slate-800">
                  <td className="p-2 sm:p-3 text-[9px] sm:text-xs leading-tight max-w-[200px] sm:max-w-[300px]">
                    <span className="line-clamp-2">{task.name}</span>
                  </td>
                  <td className="p-2 sm:p-3 text-blue-900 text-[9px] sm:text-xs whitespace-nowrap">{task.worker_id}</td>
                  <td className="p-2 sm:p-3 text-slate-500 font-mono text-[8px] sm:text-[10px] whitespace-nowrap">
                    {formatFullDateTime(task.start_time)}
                  </td>
                  <td className="p-2 sm:p-3 text-center">
                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[7px] sm:text-[8px] font-black uppercase whitespace-nowrap ${
                      task.status === 'completed' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700 animate-pulse'
                    }`}>
                      {task.status === 'completed' ? '✅' : '⏳'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {sTasks.length === 0 && (
        <div className="p-6 text-center text-slate-400 font-bold text-xs">
          Bu bekatda hozircha ishlar yo'q
        </div>
      )}
    </div>
  );
})}
            </div>
          </div>
        )}
{view === 'menu' && menuView === 'main' && (
  <div className="max-w-sm mx-auto pt-6 pb-24 animate-in fade-in duration-500">
    
    {/* BEKAT NOMI */}
    <div className="bg-blue-900 text-white px-6 py-5 rounded-3xl shadow-2xl mb-6 text-center">
      <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-1">Sizning bekat</p>
      <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2 justify-center">
        <MapPin size={22}/> {currentWorker?.station}
      </h2>
      <p className="text-sm text-blue-200 mt-1 font-bold">{currentWorker?.full_name}</p>
    </div>

    {/* MENYU TUGMALARI — 2x2 GRID */}
    <div className="grid grid-cols-2 gap-3">

      {/* 1. Ish grafigini bajarish */}
      <button
        onClick={() => {
          setSelectedStation(currentWorker.station);
          loadStationData(currentWorker.station);
          setView('dashboard');
        }}
        className="bg-white border-2 border-blue-100 hover:bg-blue-900 hover:text-white hover:border-blue-900 p-5 rounded-3xl shadow-md flex flex-col items-center gap-3 cursor-pointer group transition-all"
      >
        <div className="bg-blue-100 group-hover:bg-white/20 p-3 rounded-2xl transition-all text-2xl">📋</div>
        <p className="font-black text-xs uppercase tracking-tight text-center">Ish grafigini bajarish</p>
      </button>

      {/* 2. Nosozlik */}
      <button
        onClick={() => setMenuView('fault')}
        className="bg-white border-2 border-red-100 hover:bg-red-600 hover:text-white hover:border-red-600 p-5 rounded-3xl shadow-md flex flex-col items-center gap-3 cursor-pointer group transition-all"
      >
        <div className="bg-red-100 group-hover:bg-white/20 p-3 rounded-2xl transition-all text-2xl">🚨</div>
        <p className="font-black text-xs uppercase tracking-tight text-center">Nosozlik haqida xabar</p>
      </button>

      {/* 3. Jurnallar */}
      <button
        onClick={() => setMenuView('journal')}
        className="bg-white border-2 border-indigo-100 hover:bg-indigo-700 hover:text-white hover:border-indigo-700 p-5 rounded-3xl shadow-md flex flex-col items-center gap-3 cursor-pointer group transition-all"
      >
        <div className="bg-indigo-100 group-hover:bg-white/20 p-3 rounded-2xl transition-all text-2xl">📔</div>
        <p className="font-black text-xs uppercase tracking-tight text-center">Jurnallar</p>
      </button>

      {/* 4. Ishchilar */}
      <button
        onClick={() => { loadWorkers(); setMenuView('workers'); }}
        className="bg-white border-2 border-purple-100 hover:bg-purple-700 hover:text-white hover:border-purple-700 p-5 rounded-3xl shadow-md flex flex-col items-center gap-3 cursor-pointer group transition-all"
      >
        <div className="bg-purple-100 group-hover:bg-white/20 p-3 rounded-2xl transition-all text-2xl">👥</div>
        <p className="font-black text-xs uppercase tracking-tight text-center">Ishchilar ro'yxati</p>
      </button>

    </div>
  </div>
)}

{/* NOSOZLIK SAHIFASI */}
{view === 'menu' && menuView === 'fault' && (
  <FaultPage
    station={currentWorker?.station}
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
      👥 {currentWorker?.station} — Ishchilar
    </h2>
    <div className="space-y-3">
      {workersList.filter(w => w.station === currentWorker?.station).map(w => (
        <div key={w.id} className="bg-white p-4 rounded-2xl flex items-center gap-3 border-2 border-slate-100 shadow-sm">
          <div className="bg-purple-100 p-3 rounded-full">
            <User size={20} className="text-purple-700"/>
          </div>
          <div>
            <p className="font-black text-sm">{w.full_name}</p>
            <p className="text-[10px] font-bold text-slate-500 mt-0.5">
              {w.role === 'admin' ? '🔴 Admin' : w.role === 'boss' ? '🔵 Nazoratchi' : '🟢 Ishchi'}
            </p>
            <p className="text-[10px] font-bold text-purple-700">📍 {w.station}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
{view === 'station' && (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in zoom-in-95 duration-500">
    {(currentWorker?.station ? [currentWorker.station] : BEKATLAR).map(s => {
            const hasFault = activeFaults.some(f => f.station === s && f.status === "active");
              
              return (
                <button 
                  key={s} 
               onClick={() => { setActiveTasks([]); setArchive([]); setSelectedStation(s); localStorage.setItem('railway_station', s); setView('dashboard'); loadStationData(s); }}
                  className={`relative bg-white p-4 sm:p-6 rounded-3xl shadow-md border-b-8 transition-all font-black text-xs flex flex-col items-center gap-3 cursor-pointer uppercase
                    ${hasFault 
                      ? 'border-b-8 border-red-600 bg-red-50 hover:bg-red-100' 
                      : 'border-slate-200 hover:border-blue-900 hover:-translate-y-1 text-slate-700'
                    }`}
                >
                  {/* NOSOZLIK BELGISI */}
                  {hasFault && (
                    <div className="absolute -top-2 -right-2 bg-red-600 text-white p-1.5 rounded-full shadow-lg">
                      <span className="relative flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 border border-white"></span>
                      </span>
                    </div>
                  )}
                  
                  <div className={`p-3 rounded-2xl ${hasFault ? 'bg-red-100' : 'bg-slate-50'}`}>
                    <MapPin className={hasFault ? 'text-red-600' : 'text-slate-400'} size={24} />
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <span>{s}</span>
                    {hasFault && (
                      <span className="text-[8px] font-black text-red-600 uppercase mt-1 flex items-center gap-1">
                        <AlertTriangle size={10} /> Nosozlik!
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

{view === 'dashboard' && (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
<div className="flex items-center gap-2">
<button 
  onClick={() => { setMenuView('main'); setView(currentWorker?.station ? 'menu' : 'station'); }}
  className="bg-white text-blue-900 font-black flex items-center gap-2 px-6 py-3 rounded-2xl shadow border-2 border-blue-900 hover:bg-blue-50 transition cursor-pointer text-[10px] uppercase"
>
  <ArrowLeft size={16}/> Ortga
</button>

</div>
      
      {/* NOSOZLIK HOLATI - AGAR BU BEKATDA BO'LSA */}
{activeFaults.some(f => f.station === selectedStation) && (() => {
  const currentFault = activeFaults.find(f => f.station === selectedStation);
  return (
    <div className="flex items-center gap-3 w-full sm:w-auto">
    <div className="flex items-center gap-2 bg-red-100 px-4 py-2 rounded-xl border border-red-300">
  <span className="relative flex h-3 w-3">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
  </span>
  <div className="flex flex-col">
<span className="text-[10px] font-black text-red-700 uppercase">
  Bu bekatda nosozlik bor!
</span>
<span className="text-[10px] font-bold text-red-600">
  {currentFault.reason === "Boshqa" ? currentFault.custom_reason : currentFault.reason}
</span>
<span className="text-[10px] font-bold text-slate-600">
  👤 {currentFault.worker_name || "Noma'lum"}
</span>
  </div>
</div>
      {currentWorker?.role === 'worker' && (
        <button
         onClick={() => setConfirmResolve(currentFault.id)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1"
        >
          <CheckCircle size={14} /> Bartaraf etildi
        </button>
      )}
      {(currentWorker?.role === 'boss' || currentWorker?.role === 'admin') && (
        <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-xl text-xs font-bold border border-orange-300 flex items-center gap-1">
          <AlertTriangle size={14} />
          Sabab: {currentFault.reason === "Boshqa" ? currentFault.custom_reason : currentFault.reason}
        </div>
      )}
    </div>
  );
})()}
      
<div className="fixed bottom-0 left-0 right-0 sm:static flex gap-1 font-black text-[9px] uppercase p-3 bg-white/95 backdrop-blur sm:p-0 sm:bg-transparent sm:ml-auto shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:shadow-none">
<button onClick={() => { setView('archive'); setSelectedArchiveViewDate(null); }} 
  className="bg-slate-200 text-slate-700 px-3 py-3 rounded-2xl cursor-pointer flex-1 sm:flex-none text-[9px]">
  Ishlar arxivi
</button>


<button onClick={() => { setShowTaskMenu(true); }}
  className="bg-blue-900 text-white px-3 py-3 rounded-2xl shadow-xl cursor-pointer flex-1 sm:flex-none text-[9px]">
  + Ish qo'shish
</button>
      </div>
    </div>
    
<div className="grid gap-4 pb-24 sm:pb-0">
     <h3 className="font-black text-orange-600 flex items-center gap-2 text-xl uppercase tracking-widest leading-none">
  <Clock size={24}/> {new Date().toLocaleDateString('uz-UZ')} — Bugungi ishlar ({activeTasks.length})
</h3>
{isLoadingTasks ? (
  <div className="bg-white p-10 rounded-4xl text-center">
    <Loader2 className="animate-spin text-blue-900 mx-auto" size={32}/>
  </div>
) : activeTasks.length === 0 ? (
  <div className="bg-white p-10 rounded-4xl text-center text-slate-400 font-black">
    Hozircha aktiv ishlar yo'q
  </div>
) : (
        activeTasks.map((task, index) => (
  <div key={`active-${task.id}-${index}`} className="bg-white p-6 rounded-4xl shadow-xl border-l-12 border-l-orange-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 animate-in slide-in-from-left duration-300">
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
  onClick={() => setConfirmFinishTask(task.id)} 
  className="bg-green-600 text-white w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-lg hover:bg-green-700 transition active:scale-95 cursor-pointer uppercase tracking-tighter"
>
  Tugatish
</button>
          </div>
        ))
      )}
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

    <div className="flex items-center justify-between">
      {selectedArchiveViewDate && (
        <button
          onClick={() => setSelectedArchiveViewDate(null)}
          className="text-blue-900 font-black text-xs flex items-center gap-1 cursor-pointer hover:underline"
        >
          <ArrowLeft size={14}/> Sanalar
        </button>
      )}
      <h2 className="text-2xl font-black flex items-center gap-2 text-slate-800 uppercase tracking-tighter leading-none">
        <History className="text-blue-900" /> Ishlar arxivi: {selectedStation}
      </h2>
    </div>

    {archive.length === 0 ? (
      <div className="bg-white p-10 rounded-4xl text-center text-slate-400 font-black">
        Arxivda ishlar yo'q
      </div>
    ) : !selectedArchiveViewDate ? (
      // SANALAR RO'YXATI
      groupedArchive.map(([sana, ishlar]) => (
        <button
          key={sana}
          onClick={() => setSelectedArchiveViewDate(sana)}
          className="w-full text-left p-4 rounded-2xl bg-white hover:bg-blue-900 hover:text-white border-2 border-slate-100 flex justify-between items-center cursor-pointer group transition-all shadow-sm"
        >
          <span className="font-black">📅 {new Date(sana).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
          <span className="text-xs font-bold opacity-60 group-hover:opacity-100">{ishlar.length} ta ish</span>
        </button>
      ))
    ) : (
      // TANLANGAN SANADAGI ISHLAR
      <div className="space-y-3">
        {(groupedArchive.find(([sana]) => sana === selectedArchiveViewDate)?.[1] || []).map(item => (
          <div key={`archive-${item.id}-${item.station}`} className="bg-white p-6 rounded-[32px] border-l-8 border-l-green-600 shadow-md text-slate-800">
            <p className="font-black text-lg tracking-tight leading-tight">{item.name}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-[10px] font-black uppercase tracking-tighter opacity-70">
              <span className="text-blue-900">Bajardi: {item.worker_id}</span>
              <span>Boshlandi: {formatFullDateTime(item.start_time)}</span>
              <span>Tugadi: {formatFullDateTime(item.end_time)}</span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
      </main>
{showRejaPanel && (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95">
      
      {/* HEADER */}
      <div className="flex justify-between items-center p-6 border-b-4 border-purple-100 bg-purple-50">
        <div>
          {rejaStep !== 'main' && (
            <button
              onClick={() => {
                if (rejaStep === 'yangi_bolim') setRejaStep('bolimlar');
                else if (rejaStep === 'ishlar') setRejaStep('bolimlar');
                else if (rejaStep === 'yangi_ish') setRejaStep('ishlar');
                else setRejaStep('main');
              }}
              className="text-purple-700 font-black text-xs flex items-center gap-1 mb-1 cursor-pointer hover:underline"
            >
              <ArrowLeft size={14}/> Ortga
            </button>
          )}
          <h2 className="text-xl font-black text-purple-900 uppercase tracking-tighter">
            {rejaStep === 'main' && 'REJA BOSHQARUVI'}
            {rejaStep === 'bolimlar' && `${rejaturi === 'yillik' ? 'Yillik' : '4 Haftalik'} — Bo'limlar`}
            {rejaStep === 'yangi_bolim' && "Yangi bo'lim qo'shish"}
            {rejaStep === 'ishlar' && rejaSelectedBolim?.bolim}
            {rejaStep === 'yangi_ish' && "Yangi ish qo'shish"}
          </h2>
        </div>
        <button
          onClick={() => { setShowRejaPanel(false); setRejaStep('main'); setRejaSelectedBolim(null); }}
          className="bg-white p-3 rounded-full hover:bg-purple-100 cursor-pointer shadow"
        >
          <X size={24}/>
        </button>
      </div>

      {/* KONTENT */}
      <div className="overflow-y-auto p-6 space-y-3">

        {/* BOSQICH 1: MAIN */}
        {rejaStep === 'main' && (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => { setRejaTuri('yillik'); loadRejaBolimlar('yillik'); setRejaStep('bolimlar'); }}
              className="w-full text-left p-6 rounded-3xl bg-blue-900 text-white font-black flex justify-between items-center cursor-pointer shadow-lg"
            >
              <div>
                <p className="text-lg">📋 Yillik reja</p>
                <p className="text-xs opacity-70 font-normal mt-1">Bo'limlar va ishlarni boshqarish</p>
              </div>
              <Plus size={24}/>
            </button>
            <button
              onClick={() => { setRejaTuri('haftalik'); loadRejaBolimlar('haftalik'); setRejaStep('bolimlar'); }}
              className="w-full text-left p-6 rounded-3xl bg-green-700 text-white font-black flex justify-between items-center cursor-pointer shadow-lg"
            >
              <div>
                <p className="text-lg">📅 4 Haftalik reja</p>
                <p className="text-xs opacity-70 font-normal mt-1">Bo'limlar va ishlarni boshqarish</p>
              </div>
              <Plus size={24}/>
            </button>
          </div>
        )}

        {/* BOSQICH 2: BO'LIMLAR */}
        {rejaStep === 'bolimlar' && (
          <>
            <button
              onClick={() => setRejaStep('yangi_bolim')}
              className="w-full p-4 rounded-2xl border-2 border-dashed border-purple-300 text-purple-700 font-black text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-purple-50"
            >
              <Plus size={18}/> Yangi bo'lim qo'shish
            </button>
            {rejaBolimlar.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-bold">Hozircha bo'limlar yo'q</div>
            ) : (
              rejaBolimlar.map((bolim) => (
                <div
                  key={bolim.id}
                  className="w-full p-5 rounded-[20px] bg-slate-50 border-2 border-slate-100 flex justify-between items-center group"
                >
                  <button
                    onClick={() => { setRejaSelectedBolim(bolim); loadRejaIshlar(bolim.id); setRejaStep('ishlar'); }}
                    className="flex-1 text-left cursor-pointer"
                  >
                    <p className="font-black text-sm">{bolim.bolim}</p>
                  </button>
                  <button
                    onClick={() => deleteRejaBolim(bolim.id)}
                    className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 size={16}/>
                  </button>
                </div>
              ))
            )}
          </>
        )}

        {/* BOSQICH 3: YANGI BO'LIM */}
        {rejaStep === 'yangi_bolim' && (
          <div className="space-y-4">
            <input
              placeholder="Bo'lim nomi"
              value={yangibolimNomi}
              onChange={e => setYangiBolimNomi(e.target.value)}
              className="w-full p-4 border-2 rounded-2xl outline-none focus:border-purple-600 font-bold bg-slate-50"
            />
            <button
              onClick={addRejaBolim}
              disabled={isRejaSubmitting}
              className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black cursor-pointer disabled:opacity-50"
            >
              Qo'shish
            </button>
          </div>
        )}

        {/* BOSQICH 4: ISHLAR */}
        {rejaStep === 'ishlar' && (
          <>
            <button
              onClick={() => setRejaStep('yangi_ish')}
              className="w-full p-4 rounded-2xl border-2 border-dashed border-purple-300 text-purple-700 font-black text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-purple-50"
            >
              <Plus size={18}/> Yangi ish qo'shish
            </button>
            {rejaIshlar.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-bold">Hozircha ishlar yo'q</div>
            ) : (
              rejaIshlar.map((ish) => (
                <div key={ish.id} className="p-5 rounded-[20px] bg-slate-50 border-2 border-slate-100 flex justify-between items-start">
                  <div>
                    <p className="font-black text-sm">{ish.ish}</p>
                    <div className="flex gap-3 mt-1 text-[10px] text-slate-500 font-bold">
                      {ish.davriylik && <span>⏱ {ish.davriylik}</span>}
                      {ish.bajaruvchi && <span>👤 {ish.bajaruvchi}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteRejaIsh(ish.id)}
                    className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 size={16}/>
                  </button>
                </div>
              ))
            )}
          </>
        )}

        {/* BOSQICH 5: YANGI ISH */}
        {rejaStep === 'yangi_ish' && (
          <div className="space-y-4">
            <input
              placeholder="Ish nomi *"
              value={yangiIsh.ish}
              onChange={e => setYangiIsh({...yangiIsh, ish: e.target.value})}
              className="w-full p-4 border-2 rounded-2xl outline-none focus:border-purple-600 font-bold bg-slate-50"
            />
            <input
              placeholder="Davriylik (masalan: Oyiga 1 marta)"
              value={yangiIsh.davriylik}
              onChange={e => setYangiIsh({...yangiIsh, davriylik: e.target.value})}
              className="w-full p-4 border-2 rounded-2xl outline-none focus:border-purple-600 font-bold bg-slate-50"
            />
            <input
              placeholder="Bajaruvchi"
              value={yangiIsh.bajaruvchi}
              onChange={e => setYangiIsh({...yangiIsh, bajaruvchi: e.target.value})}
              className="w-full p-4 border-2 rounded-2xl outline-none focus:border-purple-600 font-bold bg-slate-50"
            />
            <input
              placeholder="Jurnal"
              value={yangiIsh.jurnal}
              onChange={e => setYangiIsh({...yangiIsh, jurnal: e.target.value})}
              className="w-full p-4 border-2 rounded-2xl outline-none focus:border-purple-600 font-bold bg-slate-50"
            />
            <button
              onClick={addRejaIsh}
              disabled={isRejaSubmitting}
              className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black cursor-pointer disabled:opacity-50"
            >
              Qo'shish
            </button>
          </div>
        )}

      </div>
    </div>
  </div>
)}
{showAdminPanel && (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-3">
    <div className="bg-white w-full sm:max-w-2xl h-[85vh] sm:h-[90vh] rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
      
      {/* HEADER - mobil uchun tutqich qo'shish */}
      <div className="p-4 border-b-4 border-orange-200 flex justify-between items-center bg-orange-50 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-12 h-1 bg-orange-300 rounded-full mx-auto sm:hidden absolute left-1/2 -translate-x-1/2 top-2"></div>
          <h2 className="text-base sm:text-lg font-black text-orange-900 uppercase flex items-center gap-2 mt-4 sm:mt-0">
            <ShieldCheck size={20} className="hidden sm:block"/> Ishchilar
          </h2>
        </div>
        <button onClick={() => setShowAdminPanel(false)} className="bg-white p-2 rounded-full text-orange-600 cursor-pointer shadow">
          <X size={20} className="sm:w-6 sm:h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
        
        {/* YANGI ISHCHI QO'SHISH - mobil uchun soddalashtirilgan */}
        <div className="bg-orange-50 p-3 sm:p-4 rounded-2xl space-y-2">
          <p className="font-black text-[10px] sm:text-xs uppercase text-orange-700">➕ Yangi ishchi qo'shish</p>
          <input placeholder="F.I.SH" className="w-full p-2 sm:p-3 border-2 rounded-xl outline-none focus:border-orange-500 font-bold bg-white text-xs sm:text-sm" value={newWorkerName} onChange={e => setNewWorkerName(e.target.value)} />
          <input placeholder="ID raqami" className="w-full p-2 sm:p-3 border-2 rounded-xl outline-none focus:border-orange-500 font-bold bg-white text-xs sm:text-sm" value={newWorkerId} onChange={e => setNewWorkerId(e.target.value)} />
          <input placeholder="Parol" type="text" className="w-full p-2 sm:p-3 border-2 rounded-xl outline-none focus:border-orange-500 font-bold bg-white text-xs sm:text-sm" value={newWorkerPass} onChange={e => setNewWorkerPass(e.target.value)} />
         
          <select
            value={newWorkerStation}
            onChange={e => setNewWorkerStation(e.target.value)}
            className="w-full p-2 sm:p-3 border-2 rounded-xl outline-none focus:border-orange-500 font-bold bg-white text-xs sm:text-sm"
          >
            <option value="">Bekat tanlang</option>
            {BEKATLAR.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          
          <button onClick={addWorker} className="w-full bg-orange-600 text-white p-2.5 sm:p-3 rounded-xl font-black cursor-pointer uppercase text-xs sm:text-sm hover:bg-orange-700 transition">
            Qo'shish
          </button>
        </div>

        {/* ISHCHILAR RO'YXATI */}
        <div className="space-y-2">
          <p className="font-black text-[10px] sm:text-xs text-slate-500 px-1">📋 Ishchilar ro'yxati ({workersList.length})</p>
          
          {workersList.map((w) => (
            <div key={w.id} className={`bg-white border-2 rounded-xl sm:rounded-2xl p-3 sm:p-4 ${w.role !== 'worker' ? 'border-orange-200 bg-orange-50' : 'border-slate-100'}`}>
              
              {editingWorker?.id === w.id ? (
                // TAHRIRLASH REJIMI - mobil uchun
                <div className="space-y-2">
                  <input className="w-full p-2 border-2 rounded-xl text-xs sm:text-sm font-bold outline-none focus:border-orange-500" placeholder="F.I.SH" value={editName} onChange={e => setEditName(e.target.value)} />
                  
                  {w.role === 'worker' && (
                    <>
                      <input className="w-full p-2 border-2 rounded-xl text-xs sm:text-sm font-bold outline-none focus:border-orange-500" placeholder="Yangi ID" value={editId} onChange={e => setEditId(e.target.value)} />
                      <input className="w-full p-2 border-2 rounded-xl text-xs sm:text-sm font-bold outline-none focus:border-orange-500" placeholder="Yangi parol" value={editPass} onChange={e => setEditPass(e.target.value)} />
                      <select
                        value={editStation}
                        onChange={e => setEditStation(e.target.value)}
                        className="w-full p-2 border-2 rounded-xl text-xs sm:text-sm font-bold outline-none focus:border-orange-500 bg-white"
                      >
                        <option value="">Bekat tanlang</option>
                        {BEKATLAR.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </>
                  )}
                  
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="flex-1 bg-green-600 text-white p-2 rounded-xl font-black text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-1">
                      <Save size={14}/> Saqlash
                    </button>
                    <button onClick={() => setEditingWorker(null)} className="flex-1 bg-slate-200 p-2 rounded-xl font-black text-xs sm:text-sm cursor-pointer">
                      Bekor
                    </button>
                  </div>
                </div>
              ) : (
                // KO'RISH REJIMI - mobil uchun
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      <p className="font-black text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{w.full_name}</p>
                      {w.station && (
                        <p className="text-[8px] sm:text-[10px] font-black text-purple-700 truncate">📍 {w.station}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <p className="font-mono text-orange-700 text-[9px] sm:text-xs">{w.worker_id}</p>
                      {w.role === 'admin' && <span className="bg-red-600 text-white text-[7px] sm:text-[8px] px-1.5 py-0.5 rounded-full">ADMIN</span>}
                      {w.role === 'boss' && <span className="bg-blue-900 text-white text-[7px] sm:text-[8px] px-1.5 py-0.5 rounded-full">BOSS</span>}
                    </div>
                  </div>
                  
                  <div className="flex gap-0.5 sm:gap-1">
                    <button onClick={() => handleEditClick(w)} className="text-blue-600 p-1.5 sm:p-2 hover:bg-blue-50 rounded-full cursor-pointer">
                      <Edit3 size={16} className="sm:w-5 sm:h-5" />
                    </button>
                    
                    {w.role === 'worker' ? (
                      <button onClick={() => removeWorker(w)} className="text-red-500 p-1.5 sm:p-2 hover:bg-red-50 rounded-full cursor-pointer">
                        <Trash2 size={16} className="sm:w-5 sm:h-5" />
                      </button>
                    ) : (
                      <div className="p-1.5 sm:p-2"><ShieldCheck size={16} className="sm:w-5 sm:h-5 text-orange-400"/></div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)}

{showTaskMenu && (
  <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-lg rounded-[50px] shadow-2xl border-t-[16px] border-blue-900 animate-in zoom-in-95 duration-200 text-slate-800 overflow-hidden flex flex-col max-h-[85vh]">

      {/* HEADER */}
      <div className="flex justify-between items-center p-6 pb-4 border-b-2 border-slate-50">
        <div>
          {taskMenuStep !== 'main' && (
            <button
              onClick={() => {
                if (taskMenuStep === 'ishlar') setTaskMenuStep('bolimlar');
                else setTaskMenuStep('main');
              }}
              className="text-blue-900 font-black text-xs flex items-center gap-1 mb-1 cursor-pointer hover:underline"
            >
              <ArrowLeft size={14}/> Ortga
            </button>
          )}
          <h3 className="text-xl font-black tracking-tighter uppercase">
            {taskMenuStep === 'main' && 'ISHNI TANLANG'}
            {taskMenuStep === 'bolimlar' && "BO'LIM TANLANG"}
          {taskMenuStep === 'ishlar' && (selectedBolim?.bolim || '')}
          </h3>
        </div>
        <button
          onClick={() => {
            setShowTaskMenu(false);
            setTaskMenuStep('main');
            setSelectedBolim(null);
          }}
          className="bg-slate-100 p-3 rounded-full hover:bg-slate-200 cursor-pointer"
        >
          <X size={28}/>
        </button>
      </div>

      {/* KONTENT */}
      <div className="overflow-y-auto p-6 space-y-3">

        {/* BOSQICH 1: MAIN */}
        {taskMenuStep === 'main' && (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => { setSelectedReja('yillik'); loadRejaBolimlar('yillik'); setTaskMenuStep('bolimlar'); }}
              className="w-full text-left p-6 rounded-3xl bg-blue-900 text-white font-black flex justify-between items-center cursor-pointer shadow-lg"
            >
              <div>
                <p className="text-lg">📋 Yillik reja grafigi</p>
                <p className="text-xs opacity-70 font-normal mt-1">136 ta ish • 23 ta bo'lim</p>
              </div>
              <Plus size={24}/>
            </button>
            <button
        onClick={() => { setSelectedReja('haftalik'); loadRejaBolimlar('haftalik'); setTaskMenuStep('bolimlar'); }}
              className="w-full text-left p-6 rounded-3xl bg-green-700 text-white font-black flex justify-between items-center cursor-pointer shadow-lg"
            >
              <div>
                <p className="text-lg">📅 4 haftalik reja</p>
                <p className="text-xs opacity-70 font-normal mt-1">51 ta ish • 18 ta bo'lim</p>
              </div>
              <Plus size={24}/>
            </button>
          </div>
        )}

        {/* BOSQICH 2: BO'LIMLAR */}
     {taskMenuStep === 'bolimlar' && (() => {
  const staticData = selectedReja === 'yillik' ? YILLIK_REJA : TORT_HAFTALIK_REJA;
  const supabaseData = rejaBolimlar
    .filter(b => b.reja_turi === (selectedReja === 'yillik' ? 'yillik' : 'haftalik'))
    .map(b => ({ bolim: b.bolim, ishlar: [], _supabase: true, _id: b.id }));
  const allBolimlar = [...staticData, ...supabaseData];
  return allBolimlar.map((bolim) => (
  <button key={bolim._id || bolim.bolim}
      onClick={() => {
  setSelectedBolim(bolim);
  setTaskMenuStep('ishlar');
  if (bolim._supabase) loadRejaIshlar(bolim._id);
}}
      className="w-full text-left p-5 rounded-[20px] bg-slate-50 hover:bg-blue-900 hover:text-white border-2 border-slate-100 transition-all flex justify-between items-center group cursor-pointer"
    >
      <div>
        <p className="font-black text-sm">{bolim.bolim}</p>
<p className="text-[10px] opacity-60 mt-0.5">
  {bolim._supabase ? '...' : `${bolim.ishlar.length} ta ish`}
</p>
      </div>
      <Plus size={20} className="opacity-50 group-hover:opacity-100"/>
    </button>
  ));
})()}

        {/* BOSQICH 3: ISHLAR */}
      {taskMenuStep === 'ishlar' && selectedBolim && (() => {
  // Agar Supabase bo'limi bo'lsa — rejaIshlar dan ol
  if (selectedBolim._supabase) {
    if (rejaIshlar.length === 0) {
      return <div className="text-center py-8 text-slate-400 font-bold">Bu bo'limda ishlar yo'q</div>;
    }
  return rejaIshlar.map((ish) => (
  <button key={ish.id}
        onClick={() => handleAddTask(ish)}
        disabled={isSubmitting}
        className="w-full text-left p-5 rounded-[20px] bg-slate-50 hover:bg-blue-900 hover:text-white border-2 border-slate-100 transition-all group cursor-pointer disabled:opacity-50"
      >
        <p className="font-black text-xs leading-relaxed">{ish.ish}</p>
        <div className="flex gap-3 mt-2 text-[9px] opacity-50 group-hover:opacity-80">
          <span>⏱ {ish.davriylik}</span>
          <span>👤 {ish.bajaruvchi}</span>
        </div>
      </button>
    ));
  }
  // Static fayl bo'lsa — avvalgidek
  if (selectedBolim.ishlar.length === 0) {
    return <div className="text-center py-8 text-slate-400 font-bold">Bu bo'limda ishlar yo'q</div>;
  }
return selectedBolim.ishlar.map((ish) => (
  <button key={ish.ish}
      onClick={() => handleAddTask(ish)}
      disabled={isSubmitting}
      className="w-full text-left p-5 rounded-[20px] bg-slate-50 hover:bg-blue-900 hover:text-white border-2 border-slate-100 transition-all group cursor-pointer disabled:opacity-50"
    >
      <p className="font-black text-xs leading-relaxed">{ish.ish}</p>
      <div className="flex gap-3 mt-2 text-[9px] opacity-50 group-hover:opacity-80">
        <span>⏱ {ish.davriylik}</span>
        <span>👤 {ish.bajaruvchi}</span>
      </div>
    </button>
  ));
})()}

      </div>
    </div>
  </div>
)}

      {/* NOSOZLIK MODALI */}
{showFaultModal && (
  <div className="fixed inset-0 bg-black/70 z-[150] flex items-center justify-center">
          <div className="bg-white w-full max-w-md p-8 rounded-3xl space-y-4">
            <h2 className="text-2xl font-black text-red-600 uppercase">
              Nosozlik sababi
            </h2>

            <select
              value={faultReason}
              onChange={(e) => setFaultReason(e.target.value)}
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
                onChange={(e) => setCustomFaultReason(e.target.value)}
                className="w-full border p-3 rounded-xl"
              />
            )}

<div className="flex gap-3">
  <button
    disabled={!faultReason || (faultReason === "Boshqa" && !customFaultReason)}
    onClick={() => setConfirmFaultSend(true)}
    className="flex-1 bg-red-600 text-white py-3 rounded-xl disabled:bg-gray-400 cursor-pointer"
  >
    Yuborish
  </button>
  <button
    onClick={() => {
      setShowFaultModal(false);
      setFaultReason("");
      setCustomFaultReason("");
      setConfirmFaultSend(false);
    }}
    className="flex-1 bg-gray-200 py-3 rounded-xl font-bold cursor-pointer"
  >
    Ortga
  </button>
</div>
          </div>
        </div>
      )}

      {/* TASDIQLASH MODALI */}
{confirmFaultSend && (
  <div className="fixed inset-0 bg-black/80 z-[160] flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl text-center max-w-sm space-y-4">
            <h3 className="text-xl font-black text-red-600">
              Nosozlik yuborilsinmi?
            </h3>
            <div className="flex gap-3">
              <button
                onClick={sendFault}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl"
              >
                Yuborish
              </button>
              <button
                onClick={() => setConfirmFaultSend(false)}
                className="flex-1 bg-gray-200 py-3 rounded-xl"
              >
                Bekor
              </button>
            </div>
          </div>
        </div>
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

{showJournalMenu && (
  <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
      <div className="flex justify-between items-center px-6 py-4 border-b bg-purple-50">
        <h2 className="font-black text-purple-900 uppercase">📔 Jurnallar</h2>
        <button onClick={() => setShowJournalMenu(false)} className="bg-slate-100 p-2 rounded-full cursor-pointer">
          <X size={20}/>
        </button>
      </div>
      <div className="p-6 space-y-3">
        <div className="border-2 border-blue-100 rounded-2xl overflow-hidden">
          <p className="bg-blue-50 px-4 py-2 font-black text-blue-900 text-sm">📋 DU-46</p>
          <div className="flex gap-2 p-3">
            <button
              onClick={() => { setShowJournalMenu(false); setShowDu46(true); }}
              className="flex-1 bg-blue-900 text-white py-2 rounded-xl font-black text-xs cursor-pointer"
            >
              + Yangi yozuv
            </button>
            <button
              onClick={() => { setShowJournalMenu(false); setShowDu46Archive(true); }}
              className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-xl font-black text-xs cursor-pointer"
            >
              📂 Arxiv
            </button>
          </div>
        </div>
        <div className="border-2 border-green-100 rounded-2xl overflow-hidden">
          <p className="bg-green-50 px-4 py-2 font-black text-green-900 text-sm">📒 SHU-2</p>
          <div className="flex gap-2 p-3">
            <button
              onClick={() => { setShowJournalMenu(false); setShowShu2(true); }}
              className="flex-1 bg-green-700 text-white py-2 rounded-xl font-black text-xs cursor-pointer"
            >
              + Yangi yozuv
            </button>
            <button
              onClick={() => { setShowJournalMenu(false); setShowShu2Archive(true); }}
              className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-xl font-black text-xs cursor-pointer"
            >
              📂 Arxiv
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
{bossJournalStation && !bossJournalType && (
  <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
      <div className="flex justify-between items-center px-6 py-4 border-b bg-purple-50">
        <h2 className="font-black text-purple-900 uppercase">📔 Jurnallar — {bossJournalStation}</h2>
        <button onClick={() => setBossJournalStation(null)} className="bg-slate-100 p-2 rounded-full cursor-pointer">
          <X size={20}/>
        </button>
      </div>
      <div className="p-6 space-y-3">
        <button
          onClick={() => setBossJournalType('du46')}
          className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black cursor-pointer flex items-center justify-center gap-2"
        >
          📋 DU-46 arxivi
        </button>
        <button
          onClick={() => setBossJournalType('shu2')}
          className="w-full bg-green-700 text-white py-4 rounded-2xl font-black cursor-pointer flex items-center justify-center gap-2"
        >
          📒 SHU-2 arxivi
        </button>
      </div>
    </div>
  </div>
)}

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
{showStationWorkers && (
  <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">
      <div className="flex justify-between items-center px-6 py-4 border-b bg-purple-50">
        <h2 className="font-black text-purple-900 uppercase">👥 {currentWorker?.station} — Ishchilar</h2>
        <button onClick={() => setShowStationWorkers(false)} className="bg-slate-100 p-2 rounded-full cursor-pointer">
          <X size={20}/>
        </button>
      </div>
      <div className="overflow-y-auto p-4 space-y-3">
        {workersList
          .filter(w => w.station === currentWorker?.station)
          .map(w => (
            <div key={w.id} className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border-2 border-slate-100">
              <div className="bg-purple-100 p-3 rounded-full">
                <User size={20} className="text-purple-700"/>
              </div>
              <div>
                <p className="font-black text-sm">{w.full_name}</p>
                <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                  {w.role === 'admin' ? '🔴 Admin' : w.role === 'boss' ? '🔵 Nazoratchi' : '🟢 Ishchi'}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  </div>
)}
      {confirmResolve && (
  <div className="fixed inset-0 bg-black/80 z-[170] flex items-center justify-center p-4">
    <div className="bg-white p-8 rounded-3xl text-center max-w-sm w-full space-y-5 shadow-2xl">
      <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
        <CheckCircle size={32} className="text-green-600"/>
      </div>
      <h3 className="text-xl font-black text-slate-800">
        Nosozlik bartaraf etildimi?
      </h3>
      <div className="flex gap-3">
        <button
          onClick={async () => {
            const { error } = await supabase
              .from("faults")
              .update({ status: "resolved", resolved_at: new Date() })
              .eq("id", confirmResolve);
            if (!error) {
              setActiveFaults(prev => prev.filter(f => f.id !== confirmResolve));
              toast.success("Nosozlik bartaraf etildi!");
            } else {
              toast.error("Xatolik yuz berdi!");
            }
            setConfirmResolve(null);
          }}
          className="flex-1 bg-green-600 text-white py-3 rounded-2xl font-black cursor-pointer"
        >
          Ha, tasdiqlash
        </button>
        <button
          onClick={() => setConfirmResolve(null)}
          className="flex-1 bg-slate-200 py-3 rounded-2xl font-black cursor-pointer"
        >
          Bekor
        </button>
      </div>
    </div>
  </div>
)}
{confirmFinishTask && (
  <div className="fixed inset-0 bg-black/80 z-[120] flex items-center justify-center p-4">
    <div className="bg-white p-8 rounded-3xl text-center max-w-sm w-full space-y-5 shadow-2xl">
      <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
        <CheckCircle size={32} className="text-green-600"/>
      </div>
      <h3 className="text-xl font-black text-slate-800">
        Ish tugaganligi haqida telegram guruhga foto yubordingizmi?
      </h3>
      <label className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl cursor-pointer border-2 border-slate-100 hover:border-green-400 transition-all">
        <input 
          type="checkbox" 
          checked={photoConfirmed}
          onChange={e => setPhotoConfirmed(e.target.checked)}
          className="w-5 h-5 accent-green-600 cursor-pointer"
        />
        <span className="font-bold text-sm text-slate-700">Ha, foto yubordim</span>
      </label>
      <div className="flex gap-3">
        <button
          onClick={() => finishTask(confirmFinishTask)}
          disabled={!photoConfirmed}
          className="flex-1 bg-green-600 text-white py-3 rounded-2xl font-black disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer transition-all"
        >
          Tugatish
        </button>
        <button
          onClick={() => { setConfirmFinishTask(null); setPhotoConfirmed(false); }}
          className="flex-1 bg-slate-200 py-3 rounded-2xl font-black cursor-pointer"
        >
          Bekor
        </button>
      </div>
    </div>
  </div>
)}
      {/* KATTA QIZIL OGOHLANTIRISH */}
{showBigAlert && activeFaults.length > 0 && (() => {
  const lastFault = activeFaults[activeFaults.length - 1];
  return (
    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
      <div className="bg-red-600 text-white p-10 rounded-[50px] text-center max-w-md shadow-[0_0_50px_rgba(220,38,38,0.5)] animate-in zoom-in-95 border-4 border-white relative">
        <div className="mb-4 flex justify-center">
          <div className="bg-white/20 p-6 rounded-full">
            <ShieldCheck size={80} className="animate-bounce" />
          </div>
        </div>
        <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Diqqat!</h2>
        <div className="space-y-3 bg-black/20 p-6 rounded-[30px] border border-white/10">
          <p className="text-2xl">Bekat: <b className="text-yellow-300">{lastFault.station}</b></p>
          <p className="text-lg opacity-90 italic">
            {lastFault.reason === "Boshqa" ? lastFault.custom_reason : lastFault.reason}
          </p>
        </div>
        <button
          onClick={() => setShowBigAlert(false)}
          className="mt-8 bg-white text-red-600 w-full py-5 rounded-3xl font-black text-xl hover:shadow-2xl active:scale-95 transition-all uppercase"
        >
          Tushunarli
        </button>
      </div>
    </div>
  );
})()}

      {/* NOSOZLIKLAR STATISTIKA MODALI */}
{showFaultStats && (
  <div className="fixed inset-0 bg-black/70 z-200 flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden flex flex-col max-h-[80vh]">
      
      {/* HEADER */}
      <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100 bg-white">
<h2 className="text-2xl font-black text-red-600">Bugungi nosozliklar</h2>
        <button
          onClick={() => setShowFaultStats(false)}
          className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 cursor-pointer"
        >
          <X size={24} />
        </button>
      </div>

      {/* SCROLL QISM */}
      <div className="overflow-y-auto p-8 space-y-4">
        {faultHistory.length === 0 ? (
          <p className="text-center py-8 text-gray-500">Hozircha nosozliklar yo'q</p>
        ) : (
          faultHistory.map(f => {
            const duration = f.resolved_at
              ? Math.floor((new Date(f.resolved_at) - new Date(f.created_at)) / 60000)
              : null;
            return (
              <div key={f.id} className="border p-4 rounded-xl">
<p className="font-bold">{f.station}</p>
<p className="text-xs text-blue-700 font-black">👤 {f.worker_name || "Noma'lum"}</p>
<p>{f.reason === "Boshqa" ? f.custom_reason : f.reason}</p>
<p className="text-sm text-gray-500">Boshlangan: {formatFullDateTime(f.created_at)}</p>
                {f.resolved_at && (
                  <p className="text-sm text-gray-500">Tugagan: {formatFullDateTime(f.resolved_at)}</p>
                )}
                {duration && (
                  <p className="text-green-600 font-bold mt-1">Bartaraf etish vaqti: {duration} min</p>
                )}
                {!f.resolved_at && (
                  <p className="text-red-600 font-bold mt-1">Aktiv (davom etmoqda)</p>
                )}
              </div>
            );
          })
        )}
        <button
          onClick={() => setShowFaultStats(false)}
          className="w-full bg-gray-200 py-3 rounded-xl font-bold cursor-pointer"
        >
          Yopish
        </button>
      </div>

    </div>
  </div>
)}
{showFaultArchive && (
  <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col max-h-[80vh]">
      <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100">
        <div>
          {selectedFaultDate && (
            <button onClick={() => setSelectedFaultDate(null)} className="text-blue-900 font-black text-xs flex items-center gap-1 cursor-pointer hover:underline mb-1">
              <ArrowLeft size={14}/> Sanalar
            </button>
          )}
          <h2 className="text-xl font-black text-slate-800 uppercase">Nosozliklar Arxivi</h2>
        </div>
        <button onClick={() => { setShowFaultArchive(false); setSelectedFaultDate(null); }} className="bg-slate-100 p-2 rounded-full cursor-pointer">
          <X size={24}/>
        </button>
      </div>
      <div className="overflow-y-auto p-6 space-y-3">
        {!selectedFaultDate ? (
          faultArchiveDates.length === 0 ? (
            <p className="text-center py-8 text-slate-400 font-bold">Arxiv bo'sh</p>
          ) : (
            faultArchiveDates.map(date => (
              <button
                key={date}
                onClick={() => setSelectedFaultDate(date)}
                className="w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-red-600 hover:text-white border-2 border-slate-100 flex justify-between items-center cursor-pointer group transition-all"
              >
                <span className="font-black">📅 {new Date(date).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                <span className="text-xs font-bold opacity-60 group-hover:opacity-100">{faultArchiveGrouped[date].length} ta nosozlik</span>
              </button>
            ))
          )
        ) : (
          faultArchiveGrouped[selectedFaultDate].map(f => {
            const duration = f.resolved_at
              ? Math.floor((new Date(f.resolved_at) - new Date(f.created_at)) / 60000)
              : null;
            return (
              <div key={f.id} className="p-4 rounded-2xl bg-slate-50 border-l-4 border-l-red-500">
<p className="font-black text-sm">{f.station}</p>
<p className="text-xs text-blue-700 font-black">👤 {f.worker_name || "Noma'lum"}</p>
<p className="text-sm text-slate-600 mt-1">{f.reason === 'Boshqa' ? f.custom_reason : f.reason}</p>
                <div className="flex gap-3 mt-2 text-[10px] text-slate-500 font-bold">
                  <span>⏱ Boshlandi: {formatFullDateTime(f.created_at)}</span>
                  {f.resolved_at && <span>✅ Tugadi: {formatFullDateTime(f.resolved_at)}</span>}
                  {duration && <span className="text-green-600">🕐 {duration} min</span>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  </div>
)}
{showBossArchive && (
  <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col max-h-[80vh]">
      <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100">
        <h2 className="text-xl font-black text-blue-900 uppercase">{showBossArchive} — Arxiv</h2>
        <button onClick={() => { setShowBossArchive(null); setSelectedArchiveDate(null); }} className="bg-slate-100 p-2 rounded-full cursor-pointer">
          <X size={24}/>
        </button>
      </div>
      <div className="overflow-y-auto p-6 space-y-3">
        {!selectedArchiveDate ? (
          bossArchiveDates.length === 0 ? (
            <p className="text-center py-8 text-slate-400 font-bold">Arxiv bo'sh</p>
          ) : (
            bossArchiveDates.map(date => (
              <button
                key={date}
                onClick={() => setSelectedArchiveDate(date)}
                className="w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-blue-900 hover:text-white border-2 border-slate-100 flex justify-between items-center cursor-pointer group transition-all"
              >
                <span className="font-black">📅 {new Date(date).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                <span className="text-xs font-bold opacity-60 group-hover:opacity-100">{bossArchive[date].length} ta ish</span>
              </button>
            ))
          )
        ) : (
          <>
            <button onClick={() => setSelectedArchiveDate(null)} className="text-blue-900 font-black text-xs flex items-center gap-1 cursor-pointer hover:underline mb-2">
              <ArrowLeft size={14}/> Sanalar
            </button>
            {bossArchive[selectedArchiveDate].map(task => (
              <div key={task.id} className="p-4 rounded-2xl bg-slate-50 border-l-4 border-l-green-600">
                <p className="font-black text-sm">{task.name}</p>
                <div className="flex gap-3 mt-1 text-[10px] text-slate-500 font-bold">
                  <span>👤 {task.worker_id}</span>
                  <span>⏱ {formatFullDateTime(task.end_time)}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  </div>
)}
{showStationFaultArchive && (
  <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col max-h-[80vh]">
      <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100">
        <div>
          {selectedStationFaultDate && (
            <button onClick={() => setSelectedStationFaultDate(null)} className="text-red-700 font-black text-xs flex items-center gap-1 cursor-pointer hover:underline mb-1">
              <ArrowLeft size={14}/> Sanalar
            </button>
          )}
          <h2 className="text-xl font-black text-red-700 uppercase">{selectedStation} — Nosozliklar arxivi</h2>
        </div>
        <button onClick={() => { setShowStationFaultArchive(false); setSelectedStationFaultDate(null); }} className="bg-slate-100 p-2 rounded-full cursor-pointer">
          <X size={24}/>
        </button>
      </div>
      <div className="overflow-y-auto p-6 space-y-3">
        {!selectedStationFaultDate ? (
          stationFaultArchiveDates.length === 0 ? (
            <p className="text-center py-8 text-slate-400 font-bold">Nosozliklar yo'q</p>
          ) : (
            stationFaultArchiveDates.map(date => (
              <button
                key={date}
                onClick={() => setSelectedStationFaultDate(date)}
                className="w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-red-600 hover:text-white border-2 border-slate-100 flex justify-between items-center cursor-pointer group transition-all"
              >
                <span className="font-black">📅 {new Date(date).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                <span className="text-xs font-bold opacity-60 group-hover:opacity-100">{stationFaultArchiveGrouped[date].length} ta nosozlik</span>
              </button>
            ))
          )
        ) : (
          stationFaultArchiveGrouped[selectedStationFaultDate].map(f => {
            const duration = f.resolved_at
              ? Math.floor((new Date(f.resolved_at) - new Date(f.created_at)) / 60000)
              : null;
            return (
              <div key={f.id} className={`p-4 rounded-2xl border-l-4 ${f.status === 'active' ? 'bg-red-50 border-l-red-500' : 'bg-slate-50 border-l-green-500'}`}>
                <div className="flex justify-between items-start">
                  <p className="font-black text-sm">{f.reason === 'Boshqa' ? f.custom_reason : f.reason}</p>
                  <span className={`text-[9px] font-black px-2 py-1 rounded-full ${f.status === 'active' ? 'bg-red-600 text-white animate-pulse' : 'bg-green-100 text-green-700'}`}>
                    {f.status === 'active' ? 'Aktiv' : 'Bartaraf etildi'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-slate-500 font-bold">
                  <span>⏱ Boshlandi: {formatFullDateTime(f.created_at)}</span>
                  {f.resolved_at && <span>✅ Tugadi: {formatFullDateTime(f.resolved_at)}</span>}
                  {duration && <span className="text-green-600">🕐 {duration} min</span>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
}