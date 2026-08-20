import { NextRequest, NextResponse } from "next/server"
import { reducer, estadoInicialVacio, type Accion } from "@/lib/game-engine"
import { leerSala, guardarSala, leerIdentidadesTomadas, limpiarIdentidadesTomadas } from "@/lib/sala"

export const dynamic = "force-dynamic"

// GET /api/sala/ABCDE — devuelve el estado actual de la sala (o null si no existe
// todavía) y qué jugadores ya fueron elegidos como identidad en algún dispositivo.
export async function GET(_req: NextRequest, context: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await context.params
  const [estado, identidadesTomadas] = await Promise.all([leerSala(codigo), leerIdentidadesTomadas(codigo)])
  return NextResponse.json({ estado, identidadesTomadas })
}

// POST /api/sala/ABCDE — recibe una acción, la aplica sobre el estado guardado (o uno
// nuevo y vacío si la sala todavía no existía), guarda el resultado y lo devuelve.
// Esta es la ÚNICA puerta de entrada para modificar una partida: todos los
// dispositivos mandan sus jugadas acá, nunca calculan el resultado por su cuenta.
export async function POST(req: NextRequest, context: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await context.params
  let accion: Accion
  try {
    const body = await req.json()
    accion = body.accion
    if (!accion || typeof accion.tipo !== "string") throw new Error("acción inválida")
  } catch {
    return NextResponse.json({ error: "Acción inválida." }, { status: 400 })
  }

  const actual = (await leerSala(codigo)) ?? estadoInicialVacio()
  const nuevo = reducer(actual, accion)
  await guardarSala(codigo, nuevo)
  // Si se reinicia la partida, los ids de jugador se van a reasignar desde cero —
  // las identidades elegidas para la partida anterior ya no tienen sentido.
  if (accion.tipo === "REINICIAR") {
    await limpiarIdentidadesTomadas(codigo)
  }
  return NextResponse.json({ estado: nuevo })
}
