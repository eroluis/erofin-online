import { Redis } from "@upstash/redis"
import type { EstadoJuego } from "./game-engine"

// Se conecta usando las variables de entorno que Vercel agrega automáticamente al
// instalar la integración de Redis (Upstash) desde el Marketplace: KV_REST_API_URL y
// KV_REST_API_TOKEN. No hace falta escribir ninguna URL ni token a mano en el código.
const redis = Redis.fromEnv()

// Las salas viejas se borran solas a los 30 días para no ocupar espacio para siempre.
const TTL_SEGUNDOS = 60 * 60 * 24 * 30

function clave(codigo: string) {
  return `sala:${codigo.trim().toUpperCase()}`
}

export async function leerSala(codigo: string): Promise<EstadoJuego | null> {
  const valor = await redis.get<EstadoJuego>(clave(codigo))
  return valor ?? null
}

export async function guardarSala(codigo: string, estado: EstadoJuego): Promise<void> {
  await redis.set(clave(codigo), estado, { ex: TTL_SEGUNDOS })
}
