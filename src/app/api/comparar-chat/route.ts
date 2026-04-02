import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;
    const isVip = user?.publicMetadata?.plan === "vip";
    const isAdmin = email === "andryzamora0825@gmail.com";

    if (!isVip && !isAdmin) {
      return NextResponse.json({ error: "Función exclusiva para usuarios VIP." }, { status: 403 });
    }

    const { comprobantes } = await request.json() as { comprobantes: string[] };

    if (!Array.isArray(comprobantes) || comprobantes.length === 0) {
      return NextResponse.json({ error: "No se encontraron comprobantes en el chat." }, { status: 400 });
    }

    // Fetch all matching records from DB in one query
    const registros = await prisma.voucher.findMany({
      where: { comprobante: { in: comprobantes } },
      select: { comprobante: true, createdAt: true, monto: true },
    });

    const registradosMap = new Map(registros.map((r: { comprobante: string; createdAt: Date; monto: string }) => [r.comprobante, r]));

    const resultado = comprobantes.map((c: string) => {
      const reg = registradosMap.get(c);
      return {
        comprobante: c,
        registrado: !!reg,
        fecha: reg?.createdAt ?? null,
        monto: reg?.monto ?? null,
      };
    });

    const faltantes = resultado.filter((r: { registrado: boolean }) => !r.registrado).length;
    const registrados = resultado.filter((r: { registrado: boolean }) => r.registrado).length;

    return NextResponse.json({ resultado, total: comprobantes.length, registrados, faltantes });
  } catch (error: any) {
    console.error("Error en comparar-chat:", error);
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
