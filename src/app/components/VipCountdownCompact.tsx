"use client";
/**
 * Thin client-side wrapper used exclusively inside the admin Server Component.
 * Re-exports VipCountdown in compact mode so the admin table
 * can display live countdowns without converting the page to a Client Component.
 */
import VipCountdown from "./VipCountdown";

export default function VipCountdownCompact({ vipStartDate }: { vipStartDate: string }) {
  return <VipCountdown vipStartDate={vipStartDate} compact />;
}
