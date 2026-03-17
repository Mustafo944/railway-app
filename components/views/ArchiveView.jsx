"use client"
import { useState, useMemo } from 'react';
import { ArrowLeft, History, Download, ChevronRight } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const OY_NOMLARI = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];

// Skeleton
const SkeletonRow = () => (
  <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="h-4 bg-slate-200 rounded-full w-32"/>
      <div className="h-4 bg-slate-200 rounded-full w-16"/>
    </div>
  </div>
);

const SkeletonRecord = () => (
  <div className="bg-white p-5 rounded-3xl border-l-4 border-l-slate-200 shadow-sm animate-pulse space-y-2">
    <div className="h-4 bg-slate-200 rounded-full w-3/4"/>
    <div className="flex gap-2">
      <div className="h-6 bg-slate-200 rounded-lg w-20"/>
      <div className="h-6 bg-slate-200 rounded-lg w-28"/>
      <div className="h-6 bg-slate-200 rounded-lg w-24"/>
    </div>
  </div>
);

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

  const formatDateShort = (sana) => {
    const [y, m, d] = sana.split('-');
    return `${d}.${m}.${y}`;
  };

  const handleBack = () => {
    if (selectedArchiveViewDate) setSelectedArchiveViewDate(null);
    else if (selectedMonth) setSelectedMonth(null);
  };

  const step = selectedArchiveViewDate ? 'records' : selectedMonth ? 'days' : 'months';

  const buildRows = (items) => items.map((t, i) => [
    i + 1, t.name, t.worker_id,
    t.bolim || '-', t.davriylik || '-', t.jurnal || '-',
    formatFullDateTime(t.start_time), formatFullDateTime(t.end_time),
    t.confirmed_by || '-',
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
      head: [['#', 'Ish nomi', 'Bajardi', "Bo'lim", 'Davriylik', 'Jurnal', 'Boshlandi', 'Tugadi', 'Tasdiqladi']],
      body: rows,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [239, 246, 255] },
      columnStyles: { 1: { cellWidth: 60 } },
    });
    return doc;
  };

  const downloadAllPDF = () => {
    const all = groupedArchive.flatMap(([, ishlar]) => ishlar);
    addTable(createPDF('Barcha ishlar'), buildRows(all)).save(`${selectedStation}-ishlar-barchasi.pdf`);
  };
  const downloadMonthPDF = () => {
    const all = daysInMonth.flatMap(([, ishlar]) => ishlar);
    addTable(createPDF(`Oy: ${formatMonth(selectedMonth)}`), buildRows(all)).save(`${selectedStation}-ishlar-${selectedMonth}.pdf`);
  };
  const downloadDayPDF = () => {
    const all = groupedArchive.find(([sana]) => sana === selectedArchiveViewDate)?.[1] || [];
    addTable(createPDF(`Sana: ${formatDateShort(selectedArchiveViewDate)}`), buildRows(all)).save(`${selectedStation}-ishlar-${selectedArchiveViewDate}.pdf`);
  };

  const currentRecords = groupedArchive.find(([sana]) => sana === selectedArchiveViewDate)?.[1] || [];

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => step !== 'months' ? handleBack() : setView('dashboard')}
          className="bg-white text-blue-900 font-black flex items-center gap-2 px-5 py-2.5 rounded-2xl shadow border-2 border-blue-900 hover:bg-blue-50 transition cursor-pointer text-[10px] uppercase"
        >
          <ArrowLeft size={15}/>
          {step === 'months' ? 'Ortga' : step === 'days' ? 'Oylar' : 'Kunlar'}
        </button>

        {archive.length > 0 && (
          <button
            onClick={step === 'months' ? downloadAllPDF : step === 'days' ? downloadMonthPDF : downloadDayPDF}
            className="bg-blue-900 text-white px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 cursor-pointer hover:bg-blue-800 transition">
            <Download size={13}/> PDF
          </button>
        )}
      </div>

      {/* SARLAVHA */}
      <h2 className="text-xl font-black flex items-center gap-2 text-slate-800 uppercase tracking-tighter leading-none">
        <History className="text-blue-900" size={22}/>
        {step === 'months' && `Ishlar arxivi: ${selectedStation}`}
        {step === 'days' && `📅 ${formatMonth(selectedMonth)}`}
        {step === 'records' && `🗓 ${formatDateShort(selectedArchiveViewDate)}`}
      </h2>

      {/* KONTENT */}
      {archive.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl text-center text-slate-400 font-black border-2 border-dashed border-slate-200">
          Arxivda ishlar yo'q
        </div>

      ) : step === 'months' ? (
        <div className="space-y-2">
          {months.map(m => {
            const count = groupedArchive
              .filter(([sana]) => sana.startsWith(m))
              .reduce((sum, [, ishlar]) => sum + ishlar.length, 0);
            return (
              <button key={m} onClick={() => setSelectedMonth(m)}
                className="w-full text-left p-4 rounded-2xl bg-white hover:bg-blue-900 hover:text-white border-2 border-slate-100 flex justify-between items-center cursor-pointer group transition-all shadow-sm">
                <span className="font-black">📅 {formatMonth(m)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold opacity-60 group-hover:opacity-100">{count} ta ish</span>
                  <ChevronRight size={16} className="opacity-40 group-hover:opacity-100"/>
                </div>
              </button>
            );
          })}
        </div>

      ) : step === 'days' ? (
        <div className="space-y-2">
          {daysInMonth.map(([sana, ishlar]) => (
            <button key={sana} onClick={() => setSelectedArchiveViewDate(sana)}
              className="w-full text-left p-4 rounded-2xl bg-white hover:bg-blue-900 hover:text-white border-2 border-slate-100 flex justify-between items-center cursor-pointer group transition-all shadow-sm">
              <span className="font-black">🗓 {formatDateShort(sana)}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold opacity-60 group-hover:opacity-100">{ishlar.length} ta ish</span>
                <ChevronRight size={16} className="opacity-40 group-hover:opacity-100"/>
              </div>
            </button>
          ))}
        </div>

      ) : (
        <div className="space-y-3 pb-6">
          {currentRecords.map((item, index) => (
            <div key={`archive-${item.id}-${index}`}
              className="bg-white p-4 rounded-3xl border-l-4 border-l-green-500 shadow-sm">
              <p className="font-black text-sm leading-tight mb-2">{item.name}</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-blue-900 text-white px-2 py-1 rounded-lg text-[9px] font-black">👤 {item.worker_id}</span>
                <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded-lg text-[9px] font-black border border-orange-100">🕐 {formatFullDateTime(item.start_time)}</span>
                <span className="bg-green-50 text-green-700 px-2 py-1 rounded-lg text-[9px] font-black border border-green-100">✅ {formatFullDateTime(item.end_time)}</span>
                {item.bolim && <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-lg text-[9px] font-black border border-purple-100">📁 {item.bolim}</span>}
                {item.davriylik && <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded-lg text-[9px] font-black border border-teal-100">🔄 {item.davriylik}</span>}
                {item.jurnal && <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg text-[9px] font-black border border-indigo-100">📔 {item.jurnal}</span>}
                {item.nsh && <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-[9px] font-black border border-blue-100">📋 {item.nsh}</span>}
              {item.confirmed_by && <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-lg text-[9px] font-black border border-amber-100">🛡 Tasdiqladi: {item.confirmed_by}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}