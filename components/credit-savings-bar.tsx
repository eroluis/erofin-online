"use client"

import { Banknote } from "lucide-react"
import type { EstadoJuego } from "@/lib/use-game"
import { MAX_PAGARES } from "@/lib/use-game"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { dinero } from "@/lib/format"

interface CreditoAhorroPanelProps {
  estado: EstadoJuego
  onCredito: (jugadorId: number) => void
  onRetirar: (jugadorId: number, monto: number) => void
}

// Panel siempre visible: cualquier jugador puede pedir crédito o retirar ahorro
// en cualquier momento entre Planificación (zona 1) e Imprevistos (zona 10).
// El depósito de ahorro (opuesto al retiro) sigue siendo una acción de turno,
// disponible solo dentro de la Zona 3 — por eso no vive aquí.
export function CreditoAhorroPanel({ estado, onCredito, onRetirar }: CreditoAhorroPanelProps) {
  if (estado.fase !== "juego") return null
  if (estado.zonaActual < 1 || estado.zonaActual > 10) return null

  const enZonaAhorro = estado.zonaActual === 3

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Banknote className="size-5 text-primary" aria-hidden />
          Crédito y ahorro
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Cualquier jugador puede pedir un crédito o retirar ahorro en cualquier momento del año
          {!enZonaAhorro && ", con una multa del 10% al retirar fuera de la Zona 3"}.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {estado.jugadores.map((j) => {
          const enCredito = j.zona === "credito"
          const barato = enCredito && !j.creditoBaratoUsado
          const pagaresQueDaria = barato ? 5 : 6
          const creditoDisponible = j.pagares + pagaresQueDaria <= MAX_PAGARES

          return (
            <div
              key={j.id}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 p-2"
            >
              <span className="text-sm font-medium min-w-24">{j.nombre}</span>
              <Badge variant="secondary" className="text-[10px] font-normal">
                {dinero(j.efectivo)} efectivo
              </Badge>
              <Badge variant="secondary" className="text-[10px] font-normal">
                {dinero(j.ahorro)} ahorro
              </Badge>
              <Badge variant="outline" className="text-[10px] font-normal">
                {j.pagares}/{MAX_PAGARES} pagarés
              </Badge>
              <div className="ml-auto flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 text-xs"
                  disabled={!creditoDisponible}
                  onClick={() => onCredito(j.id)}
                  title={
                    creditoDisponible
                      ? undefined
                      : `Superaría el máximo de ${MAX_PAGARES} pagarés — se rechaza el crédito completo`
                  }
                >
                  Crédito · +$600 (+{pagaresQueDaria} pagarés)
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 text-xs"
                  disabled={j.ahorro < 100}
                  onClick={() => onRetirar(j.id, 100)}
                >
                  Retirar $100{!enZonaAhorro ? " (−10%)" : ""}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 text-xs"
                  disabled={j.ahorro < 500}
                  onClick={() => onRetirar(j.id, 500)}
                >
                  Retirar $500{!enZonaAhorro ? " (−10%)" : ""}
                </Button>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
