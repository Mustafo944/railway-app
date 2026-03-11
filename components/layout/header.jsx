// railway-app/components/layout/Header.jsx

export default function Header({ 
  currentWorker, selectedStation, activeFaults,
  isAdmin, onAdminClick, onRejaClick, onLogout
}) {
  return (
    <header className="bg-blue-900 text-white p-3 sticky top-0 z-10 shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
          <div className="flex flex-col leading-none">
            <h1 className="font-black text-lg uppercase tracking-tighter flex items-center gap-2">
              Railway
              {activeFaults.length > 0 && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600 border border-white"></span>
                </span>
              )}
            </h1>
            <span className="text-[10px] text-yellow-300 font-black uppercase tracking-widest leading-none">
              SHCH BUXORO
            </span>
            <span className="text-[10px] text-blue-300 font-bold uppercase tracking-widest leading-none mt-0.5">
              {selectedStation || currentWorker?.full_name}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button onClick={onAdminClick}
              className="bg-orange-500 px-2 sm:px-4 py-1.5 rounded-lg font-black text-[9px] sm:text-[10px] cursor-pointer shadow-md uppercase transition-all">
              ADMIN
            </button>
          )}
          {isAdmin && (
            <button onClick={onRejaClick}
              className="bg-purple-600 px-2 sm:px-4 py-1.5 rounded-lg font-black text-[9px] sm:text-[10px] cursor-pointer shadow-md uppercase transition-all text-white">
              REJA
            </button>
          )}
          <button onClick={onLogout}
            className="bg-red-600 px-2 sm:px-4 py-1.5 rounded-lg font-bold text-[9px] sm:text-xs cursor-pointer shadow-md transition-all">
            Chiqish
          </button>
        </div>
      </div>
    </header>
  );
}