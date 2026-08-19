"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, PartyPopper, Vote, ShieldCheck, Bot } from "lucide-react"
import type { Imprevisto, Jugador } from "@/lib/use-game"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface EventModalProps {
  imprevisto: Imprevisto | null
  jugadores: Jugador[]
  primerJugadorId: number | null
  onResolver: (
    segurosUsados: number[],
    eleccionesProducto: Record<number, string>,
    votoSaltar: Record<number, boolean>,
  ) => void
}

const meta = {
  Positivo: { icono: PartyPopper, color: "text-cash", fondo: "bg-cash/10", badge: "Buena noticia" },
  Negativo: { icono: AlertTriangle, color: "text-debt", fondo: "bg-debt/10", badge: "Imprevisto" },
  Neutral: { icono: Vote, color: "text-savings", fondo: "bg-savings/10", badge: "Evento" },
} as const

export function EventModal({ imprevisto, jugadores, primerJugadorId, onResolver }: EventModalProps) {
  const [segurosSeleccionados, setSegurosSeleccionados] = useState<Set<number>>(new Set())
  const [eleccionesProducto, setEleccionesProducto] = useState<Record<number, string>>({})
  const [votos, setVotos] = useState<Record<number, boolean>>({})

  const esNegAsegurable = imprevisto?.tipo === "Negativo" && imprevisto.asegurable

  // Reset al cambiar imprevisto. De paso, los jugadores-bot ya deciden acá si usan una
  // ficha de seguro (al azar), para no necesitar que un humano toque nada por ellos.
  useEffect(() => {
    const segurosIniciales = new Set<number>()
    if (esNegAsegurable) {
      for (const j of jugadores) {
        if (j.esBot && j.seguros > 0 && j.zona !== 9 && Math.random() < 0.5) {
          segurosIniciales.add(j.id)
        }
      }
    }
    setSegurosSeleccionados(segurosIniciales)
    setEleccionesProducto({})
    setVotos({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imprevisto?.id])

  const abierto = imprevisto !== null
  const m = imprevisto ? meta[imprevisto.tipo] : meta.Neutral
  const Icono = m.icono

  const esRefrigerador = imprevisto?.id === "imp-0"
  const esVotacion = !!imprevisto?.esVotacion
  const hayBots = jugadores.some((j) => j.esBot)

  // Jugadores humanos que pueden usar un seguro (tienen fichas y no están en zona 9).
  // Los bots ya decidieron al azar en el useEffect de arriba, no necesitan tocar nada.
  const puedenUsarSeguro = esNegAsegurable
    ? jugadores.filter((j) => !j.esBot && j.seguros > 0 && j.zona !== 9)
    : []

  const toggleSeguro = (id: number) => {
    setSegurosSeleccionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Un jugador está protegido si está en Zona 9 o usó una ficha de seguro este imprevisto.
  const estaProtegido = (j: Jugador) =>
    esNegAsegurable && (j.zona === 9 || (segurosSeleccionados.has(j.id) && j.seguros > 0))

  // Jugadores que deben elegir qué tarjeta de Producto pierden (Reparar el refrigerador).
  const jugadoresAfectadosProducto = esRefrigerador
    ? jugadores.filter((j) => !estaProtegido(j) && j.compras.some((c) => c.tipo === "Producto"))
    : []
  // En la UI solo se les pide elegir a los humanos; el bot elige al azar en handleResolver.
  const jugadoresQueEligenProducto = jugadoresAfectadosProducto.filter((j) => !j.esBot)

  const handleResolver = () => {
    const eleccionesFinal: Record<number, string> = {}
    for (const j of jugadoresAfectadosProducto) {
      const productos = j.compras.filter((c) => c.tipo === "Producto")
      eleccionesFinal[j.id] =
        eleccionesProducto[j.id] ?? productos[j.esBot ? Math.floor(Math.random() * productos.length) : 0].id
    }
    const votoFinal: Record<number, boolean> = {}
    if (esVotacion) {
      for (const j of jugadores) {
        votoFinal[j.id] = votos[j.id] ?? (j.esBot ? Math.random() < 0.5 : false)
      }
    }
    onResolver(Array.from(segurosSeleccionados), eleccionesFinal, votoFinal)
  }

  return (
    <Dialog open={abierto}>
      <DialogContent showCloseButton={false} className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="items-center text-center">
          <div className={cn("flex size-14 items-center justify-center rounded-full mb-1", m.fondo)}>
            <Icono className={cn("size-7", m.color)} aria-hidden />
          </div>
          <Badge variant="secondary" className="w-fit">
            {m.badge}
          </Badge>
          <DialogTitle className="text-xl text-balance mt-1">{imprevisto?.nombre}</DialogTitle>
          <DialogDescription className="text-pretty text-base">
            {imprevisto?.descripcion}
          </DialogDescription>
        </DialogHeader>

        {hayBots && (esNegAsegurable || esRefrigerador || esVotacion) && (
          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 -mt-2">
            <Bot className="size-3.5 shrink-0" aria-hidden />
            Los jugadores-bot ya decidieron al azar su parte; no hace falta tocar nada por ellos.
          </p>
        )}

        {/* Opciones de seguro */}
        {puedenUsarSeguro.length > 0 && (
          <div className="rounded-xl border border-border/60 p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Estos jugadores pueden usar una ficha de seguro para evitar el imprevisto:
            </p>
            {puedenUsarSeguro.map((j) => {
              const seleccionado = segurosSeleccionados.has(j.id)
              return (
                <button
                  key={j.id}
                  onClick={() => toggleSeguro(j.id)}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition-colors",
                    seleccionado
                      ? "border-primary/60 bg-primary/5 text-primary"
                      : "border-border/60 hover:bg-muted/50",
                  )}
                >
                  <span className="font-medium">{j.nombre}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{j.seguros} seguro(s)</span>
                    <ShieldCheck
                      className={cn("size-4", seleccionado ? "text-primary" : "text-muted-foreground")}
                    />
                  </div>
                </button>
              )
            })}
            {segurosSeleccionados.size > 0 && (
              <p className="text-[11px] text-muted-foreground">
                Los seleccionados evitarán el imprevisto usando 1 ficha.
              </p>
            )}
          </div>
        )}

        {/* Jugadores en zona 9 (protegidos automáticamente) */}
        {esNegAsegurable && jugadores.some((j) => j.zona === 9) && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-2.5 text-xs text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300">
            <ShieldCheck className="size-3.5 inline mr-1" />
            {jugadores.filter((j) => j.zona === 9).map((j) => j.nombre).join(", ")}{" "}
            {jugadores.filter((j) => j.zona === 9).length === 1 ? "está" : "están"} en Seguro y{" "}
            {jugadores.filter((j) => j.zona === 9).length === 1 ? "queda" : "quedan"} protegido(s) automáticamente.
          </div>
        )}

        {/* Elección de tarjeta de Producto a perder (Reparar el refrigerador) */}
        {esRefrigerador && jugadoresQueEligenProducto.length > 0 && (
          <div className="rounded-xl border border-border/60 p-3 space-y-3">
            <p className="text-xs font-medium text-muted-foreground">
              Elige qué tarjeta de Producto pierde cada jugador (se retira del juego para siempre):
            </p>
            {jugadoresQueEligenProducto.map((j) => {
              const productos = j.compras.filter((c) => c.tipo === "Producto")
              const elegido = eleccionesProducto[j.id] ?? productos[0].id
              return (
                <div key={j.id} className="space-y-1.5">
                  <p className="text-xs font-semibold">{j.nombre}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {productos.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setEleccionesProducto((prev) => ({ ...prev, [j.id]: c.id }))}
                        className={cn(
                          "rounded-lg border px-2 py-1 text-[11px] transition-colors",
                          elegido === c.id
                            ? "border-primary/60 bg-primary/5 text-primary"
                            : "border-border/60 hover:bg-muted/50",
                        )}
                      >
                        {c.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Votación de "Elecciones" (solo humanos; los bots votan al azar) */}
        {esVotacion && (
          <div className="rounded-xl border border-border/60 p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Vote className="size-3.5" aria-hidden />
              Votación: ¿saltar el imprevisto del próximo año?
            </p>
            {jugadores.filter((j) => !j.esBot).map((j) => {
              const voto = votos[j.id] ?? false
              return (
                <div key={j.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium flex items-center gap-1.5">
                    {j.nombre}
                    {j.id === primerJugadorId && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0">
                        1er jugador
                      </Badge>
                    )}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={voto ? "default" : "outline"}
                      className="h-6 px-2 text-[11px]"
                      onClick={() => setVotos((v) => ({ ...v, [j.id]: true }))}
                    >
                      Sí
                    </Button>
                    <Button
                      size="sm"
                      variant={!voto ? "default" : "outline"}
                      className="h-6 px-2 text-[11px]"
                      onClick={() => setVotos((v) => ({ ...v, [j.id]: false }))}
                    >
                      No
                    </Button>
                  </div>
                </div>
              )
            })}
            <p className="text-[11px] text-muted-foreground">
              Mayoría simple decide. En caso de empate, decide el voto de quien tiene la ficha de primer jugador.
            </p>
          </div>
        )}

        <Button onClick={handleResolver}>
          Continuar
        </Button>
      </DialogContent>
    </Dialog>
  )
}
