import { NextRequest, NextResponse } from "next/server"
import { marcarIdentidadTomada } from "@/lib/sala"

export const dynamic = "force-dynamic"

// POST /api/sala/ABCDE/identidad — marca que un jugador ya fue elegido como identidad
// por algún dispositivo. Es puramente informativo: no impide que otro dispositivo
// elija ese mismo jugador si quiere: solo permite avisarle antes de que lo haga.
export async function POST(req: NextRequest, context: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await context.params
  let jugadorId: number
  try {
    const body = await req.json()
    jugadorId = Number(body.jugadorId)
    if (!Number.isFinite(jugadorId)) throw new Error("jugadorId inválido")
  } catch {
    return NextResponse.json({ error: "jugadorId inválido." }, { status: 400 })
  }

  const identidadesTomadas = await marcarIdentidadTomada(codigo, jugadorId)
  return NextResponse.json({ identidadesTomadas })
}
