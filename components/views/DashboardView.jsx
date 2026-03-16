"use client"
import { 
  ArrowLeft, Clock, User, CheckCircle, AlertTriangle, Loader2, Plus, Archive
} from 'lucide-react';

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
}) {
  const currentFault = activeFaults.find(f => f.station === selectedStation);

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

        {/* Bekat nomi */}
        <div className="flex-1 text-center">
          <h2 className="font-black text-blue-900 text-sm uppercase tracking-tight">{selectedStation}</h2>
          <p className="text-[9px] text-slate-400 font-bold uppercase">
            {new Date().toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
        </div>

        {/* Desktop tugmalar */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => { setView('archive'); setSelectedArchiveViewDate(null); }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[10px] uppercase cursor-pointer transition"
          >
            <Archive size={13}/> Arxiv
          </button>
          <button
            onClick={() => setShowTaskMenu(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-black text-[10px] uppercase cursor-pointer transition shadow-lg shadow-blue-900/20"
          >
            <Plus size={13}/> Ish qo'shish
          </button>
        </div>
      </div>

      {/* NOSOZLIK BANNER */}
      {currentFault && (
        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-4 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-8 translate-x-8"/>
          <div className="flex items-start justify-between gap-3 relative">
            <div className="flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-xl shrink-0 mt-0.5">
                <AlertTriangle size={16}/>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-red-200 tracking-widest mb-0.5">⚠️ Faol nosozlik</p>
                <p className="font-black text-sm leading-tight">
                  {currentFault.reason === "Boshqa" ? currentFault.custom_reason : currentFault.reason}
                </p>
                <p className="text-[10px] text-red-200 mt-1">👤 {currentFault.worker_name || "Noma'lum"}</p>
              </div>
            </div>
            {currentWorker?.role !== 'boss' && currentWorker?.role !== 'admin' && (
              <button
                onClick={() => setConfirmResolve(currentFault.id)}
                className="bg-white text-red-600 px-3 py-2 rounded-xl text-[10px] font-black shrink-0 hover:bg-red-50 transition cursor-pointer flex items-center gap-1"
              >
                <CheckCircle size={12}/> Bartaraf etildi
              </button>
            )}
          </div>
        </div>
      )}

      {/* ISHLAR SARLAVHA */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-orange-100 p-2 rounded-xl">
            <Clock size={14} className="text-orange-600"/>
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-sm">Bugungi ishlar</h3>
            <p className="text-[9px] text-slate-400 font-bold">{activeTasks.length} ta aktiv ish</p>
          </div>
        </div>
      </div>

      {/* ISHLAR RO'YXATI */}
      {isLoadingTasks ? (
        <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-slate-100">
          <Loader2 className="animate-spin text-blue-900 mx-auto mb-3" size={28}/>
          <p className="text-slate-400 font-bold text-xs">Yuklanmoqda...</p>
        </div>
      ) : activeTasks.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-slate-100">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-slate-400 font-black text-sm">Hozircha ishlar yo'q</p>
          <p className="text-slate-300 font-bold text-xs mt-1">Yangi ish qo'shish uchun + tugmasini bosing</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {activeTasks.map((task, index) => (
            <div
              key={`active-${task.id}-${index}`}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all animate-in slide-in-from-left duration-300"
            >
              {/* Rangli chiziq */}
              <div className="h-1 bg-gradient-to-r from-orange-400 to-orange-500"/>
              
              <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2.5 flex-1">
                  {/* Ish nomi */}
                  <p className="font-black text-sm text-slate-800 leading-snug">{task.name}</p>
                  
                  {/* Teglar */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="bg-blue-900 text-white px-2.5 py-1 rounded-lg text-[9px] font-black flex items-center gap-1">
                      <User size={9}/> {task.worker_id}
                    </span>
                    <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-lg text-[9px] font-black border border-orange-100 flex items-center gap-1">
                      <Clock size={9}/> {formatFullDateTime(task.start_time)}
                    </span>
                    {task.bolim && (
                      <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg text-[9px] font-black border border-purple-100">
                        📁 {task.bolim}
                      </span>
                    )}
                    {task.davriylik && (
                      <span className="bg-teal-50 text-teal-700 px-2.5 py-1 rounded-lg text-[9px] font-black border border-teal-100">
                        🔄 {task.davriylik}
                      </span>
                    )}
                    {task.jurnal && (
                      <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-[9px] font-black border border-indigo-100">
                        📔 {task.jurnal}
                      </span>
                    )}
                    {task.nsh && (
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-[9px] font-black border border-blue-100">
                        📋 {task.nsh}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setConfirmFinishTask(task.id)}
                  className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-xs transition active:scale-95 cursor-pointer uppercase shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={14}/> Tugatish
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MOBIL PASTKI TUGMALAR */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden p-3 bg-white/95 backdrop-blur-md shadow-[0_-4px_24px_rgba(0,0,0,0.08)] z-10 flex gap-2">
        <button
          onClick={() => { setView('archive'); setSelectedArchiveViewDate(null); }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[10px] uppercase cursor-pointer transition"
        >
          <Archive size={14}/> Arxiv
        </button>
        <button
          onClick={() => setShowTaskMenu(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white font-black text-[10px] uppercase cursor-pointer transition shadow-lg shadow-blue-900/20"
        >
          <Plus size={14}/> Ish qo'shish
        </button>
      </div>
    </div>
  );
}