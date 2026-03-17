"use client"
import { useState } from 'react';
import { ShieldCheck, X, Save, Edit3, Trash2, ChevronDown, ChevronUp, User, Phone, Lock, Hash, Briefcase, MapPin, Plus } from 'lucide-react';

const LAVOZIMLAR = [
  { value: 'bosh_muhandis', label: 'Bosh muhandis', emoji: '🟣' },
  { value: 'boshliq_muovini', label: 'Boshliq muovini', emoji: '🔵' },
  { value: 'bekat_boshlig', label: "Bekat boshlig'i", emoji: '🟤' },
  { value: 'katta_elektromexanik', label: 'Katta elektromexanik', emoji: '🟠' },
  { value: 'elektromexanik', label: 'Elektromexanik', emoji: '🟢' },
  { value: 'elektromontyor', label: 'Elektromontyor', emoji: '⚪' },
];

const ROLE_LABELS = {
  admin: { label: 'ADMIN', color: 'bg-red-600' },
  boss: { label: 'BOSS', color: 'bg-blue-900' },
  bosh_muhandis: { label: 'BOSH MUHANDIS', color: 'bg-purple-700' },
  boshliq_muovini: { label: "BOSHLIQ MUOVINI", color: 'bg-indigo-700' },
  bekat_boshlig: { label: "BEKAT BOSHLIG'I", color: 'bg-teal-700' },
  katta_elektromexanik: { label: 'KATTA ELEKTROMEXANIK', color: 'bg-orange-600' },
  elektromexanik: { label: 'ELEKTROMEXANIK', color: 'bg-green-700' },
  elektromontyor: { label: 'ELEKTROMONTYOR', color: 'bg-slate-600' },
};

const TOP_ROLES = ['admin', 'boss', 'bosh_muhandis', 'boshliq_muovini'];

const stationDisplay = (station) => {
  if (!station) return '';
  if (Array.isArray(station)) return station.join(', ');
  return station;
};

const InputField = ({ icon: Icon, placeholder, value, onChange, type = 'text' }) => (
  <div className="relative group">
    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
      <Icon size={15}/>
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-slate-200 bg-white font-bold text-sm outline-none focus:border-orange-400 transition-all placeholder:font-normal placeholder:text-slate-400 text-slate-800"
    />
  </div>
);

