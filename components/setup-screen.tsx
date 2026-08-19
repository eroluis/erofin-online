"use client"

import { useState } from "react"
import { Coins, Plus, Trash2, Play, Shuffle, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MIN_JUGADORES, MAX_JUGADORES, type NivelCampeon } from "@/lib/use-game"
import { cn } from "@/lib/utils"

export function SetupScreen({
  onIniciar,
}: {
  onIniciar: (nombres: string[], nivelCampeon: NivelCampeon, primerJugadorIndex: number, botFlags: boolean[]) => void
}) {
  const [nombres, setNombres] = useState<string[]>(["", ""])
  const [bots, setBots] = useState<boolean[]>([false, false])
  const [nivelCampeon, setNivelCampeon] = useState<NivelCampeon>("principiante")
  const [primerJugadorIndex, setPrimerJugadorIndex] = useState(0)

  const agregar = () => {
    if (nombres.length < MAX_JUGADORES) {
      setNombres((prev) => [...prev, ""])
      setBots((prev) => [...prev, false])
    }
  }

  const quitar = (i: number) => {
    if (nombres.length > MIN_JUGADORES) {
      setNombres((prev) => prev.filter((_, idx) => idx !== i))
      setBots((prev) => prev.filter((_, idx) => idx !== i))
      setPrimerJugadorIndex((prev) => (prev >= nombres.length - 1 ? 0 : prev))
    }
  }

  const cambiar = (i: number, val: string) => {
    setNombres((prev) => prev.map((n, idx) => (idx === i ? val : n)))
  }

  const toggleBot = (i: number) => {
    setBots((prev) => prev.map((b, idx) => (idx === i ? !b : b)))
  }

  const nombreODefault = (n: string, i: number) => n.trim() || `Jugador ${i + 1}`

  const sortearPrimerJugador = () => {
    setPrimerJugadorIndex(Math.floor(Math.random() * nombres.length))
  }

  const handleIniciar = () => {
    const indiceValido = Math.min(primerJugadorIndex, nombres.length - 1)
    onIniciar(
      nombres.map((n, i) => nombreODefault(n, i)),
      nivelCampeon,
      indiceValido,
      bots,
    )
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-3 bg-gradient-to-br from-background to-primary/5">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="items-center text-center pb-2 pt-4">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-1 shadow">
            <Coins className="size-5" aria-hidden />
          </div>
          <CardTitle className="text-lg leading-tight">FinLuis</CardTitle>
          <p className="text-xs text-muted-foreground">Estrategia financiera · 10 años</p>
        </CardHeader>

        <CardContent className="space-y-2.5 pb-4">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Jugadores ({nombres.length})</p>
            {nombres.map((nombre, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                  {i + 1}
                </span>
                <input
                  className="flex-1 rounded-lg border border-input bg-background px-2.5 py-1 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-shadow"
                  placeholder={`Jugador ${i + 1}`}
                  value={nombre}
                  maxLength={20}
                  onChange={(e) => cambiar(i, e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleIniciar()}
                />
                <button
                  type="button"
                  onClick={() => toggleBot(i)}
                  title={bots[i] ? "Controlado por bot (decide al azar)" : "Controlado manualmente"}
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-lg border transition-colors",
                    bots[i]
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-border/60 text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  <Bot className="size-3.5" aria-hidden />
                </button>
                {nombres.length > MIN_JUGADORES && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => quitar(i)}
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </Button>
                )}
              </div>
            ))}
            <p className="text-[10px] text-muted-foreground leading-snug">
              <Bot className="inline size-3 align-text-bottom mr-0.5" aria-hidden />
              Bot = decide al azar. Se puede cambiar durante la partida.
            </p>
          </div>

          {nombres.length < MAX_JUGADORES && (
            <Button variant="outline" size="sm" className="w-full h-7 gap-1.5 text-xs" onClick={agregar}>
              <Plus className="size-3.5" aria-hidden />
              Agregar jugador
            </Button>
          )}

          {/* Primer jugador: según la regla, empieza el de menor edad (o a quien el grupo elija) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">¿Quién empieza primero?</p>
              <button
                type="button"
                onClick={sortearPrimerJugador}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <Shuffle className="size-3" aria-hidden />
                Sortear
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {nombres.map((nombre, i) => {
                const elegido = Math.min(primerJugadorIndex, nombres.length - 1) === i
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPrimerJugadorIndex(i)}
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                      elegido
                        ? "border-primary/60 bg-primary/10 text-primary font-medium"
                        : "border-border/60 text-muted-foreground hover:bg-muted/50",
                    )}
                  >
                    {nombreODefault(nombre, i)}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Nivel de campeón</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNivelCampeon("principiante")}
                className={cn(
                  "rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors",
                  nivelCampeon === "principiante"
                    ? "border-primary/60 bg-primary/5 text-primary"
                    : "border-border/60 hover:bg-muted/50",
                )}
              >
                <span className="block font-semibold text-xs">Principiante</span>
                <span className="block text-muted-foreground break-words text-[10px] leading-snug">
                  (Bienestar × 2) + Dinero + Ahorro
                </span>
              </button>
              <button
                type="button"
                onClick={() => setNivelCampeon("avanzado")}
                className={cn(
                  "rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors",
                  nivelCampeon === "avanzado"
                    ? "border-primary/60 bg-primary/5 text-primary"
                    : "border-border/60 hover:bg-muted/50",
                )}
              >
                <span className="block font-semibold text-xs">Avanzado</span>
                <span className="block text-muted-foreground break-words text-[10px] leading-snug">
                  + coste de productos y negocios ÷ 4
                </span>
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1.5 text-[10px] text-muted-foreground leading-snug">
            <span className="font-medium text-foreground uppercase tracking-wide mr-1">Metas:</span>
            Bienestar ≥ 300 · Ahorro ≥ $500 · 0 pagarés · ≥1 inversión
          </div>

          <Button className="w-full h-9 gap-2" disabled={nombres.length < MIN_JUGADORES} onClick={handleIniciar}>
            <Play className="size-4" aria-hidden />
            Comenzar partida
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
