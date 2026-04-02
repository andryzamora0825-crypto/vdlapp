import DashboardFilters from "@/components/DashboardFilters"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Trash2 } from "lucide-react"

async function deleteVoucher(formData: FormData) {
  "use server"
  const id = formData.get("id") as string
  if (!id) return
  
  try {
    await prisma.voucher.delete({
      where: { id: id }
    })
    revalidatePath("/dashboard")
  } catch(e) {
    console.error("Error deleting voucher:", e)
  }
}

// Function to fetch vouchers safely so it doesn't break if DB is down during local dev
async function getVouchers(dateFilter?: string, filterMode?: string, searchQuery?: string) {
  try {
    let whereClause: any = {};

    const now = new Date();
    
    // 1. Appending Search Query
    if (searchQuery) {
      whereClause.comprobante = {
        contains: searchQuery,
        mode: "insensitive"
      };
    }

    // 2. Appending Date logic (handled separately but uses the same where object)
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

    const vouchers = await prisma.voucher.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 20
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
  
  const vouchers = await getVouchers(dateStr, rawFilter, searchQuery)

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 sm:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Registro de Vouchers</h1>
        </div>

        <DashboardFilters />

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 uppercase text-xs font-semibold text-gray-500 tracking-wider">
                <th className="p-4">Fecha</th>
                <th className="p-4">Comprobante</th>
                <th className="p-4">Monto</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {vouchers && vouchers.length > 0 ? (
                vouchers.map((v: any) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">{new Date(v.createdAt).toLocaleDateString("es-ES")}</td>
                    <td className="p-4 font-mono">{v.comprobante}</td>
                    <td className="p-4 font-medium text-emerald-600">{v.monto}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        Procesado
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <form action={deleteVoucher}>
                        <input type="hidden" name="id" value={v.id} />
                        <button type="submit" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-block" title="Eliminar registro">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : vouchers === null ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-red-500">
                    <p className="font-medium">La base de datos aún no está configurada.</p>
                    <p className="text-xs mt-1">Conecta Supabase o revisa la inicialización de Prisma.</p>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    No hay vouchers registrados en esta fecha.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  )
}
