// railway-app/components/modals/AdminPanel.jsx
import { X, ShieldCheck, Edit3, Trash2, Save } from 'lucide-react';

export default function AdminPanel({
  workersList, newWorkerName, newWorkerId, newWorkerPass,
  editingWorker, editName, editId, editPass,
  onNewWorkerNameChange, onNewWorkerIdChange, onNewWorkerPassChange,
  onAddWorker, onEditClick, onSaveEdit, onRemoveWorker,
  onEditNameChange, onEditIdChange, onEditPassChange,
  onCancelEdit, onClose
}) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3">
      <div className="bg-white w-full max-w-2xl h-[90vh] rounded-4xl shadow-2xl overflow-hidden flex flex-col">

        {/* HEADER */}
        <div className="p-5 border-b-4 border-orange-200 flex justify-between items-center bg-orange-50">
          <h2 className="text-lg font-black text-orange-900 uppercase flex items-center gap-2">
            <ShieldCheck size={24}/> Ishchilar
          </h2>
          <button
            onClick={onClose}
            className="bg-white p-2 rounded-full text-orange-600 cursor-pointer shadow"
          >
            <X size={24}/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* YANGI ISHCHI QO'SHISH */}
          <div className="bg-orange-50 p-4 rounded-2xl space-y-3">
            <p className="font-black text-xs uppercase text-orange-700">Yangi ishchi qo'shish</p>
            <input
              placeholder="F.I.SH"
              className="w-full p-3 border-2 rounded-xl outline-none focus:border-orange-500 font-bold bg-white text-sm"
              value={newWorkerName}
              onChange={onNewWorkerNameChange}
            />
            <input
              placeholder="ID raqami"
              className="w-full p-3 border-2 rounded-xl outline-none focus:border-orange-500 font-bold bg-white text-sm"
              value={newWorkerId}
              onChange={onNewWorkerIdChange}
            />
            <input
              placeholder="Parol"
              className="w-full p-3 border-2 rounded-xl outline-none focus:border-orange-500 font-bold bg-white text-sm"
              value={newWorkerPass}
              onChange={onNewWorkerPassChange}
            />
            <button
              onClick={onAddWorker}
              className="w-full bg-orange-600 text-white p-3 rounded-xl font-black cursor-pointer uppercase text-sm"
            >
              QO'SHISH
            </button>
          </div>

          {/* ISHCHILAR RO'YXATI */}
          <div className="space-y-3">
            {workersList.map((w) => (
              <div key={w.id} className={`bg-white border-2 rounded-2xl p-4 ${
                w.role !== 'worker' ? 'border-orange-200 bg-orange-50' : 'border-slate-100'
              }`}>
                {editingWorker?.id === w.id ? (
                  // TAHRIRLASH REJIMI
                  <div className="space-y-2">
                    <input
                      className="w-full p-2 border-2 rounded-xl text-sm font-bold outline-none focus:border-orange-500"
                      placeholder="F.I.SH"
                      value={editName}
                      onChange={onEditNameChange}
                    />
                    {w.role === 'worker' && (
                      <>
                        <input
                          className="w-full p-2 border-2 rounded-xl text-sm font-bold outline-none focus:border-orange-500 font-mono"
                          placeholder="Yangi ID"
                          value={editId}
                          onChange={onEditIdChange}
                        />
                        <input
                          className="w-full p-2 border-2 rounded-xl text-sm font-bold outline-none focus:border-orange-500"
                          placeholder="Yangi parol (bo'sh qolsa o'zgarmaydi)"
                          value={editPass}
                          onChange={onEditPassChange}
                        />
                      </>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={onSaveEdit}
                        className="flex-1 bg-green-600 text-white p-2 rounded-xl font-black text-sm cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Save size={16}/> Saqlash
                      </button>
                      <button
                        onClick={onCancelEdit}
                        className="flex-1 bg-slate-200 p-2 rounded-xl font-black text-sm cursor-pointer"
                      >
                        Bekor
                      </button>
                    </div>
                  </div>
                ) : (
                  // KO'RISH REJIMI
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-black text-sm">{w.full_name}</p>
                        {w.role === 'admin' && (
                          <span className="bg-red-600 text-white text-[8px] px-2 py-0.5 rounded-full">ADMIN</span>
                        )}
                        {w.role === 'boss' && (
                          <span className="bg-blue-900 text-white text-[8px] px-2 py-0.5 rounded-full">BOSS</span>
                        )}
                      </div>
                      <p className="font-mono text-orange-700 text-xs mt-1">{w.worker_id}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => onEditClick(w)}
                        className="text-blue-600 p-2 hover:bg-blue-50 rounded-full cursor-pointer"
                      >
                        <Edit3 size={20}/>
                      </button>
                      {w.role === 'worker' ? (
                        <button
                          onClick={() => onRemoveWorker(w)}
                          className="text-red-500 p-2 hover:bg-red-50 rounded-full cursor-pointer"
                        >
                          <Trash2 size={20}/>
                        </button>
                      ) : (
                        <div className="p-2">
                          <ShieldCheck size={20} className="text-orange-400"/>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}