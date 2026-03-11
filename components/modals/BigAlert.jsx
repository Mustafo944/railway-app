// railway-app/components/modals/BigAlert.jsx
import { ShieldCheck } from 'lucide-react';

export default function BigAlert({ activeFaults, onClose }) {
  if (!activeFaults.length) return null;
  const lastFault = activeFaults[activeFaults.length - 1];

  return (
    <div className="fixed inset-0 bg-black/90 z-100 flex items-center justify-center p-4">
      <div className="bg-red-600 text-white p-10 rounded-[50px] text-center max-w-md shadow-[0_0_50px_rgba(220,38,38,0.5)] animate-in zoom-in-95 border-4 border-white relative">
        <div className="mb-4 flex justify-center">
          <div className="bg-white/20 p-6 rounded-full">
            <ShieldCheck size={80} className="animate-bounce" />
          </div>
        </div>
        <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Diqqat!</h2>
        <div className="space-y-3 bg-black/20 p-6 rounded-[30px] border border-white/10">
          <p className="text-2xl">Bekat: <b className="text-yellow-300">{lastFault.station}</b></p>
          <p className="text-lg opacity-90 italic">
            {lastFault.reason === "Boshqa" ? lastFault.custom_reason : lastFault.reason}
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-8 bg-white text-red-600 w-full py-5 rounded-3xl font-black text-xl hover:shadow-2xl active:scale-95 transition-all uppercase"
        >
          Tushunarli
        </button>
      </div>
    </div>
  );
}