export default function AdminPanel({
  workersList,
  newWorkerName, setNewWorkerName,
  newWorkerId, setNewWorkerId,
  newWorkerPass, setNewWorkerPass,
  newWorkerPhone, setNewWorkerPhone,
  newWorkerStation, setNewWorkerStation,
  newWorkerRole, setNewWorkerRole,
  editingWorker, setEditingWorker,
  editName, setEditName,
  editPass, setEditPass,
  editId, setEditId,
  editPhone, setEditPhone,
  editStation, setEditStation,
  editRole, setEditRole,
  BEKATLAR,
  addWorker,
  removeWorker,
  saveEdit,
  handleEditClick,
  onClose,
}) {
  const [openStation, setOpenStation] = useState(null);
  const [formOpen, setFormOpen] = useState(true);

  const toggleStationSelect = (bekat, isEdit = false) => {
    if (isEdit) {
      const current = Array.isArray(editStation) ? editStation : (editStation ? [editStation] : []);
      if (current.includes(bekat)) setEditStation(current.filter(b => b !== bekat));
else if (current.length < 3) setEditStation([...current, bekat]);
    } else {
      const current = Array.isArray(newWorkerStation) ? newWorkerStation : (newWorkerStation ? [newWorkerStation] : []);
      if (current.includes(bekat)) setNewWorkerStation(current.filter(b => b !== bekat));
     else if (current.length < 3) setNewWorkerStation([...current, bekat]);
    }
  };

 const isMultiStation = (role) => ['katta_elektromexanik', 'bekat_boshlig'].includes(role);
  const isWorkerLevel = (role) => ['bekat_boshlig', 'katta_elektromexanik', 'elektromexanik', 'elektromontyor'].includes(role);
  const isProtected = (role) => ['admin', 'boss'].includes(role);

  const topWorkers = workersList.filter(w => TOP_ROLES.includes(w.role));
  const stationWorkers = (station) => workersList.filter(w => {
    if (!w.station || TOP_ROLES.includes(w.role)) return false;
    return w.station.split(',').map(s => s.trim()).includes(station);
  });
  const activeStations = BEKATLAR.filter(s => stationWorkers(s).length > 0);

  const selectedLavozim = LAVOZIMLAR.find(l => l.value === newWorkerRole);

  const WorkerCard = ({ w }) => (
    <div className={`bg-white border-2 rounded-2xl p-3 sm:p-4 ${isProtected(w.role) ? 'border-orange-200 bg-orange-50' : 'border-slate-100'}`}>
      {editingWorker?.id === w.id ? (
        <div className="space-y-2">
          <InputField icon={User} placeholder="F.I.SH" value={editName} onChange={e => setEditName(e.target.value)}/>
          {!isProtected(w.role) && (
            <>
              <InputField icon={Hash} placeholder="Yangi ID" value={editId} onChange={e => setEditId(e.target.value)}/>
              <InputField icon={Lock} placeholder="Yangi parol" value={editPass} onChange={e => setEditPass(e.target.value)}/>
              <InputField icon={Phone} placeholder="Telefon (+998...)" type="tel" value={editPhone || ''} onChange={e => setEditPhone(e.target.value)}/>
              <select value={editRole || w.role} onChange={e => { setEditRole(e.target.value); setEditStation(''); }}
                className="w-full p-3 border-2 rounded-2xl text-xs font-bold outline-none focus:border-orange-400 bg-white">
                {LAVOZIMLAR.map(l => <option key={l.value} value={l.value}>{l.emoji} {l.label}</option>)}
              </select>
              {isWorkerLevel(editRole || w.role) && (
                isMultiStation(editRole || w.role) ? (
                  <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 space-y-2">
                    <p className="text-[9px] font-black text-slate-500 uppercase">Bekatlar (max 3)</p>
                    <div className="flex flex-wrap gap-1">
                      {BEKATLAR.map(b => {
                        const selected = Array.isArray(editStation) ? editStation.includes(b) : editStation === b;
                        return (
                          <button key={b} type="button" onClick={() => toggleStationSelect(b, true)}
                            className={`px-2 py-1 rounded-lg text-[9px] font-black cursor-pointer transition-all ${selected ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
                            {b}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <select value={Array.isArray(editStation) ? editStation[0] || '' : editStation} onChange={e => setEditStation(e.target.value)}
                    className="w-full p-3 border-2 rounded-2xl text-xs font-bold outline-none focus:border-orange-400 bg-white">
                    <option value="">Bekat tanlang</option>
                    {BEKATLAR.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                )
              )}
            </>
          )}
          <div className="flex gap-2">
            <button onClick={saveEdit} className="flex-1 bg-green-600 text-white p-2.5 rounded-xl font-black text-xs cursor-pointer flex items-center justify-center gap-1 hover:bg-green-700 transition">
              <Save size={14}/> Saqlash
            </button>
            <button onClick={() => setEditingWorker(null)} className="flex-1 bg-slate-100 p-2.5 rounded-xl font-black text-xs cursor-pointer hover:bg-slate-200 transition">
              Bekor
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-black text-xs sm:text-sm">{w.full_name}</p>
              {ROLE_LABELS[w.role] && (
                <span className={`${ROLE_LABELS[w.role].color} text-white text-[7px] px-1.5 py-0.5 rounded-full font-black`}>
                  {ROLE_LABELS[w.role].label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <p className="font-mono text-orange-600 text-[9px]">{w.worker_id}</p>
              {w.station && <p className="text-[8px] font-black text-purple-600">📍 {stationDisplay(w.station)}</p>}
            </div>
            {w.phone && <p className="text-[9px] font-bold text-green-600 mt-0.5">📞 {w.phone}</p>}
          </div>
          <div className="flex gap-1">
            <button onClick={() => handleEditClick(w)} className="text-blue-600 p-2 hover:bg-blue-50 rounded-xl cursor-pointer transition">
              <Edit3 size={15}/>
            </button>
            {!isProtected(w.role) ? (
              <button onClick={() => removeWorker(w)} className="text-red-500 p-2 hover:bg-red-50 rounded-xl cursor-pointer transition">
                <Trash2 size={15}/>
              </button>
            ) : (
              <div className="p-2"><ShieldCheck size={15} className="text-orange-300"/></div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{backdropFilter: 'blur(8px)'}}>
      <div className="bg-white w-full sm:max-w-2xl h-[92vh] sm:h-[90vh] rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">

        {/* HEADER */}
        <div className="relative px-5 pt-5 pb-4 shrink-0" style={{background: 'linear-gradient(135deg, #1e3a8a, #3730a3)'}}>
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full" style={{background: 'radial-gradient(circle, white, transparent)', transform: 'translate(30%, -30%)'}}/>
          {/* Mobil drag indicator */}
          <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-3 sm:hidden"/>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-2xl">
                <ShieldCheck size={20} className="text-white"/>
              </div>
              <div>
                <h2 className="text-base font-black text-white uppercase">Ishchilar boshqaruvi</h2>
                <p className="text-blue-300 text-[10px] font-bold">{workersList.length} ta xodim</p>
              </div>
            </div>
<button onClick={onClose} className="bg-white/15 hover:bg-white/25 p-2 rounded-xl text-white cursor-pointer transition z-10 relative">
  <X size={20}/>
</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">

          {/* YANGI ISHCHI QO'SHISH — ZAMONAVIY FORMA */}
          <div className="rounded-3xl overflow-hidden shadow-sm border border-slate-100">
            {/* Forma header — bosilsa ochiladi */}
            <button
              onClick={() => setFormOpen(!formOpen)}
              className="w-full flex items-center justify-between p-4 bg-white cursor-pointer hover:bg-orange-50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #f97316, #ea580c)'}}>
                  <Plus size={18} className="text-white"/>
                </div>
                <div className="text-left">
                  <p className="font-black text-sm text-slate-800">Yangi ishchi qo'shish</p>
                  <p className="text-[10px] text-slate-400 font-bold">Ma'lumotlarni to'ldiring</p>
                </div>
              </div>
              <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${formOpen ? 'rotate-180' : ''}`}/>
            </button>

            {/* Forma body */}
            {formOpen && (
              <div className="p-4 bg-white border-t border-slate-50 space-y-3">

                {/* Shaxsiy ma'lumotlar */}
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest px-1">👤 Shaxsiy ma'lumotlar</p>
                  <InputField icon={User} placeholder="F.I.SH (To'liq ism)" value={newWorkerName} onChange={e => setNewWorkerName(e.target.value)}/>
                  <div className="grid grid-cols-2 gap-2">
                    <InputField icon={Hash} placeholder="ID raqami" value={newWorkerId} onChange={e => setNewWorkerId(e.target.value)}/>
                    <InputField icon={Lock} placeholder="Parol" value={newWorkerPass} onChange={e => setNewWorkerPass(e.target.value)}/>
                  </div>
                  <InputField icon={Phone} placeholder="Telefon raqami (+998...)" type="tel" value={newWorkerPhone || ''} onChange={e => setNewWorkerPhone(e.target.value)}/>
                </div>

                {/* Lavozim tanlash */}
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">💼 Lavozim</p>
                  <div className="grid grid-cols-2 gap-2">
                    {LAVOZIMLAR.map(l => (
                      <button
                        key={l.value}
                        type="button"
                        onClick={() => { setNewWorkerRole(l.value); setNewWorkerStation(''); }}
                        className={`flex items-center gap-2 p-3 rounded-2xl border-2 cursor-pointer transition-all text-left ${
                          newWorkerRole === l.value
                            ? 'border-orange-400 bg-orange-50'
                            : 'border-slate-100 bg-white hover:border-orange-200 hover:bg-orange-50/50'
                        }`}
                      >
                        <span className="text-base">{l.emoji}</span>
                        <span className={`text-[10px] font-black leading-tight ${newWorkerRole === l.value ? 'text-orange-700' : 'text-slate-600'}`}>
                          {l.label}
                        </span>
                        {newWorkerRole === l.value && (
                          <div className="ml-auto w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                            <div className="w-2 h-2 rounded-full bg-white"/>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bekat tanlash */}
                {isWorkerLevel(newWorkerRole) && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                     📍 Bekat{isMultiStation(newWorkerRole) ? 'lar (max 3)' : ''}
                    </p>
                    {isMultiStation(newWorkerRole) ? (
                      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                        <div className="flex flex-wrap gap-1.5">
                          {BEKATLAR.map(b => {
                            const selected = Array.isArray(newWorkerStation) ? newWorkerStation.includes(b) : false;
                            return (
                              <button key={b} type="button" onClick={() => toggleStationSelect(b)}
                                className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black cursor-pointer transition-all ${
                                  selected ? 'bg-orange-500 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'
                                }`}>
                                {b}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                          <MapPin size={15}/>
                        </div>
                        <select
                          value={Array.isArray(newWorkerStation) ? newWorkerStation[0] || '' : newWorkerStation}
                          onChange={e => setNewWorkerStation(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-slate-100 bg-white font-bold text-sm outline-none focus:border-orange-400 transition-all appearance-none"
                        >
                          <option value="">Bekat tanlang</option>
                          {BEKATLAR.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Ko'rinish preview */}
                {(newWorkerName || newWorkerRole) && (
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Ko'rinishi:</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-sm"
                        style={{background: 'linear-gradient(135deg, #1e3a8a, #3730a3)'}}>
                        {newWorkerName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-black text-sm text-slate-800">{newWorkerName || 'Ism kiritilmagan'}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {newWorkerRole && (
                            <span className="text-[9px] font-bold text-slate-500">
                              {selectedLavozim?.emoji} {selectedLavozim?.label}
                            </span>
                          )}
                          {newWorkerStation && (
                            <span className="text-[9px] font-bold text-purple-600">
                              📍 {Array.isArray(newWorkerStation) ? newWorkerStation.join(', ') : newWorkerStation}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Qo'shish tugmasi */}
                <button
                  onClick={addWorker}
                  className="w-full py-3.5 rounded-2xl font-black text-sm text-white cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{background: 'linear-gradient(135deg, #f97316, #ea580c)'}}
                >
                  <Plus size={18}/> Ishchi qo'shish
                </button>
              </div>
            )}
          </div>

          {/* YUQORI LAVOZIMLAR */}
          <div className="space-y-2">
            <p className="font-black text-[10px] text-slate-500 px-1 uppercase tracking-widest">🏛️ Rahbariyat ({topWorkers.length})</p>
            {topWorkers.map(w => <WorkerCard key={w.id} w={w}/>)}
          </div>

          {/* BEKATLAR BO'YICHA */}
          <div className="space-y-2">
            <p className="font-black text-[10px] text-slate-500 px-1 uppercase tracking-widest">📍 Bekatlar bo'yicha</p>
            {activeStations.map(station => {
              const workers = stationWorkers(station);
              const isOpen = openStation === station;
              return (
                <div key={station} className="rounded-2xl overflow-hidden border-2 border-slate-100">
                  <button
                    onClick={() => setOpenStation(isOpen ? null : station)}
                    className="w-full flex justify-between items-center p-3.5 bg-white hover:bg-blue-50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center">
                        <MapPin size={13} className="text-blue-900"/>
                      </div>
                      <span className="text-sm font-black text-blue-900">{station}</span>
                      <span className="bg-blue-900 text-white text-[8px] font-black px-2 py-0.5 rounded-full">{workers.length} ta</span>
                    </div>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}/>
                  </button>
                  {isOpen && (
                    <div className="p-2 space-y-2 bg-slate-50 border-t border-slate-100">
                      {workers.map(w => <WorkerCard key={w.id} w={w}/>)}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Bekatsiz ishchilar */}
            {workersList.filter(w => !w.station && !TOP_ROLES.includes(w.role)).length > 0 && (
              <div className="rounded-2xl overflow-hidden border-2 border-orange-100">
                <button
                  onClick={() => setOpenStation(openStation === '__nostation__' ? null : '__nostation__')}
                  className="w-full flex justify-between items-center p-3.5 bg-orange-50 hover:bg-orange-100 cursor-pointer transition-all"
                >
                  <span className="text-sm font-black text-orange-700">⚠️ Bekatsiz ishchilar</span>
                  <ChevronDown size={16} className={`text-orange-400 transition-transform duration-300 ${openStation === '__nostation__' ? 'rotate-180' : ''}`}/>
                </button>
                {openStation === '__nostation__' && (
                  <div className="p-2 space-y-2 bg-white border-t border-orange-100">
                    {workersList.filter(w => !w.station && !TOP_ROLES.includes(w.role)).map(w => <WorkerCard key={w.id} w={w}/>)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}