// ─── 1. components/modals/ConfirmResolve.jsx ─────────────────────────────────
"use client"
import { CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ConfirmResolve({ confirmResolve, setConfirmResolve, setActiveFaults, supabase }) {
  if (!confirmResolve) return null;
  return (
    <div className="fixed inset-0 bg-black/80 z-170 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl text-center max-w-sm w-full space-y-5 shadow-2xl">
        <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
          <CheckCircle size={32} className="text-green-600"/>
        </div>
        <h3 className="text-xl font-black text-slate-800">Nosozlik bartaraf etildimi?</h3>
        <div className="flex gap-3">
          <button
            onClick={async () => {
              const { error } = await supabase
                .from("faults")
                .update({ status: "resolved", resolved_at: new Date() })
                .eq("id", confirmResolve);
              if (!error) {
                setActiveFaults(prev => prev.filter(f => f.id !== confirmResolve));
                toast.success("Nosozlik bartaraf etildi!");
              } else {
                toast.error("Xatolik yuz berdi!");
              }
              setConfirmResolve(null);
            }}
            className="flex-1 bg-green-600 text-white py-3 rounded-2xl font-black cursor-pointer"
          >
            Ha, tasdiqlash
          </button>
          <button
            onClick={() => setConfirmResolve(null)}
            className="flex-1 bg-slate-200 py-3 rounded-2xl font-black cursor-pointer"
          >
            Bekor
          </button>
        </div>
      </div>
    </div>
  );
}
