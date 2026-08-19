"use client"

import { Home, TrendingUp, ShoppingBag, Info } from "lucide-react"
import type { Jugador } from "@/lib/use-game"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { dinero } from "@/lib/format"

function etiquetasMods(mod: Jugador["modActivo"]): string[] {
  const l: string[] = []
  if (mod.gastoDelta < 0) l.push(`Gastos −${dinero(Math.abs(mod.gastoDelta))} este año`)
  if (mod.gastoDelta > 0) l.push(`Gastos +${dinero(mod.gastoDelta)} este año`)
  if (mod.comprasDelta < 0) l.push(`Compras −${dinero(Math.abs(mod.comprasDelta))}`)
  if (mod.inversionDelta > 0) l.push(`Inversiones +${dinero(mod.inversionDelta)}`)
  if (mod.trabajosDelta > 0) l.push(`Trabajos +${dinero(mod.trabajosDelta)}`)
  if (mod.bienestarDelta < 0) l.push(`Bienestar ${mod.bienestarDelta} próx. año`)
  return l
}

export function Portfolio({ jugador }: { jugador: Jugador }) {
  const ingresoPasivo = jugador.inversiones.reduce((s, i) => s + i.ingreso, 0)
  const gastoCompras = jugador.compras.reduce((s, c) => s + c.gastoAnual, 0)
  const bienestarRec = jugador.compras.reduce((s, c) => s + c.bienestar, 0)
  const mods = etiquetasMods(jugador.modActivo)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Home className="size-5 text-primary" aria-hidden />
          Portafolio · {jugador.nombre}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {/* Hogar */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-cash/10 p-2.5">
            <p className="text-xs text-muted-foreground">Ingreso hogar</p>
            <p className="font-bold text-cash tabular-nums">{dinero(jugador.hogar.ingresos)}</p>
          </div>
          <div className="rounded-lg bg-debt/10 p-2.5">
            <p className="text-xs text-muted-foreground">Gasto hogar</p>
            <p className="font-bold text-debt tabular-nums">{dinero(jugador.hogar.gastos)}</p>
          </div>
        </div>

        {/* Modificadores activos */}
        {mods.length > 0 && (
          <div className="rounded-lg border border-dashed border-border p-2.5">
            <div className="flex items-center gap-1.5 mb-1.5 text-xs font-medium text-muted-foreground">
              <Info className="size-3.5" aria-hidden />
              Efectos activos este año
            </div>
            <div className="flex flex-wrap gap-1.5">
              {mods.map((m) => (
                <Badge key={m} variant="secondary" className="text-[10px]">
                  {m}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Inversiones */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 font-semibold">
              <TrendingUp className="size-4 text-cash" aria-hidden />
              Inversiones ({jugador.inversiones.length})
            </span>
            {ingresoPasivo > 0 && (
              <span className="text-xs text-cash font-medium">+{dinero(ingresoPasivo)}/año</span>
            )}
          </div>
          {jugador.inversiones.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Aún no tienes inversiones. ¡Necesitas al menos 1 para ganar!
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {jugador.inversiones.map((inv, i) => (
                <Badge key={`${inv.id}-${i}`} variant="outline" className="text-[11px]">
                  {inv.nombre} +{dinero(inv.ingreso)}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Compras */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 font-semibold">
              <ShoppingBag className="size-4 text-wellbeing-foreground" aria-hidden />
              Compras ({jugador.compras.length})
            </span>
            {jugador.compras.length > 0 && (
              <span className="text-xs text-muted-foreground">
                +{bienestarRec} bien. · {gastoCompras >= 0 ? "−" : "+"}
                {dinero(Math.abs(gastoCompras))}/año
              </span>
            )}
          </div>
          {jugador.compras.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Compra productos y servicios para subir tu bienestar.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {jugador.compras.map((c, i) => (
                <Badge key={`${c.id}-${i}`} variant="outline" className="text-[11px]">
                  {c.nombre}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
