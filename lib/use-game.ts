"use client"

import { useReducer, useCallback, useEffect, useState } from "react"
import { estadoInicialVacio, reducer, costeInversionConMod, costeCompraConMod } from "./game-engine"
import type { NivelCampeon, ZonaColocacion } from "./game-engine"

// Re-exporta todo el motor del juego para que los componentes existentes que importan
// desde "@/lib/use-game" sigan funcionando exactamente igual que antes — la separación
// entre este archivo y lib/game-engine.ts es solo para que el servidor (la API de
// sala) también pueda usar el motor, algo que un archivo "use client" no permite.
export * from "./game-engine"

export function useGame() {
  const [estado, dispatch] = useReducer(reducer, undefined, estadoInicialVacio)
  const [listo, setListo] = useState(false)

  useEffect(() => {
    setListo(true)
  }, [])

  const acciones = {
    reiniciar: useCallback(() => dispatch({ tipo: "REINICIAR" }), []),
    iniciar: useCallback(
      (nombres: string[], nivelCampeon: NivelCampeon, primerJugadorIndex: number, botFlags: boolean[]) =>
        dispatch({ tipo: "INICIAR", nombres, nivelCampeon, primerJugadorIndex, botFlags }),
      [],
    ),
    colocar: useCallback((zona: ZonaColocacion) => dispatch({ tipo: "COLOCAR", zona }), []),
    depositar: useCallback((monto: number) => dispatch({ tipo: "DEPOSITAR", monto }), []),
    retirar: useCallback((jugadorId: number, monto: number) => dispatch({ tipo: "RETIRAR", jugadorId, monto }), []),
    credito: useCallback((jugadorId: number) => dispatch({ tipo: "CREDITO", jugadorId }), []),
    pagarPagares: useCallback((jugadorId: number, cantidad: number) => dispatch({ tipo: "PAGAR_PAGARES", jugadorId, cantidad }), []),
    venderProducto: useCallback(
      (vendedorId: number, compradorId: number, compraId: string, precio: number) =>
        dispatch({ tipo: "VENDER_PRODUCTO", vendedorId, compradorId, compraId, precio }),
      [],
    ),
    comprarInversion: useCallback((id: string) => dispatch({ tipo: "COMPRAR_INVERSION", id }), []),
    comprarCompra: useCallback((id: string) => dispatch({ tipo: "COMPRAR_COMPRA", id }), []),
    comprarSeguro: useCallback(() => dispatch({ tipo: "COMPRAR_SEGURO" }), []),
    siguienteJugador: useCallback(() => dispatch({ tipo: "SIGUIENTE_JUGADOR" }), []),
    avanzarZona: useCallback(() => dispatch({ tipo: "AVANZAR_ZONA" }), []),
    toggleBot: useCallback((jugadorId: number) => dispatch({ tipo: "TOGGLE_BOT", jugadorId }), []),
    jugarTurnoBot: useCallback((jugadorId: number) => dispatch({ tipo: "JUGAR_TURNO_BOT", jugadorId }), []),
    resolverImprevisto: useCallback(
      (segurosUsados: number[], eleccionesProducto?: Record<number, string>, votoSaltar?: Record<number, boolean>) =>
        dispatch({ tipo: "RESOLVER_IMPREVISTO", segurosUsados, eleccionesProducto, votoSaltar }),
      [],
    ),
  }

  const jugadorActivo = estado.participantes[estado.indiceActivo] != null ? estado.jugadores[estado.participantes[estado.indiceActivo]] : null

  return { estado, acciones, listo, jugadorActivo, costeInversionConMod, costeCompraConMod }
}
