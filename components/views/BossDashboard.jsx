"use client"
import { useState, useEffect } from 'react';
import { 
  MapPin, History, ShieldCheck, BarChart, AlertTriangle, Clock, CheckCircle, X, User
} from 'lucide-react';

export default function BossDashboard({
  // Data
  activeFaults,
  allTasksForBoss,
  tasksByStation,
  BEKATLAR,
  workersList,
  // Actions
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

useEffect(() => {
  const interval = setInterval(() => setTick(t => t + 1), 1000);
  return () => clearInterval(interval);
}, []);

const [bossStationWorkers, setBossStationWorkers] = useState(null);

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
  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* FAOL NOSOZLIKLAR VIDJET */}
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
  {fault.station?.split(',').map(s => s.trim()).join(' | ')} — {fault.reason === "Boshqa" ? fault.custom_reason : fault.reason}
</p>
                    <p className="text-xs text-yellow-200 mt-0.5">👤 {fault.worker_name || "Noma'lum"}</p>
<p className="text-xs text-yellow-200 mt-1">
  ⏱ {(() => {
    if (!fault.created_at) return "00:00";
const created = new Date(fault.created_at);
const now = new Date();
const diff = now.getTime() - created.getTime() - (5 * 60 * 60 * 1000);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  })()}
</p>
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

      {/* NAZORAT PANELI HEADER */}
      <div className="bg-white p-6 rounded-4xl shadow-xl border-b-8 border-blue-900 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
          <ShieldCheck className="text-blue-900"/> Nazorat Paneli
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { loadFaultStats(); setShowFaultStats(true); }}
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

      {/* STATISTIKA KARTALAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-600 text-white p-6 rounded-[28px] shadow-xl flex items-center gap-4">
          <div className="bg-white/20 p-4 rounded-2xl">
            <AlertTriangle size={32} />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase opacity-70">Faol nosozliklar</p>
            <p className="text-4xl font-black">{activeFaults.length}</p>
          </div>
        </div>

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

      {/* BEKATLAR RO'YXATI */}
      <div className="grid gap-8">
        {BEKATLAR.map(station => {
          const sTasks = tasksByStation[station] || [];
const hasFault = activeFaults.some(f => 
  f.station?.split(',').map(s => s.trim()).includes(station) && f.status === "active"
);

          return (
            <div key={station} className={`bg-white rounded-4xl shadow-lg overflow-hidden border ${
              hasFault ? 'border-red-500 border-2' : 'border-slate-200'
            }`}>

              {/* BEKAT HEADER */}
              <div className={`p-3 sm:p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center ${
                hasFault ? 'bg-red-50' : 'bg-slate-50'
              }`}>
                <div className="flex items-start gap-2 w-full sm:w-auto mb-2 sm:mb-0">
                  <MapPin size={14} className="sm:w-4 sm:h-4 mt-0.5 text-blue-900" />
                  <div className="flex flex-col">
                    <h3 className="text-sm sm:text-base font-black text-blue-900 uppercase tracking-tighter">
                      {station}
                    </h3>
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-wider">bekati</span>
                  </div>
                  {hasFault && (
                    <span className="bg-red-600 text-white text-[7px] sm:text-[8px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 whitespace-nowrap ml-auto sm:ml-2">
                      <AlertTriangle size={8} /> Nosozlik
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto justify-end mt-1 sm:mt-0">
  <button
    onClick={() => loadBossArchive(station)}
    className="text-[8px] font-black bg-slate-700 text-white px-2 py-1 rounded-lg uppercase flex items-center gap-1 cursor-pointer hover:bg-slate-900"
  >
    <History size={9} /> Ishlar arxivi
  </button>
  <button
    onClick={() => setBossStationWorkers(station)}
    className="text-[8px] font-black bg-green-700 text-white px-2 py-1 rounded-lg uppercase flex items-center gap-1 cursor-pointer hover:bg-green-900"
  >
    👥 Ishchilar
  </button>
  <button
    onClick={() => setBossJournalStation(station)}
    className="text-[8px] font-black bg-purple-700 text-white px-2 py-1 rounded-lg uppercase flex items-center gap-1 cursor-pointer hover:bg-purple-900"
  >
    📔 Jurnal
  </button>
  <span className="text-[8px] font-black bg-blue-900 text-white px-2 py-1 rounded-lg uppercase">
    {sTasks.length} ta
  </span>
</div>
              </div>

              {/* ISHLAR JADVALI */}
              {sTasks.length > 0 ? (
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
<td className="p-2 sm:p-3 text-[9px] sm:text-xs leading-tight">
  <span>{task.name}</span>
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
              ) : (
                <div className="p-6 text-center text-slate-400 font-bold text-xs">
                  Bu bekatda hozircha ishlar yo'q
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* ISHCHILAR MODALI */}
      {bossStationWorkers && (
        <div className="fixed inset-0 bg-black/70 z-200 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b bg-slate-50">
              <h3 className="font-black text-slate-800 uppercase">
                👥 {bossStationWorkers} — Ishchilar
              </h3>
              <button onClick={() => setBossStationWorkers(null)} className="bg-slate-100 p-2 rounded-full cursor-pointer">
                <X size={20}/>
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3">
              {stationWorkers.length === 0 ? (
                <p className="text-center py-8 text-slate-400 font-bold">Ishchilar yo'q</p>
              ) : (
                stationWorkers.map(w => (
                  <div key={w.id} className="bg-white border-2 border-slate-100 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <User size={22} className="text-purple-700"/>
                    </div>
                    <div>
                      <p className="font-black text-base">{w.full_name}</p>
                      <p className="text-xs font-bold text-slate-500 mt-0.5">{ROLE_NAMES[w.role] || w.role}</p>
                      <p className="text-xs font-bold text-purple-700">📍 {w.station}</p>
                      {w.phone && (
                        <p className="text-xs font-bold text-green-700">📞 {w.phone}</p>
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
