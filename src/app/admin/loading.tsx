export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-7 bg-slate-200 rounded-md w-56 mb-2" />
        <div className="h-4 bg-slate-200 rounded-md w-80" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 h-28 flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-3 bg-slate-200 rounded w-28" />
              <div className="h-7 bg-slate-200 rounded w-16" />
            </div>
            <div className="w-12 h-12 bg-slate-200 rounded-lg" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="h-5 bg-slate-200 rounded w-40" />
        </div>
        <div className="divide-y divide-slate-100">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-6 py-4 flex gap-6">
              <div className="h-4 bg-slate-200 rounded flex-1" />
              <div className="h-4 bg-slate-200 rounded w-24" />
              <div className="h-4 bg-slate-200 rounded w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
