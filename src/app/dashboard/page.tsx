import DashboardFilters from "@/components/DashboardFilters"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Trash2, FileText } from "lucide-react"
import { auth, currentUser } from "@clerk/nextjs/server"

async function deleteVoucher(formData: FormData) {
  "use server"
  const { userId } = await auth();
  const user = await currentUser();
  const isAdmin = user?.primaryEmailAddress?.emailAddress === "andryzamora0825@gmail.com";

  if (!userId) return;

  const id = formData.get("id") as string
  if (!id) return
  
  try {
    const voucher = await prisma.voucher.findUnique({ where: { id } });
    if (!voucher) return;
    
    if (voucher.userId !== userId && !isAdmin) {
      return;
    }

    await prisma.voucher.delete({
      where: { id: id }
    })
    revalidatePath("/dashboard")
  } catch(e) {
    console.error("Error deleting voucher:", e)
  }
}

async function getVouchers(dateFilter?: string, filterMode?: string, searchQuery?: string, currentUserId?: string | null, isAdmin?: boolean) {
  try {
    let whereClause: any = {};

    const now = new Date();
    
    if (searchQuery) {
      whereClause.comprobante = {
        contains: searchQuery,
        mode: "insensitive"
      };
    }

    let dateFilterClause;
    
    if (dateFilter) {
      const startDate = new Date(dateFilter);
      startDate.setUTCHours(0, 0, 0, 0); 
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      dateFilterClause = {
        gte: startDate,
        lt: endDate,
      }
    } else if (filterMode) {
      if (filterMode === 'hoy') {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        dateFilterClause = { gte: start };
      } else if (filterMode === 'ayer') {
        const start = new Date();
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(start);
        end.setDate(start.getDate() + 1);
        
        dateFilterClause = { gte: start, lt: end };
      } else if (filterMode === '7d') {
        const start = new Date();
        start.setDate(start.getDate() - 7);
        dateFilterClause = { gte: start };
      } else if (filterMode === '30d') {
        const start = new Date();
        start.setDate(start.getDate() - 30);
        dateFilterClause = { gte: start };
      } else if (filterMode === 'mes') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilterClause = { gte: start };
      } else if (filterMode === 'ult-mes') {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilterClause = { gte: start, lt: end };
      }
    }

    if (dateFilterClause) {
      whereClause.createdAt = dateFilterClause;
    }

    if (!isAdmin && currentUserId) {
      whereClause.userId = currentUserId;
    }

    const vouchers = await prisma.voucher.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 10000
    })
    return vouchers
  } catch (e) {
    console.error("Database connection missing:", e)
    return null
  }
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function DashboardPage(props: {
  searchParams: SearchParams
}) {
  const resolveParams = await props.searchParams;
  const rawFilter = typeof resolveParams?.filter === 'string' ? resolveParams.filter : undefined;
  const dateStr = typeof resolveParams?.date === 'string' ? resolveParams.date : undefined;
  const searchQuery = typeof resolveParams?.q === 'string' ? resolveParams.q : undefined;
  
  const { userId } = await auth();
  const user = await currentUser();
  const isAdmin = user?.primaryEmailAddress?.emailAddress === "andryzamora0825@gmail.com";

  const vouchers = await getVouchers(dateStr, rawFilter, searchQuery, userId, isAdmin)

  let totalSum = 0;
  if (vouchers && vouchers.length > 0) {
    totalSum = vouchers.reduce((acc: number, v: any) => {
      const valStr = String(v.monto).replace(/[^\d.-]/g, '');
      const val = parseFloat(valStr);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
  }

  return (
    <main className="min-h-screen bg-[#0A0A0B] p-4 sm:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Registro de Vouchers</h1>
          {vouchers && vouchers.length > 0 && (
            <div className="bg-[#111113] border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between sm:justify-start gap-4 shadow-sm w-full sm:w-auto">
              <span className="text-sm font-medium text-gray-400">Suma del periodo:</span>
              <span className="text-xl font-bold text-emerald-400">${totalSum.toFixed(2)}</span>
            </div>
          )}
        </div>

        <DashboardFilters />

        {/* Mobile: card list | Desktop: table */}
        <div className="bg-[#111113] rounded-xl border border-white/10 shadow-xl overflow-hidden">
          
          {/* Desktop table — hidden on small screens */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Comprobante</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Monto</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {vouchers && vouchers.length > 0 ? (
                  vouchers.map((v: any) => (
                    <tr key={v.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-4 text-gray-300">{new Date(v.createdAt).toLocaleDateString("es-ES")}</td>
                      <td className="p-4 font-mono text-gray-200">{v.comprobante}</td>
                      <td className="p-4 font-medium text-emerald-400">{v.monto}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Procesado
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <form action={deleteVoucher}>
                          <input type="hidden" name="id" value={v.id} />
                          <button type="submit" className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors inline-block" title="Eliminar registro">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                ) : vouchers === null ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-red-400">
                      <p className="font-medium">La base de datos aún no está configurada.</p>
                      <p className="text-xs mt-1 text-gray-500">Conecta Supabase o revisa la inicialización de Prisma.</p>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      No hay vouchers registrados en esta fecha.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile: card list */}
          <div className="sm:hidden divide-y divide-white/5">
            {vouchers && vouchers.length > 0 ? (
              vouchers.map((v: any) => (
                <div key={v.id} className="p-4 flex items-start justify-between gap-3 hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0">
                      <FileText className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-semibold text-gray-100 truncate">{v.comprobante}</p>
                      <p className="text-emerald-400 font-bold text-base mt-0.5">{v.monto}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-gray-500">{new Date(v.createdAt).toLocaleDateString("es-ES")}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Procesado
                        </span>
                      </div>
                    </div>
                  </div>
                  <form action={deleteVoucher} className="flex-shrink-0">
                    <input type="hidden" name="id" value={v.id} />
                    <button type="submit" className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              ))
            ) : vouchers === null ? (
              <div className="p-8 text-center text-red-400">
                <p className="font-medium">Base de datos no configurada.</p>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">
                No hay vouchers registrados.
              </div>
            )}
          </div>

        </div>

      </div>
    </main>
  )
}

export const dynamic = 'force-dynamic';
