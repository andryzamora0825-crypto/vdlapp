"use client";

import { useState, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  MessageSquare,
  UploadCloud,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  XCircle,
  FileText,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";

interface ResultItem {
  comprobante: string;
  registrado: boolean;
  fecha: string | null;
  monto: string | null;
}

interface ApiResult {
  resultado: ResultItem[];
  total: number;
  registrados: number;
  faltantes: number;
}

// Extracts comprobante numbers from a WhatsApp export .txt
// Matches lines like: *Comprobante: 0123456789
function extractComprobantes(text: string): string[] {
  const regex = /\*?Comprobante[:\s]+([A-Za-z0-9\-]+)/gi;
  const found = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const val = match[1].trim();
    if (val && val !== "No" && val.length > 2) found.add(val);
  }
  return Array.from(found);
}

export default function CompararChatPage() {
  const { isLoaded, user } = useUser();
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [comprobantesEncontrados, setComprobantesEncontrados] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"todos" | "faltantes" | "registrados">("todos");
  const [search, setSearch] = useState("");
  const [showFound, setShowFound] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isVip = user?.publicMetadata?.plan === "vip";
  const isAdmin = user?.primaryEmailAddress?.emailAddress === "andryzamora0825@gmail.com";
  const hasAccess = isVip || isAdmin;

  const handleFile = useCallback((f: File) => {
    setResult(null);
    setError(null);
    setFileName(f.name);
    setComprobantesEncontrados([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const found = extractComprobantes(text);
      setComprobantesEncontrados(found);
      if (found.length === 0) {
        setError("No se encontraron comprobantes en el archivo. Asegúrate de exportar el chat correcto.");
      }
    };
    reader.readAsText(f, "utf-8");
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const clearFile = () => {
    setFileName(null);
    setComprobantesEncontrados([]);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleComparar = async () => {
    if (comprobantesEncontrados.length === 0) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/comparar-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comprobantes: comprobantesEncontrados }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al comparar.");
      } else {
        setResult(data);
        setFilter("todos");
        setSearch("");
      }
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const filteredResult = result?.resultado.filter((r) => {
    const matchFilter =
      filter === "todos" ? true : filter === "faltantes" ? !r.registrado : r.registrado;
    const matchSearch = search
      ? r.comprobante.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchFilter && matchSearch;
  });

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </main>
    );
  }

  if (!hasAccess) {
    return (
      <main className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <ShieldAlert className="w-10 h-10 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Acceso VIP Requerido</h1>
          <p className="text-gray-400 text-sm">
            Esta función está disponible exclusivamente para usuarios VIP.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0B] p-6 sm:p-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)]">
            <MessageSquare className="w-7 h-7 text-green-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Verificar Chat</h1>
            <p className="text-gray-500 mt-0.5">Detecta vouchers del chat que aún no están registrados</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-sm text-blue-300 flex gap-3">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-blue-400" />
          <div>
            <p className="font-semibold mb-1">¿Cómo exportar el chat de WhatsApp?</p>
            <p className="text-blue-400/80">Abre el chat → Menú (⋮) → Más → Exportar chat → Sin archivos multimedia. Sube el archivo <span className="font-mono">.txt</span> que se descarga.</p>
          </div>
        </div>

        {/* Upload Zone */}
        {!fileName ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative w-full rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer py-16 flex flex-col items-center gap-4
              ${dragging
                ? "border-green-500/60 bg-green-500/5 scale-[1.01]"
                : "border-white/10 bg-white/[0.02] hover:border-green-500/40 hover:bg-green-500/5"
              }`}
          >
            <input ref={inputRef} type="file" accept=".txt,text/plain" className="hidden" onChange={onInputChange} />
            <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
              <UploadCloud className="w-10 h-10 text-green-400" />
            </div>
            <div className="text-center">
              <p className="text-gray-300 font-semibold">Arrastra el chat exportado aquí</p>
              <p className="text-gray-500 text-sm mt-1">o haz clic para seleccionarlo</p>
            </div>
            <span className="text-xs text-gray-600 px-3 py-1 bg-white/5 rounded-full border border-white/5">
              Archivo .txt de WhatsApp
            </span>
          </div>
        ) : (
          /* File loaded state */
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
            {/* File header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                  <FileText className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-200 truncate max-w-xs">{fileName}</p>
                  <p className="text-xs text-gray-500">
                    {comprobantesEncontrados.length > 0
                      ? `${comprobantesEncontrados.length} comprobantes detectados`
                      : "Analizando..."}
                  </p>
                </div>
              </div>
              <button
                onClick={clearFile}
                className="p-1.5 hover:bg-white/10 text-gray-500 hover:text-white rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comprobantes found (collapsible) */}
            {comprobantesEncontrados.length > 0 && (
              <div>
                <button
                  onClick={() => setShowFound(v => !v)}
                  className="w-full flex items-center justify-between px-5 py-3 text-xs text-gray-400 hover:bg-white/5 transition-all"
                >
                  <span>Ver comprobantes encontrados en el chat</span>
                  {showFound ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showFound && (
                  <div className="px-5 pb-4 flex flex-wrap gap-2">
                    {comprobantesEncontrados.map(c => (
                      <span
                        key={c}
                        className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-gray-300"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Compare Button */}
        {comprobantesEncontrados.length > 0 && !loading && !result && (
          <button
            onClick={handleComparar}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-base hover:from-green-400 hover:to-emerald-400 transition-all shadow-[0_0_30px_-10px_rgba(16,185,129,0.5)] hover:scale-[1.01]"
          >
            🔍 Comparar con registros
          </button>
        )}

        {/* Loading */}
        {loading && (
          <div className="w-full py-8 flex flex-col items-center gap-3 rounded-2xl bg-white/[0.03] border border-white/10">
            <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
            <p className="text-gray-400 text-sm">Comparando con la base de datos...</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-5">

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:bg-white/[0.07] transition-colors">
                <p className="text-2xl font-extrabold text-white">{result.total}</p>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">En el chat</p>
              </div>
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 text-center hover:bg-emerald-500/10 transition-colors">
                <p className="text-2xl font-extrabold text-emerald-400">{result.registrados}</p>
                <p className="text-xs text-emerald-600 mt-1 uppercase tracking-wider">Registrados</p>
              </div>
              <div className={`rounded-2xl p-4 text-center transition-colors border ${
                result.faltantes > 0
                  ? "bg-red-500/5 border-red-500/20 hover:bg-red-500/10"
                  : "bg-white/5 border-white/10"
              }`}>
                <p className={`text-2xl font-extrabold ${result.faltantes > 0 ? "text-red-400" : "text-gray-400"}`}>
                  {result.faltantes}
                </p>
                <p className={`text-xs mt-1 uppercase tracking-wider ${result.faltantes > 0 ? "text-red-600" : "text-gray-500"}`}>
                  Faltantes
                </p>
              </div>
            </div>

            {result.faltantes === 0 && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p className="text-sm font-semibold">¡Todo en orden! Todos los vouchers del chat están registrados.</p>
              </div>
            )}

            {/* Filters + Search */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex rounded-xl overflow-hidden border border-white/10 text-xs font-semibold shrink-0">
                {(["todos", "faltantes", "registrados"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2.5 capitalize transition-all ${
                      filter === f
                        ? f === "faltantes"
                          ? "bg-red-500/20 text-red-300"
                          : f === "registrados"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-white/10 text-white"
                        : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                    }`}
                  >
                    {f}
                    {f === "faltantes" && result.faltantes > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-red-500/30 text-red-300 text-[10px]">
                        {result.faltantes}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar comprobante..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-green-500/40 focus:bg-white/[0.07] transition-all"
                />
              </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Comprobante</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredResult && filteredResult.length > 0 ? (
                    filteredResult.map((r) => (
                      <tr key={r.comprobante} className={`transition-colors ${r.registrado ? "hover:bg-white/[0.02]" : "bg-red-500/[0.03] hover:bg-red-500/10"}`}>
                        <td className="px-5 py-4">
                          {r.registrado ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Registrado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
                              <XCircle className="w-3.5 h-3.5" /> Faltante
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-mono text-gray-200 font-medium">{r.comprobante}</td>
                        <td className="px-5 py-4 text-emerald-400 font-medium">
                          {r.monto ?? <span className="text-gray-600">—</span>}
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-xs">
                          {r.fecha
                            ? new Date(r.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })
                            : <span className="text-red-500/60">Sin registro</span>}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-gray-600 text-sm">
                        No hay resultados para el filtro seleccionado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Scan again */}
            <button
              onClick={clearFile}
              className="w-full py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
            >
              ↺ Cargar otro chat
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
