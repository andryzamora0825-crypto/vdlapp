"use client"
import { Calendar, ChevronDown, Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export default function DashboardFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentFilter = searchParams.get("filter") || ""
  const currentDate = searchParams.get("date") || ""
  const currentSearch = searchParams.get("q") || ""
  
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState(currentSearch)
  
  let displayValue = "Seleccionar fecha..."
  if (currentDate) {
    displayValue = currentDate
  } else if (currentFilter === "hoy") {
    displayValue = "Hoy"
  } else if (currentFilter === "ayer") {
    displayValue = "Ayer"
  } else if (currentFilter === "7d") {
    displayValue = "Últimos 7 días"
  } else if (currentFilter === "30d") {
    displayValue = "Últimos 30 días"
  } else if (currentFilter === "mes") {
    displayValue = "Este Mes"
  } else if (currentFilter === "ult-mes") {
    displayValue = "Último Mes"
  }

  const handleSelect = (val: string) => {
    setShowDropdown(false)
    router.push(`?filter=${val}`)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val) {
      router.push(`?date=${val}`)
    } else {
      router.push(`?`)
    }
    setShowDropdown(false)
  }

  const applySearch = (val: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (val) params.set("q", val)
    else params.delete("q")
    router.push(`?${params.toString()}`)
  }

  const handleClear = () => {
    setSearchTerm("")
    router.push(`?`)
  }

  return (
    <div className="bg-[#111113] text-gray-100 p-5 rounded-xl shadow-sm w-full max-w-4xl mx-auto border border-white/10 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-400 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
          Filtros
        </h2>
        {(currentFilter || currentDate || currentSearch) && (
          <button 
            onClick={handleClear}
            className="text-xs text-red-400 hover:text-red-300 font-medium bg-red-500/10 px-3 py-1 rounded-lg transition-colors border border-red-500/20"
          >
            Limpiar
          </button>
        )}
      </div>
      <hr className="border-white/10 mb-5"/>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 md:max-w-xs relative">
          <label className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Fecha
          </label>
          
          <div 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center justify-between border border-white/20 rounded-xl px-4 py-2.5 cursor-pointer bg-white/5 hover:bg-white/10 transition-colors"
          >
            <span className="text-gray-200 font-medium text-sm">{displayValue}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </div>

          {showDropdown && (
            <div className="absolute top-[68px] left-0 w-full min-w-[220px] bg-[#1a1a1d] border border-white/10 shadow-2xl rounded-xl z-50 py-2 text-sm text-gray-300 overflow-hidden">
              <div onClick={() => handleSelect("hoy")} className="px-4 py-2.5 cursor-pointer hover:bg-white/5 hover:text-emerald-400 transition-colors">Hoy</div>
              <div onClick={() => handleSelect("ayer")} className="px-4 py-2.5 cursor-pointer hover:bg-white/5 hover:text-emerald-400 transition-colors">Ayer</div>
              <div onClick={() => handleSelect("7d")} className="px-4 py-2.5 cursor-pointer hover:bg-white/5 hover:text-emerald-400 transition-colors">Últimos 7 días</div>
              <div onClick={() => handleSelect("30d")} className="px-4 py-2.5 cursor-pointer hover:bg-white/5 hover:text-emerald-400 transition-colors">Últimos 30 días</div>
              <div onClick={() => handleSelect("mes")} className="px-4 py-2.5 cursor-pointer hover:bg-white/5 hover:text-emerald-400 transition-colors">Este Mes</div>
              <div onClick={() => handleSelect("ult-mes")} className="px-4 py-2.5 cursor-pointer hover:bg-white/5 hover:text-emerald-400 transition-colors">Último Mes</div>
              
              <div className="px-4 pt-3 pb-2 mt-2 border-t border-white/10 bg-white/[0.02]">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2 block">Rango exacto</span>
                <input 
                  type="date"
                  className="border border-white/10 w-full rounded-lg px-3 py-2 bg-white/5 text-gray-200 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50"
                  value={currentDate}
                  onChange={handleDateChange}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 md:max-w-xs relative">
          <label className="text-gray-400 text-sm font-medium mb-2 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Buscar Comprobante
          </label>
          <input 
            type="text"
            placeholder="Nº de comprobante..."
            className="border border-white/20 w-full rounded-xl px-4 py-2.5 bg-white/5 text-gray-200 placeholder-gray-600 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applySearch(searchTerm)
            }}
            onBlur={() => applySearch(searchTerm)}
          />
        </div>
      </div>
      
      {/* Background overlay specifically for closing the dropdown easily */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}
