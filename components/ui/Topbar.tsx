import { LogOut, User } from 'lucide-react'

export function Topbar() {
  return (
    <header className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 shadow-sm sm:px-6">
      <div className="flex items-center">
        {/* Placeholder for page title or breadcrumbs */}
        <h1 className="text-lg font-bold text-brand-dark hidden sm:block">Painel de Controle</h1>
      </div>
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <button className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <User className="w-5 h-5 text-slate-500" />
        </button>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-brand-red hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </form>
      </div>
    </header>
  )
}
