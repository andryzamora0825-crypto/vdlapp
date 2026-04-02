"use client";

import { useState, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
  FileText,
  UploadCloud,
  Copy,
  Check,
  Loader2,
  ShieldAlert,
  ImageIcon,
  X,
  Hash,
  KeyRound,
} from "lucide-react";

interface ExtractedData {
  nota: string | null;
  clave: string | null;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      title="Copiar"
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
        copied
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
      }`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" /> Copiado
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" /> Copiar
        </>
      )}
    </button>
  );
}

export default function NotaRetiroPage() {
  const { isLoaded, user } = useUser();
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isVip = user?.publicMetadata?.plan === "vip";
  const isAdmin = user?.primaryEmailAddress?.emailAddress === "andryzamora0825@gmail.com";
  const hasAccess = isVip || isAdmin;

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setFileName(f.name);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped && dropped.type.startsWith("image/")) handleFile(dropped);
    },
    [handleFile]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setFileName(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/nota-retiro", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al procesar la imagen.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

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
            Esta función está disponible exclusivamente para usuarios VIP. Contacta al administrador para obtener acceso.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0B] p-6 sm:p-12 font-sans">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 rounded-2xl shadow-[0_0_30px_-5px_rgba(139,92,246,0.4)]">
            <FileText className="w-7 h-7 text-violet-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Nota de Retiro</h1>
            <p className="text-gray-500 mt-0.5">Extrae el número y la clave de tu nota</p>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !preview && inputRef.current?.click()}
          className={`relative w-full rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden
            ${dragging
              ? "border-violet-500/60 bg-violet-500/5 scale-[1.01]"
              : preview
              ? "border-white/10 bg-white/[0.03] cursor-default"
              : "border-white/10 bg-white/[0.02] hover:border-violet-500/40 hover:bg-violet-500/5"
            }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onInputChange}
          />

          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Nota de retiro"
                className="w-full max-h-72 object-contain bg-black/20"
              />
              <button
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-red-500/80 text-white rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="px-4 py-2 border-t border-white/5 flex items-center gap-2 text-xs text-gray-500">
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="truncate">{fileName}</span>
              </div>
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center gap-4">
              <div className="p-4 bg-violet-500/10 rounded-2xl border border-violet-500/20">
                <UploadCloud className="w-10 h-10 text-violet-400" />
              </div>
              <div className="text-center">
                <p className="text-gray-300 font-semibold">Arrastra tu imagen aquí</p>
                <p className="text-gray-500 text-sm mt-1">o haz clic para seleccionarla</p>
              </div>
              <span className="text-xs text-gray-600 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                JPG, PNG, WEBP
              </span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        {file && !loading && !result && (
          <button
            onClick={handleSubmit}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-bold text-base hover:from-violet-400 hover:to-indigo-400 transition-all shadow-[0_0_30px_-10px_rgba(139,92,246,0.5)] hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.7)] hover:scale-[1.01]"
          >
            ✦ Extraer Datos
          </button>
        )}

        {/* Loading */}
        {loading && (
          <div className="w-full py-6 flex flex-col items-center gap-3 rounded-2xl bg-white/[0.03] border border-white/10">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            <p className="text-gray-400 text-sm">Analizando imagen con IA...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-gray-300">Datos extraídos</span>
            </div>

            <div className="p-6 space-y-4">
              {/* Nota No */}
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-black/30 border border-white/5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-violet-500/10 rounded-lg border border-violet-500/20 shrink-0">
                    <Hash className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Nota de Retiro No.</p>
                    <p className="text-xl font-extrabold text-white tracking-wide font-mono truncate">
                      {result.nota ?? <span className="text-gray-600 font-normal text-sm">No encontrado</span>}
                    </p>
                  </div>
                </div>
                {result.nota && <CopyButton value={result.nota} />}
              </div>

              {/* Clave */}
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-black/30 border border-white/5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 shrink-0">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Clave</p>
                    <p className="text-xl font-extrabold text-white tracking-wide font-mono truncate">
                      {result.clave ?? <span className="text-gray-600 font-normal text-sm">No encontrado</span>}
                    </p>
                  </div>
                </div>
                {result.clave && <CopyButton value={result.clave} />}
              </div>
            </div>

            {/* Scan again */}
            <div className="px-6 pb-6">
              <button
                onClick={clearFile}
                className="w-full py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
              >
                ↺ Escanear otra nota
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
