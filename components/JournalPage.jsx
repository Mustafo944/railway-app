"use client"
import React, { useState, useEffect } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function JournalPage({ station, workerName, onBack, supabase }) {
  const [recentDu46, setRecentDu46] = useState([]);
  const [recentShu2, setRecentShu2] = useState([]);

  // DU-46 states
  const [showDu46Form, setShowDu46Form] = useState(false);
  const [showDu46Archive, setShowDu46Archive] = useState(false);
  const [du46ArchiveDates, setDu46ArchiveDates] = useState([]);
  const [du46ArchiveGrouped, setDu46ArchiveGrouped] = useState({});
  const [du46SelectedDate, setDu46SelectedDate] = useState(null);
  const [du46Form, setDu46Form] = useState({
    oy_kun: '', soat_minut: '', kamchilik: '',
    xabar_oy_kun: '', xabar_soat: '', xabar_usul: '',
    kelish_oy_kun: '', kelish_soat: '',
    bartaraf_oy_kun: '', bartaraf_soat: '', bartaraf_sabab: ''
  });

  // SHU-2 states
  const [showShu2Form, setShowShu2Form] = useState(false);
  const [showShu2Archive, setShowShu2Archive] = useState(false);
  const [shu2ArchiveDates, setShu2ArchiveDates] = useState([]);
  const [shu2ArchiveGrouped, setShu2ArchiveGrouped] = useState({});
  const [shu2SelectedDate, setShu2SelectedDate] = useState(null);
  const [shu2Form, setShu2Form] = useState({ sana: '', ish_nomi: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDu46, setSelectedDu46] = useState(null);
  const [selectedShu2, setSelectedShu2] = useState(null);

  useEffect(() => {
    loadRecent();
  }, []);

  const loadRecent = async () => {
    const today = new Date().toISOString().slice(0, 10);

    const { data: du46 } = await supabase
      .from('du46_journal')
      .select('*')
      .eq('station', station)
      .gte('created_at', today + 'T00:00:00')
      .lte('created_at', today + 'T23:59:59')
      .order('created_at', { ascending: false });
    if (du46) setRecentDu46(du46);

    const { data: shu2 } = await supabase
      .from('shu2_journal')
      .select('*')
      .eq('station', station)
      .gte('created_at', today + 'T00:00:00')
      .lte('created_at', today + 'T23:59:59')
      .order('created_at', { ascending: false });
    if (shu2) setRecentShu2(shu2);
  };

  const loadDu46Archive = async () => {
    const { data } = await supabase
      .from('du46_journal')
      .select('*')
      .eq('station', station)
      .order('created_at', { ascending: false });
    if (data) {
      const grouped = {};
      data.forEach(r => {
        const date = r.created_at?.slice(0, 10);
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(r);
      });
      setDu46ArchiveGrouped(grouped);
      setDu46ArchiveDates(Object.keys(grouped).sort((a, b) => b.localeCompare(a)));
      setShowDu46Archive(true);
    }
  };

  const loadShu2Archive = async () => {
    const { data } = await supabase
      .from('shu2_journal')
      .select('*')
      .eq('station', station)
      .order('created_at', { ascending: false });
    if (data) {
      const grouped = {};
      data.forEach(r => {
        const date = r.created_at?.slice(0, 10);
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(r);
      });
      setShu2ArchiveGrouped(grouped);
      setShu2ArchiveDates(Object.keys(grouped).sort((a, b) => b.localeCompare(a)));
      setShowShu2Archive(true);
    }
  };

  const saveDu46 = async () => {
    if (!du46Form.kamchilik.trim()) return toast.error("Kamchilik bayon qilinmagan!");
    setIsSaving(true);
    const { error } = await supabase.from('du46_journal').insert({
      station, worker_name: workerName, ...du46Form
    });
    if (!error) {
      toast.success("DU-46 ga yozildi!");
      setDu46Form({ oy_kun: '', soat_minut: '', kamchilik: '', xabar_oy_kun: '', xabar_soat: '', xabar_usul: '', kelish_oy_kun: '', kelish_soat: '', bartaraf_oy_kun: '', bartaraf_soat: '', bartaraf_sabab: '' });
      setShowDu46Form(false);
      loadRecent();
    } else { toast.error("Xatolik!"); }
    setIsSaving(false);
  };

  const saveShu2 = async () => {
    if (!shu2Form.ish_nomi.trim()) return toast.error("Ish nomini kiriting!");
    setIsSaving(true);
    const { error } = await supabase.from('shu2_journal').insert({
      station, worker_name: workerName, ...shu2Form
    });
    if (!error) {
      toast.success("SHU-2 ga yozildi!");
      setShu2Form({ sana: '', ish_nomi: '' });
      setShowShu2Form(false);
      loadRecent();
    } else { toast.error("Xatolik!"); }
    setIsSaving(false);
  };

  const inputCls = "w-full p-2 border-2 rounded-xl outline-none focus:border-blue-600 font-bold text-xs mt-1";
  const fmtDate = (d) => new Date(d).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-300 pb-10">

      {/* HEADER */}
      <div className="flex items-center mb-5">
        <button onClick={onBack} className="flex items-center gap-2 font-black text-blue-900 text-xs cursor-pointer hover:underline">
          <ArrowLeft size={16}/> Ortga
        </button>
        <h2 className="text-lg font-black uppercase ml-4">📔 Jurnallar — {station}</h2>
      </div>

      <p className="text-[10px] font-black uppercase text-slate-400 mb-3">Bugungi yozuvlar</p>

      {/* DU-46 BLOK */}
      <div className="bg-white border-2 border-blue-100 rounded-3xl overflow-hidden mb-4 shadow-sm">
        <div className="bg-blue-50 px-5 py-3 flex justify-between items-center border-b border-blue-100">
          <p className="font-black text-blue-900">📋 DU-46</p>
          <div className="flex gap-2">
            <button onClick={() => setShowDu46Form(true)}
              className="bg-blue-900 text-white px-3 py-1.5 rounded-xl font-black text-xs cursor-pointer">
              + Yozuv
            </button>
            <button onClick={loadDu46Archive}
              className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-black text-xs cursor-pointer">
              📂 Arxiv
            </button>
          </div>
        </div>
        <div className="p-4">
          {recentDu46.length === 0 ? (
            <p className="text-center py-4 text-slate-400 text-xs font-bold">Bugun yozuv yo'q</p>
          ) : (
            <div className="space-y-2">
              {recentDu46.map((r) => (
                <button key={r.id} onClick={() => setSelectedDu46(r)}
                  className="w-full text-left bg-blue-50 p-3 rounded-xl border border-blue-100 hover:bg-blue-100 cursor-pointer">
                  <p className="font-black text-xs">{r.kamchilik}</p>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">
                    👤 {r.worker_name} · {r.oy_kun} {r.soat_minut}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SHU-2 BLOK */}
      <div className="bg-white border-2 border-green-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="bg-green-50 px-5 py-3 flex justify-between items-center border-b border-green-100">
          <p className="font-black text-green-900">📒 SHU-2</p>
          <div className="flex gap-2">
            <button onClick={() => setShowShu2Form(true)}
              className="bg-green-700 text-white px-3 py-1.5 rounded-xl font-black text-xs cursor-pointer">
              + Yozuv
            </button>
            <button onClick={loadShu2Archive}
              className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-black text-xs cursor-pointer">
              📂 Arxiv
            </button>
          </div>
        </div>
        <div className="p-4">
          {recentShu2.length === 0 ? (
            <p className="text-center py-4 text-slate-400 text-xs font-bold">Bugun yozuv yo'q</p>
          ) : (
            <div className="space-y-2">
              {recentShu2.map((r) => (
                <button key={r.id} onClick={() => setSelectedShu2(r)}
                  className="w-full text-left bg-green-50 p-3 rounded-xl border border-green-100 hover:bg-green-100 cursor-pointer">
                  <p className="font-black text-xs">{r.ish_nomi}</p>
                  <p className="text-[10px] text-slate-500 font-bold mt-1">
                    👤 {r.worker_name} · {r.sana}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DU-46 FORMA MODALI */}
      {showDu46Form && (
        <div className="fixed inset-0 bg-black/80 z-[210] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b bg-blue-50 shrink-0">
              <h3 className="font-black text-blue-900 uppercase">📋 DU-46 — Yangi yozuv</h3>
              <button onClick={() => setShowDu46Form(false)} className="bg-white p-2 rounded-full cursor-pointer"><X size={20}/></button>
            </div>
            <div className="overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase">Oy va kun</label>
                  <input value={du46Form.oy_kun} onChange={e => setDu46Form({...du46Form, oy_kun: e.target.value})} placeholder="11.03" className={inputCls}/>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase">Soat va minut</label>
                  <input value={du46Form.soat_minut} onChange={e => setDu46Form({...du46Form, soat_minut: e.target.value})} placeholder="14:30" className={inputCls}/>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase">Ko'rik,tekshiruvlar taxlili,shuningdek topilgan kamchiliklar bayoni</label>
                <textarea value={du46Form.kamchilik} onChange={e => setDu46Form({...du46Form, kamchilik: e.target.value})} rows={3} placeholder="Topilgan kamchilikni yozing..." className="w-full p-3 border-2 rounded-xl outline-none focus:border-blue-600 font-bold text-sm mt-1"/>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase">Distansiyaning tegishli xodimi qachon xabar topgan</p>
                <div className="grid grid-cols-3 gap-2">
                  <div><label className="text-[9px] font-black text-slate-400">Oy/kun</label><input value={du46Form.xabar_oy_kun} onChange={e => setDu46Form({...du46Form, xabar_oy_kun: e.target.value})} placeholder="11.03" className={inputCls}/></div>
                  <div><label className="text-[9px] font-black text-slate-400">Soat</label><input value={du46Form.xabar_soat} onChange={e => setDu46Form({...du46Form, xabar_soat: e.target.value})} placeholder="14:35" className={inputCls}/></div>
                  <div><label className="text-[9px] font-black text-slate-400">Xabar berish usuli</label><input value={du46Form.xabar_usul} onChange={e => setDu46Form({...du46Form, xabar_usul: e.target.value})} placeholder="Telefon" className={inputCls}/></div>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase">Distansiyaning tegishli xodimi nosozlik yoki qurilma ishlamay qolgan joyiga qachon yetib keldi</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-[9px] font-black text-slate-400">Oy/kun</label><input value={du46Form.kelish_oy_kun} onChange={e => setDu46Form({...du46Form, kelish_oy_kun: e.target.value})} placeholder="11.03" className={inputCls}/></div>
                  <div><label className="text-[9px] font-black text-slate-400">Soat</label><input value={du46Form.kelish_soat} onChange={e => setDu46Form({...du46Form, kelish_soat: e.target.value})} placeholder="14:50" className={inputCls}/></div>
                </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase">Nosozlik yoki qurilma ishlamay qolishi qachon aniqlandi,nosozlikni bartaraf qilish sabablari</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-[9px] font-black text-slate-400">Oy/kun</label><input value={du46Form.bartaraf_oy_kun} onChange={e => setDu46Form({...du46Form, bartaraf_oy_kun: e.target.value})} placeholder="11.03" className={inputCls}/></div>
                  <div><label className="text-[9px] font-black text-slate-400">Soat</label><input value={du46Form.bartaraf_soat} onChange={e => setDu46Form({...du46Form, bartaraf_soat: e.target.value})} placeholder="15:10" className={inputCls}/></div>
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400">Nosozlik yoki qurilma ishlamay qolishi qachon aniqlandi,nosozlikni bartaraf qilish sabablari,ko'rilgan choralar,kim tomondan</label>
                  <textarea value={du46Form.bartaraf_sabab} onChange={e => setDu46Form({...du46Form, bartaraf_sabab: e.target.value})} rows={2} placeholder="Sabab..." className="w-full p-2 border-2 rounded-xl outline-none focus:border-blue-600 font-bold text-xs mt-1"/>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-500 uppercase">Imzo:</span>
                <span className="font-black text-blue-900">{workerName}</span>
              </div>
              <button onClick={saveDu46} disabled={isSaving} className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black cursor-pointer disabled:opacity-50">
                {isSaving ? 'Saqlanmoqda...' : '💾 Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHU-2 FORMA MODALI */}
      {showShu2Form && (
        <div className="fixed inset-0 bg-black/80 z-[210] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b bg-green-50">
              <h3 className="font-black text-green-900 uppercase">📒 SHU-2 — Yangi yozuv</h3>
              <button onClick={() => setShowShu2Form(false)} className="bg-white p-2 rounded-full cursor-pointer"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase">Sana</label>
                <input value={shu2Form.sana} onChange={e => setShu2Form({...shu2Form, sana: e.target.value})} placeholder="11.03.2026" className="w-full p-3 border-2 rounded-xl outline-none focus:border-green-600 font-bold text-sm mt-1"/>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase">Bajarilgan ishlar nomi</label>
                <textarea value={shu2Form.ish_nomi} onChange={e => setShu2Form({...shu2Form, ish_nomi: e.target.value})} rows={5} placeholder="Bajarilgan ish..." className="w-full p-3 border-2 rounded-xl outline-none focus:border-green-600 font-bold text-sm mt-1"/>
              </div>
              <div className="bg-green-50 p-3 rounded-xl flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-500 uppercase">Imzo:</span>
                <span className="font-black text-green-900">{workerName}</span>
              </div>
              <button onClick={saveShu2} disabled={isSaving} className="w-full bg-green-700 text-white py-4 rounded-2xl font-black cursor-pointer disabled:opacity-50">
                {isSaving ? 'Saqlanmoqda...' : '💾 Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DU-46 ARXIV MODALI */}
      {showDu46Archive && (
        <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b bg-blue-50 shrink-0">
              <div className="flex items-center gap-2">
                {du46SelectedDate && (
                  <button onClick={() => setDu46SelectedDate(null)} className="text-blue-900 font-black text-xs flex items-center gap-1 cursor-pointer hover:underline">
                    <ArrowLeft size={14}/> Sanalar
                  </button>
                )}
                <h3 className="font-black text-blue-900 uppercase">
                  {du46SelectedDate ? `DU-46 — ${fmtDate(du46SelectedDate)}` : '📋 DU-46 Arxiv'}
                </h3>
              </div>
              <button onClick={() => { setShowDu46Archive(false); setDu46SelectedDate(null); }} className="bg-slate-100 p-2 rounded-full cursor-pointer"><X size={20}/></button>
            </div>
            <div className="overflow-auto flex-1 p-4">
              {!du46SelectedDate ? (
                <div className="space-y-2">
                  {du46ArchiveDates.length === 0 ? (
                    <p className="text-center py-8 text-slate-400 font-bold">Arxiv bo'sh</p>
                  ) : du46ArchiveDates.map(date => (
                    <button key={date} onClick={() => setDu46SelectedDate(date)}
                      className="w-full text-left p-4 rounded-2xl bg-white hover:bg-blue-900 hover:text-white border-2 border-slate-100 flex justify-between items-center cursor-pointer group transition-all">
                      <span className="font-black">📅 {fmtDate(date)}</span>
                      <span className="text-xs font-bold opacity-60 group-hover:opacity-100">{du46ArchiveGrouped[date].length} ta yozuv</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse" style={{ minWidth: '1000px' }}>
                    <thead>
                      <tr className="bg-blue-900 text-white text-center">
                        <th className="border border-blue-700 p-2">№</th>
                        <th className="border border-blue-700 p-2">Oy/kun</th>
                        <th className="border border-blue-700 p-2">Soat</th>
                        <th className="border border-blue-700 p-2" style={{minWidth:'160px'}}>Kamchilik bayoni</th>
                        <th className="border border-blue-700 p-2">Xabar oy/kun</th>
                        <th className="border border-blue-700 p-2">Xabar soat</th>
                        <th className="border border-blue-700 p-2">Xabar usuli</th>
                        <th className="border border-blue-700 p-2">Kelish oy/kun</th>
                        <th className="border border-blue-700 p-2">Kelish soat</th>
                        <th className="border border-blue-700 p-2">Imzo</th>
                        <th className="border border-blue-700 p-2">Bartaraf oy/kun</th>
                        <th className="border border-blue-700 p-2">Bartaraf soat</th>
                        <th className="border border-blue-700 p-2" style={{minWidth:'160px'}}>Bartaraf sababi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {du46ArchiveGrouped[du46SelectedDate].map((r, i) => (
                        <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                          <td className="border border-slate-200 p-2 text-center font-black">{i+1}</td>
                          <td className="border border-slate-200 p-2 text-center">{r.oy_kun}</td>
                          <td className="border border-slate-200 p-2 text-center">{r.soat_minut}</td>
                          <td className="border border-slate-200 p-2 font-bold">{r.kamchilik}</td>
                          <td className="border border-slate-200 p-2 text-center">{r.xabar_oy_kun}</td>
                          <td className="border border-slate-200 p-2 text-center">{r.xabar_soat}</td>
                          <td className="border border-slate-200 p-2 text-center">{r.xabar_usul}</td>
                          <td className="border border-slate-200 p-2 text-center">{r.kelish_oy_kun}</td>
                          <td className="border border-slate-200 p-2 text-center">{r.kelish_soat}</td>
                          <td className="border border-slate-200 p-2 font-bold text-blue-900 text-center">{r.worker_name}</td>
                          <td className="border border-slate-200 p-2 text-center">{r.bartaraf_oy_kun}</td>
                          <td className="border border-slate-200 p-2 text-center">{r.bartaraf_soat}</td>
                          <td className="border border-slate-200 p-2">{r.bartaraf_sabab}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SHU-2 ARXIV MODALI */}
      {showShu2Archive && (
        <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b bg-green-50 shrink-0">
              <div className="flex items-center gap-2">
                {shu2SelectedDate && (
                  <button onClick={() => setShu2SelectedDate(null)} className="text-green-900 font-black text-xs flex items-center gap-1 cursor-pointer hover:underline">
                    <ArrowLeft size={14}/> Sanalar
                  </button>
                )}
                <h3 className="font-black text-green-900 uppercase">
                  {shu2SelectedDate ? `SHU-2 — ${fmtDate(shu2SelectedDate)}` : '📒 SHU-2 Arxiv'}
                </h3>
              </div>
              <button onClick={() => { setShowShu2Archive(false); setShu2SelectedDate(null); }} className="bg-slate-100 p-2 rounded-full cursor-pointer"><X size={20}/></button>
            </div>
            <div className="overflow-auto flex-1 p-4">
              {!shu2SelectedDate ? (
                <div className="space-y-2">
                  {shu2ArchiveDates.length === 0 ? (
                    <p className="text-center py-8 text-slate-400 font-bold">Arxiv bo'sh</p>
                  ) : shu2ArchiveDates.map(date => (
                    <button key={date} onClick={() => setShu2SelectedDate(date)}
                      className="w-full text-left p-4 rounded-2xl bg-white hover:bg-green-700 hover:text-white border-2 border-slate-100 flex justify-between items-center cursor-pointer group transition-all">
                      <span className="font-black">📅 {fmtDate(date)}</span>
                      <span className="text-xs font-bold opacity-60 group-hover:opacity-100">{shu2ArchiveGrouped[date].length} ta yozuv</span>
                    </button>
                  ))}
                </div>
              ) : (
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-green-700 text-white text-center">
                      <th className="border border-green-600 p-2 w-10">№</th>
                      <th className="border border-green-600 p-3 w-28">Sana</th>
                      <th className="border border-green-600 p-3">Bajarilgan ishlar nomi</th>
                      <th className="border border-green-600 p-3 w-32">Imzo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shu2ArchiveGrouped[shu2SelectedDate].map((r, i) => (
                      <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-green-50'}>
                        <td className="border border-slate-200 p-2 text-center font-black">{i+1}</td>
                        <td className="border border-slate-200 p-3 font-bold text-center">{r.sana}</td>
                        <td className="border border-slate-200 p-3">{r.ish_nomi}</td>
                        <td className="border border-slate-200 p-3 font-bold text-green-900 text-center">{r.worker_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DU-46 DETAIL MODALI */}
 {/* DU-46 DETAIL MODALI */}
{selectedDu46 && (
  <div className="fixed inset-0 bg-black/70 z-[210] flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden overflow-y-auto max-h-[90vh]">
      <div className="flex justify-between items-center px-6 py-4 border-b bg-blue-50">
        <h3 className="font-black text-blue-900">📋 DU-46 yozuv</h3>
        <button onClick={() => setSelectedDu46(null)} className="bg-white p-2 rounded-full cursor-pointer"><X size={20}/></button>
      </div>
      <div className="p-6 space-y-3 text-sm">
        
        {/* SANA VA SOAT */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl">
            <p className="text-[10px] text-slate-400 font-black uppercase">Oy/kun</p>
            <p className="font-bold">{selectedDu46.oy_kun}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl">
            <p className="text-[10px] text-slate-400 font-black uppercase">Soat</p>
            <p className="font-bold">{selectedDu46.soat_minut}</p>
          </div>
        </div>

        {/* KAMCHILIK BAYONI */}
        <div className="bg-slate-50 p-3 rounded-xl">
          <p className="text-[10px] text-slate-400 font-black uppercase">Kamchilik bayoni</p>
          <p className="font-bold">{selectedDu46.kamchilik}</p>
        </div>

        {/* XABAR BERISH DETAIL - O'ZGARTIRILDI */}
        <div className="bg-slate-50 p-3 rounded-xl space-y-2">
          <p className="text-[10px] text-slate-400 font-black uppercase">
            📢 Distansiyaning tegishli xodimi qachon xabar topgan
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[9px] text-slate-400 font-black">Oy/kun</p>
              <p className="font-bold">{selectedDu46.xabar_oy_kun}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-black">Soat</p>
              <p className="font-bold">{selectedDu46.xabar_soat}</p>
            </div>
          </div>
          {selectedDu46.xabar_usul && (
            <div className="mt-1">
              <p className="text-[9px] text-slate-400 font-black">Xabar usuli</p>
              <p className="font-bold text-sm">{selectedDu46.xabar_usul}</p>
            </div>
          )}
        </div>

        {/* KELISH VAQTI DETAIL - O'ZGARTIRILDI */}
        <div className="bg-slate-50 p-3 rounded-xl space-y-2">
          <p className="text-[10px] text-slate-400 font-black uppercase">
             Distansiyaning tegishli xodimi nosozlik joyiga qachon yetib keldi
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[9px] text-slate-400 font-black">Oy/kun</p>
              <p className="font-bold">{selectedDu46.kelish_oy_kun}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-black">Soat</p>
              <p className="font-bold">{selectedDu46.kelish_soat}</p>
            </div>
          </div>
        </div>

        {/* BARTARAF ETISH */}
        {/* BARTARAF ETISH - O'ZGARTIRILDI */}
<div className="space-y-2">
  <p className="text-[10px] text-slate-400 font-black uppercase px-1">
    Nosozlik yoki qurilma ishlamay qolishi qachon aniqlandi? nosozlikni bartaraf qilish sabablari
  </p>
  <div className="grid grid-cols-2 gap-2">
    <div className="bg-slate-50 p-3 rounded-xl">
      <p className="text-[10px] text-slate-400 font-black capitalize">oy/kun</p>
      <p className="font-bold">{selectedDu46.bartaraf_oy_kun}</p>
    </div>
    <div className="bg-slate-50 p-3 rounded-xl">
      <p className="text-[10px] text-slate-400 font-black ">Soat va minut</p>
      <p className="font-bold">{selectedDu46.bartaraf_soat}</p>
    </div>
  </div>
</div>
        
        <div className="bg-slate-50 p-3 rounded-xl">
          <p className="text-[10px] text-slate-400 font-black">Nosozlik yoki qurilma ishlamay qolishi qachon aniqlangan, nosozlikni bartaraf qilish sabablari, ko'rilgan choralar, kim tomonidan</p>
          <p className="font-bold">{selectedDu46.bartaraf_sabab}</p>
        </div>

        {/* IMOZO */}
        <div className="bg-blue-50 p-3 rounded-xl flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-500 uppercase">Imzo:</span>
          <span className="font-black text-blue-900">{selectedDu46.worker_name}</span>
        </div>
      </div>
    </div>
  </div>
)}
      {/* SHU-2 DETAIL MODALI */}
      {selectedShu2 && (
        <div className="fixed inset-0 bg-black/70 z-[210] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b bg-green-50">
              <h3 className="font-black text-green-900">📒 SHU-2 yozuv</h3>
              <button onClick={() => setSelectedShu2(null)} className="bg-white p-2 rounded-full cursor-pointer"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="bg-slate-50 p-3 rounded-xl"><p className="text-[10px] text-slate-400 font-black uppercase">Sana</p><p className="font-bold">{selectedShu2.sana}</p></div>
              <div className="bg-slate-50 p-3 rounded-xl"><p className="text-[10px] text-slate-400 font-black uppercase">Bajarilgan ish</p><p className="font-bold">{selectedShu2.ish_nomi}</p></div>
              <div className="bg-green-50 p-3 rounded-xl flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-500 uppercase">Imzo:</span>
                <span className="font-black text-green-900">{selectedShu2.worker_name}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}