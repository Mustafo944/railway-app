"use client"

export default function FaultModal({
  faultReason, setFaultReason,
  customFaultReason, setCustomFaultReason,
  confirmFaultSend, setConfirmFaultSend,
  isSubmitting,
  sendFault,
  onClose,
}) {
  return (
    <>
      {/* NOSOZLIK SABABI MODALI */}
      <div className="fixed inset-0 bg-black/70 z-150 flex items-center justify-center">
        <div className="bg-white w-full max-w-md p-8 rounded-3xl space-y-4">
          <h2 className="text-2xl font-black text-red-600 uppercase">Nosozlik sababi</h2>
          <select
            value={faultReason}
            onChange={(e) => setFaultReason(e.target.value)}
            className="w-full border p-3 rounded-xl"
          >
            <option value="">Sababni tanlang</option>
            <option value="Rels zanjiri">Rels zanjiri</option>
            <option value="Strelkali o'tkazgich">Strelkali o'tkazgich</option>
            <option value="Yolg'on bandlik">Yolg'on bandlik</option>
            <option value="Yo'nalishni o'zgartirish">Yo'nalishni o'zgartirish</option>
            <option value="Boshqa">Boshqa sabab</option>
          </select>
          {faultReason === "Boshqa" && (
            <textarea
              placeholder="Sababni yozing"
              value={customFaultReason}
              onChange={(e) => setCustomFaultReason(e.target.value)}
              className="w-full border p-3 rounded-xl"
            />
          )}
          <div className="flex gap-3">
            <button
              disabled={!faultReason || (faultReason === "Boshqa" && !customFaultReason)}
              onClick={() => setConfirmFaultSend(true)}
              className="flex-1 bg-red-600 text-white py-3 rounded-xl disabled:bg-gray-400 cursor-pointer font-bold"
            >
              Yuborish
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 py-3 rounded-xl font-bold cursor-pointer"
            >
              Ortga
            </button>
          </div>
        </div>
      </div>

      {/* TASDIQLASH MODALI */}
      {confirmFaultSend && (
        <div className="fixed inset-0 bg-black/80 z-160 flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl text-center max-w-sm space-y-4">
            <h3 className="text-xl font-black text-red-600">Nosozlik yuborilsinmi?</h3>
            <div className="flex gap-3">
              <button
                onClick={sendFault}
                disabled={isSubmitting}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold cursor-pointer disabled:opacity-50"
              >
                Yuborish
              </button>
              <button
                onClick={() => setConfirmFaultSend(false)}
                className="flex-1 bg-gray-200 py-3 rounded-xl font-bold cursor-pointer"
              >
                Bekor
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}