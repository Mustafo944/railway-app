"use client"
import { X } from 'lucide-react';

export default function FaultStats({ faultHistory, formatFullDateTime, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-200 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100 bg-white">
          <h2 className="text-2xl font-black text-red-600">Bugungi nosozliklar</h2>
          <button onClick={onClose} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 cursor-pointer">
            <X size={24} />
          </button>
        </div>
        <div className="overflow-y-auto p-8 space-y-4">
          {faultHistory.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Hozircha nosozliklar yo'q</p>
          ) : (
            faultHistory.map(f => {
const getDuration = (created, resolved) => {
  const diff = new Date(resolved) - new Date(created);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h > 0) return `${h} soat ${m} min ${s} s`;
  if (m > 0) return `${m} min ${s} s`;
  return `${s} s`;
};
const duration = f.confirmed && f.resolved_at ? getDuration(f.created_at, f.resolved_at) : null;
              return (
                <div key={f.id} className="border p-4 rounded-xl">
                  <p className="font-bold">{f.station}</p>
                  <p className="text-xs text-blue-700 font-black">👤 {f.worker_name || "Noma'lum"}</p>
                  <p>{f.reason === "Boshqa" ? f.custom_reason : f.reason}</p>
                  <p className="text-sm text-gray-500">Boshlangan: {formatFullDateTime(f.created_at)}</p>
                  {f.resolved_at && <p className="text-sm text-gray-500">Tugagan: {formatFullDateTime(f.resolved_at)}</p>}
             {duration && <p className="text-green-600 font-bold mt-1">⏱ Bartaraf etish vaqti: {duration}</p>}
                  {!f.resolved_at && <p className="text-red-600 font-bold mt-1">Aktiv (davom etmoqda)</p>}
                  {f.resolved_at && !f.confirmed && (
  <p className="text-amber-600 font-bold mt-1">⏳ Bekat boshlig'i tasdiqlamadi</p>
)}
{f.confirmed_by && (
  <p className="text-green-700 font-bold mt-1">🛡 Tasdiqladi: {f.confirmed_by}</p>
)}
                </div>
              );
            })
          )}
          <button onClick={onClose} className="w-full bg-gray-200 py-3 rounded-xl font-bold cursor-pointer">
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}