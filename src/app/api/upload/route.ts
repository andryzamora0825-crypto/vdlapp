import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export const maxDuration = 60; // Extiende el límite de tiempo de Vercel de 10s a 60s


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;
    const isVip = user?.publicMetadata?.plan === "vip";
    const isAdmin = email === 'andryzamora0825@gmail.com';

    if (!isVip && !isAdmin) {
      return NextResponse.json({ error: "No tienes plan VIP. Función bloqueada." }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file received." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");
    const mimeType = file.type;

    const result = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analiza el voucher adjunto. Extrae el número de comprobante (comprobante) y el monto transfereido o depositado (monto). Devuelve SOLO un objeto JSON válido con las claves 'comprobante' y 'monto', sin formato markdown extra ni explicaciones.",
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

    const aiContent = result.choices[0]?.message?.content || "{}";
    
    // Parse JSON
    let parsedData = { comprobante: "No encontrado", monto: "No encontrado" };
    try {
      // In case the AI returns markdown like ```json ... ```
      const cleaned = aiContent.replace(/```json/g, "").replace(/```/g, "").trim();
      parsedData = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse JSON from AI response", aiContent);
    }

    const generatedMessage = `*Saludo Cordiales* @~Coop Valles Asesor Yatzaputan\n*Comprobante: ${parsedData.comprobante}\n*Ruc*:    901266603\n*Acreditar A*:  40000214\n*Monto:*. ${parsedData.monto}`;

    const existingVoucher = await prisma.voucher.findFirst({
      where: {
        comprobante: parsedData.comprobante
      }
    });

    let voucherId = existingVoucher?.id || null;
    let warningMsg = null;

    if (existingVoucher && parsedData.comprobante !== "No encontrado") {
      warningMsg = `NOTA: El comprobante N° ${parsedData.comprobante} ya estaba registrado. No se guardará el duplicado.`;
    } else {
      const voucherRecord = await prisma.voucher.create({
        data: {
          comprobante: parsedData.comprobante,
          monto: parsedData.monto,
          userId: userId,
        }
      });
      voucherId = voucherRecord.id;
    }

    return NextResponse.json({
      message: generatedMessage,
      data: parsedData,
      id: voucherId,
      warning: warningMsg
    });
  } catch (error: any) {
    console.error("Error processing voucher:", error);
    return NextResponse.json(
      { error: "Error interno al procesar el voucher." },
      { status: 500 }
    );
  }
}
