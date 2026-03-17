"use client"
import { 
  ArrowLeft, Clock, User, CheckCircle, AlertTriangle, Loader2, Plus, Archive, ShieldCheck
} from 'lucide-react';

// Skeleton card
const SkeletonCard = () => (
  <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden animate-pulse">
    <div className="h-1 bg-slate-200"/>
    <div className="p-4 space-y-3">
      <div className="h-3 bg-slate-200 rounded-full w-24"/>
      <div className="h-4 bg-slate-200 rounded-full w-3/4"/>
      <div className="flex gap-2">
        <div className="h-6 bg-slate-200 rounded-lg w-20"/>
        <div className="h-6 bg-slate-200 rounded-lg w-28"/>
        <div className="h-6 bg-slate-200 rounded-lg w-16"/>
      </div>
    </div>
  </div>
);

export default function DashboardView({
  currentWorker,
  selectedStation,
  activeTasks,
  activeFaults,
  isLoadingTasks,
  setView,
  setMenuView,
  setSelectedArchiveViewDate,
  setShowTaskMenu,
  setConfirmFinishTask,
  setConfirmResolve,
  formatFullDateTime,
  supabase,
  onTaskConfirmed,
}) {
  const currentFault = activeFaults.find(f => f.station === selectedStation && 
    (f.status === 'active' || (f.status === 'resolved' && !f.confirmed)));
  const isBoshlig = currentWorker?.role === 'bekat_boshlig';
  const visibleTasks = activeTasks;

  const handleConfirmTask = async (taskId) => {
    const { error } = await supabase
      .from('tasks')
      .update({ 
        status: 'completed',
        confirmed: true,
        confirmed_by: currentWorker?.full_name,
        end_time: new Date().toISOString()
      })
      .eq('id', taskId);
    if (!error && onTaskConfirmed) onTaskConfirmed();
  };

  return (
    <div className="space-y-4 pb-28 sm:pb-6">

      {/* HEADER */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => {
            setMenuView('main');
            setView(currentWorker?.station ? 'menu' : 'station');
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-blue-900 text-blue-900 font-black text-[10px] uppercase hover:bg-blue-50 transition cursor-pointer bg-white shadow-sm"
        >
          <ArrowLeft size={14}/> Ortga
        </button>

        <div className="flex-1 text-center">
          <h2 className="font-black text-blue-900 text-sm uppercase tracking-tight">{selectedStation}</h2>
          <p className="text-[9px] text-slate-400 font-bold uppercase">
            {new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => { setView('archive'); setSelectedArchiveViewDate(null); }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[10px] uppercase cursor-pointer transition"
          >
            <Archive size={13}/> Arxiv
          </button>
          {!isBoshlig && (
            <button
              onClick={() => setShowTaskMenu(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-black text-[10px] uppercase cursor-pointer transition shadow-lg shadow-blue-900/20"
            >
              <Plus size={13}/> Ish qo'shish
            </button>
          )}
        </div>
      </div>

      {/* BOSHLIG' BANNERI */}
      {isBoshlig && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3.5 rounded-2xl flex items-center gap-3 shadow-lg">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <ShieldCheck size={18}/>
          </div>
          <div>
            <p className="font-black text-xs uppercase tracking-wide">Bekat boshlig'i rejimi</p>
            <p className="text-[10px] text-amber-100 mt-0.5">Bajarilgan ishlarni tasdiqlaysiz</p>
          </div>
        </div>
      )}

      {/* NOSOZLIK BANNER */}
      {currentFault && (
        <div className={`text-white p-4 rounded-3xl shadow-lg relative overflow-hidden ${
          currentFault.status === 'active' 
            ? 'bg-gradient-to-r from-red-600 to-red-500'
            : 'bg-gradient-to-r from-amber-600 to-amber-500'
        }`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-8 translate-x-8"/>
          <div className="flex items-start justify-between gap-3 relative">
            <div className="flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-xl shrink-0 mt-0.5">
                <AlertTriangle size={16}/>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase opacity-80 tracking-widest mb-0.5">
                  {currentFault.status === 'active' ? '⚠️ Faol nosozlik' : '⏳ Bartaraf etildi — tasdiq kutilmoqda'}
                </p>
                <p className="font-black text-sm leading-tight">
                  {currentFault.reason === "Boshqa" ? currentFault.custom_reason : currentFault.reason}
                </p>
                <p className="text-[10px] opacity-80 mt-1">👤 {currentFault.worker_name || "Noma'lum"}</p>
              </div>
            </div>

            {/* Ishchi: aktiv nosozlikni bartaraf etadi */}
            {!isBoshlig && currentWorker?.role !== 'boss' && currentWorker?.role !== 'admin' && 
             currentFault.status === 'active' && (
              <button onClick={() => setConfirmResolve(currentFault.id)}
                className="bg-white text-red-600 px-3 py-2 rounded-xl text-[10px] font-black shrink-0 hover:bg-red-50 transition cursor-pointer flex items-center gap-1">
                <CheckCircle size={12}/> Bartaraf etildi
              </button>
            )}

            {/* Ishchi: tasdiq kutmoqda */}
            {!isBoshlig && currentWorker?.role !== 'boss' && currentWorker?.role !== 'admin' && 
             currentFault.status === 'resolved' && !currentFault.confirmed && (
              <div className="bg-white/20 text-white px-3 py-2 rounded-xl text-[10px] font-black text-center leading-tight">
                ⏳ Tasdiq<br/>kutilmoqda
              </div>
            )}

            {/* Boshlig': resolved+unconfirmed tasdiqlaydi */}
            {isBoshlig && currentFault.status === 'resolved' && !currentFault.confirmed && (
              <button onClick={() => setConfirmResolve(currentFault.id)}
                className="bg-white text-amber-600 px-3 py-2 rounded-xl text-[10px] font-black shrink-0 hover:bg-amber-50 transition cursor-pointer flex items-center gap-1">
                <ShieldCheck size={12}/> Tasdiqlash
              </button>
            )}
          </div>
        </div>
      )}

      {/* ISHLAR SARLAVHA */}
      <div className="flex items-center gap-2">
        <div className="bg-orange-100 p-2 rounded-xl">
          <Clock size={14} className="text-orange-600"/>
        </div>
        <div>
          <h3 className="font-black text-slate-800 text-sm">Bugungi ishlar</h3>
          <p className="text-[9px] text-slate-400 font-bold">
            {isLoadingTasks ? 'Yuklanmoqda...' : `${visibleTasks.length} ta`}
          </p>
        </div>
      </div>

      {/* ISHLAR RO'YXATI — Skeleton */}
      {isLoadingTasks ? (
        <div className="grid gap-3">
          <SkeletonCard/>
          <SkeletonCard/>
          <SkeletonCard/>
        </div>
      ) : visibleTasks.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-slate-100">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-slate-400 font-black text-sm">Hozircha ishlar yo'q</p>
          {!isBoshlig && (
            <p className="text-slate-300 font-bold text-xs mt-1">Yangi ish qo'shish uchun + tugmasini bosing</p>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {visibleTasks.map((task, index) => {
            const isCompletedByWorker = task.completed_by_worker === true;
            const isFullyConfirmed = task.confirmed === true;
            let borderColor = 'border-slate-100';
            let topBarColor = 'bg-gradient-to-r from-orange-400 to-orange-500';
            if (isCompletedByWorker && !isFullyConfirmed) {
              borderColor = 'border-amber-200';
              topBarColor = 'bg-gradient-to-r from-amber-400 to-orange-400';
            }

            return (
              <div key={`task-${task.id}-${index}`}
                className={`bg-white rounded-3xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${borderColor}`}>
                <div className={`h-1 ${topBarColor}`}/>
                <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {!isCompletedByWorker && (
                        <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-lg text-[9px] font-black">
                          ⏳ Jarayonda
                        </span>
                      )}
                      {isCompletedByWorker && !isFullyConfirmed && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-lg text-[9px] font-black">
                          🕐 Tasdiqlash kutilmoqda
                        </span>
                      )}
                    </div>

                    <p className="font-black text-sm text-slate-800 leading-snug">{task.name}</p>

                    <div className="flex flex-wrap gap-1.5">
                      <span className="bg-blue-900 text-white px-2.5 py-1 rounded-lg text-[9px] font-black flex items-center gap-1">
                        <User size={9}/> {task.worker_id}
                      </span>
                      <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-lg text-[9px] font-black border border-orange-100 flex items-center gap-1">
                        <Clock size={9}/> {formatFullDateTime(task.start_time)}
                      </span>
                      {task.bolim && <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg text-[9px] font-black border border-purple-100">📁 {task.bolim}</span>}
                      {task.davriylik && <span className="bg-teal-50 text-teal-700 px-2.5 py-1 rounded-lg text-[9px] font-black border border-teal-100">🔄 {task.davriylik}</span>}
                      {task.jurnal && <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-[9px] font-black border border-indigo-100">📔 {task.jurnal}</span>}
                      {task.nsh && <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-[9px] font-black border border-blue-100">📋 {task.nsh}</span>}
                      {isBoshlig && isCompletedByWorker && task.completed_by && (
                        <span className="bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg text-[9px] font-black border border-slate-200">✍️ {task.completed_by}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto shrink-0">
                    {!isBoshlig && !isCompletedByWorker && (
                      <button onClick={() => setConfirmFinishTask(task.id)}
                        className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-xs transition active:scale-95 cursor-pointer uppercase shadow-lg shadow-green-600/20 flex items-center justify-center gap-2">
                        <CheckCircle size={14}/> Tugatish
                      </button>
                    )}
                    {!isBoshlig && isCompletedByWorker && !isFullyConfirmed && (
                      <div className="bg-amber-50 border-2 border-amber-200 text-amber-700 w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2">
                        <Clock size={14}/> Tasdiqlash jarayonida
                      </div>
                    )}
                    {isBoshlig && !isCompletedByWorker && (
                      <div className="bg-slate-100 text-slate-400 w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 cursor-not-allowed">
                        <Clock size={14}/> Jarayonda
                      </div>
                    )}
                    {isBoshlig && isCompletedByWorker && !isFullyConfirmed && (
                      <button onClick={() => handleConfirmTask(task.id)}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-xs transition active:scale-95 cursor-pointer uppercase shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2">
                        <ShieldCheck size={14}/> Tasdiqlash
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MOBIL PASTKI TUGMALAR */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden p-3 bg-white/95 backdrop-blur-md shadow-[0_-4px_24px_rgba(0,0,0,0.08)] z-10 flex gap-2">
        <button onClick={() => { setView('archive'); setSelectedArchiveViewDate(null); }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[10px] uppercase cursor-pointer transition">
          <Archive size={14}/> Arxiv
        </button>
        {!isBoshlig && (
          <button onClick={() => setShowTaskMenu(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-black text-[10px] uppercase cursor-pointer transition shadow-lg shadow-blue-900/20">
            <Plus size={14}/> Ish qo'shish
          </button>
        )}
      </div>
    </div>
  );
}