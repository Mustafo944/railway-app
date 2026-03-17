"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, X, Download, AlertTriangle, Clock, CheckCircle2, ChevronRight, Archive, Plus, Loader2, Shield, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const FAULT_REASONS = [
  "Rels zanjiri",
  "Strelkali o'tkazgich",
  "Yolg'on bandlik",
  "Yo'nalishni o'zgartirish",
  "Boshqa"
];

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

// JARAYON:
// 1. Ishchi nosozlik yuboradi → status='active', confirmed=false
// 2. Bekat boshlig'i ko'radi, tasdiqlash tugmasi yo'q — faqat kuzatadi
// 3. Ishchi "Bartaraf etildi" bosadi → status='resolved', confirmed=false
// 4. Bekat boshlig'i "Tasdiqlash" bosadi → confirmed=true → to'liq yakunlandi
// Barcha rahbariyatda: confirmed=false+resolved → "Bartaraf etildi, tasdiq kutilmoqda"

export default function FaultPage({ station, workerName, currentWorker, onBack, supabase, formatFullDateTime }) {
  const [faults, setFaults] = useState([]);
  const [showArchive, setShowArchive] = useState(false);
  const [archiveGrouped, setArchiveGrouped] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [faultReason, setFaultReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [confirmResolveId, setConfirmResolveId] = useState(null);
  const [confirmBoshligId, setConfirmBoshligId] = useState(null);
  const [tick, setTick] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const isBoshlig = currentWorker?.role === 'bekat_boshlig';
  const isWorker = !isBoshlig && currentWorker?.role !== 'boss' && currentWorker?.role !== 'admin';

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (station) loadFaults();
  }, [station]);
