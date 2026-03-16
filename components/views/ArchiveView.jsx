"use client"
import { useState, useMemo } from 'react';
import { ArrowLeft, History, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    if (selectedArchiveViewDate) setSelectedArchiveViewDate(null);
    else if (selectedMonth) setSelectedMonth(null);
  };

  const step = selectedArchiveViewDate ? 'records' : selectedMonth ? 'days' : 'months';

  // PDF yordamchi
  const buildRows = (items) => items.map((t, i) => [
    i + 1,
    t.name,
    t.worker_id,
    t.bolim || '-',
    t.davriylik || '-',
    t.jurnal || '-',
    formatFullDateTime(t.start_time),
    formatFullDateTime(t.end_time),
  ]);

  const createPDF = (title) => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(14);
    doc.text(`${selectedStation} — Ishlar arxivi`, 14, 15);
    doc.setFontSize(10);
    doc.text(title, 14, 23);
    return doc;
  };

  const addTable = (doc, rows) => {
    autoTable(doc, {
      startY: 30,
      head: [['#', 'Ish nomi', 'Bajardi', "Bo'lim", 'Davriylik', 'Jurnal', 'Boshlandi', 'Tugadi']],
      body: rows,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [239, 246, 255] },
      columnStyles: { 1: { cellWidth: 70 } },
    });
    return doc;
  };

  const downloadAllPDF = () => {
    const all = groupedArchive.flatMap(([, ishlar]) => ishlar);
    const doc = createPDF('Barcha ishlar');
    addTable(doc, buildRows(all)).save(`${selectedStation}-ishlar-barchasi.pdf`);
  };

  const downloadMonthPDF = () => {
    const all = daysInMonth.flatMap(([, ishlar]) => ishlar);
    const doc = createPDF(`Oy: ${formatMonth(selectedMonth)}`);
    addTable(doc, buildRows(all)).save(`${selectedStation}-ishlar-${selectedMonth}.pdf`);
  };

  const downloadDayPDF = () => {
    const all = groupedArchive.find(([sana]) => sana === selectedArchiveViewDate)?.[1] || [];
    const label = new Date(selectedArchiveViewDate).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const doc = createPDF(`Sana: ${label}`);
    addTable(doc, buildRows(all)).save(`${selectedStation}-ishlar-${selectedArchiveViewDate}.pdf`);
  };

  return (
    <div className="space-y-4 animate-in slide-in-from-right duration-500">

      {/* YUQORI QISM */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => step !== 'months' ? handleBack() : setView('dashboard')}
          className="bg-white text-blue-900 font-black flex items-center gap-2 px-6 py-3 rounded-2xl shadow border-2 border-blue-900 hover:bg-blue-50 transition cursor-pointer text-[10px] uppercase"
        >
          <ArrowLeft size={16}/>
          {step === 'months' ? 'Ortga' : step === 'days' ? 'Oylar' : 'Kunlar'}
        </button>

        {/* PDF tugmasi */}
        {archive.length > 0 && (
          <button
            onClick={step === 'months' ? downloadAllPDF : step === 'days' ? downloadMonthPDF : downloadDayPDF}
            className="bg-blue-900 text-white px-4 py-3 rounded-2xl font-black text-xs flex items-center gap-2 cursor-pointer hover:bg-blue-800"
          >
            <Download size={14}/> PDF
          </button>
        )}
      </div>

      {/* SARLAVHA */}
      <h2 className="text-xl font-black flex items-center gap-2 text-slate-800 uppercase tracking-tighter leading-none">
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
        <div className="space-y-3 pb-6">
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