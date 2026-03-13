"use client"
import { X, ArrowLeft, Plus } from 'lucide-react';

export default function TaskMenu({
  // Data
  taskMenuStep, setTaskMenuStep,
  selectedBolim, setSelectedBolim,
  selectedReja, setSelectedReja,
  rejaBolimlar,
  rejaIshlar,
  isSubmitting,
  YILLIK_REJA,
  TORT_HAFTALIK_REJA,
  // Actions
  loadRejaBolimlar,
  loadRejaIshlar,
  handleAddTask,
  onClose,
}) {
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[50px] shadow-2xl border-t-16 border-blue-900 animate-in zoom-in-95 duration-200 text-slate-800 overflow-hidden flex flex-col max-h-[85vh]">

        {/* HEADER */}
        <div className="flex justify-between items-center p-6 pb-4 border-b-2 border-slate-50">
          <div>
            {taskMenuStep !== 'main' && (
              <button
                onClick={() => {
                  if (taskMenuStep === 'ishlar') setTaskMenuStep('bolimlar');
                  else setTaskMenuStep('main');
                }}
                className="text-blue-900 font-black text-xs flex items-center gap-1 mb-1 cursor-pointer hover:underline"
              >
                <ArrowLeft size={14}/> Ortga
              </button>
            )}
            <h3 className="text-xl font-black tracking-tighter uppercase">
              {taskMenuStep === 'main' && 'ISHNI TANLANG'}
              {taskMenuStep === 'bolimlar' && "BO'LIM TANLANG"}
              {taskMenuStep === 'ishlar' && (selectedBolim?.bolim || '')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="bg-slate-100 p-3 rounded-full hover:bg-slate-200 cursor-pointer"
          >
            <X size={28}/>
          </button>
        </div>

        {/* KONTENT */}
        <div className="overflow-y-auto p-6 space-y-3">

          {/* BOSQICH 1: MAIN */}
          {taskMenuStep === 'main' && (
            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  setSelectedReja('yillik');
                  loadRejaBolimlar('yillik');
                  setTaskMenuStep('bolimlar');
                }}
                className="w-full text-left p-6 rounded-3xl bg-blue-900 text-white font-black flex justify-between items-center cursor-pointer shadow-lg"
              >
                <div>
                  <p className="text-lg">📋 Yillik reja grafigi</p>
                  <p className="text-xs opacity-70 font-normal mt-1">136 ta ish • 23 ta bo'lim</p>
                </div>
                <Plus size={24}/>
              </button>
              <button
                onClick={() => {
                  setSelectedReja('haftalik');
                  loadRejaBolimlar('haftalik');
                  setTaskMenuStep('bolimlar');
                }}
                className="w-full text-left p-6 rounded-3xl bg-green-700 text-white font-black flex justify-between items-center cursor-pointer shadow-lg"
              >
                <div>
                  <p className="text-lg">📅 4 haftalik reja</p>
                  <p className="text-xs opacity-70 font-normal mt-1">51 ta ish • 18 ta bo'lim</p>
                </div>
                <Plus size={24}/>
              </button>
            </div>
          )}

          {/* BOSQICH 2: BO'LIMLAR */}
          {taskMenuStep === 'bolimlar' && (() => {
            const staticData = selectedReja === 'yillik' ? YILLIK_REJA : TORT_HAFTALIK_REJA;
            const supabaseData = rejaBolimlar
              .filter(b => b.reja_turi === (selectedReja === 'yillik' ? 'yillik' : 'haftalik'))
              .map(b => ({ bolim: b.bolim, ishlar: [], _supabase: true, _id: b.id }));
            const allBolimlar = [...staticData, ...supabaseData];

            return allBolimlar.map((bolim) => (
              <button
                key={bolim._id || bolim.bolim}
                onClick={() => {
                  setSelectedBolim(bolim);
                  setTaskMenuStep('ishlar');
                  if (bolim._supabase) loadRejaIshlar(bolim._id);
                }}
                className="w-full text-left p-5 rounded-[20px] bg-slate-50 hover:bg-blue-900 hover:text-white border-2 border-slate-100 transition-all flex justify-between items-center group cursor-pointer"
              >
                <div>
                  <p className="font-black text-sm">{bolim.bolim}</p>
                  <p className="text-[10px] opacity-60 mt-0.5">
                    {bolim._supabase ? '...' : `${bolim.ishlar.length} ta ish`}
                  </p>
                </div>
                <Plus size={20} className="opacity-50 group-hover:opacity-100"/>
              </button>
            ));
          })()}

          {/* BOSQICH 3: ISHLAR */}
          {taskMenuStep === 'ishlar' && selectedBolim && (() => {
            if (selectedBolim._supabase) {
              if (rejaIshlar.length === 0) {
                return <div className="text-center py-8 text-slate-400 font-bold">Bu bo'limda ishlar yo'q</div>;
              }
              return rejaIshlar.map((ish) => (
                <button
                  key={ish.id}
                  onClick={() => handleAddTask(ish)}
                  disabled={isSubmitting}
                  className="w-full text-left p-5 rounded-[20px] bg-slate-50 hover:bg-blue-900 hover:text-white border-2 border-slate-100 transition-all group cursor-pointer disabled:opacity-50"
                >
                  <p className="font-black text-xs leading-relaxed">{ish.ish}</p>
                  <div className="flex gap-3 mt-2 text-[9px] opacity-50 group-hover:opacity-80">
                    <span>⏱ {ish.davriylik}</span>
                    <span>👤 {ish.bajaruvchi}</span>
                  </div>
                </button>
              ));
            }

            if (selectedBolim.ishlar.length === 0) {
              return <div className="text-center py-8 text-slate-400 font-bold">Bu bo'limda ishlar yo'q</div>;
            }

            return selectedBolim.ishlar.map((ish) => (
              <button
                key={ish.ish}
                onClick={() => handleAddTask(ish)}
                disabled={isSubmitting}
                className="w-full text-left p-5 rounded-[20px] bg-slate-50 hover:bg-blue-900 hover:text-white border-2 border-slate-100 transition-all group cursor-pointer disabled:opacity-50"
              >
                <p className="font-black text-xs leading-relaxed">{ish.ish}</p>
                <div className="flex gap-3 mt-2 text-[9px] opacity-50 group-hover:opacity-80">
                  <span>⏱ {ish.davriylik}</span>
                  <span>👤 {ish.bajaruvchi}</span>
                </div>
              </button>
            ));
          })()}

        </div>
      </div>
    </div>
  );
}