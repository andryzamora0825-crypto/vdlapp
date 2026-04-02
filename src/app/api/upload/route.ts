import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export const maxDuration = 60;

export async function POST(request: Request) {
  console.log("[UPLOAD] === Inicio de solicitud ===");

  // ── 1. Auth ──────────────────────────────────────────────────────────────
  let userId: string | null = null;
  try {
    const authResult = await auth();
    userId = authResult.userId;
    console.log("[UPLOAD] Step 1 - Auth OK. userId:", userId ? "presente" : "ausente");
  } catch (authErr: any) {
    console.error("[UPLOAD] Step 1 FAIL - Auth error:", authErr?.message);
    return NextResponse.json({ error: "Error de autenticación." }, { status: 500 });
  }

  if (!userId) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  // ── 2. Check VIP/Admin ────────────────────────────────────────────────────
  try {
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;
    const isVip = user?.publicMetadata?.plan === "vip";
    const isAdmin = email === "andryzamora0825@gmail.com";
    console.log("[UPLOAD] Step 2 - Plan check. isVip:", isVip, "isAdmin:", isAdmin);

    if (!isVip && !isAdmin) {
      return NextResponse.json({ error: "No tienes plan VIP. Función bloqueada." }, { status: 403 });
    }
  } catch (userErr: any) {
    console.error("[UPLOAD] Step 2 FAIL - currentUser error:", userErr?.message);
    return NextResponse.json({ error: "Error al verificar usuario." }, { status: 500 });
  }

  // ── 3. Parse FormData ─────────────────────────────────────────────────────
  let file: File | null = null;
  try {
    const formData = await request.formData();
    file = formData.get("file") as File;
    console.log("[UPLOAD] Step 3 - FormData OK. file:", file?.name, "size:", file?.size);
  } catch (formErr: any) {
    console.error("[UPLOAD] Step 3 FAIL - FormData error:", formErr?.message);
    return NextResponse.json({ error: "Error al leer el archivo enviado." }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
  }

  // ── 4. OpenAI Vision ──────────────────────────────────────────────────────
  const apiKey = process.env.OPENAI_API_KEY;
  console.log("[UPLOAD] Step 4 - OPENAI_API_KEY presente:", !!apiKey, "| Primeros 10 chars:", apiKey?.substring(0, 10));

  let parsedData = { comprobante: "No encontrado", monto: "No encontrado" };
  let aiRawResponse = "";

  try {
    const openai = new OpenAI({ apiKey });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";

    console.log("[UPLOAD] Step 4 - Llamando a GPT-4o. mimeType:", mimeType, "base64 length:", base64Image.length);

    const result = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analiza el voucher adjunto. Extrae el número de comprobante (comprobante) y el monto transferido o depositado (monto). Devuelve SOLO un objeto JSON válido con las claves 'comprobante' y 'monto', sin formato markdown ni explicaciones.",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
      temperature: 0.1,
    });

    aiRawResponse = result.choices[0]?.message?.content || "{}";
    console.log("[UPLOAD] Step 4 - Respuesta cruda de OpenAI:", aiRawResponse);

    const cleaned = aiRawResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    const tmp = JSON.parse(cleaned);
    if (tmp.comprobante) parsedData.comprobante = tmp.comprobante;
    if (tmp.monto) parsedData.monto = tmp.monto;
    console.log("[UPLOAD] Step 4 - Datos extraídos:", parsedData);
  } catch (openaiErr: any) {
    console.error("[UPLOAD] Step 4 FAIL - OpenAI error:", openaiErr?.message, "| Status:", openaiErr?.status);
    return NextResponse.json(
      { error: `Error al procesar imagen con IA: ${openaiErr?.message}` },
      { status: 500 }
    );
  }

  // ── 5. Mensaje generado ───────────────────────────────────────────────────
  const generatedMessage = `*Saludos Cordiales* @~Coop Valles Asesor Yatzaputan\n*Comprobante: ${parsedData.comprobante}\n*Ruc*:    901266603\n*Acreditar A*:  40000214\n*Monto:* ${parsedData.monto}`;

  // ── 6. Guardar en DB (no bloquea el resultado) ────────────────────────────
  let voucherId: string | null = null;
  let warningMsg: string | null = null;

  try {
    console.log("[UPLOAD] Step 5 - Verificando duplicado en DB...");
    const existingVoucher = await prisma.voucher.findFirst({
      where: { comprobante: parsedData.comprobante },
    });

    if (existingVoucher && parsedData.comprobante !== "No encontrado") {
      voucherId = existingVoucher.id;
      warningMsg = `NOTA: El comprobante N° ${parsedData.comprobante} ya estaba registrado. No se guardará el duplicado.`;
      console.log("[UPLOAD] Step 5 - Duplicado encontrado:", existingVoucher.id);
    } else {
      const voucherRecord = await prisma.voucher.create({
        data: {
          comprobante: parsedData.comprobante,
          monto: parsedData.monto,
          userId: userId,
        },
      });
      voucherId = voucherRecord.id;
      console.log("[UPLOAD] Step 5 - Voucher guardado en DB:", voucherId);
    }
  } catch (dbErr: any) {
    console.error("[UPLOAD] Step 5 FAIL - DB error:", dbErr?.message);
    // No bloqueamos la respuesta: el resultado de IA igual se retorna
    warningMsg = "⚠️ La IA procesó el voucher pero no se pudo guardar en la base de datos.";
  }

  console.log("[UPLOAD] === Solicitud completada ===");

  return NextResponse.json({
    message: generatedMessage,
    data: parsedData,
    id: voucherId,
    warning: warningMsg,
  });
}
