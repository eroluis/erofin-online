"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  estadoInicialVacio,
  costeInversionConMod,
  costeCompraConMod,
  type Accion,
  type EstadoJuego,
  type NivelCampeon,
  type ZonaColocacion,
} from "./use-game"

const INTERVALO_SONDEO_MS = 2000

// Mismo "molde" que useGame() (estado, acciones, listo, jugadorActivo, etc.) para que
// los componentes de la interfaz no tengan que cambiar nada — la única diferencia es
// que acá cada acción se manda por red a /api/sala/[codigo] en vez de aplicarse en la
// memoria del navegador, y hay un sondeo cada 2 segundos para traer las jugadas que
// hicieron los demás jugadores desde sus propios dispositivos.
export function useGameRemoto(codigo: string) {
  const [estado, setEstado] = useState<EstadoJuego>(estadoInicialVacio)
  const [listo, setListo] = useState(false)
  const [conectado, setConectado] = useState(true)
  const enVueloRef = useRef(false)

  const enviar = useCallback(
    async (accion: Accion) => {
      enVueloRef.current = true
      try {
        const res = await fetch(`/api/sala/${codigo}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accion }),
        })
        if (!res.ok) throw new Error("respuesta no ok")
        const data = await res.json()
        if (data.estado) setEstado(data.estado)
        setConectado(true)
      } catch {
        setConectado(false)
      } finally {
        enVueloRef.current = false
      }
    },
    [codigo],
  )

  useEffect(() => {
    let cancelado = false
    const consultar = async () => {
      try {
        const res = await fetch(`/api/sala/${codigo}`, { cache: "no-store" })
        if (!res.ok) throw new Error("respuesta no ok")
        const data = await res.json()
        // Si justo hay una acción en camino, no pisamos el estado con el sondeo para
        // evitar parpadeos; la respuesta de esa acción ya va a actualizar el estado.
        if (!cancelado && data.estado && !enVueloRef.current) {
          setEstado(data.estado)
        }
        if (!cancelado) setConectado(true)
      } catch {
        if (!cancelado) setConectado(false)
      } finally {
        if (!cancelado) setListo(true)
      }
    }
    consultar()
    const id = setInterval(consultar, INTERVALO_SONDEO_MS)
    return () => {
      cancelado = true
      clearInterval(id)
    }
  }, [codigo])

  const acciones = {
    reiniciar: useCallback(() => enviar({ tipo: "REINICIAR" }), [enviar]),
    iniciar: useCallback(
      (nombres: string[], nivelCampeon: NivelCampeon, primerJugadorIndex: number, botFlags: boolean[]) =>
        enviar({ tipo: "INICIAR", nombres, nivelCampeon, primerJugadorIndex, botFlags }),
      [enviar],
    ),
    colocar: useCallback((zona: ZonaColocacion) => enviar({ tipo: "COLOCAR", zona }), [enviar]),
    depositar: useCallback((monto: number) => enviar({ tipo: "DEPOSITAR", monto }), [enviar]),
    retirar: useCallback(
      (jugadorId: number, monto: number) => enviar({ tipo: "RETIRAR", jugadorId, monto }),
      [enviar],
    ),
    credito: useCallback((jugadorId: number) => enviar({ tipo: "CREDITO", jugadorId }), [enviar]),
    pagarPagares: useCallback(
      (jugadorId: number, cantidad: number) => enviar({ tipo: "PAGAR_PAGARES", jugadorId, cantidad }),
      [enviar],
    ),
    venderProducto: useCallback(
      (vendedorId: number, compradorId: number, compraId: string, precio: number) =>
        enviar({ tipo: "VENDER_PRODUCTO", vendedorId, compradorId, compraId, precio }),
      [enviar],
    ),
    comprarInversion: useCallback((id: string) => enviar({ tipo: "COMPRAR_INVERSION", id }), [enviar]),
    comprarCompra: useCallback((id: string) => enviar({ tipo: "COMPRAR_COMPRA", id }), [enviar]),
    comprarSeguro: useCallback(() => enviar({ tipo: "COMPRAR_SEGURO" }), [enviar]),
    siguienteJugador: useCallback(() => enviar({ tipo: "SIGUIENTE_JUGADOR" }), [enviar]),
    avanzarZona: useCallback(() => enviar({ tipo: "AVANZAR_ZONA" }), [enviar]),
    toggleBot: useCallback((jugadorId: number) => enviar({ tipo: "TOGGLE_BOT", jugadorId }), [enviar]),
    jugarTurnoBot: useCallback((jugadorId: number) => enviar({ tipo: "JUGAR_TURNO_BOT", jugadorId }), [enviar]),
    resolverImprevisto: useCallback(
      (segurosUsados: number[], eleccionesProducto?: Record<number, string>, votoSaltar?: Record<number, boolean>) =>
        enviar({ tipo: "RESOLVER_IMPREVISTO", segurosUsados, eleccionesProducto, votoSaltar }),
      [enviar],
    ),
  }

  const jugadorActivo =
    estado.participantes[estado.indiceActivo] != null ? estado.jugadores[estado.participantes[estado.indiceActivo]] : null

  return { estado, acciones, listo, jugadorActivo, costeInversionConMod, costeCompraConMod, conectado }
}
