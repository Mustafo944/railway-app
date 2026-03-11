// railway-app/components/modals/RejaPanel.jsx
import { X, ArrowLeft, Plus, Trash2 } from 'lucide-react';

export default function RejaPanel({
  rejaStep, rejaturi, rejaBolimlar, rejaSelectedBolim,
  rejaIshlar, yangibolimNomi, yangiIsh, isRejaSubmitting,
  onStepChange, onRejaTuriChange, onSelectBolim,
  onYangiBolimNomiChange, onYangiIshChange,
  onAddRejaBolim, onAddRejaIsh,
  onDeleteRejaBolim, onDeleteRejaIsh,
  onClose
}) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95">

        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b-4 border-purple-100 bg-purple-50">
          <div>
            {rejaStep !== 'main' && (
              <button
                onClick={() => {
                  if (rejaStep === 'yangi_bolim') onStepChange('bolimlar');
                  else if (rejaStep === 'ishlar') onStepChange('bolimlar');
                  else if (rejaStep === 'yangi_ish') onStepChange('ishlar');
                  else onStepChange('main');
                }}
                className="text-purple-700 font-black text-xs flex items-center gap-1 mb-1 cursor-pointer hover:underline"
              >
                <ArrowLeft size={14}/> Ortga
              </button>
            )}
            <h2 className="text-xl font-black text-purple-900 uppercase tracking-tighter">
              {rejaStep === 'main' && 'REJA BOSHQARUVI'}
              {rejaStep === 'bolimlar' && `${rejaturi === 'yillik' ? 'Yillik' : '4 Haftalik'} — Bo'limlar`}
              {rejaStep === 'yangi_bolim' && "Yangi bo'lim qo'shish"}
              {rejaStep === 'ishlar' && rejaSelectedBolim?.bolim}
              {rejaStep === 'yangi_ish' && "Yangi ish qo'shish"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="bg-white p-3 rounded-full hover:bg-purple-100 cursor-pointer shadow"
          >
            <X size={24}/>
          </button>
        </div>

        {/* KONTENT */}
        <div className="overflow-y-auto p-6 space-y-3">

          {/* MAIN */}
          {rejaStep === 'main' && (
            <div className="flex flex-col gap-4">
              <button
                onClick={() => { onRejaTuriChange('yillik'); onStepChange('bolimlar'); }}
                className="w-full text-left p-6 rounded-3xl bg-blue-900 text-white font-black flex justify-between items-center cursor-pointer shadow-lg"
              >
                <div>
                  <p className="text-lg">📋 Yillik reja</p>
                  <p className="text-xs opacity-70 font-normal mt-1">Bo'limlar va ishlarni boshqarish</p>
                </div>
                <Plus size={24}/>
              </button>
              <button
                onClick={() => { onRejaTuriChange('haftalik'); onStepChange('bolimlar'); }}
                className="w-full text-left p-6 rounded-3xl bg-green-700 text-white font-black flex justify-between items-center cursor-pointer shadow-lg"
              >
                <div>
                  <p className="text-lg">📅 4 Haftalik reja</p>
                  <p className="text-xs opacity-70 font-normal mt-1">Bo'limlar va ishlarni boshqarish</p>
                </div>
                <Plus size={24}/>
              </button>
            </div>
          )}

          {/* BO'LIMLAR */}
          {rejaStep === 'bolimlar' && (
            <>
              <button
                onClick={() => onStepChange('yangi_bolim')}
                className="w-full p-4 rounded-2xl border-2 border-dashed border-purple-300 text-purple-700 font-black text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-purple-50"
              >
                <Plus size={18}/> Yangi bo'lim qo'shish
              </button>
              {rejaBolimlar.length === 0 ? (
                <div className="text-center py-8 text-slate-400 font-bold">Hozircha bo'limlar yo'q</div>
              ) : (
                rejaBolimlar.map((bolim) => (
                  <div key={bolim.id} className="w-full p-5 rounded-[20px] bg-slate-50 border-2 border-slate-100 flex justify-between items-center">
                    <button
                      onClick={() => onSelectBolim(bolim)}
                      className="flex-1 text-left cursor-pointer"
                    >
                      <p className="font-black text-sm">{bolim.bolim}</p>
                    </button>
                    <button
                      onClick={() => onDeleteRejaBolim(bolim.id)}
                      className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                ))
              )}
            </>
          )}

          {/* YANGI BO'LIM */}
          {rejaStep === 'yangi_bolim' && (
            <div className="space-y-4">
              <input
                placeholder="Bo'lim nomi"
                value={yangibolimNomi}
                onChange={onYangiBolimNomiChange}
                className="w-full p-4 border-2 rounded-2xl outline-none focus:border-purple-600 font-bold bg-slate-50"
              />
              <button
                onClick={onAddRejaBolim}
                disabled={isRejaSubmitting}
                className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black cursor-pointer disabled:opacity-50"
              >
                Qo'shish
              </button>
            </div>
          )}

          {/* ISHLAR */}
          {rejaStep === 'ishlar' && (
            <>
              <button
                onClick={() => onStepChange('yangi_ish')}
                className="w-full p-4 rounded-2xl border-2 border-dashed border-purple-300 text-purple-700 font-black text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-purple-50"
              >
                <Plus size={18}/> Yangi ish qo'shish
              </button>
              {rejaIshlar.length === 0 ? (
                <div className="text-center py-8 text-slate-400 font-bold">Hozircha ishlar yo'q</div>
              ) : (
                rejaIshlar.map((ish) => (
                  <div key={ish.id} className="p-5 rounded-[20px] bg-slate-50 border-2 border-slate-100 flex justify-between items-start">
                    <div>
                      <p className="font-black text-sm">{ish.ish}</p>
                      <div className="flex gap-3 mt-1 text-[10px] text-slate-500 font-bold">
                        {ish.davriylik && <span>⏱ {ish.davriylik}</span>}
                        {ish.bajaruvchi && <span>👤 {ish.bajaruvchi}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteRejaIsh(ish.id)}
                      className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                ))
              )}
            </>
          )}

          {/* YANGI ISH */}
          {rejaStep === 'yangi_ish' && (
            <div className="space-y-4">
              <input
                placeholder="Ish nomi *"
                value={yangiIsh.ish}
                onChange={e => onYangiIshChange({...yangiIsh, ish: e.target.value})}
                className="w-full p-4 border-2 rounded-2xl outline-none focus:border-purple-600 font-bold bg-slate-50"
              />
              <input
                placeholder="Davriylik (masalan: Oyiga 1 marta)"
                value={yangiIsh.davriylik}
                onChange={e => onYangiIshChange({...yangiIsh, davriylik: e.target.value})}
                className="w-full p-4 border-2 rounded-2xl outline-none focus:border-purple-600 font-bold bg-slate-50"
              />
              <input
                placeholder="Bajaruvchi"
                value={yangiIsh.bajaruvchi}
                onChange={e => onYangiIshChange({...yangiIsh, bajaruvchi: e.target.value})}
                className="w-full p-4 border-2 rounded-2xl outline-none focus:border-purple-600 font-bold bg-slate-50"
              />
              <input
                placeholder="Jurnal"
                value={yangiIsh.jurnal}
                onChange={e => onYangiIshChange({...yangiIsh, jurnal: e.target.value})}
                className="w-full p-4 border-2 rounded-2xl outline-none focus:border-purple-600 font-bold bg-slate-50"
              />
              <button
                onClick={onAddRejaIsh}
                disabled={isRejaSubmitting}
                className="w-full bg-purple-600 text-white py-4 rounded-2xl font-black cursor-pointer disabled:opacity-50"
              >
                Qo'shish
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}