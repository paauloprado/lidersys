export default function RelatoriosLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="h-4 bg-slate-100 rounded-full w-32 mb-3" />
        <div className="h-8 bg-slate-100 rounded-2xl w-64 mb-2" />
        <div className="h-4 bg-slate-100 rounded-full w-48" />
      </div>
      {/* Summary cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-slate-100 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-slate-100 rounded-xl w-12" />
              <div className="h-3 bg-slate-100 rounded-full w-28" />
            </div>
          </div>
        ))}
      </div>
      {/* Table skeleton */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-1.5 gap-1">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1 h-10 bg-slate-100 rounded-xl" />
          ))}
        </div>
        <div className="p-5 sm:p-6 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-7 h-7 rounded-xl bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 bg-slate-100 rounded-full w-48" />
                  <div className="h-4 bg-slate-100 rounded-full w-16" />
                </div>
                <div className="h-2 bg-slate-100 rounded-full w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
