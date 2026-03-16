"use client"
import { useState, useEffect } from 'react';
import { 
  MapPin, History, ShieldCheck, BarChart, AlertTriangle, Clock, CheckCircle, X, User, Zap
} from 'lucide-react';

export default function BossDashboard({
  activeFaults,
  allTasksForBoss,
  tasksByStation,
  BEKATLAR,
  workersList,
  getFaultTimer,
  formatFullDateTime,
  loadFaultStats,
  loadFaultArchive,
  loadBossArchive,
  setBossJournalStation,
  setShowFaultStats,
  setShowBigAlert,
}) {
  const [tick, setTick] = useState(0);
  const [bossStationWorkers, setBossStationWorkers] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const stationWorkers = bossStationWorkers
    ? [...(workersList || [])].filter(w => {
        if (!w.station) return false;
        return w.station.split(',').map(s => s.trim()).includes(bossStationWorkers);
      }).sort((a, b) => {
        const order = { 'katta_elektromexanik': 1, 'elektromexanik': 2, 'elektromontyor': 3 };
        return (order[a.role] || 99) - (order[b.role] || 99);
      })
    : [];

  const ROLE_NAMES = {
    katta_elektromexanik: '🟠 Katta elektromexanik',
    elektromexanik: '🟢 Elektromexanik',
    elektromontyor: '🟢 Elektromontyor',
    bekat_boshlig: '🟤 Bekat boshlig\'i',
    boshliq_muovini: '🔵 Boshliq muovini',
    bosh_muhandis: '🟣 Bosh muhandis',
    boss: '🔵 Nazoratchi',
    admin: '🔴 Admin',
  };

  const getFaultTimerLocal = (created_at) => {
    if (!created_at) return "00:00";
    const str = created_at.endsWith('Z') || created_at.includes('+') ? created_at : created_at + 'Z';
    const diff = Date.now() - new Date(str).getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  const pendingCount = allTasksForBoss.filter(t => t.status === 'pending').length;
  const completedCount = allTasksForBoss.filter(t =>
    t.status === 'completed' &&
    t.end_time?.slice(0, 10) === new Date().toISOString().slice(0, 10)
  ).length;

  return (
    <div className="space-y-5 animate-in fade-in duration-500">

      {/* FAOL NOSOZLIKLAR */}
      {activeFaults.length > 0 && (
        <div className="space-y-3 animate-in slide-in-from-top duration-300">
          {activeFaults.map(fault => (
            <div key={fault.id} className="relative bg-gradient-to-r from-red-600 to-red-500 text-white p-4 rounded-3xl shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8"/>
              <div className="flex justify-between items-center relative">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-white/20 p-2.5 rounded-2xl">
                    <AlertTriangle size={20} className="text-white"/>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-red-200 tracking-widest mb-0.5">🚨 Faol nosozlik</p>
                    <p className="font-black text-sm uppercase leading-tight">
                      {fault.station?.split(',').map(s => s.trim()).join(' | ')} — {fault.reason === "Boshqa" ? fault.custom_reason : fault.reason}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-red-200">👤 {fault.worker_name || "Noma'lum"}</span>
                      <span className="text-[10px] font-black text-yellow-300 bg-black/20 px-2 py-0.5 rounded-lg">
                        ⏱ {getFaultTimerLocal(fault.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => { loadFaultStats(); setShowFaultStats(true); }}
                  className="bg-white/20 hover:bg-white/30 p-2.5 rounded-xl transition-colors cursor-pointer shrink-0">
                  <BarChart size={16}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-5 rounded-3xl shadow-xl text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-2xl">
              <ShieldCheck size={24}/>
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight">Nazorat Paneli</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"/>
                <span className="text-[10px] text-blue-200 font-bold uppercase">Live rejim yoqilgan</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => { loadFaultStats(); setShowFaultStats(true); }}
              className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-black cursor-pointer transition-all">
              <BarChart size={15}/> Nosozliklar
            </button>
            <button onClick={loadFaultArchive}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-black cursor-pointer transition-all">
              <History size={15}/> Arxiv
            </button>
          </div>
        </div>
      </div>

      {/* STATISTIKA */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-1">
          <AlertTriangle size={24} className="opacity-80"/>
          <p className="text-3xl font-black">{activeFaults.length}</p>
          <p className="text-[9px] font-black uppercase opacity-70 text-center">Faol nosozlik</p>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 text-white p-4 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-1">
          <Clock size={24} className="opacity-80"/>
          <p className="text-3xl font-black">{pendingCount}</p>
          <p className="text-[9px] font-black uppercase opacity-70 text-center">Faol ishlar</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-1">
          <CheckCircle size={24} className="opacity-80"/>
          <p className="text-3xl font-black">{completedCount}</p>
          <p className="text-[9px] font-black uppercase opacity-70 text-center">Bajarilgan</p>
        </div>
      </div>

      {/* BEKATLAR */}
      <div className="grid gap-4">
        {BEKATLAR.map(station => {
const sTasks = [...(tasksByStation[station] || [])].sort((a, b) => {
  if (a.status === 'completed' && b.status !== 'completed') return -1;
  if (a.status !== 'completed' && b.status === 'completed') return 1;
  return 0;
});
          const hasFault = activeFaults.some(f =>
            f.station?.split(',').map(s => s.trim()).includes(station) && f.status === "active"
          );
          const pendingTasks = sTasks.filter(t => t.status === 'pending');
          const completedTasks = sTasks.filter(t => t.status === 'completed');

          return (
            <div key={station} className={`bg-white rounded-3xl shadow-md overflow-hidden border-2 transition-all ${
              hasFault ? 'border-red-400' : 'border-slate-100'
            }`}>

              {/* BEKAT HEADER */}
              <div className={`px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${
                hasFault ? 'bg-gradient-to-r from-red-50 to-orange-50' : 'bg-gradient-to-r from-slate-50 to-white'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${hasFault ? 'bg-red-100' : 'bg-blue-100'}`}>
                    <MapPin size={13} className={hasFault ? 'text-red-600' : 'text-blue-900'}/>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-blue-900 uppercase tracking-tight">{station}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {hasFault && (
                        <span className="bg-red-500 text-white text-[7px] px-1.5 py-0.5 rounded-full font-black flex items-center gap-0.5">
                          <AlertTriangle size={7}/> Nosozlik
                        </span>
                      )}
                      {pendingTasks.length > 0 && (
                        <span className="bg-orange-100 text-orange-700 text-[7px] px-1.5 py-0.5 rounded-full font-black">
                          ⏳ {pendingTasks.length} faol
                        </span>
                      )}
                      {completedTasks.length > 0 && (
                        <span className="bg-green-100 text-green-700 text-[7px] px-1.5 py-0.5 rounded-full font-black">
                          ✅ {completedTasks.length} bajarildi
                        </span>
                      )}
                    </div>
                  </div>
                </div>

<div className="flex flex-wrap items-center gap-1.5 justify-end">
  <button onClick={() => loadBossArchive(station)}
    className="text-[10px] font-black bg-slate-700 hover:bg-slate-900 text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-sm">
    <History size={11}/> Ishlar arxivi
  </button>
  <button onClick={() => setBossStationWorkers(station)}
    className="text-[10px] font-black bg-emerald-600 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-sm">
    👥 Ishchilar
  </button>
  <button onClick={() => setBossJournalStation(station)}
    className="text-[10px] font-black bg-purple-600 hover:bg-purple-800 text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-sm">
    📔 Jurnal
  </button>
</div>
              </div>

{sTasks.length > 0 ? (
  <div className="p-3 grid gap-2">
    {sTasks.map(task => (
      <div key={task.id} className={`rounded-2xl p-3 border ${
        task.status === 'completed'
          ? 'bg-green-50 border-green-100'
          : 'bg-orange-50 border-orange-100'
      }`}>
        {/* Yuqori qator — holat + vaqt */}
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${
            task.status === 'completed'
              ? 'bg-green-200 text-green-800'
              : 'bg-orange-200 text-orange-800 animate-pulse'
          }`}>
            {task.status === 'completed' ? '✅ Bajarildi' : '⏳ Jarayonda'}
          </span>
          <span className="text-[8px] font-bold text-slate-400">
            🕐 {formatFullDateTime(task.start_time)}
          </span>
        </div>

        {/* Ish nomi */}
        <p className="text-xs font-black text-slate-800 leading-snug mb-2">{task.name}</p>

        {/* Pastki qator — ishchi + teglar */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="bg-blue-900 text-white px-2 py-0.5 rounded-lg text-[8px] font-black">
            👤 {task.worker_id}
          </span>
          {task.nsh && (
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-lg text-[8px] font-black border border-blue-200">
              📋 {task.nsh}
            </span>
          )}
          {task.bolim && (
            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-lg text-[8px] font-black border border-purple-200">
              📁 {task.bolim}
            </span>
          )}
          {task.davriylik && (
            <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-lg text-[8px] font-black border border-teal-200">
              🔄 {task.davriylik}
            </span>
          )}
          {task.jurnal && (
            <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-lg text-[8px] font-black border border-indigo-200">
              📔 {task.jurnal}
            </span>
          )}
        </div>
      </div>
    ))}
  </div>
) : (
  <div className="py-6 text-center text-slate-300 font-bold text-xs">
    Hozircha ishlar yo'q
  </div>
)}
            </div>
          );
        })}
      </div>

      {/* ISHCHILAR MODALI */}
      {bossStationWorkers && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl">
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <div className="bg-white/20 p-2 rounded-xl">
                  <User size={18}/>
                </div>
                <h3 className="font-black uppercase text-sm">{bossStationWorkers} — Ishchilar</h3>
              </div>
              <button onClick={() => setBossStationWorkers(null)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full cursor-pointer text-white transition-all">
                <X size={18}/>
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3 bg-slate-50">
              {stationWorkers.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-4xl mb-3">👥</p>
                  <p className="text-slate-400 font-bold text-sm">Ishchilar yo'q</p>
                </div>
              ) : (
                stationWorkers.map(w => (
                  <div key={w.id} className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
                    <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-3 rounded-2xl">
                      <User size={22} className="text-purple-700"/>
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-sm">{w.full_name}</p>
                      <p className="text-xs font-bold text-slate-500 mt-0.5">{ROLE_NAMES[w.role] || w.role}</p>
                      <p className="text-xs font-bold text-purple-600 mt-0.5">📍 {w.station}</p>
                      {w.phone && (
                        <a href={`tel:${w.phone}`} className="text-xs font-black text-green-600 mt-0.5 flex items-center gap-1 hover:underline">
                          📞 {w.phone}
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}