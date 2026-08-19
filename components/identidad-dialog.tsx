"use client"

import { UserRound } from "lucide-react"
import type { Jugador } from "@/lib/use-game"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface IdentidadDialogProps {
  abierto: boolean
  jugadores: Jugador[]
  onElegir: (jugadorId: number) => void
  onOmitir: () => void
  // Si se pasa, el diálogo se puede cerrar sin decidir nada (se usa cuando alguien lo
  // reabre a propósito para cambiar de jugador, no en la primera vez que aparece solo).
  onCerrarSinCambiar?: () => void
}

export function IdentidadDialog({ abierto, jugadores, onElegir, onOmitir, onCerrarSinCambiar }: IdentidadDialogProps) {
  const elegibles = jugadores.filter((j) => !j.esBot)

  return (
    <Dialog open={abierto} onOpenChange={(open) => !open && onCerrarSinCambiar?.()}>
      <DialogContent showCloseButton={!!onCerrarSinCambiar} className="sm:max-w-sm">
        <DialogHeader className="items-center text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary mb-1">
            <UserRound className="size-5" aria-hidden />
          </div>
          <DialogTitle className="text-lg">¿Cuál de estos jugadores eres tú?</DialogTitle>
          <DialogDescription className="text-pretty">
            Es solo para resaltar tu propia tarjeta en este celular — no le saca acceso a nadie ni cambia nada del juego.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {elegibles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">
              Todos los jugadores están en modo bot por ahora.
            </p>
          ) : (
            elegibles.map((j) => (
              <Button
                key={j.id}
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => onElegir(j.id)}
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                  {j.id + 1}
                </span>
                {j.nombre}
              </Button>
            ))
          )}
        </div>

        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onOmitir}>
          Prefiero no elegir
        </Button>
      </DialogContent>
    </Dialog>
  )
}
