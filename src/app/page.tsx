"use client";

import UploadVoucher from "@/components/UploadVoucher";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Bot, ShieldCheck, Zap, Loader2 } from "lucide-react";

export default function Home() {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </main>
    );
  }

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-4 sm:p-12 md:p-24 overflow-hidden bg-[#0A0A0B]">
      {/* Universal Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      
      {!userId ? (
        <div className="relative z-10 flex flex-col items-center w-full max-w-6xl mx-auto mt-12 mb-24">
          {/* Top badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-sm font-medium tracking-wide mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            VDL Zamora - Plataforma Privada
          </motion.div>

          {/* Main Hero Header */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 text-center max-w-4xl"
          >
            Automatiza la Validación de <br className="hidden md:block"/> 
            <span className="text-emerald-400">Comprobantes de Pago</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto text-center mt-6"
          >
            Nuestra Inteligencia Artificial extrae, valida y registra los comprobantes en tiempo real, conectándose directo a tu base de datos y panel de control.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-10"
          >
            <Link 
              href="/sign-in" 
              className="group relative px-8 py-4 bg-emerald-500 text-white font-semibold rounded-full overflow-hidden transition-all hover:bg-emerald-400 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] flex items-center gap-2"
            >
              <span className="relative z-10">Iniciar Sesión</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="/sign-up" 
              className="px-8 py-4 bg-white/5 text-gray-300 font-semibold rounded-full border border-white/10 transition-all hover:bg-white/10 hover:text-white"
            >
              Solicitar Acceso
            </Link>
          </motion.div>

          {/* Feature Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full"
          >
            {[
              { icon: <Bot className="w-6 h-6 text-emerald-400"/>, title: "Análisis con IA", desc: "Visión por computadora avanzada que lee cualquier recibo o transferencia al instante sin errores." },
              { icon: <Zap className="w-6 h-6 text-emerald-400"/>, title: "En Tiempo Real", desc: "Los datos de cada comprobante son extraídos e ingresados a la base de datos de inmediato." },
              { icon: <ShieldCheck className="w-6 h-6 text-emerald-400"/>, title: "100% Seguro", desc: "Autenticación robusta y almacenamiento en la nube completamente encriptado mediante Supabase." }
            ].map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-2xl backdrop-blur-sm transition-all hover:bg-white/10 hover:-translate-y-1">
                <div className="bg-white/5 w-12 h-12 rounded-full flex items-center justify-center mb-4 border border-white/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-100 mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center w-full max-w-5xl mx-auto py-6 sm:py-10">
          <div className="text-center space-y-4 mb-8 sm:mb-12 px-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-sm font-medium tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              IA Activada
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
              Sube tu Comprobante
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
              Sube tu recibo de pago y nuestra Inteligencia Artificial se encargará de extraer el monto y registrarlo.
            </p>
          </div>

          <UploadVoucher />
        </div>
      )}
    </main>
  );
}
