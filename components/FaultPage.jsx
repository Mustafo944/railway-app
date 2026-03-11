"use client"
import React, { useState, useEffect } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const FAULT_REASONS = [
  "Rels zanjiri",
  "Strelkali o'tkazgich",
  "Yolg'on bandlik",
  "Yo'nalishni o'zgartirish",
  "Boshqa"
];

export default function FaultPage({ station, workerName, onBack, supabase, formatFullDateTime }) {
  const [activeFaults, setActiveFaults] = useState([]);
  const [showArchive, setShowArchive] = useState(false);
  const [archiveDates, setArchiveDates] = useState([]);
  const [archiveGrouped, setArchiveGrouped] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [faultReason, setFaultReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [confirmResolveId, setConfirmResolveId] = useState(null);

  useEffect(() => {
    loadActiveFaults();
  }, []);

  const loadActiveFaults = async () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const { data } = await supabase
      .from('faults')
      .select('*')
      .eq('station', station)
      .gte('created_at', oneMonthAgo.toISOString())
      .order('created_at', { ascending: false });
    if (data) setActiveFaults(data);
  };

  const loadArchive = async () => {
    const { data } = await supabase
      .from('faults')
      .select('*')
      .eq('station', station)
      .eq('status', 'resolved')
      .order('created_at', { ascending: false });
    if (data) {
      const grouped = {};
      data.forEach(f => {
        const date = f.created_at?.slice(0, 10);
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(f);
      });
      setArchiveGrouped(grouped);
      setArchiveDates(Object.keys(grouped).sort((a, b) => b.localeCompare(a)));
      setShowArchive(true);
    }
  };

  const sendFault = async () => {
    if (!faultReason) return toast.error("Sababni tanlang!");
    setIsSending(true);
    const { error } = await supabase.from('faults').insert({
      station,
      reason: faultReason,
      custom_reason: customReason,
      status: 'active',
      created_at: new Date(),
      worker_name: workerName
    });
    if (!error) {
      toast.success("Nosozlik yuborildi!");
      setShowSendModal(false);
      setShowConfirm(false);
      setFaultReason('');
      setCustomReason('');
      loadActiveFaults();
    } else {
      toast.error("Xatolik yuz berdi!");
    }
    setIsSending(false);
  };

  const resolveFault = async (id) => {
    const { error } = await supabase
      .from('faults')
      .update({ status: 'resolved', resolved_at: new Date() })
      .eq('id', id);
    if (!error) {
      toast.success("Nosozlik bartaraf etildi!");
      setConfirmResolveId(null);
      loadActiveFaults();
    } else {
      toast.error("Xatolik yuz berdi!");
    }
  };

  const getFaultTimer = (start) => {
    if (!start) return '';
    const diff = Date.now() - new Date(start).getTime();
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${m} min ${s} s`;
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-300 pb-10">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="flex items-center gap-2 font-black text-blue-900 text-xs cursor-pointer hover:underline">
          <ArrowLeft size={16}/> Ortga
        </button>
        <h2 className="text-xs font-black uppercase text-red-600">🚨 Nosozliklar — {station}</h2>
        <button
          onClick={loadArchive}
          className="bg-slate-700 text-white px-3 py-2 rounded-xl font-black text-xs cursor-pointer"
        >
          📂 Arxiv
        </button>
      </div>

      {/* NOSOZLIK YUBORISH TUGMASI */}
      <button
        onClick={() => setShowSendModal(true)}
        className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black text-sm uppercase cursor-pointer mb-5 shadow-lg transition-all"
      >
        + Nosozlik haqida xabar berish
      </button>

      {/* SO'NGGI 1 OY NOSOZLIKLAR */}
      <h3 className="font-black text-sm uppercase text-slate-500 mb-3">So'nggi 1 oy ichidagi nosozliklar</h3>
      {activeFaults.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl text-center text-slate-400 font-bold border-2 border-slate-100">
          Nosozliklar yo'q
        </div>
      ) : (
        <div className="space-y-3">
          {activeFaults.map(f => {
            const duration = f.resolved_at
              ? Math.floor((new Date(f.resolved_at) - new Date(f.created_at)) / 60000)
              : null;
            return (
              <div key={f.id} className={`p-4 rounded-2xl border-l-4 ${f.status === 'active' ? 'bg-red-50 border-l-red-500' : 'bg-green-50 border-l-green-500'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-black text-sm">{f.reason === 'Boshqa' ? f.custom_reason : f.reason}</p>
                    <p className="text-[10px] font-bold text-blue-700 mt-0.5">👤 {f.worker_name || "Noma'lum"}</p>
                    <p className="text-[10px] font-bold text-slate-500 mt-0.5">⏱ {formatFullDateTime(f.created_at)}</p>
                    {f.status === 'active' && (
                      <p className="text-[10px] font-black text-red-600 mt-0.5">🔴 Aktiv: {getFaultTimer(f.created_at)}</p>
                    )}
                    {duration && (
                      <p className="text-[10px] font-black text-green-600 mt-0.5">✅ Bartaraf etildi: {duration} min</p>
                    )}
                  </div>
                  {f.status === 'active' && (
                    <button
                      onClick={() => setConfirmResolveId(f.id)}
                      className="bg-green-600 text-white px-3 py-2 rounded-xl text-xs font-black cursor-pointer ml-2 shrink-0"
                    >
                      Tugatildi
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ARXIV MODALI */}
      {showArchive && (
        <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b bg-slate-50">
              <div className="flex items-center gap-2">
                {selectedDate && (
                  <button onClick={() => setSelectedDate(null)} className="text-blue-900 font-black text-xs flex items-center gap-1 cursor-pointer hover:underline">
                    <ArrowLeft size={14}/> Sanalar
                  </button>
                )}
                <h3 className="font-black text-slate-800 uppercase">
                  {selectedDate
                    ? new Date(selectedDate).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    : '📂 Nosozliklar arxivi'
                  }
                </h3>
              </div>
              <button onClick={() => { setShowArchive(false); setSelectedDate(null); }} className="bg-slate-100 p-2 rounded-full cursor-pointer">
                <X size={20}/>
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-2">
              {!selectedDate ? (
                archiveDates.length === 0 ? (
                  <p className="text-center py-8 text-slate-400 font-bold">Arxiv bo'sh</p>
                ) : (
                  archiveDates.map(date => (
                    <button key={date} onClick={() => setSelectedDate(date)}
                      className="w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-red-600 hover:text-white border-2 border-slate-100 flex justify-between items-center cursor-pointer group transition-all">
                      <span className="font-black">📅 {new Date(date).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                      <span className="text-xs font-bold opacity-60 group-hover:opacity-100">{archiveGrouped[date].length} ta nosozlik</span>
                    </button>
                  ))
                )
              ) : (
                archiveGrouped[selectedDate].map(f => {
                  const duration = f.resolved_at
                    ? Math.floor((new Date(f.resolved_at) - new Date(f.created_at)) / 60000)
                    : null;
                  return (
                    <div key={f.id} className="p-4 rounded-2xl bg-slate-50 border-l-4 border-l-red-500">
                      <p className="font-black text-sm">{f.reason === 'Boshqa' ? f.custom_reason : f.reason}</p>
                      <p className="text-[10px] font-bold text-blue-700">👤 {f.worker_name || "Noma'lum"}</p>
                      <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-slate-500 font-bold">
                        <span>⏱ {formatFullDateTime(f.created_at)}</span>
                        {f.resolved_at && <span>✅ {formatFullDateTime(f.resolved_at)}</span>}
                        {duration && <span className="text-green-600">🕐 {duration} min</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* NOSOZLIK YUBORISH MODALI */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b bg-red-50">
              <h3 className="font-black text-red-700 uppercase">Nosozlik sababi</h3>
              <button onClick={() => { setShowSendModal(false); setFaultReason(''); setCustomReason(''); }} className="bg-white p-2 rounded-full cursor-pointer">
                <X size={20}/>
              </button>
            </div>
            <div className="p-6 space-y-3">
              <select value={faultReason} onChange={e => setFaultReason(e.target.value)}
                className="w-full p-3 border-2 rounded-xl font-bold outline-none focus:border-red-500">
                <option value="">Sababni tanlang</option>
                {FAULT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {faultReason === 'Boshqa' && (
                <textarea value={customReason} onChange={e => setCustomReason(e.target.value)}
                  placeholder="Sababni yozing..." rows={3}
                  className="w-full p-3 border-2 rounded-xl font-bold outline-none focus:border-red-500"/>
              )}
              <button
                disabled={!faultReason || (faultReason === 'Boshqa' && !customReason)}
                onClick={() => setShowConfirm(true)}
                className="w-full bg-red-600 text-white py-4 rounded-2xl font-black cursor-pointer disabled:opacity-50"
              >
                Yuborish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TASDIQLASH */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[210] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl text-center max-w-sm w-full space-y-4">
            <h3 className="text-xl font-black text-red-600">Nosozlik yuborilsinmi?</h3>
            <div className="flex gap-3">
              <button onClick={sendFault} disabled={isSending}
                className="flex-1 bg-red-600 text-white py-3 rounded-2xl font-black cursor-pointer disabled:opacity-50">
                {isSending ? 'Yuborilmoqda...' : 'Ha, yuborish'}
              </button>
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 bg-slate-200 py-3 rounded-2xl font-black cursor-pointer">
                Bekor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BARTARAF ETISH TASDIQLASH */}
      {confirmResolveId && (
        <div className="fixed inset-0 bg-black/80 z-[210] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl text-center max-w-sm w-full space-y-4">
            <h3 className="text-xl font-black text-slate-800">Nosozlik bartaraf etildimi?</h3>
            <div className="flex gap-3">
              <button onClick={() => resolveFault(confirmResolveId)}
                className="flex-1 bg-green-600 text-white py-3 rounded-2xl font-black cursor-pointer">
                Ha, tasdiqlash
              </button>
              <button onClick={() => setConfirmResolveId(null)}
                className="flex-1 bg-slate-200 py-3 rounded-2xl font-black cursor-pointer">
                Bekor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}