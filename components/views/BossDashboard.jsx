"use client"
import { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, History, ShieldCheck, BarChart, AlertTriangle, Clock, CheckCircle, X, User
} from 'lucide-react';

const TODAY = new Date().toISOString().slice(0, 10);

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
  const [overdueModal, setOverdueModal] = useState(null); 
  // overdueModal = { station, type: 'unconfirmed' | 'unfinished', tasks: [] }

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const stationWorkers = bossStationWorkers
    ? [...(workersList || [])].filter(w => {
        if (!w.station) return false;
        return w.station.split(',').map(s => s.trim()).includes(bossStationWorkers);
      }).sort((a, b) => {
        const order = { 'bekat_boshlig': 1, 'katta_elektromexanik': 2, 'elektromexanik': 3, 'elektromontyor': 4 };
        return (order[a.role] || 99) - (order[b.role] || 99);
      })
    : [];

  const ROLE_NAMES = {
    bekat_boshlig: "🟤 Bekat boshlig'i",
    katta_elektromexanik: '🟠 Katta elektromexanik',
    elektromexanik: '🟢 Elektromexanik',
    elektromontyor: '🟢 Elektromontyor',
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

  const pendingCount = allTasksForBoss.filter(t => t.status === 'pending' && !t.completed_by_worker && t.start_time?.slice(0,10) === TODAY).length;
  const completedCount = allTasksForBoss.filter(t =>
    t.status === 'completed' && t.confirmed === true &&
    t.end_time?.slice(0, 10) === TODAY
  ).length;

  // Har bir bekat uchun muddati o'tgan ishlarni hisoblash
  const getStationOverdue = (station) => {
    const all = allTasksForBoss.filter(t => t.station === station);
    const unconfirmed = all.filter(t =>
      t.status === 'pending' &&
      t.completed_by_worker === true &&
      t.confirmed !== true &&
      t.start_time?.slice(0, 10) < TODAY
    );
    const unfinished = all.filter(t =>
      t.status === 'pending' &&
      !t.completed_by_worker &&
      t.start_time?.slice(0, 10) < TODAY
    );
    return { unconfirmed, unfinished };
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500">

      {/* FAOL NOSOZLIKLAR */}
      {activeFaults.filter(f => f.status === 'active' || (f.status === 'resolved' && f.confirmed === false)).length > 0 && (
        <div className="space-y-2">
          {activeFaults
            .filter(f => f.status === 'active' || (f.status === 'resolved' && f.confirmed === false))
            .map((fault) => (
              <div key={fault.id} className="relative text-white p-4 rounded-3xl shadow-xl overflow-hidden"
                style={{ background: fault.status === 'active'
                  ? 'linear-gradient(135deg,#991b1b,#dc2626)'
                  : 'linear-gradient(135deg,#92400e,#d97706)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8"/>
                <div className="flex justify-between items-center relative">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="bg-white/20 p-2.5 rounded-2xl shrink-0">
                      <AlertTriangle size={20}/>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest opacity-80">
                        {fault.status === 'active' ? 'Faol nosozlik' : `${fault.worker_name || 'Mexanik'} bartaraf etdi — bekat boshlig'i tasdiqlamadi`}
                      </p>
                      <p className="font-black text-sm uppercase leading-tight">
                        {fault.station} — {fault.reason === "Boshqa" ? fault.custom_reason : fault.reason}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] opacity-80">👤 {fault.worker_name || "Noma'lum"}</span>
                        <span className="text-[10px] font-black text-yellow-300 bg-black/20 px-2 py-0.5 rounded-lg">
                          ⏱ {getFaultTimerLocal(fault.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => { loadFaultStats(); setShowFaultStats(true); }}
                    className="bg-white/20 hover:bg-white/30 p-2.5 rounded-xl cursor-pointer shrink-0">
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
          <p className="text-3xl font-black">{activeFaults.filter(f => f.status === 'active').length}</p>
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
            f.station?.split(',').map(s => s.trim()).includes(station) && f.status === 'active'
          );
          const hasPendingFault = activeFaults.some(f =>
            f.station?.split(',').map(s => s.trim()).includes(station) &&
            f.status === 'resolved' && f.confirmed === false
          );

          const pendingTasks = sTasks.filter(t => t.status === 'pending' && !t.completed_by_worker && t.start_time?.slice(0,10) === TODAY);
          const waitingTasks = sTasks.filter(t => t.status === 'pending' && t.completed_by_worker === true && t.start_time?.slice(0,10) === TODAY);
          const completedTasks = sTasks.filter(t => t.status === 'completed' && t.confirmed === true && t.end_time?.slice(0,10) === TODAY);

          // Muddati o'tgan ishlar
          const { unconfirmed, unfinished } = getStationOverdue(station);

          return (
            <div key={station} className={`bg-white rounded-3xl shadow-md overflow-hidden border-2 transition-all ${
              hasFault ? 'border-red-400' : 'border-slate-100'
            }`}>

              {/* BEKAT HEADER */}
              <div className={`px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${
                hasFault ? 'bg-gradient-to-r from-red-50 to-orange-50' : 'bg-gradient-to-r from-slate-50 to-white'
              }`}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`p-1.5 rounded-lg shrink-0 ${hasFault ? 'bg-red-100' : 'bg-blue-100'}`}>
                    <MapPin size={13} className={hasFault ? 'text-red-600' : 'text-blue-900'}/>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-blue-900 uppercase tracking-tight">{station}</h3>
                    <div className="flex flex-wrap items-center gap-1 mt-0.5">
                      {hasFault && (
                        <span className="bg-red-500 text-white text-[7px] px-1.5 py-0.5 rounded-full font-black flex items-center gap-0.5">
                          <AlertTriangle size={7}/> Nosozlik
                        </span>
                      )}
                      {hasPendingFault && (
                        <span className="bg-amber-500 text-white text-[7px] px-1.5 py-0.5 rounded-full font-black">
                          ⏳ Tasdiq kutmoqda
                        </span>
                      )}
                      {pendingTasks.length > 0 && (
                        <span className="text-[8px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-full">
                          ⏳ {pendingTasks.length} faol
                        </span>
                      )}
                      {waitingTasks.length > 0 && (
                        <span className="text-[8px] font-bold text-amber-700 bg-amber-50 border border-amber-300 px-1.5 py-0.5 rounded-full animate-pulse">
                          🕐 {waitingTasks.length} tasdiq kutmoqda
                        </span>
                      )}
                      {completedTasks.length > 0 && (
                        <span className="text-[8px] font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">
                          ✅ {completedTasks.length} bajarildi
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 justify-end shrink-0">
                  {/* TASDIQLANMAGAN ISHLAR tugmasi */}
                  {unconfirmed.length > 0 && (
                    <button
                      onClick={() => setOverdueModal({ station, type: 'unconfirmed', tasks: unconfirmed })}
                      className="text-[9px] font-black bg-red-600 hover:bg-red-700 text-white px-2.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all animate-pulse">
                      ⚠️ {unconfirmed.length} tasdiqlanmagan
                    </button>
                  )}
                  {/* BAJARILMAGAN ISHLAR tugmasi */}
                  {unfinished.length > 0 && (
                    <button
                      onClick={() => setOverdueModal({ station, type: 'unfinished', tasks: unfinished })}
                      className="text-[9px] font-black bg-orange-500 hover:bg-orange-600 text-white px-2.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all animate-pulse">
                      ⏰ {unfinished.length} bajarilmagan
                    </button>
                  )}
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

              {/* ISHLAR */}
              {sTasks.filter(t => t.start_time?.slice(0,10) === TODAY).length > 0 ? (
                <div className="p-3 grid gap-2">
                  {sTasks.filter(t => t.start_time?.slice(0,10) === TODAY).map(task => (
                    <div key={task.id} className={`rounded-2xl p-3 border ${
                      task.status === 'completed' && task.confirmed
                        ? 'bg-green-50 border-green-100'
                        : task.status === 'completed' && !task.confirmed
                          ? 'bg-orange-50 border-orange-200'
                          : task.completed_by_worker
                            ? 'bg-amber-50 border-amber-200'
                            : 'bg-white border-orange-100'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${
                          task.status === 'completed' && task.confirmed
                            ? 'bg-green-200 text-green-800'
                            : 'bg-orange-200 text-orange-800'
                        }`}>
                          {task.status === 'completed' && task.confirmed
                            ? '✅ Bajarildi'
                            : task.status === 'completed' && !task.confirmed
                              ? "⚠️ Bajarildi — boshlig' tasdiqlamadi"
                              : task.completed_by_worker
                                ? `🕐 ${task.completed_by || 'Ishchi'} bajardi —Bekat boshlig'i tasdiqlamadi`
                                : '⏳ Jarayonda'}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400">
                          🕐 {formatFullDateTime(task.start_time)}
                        </span>
                      </div>
                      <p className="text-xs font-black text-slate-800 leading-snug mb-2">{task.name}</p>
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="bg-blue-900 text-white px-2 py-0.5 rounded-lg text-[8px] font-black">👤 {task.worker_id}</span>
                        {task.nsh && <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-lg text-[8px] font-black border border-blue-200">📋 {task.nsh}</span>}
                        {task.bolim && <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-lg text-[8px] font-black border border-purple-200">📁 {task.bolim}</span>}
                        {task.davriylik && <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-lg text-[8px] font-black border border-teal-200">🔄 {task.davriylik}</span>}
                        {task.jurnal && <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-lg text-[8px] font-black border border-indigo-200">📔 {task.jurnal}</span>}
                        {task.confirmed_by && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-lg text-[8px] font-black border border-amber-200">🛡 {task.confirmed_by}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-5 text-center text-slate-300 font-bold text-xs">
                  Bugun ishlar yo'q
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MUDDATI O'TGAN ISHLAR MODALI */}
      {overdueModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl">
            <div className={`px-6 py-4 flex justify-between items-center ${
              overdueModal.type === 'unconfirmed' ? 'bg-red-600' : 'bg-orange-500'
            }`}>
              <div>
                <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">{overdueModal.station}</p>
                <h3 className="text-white font-black text-sm uppercase">
                  {overdueModal.type === 'unconfirmed' ? '⚠️ Tasdiqlanmagan ishlar' : '⏰ Bajarilmagan ishlar'}
                </h3>
              </div>
              <button onClick={() => setOverdueModal(null)}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-full cursor-pointer text-white">
                <X size={18}/>
              </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-3 bg-slate-50">
              {overdueModal.tasks.length === 0 ? (
                <p className="text-center py-8 text-slate-400 font-bold">Ishlar yo'q</p>
              ) : overdueModal.tasks.map(task => (
                <div key={task.id} className={`bg-white border rounded-2xl p-4 ${
                  overdueModal.type === 'unconfirmed' ? 'border-red-200' : 'border-orange-200'
                }`}>
                  <p className="font-black text-sm text-slate-800 mb-2">{task.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="bg-blue-900 text-white px-2 py-0.5 rounded-lg text-[9px] font-black">
                      👤 {task.worker_id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black border ${
                      overdueModal.type === 'unconfirmed'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-orange-50 text-orange-700 border-orange-200'
                    }`}>
                      📅 {overdueModal.type === 'unconfirmed'
                        ? `Bajardi: ${formatFullDateTime(task.start_time)}`
                        : `Bajarilishi kerak edi: ${formatFullDateTime(task.start_time)}`
                      }
                    </span>
                    {overdueModal.type === 'unconfirmed' && (
                      <span className="bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-lg text-[9px] font-black">
                        ⚠️ Bekat boshlig'i tasdiqlamadi
                      </span>
                    )}
                    {overdueModal.type === 'unfinished' && (
                      <span className="bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-lg text-[9px] font-black">
                        ⏰ Bajarilmagan
                      </span>
                    )}
                    {task.bolim && <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-lg text-[9px] font-black border border-purple-100">📁 {task.bolim}</span>}
                    {task.davriylik && <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded-lg text-[9px] font-black border border-teal-100">🔄 {task.davriylik}</span>}
                    {task.jurnal && <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg text-[9px] font-black border border-indigo-100">📔 {task.jurnal}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ISHCHILAR MODALI */}
      {bossStationWorkers && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl">
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <div className="bg-white/20 p-2 rounded-xl"><User size={18}/></div>
                <h3 className="font-black uppercase text-sm">{bossStationWorkers} — Ishchilar</h3>
              </div>
              <button onClick={() => setBossStationWorkers(null)}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-full cursor-pointer text-white">
                <X size={18}/>
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3 bg-slate-50">
              {stationWorkers.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-4xl mb-3">👥</p>
                  <p className="text-slate-400 font-bold text-sm">Ishchilar yo'q</p>
                </div>
              ) : stationWorkers.map(w => (
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
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}