"use client"

// Guarda, solo en ESTE dispositivo (nunca en el servidor), qué jugador de la sala es
// "tú". Es puramente de referencia visual — no bloquea ni restringe nada, cualquiera
// puede seguir tocando los botones de cualquier jugador si hiciera falta.
//
// Valores posibles guardados:
//  - ausente / null  → todavía no se le preguntó a esta persona quién es.
//  - "-1"            → eligió "Prefiero no elegir".
//  - "0", "1", "2"…  → el id del jugador que eligió.

const PREFIJO = "financity-identidad-"

export function leerIdentidad(codigo: string): number | null {
  if (typeof window === "undefined") return null
  const v = window.localStorage.getItem(PREFIJO + codigo.trim().toUpperCase())
  if (v === null) return null
  const n = Number(v)
  return Number.isNaN(n) ? null : n
}

export function guardarIdentidad(codigo: string, jugadorId: number) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(PREFIJO + codigo.trim().toUpperCase(), String(jugadorId))
}

export function borrarIdentidad(codigo: string) {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(PREFIJO + codigo.trim().toUpperCase())
}
