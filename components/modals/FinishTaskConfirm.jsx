// railway-app/components/modals/FinishTaskConfirm.jsx
import { CheckCircle } from 'lucide-react';

export default function FinishTaskConfirm({
  taskId, photoConfirmed,
  onPhotoConfirmChange, onFinish, onCancel
}) {
  if (!taskId) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-120 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl text-center max-w-sm w-full space-y-5 shadow-2xl">
        <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
          <CheckCircle size={32} className="text-green-600"/>
        </div>
        <h3 className="text-xl font-black text-slate-800">
          Ish tugaganligi haqida telegram guruhga foto yubordingizmi?
        </h3>
        <label className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl cursor-pointer border-2 border-slate-100 hover:border-green-400 transition-all">
          <input
            type="checkbox"
            checked={photoConfirmed}
            onChange={onPhotoConfirmChange}
            className="w-5 h-5 accent-green-600 cursor-pointer"
          />
          <span className="font-bold text-sm text-slate-700">Ha, foto yubordim</span>
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => onFinish(taskId)}
            disabled={!photoConfirmed}
            className="flex-1 bg-green-600 text-white py-3 rounded-2xl font-black disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer transition-all"
          >
            Tugatish
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-slate-200 py-3 rounded-2xl font-black cursor-pointer"
          >
            Bekor
          </button>
        </div>
      </div>
    </div>
  );
}