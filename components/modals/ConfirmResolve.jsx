"use client"
import { CheckCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ConfirmResolve({ confirmResolve, setConfirmResolve, setActiveFaults, supabase, currentWorker }) {
  if (!confirmResolve) return null;

  const isBoshlig = currentWorker?.role === 'bekat_boshlig';

  const handleResolve = async () => {
    const { error } = await supabase
      .from("faults")
      .update({ 
        status: "resolved", 
        resolved_at: new Date().toISOString(),
        // Agar boshlig' tasdiqlasa — confirmed ham qo'yiladi
        ...(isBoshlig ? { confirmed: true, confirmed_by: currentWorker?.full_name } : {})
      })
      .eq("id", confirmResolve);

    if (!error) {
      setActiveFaults(prev => prev.filter(f => f.id !== confirmResolve));
      toast.success(isBoshlig ? "Nosozlik tasdiqlandi va yopildi!" : "Nosozlik bartaraf etildi!");
    } else {
      toast.error("Xatolik yuz berdi!");
    }
    setConfirmResolve(null);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[170] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl text-center max-w-sm w-full space-y-5 shadow-2xl">
        <div className={`p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto ${
          isBoshlig ? 'bg-amber-100' : 'bg-green-100'
        }`}>
          {isBoshlig
            ? <ShieldCheck size={32} className="text-amber-600"/>
            : <CheckCircle size={32} className="text-green-600"/>
          }
        </div>

        <div>
          <h3 className="text-xl font-black text-slate-800">
            {isBoshlig ? 'Nosozlikni tasdiqlash' : 'Nosozlik bartaraf etildimi?'}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {isBoshlig
              ? 'Nosozlik bartaraf etilganligi tasdiqlanadi va yopiladi'
              : 'Nosozlik yopiladi va bekat boshlig\'iga tasdiqlanadi'
            }
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleResolve}
            className={`flex-1 text-white py-3.5 rounded-2xl font-black cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-95 ${
              isBoshlig
                ? 'bg-amber-500 hover:bg-amber-400 shadow-lg shadow-amber-500/20'
                : 'bg-green-600 hover:bg-green-500 shadow-lg shadow-green-600/20'
            }`}
          >
            {isBoshlig ? <><ShieldCheck size={15}/> Tasdiqlash</> : <><CheckCircle size={15}/> Ha, tasdiqlash</>}
          </button>
          <button
            onClick={() => setConfirmResolve(null)}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-2xl font-black cursor-pointer transition-all"
          >
            Bekor qilish
          </button>
        </div>
      </div>
    </div>
  );
}