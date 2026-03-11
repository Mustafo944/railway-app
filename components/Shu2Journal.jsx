"use client"
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';
import { X, ArrowLeft } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const emptyForm = { sana: '', ish_nomi: '' };

export default function Shu2Journal({ station, workerName, mode, onClose }) {
  const [list, setList] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedDate, setSelectedDate] = useState(null);
  const [groupedDates, setGroupedDates] = useState([]);
  const [groupedData, setGroupedData] = useState({});

  useEffect(() => {
    if (mode === 'archive') loadData();
  }, []);

  const loadData = async () => {
    const { data } = await supabase
      .from('shu2_journal')
      .select('*')
      .eq('station', station)
      .order('created_at', { ascending: false });
    if (data) {
      setList(data);
      const grouped = {};
      data.forEach(r => {
        const date = r.created_at?.slice(0, 10) || "Noma'lum";
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(r);
      });
      setGroupedData(grouped);
      setGroupedDates(Object.keys(grouped).sort((a, b) => b.localeCompare(a)));
    }
    setLoaded(true);
  };

  const save = async () => {
    if (!form.ish_nomi.trim()) return toast.error("Ish nomini kiriting!");
    setIsSaving(true);
    const { error } = await supabase.from('shu2_journal').insert({
      station,
      worker_name: workerName,
      ...form
    });
    if (!error) {
      toast.success("SHU-2 ga yozildi!");
      setForm(emptyForm);
      onClose();
    } else {
      toast.error("Xatolik yuz berdi!");
    }
    setIsSaving(false);
  };

  // ARXIV KO'RINISHI
  if (mode === 'archive') {
    return (
      <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden flex flex-col max-h-[95vh]">

          {/* HEADER */}
          <div className="flex justify-between items-center px-5 py-4 border-b bg-green-50 shrink-0">
            <div className="flex items-center gap-2">
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-green-900 font-black text-xs flex items-center gap-1 cursor-pointer hover:underline"
                >
                  <ArrowLeft size={16}/> Sanalar
                </button>
              )}
              {!selectedDate && (
                <h2 className="text-base font-black text-green-900 uppercase">
                  📒 SHU-2 Arxiv — {station}
                </h2>
              )}
              {selectedDate && (
                <h2 className="text-base font-black text-green-900 uppercase">
                  📒 SHU-2 — {new Date(selectedDate).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </h2>
              )}
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

            ) : !selectedDate ? (
              // SANALAR RO'YXATI
              <div className="space-y-2">
                {groupedDates.map(date => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className="w-full text-left p-4 rounded-2xl bg-white hover:bg-green-700 hover:text-white border-2 border-slate-100 flex justify-between items-center cursor-pointer group transition-all shadow-sm"
                  >
                    <span className="font-black">
                      📅 {new Date(date).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                    <span className="text-xs font-bold opacity-60 group-hover:opacity-100">
                      {groupedData[date].length} ta yozuv
                    </span>
                  </button>
                ))}
              </div>

            ) : (
              // TANLANGAN SANADAGI YOZUVLAR
              <div className="space-y-3">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-green-700 text-white text-center">
                      <th className="border border-green-600 p-2 w-10">№</th>
                      <th className="border border-green-600 p-3 w-28">Sana</th>
                      <th className="border border-green-600 p-3">Navbatchilikdagi yozuv va bajarilgan ishlar nomi</th>
                      <th className="border border-green-600 p-3 w-32">Imzo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedData[selectedDate].map((r, i) => (
                      <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-green-50'}>
                        <td className="border border-slate-200 p-2 text-center font-black">{i + 1}</td>
                        <td className="border border-slate-200 p-3 font-bold text-center">{r.sana}</td>
                        <td className="border border-slate-200 p-3">{r.ish_nomi}</td>
                        <td className="border border-slate-200 p-3 font-bold text-green-900 text-center">{r.worker_name}</td>
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
    <div className="fixed inset-0 bg-black/80 z-[210] flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b bg-green-50">
          <h3 className="font-black text-green-900 uppercase">📒 SHU-2 — Yangi yozuv</h3>
          <button onClick={onClose} className="bg-white p-2 rounded-full cursor-pointer hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase">Sana</label>
            <input
              value={form.sana}
              onChange={e => setForm({ ...form, sana: e.target.value })}
              placeholder="11.03.2026"
              className="w-full p-3 border-2 rounded-xl outline-none focus:border-green-600 font-bold text-sm mt-1"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase">
              Navbatchilikdagi yozuv va bajarilgan ishlar nomi
            </label>
            <textarea
              value={form.ish_nomi}
              onChange={e => setForm({ ...form, ish_nomi: e.target.value })}
              placeholder="Bajarilgan ish yoki yozuvni kiriting..."
              rows={5}
              className="w-full p-3 border-2 rounded-xl outline-none focus:border-green-600 font-bold text-sm mt-1"
            />
          </div>
          <div className="bg-green-50 p-3 rounded-xl flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase">Imzo:</span>
            <span className="font-black text-green-900">{workerName}</span>
          </div>
          <button onClick={save} disabled={isSaving}
            className="w-full bg-green-700 text-white py-4 rounded-2xl font-black cursor-pointer disabled:opacity-50 text-sm">
            {isSaving ? 'Saqlanmoqda...' : '💾 Saqlash'}
          </button>
        </div>
      </div>
    </div>
  );
}