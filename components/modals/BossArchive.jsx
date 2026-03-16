"use client"
import { useState, useMemo } from 'react';
import { X, ArrowLeft, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const OY_NOMLARI = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];

export default function BossArchive({
  showBossArchive,
  bossArchive,
  bossArchiveDates,
  selectedArchiveDate, setSelectedArchiveDate,
  formatFullDateTime,
  onClose,
}) {
  const [selectedMonth, setSelectedMonth] = useState(null);

  const months = useMemo(() => {
    const set = new Set(bossArchiveDates.map(d => d.slice(0, 7)));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [bossArchiveDates]);

  const daysInMonth = useMemo(() => {
    if (!selectedMonth) return [];
    return bossArchiveDates.filter(d => d.startsWith(selectedMonth));
  }, [selectedMonth, bossArchiveDates]);

  const formatMonth = (ym) => {
    const [y, m] = ym.split('-');
    return `${OY_NOMLARI[parseInt(m) - 1]} ${y}`;
  };

  const handleBack = () => {
    if (selectedArchiveDate) setSelectedArchiveDate(null);
    else if (selectedMonth) setSelectedMonth(null);
  };

  const step = selectedArchiveDate ? 'records' : selectedMonth ? 'days' : 'months';

  const buildRows = (tasks) => tasks.map((t, i) => [
    i + 1,
    t.name,
    t.worker_id,
    t.bolim || '-',
    t.davriylik || '-',
    t.jurnal || '-',
    formatFullDateTime(t.start_time),
    formatFullDateTime(t.end_time),
  ]);

  const createPDF = (title, rows) => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(14);
    doc.text(`${showBossArchive} — Ishlar arxivi`, 14, 15);
    doc.setFontSize(10);
    doc.text(title, 14, 23);
    autoTable(doc, {
      startY: 30,
      head: [['#', 'Ish nomi', 'Bajardi', "Bo'lim", 'Davriylik', 'Jurnal', 'Boshlandi', 'Tugadi']],
      body: rows,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [239, 246, 255] },
      columnStyles: {
        1: { cellWidth: 70 },
      },
    });
    return doc;
  };

  const downloadDayPDF = () => {
    const tasks = bossArchive[selectedArchiveDate] || [];
    const title = new Date(selectedArchiveDate).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const doc = createPDF(`Sana: ${title}`, buildRows(tasks));
    doc.save(`${showBossArchive}-ishlar-${selectedArchiveDate}.pdf`);
  };

  const downloadMonthPDF = () => {
    const days = bossArchiveDates.filter(d => d.startsWith(selectedMonth));
    const allTasks = days.flatMap(d => bossArchive[d] || []);
    const doc = createPDF(`Oy: ${formatMonth(selectedMonth)}`, buildRows(allTasks));
    doc.save(`${showBossArchive}-ishlar-${selectedMonth}.pdf`);
  };

  const downloadAllPDF = () => {
    const allTasks = bossArchiveDates.flatMap(d => bossArchive[d] || []);
    const doc = createPDF('Barcha ishlar', buildRows(allTasks));
    doc.save(`${showBossArchive}-ishlar-barchasi.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-200 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col max-h-[80vh]">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {step !== 'months' && (
              <button onClick={handleBack} className="text-blue-900 font-black text-xs flex items-center gap-1 cursor-pointer hover:underline">
                <ArrowLeft size={14}/> {step === 'days' ? 'Oylar' : 'Kunlar'}
              </button>
            )}
            <h2 className="text-base font-black text-blue-900 uppercase">
              {step === 'months' && `📁 ${showBossArchive} — Ishlar arxivi`}
              {step === 'days' && `📅 ${formatMonth(selectedMonth)}`}
              {step === 'records' && `🗓 ${new Date(selectedArchiveDate).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}`}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {step === 'months' && (
              <button onClick={downloadAllPDF}
                className="bg-blue-900 text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer hover:bg-blue-800">
                <Download size={13}/> PDF
              </button>
            )}
            {step === 'days' && (
              <button onClick={downloadMonthPDF}
                className="bg-blue-900 text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer hover:bg-blue-800">
                <Download size={13}/> PDF
              </button>
            )}
            {step === 'records' && (
              <button onClick={downloadDayPDF}
                className="bg-blue-900 text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer hover:bg-blue-800">
                <Download size={13}/> PDF
              </button>
            )}
            <button onClick={onClose} className="bg-slate-100 p-2 rounded-full cursor-pointer">
              <X size={22}/>
            </button>
          </div>
        </div>

        {/* KONTENT */}
        <div className="overflow-y-auto p-5 space-y-2">
          {step === 'months' && (
            months.length === 0 ? (
              <p className="text-center py-8 text-slate-400 font-bold">Arxiv bo'sh</p>
            ) : months.map(m => {
              const count = bossArchiveDates.filter(d => d.startsWith(m))
                .reduce((sum, d) => sum + bossArchive[d].length, 0);
              return (
                <button key={m} onClick={() => setSelectedMonth(m)}
                  className="w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-blue-900 hover:text-white border-2 border-slate-100 flex justify-between items-center cursor-pointer group transition-all">
                  <span className="font-black">📅 {formatMonth(m)}</span>
                  <span className="text-xs font-bold opacity-60 group-hover:opacity-100">{count} ta ish</span>
                </button>
              );
            })
          )}

          {step === 'days' && daysInMonth.map(date => (
            <button key={date} onClick={() => setSelectedArchiveDate(date)}
              className="w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-blue-900 hover:text-white border-2 border-slate-100 flex justify-between items-center cursor-pointer group transition-all">
              <span className="font-black">🗓 {new Date(date).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
              <span className="text-xs font-bold opacity-60 group-hover:opacity-100">{bossArchive[date].length} ta ish</span>
            </button>
          ))}

          {step === 'records' && (bossArchive[selectedArchiveDate] || []).map(task => (
            <div key={task.id} className="p-4 rounded-2xl bg-slate-50 border-l-4 border-l-green-600">
              <p className="font-black text-sm">{task.name}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="bg-blue-900 text-white px-2 py-1 rounded-lg text-[9px] font-black">👤 {task.worker_id}</span>
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-lg text-[9px] font-black border border-orange-200">🕐 {formatFullDateTime(task.start_time)}</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-lg text-[9px] font-black border border-green-200">✅ {formatFullDateTime(task.end_time)}</span>
                {task.bolim && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-lg text-[9px] font-black border border-purple-200">📁 {task.bolim}</span>}
                {task.davriylik && <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-lg text-[9px] font-black border border-teal-200">🔄 {task.davriylik}</span>}
                {task.jurnal && <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-lg text-[9px] font-black border border-indigo-200">📔 {task.jurnal}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}