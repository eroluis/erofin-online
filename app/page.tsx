"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Coins, Users, DoorOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { generarCodigoSala } from "@/lib/codigo-sala"

export default function InicioPage() {
  const router = useRouter()
  const [codigoIngresado, setCodigoIngresado] = useState("")

  const crearSala = () => {
    const codigo = generarCodigoSala()
    router.push(`/sala/${codigo}`)
  }

  const unirseASala = () => {
    const codigo = codigoIngresado.trim().toUpperCase()
    if (codigo.length > 0) router.push(`/sala/${codigo}`)
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-gradient-to-br from-background to-primary/5">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center space-y-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Coins className="size-6" aria-hidden />
          </div>
          <CardTitle className="text-xl">FinLuis Multijugador</CardTitle>
          <p className="text-sm text-muted-foreground text-pretty">
            Cada jugador entra desde su propio celular o computador, todos conectados a la misma partida.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <Button className="w-full gap-2" size="lg" onClick={crearSala}>
            <Users className="size-4" aria-hidden />
            Crear una partida nueva
          </Button>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            o
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Unirme a una partida existente</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={codigoIngresado}
                onChange={(e) => setCodigoIngresado(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && unirseASala()}
                placeholder="Código de sala"
                maxLength={8}
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm uppercase tracking-widest text-center font-mono"
              />
              <Button variant="outline" onClick={unirseASala} disabled={!codigoIngresado.trim()}>
                <DoorOpen className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
