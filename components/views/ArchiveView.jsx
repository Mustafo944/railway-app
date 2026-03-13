"use client"
import { ArrowLeft, History } from 'lucide-react';

export default function ArchiveView({
  // Data
  selectedStation,
  archive,
  groupedArchive,
  selectedArchiveViewDate,
  // Actions
  setView,
  setSelectedArchiveViewDate,
  formatFullDateTime,
}) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      
      {/* ORTGA */}
      <button
        onClick={() => setView('dashboard')}
        className="bg-white text-blue-900 font-black flex items-center gap-2 px-6 py-3 rounded-2xl shadow border-2 border-blue-900 hover:bg-blue-50 transition cursor-pointer text-[10px] uppercase"
      >
        <ArrowLeft size={16}/> Ortga
      </button>

      {/* SARLAVHA */}
      <div className="flex items-center justify-between">
        {selectedArchiveViewDate && (
          <button
            onClick={() => setSelectedArchiveViewDate(null)}
            className="text-blue-900 font-black text-xs flex items-center gap-1 cursor-pointer hover:underline"
          >
            <ArrowLeft size={14}/> Sanalar
          </button>
        )}
        <h2 className="text-2xl font-black flex items-center gap-2 text-slate-800 uppercase tracking-tighter leading-none">
          <History className="text-blue-900" /> Ishlar arxivi: {selectedStation}
        </h2>
      </div>

      {/* KONTENT */}
      {archive.length === 0 ? (
        <div className="bg-white p-10 rounded-4xl text-center text-slate-400 font-black">
          Arxivda ishlar yo'q
        </div>
      ) : !selectedArchiveViewDate ? (
        // SANALAR RO'YXATI
        groupedArchive.map(([sana, ishlar]) => (
          <button
            key={sana}
            onClick={() => setSelectedArchiveViewDate(sana)}
            className="w-full text-left p-4 rounded-2xl bg-white hover:bg-blue-900 hover:text-white border-2 border-slate-100 flex justify-between items-center cursor-pointer group transition-all shadow-sm"
          >
            <span className="font-black">
              📅 {new Date(sana).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
            <span className="text-xs font-bold opacity-60 group-hover:opacity-100">
              {ishlar.length} ta ish
            </span>
          </button>
        ))
      ) : (
        // TANLANGAN SANADAGI ISHLAR
        <div className="space-y-3">
{(groupedArchive.find(([sana]) => sana === selectedArchiveViewDate)?.[1] || []).map((item, index) => (
<div
  key={`archive-${item.id}-${index}`}
  className="bg-white p-5 rounded-3xl border-l-4 border-l-green-600 shadow-md text-slate-800"
>
  <p className="font-black text-sm leading-tight">{item.name}</p>
  <div className="mt-2 flex flex-wrap gap-2">
    <span className="bg-blue-900 text-white px-2 py-1 rounded-lg text-[9px] font-black">
      👤 {item.worker_id}
    </span>
    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-lg text-[9px] font-black border border-orange-200">
      🕐 {formatFullDateTime(item.start_time)}
    </span>
    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-lg text-[9px] font-black border border-green-200">
      ✅ {formatFullDateTime(item.end_time)}
    </span>
    {item.bolim && (
      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-lg text-[9px] font-black border border-purple-200">
        📁 {item.bolim}
      </span>
    )}
    {item.davriylik && (
      <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-lg text-[9px] font-black border border-teal-200">
        🔄 {item.davriylik}
      </span>
    )}
    {item.jurnal && (
      <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-lg text-[9px] font-black border border-indigo-200">
        📔 {item.jurnal}
      </span>
    )}
  </div>
</div>
          ))}
        </div>
      )}
    </div>
  );
}