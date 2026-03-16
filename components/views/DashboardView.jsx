"use client"
import { 
  ArrowLeft, Plus, Clock, User, CheckCircle, AlertTriangle, Loader2
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
    <div className="space-y-6">
      
      {/* YUQORI QISM */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        <button
          onClick={() => {
            setMenuView('main');
            setView(currentWorker?.station ? 'menu' : 'station');
          }}
          className="bg-white text-blue-900 font-black flex items-center gap-2 px-6 py-3 rounded-2xl shadow border-2 border-blue-900 hover:bg-blue-50 transition cursor-pointer text-[10px] uppercase"
        >
          <ArrowLeft size={16}/> Ortga
        </button>

        {currentFault && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-red-100 px-4 py-2 rounded-xl border border-red-300">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-red-700 uppercase">Bu bekatda nosozlik bor!</span>
                <span className="text-[10px] font-bold text-red-600">
                  {currentFault.reason === "Boshqa" ? currentFault.custom_reason : currentFault.reason}
                </span>
                <span className="text-[10px] font-bold text-slate-600">
                  👤 {currentFault.worker_name || "Noma'lum"}
                </span>
              </div>
            </div>
            {currentWorker?.role !== 'boss' && currentWorker?.role !== 'admin' && (
              <button
                onClick={() => setConfirmResolve(currentFault.id)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1"
              >
                <CheckCircle size={14} /> Bartaraf etildi
              </button>
            )}
          </div>
        )}

        {/* TUGMALAR — mobilda pastda, desktopda o'ngda */}
        <div className="fixed bottom-0 left-0 right-0 sm:static flex gap-2 font-black uppercase p-3 bg-white/95 backdrop-blur sm:p-0 sm:bg-transparent sm:ml-auto shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:shadow-none z-10">
          <button
            onClick={() => { setView('archive'); setSelectedArchiveViewDate(null); }}
            className="bg-slate-200 text-slate-700 px-4 py-3 rounded-2xl cursor-pointer flex-1 sm:flex-none text-[10px]"
          >
            📂 Ishlar arxivi
          </button>
          <button
            onClick={() => setShowTaskMenu(true)}
            className="bg-blue-900 text-white px-4 py-3 rounded-2xl shadow-xl cursor-pointer flex-1 sm:flex-none text-[10px]"
          >
            + Ish qo'shish
          </button>
        </div>
      </div>

      {/* BUGUNGI ISHLAR */}
      <div className="grid gap-4 pb-24 sm:pb-0">
        <h3 className="font-black text-orange-600 flex items-center gap-2 text-sm uppercase tracking-widest leading-none">
          <Clock size={16}/> {new Date().toLocaleDateString('uz-UZ')} — Bugungi ishlar ({activeTasks.length})
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
            <div
              key={`active-${task.id}-${index}`}
              className="bg-white p-5 rounded-3xl shadow-lg border-l-4 border-l-orange-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in slide-in-from-left duration-300"
            >
              <div className="space-y-2 flex-1">
                {/* ISH NOMI */}
                <p className="font-black text-sm text-slate-800 leading-tight">{task.name}</p>
                
                {/* TEGLAR */}
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-900 text-white px-2 py-1 rounded-lg text-[9px] font-black flex items-center gap-1">
                    <User size={10}/> {task.worker_id}
                  </span>
                  <span className="bg-orange-100 text-orange-900 px-2 py-1 rounded-lg text-[9px] font-black border border-orange-200 flex items-center gap-1">
                    <Clock size={10}/> {formatFullDateTime(task.start_time)}
                  </span>
                  {task.bolim && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-lg text-[9px] font-black border border-purple-200">
                      📁 {task.bolim}
                    </span>
                  )}
                  {task.davriylik && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-lg text-[9px] font-black border border-green-200">
                      🔄 {task.davriylik}
                    </span>
                  )}
{task.nsh && (
  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-[9px] font-black border border-blue-200">
    📋 {task.nsh}
  </span>
)}
                </div>
              </div>

              <button
                onClick={() => setConfirmFinishTask(task.id)}
                className="bg-green-600 text-white w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-sm hover:bg-green-700 transition active:scale-95 cursor-pointer uppercase"
              >
                ✅ Tugatish
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}