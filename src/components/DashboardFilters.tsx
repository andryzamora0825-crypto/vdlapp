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
    <div className="bg-white text-gray-800 p-6 rounded-lg shadow-sm w-full max-w-4xl mx-auto border border-gray-100 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#6c7b94] text-lg font-medium flex items-center gap-2">
          Filtros
        </h2>
        <h2 className="text-[#6c7b94] text-lg font-medium flex items-center gap-2">
          Filtros
        </h2>
        {(currentFilter || currentDate || currentSearch) && (
          <button 
            onClick={handleClear}
            className="text-xs text-red-500 hover:text-red-600 font-medium bg-red-50 px-2 py-1 rounded transition-colors"
          >
            Limpiar Filtros
          </button>
        )}
      </div>
      <hr className="border-gray-100 mb-6"/>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 md:max-w-xs relative">
          <label className="text-gray-600 text-sm font-medium mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Fecha
          </label>
          
          <div 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center justify-between border border-[#0088cc] rounded px-4 py-2 cursor-pointer bg-white"
          >
            <span className="text-gray-700 font-medium">{displayValue}</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </div>

          {showDropdown && (
            <div className="absolute top-[76px] left-0 w-full min-w-[260px] bg-white border border-gray-200 shadow-xl rounded-lg z-50 py-2 text-sm text-gray-700 overflow-hidden">
              <div onClick={() => handleSelect("hoy")} className="px-4 py-2.5 cursor-pointer hover:bg-gray-50 hover:text-[#0088cc] transition-colors">Hoy</div>
              <div onClick={() => handleSelect("ayer")} className="px-4 py-2.5 cursor-pointer hover:bg-gray-50 hover:text-[#0088cc] transition-colors">Ayer</div>
              <div onClick={() => handleSelect("7d")} className="px-4 py-2.5 cursor-pointer hover:bg-gray-50 hover:text-[#0088cc] transition-colors">Últimos 7 días</div>
              <div onClick={() => handleSelect("30d")} className="px-4 py-2.5 cursor-pointer hover:bg-gray-50 hover:text-[#0088cc] transition-colors">Últimos 30 días</div>
              <div onClick={() => handleSelect("mes")} className="px-4 py-2.5 cursor-pointer hover:bg-gray-50 hover:text-[#0088cc] transition-colors">Este Mes</div>
              <div onClick={() => handleSelect("ult-mes")} className="px-4 py-2.5 cursor-pointer hover:bg-gray-50 hover:text-[#0088cc] transition-colors">Último Mes</div>
              
              <div className="px-4 pt-3 pb-2 mt-2 border-t border-gray-100 bg-gray-50/50">
                <span className="text-xs text-[#6c7b94] uppercase tracking-wider font-semibold mb-2 block">Personalizar Rango Exacto</span>
                <input 
                  type="date"
                  className="border border-gray-300 w-full rounded-md px-3 py-2 bg-white text-gray-700 outline-none focus:ring-2 focus:ring-[#0088cc]/50 focus:border-[#0088cc] shadow-sm"
                  value={currentDate}
                  onChange={handleDateChange}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 md:max-w-xs relative">
          <label className="text-gray-600 text-sm font-medium mb-2 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Buscar Comprobante
          </label>
          <input 
            type="text"
            placeholder="Nº de comprobante..."
            className="border border-gray-300 w-full rounded-md px-4 py-2 bg-white text-gray-700 outline-none focus:ring-2 focus:ring-[#0088cc]/50 focus:border-[#0088cc] shadow-sm transition-all"
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
