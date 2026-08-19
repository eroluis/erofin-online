"use client"

import { Trophy, Check, X, RotateCcw, Medal } from "lucide-react"
import type { NivelCampeon, ResultadoJugador } from "@/lib/use-game"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { dinero, numero } from "@/lib/format"
import { cn } from "@/lib/utils"

interface EndGameModalProps {
  resultados: ResultadoJugador[] | null
  nivelCampeon: NivelCampeon
  onReiniciar: () => void
}

const medallas = ["🥇", "🥈", "🥉"]

export function EndGameModal({ resultados, nivelCampeon, onReiniciar }: EndGameModalProps) {
  const abierto = resultados !== null && resultados.length > 0
  if (!abierto || !resultados) return null

  const ganadores = resultados.filter((r) => r.gano)
  const hayGanadores = ganadores.length > 0
  const campeon = resultados.find((r) => r.campeon)

  return (
    <Dialog open={abierto}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="items-center text-center">
          <div
            className={cn(
              "flex size-16 items-center justify-center rounded-full mb-1",
              hayGanadores ? "bg-wellbeing/20" : "bg-muted",
            )}
          >
            {hayGanadores ? (
              <Trophy className="size-8 text-wellbeing-foreground" aria-hidden />
            ) : (
              <Medal className="size-8 text-muted-foreground" aria-hidden />
            )}
          </div>
          <DialogTitle className="text-2xl">
            {hayGanadores ? "¡Fin del juego!" : "Fin del juego"}
          </DialogTitle>
          <DialogDescription className="text-base text-pretty">
            {hayGanadores
              ? `${ganadores.map((g) => g.nombre).join(" y ")} ${ganadores.length === 1 ? "cumplió" : "cumplieron"} todas las metas${
                  campeon ? ` · Campeón: ${campeon.nombre} 🏆` : ""
                }.`
              : "Nadie cumplió todas las metas esta vez. ¡Inténtenlo de nuevo!"}
          </DialogDescription>
        </DialogHeader>

        {/* Resultados por jugador */}
        <div className="space-y-3">
          {resultados.map((r, pos) => (
            <div
              key={r.id}
              className={cn(
                "rounded-xl border p-3",
                r.campeon ? "border-wellbeing bg-wellbeing/10" : r.gano ? "border-primary/40 bg-primary/5" : "border-border/60",
              )}
            >
              {/* Header jugador */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{medallas[pos] ?? "·"}</span>
                  <span className="font-semibold">{r.nombre}</span>
                  {r.campeon && (
                    <Badge className="text-[10px] gap-1">
                      <Trophy className="size-3" aria-hidden />
                      Campeón
                    </Badge>
                  )}
                  {r.gano && !r.campeon && (
                    <Badge variant="secondary" className="text-[10px]">
                      ¡Ganó!
                    </Badge>
                  )}
                </div>
                <span className="text-sm font-bold tabular-nums text-primary">
                  {numero(r.puntaje)} pts
                </span>
              </div>

              {/* Metas */}
              <div className="grid grid-cols-2 gap-1 mb-2.5">
                {r.metas.map((meta) => (
                  <div key={meta.texto} className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded-full shrink-0",
                        meta.cumplida ? "bg-cash/15 text-cash" : "bg-debt/15 text-debt",
                      )}
                    >
                      {meta.cumplida ? (
                        <Check className="size-2.5" aria-hidden />
                      ) : (
                        <X className="size-2.5" aria-hidden />
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-xs",
                        meta.cumplida ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {meta.texto}
                    </span>
                  </div>
                ))}
              </div>

              {/* Detalle final */}
              <div className="grid grid-cols-4 gap-1 pt-2 border-t border-border/50">
                <DetalleFinal valor={dinero(r.efectivo)} label="Efectivo" color="text-cash" />
                <DetalleFinal valor={numero(r.bienestar)} label="Bienestar" color="text-savings" />
                <DetalleFinal valor={dinero(r.ahorro)} label="Ahorro" color="text-cash" />
                <DetalleFinal
                  valor={String(r.pagares)}
                  label="Pagarés"
                  color={r.pagares > 0 ? "text-debt" : "text-muted-foreground"}
                />
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-1.5">
                {r.inversiones} inversión(es) · {r.compras} compra(s)
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          {nivelCampeon === "avanzado"
            ? "Puntaje = (Bienestar × 2) + Efectivo + Ahorro + (coste productos ÷ 4) + (coste negocios ÷ 4)"
            : "Puntaje = (Bienestar × 2) + Efectivo + Ahorro"}
          {" · Campeón: solo entre quienes cumplieron las 4 metas."}
        </p>

        <Button onClick={onReiniciar} className="gap-2">
          <RotateCcw className="size-4" aria-hidden />
          Jugar de nuevo
        </Button>
      </DialogContent>
    </Dialog>
  )
}

function DetalleFinal({ valor, label, color }: { valor: string; label: string; color: string }) {
  return (
    <div className="text-center">
      <p className={cn("text-xs font-bold tabular-nums leading-none", color)}>{valor}</p>
      <p className="text-[9px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  )
}
