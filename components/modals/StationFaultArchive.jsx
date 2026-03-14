"use client"
import { useState, useMemo } from 'react';
import { X, ArrowLeft } from 'lucide-react';

const OY_NOMLARI = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];

export default function StationFaultArchive({
  selectedStation,
  stationFaultArchiveDates,
  stationFaultArchiveGrouped,
  selectedStationFaultDate, setSelectedStationFaultDate,
  formatFullDateTime,
  onClose,
}) {
  const [selectedMonth, setSelectedMonth] = useState(null);

  const months = useMemo(() => {
    const set = new Set(stationFaultArchiveDates.map(d => d.slice(0, 7)));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [stationFaultArchiveDates]);

  const daysInMonth = useMemo(() => {
    if (!selectedMonth) return [];
    return stationFaultArchiveDates.filter(d => d.startsWith(selectedMonth));
  }, [selectedMonth, stationFaultArchiveDates]);

  const formatMonth = (ym) => {
    const [y, m] = ym.split('-');
    return `${OY_NOMLARI[parseInt(m) - 1]} ${y}`;
  };

  const handleBack = () => {
    if (selectedStationFaultDate) { setSelectedStationFaultDate(null); }
    else if (selectedMonth) { setSelectedMonth(null); }
  };

  const step = selectedStationFaultDate ? 'records' : selectedMonth ? 'days' : 'months';

  return (
    <div className="fixed inset-0 bg-black/70 z-200 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {step !== 'months' && (
              <button onClick={handleBack} className="text-red-700 font-black text-xs flex items-center gap-1 cursor-pointer hover:underline">
                <ArrowLeft size={14}/> {step === 'days' ? 'Oylar' : 'Kunlar'}
              </button>
            )}
            <h2 className="text-lg font-black text-red-700 uppercase">
              {step === 'months' && `📁 ${selectedStation} — Nosozliklar arxivi`}
              {step === 'days' && `📅 ${formatMonth(selectedMonth)}`}
              {step === 'records' && `🗓 ${new Date(selectedStationFaultDate).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}`}
            </h2>
          </div>
          <button onClick={onClose} className="bg-slate-100 p-2 rounded-full cursor-pointer"><X size={22}/></button>
        </div>

        <div className="overflow-y-auto p-5 space-y-2">
          {step === 'months' && (
            months.length === 0 ? (
              <p className="text-center py-8 text-slate-400 font-bold">Nosozliklar yo'q</p>
            ) : months.map(m => {
              const count = stationFaultArchiveDates.filter(d => d.startsWith(m)).reduce((sum, d) => sum + stationFaultArchiveGrouped[d].length, 0);
              return (
                <button key={m} onClick={() => setSelectedMonth(m)}
                  className="w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-red-600 hover:text-white border-2 border-slate-100 flex justify-between items-center cursor-pointer group transition-all">
                  <span className="font-black">📅 {formatMonth(m)}</span>
                  <span className="text-xs font-bold opacity-60 group-hover:opacity-100">{count} ta nosozlik</span>
                </button>
              );
            })
          )}

          {step === 'days' && daysInMonth.map(date => (
            <button key={date} onClick={() => setSelectedStationFaultDate(date)}
              className="w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-red-600 hover:text-white border-2 border-slate-100 flex justify-between items-center cursor-pointer group transition-all">
              <span className="font-black">🗓 {new Date(date).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
              <span className="text-xs font-bold opacity-60 group-hover:opacity-100">{stationFaultArchiveGrouped[date].length} ta nosozlik</span>
            </button>
          ))}

          {step === 'records' && stationFaultArchiveGrouped[selectedStationFaultDate].map(f => {
            const duration = f.resolved_at ? Math.floor((new Date(f.resolved_at) - new Date(f.created_at)) / 60000) : null;
            return (
              <div key={f.id} className={`p-4 rounded-2xl border-l-4 ${f.status === 'active' ? 'bg-red-50 border-l-red-500' : 'bg-slate-50 border-l-green-500'}`}>
                <div className="flex justify-between items-start">
                  <p className="font-black text-sm">{f.reason === 'Boshqa' ? f.custom_reason : f.reason}</p>
                  <span className={`text-[9px] font-black px-2 py-1 rounded-full ${f.status === 'active' ? 'bg-red-600 text-white animate-pulse' : 'bg-green-100 text-green-700'}`}>
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
          })}
        </div>
      </div>
    </div>
  );
}