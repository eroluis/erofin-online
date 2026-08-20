"use client"

import { useState } from "react"
import {
  Wallet, PiggyBank, FileWarning, HeartPulse, TrendingUp, ShoppingBag,
  ShieldCheck, Bot, Receipt, ChevronDown, ChevronUp, Tag,
} from "lucide-react"
import type { EstadoJuego, Jugador } from "@/lib/use-game"
import { NOMBRE_ZONA, MAX_PAGARES, VALOR_PAGARE } from "@/lib/use-game"
import { dinero, numero } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { BOTON_CREDITO, BOTON_AHORRO } from "@/components/zone-panel"

interface StatDashboardProps {
  estado: EstadoJuego
  jugadorActivoId?: number
  miJugadorId?: number
  onCredito: (jugadorId: number) => void
  onRetirar: (jugadorId: number, monto: number) => void
  onToggleBot: (jugadorId: number) => void
  onPagarPagares: (jugadorId: number, cantidad: number) => void
  onVenderProducto: (vendedorId: number, compradorId: number, compraId: string, precio: number) => void
}

// Input compacto para un monto en dólares (se redondea a múltiplos de $100 al
// confirmar, que es como el juego maneja el ahorro).
function MontoDolares({
  disabled,
  onConfirmar,
  label,
  colorClass,
}: {
  disabled: boolean
  onConfirmar: (monto: number) => void
  label: string
  colorClass: string
}) {
  const [valor, setValor] = useState("")
  const confirmar = () => {
    const monto = Math.floor((Number(valor) || 0) / 100) * 100
    if (monto > 0) {
      onConfirmar(monto)
      setValor("")
    }
  }
  return (
    <div className="flex items-center gap-1 flex-1 min-w-[132px]">
      <input
        type="number"
        min={100}
        step={100}
        inputMode="numeric"
        placeholder="$ (múlt. 100)"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && confirmar()}
        disabled={disabled}
        className="h-6 w-full min-w-0 rounded-md border border-input bg-background px-1.5 text-[10px] tabular-nums disabled:opacity-50"
      />
      <Button
        size="sm"
        variant="outline"
        className={cn("h-6 shrink-0 px-2 text-[10px]", colorClass)}
        disabled={disabled || Math.floor((Number(valor) || 0) / 100) <= 0}
        onClick={confirmar}
      >
        {label}
      </Button>
    </div>
  )
}

