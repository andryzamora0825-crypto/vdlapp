import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.OPENAI_API_KEY || "";
  return NextResponse.json({
    presente: !!key,
    longitud: key.length,
    primeros20: key.substring(0, 20),
    ultimos5: key.slice(-5),
    tieneEspacios: key.includes(" "),
    tieneNewline: key.includes("\n") || key.includes("\r"),
    tieneComillas: key.includes('"') || key.includes("'"),
  });
}
