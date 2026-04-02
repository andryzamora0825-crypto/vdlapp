"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { Crown, Eye, Star } from "lucide-react";
import dynamic from "next/dynamic";

// lazy import to avoid SSR issues with the live countdown
const VipCountdown = dynamic(() => import("@/components/VipCountdown"), { ssr: false });

export default function ProfilePage() {
  const { signOut } = useClerk();
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen p-6 font-sans bg-[#0A0A0B] flex justify-center items-center text-gray-400">
        Cargando perfil...
      </div>
    );
  }

  const email = user.primaryEmailAddress?.emailAddress || "Sin Correo";
  const name = user.fullName || email.split("@")[0];
  const isAdmin = email === "andryzamora0825@gmail.com";
  const isVIP = user.publicMetadata?.plan === "vip";
  const vipStartDate = user.publicMetadata?.vipStartDate as string | undefined;

  return (
    <main className="min-h-screen p-6 sm:p-12 font-sans bg-[#0A0A0B] text-gray-100 flex justify-center items-start pt-24">
      <div className="w-full max-w-2xl flex flex-col items-center gap-6">

        {/* Avatar & name card */}
        <div className="w-full bg-white/5 border border-white/10 p-10 rounded-2xl shadow-xl flex flex-col items-center">
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt="Foto de perfil"
              className="w-24 h-24 rounded-full object-cover shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] mb-6 border-2 border-emerald-500/30"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-4xl text-white font-bold shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] mb-6">
              {name.charAt(0).toUpperCase()}
            </div>
          )}

          <h1 className="text-3xl font-extrabold text-white mb-2">{name}</h1>

          {/* Plan badge */}
          {isAdmin ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 mb-8">
              <Crown className="w-3 h-3 fill-purple-400" /> SÚPER ADMIN
            </span>
          ) : isVIP ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 mb-8">
              <Star className="w-3 h-3 fill-amber-400" /> VIP
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-gray-400 border border-white/10 mb-8">
              <Eye className="w-3 h-3" /> Free — Solo Lectura
            </span>
          )}

          <div className="w-full space-y-4 text-left">
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-wrap justify-between items-center gap-2">
              <span className="text-gray-400">Email</span>
              <span className="text-gray-200 font-medium truncate">{email}</span>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex justify-between items-center">
              <span className="text-gray-400">Estado</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-emerald-400 font-medium">Activo</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="mt-10 px-8 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold rounded-xl transition-all border border-red-500/20"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* VIP Countdown — only if VIP and we have the start date */}
        {isVIP && vipStartDate && (
          <div className="w-full">
            <VipCountdown vipStartDate={vipStartDate} />
          </div>
        )}

        {/* Message for free users */}
        {!isAdmin && !isVIP && (
          <div className="w-full p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-center text-sm text-gray-500">
            ✦ Contacta al administrador para obtener acceso VIP y desbloquear el registro de vouchers.
          </div>
        )}
      </div>
    </main>
  );
}
