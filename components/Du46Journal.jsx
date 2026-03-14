"use client"
import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';
import { X, ArrowLeft } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const OY_NOMLARI = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];

const emptyForm = {
  oy_kun: '', soat_minut: '', kamchilik: '',
  xabar_oy_kun: '', xabar_soat: '', xabar_usul: '',
  kelish_oy_kun: '', kelish_soat: '',
  bartaraf_oy_kun: '', bartaraf_soat: '', bartaraf_sabab: ''
};

export default function Du46Journal({ station, workerName, mode, onClose }) {
  const [list, setList] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [groupedData, setGroupedData] = useState({});

  useEffect(() => {
    if (mode === 'archive') loadData();
  }, []);

  const loadData = async () => {
    const { data } = await supabase
      .from('du46_journal')
      .select('*')
      .eq('station', station)
      .order('created_at', { ascending: false });
    if (data) {
      setList(data);
      const grouped = {};
      data.forEach(r => {
        const date = r.created_at?.slice(0, 10) || 'Noma\'lum';
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(r);
      });
      setGroupedData(grouped);
    }
    setLoaded(true);
  };

  const months = useMemo(() => {
    const set = new Set(Object.keys(groupedData).map(d => d.slice(0, 7)));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [groupedData]);

  const daysInMonth = useMemo(() => {
    if (!selectedMonth) return [];
    return Object.keys(groupedData).filter(d => d.startsWith(selectedMonth)).sort((a, b) => b.localeCompare(a));
  }, [selectedMonth, groupedData]);

  const formatMonth = (ym) => {
    const [y, m] = ym.split('-');
    return `${OY_NOMLARI[parseInt(m) - 1]} ${y}`;
  };

  const handleBack = () => {
    if (selectedDate) { setSelectedDate(null); }
    else if (selectedMonth) { setSelectedMonth(null); }
  };

  const step = selectedDate ? 'records' : selectedMonth ? 'days' : 'months';

  const save = async () => {
    if (!form.kamchilik.trim()) return toast.error("Kamchilik bayon qilinmagan!");
    setIsSaving(true);
    const { error } = await supabase.from('du46_journal').insert({
      station, worker_name: workerName, ...form
    });
    if (!error) {
      toast.success("DU-46 ga yozildi!");
      setForm(emptyForm);
      onClose();
    } else {
      toast.error("Xatolik yuz berdi!");
    }
    setIsSaving(false);
  };

  const f = (key) => ({
    value: form[key],
    onChange: e => setForm({ ...form, [key]: e.target.value })
  });

  const inputCls = "w-full p-2 border-2 rounded-xl outline-none focus:border-blue-600 font-bold text-xs mt-1";

  // ARXIV KO'RINISHI
  if (mode === 'archive') {
    return (
      <div className="fixed inset-0 bg-black/70 z-200 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white w-full max-w-6xl rounded-3xl overflow-hidden flex flex-col max-h-[95vh]">

          {/* HEADER */}
          <div className="flex justify-between items-center px-5 py-4 border-b bg-blue-50 shrink-0">
            <div className="flex items-center gap-3">
              {step !== 'months' && (
                <button onClick={handleBack} className="text-blue-900 font-black text-xs flex items-center gap-1 cursor-pointer hover:underline">
                  <ArrowLeft size={16}/> {step === 'days' ? 'Oylar' : 'Kunlar'}
                </button>
              )}
              <h2 className="text-base font-black text-blue-900 uppercase">
                {step === 'months' && `📋 DU-46 Arxiv — ${station}`}
                {step === 'days' && `📅 ${formatMonth(selectedMonth)}`}
                {step === 'records' && `🗓 ${new Date(selectedDate).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}`}
              </h2>
            </div>
            <button onClick={onClose} className="bg-slate-100 p-2 rounded-full cursor-pointer hover:bg-slate-200">
              <X size={20} />
            </button>
          </div>

          {/* KONTENT */}
          <div className="overflow-auto flex-1 p-4">
            {!loaded ? (
              <p className="text-center py-12 text-slate-400 font-bold">Yuklanmoqda...</p>
            ) : list.length === 0 ? (
              <p className="text-center py-12 text-slate-400 font-bold">Hozircha yozuvlar yo'q</p>

            ) : step === 'months' ? (
              <div className="space-y-2">
                {months.map(m => {
                  const count = daysInMonth.length > 0
                    ? Object.keys(groupedData).filter(d => d.startsWith(m)).reduce((sum, d) => sum + groupedData[d].length, 0)
                    : Object.keys(groupedData).filter(d => d.startsWith(m)).reduce((sum, d) => sum + groupedData[d].length, 0);
                  return (
                    <button key={m} onClick={() => setSelectedMonth(m)}
                      className="w-full text-left p-4 rounded-2xl bg-white hover:bg-blue-900 hover:text-white border-2 border-slate-100 flex justify-between items-center cursor-pointer group transition-all shadow-sm">
                      <span className="font-black">📅 {formatMonth(m)}</span>
                      <span className="text-xs font-bold opacity-60 group-hover:opacity-100">
                        {Object.keys(groupedData).filter(d => d.startsWith(m)).reduce((sum, d) => sum + groupedData[d].length, 0)} ta yozuv
                      </span>
                    </button>
                  );
                })}
              </div>

            ) : step === 'days' ? (
              <div className="space-y-2">
                {daysInMonth.map(date => (
                  <button key={date} onClick={() => setSelectedDate(date)}
                    className="w-full text-left p-4 rounded-2xl bg-white hover:bg-blue-900 hover:text-white border-2 border-slate-100 flex justify-between items-center cursor-pointer group transition-all shadow-sm">
                    <span className="font-black">🗓 {new Date(date).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                    <span className="text-xs font-bold opacity-60 group-hover:opacity-100">{groupedData[date].length} ta yozuv</span>
                  </button>
                ))}
              </div>

            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse" style={{ minWidth: '1100px' }}>
                  <thead>
                    <tr className="bg-blue-900 text-white text-center">
                      <th className="border border-blue-700 p-2 w-8">№</th>
                      <th className="border border-blue-700 p-2 w-16">Oy/kun</th>
                      <th className="border border-blue-700 p-2 w-16">Soat</th>
                      <th className="border border-blue-700 p-3" style={{ minWidth: '200px' }}>Kamchilik bayoni</th>
                      <th className="border border-blue-700 p-2 w-16">Xabar oy/kun</th>
                      <th className="border border-blue-700 p-2 w-16">Xabar soat</th>
                      <th className="border border-blue-700 p-2 w-20">Xabar usuli</th>
                      <th className="border border-blue-700 p-2 w-16">Kelish oy/kun</th>
                      <th className="border border-blue-700 p-2 w-16">Kelish soat</th>
                      <th className="border border-blue-700 p-2 w-24">Imzo (DSP)</th>
                      <th className="border border-blue-700 p-2 w-16">Bartaraf oy/kun</th>
                      <th className="border border-blue-700 p-2 w-16">Bartaraf soat</th>
                      <th className="border border-blue-700 p-3" style={{ minWidth: '200px' }}>Bartaraf sababi va choralar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedData[selectedDate].map((r, i) => (
                      <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                        <td className="border border-slate-200 p-2 text-center font-black">{i + 1}</td>
                        <td className="border border-slate-200 p-2 text-center">{r.oy_kun}</td>
                        <td className="border border-slate-200 p-2 text-center">{r.soat_minut}</td>
                        <td className="border border-slate-200 p-3 font-bold">{r.kamchilik}</td>
                        <td className="border border-slate-200 p-2 text-center">{r.xabar_oy_kun}</td>
                        <td className="border border-slate-200 p-2 text-center">{r.xabar_soat}</td>
                        <td className="border border-slate-200 p-2 text-center">{r.xabar_usul}</td>
                        <td className="border border-slate-200 p-2 text-center">{r.kelish_oy_kun}</td>
                        <td className="border border-slate-200 p-2 text-center">{r.kelish_soat}</td>
                        <td className="border border-slate-200 p-2 font-bold text-blue-900 text-center">{r.worker_name}</td>
                        <td className="border border-slate-200 p-2 text-center">{r.bartaraf_oy_kun}</td>
                        <td className="border border-slate-200 p-2 text-center">{r.bartaraf_soat}</td>
                        <td className="border border-slate-200 p-3">{r.bartaraf_sabab}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // FORMA KO'RINISHI
  return (
    <div className="fixed inset-0 bg-black/80 z-210 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden flex flex-col max-h-[95vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b bg-blue-50 shrink-0">
          <h3 className="font-black text-blue-900 uppercase">📋 DU-46 — Yangi yozuv</h3>
          <button onClick={onClose} className="bg-white p-2 rounded-full cursor-pointer hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase">Oy va kun</label>
              <input {...f('oy_kun')} placeholder="11.03" className={inputCls} />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase">Soat va minut</label>
              <input {...f('soat_minut')} placeholder="14:30" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase">Kamchilik bayoni *</label>
            <textarea {...f('kamchilik')} placeholder="Topilgan kamchilikni yozing..." rows={3}
              className="w-full p-3 border-2 rounded-xl outline-none focus:border-blue-600 font-bold text-sm mt-1" />
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase">📢 Distansiyaning tegishli xodimi qachon xabar topgan</p>
            <div className="grid grid-cols-3 gap-2">
              <div><label className="text-[9px] font-black text-slate-400">Oy/kun</label><input {...f('xabar_oy_kun')} placeholder="11.03" className={inputCls} /></div>
              <div><label className="text-[9px] font-black text-slate-400">Soat</label><input {...f('xabar_soat')} placeholder="14:35" className={inputCls} /></div>
              <div><label className="text-[9px] font-black text-slate-400">Usul</label><input {...f('xabar_usul')} placeholder="Telefon" className={inputCls} /></div>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase">🚶 Distansiyaning tegishli xodimi nosozlik joyiga qachon yetib keldi</p>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-[9px] font-black text-slate-400">Oy/kun</label><input {...f('kelish_oy_kun')} placeholder="11.03" className={inputCls} /></div>
              <div><label className="text-[9px] font-black text-slate-400">Soat</label><input {...f('kelish_soat')} placeholder="14:50" className={inputCls} /></div>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-2xl space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase">Bartaraf etish</p>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-[9px] font-black text-slate-400">Oy/kun</label><input {...f('bartaraf_oy_kun')} placeholder="11.03" className={inputCls} /></div>
              <div><label className="text-[9px] font-black text-slate-400">Soat</label><input {...f('bartaraf_soat')} placeholder="15:10" className={inputCls} /></div>
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400">Sabab va ko'rilgan choralar</label>
              <textarea {...f('bartaraf_sabab')} placeholder="Sabab va choralar..." rows={2}
                className="w-full p-2 border-2 rounded-xl outline-none focus:border-blue-600 font-bold text-xs mt-1" />
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase">Imzo:</span>
            <span className="font-black text-blue-900">{workerName}</span>
          </div>
          <button onClick={save} disabled={isSaving}
            className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black cursor-pointer disabled:opacity-50 text-sm">
            {isSaving ? 'Saqlanmoqda...' : '💾 Saqlash'}
          </button>
        </div>
      </div>
    </div>
  );
}