// railway-app/components/modals/BossArchive.jsx
import { X, ArrowLeft } from 'lucide-react';
import { formatFullDateTime } from '@/lib/utils';

export default function BossArchive({
  showBossArchive, bossArchive, bossArchiveDates,
  selectedArchiveDate, onSelectDate, onClose
}) {
  return (
    <div className="fixed inset-0 bg-black/70 z-200 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col max-h-[80vh]">

        {/* HEADER */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100">
          <div>
            {selectedArchiveDate && (
              <button
                onClick={() => onSelectDate(null)}
                className="text-blue-900 font-black text-xs flex items-center gap-1 cursor-pointer hover:underline mb-1"
              >
                <ArrowLeft size={14}/> Sanalar
              </button>
            )}
            <h2 className="text-xl font-black text-blue-900 uppercase">
              {showBossArchive} — Arxiv
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
          {!selectedArchiveDate ? (
            bossArchiveDates.length === 0 ? (
              <p className="text-center py-8 text-slate-400 font-bold">Arxiv bo'sh</p>
            ) : (
              bossArchiveDates.map(date => (
                <button
                  key={date}
                  onClick={() => onSelectDate(date)}
                  className="w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-blue-900 hover:text-white border-2 border-slate-100 flex justify-between items-center cursor-pointer group transition-all"
                >
                  <span className="font-black">
                    📅 {new Date(date).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                  <span className="text-xs font-bold opacity-60 group-hover:opacity-100">
                    {bossArchive[date].length} ta ish
                  </span>
                </button>
              ))
            )
          ) : (
            <>
              <button
                onClick={() => onSelectDate(null)}
                className="text-blue-900 font-black text-xs flex items-center gap-1 cursor-pointer hover:underline mb-2"
              >
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
  );
}