function PlayerCard({
  jugador,
  todosJugadores,
  zonaActual,
  activo,
  soyYo,
  mostrarAcciones,
  onCredito,
  onRetirar,
  onToggleBot,
  onPagarPagares,
  onVenderProducto,
}: {
  jugador: Jugador
  todosJugadores: Jugador[]
  zonaActual: number
  activo: boolean
  soyYo: boolean
  mostrarAcciones: boolean
  onCredito: (jugadorId: number) => void
  onRetirar: (jugadorId: number, monto: number) => void
  onToggleBot: (jugadorId: number) => void
  onPagarPagares: (jugadorId: number, cantidad: number) => void
  onVenderProducto: (vendedorId: number, compradorId: number, compraId: string, precio: number) => void
}) {
  const [carteraAbierta, setCarteraAbierta] = useState(false)
  const [venta, setVenta] = useState<{ id: string; nombre: string } | null>(null)
  const [compradorId, setCompradorId] = useState<number | "">("")
  const [precio, setPrecio] = useState("")

  const zonaLabel =
    jugador.zona === null
      ? null
      : jugador.zona === "credito"
      ? "Créditos"
      : NOMBRE_ZONA[jugador.zona as number]

  const enCredito = jugador.zona === "credito"
  const barato = enCredito && !jugador.creditoBaratoUsado
  const pagaresQueDaria = barato ? 5 : 6
  const creditoDisponible = jugador.pagares + pagaresQueDaria <= MAX_PAGARES

  const gastoCompras = jugador.compras.reduce((s, c) => s + c.gastoAnual, 0)
  const gastoTotal = Math.max(0, jugador.hogar.gastos + gastoCompras + jugador.modActivo.gastoDelta)
  const ingresoPasivo = jugador.inversiones.reduce((s, i) => s + i.ingreso, 0)
  const bienestarRec = jugador.compras.reduce((s, c) => s + c.bienestar, 0)

  const puedeVender = zonaActual === 11
  const comprador = compradorId !== "" ? todosJugadores.find((j) => j.id === compradorId) : null
  const precioNum = Math.max(0, Math.floor(Number(precio) || 0))
  const ventaValida = venta && comprador && precioNum >= 0 && comprador.efectivo >= precioNum

  const cerrarVenta = () => {
    setVenta(null)
    setCompradorId("")
    setPrecio("")
  }

  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition-colors",
        activo ? "border-primary/60 bg-primary/5" : "border-border/60 bg-background",
        jugador.esBot && "border-dashed",
        soyYo && "ring-2 ring-savings/50 ring-offset-1 ring-offset-background",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2.5">
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
            activo ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          {jugador.id + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-none truncate flex items-center gap-1.5">
            {jugador.nombre}
            {soyYo && (
              <span className="text-[9px] font-bold uppercase tracking-wide text-primary bg-primary/10 rounded px-1 py-0.5 shrink-0">
                Tú
              </span>
            )}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Hogar #{jugador.hogar.numero}
            {zonaLabel ? ` · ${zonaLabel}` : ""}
            {jugador.sobreEndeudado ? " · ⚠ Sobre-endeudado" : ""}
          </p>
        </div>
        {activo && (
          <span className="text-[10px] font-medium text-primary bg-primary/10 rounded px-1.5 py-0.5 shrink-0">
            Turno
          </span>
        )}
        <button
          type="button"
          onClick={() => onToggleBot(jugador.id)}
          title={jugador.esBot ? "Bot activado (toca para volver a control manual)" : "Activar control por bot"}
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-md border transition-colors",
            jugador.esBot
              ? "border-primary/60 bg-primary/10 text-primary"
              : "border-border/60 text-muted-foreground hover:bg-muted/50",
          )}
        >
          <Bot className="size-3.5" aria-hidden />
        </button>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-4 gap-1.5 mb-2">
        <Stat icono={Wallet} valor={dinero(jugador.efectivo)} label="Dinero" color="text-cash" />
        <Stat icono={HeartPulse} valor={numero(jugador.bienestar)} label="Bienestar" color="text-savings" />
        <Stat icono={PiggyBank} valor={dinero(jugador.ahorro)} label="Ahorro" color="text-cash" />
        <Stat icono={Receipt} valor={dinero(gastoTotal)} label="Gasto/año" color="text-debt" />
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-4 gap-1">
        <Counter icono={TrendingUp} valor={jugador.inversiones.length} label="Inv." />
        <Counter icono={ShoppingBag} valor={jugador.compras.length} label="Comp." />
        <Counter icono={FileWarning} valor={jugador.pagares} label="Pag." warn={jugador.pagares > 0} />
        <Counter icono={ShieldCheck} valor={jugador.seguros} label="Seg." />
      </div>

      {/* Cartera (inversiones y compras), plegable — visible para cualquiera que la abra */}
      <button
        type="button"
        onClick={() => setCarteraAbierta((v) => !v)}
        className="w-full flex items-center justify-between mt-2 pt-2 border-t border-border/50 text-[11px] text-muted-foreground hover:text-foreground"
      >
        <span>
          Cartera · {jugador.inversiones.length} inversión(es), {jugador.compras.length} compra(s)
          {ingresoPasivo > 0 ? ` · +${dinero(ingresoPasivo)}/año` : ""}
        </span>
        {carteraAbierta ? <ChevronUp className="size-3.5" aria-hidden /> : <ChevronDown className="size-3.5" aria-hidden />}
      </button>

      {carteraAbierta && (
        <div className="mt-2 space-y-2">
          <div>
            <p className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <TrendingUp className="size-3" aria-hidden /> Inversiones
            </p>
            {jugador.inversiones.length === 0 ? (
              <p className="text-[10px] text-muted-foreground">Ninguna todavía.</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {jugador.inversiones.map((inv, i) => (
                  <Badge key={`${inv.id}-${i}`} variant="outline" className="text-[10px]">
                    {inv.nombre} +{dinero(inv.ingreso)}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <ShoppingBag className="size-3" aria-hidden /> Compras
              {jugador.compras.length > 0 && bienestarRec > 0 ? ` · +${bienestarRec} bienestar/año` : ""}
            </p>
            {jugador.compras.length === 0 ? (
              <p className="text-[10px] text-muted-foreground">Ninguna todavía.</p>
            ) : (
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
                        onClick={() => setVenta({ id: c.id, nombre: c.nombre })}
                        className="flex items-center gap-0.5 rounded border border-border/60 px-1 py-0.5 text-[9px] text-muted-foreground hover:bg-muted/50"
                        title="Vender esta tarjeta a otro jugador"
                      >
                        <Tag className="size-2.5" aria-hidden />
                        Vender
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Crédito y ahorro: disponibles en cualquier momento (zonas 1 a 10).
          Para jugadores-bot no se muestran: el bot solo actúa en sus zonas de turno, y
          el sistema automático de Zona 8 le pide crédito si le hace falta. */}
      {mostrarAcciones && !jugador.esBot && (
        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-border/50">
          <Button
            size="sm"
            variant="outline"
            className={cn("h-6 flex-1 min-w-fit gap-1 px-2 text-[10px]", BOTON_CREDITO)}
            disabled={!creditoDisponible}
            onClick={() => onCredito(jugador.id)}
            title={creditoDisponible ? undefined : `Superaría el máximo de ${MAX_PAGARES} pagarés`}
          >
            Crédito +${600}
          </Button>
          <MontoDolares
            disabled={jugador.ahorro < 100}
            onConfirmar={(monto) => onRetirar(jugador.id, Math.min(monto, jugador.ahorro))}
            label="Retirar"
            colorClass={BOTON_AHORRO}
          />
          <Button
            size="sm"
            variant="outline"
            className={cn("h-6 flex-1 min-w-fit px-2 text-[10px]", BOTON_CREDITO)}
            disabled={jugador.pagares < 1 || jugador.efectivo < VALOR_PAGARE}
            onClick={() => onPagarPagares(jugador.id, 1)}
            title="Adelanta el pago de un pagaré antes de que llegue la Zona 8 de Gastos"
          >
            Pagar pagaré −${VALOR_PAGARE}
          </Button>
        </div>
      )}

      <Dialog open={venta !== null} onOpenChange={(open) => !open && cerrarVenta()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Vender «{venta?.nombre}»</DialogTitle>
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
                {todosJugadores
                  .filter((j) => j.id !== jugador.id)
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
              <Button variant="outline" className="flex-1" onClick={cerrarVenta}>
                Cancelar
              </Button>
              <Button
                className="flex-1"
                disabled={!ventaValida}
                onClick={() => {
                  if (!venta || !comprador) return
                  onVenderProducto(jugador.id, comprador.id, venta.id, precioNum)
                  cerrarVenta()
                }}
              >
                Confirmar venta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Stat({
  icono: Icono,
  valor,
  label,
  color,
}: {
  icono: React.ElementType
  valor: string
  label: string
  color: string
}) {
  return (
    <div className="rounded-lg bg-muted/50 px-1.5 py-1.5 text-center">
      <p className={cn("text-xs font-bold tabular-nums leading-none", color)}>{valor}</p>
      <p className="text-[9px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  )
}

function Counter({
  icono: Icono,
  valor,
  label,
  warn = false,
}: {
  icono: React.ElementType
  valor: number
  label: string
  warn?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <Icono
        className={cn("size-3.5", warn && valor > 0 ? "text-debt" : "text-muted-foreground")}
        aria-hidden
      />
      <span className={cn("text-xs font-semibold tabular-nums", warn && valor > 0 ? "text-debt" : "")}>
        {valor}
      </span>
      <span className="text-[10px] text-muted-foreground leading-none">{label}</span>
    </div>
  )
}

export function StatDashboard({
  estado,
  jugadorActivoId,
  miJugadorId,
  onCredito,
  onRetirar,
  onToggleBot,
  onPagarPagares,
  onVenderProducto,
}: StatDashboardProps) {
  const mostrarAcciones = estado.fase === "juego" && estado.zonaActual >= 1 && estado.zonaActual <= 10
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground px-0.5">Jugadores</p>
      {estado.jugadores.map((jugador) => (
        <PlayerCard
          key={jugador.id}
          jugador={jugador}
          todosJugadores={estado.jugadores}
          zonaActual={estado.zonaActual}
          activo={jugador.id === jugadorActivoId}
          soyYo={jugador.id === miJugadorId}
          mostrarAcciones={mostrarAcciones}
          onCredito={onCredito}
          onRetirar={onRetirar}
          onToggleBot={onToggleBot}
          onPagarPagares={onPagarPagares}
          onVenderProducto={onVenderProducto}
        />
      ))}
    </div>
  )
}
