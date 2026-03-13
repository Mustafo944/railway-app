"use client"
import { X, ArrowLeft } from 'lucide-react';

export default function FaultArchive({
  faultArchiveDates,
  faultArchiveGrouped,
  selectedFaultDate, setSelectedFaultDate,
  formatFullDateTime,
  onClose,
}) {
  return (
    <div className="fixed inset-0 bg-black/70 z-200 flex items-center justify-center p-4">
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
          <button onClick={onClose} className="bg-slate-100 p-2 rounded-full cursor-pointer">
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
  );
}