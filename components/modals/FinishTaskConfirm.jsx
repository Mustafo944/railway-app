"use client"
import { CheckCircle, ShieldCheck } from 'lucide-react';

export default function FinishTaskConfirm({
  photoConfirmed, setPhotoConfirmed,
  finishTask,
  taskId,
  onClose,
}) {
  return (
    <div className="fixed inset-0 bg-black/80 z-[120] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl text-center max-w-sm w-full space-y-5 shadow-2xl">
        <div className="bg-amber-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
          <ShieldCheck size={32} className="text-amber-600"/>
        </div>

        <div>
          <h3 className="text-xl font-black text-slate-800">Ishni tugatish</h3>
          <p className="text-sm text-slate-500 mt-2 leading-snug">
            Ish bajarilganligini tasdiqlaysizmi?<br/>
            <span className="text-amber-600 font-bold">Bekat boshlig'iga tasdiqlang.</span>
          </p>
        </div>

        <label className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl cursor-pointer border-2 border-slate-100 hover:border-amber-400 transition-all text-left">
          <input
            type="checkbox"
            checked={photoConfirmed}
            onChange={e => setPhotoConfirmed(e.target.checked)}
            className="w-5 h-5 accent-amber-500 cursor-pointer shrink-0"
          />
          <span className="font-bold text-sm text-slate-700">
            Ha, ish bajarildi va bekat boshlig'iga tasdiqlansin
          </span>
        </label>

        <div className="flex gap-3">
          <button
            onClick={() => finishTask(taskId)}
            disabled={!photoConfirmed}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-white py-3.5 rounded-2xl font-black disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck size={15}/> Tasdiqlash
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-2xl font-black cursor-pointer transition-all"
          >
            Bekor
          </button>
        </div>
      </div>
    </div>
  );
}