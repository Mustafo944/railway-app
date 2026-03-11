// railway-app/components/views/BossDashboard.jsx
import { MapPin, ShieldCheck, BarChart, History, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatFullDateTime, getFaultTimer } from '@/lib/utils';

const BEKATLAR = ["Malikobod", "Qizil tepa", "Elobod", "To'dako'l", "Azizobod", "Farovon", "Buxoro-1", "METS", "Poykent", "Murg'ak", "Yakkatut", "Blokpost", "Qorako'l", "Olot", "Xo'jadavlat", "Yangiobod", "Navbahor", "Yaxshilik", "Parvoz", "Qorli tog'", "Kiyikli", "Xizrbobo", "Jayhun", "Davtepa", "Turon", "Kogon", "Qorovul bozor", "PPS"];

export default function BossDashboard({
  allTasksForBoss, activeFaults, tasksByStation,
  onShowFaultStats, onLoadFaultArchive, onLoadBossArchive
}) {
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
                    <p className="text-[10px] font-black uppercase opacity-70 leading-none mb-1">Faol nosozlik:</p>
                    <p className="font-black text-sm uppercase leading-tight">
  {fault.station} — {fault.reason === "Boshqa" ? fault.custom_reason : fault.reason}
</p>
<p className="text-xs text-yellow-200 mt-0.5">👤 {fault.worker_name || "Noma'lum"}</p>
<p className="text-xs text-yellow-200 mt-1">⏱ {getFaultTimer(fault.created_at)}</p>
                  </div>
                </div>
                <button
                  onClick={onShowFaultStats}
                  className="bg-red-900/50 hover:bg-red-900 p-2 rounded-xl transition-colors cursor-pointer"
                >
                  <BarChart size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SARLAVHA */}
      <div className="bg-white p-6 rounded-[32px] shadow-xl border-b-8 border-blue-900 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
          <ShieldCheck className="text-blue-900"/> Nazorat Paneli
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onShowFaultStats}
            className="bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold cursor-pointer"
          >
            <BarChart size={18} /> Nosozliklar
          </button>
          <button
            onClick={onLoadFaultArchive}
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

      {/* STATISTIKA */}
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

      {/* BEKATLAR */}
      <div className="grid gap-8">
        {BEKATLAR.map(station => {
          const sTasks = tasksByStation[station] || [];
          const hasFault = activeFaults.some(f => f.station === station && f.status === "active");

          return (
            <div key={station} className={`bg-white rounded-[32px] shadow-lg overflow-hidden border ${
              hasFault ? 'border-red-500 border-2' : 'border-slate-200'
            }`}>
              <div className={`p-5 border-b flex justify-between items-center ${hasFault ? 'bg-red-50' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-blue-900 flex items-center gap-2 uppercase tracking-tighter">
                    <MapPin size={20}/> {station} bekati
                  </h3>
                  {hasFault && (
                    <span className="bg-red-600 text-white text-[8px] px-2 py-1 rounded-full flex items-center gap-1">
                      <AlertTriangle size={12} /> Nosozlik bor!
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onLoadBossArchive(station)}
                    className="text-[10px] font-black bg-slate-700 text-white px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 cursor-pointer hover:bg-slate-900"
                  >
                    <History size={12}/> Arxiv
                  </button>
                  <span className="text-[10px] font-black bg-blue-900 text-white px-3 py-1 rounded-full uppercase tracking-widest">
                    Bugun: {sTasks.length} ta
                  </span>
                </div>
              </div>

              {sTasks.length > 0 ? (
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
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${
                              task.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-orange-100 text-orange-700 animate-pulse'
                            }`}>
                              {task.status === 'completed' ? 'Bajarildi' : 'Jarayonda'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 font-bold">
                  Bu bekatda hozircha ishlar yo'q
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}