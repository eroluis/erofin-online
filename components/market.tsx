"use client"

import { TrendingUp, ShoppingBag, Sparkles } from "lucide-react"
import type { EstadoJuego, Jugador, Inversion, Compra, Modificadores } from "@/lib/use-game"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { dinero } from "@/lib/format"
import { BOTON_INVERSION, BOTON_COMPRA } from "@/components/zone-panel"

interface MarketProps {
  estado: EstadoJuego
  jugadorActivo: Jugador
  costeInversion: (inv: Inversion, mod: Modificadores) => number
  costeCompra: (compra: Compra, mod: Modificadores) => number
  onComprarInversion: (id: string) => void
  onComprarCompra: (id: string) => void
}

export function Market({
  estado,
  jugadorActivo,
  costeInversion,
  costeCompra,
  onComprarInversion,
  onComprarCompra,
}: MarketProps) {
  // Si el jugador ya se posicionó en Compras o Inversiones, esa es la pestaña
  // relevante para él. Si no, se usa la zona actual como referencia (Zona 7 → Compras,
  // cualquier otra, incluida la vista previa de Zona 1 → Inversiones).
  const defaultTab =
    jugadorActivo.zona === 7 ? "compras" : jugadorActivo.zona === 6 ? "inversiones" : estado.zonaActual === 7 ? "compras" : "inversiones"
  const esVistaPrevia = estado.zonaActual !== 6 && estado.zonaActual !== 7

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="size-5 text-primary" aria-hidden />
          Mercado de tarjetas
        </CardTitle>
        {esVistaPrevia && (
          <p className="text-xs text-muted-foreground">
            Vista previa de la oferta actual — vas a poder comprar cuando sea tu turno en Inversiones o Compras.
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Tabs key={defaultTab} defaultValue={defaultTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inversiones" className="gap-1.5">
              <TrendingUp className="size-4" aria-hidden />
              Inversiones
            </TabsTrigger>
            <TabsTrigger value="compras" className="gap-1.5">
              <ShoppingBag className="size-4" aria-hidden />
              Compras
            </TabsTrigger>
          </TabsList>

          {/* ── Inversiones ── */}
          <TabsContent value="inversiones" className="mt-3 space-y-2">
            {estado.ofertaInversiones.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No quedan inversiones en la oferta.
              </p>
            ) : (
              estado.ofertaInversiones.map((inv) => {
                const coste = costeInversion(inv, jugadorActivo.modActivo)
                const puede = jugadorActivo.efectivo >= coste
                return (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold truncate">{inv.nombre}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {inv.categoria}
                        </Badge>
                      </div>
                      <p className="text-xs text-cash font-medium mt-0.5">
                        +{dinero(inv.ingreso)} de ingreso anual
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className={BOTON_INVERSION}
                      disabled={!puede || estado.zonaActual !== 6}
                      onClick={() => onComprarInversion(inv.id)}
                    >
                      {dinero(coste)}
                    </Button>
                  </div>
                )
              })
            )}
          </TabsContent>

          {/* ── Compras ── */}
          <TabsContent value="compras" className="mt-3 space-y-2">
            {estado.ofertaCompras.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No quedan compras en la oferta.
              </p>
            ) : (
              estado.ofertaCompras.map((compra) => {
                const coste = costeCompra(compra, jugadorActivo.modActivo)
                const yaHizoDonacion = compra.nombre === "Donación a ONG" && jugadorActivo.donacionUsada
                const puede = jugadorActivo.efectivo >= coste && !yaHizoDonacion
                return (
                  <div
                    key={compra.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/60 p-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold truncate">{compra.nombre}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {compra.tipo}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <span className="text-wellbeing-foreground font-medium">
                          +{compra.bienestar} bienestar
                        </span>
                        {compra.recurrente ? " (recurrente)" : " (única vez)"}
                        {compra.gastoAnual !== 0
                          ? ` · ${compra.gastoAnual > 0 ? "gasto" : "ahorro"} ${dinero(Math.abs(compra.gastoAnual))}/año`
                          : ""}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className={BOTON_COMPRA}
                      disabled={!puede || estado.zonaActual !== 7}
                      onClick={() => onComprarCompra(compra.id)}
                    >
                      {yaHizoDonacion ? "Hecho" : dinero(coste)}
                    </Button>
                  </div>
                )
              })
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
