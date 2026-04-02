import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { updateUserPlan } from "./actions";
import { ShieldCheck, User as UserIcon, Star, Eye, Users, Crown } from "lucide-react";
import VipCountdownCompact from "@/components/VipCountdownCompact";

export default async function AdminPage() {
  const adminUser = await currentUser();
  const email = adminUser?.primaryEmailAddress?.emailAddress;

  if (email !== "andryzamora0825@gmail.com") {
    redirect("/dashboard");
  }

  const client = await clerkClient();
  const usersResponse = await client.users.getUserList();
  const allUsers = usersResponse.data;

  const vipCount = allUsers.filter(u => u.publicMetadata.plan === "vip").length;
  const freeCount = allUsers.filter(
    u =>
      u.primaryEmailAddress?.emailAddress !== "andryzamora0825@gmail.com" &&
      u.publicMetadata.plan !== "vip"
  ).length;

  return (
    <main className="min-h-screen bg-[#0A0A0B] p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3 pt-2">
          <div className="relative flex-shrink-0">
            <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl shadow-[0_0_30px_-5px_rgba(99,102,241,0.4)]">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0A0A0B] animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Panel Administrativo</h1>
            <p className="text-gray-500 text-sm mt-0.5">Gestión de Acceso y Funciones VIP</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center sm:items-start gap-3 hover:bg-white/[0.07] transition-colors">
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 flex-shrink-0">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider leading-tight">Total</p>
              <p className="text-2xl font-bold text-white">{allUsers.length}</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center sm:items-start gap-3 hover:bg-white/[0.07] transition-colors">
            <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 flex-shrink-0">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider leading-tight">VIP</p>
              <p className="text-2xl font-bold text-white">{vipCount}</p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center sm:items-start gap-3 hover:bg-white/[0.07] transition-colors">
            <div className="p-2.5 bg-gray-500/10 rounded-xl border border-gray-500/20 flex-shrink-0">
              <Eye className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider leading-tight">Free</p>
              <p className="text-2xl font-bold text-white">{freeCount}</p>
            </div>
          </div>
        </div>

        {/* User list header */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-5 py-3.5 border-b border-white/10 flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-300">Todos los usuarios registrados</h2>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tiempo VIP</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Controles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {allUsers.map(user => {
                  const userEmail = user.primaryEmailAddress?.emailAddress || "Sin email";
                  const isVIP = user.publicMetadata.plan === "vip";
                  const isUserAdmin = userEmail === "andryzamora0825@gmail.com";
                  const vipStartDate = user.publicMetadata.vipStartDate as string | undefined;

                  return (
                    <tr key={user.id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.imageUrl ? (
                            <img src={user.imageUrl} className="w-9 h-9 rounded-full object-cover border border-white/10 shadow" alt="avatar" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center">
                              <UserIcon className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-gray-100">{user.fullName || "Sin nombre"}</span>
                            {isUserAdmin && <span className="ml-2 text-xs text-purple-400 font-medium">• Tú</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400 font-mono text-xs">{userEmail}</td>
                      <td className="px-6 py-4">
                        {isUserAdmin ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            <Crown className="w-3 h-3 fill-purple-400" /> SÚPER ADMIN
                          </span>
                        ) : isVIP ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            <Star className="w-3 h-3 fill-amber-400" /> VIP
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-gray-400 border border-white/10">
                            <Eye className="w-3 h-3" /> Free
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isVIP && vipStartDate ? (
                          <VipCountdownCompact vipStartDate={vipStartDate} />
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isUserAdmin && (
                          !isVIP ? (
                            <form action={updateUserPlan.bind(null, user.id, "vip")}>
                              <button type="submit" className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/30 hover:from-amber-500/30 hover:to-yellow-500/30 transition-all">
                                ✦ Dar VIP
                              </button>
                            </form>
                          ) : (
                            <form action={updateUserPlan.bind(null, user.id, "free")}>
                              <button type="submit" className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all">
                                Revocar VIP
                              </button>
                            </form>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile: card list */}
          <div className="md:hidden divide-y divide-white/5">
            {allUsers.map(user => {
              const userEmail = user.primaryEmailAddress?.emailAddress || "Sin email";
              const isVIP = user.publicMetadata.plan === "vip";
              const isUserAdmin = userEmail === "andryzamora0825@gmail.com";
              const vipStartDate = user.publicMetadata.vipStartDate as string | undefined;

              return (
                <div key={user.id} className="p-4 space-y-3">
                  {/* User info row */}
                  <div className="flex items-center gap-3">
                    {user.imageUrl ? (
                      <img src={user.imageUrl} className="w-10 h-10 rounded-full object-cover border border-white/10 shadow flex-shrink-0" alt="avatar" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-100 text-sm">{user.fullName || "Sin nombre"}</span>
                        {isUserAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            <Crown className="w-2.5 h-2.5 fill-purple-400" /> ADMIN
                          </span>
                        ) : isVIP ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            <Star className="w-2.5 h-2.5 fill-amber-400" /> VIP
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/5 text-gray-400 border border-white/10">
                            <Eye className="w-2.5 h-2.5" /> Free
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{userEmail}</p>
                    </div>
                  </div>

                  {/* VIP countdown on mobile */}
                  {isVIP && vipStartDate && (
                    <div className="pl-13">
                      <VipCountdownCompact vipStartDate={vipStartDate} />
                    </div>
                  )}

                  {/* Action button */}
                  {!isUserAdmin && (
                    <div className="flex justify-end">
                      {!isVIP ? (
                        <form action={updateUserPlan.bind(null, user.id, "vip")}>
                          <button type="submit" className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/30 hover:from-amber-500/30 hover:to-yellow-500/30 transition-all">
                            ✦ Dar VIP
                          </button>
                        </form>
                      ) : (
                        <form action={updateUserPlan.bind(null, user.id, "free")}>
                          <button type="submit" className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all">
                            Revocar VIP
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </main>
  );
}

export const dynamic = 'force-dynamic';
