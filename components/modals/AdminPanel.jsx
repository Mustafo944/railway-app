"use client"
import { useState } from 'react';
import { ShieldCheck, X, Save, Edit3, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const LAVOZIMLAR = [
  { value: 'bosh_muhandis', label: 'Bosh muhandis' },
  { value: 'boshliq_muovini', label: 'Boshliq muovini' },
  { value: 'bekat_boshlig', label: "Bekat boshlig'i" },
  { value: 'katta_elektromexanik', label: 'Katta elektromexanik' },
  { value: 'elektromexanik', label: 'Elektromexanik' },
  { value: 'elektromontyor', label: 'Elektromontyor' },
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

  const toggleStation = (bekat, isEdit = false) => {
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

  const isMultiStation = (role) => role === 'katta_elektromexanik';
  const isWorkerLevel = (role) => ['bekat_boshlig', 'katta_elektromexanik', 'elektromexanik', 'elektromontyor'].includes(role);
  const isProtected = (role) => ['admin', 'boss'].includes(role);

  // Yuqori lavozimlar (admin, boss, bosh_muhandis, boshliq_muovini)
  const topWorkers = workersList.filter(w => TOP_ROLES.includes(w.role));

  // Bekatlar bo'yicha ishchilar
  const stationWorkers = (station) => workersList.filter(w => {
    if (!w.station || TOP_ROLES.includes(w.role)) return false;
    const stations = w.station.split(',').map(s => s.trim());
    return stations.includes(station);
  });

  // Ishchisi bor bekatlar
  const activeStations = BEKATLAR.filter(s => stationWorkers(s).length > 0);

  const WorkerCard = ({ w }) => (
    <div key={w.id} className={`bg-white border-2 rounded-xl sm:rounded-2xl p-3 sm:p-4 ${isProtected(w.role) ? 'border-orange-200 bg-orange-50' : 'border-slate-100'}`}>
      {editingWorker?.id === w.id ? (
        <div className="space-y-2">
          <input className="w-full p-2 border-2 rounded-xl text-xs sm:text-sm font-bold outline-none focus:border-orange-500" placeholder="F.I.SH" value={editName} onChange={e => setEditName(e.target.value)} />
          {!isProtected(w.role) && (
            <>
              <input className="w-full p-2 border-2 rounded-xl text-xs sm:text-sm font-bold outline-none focus:border-orange-500" placeholder="Yangi ID" value={editId} onChange={e => setEditId(e.target.value)} />
              <input className="w-full p-2 border-2 rounded-xl text-xs sm:text-sm font-bold outline-none focus:border-orange-500" placeholder="Yangi parol" value={editPass} onChange={e => setEditPass(e.target.value)} />
              <input className="w-full p-2 border-2 rounded-xl text-xs sm:text-sm font-bold outline-none focus:border-orange-500" placeholder="Telefon (+998...)" type="tel" value={editPhone || ''} onChange={e => setEditPhone(e.target.value)} />
              <select value={editRole || w.role} onChange={e => { setEditRole(e.target.value); setEditStation(''); }} className="w-full p-2 border-2 rounded-xl text-xs sm:text-sm font-bold outline-none focus:border-orange-500 bg-white">
                {LAVOZIMLAR.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
              {isWorkerLevel(editRole || w.role) && (
                isMultiStation(editRole || w.role) ? (
                  <div className="bg-white border-2 rounded-xl p-2 space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase">Bekatlar (max 3)</p>
                    <div className="flex flex-wrap gap-1">
                      {BEKATLAR.map(b => {
                        const selected = Array.isArray(editStation) ? editStation.includes(b) : editStation === b;
                        return (
                          <button key={b} type="button" onClick={() => toggleStation(b, true)}
                            className={`px-2 py-1 rounded-lg text-[9px] font-black cursor-pointer transition-all ${selected ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            {b}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <select value={Array.isArray(editStation) ? editStation[0] || '' : editStation} onChange={e => setEditStation(e.target.value)} className="w-full p-2 border-2 rounded-xl text-xs sm:text-sm font-bold outline-none focus:border-orange-500 bg-white">
                    <option value="">Bekat tanlang</option>
                    {BEKATLAR.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                )
              )}
            </>
          )}
          <div className="flex gap-2">
            <button onClick={saveEdit} className="flex-1 bg-green-600 text-white p-2 rounded-xl font-black text-xs cursor-pointer flex items-center justify-center gap-1">
              <Save size={14}/> Saqlash
            </button>
            <button onClick={() => setEditingWorker(null)} className="flex-1 bg-slate-200 p-2 rounded-xl font-black text-xs cursor-pointer">Bekor</button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 flex-wrap">
              <p className="font-black text-xs sm:text-sm truncate max-w-30 sm:max-w-none">{w.full_name}</p>
              {w.station && <p className="text-[8px] sm:text-[10px] font-black text-purple-700">📍 {stationDisplay(w.station)}</p>}
            </div>
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              <p className="font-mono text-orange-700 text-[9px] sm:text-xs">{w.worker_id}</p>
              {ROLE_LABELS[w.role] && (
                <span className={`${ROLE_LABELS[w.role].color} text-white text-[7px] sm:text-[8px] px-1.5 py-0.5 rounded-full`}>
                  {ROLE_LABELS[w.role].label}
                </span>
              )}
            </div>
            {w.phone && <p className="text-[9px] font-bold text-green-700 mt-0.5">📞 {w.phone}</p>}
          </div>
          <div className="flex gap-0.5 sm:gap-1">
            <button onClick={() => handleEditClick(w)} className="text-blue-600 p-1.5 sm:p-2 hover:bg-blue-50 rounded-full cursor-pointer">
              <Edit3 size={16} />
            </button>
            {!isProtected(w.role) ? (
              <button onClick={() => removeWorker(w)} className="text-red-500 p-1.5 sm:p-2 hover:bg-red-50 rounded-full cursor-pointer">
                <Trash2 size={16} />
              </button>
            ) : (
              <div className="p-1.5 sm:p-2"><ShieldCheck size={16} className="text-orange-400"/></div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-3">
      <div className="bg-white w-full sm:max-w-2xl h-[85vh] sm:h-[90vh] rounded-t-4xl sm:rounded-4xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">

        {/* HEADER */}
        <div className="p-4 border-b-4 border-orange-200 flex justify-between items-center bg-orange-50 sticky top-0">
          <div className="flex items-center gap-2">
            <div className="w-12 h-1 bg-orange-300 rounded-full mx-auto sm:hidden absolute left-1/2 -translate-x-1/2 top-2"></div>
            <h2 className="text-base sm:text-lg font-black text-orange-900 uppercase flex items-center gap-2 mt-4 sm:mt-0">
              <ShieldCheck size={20} className="hidden sm:block"/> Ishchilar
            </h2>
          </div>
          <button onClick={onClose} className="bg-white p-2 rounded-full text-orange-600 cursor-pointer shadow"><X size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">

          {/* YANGI ISHCHI QO'SHISH */}
          <div className="bg-orange-50 p-3 sm:p-4 rounded-2xl space-y-2">
            <p className="font-black text-[10px] sm:text-xs uppercase text-orange-700">➕ Yangi ishchi qo'shish</p>
            <input placeholder="F.I.SH" className="w-full p-2 sm:p-3 border-2 rounded-xl outline-none focus:border-orange-500 font-bold bg-white text-xs sm:text-sm" value={newWorkerName} onChange={e => setNewWorkerName(e.target.value)} />
            <input placeholder="ID raqami" className="w-full p-2 sm:p-3 border-2 rounded-xl outline-none focus:border-orange-500 font-bold bg-white text-xs sm:text-sm" value={newWorkerId} onChange={e => setNewWorkerId(e.target.value)} />
            <input placeholder="Parol" type="text" className="w-full p-2 sm:p-3 border-2 rounded-xl outline-none focus:border-orange-500 font-bold bg-white text-xs sm:text-sm" value={newWorkerPass} onChange={e => setNewWorkerPass(e.target.value)} />
            <input placeholder="Telefon raqami (+998...)" type="tel" className="w-full p-2 sm:p-3 border-2 rounded-xl outline-none focus:border-orange-500 font-bold bg-white text-xs sm:text-sm" value={newWorkerPhone || ''} onChange={e => setNewWorkerPhone(e.target.value)} />
            <select value={newWorkerRole || ''} onChange={e => { setNewWorkerRole(e.target.value); setNewWorkerStation(''); }} className="w-full p-2 sm:p-3 border-2 rounded-xl outline-none focus:border-orange-500 font-bold bg-white text-xs sm:text-sm">
              <option value="">Lavozim tanlang</option>
              {LAVOZIMLAR.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            {isWorkerLevel(newWorkerRole) && (
              isMultiStation(newWorkerRole) ? (
                <div className="bg-white border-2 rounded-xl p-2 space-y-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase">Bekatlar tanlang (max 3)</p>
                  <div className="flex flex-wrap gap-1">
                    {BEKATLAR.map(b => {
                      const selected = Array.isArray(newWorkerStation) ? newWorkerStation.includes(b) : false;
                      return (
                        <button key={b} type="button" onClick={() => toggleStation(b)}
                          className={`px-2 py-1 rounded-lg text-[9px] font-black cursor-pointer transition-all ${selected ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {b}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <select value={Array.isArray(newWorkerStation) ? newWorkerStation[0] || '' : newWorkerStation} onChange={e => setNewWorkerStation(e.target.value)} className="w-full p-2 sm:p-3 border-2 rounded-xl outline-none focus:border-orange-500 font-bold bg-white text-xs sm:text-sm">
                  <option value="">Bekat tanlang</option>
                  {BEKATLAR.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              )
            )}
            <button onClick={addWorker} className="w-full bg-orange-600 text-white p-2.5 sm:p-3 rounded-xl font-black cursor-pointer uppercase text-xs sm:text-sm hover:bg-orange-700 transition">
              Qo'shish
            </button>
          </div>

          {/* YUQORI LAVOZIMLAR */}
          <div className="space-y-2">
            <p className="font-black text-[10px] sm:text-xs text-slate-500 px-1">🏛️ Rahbariyat ({topWorkers.length})</p>
            {topWorkers.map(w => <WorkerCard key={w.id} w={w} />)}
          </div>

          {/* BEKATLAR BO'YICHA */}
          <div className="space-y-2">
            <p className="font-black text-[10px] sm:text-xs text-slate-500 px-1">📍 Bekatlar bo'yicha ishchilar</p>
            {activeStations.map(station => {
              const workers = stationWorkers(station);
              const isOpen = openStation === station;
              return (
                <div key={station} className="border-2 border-slate-100 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenStation(isOpen ? null : station)}
                    className="w-full flex justify-between items-center p-3 bg-slate-50 hover:bg-blue-50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-blue-900">📍 {station}</span>
                      <span className="bg-blue-900 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">{workers.length} ta</span>
                    </div>
                    {isOpen ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
                  </button>
                  {isOpen && (
                    <div className="p-2 space-y-2 bg-white">
                      {workers.map(w => <WorkerCard key={w.id} w={w} />)}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Bekatsiz ishchilar */}
            {workersList.filter(w => !w.station && !TOP_ROLES.includes(w.role)).length > 0 && (
              <div className="border-2 border-slate-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenStation(openStation === '__nostation__' ? null : '__nostation__')}
                  className="w-full flex justify-between items-center p-3 bg-slate-50 hover:bg-orange-50 cursor-pointer"
                >
                  <span className="text-xs font-black text-orange-700">⚠️ Bekatsiz ishchilar</span>
                  {openStation === '__nostation__' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </button>
                {openStation === '__nostation__' && (
                  <div className="p-2 space-y-2 bg-white">
                    {workersList.filter(w => !w.station && !TOP_ROLES.includes(w.role)).map(w => <WorkerCard key={w.id} w={w} />)}
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