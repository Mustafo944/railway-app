// railway-app/components/modals/FaultStats.jsx
import { X } from 'lucide-react';
import { formatFullDateTime } from '@/lib/utils';

export default function FaultStats({ faultHistory, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-200 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden flex flex-col max-h-[80vh]">

        {/* HEADER */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100 bg-white">
          <h2 className="text-2xl font-black text-red-600">Bugungi nosozliklar</h2>
          <button
            onClick={onClose}
            className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* KONTENT */}
        <div className="overflow-y-auto p-8 space-y-4">
          {faultHistory.length === 0 ? (
            <p className="text-center py-8 text-gray-500 font-bold">
              Hozircha nosozliklar yo'q
            </p>
          ) : (
            faultHistory.map(f => {
              const duration = f.resolved_at
                ? Math.floor((new Date(f.resolved_at) - new Date(f.created_at)) / 60000)
                : null;
              return (
                <div key={f.id} className="border-2 border-slate-100 p-5 rounded-2xl space-y-1">
<p className="font-bold">{f.station}</p>
<p className="text-xs text-blue-700 font-black">👤 {f.worker_name || "Noma'lum"}</p>
<p className="text-sm text-slate-700">
                    {f.reason === "Boshqa" ? f.custom_reason : f.reason}
                  </p>
                  <p className="text-xs text-slate-500">
                    Boshlangan: {formatFullDateTime(f.created_at)}
                  </p>
                  {f.resolved_at && (
                    <p className="text-xs text-slate-500">
                      Tugagan: {formatFullDateTime(f.resolved_at)}
                    </p>
                  )}
                  {duration && (
                    <p className="text-green-600 font-black text-xs">
                      ✅ Bartaraf etish vaqti: {duration} min
                    </p>
                  )}
                  {!f.resolved_at && (
                    <p className="text-red-600 font-black text-xs animate-pulse">
                      🔴 Aktiv (davom etmoqda)
                    </p>
                  )}
                </div>
              );
            })
          )}
          <button
            onClick={onClose}
            className="w-full bg-gray-200 py-3 rounded-xl font-bold cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}