useEffect(() => {
  if (!station || !supabase) return;
  const channel = supabase
    .channel(`faults-${station}-${Date.now()}`)
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'faults',
      filter: `station=eq.${station}`
    }, (payload) => {
      if (payload.eventType === 'INSERT') {
        setFaults(prev => prev.some(f => f.id === payload.new.id) ? prev : [payload.new, ...prev]);
      }
      if (payload.eventType === 'UPDATE') {
        setFaults(prev => prev.map(f => f.id === payload.new.id ? payload.new : f));
      }
      if (payload.eventType === 'DELETE') {
        setFaults(prev => prev.filter(f => f.id !== payload.old.id));
      }
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [station]);

const loadFaults = async () => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const { data } = await supabase
    .from('faults').select('*').eq('station', station)
    .gte('created_at', oneMonthAgo.toISOString())
    .order('created_at', { ascending: false });
  if (data) setFaults(data);
  setIsLoading(false);
};

  const loadArchive = async () => {
    const { data } = await supabase
      .from('faults').select('*').eq('station', station)
      .eq('status', 'resolved').eq('confirmed', true)
      .order('created_at', { ascending: false });
    if (data) {
      const grouped = {};
      data.forEach(f => {
        const date = f.created_at?.slice(0, 10);
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(f);
      });
      setArchiveGrouped(grouped);
      setShowArchive(true);
    }
  };

  const months = useMemo(() => {
    const set = new Set(Object.keys(archiveGrouped).map(d => d.slice(0, 7)));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [archiveGrouped]);

  const daysInMonth = useMemo(() => {
    if (!selectedMonth) return [];
    return Object.keys(archiveGrouped).filter(d => d.startsWith(selectedMonth)).sort((a, b) => b.localeCompare(a));
  }, [selectedMonth, archiveGrouped]);

  const formatMonth = (ym) => {
    const [y, m] = ym.split('-');
    return `${OY_NOMLARI[parseInt(m) - 1]} ${y}`;
  };
  const formatDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}.${m}.${y}`;
  };
  const formatDateLong = (dateStr) => {
    const [y, m, d] = dateStr.split('-');
    return `${d} ${OY_NOMLARI[parseInt(m) - 1]} ${y}`;
  };

  const handleArchiveBack = () => {
    if (selectedDate) setSelectedDate(null);
    else if (selectedMonth) setSelectedMonth(null);
  };
  const archiveStep = selectedDate ? 'records' : selectedMonth ? 'days' : 'months';

  const buildPDF = (title, faultList) => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`${station} — Nosozliklar arxivi`, 14, 15);
    doc.setFontSize(10);
    doc.text(title, 14, 23);
    autoTable(doc, {
      startY: 30,
      head: [['#', 'Sabab', 'Ishchi', 'Boshlandi', 'Tugadi', 'Davomiyligi', 'Tasdiqladi']],
      body: faultList.map((f, i) => [
        i + 1,
        f.reason === 'Boshqa' ? f.custom_reason : f.reason,
        f.worker_name || "Noma'lum",
        formatFullDateTime(f.created_at),
        f.resolved_at ? formatFullDateTime(f.resolved_at) : '-',
        f.resolved_at ? getDuration(f.created_at, f.resolved_at) : '-',
        f.confirmed_by || '-',
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [254, 242, 242] },
    });
    return doc;
  };

  const downloadAllPDF = () => { buildPDF('Barcha nosozliklar', Object.values(archiveGrouped).flat()).save(`${station}-nosozliklar-barchasi.pdf`); };
  const downloadMonthPDF = () => { buildPDF(`Oy: ${formatMonth(selectedMonth)}`, daysInMonth.flatMap(d => archiveGrouped[d] || [])).save(`${station}-nosozliklar-${selectedMonth}.pdf`); };
  const downloadDayPDF = () => { buildPDF(`Sana: ${formatDateLong(selectedDate)}`, archiveGrouped[selectedDate] || []).save(`${station}-nosozliklar-${selectedDate}.pdf`); };

  // Ishchi nosozlik yuboradi
  const sendFault = async () => {
    if (!faultReason) return toast.error("Sababni tanlang!");
    setIsSending(true);
    const { error } = await supabase.from('faults').insert({
      station, reason: faultReason, custom_reason: customReason,
      status: 'active', worker_name: workerName, confirmed: false,
    });
    if (!error) {
      toast.success("Nosozlik yuborildi!");
      setShowSendModal(false); setShowConfirm(false);
      setFaultReason(''); setCustomReason('');
      loadFaults();
    } else { toast.error("Xatolik yuz berdi!"); }
    setIsSending(false);
  };

  // Ishchi bartaraf etdi — status=resolved, confirmed hali false
  const resolveFault = async (id) => {
    const { error } = await supabase.from('faults')
      .update({ status: 'resolved', resolved_at: new Date().toISOString(), confirmed: false })
      .eq('id', id);
    if (!error) {
      toast.success("Bartaraf etildi! Bekat boshlig'i tasdiqlashini kuting.");
      setConfirmResolveId(null);
      loadFaults();
    } else { toast.error("Xatolik yuz berdi!"); }
  };

  // Bekat boshlig'i tasdiqlaydi — confirmed=true
  const confirmByBoshlig = async (id) => {
    const { error } = await supabase.from('faults')
      .update({ confirmed: true, confirmed_by: currentWorker?.full_name })
      .eq('id', id);
    if (!error) {
      toast.success("Tasdiqlandi!");
      setConfirmBoshligId(null);
      loadFaults();
    } else { toast.error("Xatolik yuz berdi!"); }
  };

  const getFaultTimer = (start) => {
    if (!start) return '';
    const str = start.endsWith('Z') || start.includes('+') ? start : start + 'Z';
    const diff = Date.now() - new Date(str).getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  const activeFaultsList = faults.filter(f => f.status === 'active');
  const resolvedFaultsList = faults.filter(f => f.status === 'resolved' && f.confirmed);
  const pendingConfirmList = faults.filter(f => f.status === 'resolved' && !f.confirmed);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700;800;900&display=swap');
        .fault-page * { font-family: 'Onest', sans-serif; }
        @keyframes slideUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        .fault-card { animation: slideUp 0.35s ease both; }
        .fault-card:nth-child(1){animation-delay:.05s} .fault-card:nth-child(2){animation-delay:.10s}
        .fault-card:nth-child(3){animation-delay:.15s} .fault-card:nth-child(4){animation-delay:.20s}
        .send-btn { background:linear-gradient(135deg,#dc2626,#991b1b); transition:all 0.3s ease; box-shadow:0 4px 24px rgba(220,38,38,.35); }
        .send-btn:hover { box-shadow:0 8px 32px rgba(220,38,38,.45); transform:translateY(-1px); }
        .archive-btn { background:#1e293b; transition:all 0.2s ease; }
        .archive-btn:hover { background:#0f172a; transform:translateY(-1px); }
        .resolve-btn { background:linear-gradient(135deg,#16a34a,#15803d); transition:all 0.2s ease; box-shadow:0 2px 8px rgba(22,163,74,.3); }
        .resolve-btn:hover { box-shadow:0 4px 16px rgba(22,163,74,.4); transform:translateY(-1px); }
        .confirm-btn { background:linear-gradient(135deg,#d97706,#b45309); transition:all 0.2s ease; box-shadow:0 2px 8px rgba(217,119,6,.3); }
        .confirm-btn:hover { box-shadow:0 4px 16px rgba(217,119,6,.4); transform:translateY(-1px); }
        .modal-overlay { animation:fadeIn 0.2s ease; backdrop-filter:blur(6px); background:rgba(0,0,0,.6); }
        .modal-box { animation:slideUp 0.25s ease; }
        .archive-row { transition:all 0.2s ease; border:1.5px solid #e2e8f0; }
        .archive-row:hover { border-color:#ef4444; background:#fff5f5; transform:translateX(4px); }
        .select-styled { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; cursor:pointer; }
        .select-styled:focus { border-color:#ef4444; outline:none; }
      `}</style>

      <div className="fault-page max-w-2xl mx-auto pb-12" style={{ animation: 'slideUp 0.3s ease' }}>

        {/* HEADER */}
        <div className="flex items-center gap-2 mb-6">
          <button onClick={onBack} className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors font-semibold text-sm cursor-pointer shrink-0">
            <ArrowLeft size={16} strokeWidth={2.5}/> Ortga
          </button>
          <h2 className="flex-1 text-center text-xs font-black uppercase tracking-wide text-slate-700 truncate px-1">
            <span className="text-red-600">{station}</span>
          </h2>
          <button onClick={loadArchive} className="archive-btn flex items-center gap-1.5 text-white px-3 py-2 rounded-xl font-bold text-xs cursor-pointer shrink-0">
            <Archive size={13}/> Arxiv
          </button>
        </div>

        {/* Bekat boshlig'i banneri */}
        {isBoshlig && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3 mb-5">
            <ShieldCheck size={18} className="text-amber-600 shrink-0"/>
            <p className="text-[11px] font-bold text-amber-700">
              Bekat boshlig'i — Ishchi bartaraf etganidan so'ng tasdiqlang
            </p>
          </div>
        )}

        {/* YUBORISH — ishchilar va boshlig' ham */}
        <button onClick={() => setShowSendModal(true)}
          className="send-btn w-full text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider cursor-pointer mb-5 flex items-center justify-center gap-2">
          <Plus size={18} strokeWidth={3}/> Nosozlik haqida xabar berish
        </button>

        {/* STATISTIKA */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-3 flex flex-col items-center gap-1">
            <p className="text-xl font-black text-red-600">{activeFaultsList.length}</p>
            <p className="text-[9px] font-semibold text-red-400 uppercase tracking-wide text-center">Aktiv</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 flex flex-col items-center gap-1">
            <p className="text-xl font-black text-amber-600">{pendingConfirmList.length}</p>
            <p className="text-[9px] font-semibold text-amber-400 uppercase tracking-wide text-center">Tasdiq kutmoqda</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-2xl p-3 flex flex-col items-center gap-1">
            <p className="text-xl font-black text-green-600">{resolvedFaultsList.length}</p>
            <p className="text-[9px] font-semibold text-green-400 uppercase tracking-wide text-center">Yakunlandi</p>
          </div>
        </div>

        {/* SARLAVHA */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 bg-red-500 rounded-full"/>
          <h3 className="font-black text-xs uppercase tracking-widest text-slate-500">So'nggi 1 oy ichidagi nosozliklar</h3>
        </div>

        {/* RO'YXAT */}
 {isLoading ? (
  <div className="space-y-3">
    {[1,2,3].map(i => (
      <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
        <div className="h-1 bg-slate-200"/>
        <div className="p-4 space-y-2">
          <div className="h-3 bg-slate-200 rounded-full w-32"/>
          <div className="h-4 bg-slate-200 rounded-full w-2/3"/>
          <div className="h-3 bg-slate-200 rounded-full w-24"/>
        </div>
      </div>
    ))}
  </div>
) : faults.length === 0 ? (
  <div className="bg-white border-2 border-dashed border-slate-200 p-12 rounded-2xl text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Shield size={24} className="text-slate-400"/>
            </div>
            <p className="font-bold text-slate-400 text-sm">Nosozliklar yo'q</p>
            <p className="text-xs text-slate-300 mt-1">Tizim normal ishlayapti</p>
          </div>
        ) : (
          <div className="space-y-3">
            {faults.map((f, i) => {
              // Holat aniqlash
              const isActive = f.status === 'active';
              const isResolved = f.status === 'resolved';
              const isConfirmed = f.confirmed === true;

              // Gradient chiziq rangi
              let topBar = 'bg-gradient-to-r from-red-500 to-orange-400';
              if (isResolved && isConfirmed) topBar = 'bg-gradient-to-r from-green-400 to-emerald-500';
              else if (isResolved && !isConfirmed) topBar = 'bg-gradient-to-r from-amber-400 to-yellow-400';

              return (
                <div key={f.id}
                  className={`fault-card rounded-2xl overflow-hidden shadow-sm bg-white border ${
                    isActive ? 'border-red-200' :
                    isResolved && !isConfirmed ? 'border-amber-200' :
                    'border-green-100'
                  }`}
                  style={{ animationDelay: `${i * 0.05}s` }}>

                  <div className={`h-1 w-full ${topBar}`}/>

                  <div className="p-4">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">

                        {/* Status badge */}
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {isActive && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-600">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"/>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"/>
                              </span>
                              Aktiv
                            </span>
                          )}
{isResolved && !isConfirmed && (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-700">
    ⏳ Bartaraf etildi — bekat boshlig'i tasdiqlashi kerak
  </span>
)}
                          {isResolved && isConfirmed && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-green-100 text-green-700">
                              <CheckCircle2 size={10}/> Yakunlandi
                            </span>
                          )}
                        </div>

                        <p className="font-black text-sm text-slate-800 truncate mb-2">
                          {f.reason === 'Boshqa' ? f.custom_reason : f.reason}
                        </p>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                            <span className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center text-[8px] text-blue-600 font-black shrink-0">👤</span>
                            {f.worker_name || "Noma'lum"}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                            <Clock size={11} className="shrink-0"/> {formatFullDateTime(f.created_at)}
                          </div>
                          {f.confirmed_by && (
                            <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-bold">
                              <ShieldCheck size={11} className="shrink-0 text-amber-600"/> Tasdiqladi: {f.confirmed_by}
                            </div>
                          )}
                        </div>

                        {/* Timer */}
                        {isActive && (
                          <div className="mt-2.5 inline-flex items-center gap-1.5 bg-red-50 border border-red-100 px-2.5 py-1 rounded-lg">
                            <Clock size={11} className="text-red-500"/>
                            <span className="text-[11px] font-black text-red-600 tabular-nums">{getFaultTimer(f.created_at)}</span>
                          </div>
                        )}
                        {f.resolved_at && (
                          <div className="mt-2.5 inline-flex items-center gap-1.5 bg-green-50 border border-green-100 px-2.5 py-1 rounded-lg">
                            <CheckCircle2 size={11} className="text-green-500"/>
                            <span className="text-[11px] font-bold text-green-600">{getDuration(f.created_at, f.resolved_at)}</span>
                          </div>
                        )}
                      </div>

                      {/* TUGMALAR */}
                      <div className="flex flex-col gap-2 shrink-0">

                        {/* ISHCHI: aktiv nosozlikni bartaraf etish */}
                        {isWorker && isActive && (
                          <button onClick={() => setConfirmResolveId(f.id)}
                            className="resolve-btn text-white px-3 py-2 rounded-xl text-xs font-black cursor-pointer flex items-center gap-1">
                            <CheckCircle2 size={13}/> Bartaraf etildi
                          </button>
                        )}

                        {/* ISHCHI: bartaraf etdi, boshlig' tasdiqlashini kutmoqda */}

                        {/* BOSHLIG': bartaraf etilganini tasdiqlash */}
                        {isBoshlig && isResolved && !isConfirmed && (
                          <button onClick={() => setConfirmBoshligId(f.id)}
                            className="confirm-btn text-white px-3 py-2 rounded-xl text-xs font-black cursor-pointer flex items-center gap-1">
                            <ShieldCheck size={13}/> Tasdiqlash
                          </button>
                        )}

                        {/* BOSHLIG': aktiv nosozlik — faqat ko'radi */}
                        {isBoshlig && isActive && (
                          <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-[10px] font-black text-center leading-tight">
                            🔴 Aktiv
                          </div>
                        )}

                        {/* BOSHLIG': nosozlik yuborish tugmasi uchun — boshlig' ham yuborishi kerak, lekin bartaraf etish faqat ishchida */}

                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ARXIV MODALI */}
        {showArchive && (
          <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="modal-box bg-white w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col max-h-[92vh]">
              <div className="px-6 py-4 border-b border-slate-100 bg-white sticky top-0 z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {archiveStep !== 'months' && (
                    <button onClick={handleArchiveBack} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center cursor-pointer">
                      <ArrowLeft size={15} className="text-slate-600"/>
                    </button>
                  )}
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Nosozliklar</p>
                    <h3 className="font-black text-slate-800 text-base">
                      {archiveStep === 'months' && 'Arxiv'}
                      {archiveStep === 'days' && formatMonth(selectedMonth)}
                      {archiveStep === 'records' && formatDateLong(selectedDate)}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={archiveStep === 'months' ? downloadAllPDF : archiveStep === 'days' ? downloadMonthPDF : downloadDayPDF}
                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer">
                    <Download size={13}/> PDF
                  </button>
                  <button onClick={() => { setShowArchive(false); setSelectedDate(null); setSelectedMonth(null); }}
                    className="w-8 h-8 bg-slate-100 hover:bg-red-100 rounded-full flex items-center justify-center cursor-pointer">
                    <X size={16} className="text-slate-500"/>
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto p-4 space-y-2 flex-1">
                {archiveStep === 'months' && (months.length === 0 ? (
                  <div className="py-12 text-center"><p className="text-slate-400 font-bold text-sm">Arxiv bo'sh</p></div>
                ) : months.map(m => {
                  const count = Object.keys(archiveGrouped).filter(d => d.startsWith(m)).reduce((s, d) => s + archiveGrouped[d].length, 0);
                  return (
                    <button key={m} onClick={() => setSelectedMonth(m)} className="archive-row w-full text-left p-4 rounded-2xl bg-white flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center shrink-0"><span>📅</span></div>
                        <span className="font-bold text-slate-700 text-sm">{formatMonth(m)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{count} ta</span>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-red-400"/>
                      </div>
                    </button>
                  );
                }))}
                {archiveStep === 'days' && daysInMonth.map(date => (
                  <button key={date} onClick={() => setSelectedDate(date)} className="archive-row w-full text-left p-4 rounded-2xl bg-white flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center"><span>🗓</span></div>
                      <span className="font-bold text-slate-700 text-sm">{formatDate(date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{archiveGrouped[date].length} ta</span>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-red-400"/>
                    </div>
                  </button>
                ))}
                {archiveStep === 'records' && (archiveGrouped[selectedDate] || []).map(f => (
                  <div key={f.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="h-0.5 bg-gradient-to-r from-green-400 to-emerald-400"/>
                    <div className="p-4">
                      <p className="font-black text-sm text-slate-800 mb-2">{f.reason === 'Boshqa' ? f.custom_reason : f.reason}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-blue-600 font-semibold mb-2">
                        <span>👤</span> {f.worker_name || "Noma'lum"}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded-lg">
                          <Clock size={9}/> {formatFullDateTime(f.created_at)}
                        </span>
                        {f.resolved_at && (
                          <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold bg-green-50 px-2 py-1 rounded-lg">
                            <CheckCircle2 size={9}/> {getDuration(f.created_at, f.resolved_at)}
                          </span>
                        )}
                        {f.confirmed_by && (
                          <span className="flex items-center gap-1 text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-1 rounded-lg">
                            <ShieldCheck size={9}/> Tasdiqladi: {f.confirmed_by}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* NOSOZLIK YUBORISH MODALI */}
        {showSendModal && (
          <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="modal-box bg-white w-full max-w-md rounded-3xl overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Yangi xabar</p>
                  <h3 className="font-black text-slate-800 text-base">Nosozlik sababi</h3>
                </div>
                <button onClick={() => { setShowSendModal(false); setFaultReason(''); setCustomReason(''); }}
                  className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center cursor-pointer">
                  <X size={16} className="text-slate-500"/>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <select value={faultReason} onChange={e => setFaultReason(e.target.value)}
                  className="select-styled w-full p-3.5 border-2 border-slate-200 rounded-xl font-bold text-sm bg-white text-slate-700">
                  <option value="">— Sababni tanlang —</option>
                  {FAULT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {faultReason === 'Boshqa' && (
                  <textarea value={customReason} onChange={e => setCustomReason(e.target.value)}
                    placeholder="Nosozlik sababini kiriting..." rows={3}
                    className="w-full p-3.5 border-2 border-slate-200 rounded-xl font-medium text-sm resize-none outline-none focus:border-red-400"/>
                )}
                <button disabled={!faultReason || (faultReason === 'Boshqa' && !customReason)}
                  onClick={() => setShowConfirm(true)}
                  className="send-btn w-full text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wide cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                  Yuborish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* YUBORISH TASDIQLASH */}
        {showConfirm && (
          <div className="modal-overlay fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="modal-box bg-white p-8 rounded-3xl text-center max-w-sm w-full">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={28} className="text-red-600"/>
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-1">Yuborilsinmi?</h3>
              <p className="text-sm text-slate-400 font-medium mb-6">Nosozlik tizimga qo'shiladi</p>
              <div className="flex gap-3">
                <button onClick={sendFault} disabled={isSending}
                  className="send-btn flex-1 text-white py-3.5 rounded-2xl font-black cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSending ? <><Loader2 size={16} className="animate-spin"/> Yuborilmoqda...</> : 'Ha, yuborish'}
                </button>
                <button onClick={() => setShowConfirm(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-2xl font-black cursor-pointer">
                  Bekor
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ISHCHI — BARTARAF ETISH TASDIQLASH */}
        {confirmResolveId && (
          <div className="modal-overlay fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="modal-box bg-white p-8 rounded-3xl text-center max-w-sm w-full">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-green-600"/>
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-1">Bartaraf etildimi?</h3>
              <p className="text-sm text-slate-400 font-medium mb-6">
                Nosozlik yopiladi.<br/>
                <span className="text-amber-600 font-bold">Bekat boshlig'i tasdiqlashi kerak.</span>
              </p>
              <div className="flex gap-3">
                <button onClick={() => resolveFault(confirmResolveId)}
                  className="resolve-btn flex-1 text-white py-3.5 rounded-2xl font-black cursor-pointer flex items-center justify-center gap-2">
                   Ha, bartaraf etildi
                </button>
                <button onClick={() => setConfirmResolveId(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-2xl font-black cursor-pointer">
                  Bekor qilish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BOSHLIG' — TASDIQLASH */}
        {confirmBoshligId && (
          <div className="modal-overlay fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="modal-box bg-white p-8 rounded-3xl text-center max-w-sm w-full">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={28} className="text-amber-600"/>
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-1">Tasdiqlaysizmi?</h3>
              <p className="text-sm text-slate-400 font-medium mb-6">
                Nosozlik bartaraf etilganligi tasdiqlanadi va arxivga o'tadi
              </p>
              <div className="flex gap-3">
                <button onClick={() => confirmByBoshlig(confirmBoshligId)}
                  className="confirm-btn flex-1 text-white py-3.5 rounded-2xl font-black cursor-pointer flex items-center justify-center gap-2">
                  <ShieldCheck size={16}/> Ha, tasdiqlash
                </button>
                <button onClick={() => setConfirmBoshligId(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-2xl font-black cursor-pointer">
                  Bekor
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}