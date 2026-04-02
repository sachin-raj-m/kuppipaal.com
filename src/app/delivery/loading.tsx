export default function DeliveryLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <div className="h-7 bg-slate-200 rounded-md w-40 mb-2" />
        <div className="h-4 bg-slate-200 rounded-md w-64 pb-4 border-b border-slate-100" />
        <div className="flex gap-4 mt-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex-1 bg-slate-100 rounded-xl p-4 h-20" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 flex justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-slate-200 rounded w-40" />
              <div className="h-3 bg-slate-200 rounded w-56" />
            </div>
            <div className="flex gap-3">
              <div className="w-24 h-14 bg-slate-200 rounded-lg" />
              <div className="w-24 h-14 bg-slate-200 rounded-lg" />
              <div className="w-36 h-14 bg-slate-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
