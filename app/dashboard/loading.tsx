export default function DashboardLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-pulse">
      {/* Cabeçalho Skeleton */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="space-y-3">
          <div className="h-4 w-32 bg-slate-200 rounded-md"></div>
          <div className="h-9 w-72 sm:w-96 bg-slate-200 rounded-xl"></div>
          <div className="h-4 w-full max-w-lg bg-slate-100 rounded-md"></div>
        </div>
      </div>

      {/* Grid de 3 Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs h-44 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-200"></div>
            <div className="w-16 h-6 rounded-lg bg-slate-100"></div>
          </div>
          <div className="space-y-2">
            <div className="h-10 w-24 bg-slate-200 rounded-lg"></div>
            <div className="h-4 w-36 bg-slate-100 rounded-md"></div>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs h-44 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-200"></div>
            <div className="w-16 h-6 rounded-lg bg-slate-100"></div>
          </div>
          <div className="space-y-2">
            <div className="h-10 w-24 bg-slate-200 rounded-lg"></div>
            <div className="h-4 w-36 bg-slate-100 rounded-md"></div>
          </div>
        </div>

        <div className="bg-slate-200/70 p-6 sm:p-8 rounded-3xl shadow-xs h-44 flex flex-col justify-between sm:col-span-2 md:col-span-1">
          <div className="w-12 h-12 rounded-2xl bg-slate-300"></div>
          <div className="space-y-3">
            <div className="h-8 w-28 bg-slate-300 rounded-lg"></div>
            <div className="h-3 w-full bg-slate-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
