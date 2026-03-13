"use client"
import { X } from 'lucide-react';
import Du46Journal from '../Du46Journal';
import Shu2Journal from '../Shu2Journal';

export default function BossJournalModal({
  bossJournalStation, setBossJournalStation,
  bossJournalType, setBossJournalType,
  currentWorker,
}) {
  if (!bossJournalStation) return null;

  // Journal tanlash
  if (!bossJournalType) {
    return (
      <div className="fixed inset-0 bg-black/70 z-200 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
          <div className="flex justify-between items-center px-6 py-4 border-b bg-purple-50">
            <h2 className="font-black text-purple-900 uppercase">📔 Jurnallar — {bossJournalStation}</h2>
            <button onClick={() => setBossJournalStation(null)} className="bg-slate-100 p-2 rounded-full cursor-pointer">
              <X size={20}/>
            </button>
          </div>
          <div className="p-6 space-y-3">
            <button
              onClick={() => setBossJournalType('du46')}
              className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black cursor-pointer flex items-center justify-center gap-2"
            >
              📋 DU-46 arxivi
            </button>
            <button
              onClick={() => setBossJournalType('shu2')}
              className="w-full bg-green-700 text-white py-4 rounded-2xl font-black cursor-pointer flex items-center justify-center gap-2"
            >
              📒 SHU-2 arxivi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const onClose = () => { setBossJournalType(null); setBossJournalStation(null); };

  if (bossJournalType === 'du46') {
    return <Du46Journal station={bossJournalStation} workerName={currentWorker?.full_name} mode="archive" onClose={onClose} />;
  }
  if (bossJournalType === 'shu2') {
    return <Shu2Journal station={bossJournalStation} workerName={currentWorker?.full_name} mode="archive" onClose={onClose} />;
  }
  return null;
}
