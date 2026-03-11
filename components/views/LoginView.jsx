// railway-app/components/views/LoginView.jsx
import { Eye, EyeOff } from 'lucide-react';

export default function LoginView({
  loginId, loginPass, showPassword, authError,
  onLoginIdChange, onLoginPassChange,
  onShowPasswordToggle, onSubmit
}) {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm border-t-4 border-blue-900 text-center">
        <img src="/logo.png" alt="Logo" className="w-48 h-48 object-contain mb-2 mx-auto" />
        <p className="text-2xl font-black text-blue-900 uppercase tracking-widest mb-6">SHCH BUXORO</p>
        <h2 className="text-3xl font-black mb-8 text-slate-800 tracking-tighter uppercase">Kirish</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="ID raqami"
            required
            className="w-full p-4 border-2 rounded-2xl outline-none focus:border-blue-900 bg-slate-50 font-bold cursor-text"
            value={loginId}
            onChange={onLoginIdChange}
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Parol"
              required
              className="w-full p-4 border-2 rounded-2xl outline-none focus:border-blue-900 bg-slate-50 font-bold cursor-text"
              value={loginPass}
              onChange={onLoginPassChange}
            />
            <button
              type="button"
              onClick={onShowPasswordToggle}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-900 cursor-pointer p-1"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {authError && (
            <div className="text-red-600 font-black text-xs uppercase">{authError}</div>
          )}
          <button className="w-full bg-blue-900 text-white py-5 rounded-2xl font-black text-xl shadow-xl active:scale-95 transition-all cursor-pointer uppercase tracking-widest">
            KIRISH
          </button>
        </form>
      </div>
    </div>
  );
}