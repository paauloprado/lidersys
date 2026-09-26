'use client'

import { useState } from 'react'
import { BarChart3, MapPin, Building2, Users, TrendingUp, Download } from 'lucide-react'
import type { RelatoriosData } from './actions'

type Tab = 'bairro' | 'escola' | 'cabo'

export default function RelatoriosClient({ data }: { data: RelatoriosData }) {
  const [activeTab, setActiveTab] = useState<Tab>('bairro')

  const { votosBairro, votosEscola, votosCabo, grandTotal } = data

  const tabs: { id: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'bairro', label: 'Por Bairro', icon: MapPin, count: votosBairro.length },
    { id: 'escola', label: 'Por Escola', icon: Building2, count: votosEscola.length },
    { id: 'cabo', label: 'Por Cabo Eleitoral', icon: Users, count: votosCabo.length },
  ]

  const maxBairro = votosBairro[0]?.total || 1
  const maxEscola = votosEscola[0]?.total || 1
  const maxCabo = votosCabo[0]?.total || 1

  function handleExportCSV() {
    let csv = ''
    if (activeTab === 'bairro') {
      csv = 'Bairro,Total de Votos\n' + votosBairro.map(r => `"${r.bairro}",${r.total}`).join('\n')
    } else if (activeTab === 'escola') {
      csv = 'Escola,Bairro,Total de Votos\n' + votosEscola.map(r => `"${r.escola}","${r.bairro}",${r.total}`).join('\n')
    } else {
      csv = 'Cabo Eleitoral,Votos Eleitores,Votos Cabo,Total\n' + votosCabo.map(r => `"${r.cabo_nome}",${r.total_eleitores},${r.total_cabos},${r.total}`).join('\n')
    }
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio_votos_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-gradient-to-br from-brand-primary/10 to-brand-dark/5 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-brand-primary font-bold mb-1 text-xs tracking-wide uppercase">
            <BarChart3 className="w-4 h-4" />
            <span>Análise Quantitativa</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-dark tracking-tight">
            Relatório de Votos
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Total consolidado:{' '}
            <strong className="text-brand-primary">{grandTotal.toLocaleString('pt-BR')} votos</strong> em toda a base.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-brand-dark px-4 py-2.5 rounded-xl font-bold text-sm transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Bairros com Votos', value: votosBairro.length, icon: MapPin, color: 'text-blue-600 bg-blue-50' },
          { label: 'Escolas Mapeadas', value: votosEscola.length, icon: Building2, color: 'text-purple-600 bg-purple-50' },
          { label: 'Cabos Eleitorais', value: votosCabo.length, icon: Users, color: 'text-emerald-600 bg-emerald-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className={`w-11 h-11 rounded-2xl ${color} flex items-center justify-center shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-brand-dark">{value}</p>
              <p className="text-xs font-bold text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-1.5 gap-1">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === id
                  ? 'bg-white text-brand-primary shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/70'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${activeTab === id ? 'bg-brand-primary/10 text-brand-primary' : 'bg-slate-200 text-slate-600'}`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        <div className="p-5 sm:p-6">
          {/* Tab: Bairro */}
          {activeTab === 'bairro' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Ranking de votos por bairro
              </p>
              {votosBairro.length === 0 ? (
                <EmptyState label="Nenhum dado de bairro encontrado." />
              ) : votosBairro.map((row, i) => (
                <BarRow
                  key={row.bairro}
                  rank={i + 1}
                  label={row.bairro}
                  value={row.total}
                  max={maxBairro}
                  grandTotal={grandTotal}
                />
              ))}
            </div>
          )}

          {/* Tab: Escola */}
          {activeTab === 'escola' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Ranking de votos por unidade escolar
              </p>
              {votosEscola.length === 0 ? (
                <EmptyState label="Nenhum dado de escola encontrado." />
              ) : votosEscola.map((row, i) => (
                <BarRow
                  key={row.escola}
                  rank={i + 1}
                  label={row.escola}
                  sublabel={row.bairro}
                  value={row.total}
                  max={maxEscola}
                  grandTotal={grandTotal}
                />
              ))}
            </div>
          )}

          {/* Tab: Cabo Eleitoral */}
          {activeTab === 'cabo' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Ranking de votos por cabo eleitoral
              </p>
              {votosCabo.length === 0 ? (
                <EmptyState label="Nenhum registro de cabo eleitoral encontrado." />
              ) : votosCabo.map((row, i) => (
                <CaboRow
                  key={row.cabo_id}
                  rank={i + 1}
                  nome={row.cabo_nome}
                  totalEleitores={row.total_eleitores}
                  totalCabos={row.total_cabos}
                  total={row.total}
                  max={maxCabo}
                  grandTotal={grandTotal}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BarRow({
  rank,
  label,
  sublabel,
  value,
  max,
  grandTotal,
}: {
  rank: number
  label: string
  sublabel?: string
  value: number
  max: number
  grandTotal: number
}) {
  const pct = Math.round((value / max) * 100)
  const pctGrand = ((value / grandTotal) * 100).toFixed(1)
  return (
    <div className="group flex items-center gap-3 sm:gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
      <div className="w-7 h-7 rounded-xl bg-brand-primary/10 text-brand-primary font-black text-xs flex items-center justify-center shrink-0">
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1.5 gap-2">
          <div className="min-w-0">
            <p className="font-bold text-brand-dark text-sm truncate">{label}</p>
            {sublabel && <p className="text-xs text-slate-400 font-medium truncate">{sublabel}</p>}
          </div>
          <div className="text-right shrink-0">
            <p className="font-black text-brand-dark text-sm">{value.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-slate-400 font-medium">{pctGrand}% do total</p>
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-dark transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function CaboRow({
  rank,
  nome,
  totalEleitores,
  totalCabos,
  total,
  max,
  grandTotal,
}: {
  rank: number
  nome: string
  totalEleitores: number
  totalCabos: number
  total: number
  max: number
  grandTotal: number
}) {
  const pct = Math.round((total / max) * 100)
  const pctGrand = ((total / grandTotal) * 100).toFixed(1)
  return (
    <div className="group flex items-center gap-3 sm:gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
      <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 text-brand-primary font-black text-base flex items-center justify-center shrink-0">
        {nome.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1.5 gap-2">
          <div className="min-w-0">
            <p className="font-bold text-brand-dark text-sm truncate">{nome}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded-md">{totalEleitores} eleitores</span>
              <span className="text-xs text-purple-600 font-bold bg-purple-50 px-1.5 py-0.5 rounded-md">{totalCabos} de lote</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="font-black text-brand-dark text-sm">{total.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-slate-400 font-medium">{pctGrand}% do total</p>
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-16 flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
        <BarChart3 className="w-8 h-8" />
      </div>
      <p className="text-slate-500 font-bold text-sm">{label}</p>
      <p className="text-slate-400 text-xs mt-1">Cadastre eleitores e cabos para gerar o relatório.</p>
    </div>
  )
}
