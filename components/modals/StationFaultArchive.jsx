// railway-app/components/modals/StationFaultArchive.jsx
import { X, ArrowLeft } from 'lucide-react';
import { formatFullDateTime } from '@/lib/utils';

export default function StationFaultArchive({
  selectedStation, stationFaultArchiveDates, stationFaultArchiveGrouped,
  selectedStationFaultDate, onSelectDate, onClose
}) {
  return (
    <div className="fixed inset-0 bg-black/70 z-200 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col max-h-[80vh]">

        {/* HEADER */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100">
          <div>
            {selectedStationFaultDate && (
              <button
                onClick={() => onSelectDate(null)}
                className="text-red-700 font-black text-xs flex items-center gap-1 cursor-pointer hover:underline mb-1"
              >
                <ArrowLeft size={14}/> Sanalar
              </button>
            )}
            <h2 className="text-xl font-black text-red-700 uppercase">
              {selectedStation} — Nosozliklar arxivi
            </h2>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-100 p-2 rounded-full cursor-pointer hover:bg-slate-200"
          >
            <X size={24}/>
          </button>
        </div>

        {/* KONTENT */}
        <div className="overflow-y-auto p-6 space-y-3">
          {!selectedStationFaultDate ? (
            stationFaultArchiveDates.length === 0 ? (
              <p className="text-center py-8 text-slate-400 font-bold">Nosozliklar yo'q</p>
            ) : (
              stationFaultArchiveDates.map(date => (
                <button
                  key={date}
                  onClick={() => onSelectDate(date)}
                  className="w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-red-600 hover:text-white border-2 border-slate-100 flex justify-between items-center cursor-pointer group transition-all"
                >
                  <span className="font-black">
                    📅 {new Date(date).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                  <span className="text-xs font-bold opacity-60 group-hover:opacity-100">
                    {stationFaultArchiveGrouped[date].length} ta nosozlik
                  </span>
                </button>
              ))
            )
          ) : (
            stationFaultArchiveGrouped[selectedStationFaultDate].map(f => {
              const duration = f.resolved_at
                ? Math.floor((new Date(f.resolved_at) - new Date(f.created_at)) / 60000)
                : null;
              return (
                <div key={f.id} className={`p-4 rounded-2xl border-l-4 ${
                  f.status === 'active'
                    ? 'bg-red-50 border-l-red-500'
                    : 'bg-slate-50 border-l-green-500'
                }`}>
                  <div className="flex justify-between items-start">
<p className="font-black text-sm">{f.reason === 'Boshqa' ? f.custom_reason : f.reason}</p>
<p className="text-xs text-blue-700 font-black mt-0.5">👤 {f.worker_name || "Noma'lum"}</p>
<span className={`text-[9px] font-black px-2 py-1 rounded-full
                      f.status === 'active'
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-green-100 text-green-700'
                    }`}>
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
  );
}