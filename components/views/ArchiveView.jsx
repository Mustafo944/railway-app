// railway-app/components/views/ArchiveView.jsx
import { ArrowLeft, History } from 'lucide-react';
import { formatFullDateTime } from '@/lib/utils';

export default function ArchiveView({
  archive, selectedStation, selectedArchiveViewDate,
  groupedArchive, onBack, onSelectDate
}) {
  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <button
        onClick={onBack}
        className="bg-white text-blue-900 font-black flex items-center gap-2 px-6 py-3 rounded-2xl shadow border-2 border-blue-900 hover:bg-blue-50 transition cursor-pointer text-[10px] uppercase"
      >
        <ArrowLeft size={16}/> Ortga
      </button>

      <div className="flex items-center justify-between">
        {selectedArchiveViewDate && (
          <button
            onClick={() => onSelectDate(null)}
            className="text-blue-900 font-black text-xs flex items-center gap-1 cursor-pointer hover:underline"
          >
            <ArrowLeft size={14}/> Sanalar
          </button>
        )}
        <h2 className="text-2xl font-black flex items-center gap-2 text-slate-800 uppercase tracking-tighter leading-none">
          <History className="text-blue-900" /> Ishlar arxivi: {selectedStation}
        </h2>
      </div>

      {archive.length === 0 ? (
        <div className="bg-white p-10 rounded-4xl text-center text-slate-400 font-black">
          Arxivda ishlar yo'q
        </div>
      ) : !selectedArchiveViewDate ? (
        groupedArchive.map(([sana, ishlar]) => (
          <button
            key={sana}
            onClick={() => onSelectDate(sana)}
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
        <div className="space-y-3">
          {(groupedArchive.find(([sana]) => sana === selectedArchiveViewDate)?.[1] || []).map(item => (
            <div key={`archive-${item.id}`} className="bg-white p-6 rounded-[32px] border-l-8 border-l-green-600 shadow-md text-slate-800">
              <p className="font-black text-lg tracking-tight leading-tight">{item.name}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-[10px] font-black uppercase tracking-tighter opacity-70">
                <span className="text-blue-900">Bajardi: {item.worker_id}</span>
                <span>Boshlandi: {formatFullDateTime(item.start_time)}</span>
                <span>Tugadi: {formatFullDateTime(item.end_time)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}