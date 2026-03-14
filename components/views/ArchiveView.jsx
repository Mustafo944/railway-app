"use client"
import { useState, useMemo } from 'react';
import { ArrowLeft, History } from 'lucide-react';

const OY_NOMLARI = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];

export default function ArchiveView({
  selectedStation,
  archive,
  groupedArchive,
  selectedArchiveViewDate,
  setView,
  setSelectedArchiveViewDate,
  formatFullDateTime,
}) {
  const [selectedMonth, setSelectedMonth] = useState(null);

  const months = useMemo(() => {
    const set = new Set(groupedArchive.map(([sana]) => sana.slice(0, 7)));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [groupedArchive]);

  const daysInMonth = useMemo(() => {
    if (!selectedMonth) return [];
    return groupedArchive.filter(([sana]) => sana.startsWith(selectedMonth));
  }, [selectedMonth, groupedArchive]);

  const formatMonth = (ym) => {
    const [y, m] = ym.split('-');
    return `${OY_NOMLARI[parseInt(m) - 1]} ${y}`;
  };

  const handleBack = () => {
    if (selectedArchiveViewDate) { setSelectedArchiveViewDate(null); }
    else if (selectedMonth) { setSelectedMonth(null); }
  };

  const step = selectedArchiveViewDate ? 'records' : selectedMonth ? 'days' : 'months';

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">

      {/* ORTGA */}
      <button
        onClick={() => step !== 'months' ? handleBack() : setView('dashboard')}
        className="bg-white text-blue-900 font-black flex items-center gap-2 px-6 py-3 rounded-2xl shadow border-2 border-blue-900 hover:bg-blue-50 transition cursor-pointer text-[10px] uppercase"
      >
        <ArrowLeft size={16}/>
        {step === 'months' ? 'Ortga' : step === 'days' ? 'Oylar' : 'Kunlar'}
      </button>

      {/* SARLAVHA */}
      <h2 className="text-2xl font-black flex items-center gap-2 text-slate-800 uppercase tracking-tighter leading-none">
        <History className="text-blue-900" />
        {step === 'months' && `Ishlar arxivi: ${selectedStation}`}
        {step === 'days' && `📅 ${formatMonth(selectedMonth)}`}
        {step === 'records' && `🗓 ${new Date(selectedArchiveViewDate).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}`}
      </h2>

      {/* KONTENT */}
      {archive.length === 0 ? (
        <div className="bg-white p-10 rounded-4xl text-center text-slate-400 font-black">Arxivda ishlar yo'q</div>

      ) : step === 'months' ? (
        months.map(m => {
          const count = groupedArchive.filter(([sana]) => sana.startsWith(m)).reduce((sum, [, ishlar]) => sum + ishlar.length, 0);
          return (
            <button key={m} onClick={() => setSelectedMonth(m)}
              className="w-full text-left p-4 rounded-2xl bg-white hover:bg-blue-900 hover:text-white border-2 border-slate-100 flex justify-between items-center cursor-pointer group transition-all shadow-sm">
              <span className="font-black">📅 {formatMonth(m)}</span>
              <span className="text-xs font-bold opacity-60 group-hover:opacity-100">{count} ta ish</span>
            </button>
          );
        })

      ) : step === 'days' ? (
        daysInMonth.map(([sana, ishlar]) => (
          <button key={sana} onClick={() => setSelectedArchiveViewDate(sana)}
            className="w-full text-left p-4 rounded-2xl bg-white hover:bg-blue-900 hover:text-white border-2 border-slate-100 flex justify-between items-center cursor-pointer group transition-all shadow-sm">
            <span className="font-black">🗓 {new Date(sana).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
            <span className="text-xs font-bold opacity-60 group-hover:opacity-100">{ishlar.length} ta ish</span>
          </button>
        ))

      ) : (
        <div className="space-y-3">
          {(groupedArchive.find(([sana]) => sana === selectedArchiveViewDate)?.[1] || []).map((item, index) => (
            <div key={`archive-${item.id}-${index}`} className="bg-white p-5 rounded-3xl border-l-4 border-l-green-600 shadow-md text-slate-800">
              <p className="font-black text-sm leading-tight">{item.name}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="bg-blue-900 text-white px-2 py-1 rounded-lg text-[9px] font-black">👤 {item.worker_id}</span>
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-lg text-[9px] font-black border border-orange-200">🕐 {formatFullDateTime(item.start_time)}</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-lg text-[9px] font-black border border-green-200">✅ {formatFullDateTime(item.end_time)}</span>
                {item.bolim && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-lg text-[9px] font-black border border-purple-200">📁 {item.bolim}</span>}
                {item.davriylik && <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-lg text-[9px] font-black border border-teal-200">🔄 {item.davriylik}</span>}
                {item.jurnal && <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-lg text-[9px] font-black border border-indigo-200">📔 {item.jurnal}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}