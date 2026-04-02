"use client";

import { useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { UploadCloud, CheckCircle, FileImage, Loader2, Copy, Check, Lock } from "lucide-react";

export default function UploadVoucher() {
  const { user } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const currentEmail = user?.primaryEmailAddress?.emailAddress;
  const isVip = user?.publicMetadata?.plan === "vip";
  const isAdmin = currentEmail === 'andryzamora0825@gmail.com';
  const hasAccess = isVip || isAdmin;

  const handleCopy = () => {
    if (resultText) {
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
      setResultText(null);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setWarning(null);
      setResultText(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setWarning(null);
    setResultText(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocurrió un error al procesar el voucher.");
      }

      setResultText(data.message);
      if (data.warning) {
        setWarning(data.warning);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!hasAccess) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="relative flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/10 bg-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
          <div className="p-5 rounded-full bg-black/40 mb-5 relative z-10 shadow-lg border border-white/5">
            <Lock className="w-12 h-12 text-gray-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-300 relative z-10 mb-3">Función Bloqueada</h3>
          <p className="text-center text-gray-400 max-w-md relative z-10 leading-relaxed">
            Tu cuenta actualmente se encuentra en el plan <span className="text-gray-200 font-semibold border-b border-gray-600">Free</span>. Dile a un Administrador que te proporcione acceso <span className="text-amber-400 font-semibold">VIP</span> para procesar vouchers automatizados y gestionar tus registros.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`relative group flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-3xl transition-all duration-300
          ${file ? "border-emerald-500 bg-emerald-500/10" : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40"}`}
      >
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleChange} 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
        />
        
        {file ? (
          <div className="flex flex-col items-center space-y-4 text-emerald-400">
            <FileImage className="w-16 h-16" />
            <span className="font-semibold">{file.name}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4 text-gray-400 group-hover:text-gray-200 transition-colors">
            <div className="p-4 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
              <UploadCloud className="w-10 h-10" />
            </div>
            <p className="text-lg font-medium">Arrastra tu voucher aquí o haz clic para subir</p>
            <p className="text-sm opacity-60">Soporta JPG, PNG, WEBP</p>
          </div>
        )}
      </div>

      {file && (
        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full relative overflow-hidden group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl py-4 px-8 font-semibold text-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)]"
        >
          <div className="relative flex items-center justify-center gap-3">
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Analizando con IA...</span>
              </>
            ) : (
              <span>Procesar Voucher</span>
            )}
          </div>
        </button>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center">
          {error}
        </div>
      )}

      {warning && (
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-center animate-in fade-in slide-in-from-bottom-2">
          {warning}
        </div>
      )}

      {resultText && (
        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 text-emerald-400">
              <CheckCircle className="w-6 h-6" />
              <h3 className="text-xl font-semibold text-white">Voucher Procesado</h3>
            </div>
            
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors border border-white/10 active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="text-sm font-medium">Copiar</span>
                </>
              )}
            </button>
          </div>
          <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-300 bg-black/40 p-6 rounded-xl border border-white/5">
            {resultText}
          </div>
        </div>
      )}
    </div>
  );
}
