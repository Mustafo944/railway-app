"use client"
import { useState, useMemo } from 'react';
import { X, ArrowLeft, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const OY_NOMLARI = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];

const getDuration = (created, resolved) => {
  const c = created.endsWith('Z') || created.includes('+') ? created : created + 'Z';
  const r = resolved.endsWith('Z') || resolved.includes('+') ? resolved : resolved + 'Z';
  const diff = new Date(r) - new Date(c);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 0) return `${h} soat ${m} min ${s} s`;
  if (m > 0) return `${m} min ${s} s`;
  return `${s} s`;
};

export default function FaultArchive({
  faultArchiveDates,
  faultArchiveGrouped,
  selectedFaultDate, setSelectedFaultDate,
  formatFullDateTime,
  onClose,
}) {
  const [selectedMonth, setSelectedMonth] = useState(null);

  const months = useMemo(() => {
    const set = new Set(faultArchiveDates.map(d => d.slice(0, 7)));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [faultArchiveDates]);

  const daysInMonth = useMemo(() => {
    if (!selectedMonth) return [];
    return faultArchiveDates.filter(d => d.startsWith(selectedMonth));
  }, [selectedMonth, faultArchiveDates]);

  const formatMonth = (ym) => {
    const [y, m] = ym.split('-');
    return `${OY_NOMLARI[parseInt(m) - 1]} ${y}`;
  };

  const handleBack = () => {
    if (selectedFaultDate) setSelectedFaultDate(null);
    else if (selectedMonth) setSelectedMonth(null);
  };

  const step = selectedFaultDate ? 'records' : selectedMonth ? 'days' : 'months';

  // PDF — kunlik
  const downloadDayPDF = (date, faults) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`Nosozliklar arxivi`, 14, 15);
    doc.setFontSize(11);
    doc.text(`Sana: ${new Date(date).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}`, 14, 23);

    autoTable(doc, {
      startY: 30,
      head: [['#', 'Bekat', 'Ishchi', 'Sabab', 'Boshlandi', 'Tugadi', 'Davomiyligi']],
      body: faults.map((f, i) => [
        i + 1,
        f.station || '-',
        f.worker_name || "Noma'lum",
        f.reason === 'Boshqa' ? f.custom_reason : f.reason,
        formatFullDateTime(f.created_at),
        f.resolved_at ? formatFullDateTime(f.resolved_at) : 'Aktiv',
        f.resolved_at ? getDuration(f.created_at, f.resolved_at) : '-',
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [254, 242, 242] },
    });

    doc.save(`nosozliklar-${date}.pdf`);
  };

  // PDF — oylik
  const downloadMonthPDF = (month) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`Nosozliklar arxivi`, 14, 15);
    doc.setFontSize(11);
    doc.text(`Oy: ${formatMonth(month)}`, 14, 23);

    const days = faultArchiveDates.filter(d => d.startsWith(month));
    const allFaults = days.flatMap(d => faultArchiveGrouped[d] || []);

    autoTable(doc, {
      startY: 30,
      head: [['#', 'Bekat', 'Ishchi', 'Sabab', 'Boshlandi', 'Tugadi', 'Davomiyligi']],
      body: allFaults.map((f, i) => [
        i + 1,
        f.station || '-',
        f.worker_name || "Noma'lum",
        f.reason === 'Boshqa' ? f.custom_reason : f.reason,
        formatFullDateTime(f.created_at),
        f.resolved_at ? formatFullDateTime(f.resolved_at) : 'Aktiv',
        f.resolved_at ? getDuration(f.created_at, f.resolved_at) : '-',
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [254, 242, 242] },
    });

    doc.save(`nosozliklar-${month}.pdf`);
  };

  // PDF — barcha
  const downloadAllPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`Nosozliklar arxivi — Barchasi`, 14, 15);

    const allFaults = faultArchiveDates.flatMap(d => faultArchiveGrouped[d] || []);

    autoTable(doc, {
      startY: 25,
      head: [['#', 'Bekat', 'Ishchi', 'Sabab', 'Boshlandi', 'Tugadi', 'Davomiyligi']],
      body: allFaults.map((f, i) => [
        i + 1,
        f.station || '-',
        f.worker_name || "Noma'lum",
        f.reason === 'Boshqa' ? f.custom_reason : f.reason,
        formatFullDateTime(f.created_at),
        f.resolved_at ? formatFullDateTime(f.resolved_at) : 'Aktiv',
        f.resolved_at ? getDuration(f.created_at, f.resolved_at) : '-',
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [254, 242, 242] },
    });

    doc.save(`nosozliklar-barchasi.pdf`);
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
            <h2 className="text-lg font-black text-slate-800 uppercase">
              {step === 'months' && '📁 Nosozliklar Arxivi'}
              {step === 'days' && `📅 ${formatMonth(selectedMonth)}`}
              {step === 'records' && `🗓 ${new Date(selectedFaultDate).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}`}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {/* PDF tugmasi */}
            {step === 'months' && (
              <button onClick={downloadAllPDF}
                className="bg-red-600 text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer hover:bg-red-700">
                <Download size={13}/> PDF
              </button>
            )}
            {step === 'days' && (
              <button onClick={() => downloadMonthPDF(selectedMonth)}
                className="bg-red-600 text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer hover:bg-red-700">
                <Download size={13}/> PDF
              </button>
            )}
            {step === 'records' && (
              <button onClick={() => downloadDayPDF(selectedFaultDate, faultArchiveGrouped[selectedFaultDate])}
                className="bg-red-600 text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer hover:bg-red-700">
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
              const count = faultArchiveDates.filter(d => d.startsWith(m))
                .reduce((sum, d) => sum + faultArchiveGrouped[d].length, 0);
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
            <button key={date} onClick={() => setSelectedFaultDate(date)}
              className="w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-red-600 hover:text-white border-2 border-slate-100 flex justify-between items-center cursor-pointer group transition-all">
              <span className="font-black">🗓 {new Date(date).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
              <span className="text-xs font-bold opacity-60 group-hover:opacity-100">{faultArchiveGrouped[date].length} ta nosozlik</span>
            </button>
          ))}

          {step === 'records' && faultArchiveGrouped[selectedFaultDate].map(f => (
            <div key={f.id} className="p-4 rounded-2xl bg-slate-50 border-l-4 border-l-red-500">
              <p className="font-black text-sm">{f.station}</p>
              <p className="text-xs text-blue-700 font-black">👤 {f.worker_name || "Noma'lum"}</p>
              <p className="text-sm text-slate-600 mt-1">{f.reason === 'Boshqa' ? f.custom_reason : f.reason}</p>
              <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-slate-500 font-bold">
                <span>⏱ Boshlandi: {formatFullDateTime(f.created_at)}</span>
                {f.resolved_at && <span>✅ Tugadi: {formatFullDateTime(f.resolved_at)}</span>}
                {f.resolved_at && (
                  <span className="text-green-600">🕐 {getDuration(f.created_at, f.resolved_at)}</span>
                )}
                {!f.resolved_at && <span className="text-red-600 font-black">🔴 Aktiv</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}