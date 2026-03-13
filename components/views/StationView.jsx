"use client"
import { MapPin, AlertTriangle } from 'lucide-react';

export default function StationView({
  // Data
  currentWorker,
  activeFaults,
  BEKATLAR,
  // Actions
  setActiveTasks,
  setArchive,
  setSelectedStation,
  setView,
  loadStationData,
}) {
  const stations = currentWorker?.station ? [currentWorker.station] : BEKATLAR;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in zoom-in-95 duration-500">
      {stations.map(s => {
        const hasFault = activeFaults.some(f => f.station === s && f.status === "active");

        return (
          <button
            key={s}
            onClick={() => {
              setActiveTasks([]);
              setArchive([]);
              setSelectedStation(s);
              localStorage.setItem('railway_station', s);
              setView('dashboard');
              loadStationData(s);
            }}
            className={`relative bg-white p-4 sm:p-6 rounded-3xl shadow-md border-b-8 transition-all font-black text-xs flex flex-col items-center gap-3 cursor-pointer uppercase
              ${hasFault
                ? 'border-b-8 border-red-600 bg-red-50 hover:bg-red-100'
                : 'border-slate-200 hover:border-blue-900 hover:-translate-y-1 text-slate-700'
              }`}
          >
            {/* NOSOZLIK BELGISI */}
            {hasFault && (
              <div className="absolute -top-2 -right-2 bg-red-600 text-white p-1.5 rounded-full shadow-lg">
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 border border-white"></span>
                </span>
              </div>
            )}

            <div className={`p-3 rounded-2xl ${hasFault ? 'bg-red-100' : 'bg-slate-50'}`}>
              <MapPin className={hasFault ? 'text-red-600' : 'text-slate-400'} size={24} />
            </div>

            <div className="flex flex-col items-center">
              <span>{s}</span>
              {hasFault && (
                <span className="text-[8px] font-black text-red-600 uppercase mt-1 flex items-center gap-1">
                  <AlertTriangle size={10} /> Nosozlik!
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}