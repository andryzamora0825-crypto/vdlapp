"use client";

import { useEffect, useState } from "react";
import { Timer, Crown, AlertTriangle } from "lucide-react";

interface VipCountdownProps {
  vipStartDate: string; // ISO string
  compact?: boolean;    // compact mode for sidebar / admin table
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function calcTimeLeft(startDate: string): TimeLeft {
  const start = new Date(startDate).getTime();
  const end = start + 30 * 24 * 60 * 60 * 1000; // +30 days
  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function VipCountdown({ vipStartDate, compact = false }: VipCountdownProps) {
  const [time, setTime] = useState<TimeLeft>(() => calcTimeLeft(vipStartDate));

  useEffect(() => {
    const id = setInterval(() => {
      setTime(calcTimeLeft(vipStartDate));
    }, 1000);
    return () => clearInterval(id);
  }, [vipStartDate]);

  if (time.expired) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
        <AlertTriangle className="w-3 h-3" /> VIP Expirado
      </span>
    );
  }

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
        <Timer className="w-3 h-3" />
        {time.days}d {pad(time.hours)}h {pad(time.minutes)}m {pad(time.seconds)}s
      </span>
    );
  }

  // Full card mode
  const pct = Math.max(
    0,
    Math.min(100, ((30 * 86400 - (time.days * 86400 + time.hours * 3600 + time.minutes * 60 + time.seconds)) / (30 * 86400)) * 100)
  );
  // colour shifts: green → yellow → red
  const barColor = time.days > 10 ? "#10b981" : time.days > 5 ? "#f59e0b" : "#ef4444";

  return (
    <div className="w-full rounded-2xl bg-gradient-to-br from-amber-500/5 to-yellow-500/5 border border-amber-500/20 p-6 space-y-5 shadow-[0_0_40px_-15px_rgba(245,158,11,0.3)]">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
          <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-300">Acceso VIP Activo</p>
          <p className="text-xs text-gray-500">Tiempo restante de tu membresía</p>
        </div>
      </div>

      {/* Countdown digits */}
      <div className="grid grid-cols-4 gap-3 text-center">
        {[
          { label: "Días", value: pad(time.days) },
          { label: "Horas", value: pad(time.hours) },
          { label: "Minutos", value: pad(time.minutes) },
          { label: "Segundos", value: pad(time.seconds) },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center justify-center bg-black/40 border border-white/10 rounded-xl py-4 px-2 gap-1 shadow-inner"
          >
            <span
              className="text-3xl font-extrabold tabular-nums tracking-tight"
              style={{ color: barColor }}
            >
              {value}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Inicio</span>
          <span>30 días</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${pct}%`, backgroundColor: barColor }}
          />
        </div>
        <p className="text-xs text-gray-500 text-right">{Math.round(pct)}% consumido</p>
      </div>
    </div>
  );
}
