"use client"

import { useState } from "react"
import { Users, TrendingUp, ShoppingBag, Tag } from "lucide-react"
import type { EstadoJuego, Compra } from "@/lib/use-game"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { dinero } from "@/lib/format"

interface MercadoJugadoresProps {
  estado: EstadoJuego
  onVenderProducto: (vendedorId: number, compradorId: number, compraId: string, precio: number) => void
}

// Portafolio de todos los jugadores, siempre visible, para que todos sepan qué
// tarjetas de inversión y de compras tiene cada uno en cartera (necesario para poder
// negociar una venta con conocimiento de causa). La venta en sí (botón "Vender") solo
// se habilita en la Zona 11 de Reorganización, y solo para tarjetas tipo Producto.
export function MercadoJugadores({ estado, onVenderProducto }: MercadoJugadoresProps) {
  const puedeVender = estado.zonaActual === 11
  const [venta, setVenta] = useState<{ vendedorId: number; compra: Compra } | null>(null)
  const [compradorId, setCompradorId] = useState<number | "">("")
  const [precio, setPrecio] = useState("")

  const cerrar = () => {
    setVenta(null)
    setCompradorId("")
    setPrecio("")
  }

  const comprador = venta && compradorId !== "" ? estado.jugadores.find((j) => j.id === compradorId) : null
  const precioNum = Math.max(0, Math.floor(Number(precio) || 0))
  const ventaValida = venta && comprador && precioNum >= 0 && comprador.efectivo >= precioNum

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="size-5 text-primary" aria-hidden />
          Portafolios de todos los jugadores
        </CardTitle>
        {puedeVender && (
          <p className="text-xs text-muted-foreground">
            Zona de Reorganización: puedes vender tus tarjetas de Producto a otro jugador, al precio que acuerden.
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {estado.jugadores.map((jugador) => (
          <div key={jugador.id} className="rounded-lg border border-border/60 p-2.5">
            <p className="text-sm font-semibold mb-1.5">{jugador.nombre}</p>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <TrendingUp className="size-3.5" aria-hidden />
              Inversiones ({jugador.inversiones.length})
            </div>
            {jugador.inversiones.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {jugador.inversiones.map((inv, i) => (
                  <Badge key={`${inv.id}-${i}`} variant="outline" className="text-[10px]">
                    {inv.nombre}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <ShoppingBag className="size-3.5" aria-hidden />
              Compras ({jugador.compras.length})
            </div>
            {jugador.compras.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {jugador.compras.map((c, i) => (
                  <div key={`${c.id}-${i}`} className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[10px]">
                      {c.nombre}
                      {c.tipo !== "Producto" ? ` (${c.tipo})` : ""}
                    </Badge>
                    {puedeVender && c.tipo === "Producto" && (
                      <button
                        type="button"
                        onClick={() => setVenta({ vendedorId: jugador.id, compra: c })}
                        className="flex items-center gap-0.5 rounded border border-border/60 px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted/50"
                        title="Vender esta tarjeta a otro jugador"
                      >
                        <Tag className="size-3" aria-hidden />
                        Vender
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>

      <Dialog open={venta !== null} onOpenChange={(open) => !open && cerrar()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Vender «{venta?.compra.nombre}»</DialogTitle>
            <DialogDescription>
              El comprador empezará a recibir el bienestar de esta tarjeta a partir del próximo año.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Comprador</label>
              <select
                className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
                value={compradorId}
                onChange={(e) => setCompradorId(e.target.value === "" ? "" : Number(e.target.value))}
              >
                <option value="">Elegir jugador…</option>
                {estado.jugadores
                  .filter((j) => j.id !== venta?.vendedorId)
                  .map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.nombre} ({dinero(j.efectivo)} disponibles)
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Precio acordado</label>
              <input
                type="number"
                min={0}
                step={10}
                inputMode="numeric"
                className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm tabular-nums"
                placeholder="$0"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
              />
              {comprador && precioNum > comprador.efectivo && (
                <p className="text-[11px] text-debt mt-1">{comprador.nombre} no tiene suficiente dinero.</p>
              )}
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={cerrar}>
                Cancelar
              </Button>
              <Button
                className="flex-1"
                disabled={!ventaValida}
                onClick={() => {
                  if (!venta || comprador === null || comprador === undefined) return
                  onVenderProducto(venta.vendedorId, comprador.id, venta.compra.id, precioNum)
                  cerrar()
                }}
              >
                Confirmar venta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
