"use client"

import { useState } from "react"
import {
  Briefcase, Palmtree, TrendingUp, ShoppingBag, ShieldCheck, CreditCard,
  PiggyBank, ChevronRight, MapPin, Info, Bot,
} from "lucide-react"
import type { EstadoJuego, Jugador, ZonaColocacion, Modificadores } from "@/lib/use-game"
import { ZONAS_COLOCACION, NOMBRE_ZONA, esZonaInteractiva } from "@/lib/use-game"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { dinero } from "@/lib/format"
import { cn } from "@/lib/utils"

interface AccionesZona {
  colocar: (zona: ZonaColocacion) => void
  depositar: (monto: number) => void
  comprarSeguro: () => void
  siguienteJugador: () => void
  avanzarZona: () => void
  jugarTurnoBot: (jugadorId: number) => void
}

interface ZonePanelProps {
  estado: EstadoJuego
  jugadorActivo: Jugador | null
  acciones: AccionesZona
}

// ── Zona 1: configuración visual de cada casilla ──────────────────────────────
const ZONA_ICONO: Record<string, React.ElementType> = {
  "4": Briefcase, "5": Palmtree, "6": TrendingUp,
  "7": ShoppingBag, "9": ShieldCheck, credito: CreditCard,
}
const ZONA_TITULO: Record<string, string> = {
  "4": "Trabajos Extra", "5": "Tiempo Libre", "6": "Inversiones",
  "7": "Compras", "9": "Seguro", credito: "Pide créditos",
}
const ZONA_DESC: Record<string, string> = {
  "4": "+$80 cada año",
  "5": "+50 bienestar",
  "6": "Compra 1 inversión",
  "7": "Compra 1 compra",
  "9": "Protección ante imprevistos",
  credito: "$600 · solo 5 pagarés",
}
const ZONA_COLOR: Record<string, string> = {
  "4": "border-green-200 bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:border-green-800",
  "5": "border-cyan-200 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/30 dark:border-cyan-800",
  "6": "border-purple-200 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:border-purple-800",
  "7": "border-orange-200 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/30 dark:border-orange-800",
  "9": "border-indigo-200 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-800",
  credito: "border-red-200 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:border-red-800",
}
// Clases de color por tipo de acción, usadas en los botones de cada zona (coinciden con
// las tarjetas físicas: ahorro=verde, inversión=morado, compras=naranja, crédito=rojo).
export const BOTON_AHORRO = "border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/30"
export const BOTON_INVERSION = "border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-950/30"
export const BOTON_COMPRA = "border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/30"
export const BOTON_CREDITO = "border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
export const BOTON_SEGURO = "border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-950/30"

// ── Progreso de turno ─────────────────────────────────────────────────────────
function TurnoInfo({ activo, total }: { activo: number; total: number }) {
  return (
    <p className="text-xs text-muted-foreground">
      Turno {activo} de {total}
    </p>
  )
}

// ── Monto personalizado para depositar en ahorro (redondea a múltiplos de $100) ──
function MontoDepositar({ disabled, onConfirmar }: { disabled: boolean; onConfirmar: (monto: number) => void }) {
  const [valor, setValor] = useState("")
  const confirmar = () => {
    const monto = Math.floor((Number(valor) || 0) / 100) * 100
    if (monto > 0) {
      onConfirmar(monto)
      setValor("")
    }
  }
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={100}
        step={100}
        inputMode="numeric"
        placeholder="Otro monto (múltiplos de $100)"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && confirmar()}
        disabled={disabled}
        className="flex-1 rounded-md border border-input bg-background px-2.5 py-1 text-xs tabular-nums disabled:opacity-50"
      />
      <Button variant="outline" size="sm" className={BOTON_AHORRO} onClick={confirmar}>
        Ahorrar
      </Button>
    </div>
  )
}

// ── Panel de zona automática ──────────────────────────────────────────────────
function AutoZoneCard({
  nombre,
  resumen,
  onAvanzar,
}: {
  nombre: string
  resumen: string[]
  onAvanzar: () => void
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Info className="size-5 text-primary" aria-hidden />
          {nombre}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-1.5">
          {resumen.map((r, i) =>
            r.startsWith("⚠") ? (
              <li
                key={i}
                className="text-sm font-medium text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-2.5 py-1.5"
              >
                {r}
              </li>
            ) : (
              <li key={i} className="text-sm text-muted-foreground">
                {r}
              </li>
            ),
          )}
        </ul>
        <Button className="gap-1.5" onClick={onAvanzar}>
          Avanzar <ChevronRight className="size-4" aria-hidden />
        </Button>
      </CardContent>
    </Card>
  )
}

// ── Zonas ya elegidas (para zona 1) ──────────────────────────────────────────
function ZonasElegidas({
  estado,
  jugadorActivo,
}: {
  estado: EstadoJuego
  jugadorActivo: Jugador
}) {
  const elegidos = estado.jugadores.filter((j) => j.zona !== null && j.id !== jugadorActivo.id)
  if (elegidos.length === 0) return null
  return (
    <div className="mt-4 pt-3 border-t border-border/60">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-2">
        Ya eligieron
      </p>
      <div className="space-y-1">
        {elegidos.map((j) => {
          const z = String(j.zona)
          return (
            <div key={j.id} className="flex items-center gap-2 text-xs">
              <span className="font-medium">{j.nombre}</span>
              <ChevronRight className="size-3 text-muted-foreground" />
              <span className="text-muted-foreground">{ZONA_TITULO[z] ?? NOMBRE_ZONA[j.zona as number]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export function ZonePanel({ estado, jugadorActivo, acciones }: ZonePanelProps) {
  const zona = estado.zonaActual
  const zonaNombre = NOMBRE_ZONA[zona] ?? `Zona ${zona}`

  // ── Turno de un jugador-bot: un solo botón, decide con las opciones válidas del momento ──
  if (esZonaInteractiva(zona) && jugadorActivo?.esBot) {
    return (
      <Card>
        <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bot className="size-6" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold">{jugadorActivo.nombre} es un bot</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Va a decidir al azar entre las opciones válidas en {zonaNombre}.
            </p>
          </div>
          <Button className="gap-2" onClick={() => acciones.jugarTurnoBot(jugadorActivo.id)}>
            <Bot className="size-4" aria-hidden />
            Jugar turno de {jugadorActivo.nombre}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // ── Zona 1: Colocación ────────────────────────────────────────────────────
  if (zona === 1) {
    if (!jugadorActivo) {
      return (
        <AutoZoneCard
          nombre="Planificación"
          resumen={estado.resumenZona}
          onAvanzar={acciones.avanzarZona}
        />
      )
    }
    const forzado = jugadorActivo.sobreEndeudado
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-2">
            <MapPin className="size-5 text-primary mt-0.5 shrink-0" aria-hidden />
            <div>
              <CardTitle className="text-base">Selecciona tu zona</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                <span className="font-semibold text-foreground">{jugadorActivo.nombre}</span>
                : elige dónde ubicar tu ficha este año
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="rounded-lg bg-cash/10 p-2">
              <p className="text-[10px] text-muted-foreground">Ingreso hogar</p>
              <p className="text-sm font-bold text-cash tabular-nums">{dinero(jugadorActivo.hogar.ingresos)}</p>
            </div>
            <div className="rounded-lg bg-debt/10 p-2">
              <p className="text-[10px] text-muted-foreground">Gasto hogar</p>
              <p className="text-sm font-bold text-debt tabular-nums">{dinero(jugadorActivo.hogar.gastos)}</p>
            </div>
          </div>
          {forzado && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-2.5 text-xs text-destructive mb-3">
              Sobre-endeudado — este año queda obligado a ir a Trabajos Extra.
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ZONAS_COLOCACION.map((z) => {
              const key = String(z)
              const Icono = ZONA_ICONO[key]
              const disabled = forzado && z !== 4
              return (
                <button
                  key={z}
                  disabled={disabled}
                  onClick={() => acciones.colocar(z)}
                  className={cn(
                    "flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-colors cursor-pointer",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                    ZONA_COLOR[key],
                  )}
                >
                  {Icono && <Icono className="size-5" aria-hidden />}
                  <span className="text-sm font-semibold leading-tight">{ZONA_TITULO[key]}</span>
                  <span className="text-[11px] opacity-70">{ZONA_DESC[key]}</span>
                </button>
              )
            })}
          </div>
          <ZonasElegidas estado={estado} jugadorActivo={jugadorActivo} />
        </CardContent>
      </Card>
    )
  }

  // ── Zona 3: Ahorro ────────────────────────────────────────────────────────
  if (zona === 3) {
    if (!jugadorActivo) {
      return (
        <AutoZoneCard
          nombre="Ahorro"
          resumen={["Todos los jugadores completaron su turno de ahorro."]}
          onAvanzar={acciones.avanzarZona}
        />
      )
    }
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PiggyBank className="size-5 text-primary" aria-hidden />
              <CardTitle className="text-base">Banco · Ahorro</CardTitle>
            </div>
            <Badge variant="secondary">{jugadorActivo.nombre}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Efectivo: <span className="font-semibold text-foreground">{dinero(jugadorActivo.efectivo)}</span>
            &nbsp;·&nbsp;Ahorro: <span className="font-semibold text-foreground">{dinero(jugadorActivo.ahorro)}</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {jugadorActivo.sobreEndeudado ? (
            <p className="text-sm text-muted-foreground">
              Los jugadores sobre-endeudados no pueden ahorrar este año.
            </p>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={BOTON_AHORRO}
                  onClick={() => acciones.depositar(100)}
                  disabled={jugadorActivo.efectivo < 100}
                >
                  Ahorrar $100
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={BOTON_AHORRO}
                  onClick={() => acciones.depositar(500)}
                  disabled={jugadorActivo.efectivo < 500}
                >
                  Ahorrar $500
                </Button>
              </div>
              <MontoDepositar
                disabled={jugadorActivo.efectivo < 100}
                onConfirmar={acciones.depositar}
              />
            </div>
          )}
          <p className="text-[11px] text-muted-foreground">
            ¿Necesitas retirar ahorro o pedir un crédito? Cualquier jugador puede
            hacerlo desde el panel de «Crédito y ahorro», en cualquier momento del año.
          </p>
          <div className="flex items-center gap-3">
            <Button className="gap-1.5" onClick={acciones.siguienteJugador}>
              Pasar turno <ChevronRight className="size-4" aria-hidden />
            </Button>
            <TurnoInfo activo={estado.indiceActivo + 1} total={estado.participantes.length} />
          </div>
        </CardContent>
      </Card>
    )
  }

  // ── Zonas 6 y 7: Inversiones / Compras (cartas en <Market />) ─────────────
  if (zona === 6 || zona === 7) {
    const icono = zona === 6 ? TrendingUp : ShoppingBag
    const Icono = icono
    const titulo = zona === 6 ? "Inversiones" : "Compras"
    const detalle =
      zona === 6
        ? "Puedes comprar 1 inversión o pasar. Las tarjetas disponibles aparecen abajo."
        : "Puedes comprar 1 tarjeta o pasar. Las tarjetas disponibles aparecen abajo."

    if (estado.participantes.length === 0) {
      return (
        <AutoZoneCard
          nombre={titulo}
          resumen={[`Ningún jugador se colocó en ${titulo} este año.`]}
          onAvanzar={acciones.siguienteJugador}
        />
      )
    }
    if (!jugadorActivo) {
      return (
        <AutoZoneCard
          nombre={titulo}
          resumen={["Todos los jugadores completaron su turno."]}
          onAvanzar={acciones.avanzarZona}
        />
      )
    }
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Icono className="size-5 text-primary" aria-hidden />
              <CardTitle className="text-base">{titulo}</CardTitle>
            </div>
            <Badge variant="secondary">{jugadorActivo.nombre}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{detalle}</p>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Efectivo: <span className="font-semibold text-foreground">{dinero(jugadorActivo.efectivo)}</span>
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-1.5" onClick={acciones.siguienteJugador}>
              Pasar <ChevronRight className="size-4" aria-hidden />
            </Button>
            <TurnoInfo activo={estado.indiceActivo + 1} total={estado.participantes.length} />
          </div>
        </CardContent>
      </Card>
    )
  }

  // ── Zona 9: Seguro ────────────────────────────────────────────────────────
  if (zona === 9) {
    if (estado.participantes.length === 0) {
      return (
        <AutoZoneCard
          nombre="Seguro"
          resumen={["Ningún jugador se colocó en Seguro este año."]}
          onAvanzar={acciones.siguienteJugador}
        />
      )
    }
    if (!jugadorActivo) {
      return (
        <AutoZoneCard
          nombre="Seguro"
          resumen={["Todos los jugadores completaron su turno."]}
          onAvanzar={acciones.avanzarZona}
        />
      )
    }
    const yaComprado = jugadorActivo.seguroCompradoEsteAnio
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" aria-hidden />
              <CardTitle className="text-base">Seguro</CardTitle>
            </div>
            <Badge variant="secondary">{jugadorActivo.nombre}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Compra una ficha de seguro por $50 para protegerte de imprevistos negativos.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {jugadorActivo.seguros > 0 && (
            <p className="text-xs text-muted-foreground">
              Seguros disponibles: <span className="font-semibold text-foreground">{jugadorActivo.seguros}</span>
            </p>
          )}
          <Button
            variant="outline"
            onClick={acciones.comprarSeguro}
            disabled={yaComprado || jugadorActivo.efectivo < 50}
            className={cn("gap-2", BOTON_SEGURO)}
          >
            <ShieldCheck className="size-4" aria-hidden />
            {yaComprado ? "Seguro ya comprado" : "Comprar seguro · $50"}
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-1.5" onClick={acciones.siguienteJugador}>
              Pasar <ChevronRight className="size-4" aria-hidden />
            </Button>
            <TurnoInfo activo={estado.indiceActivo + 1} total={estado.participantes.length} />
          </div>
        </CardContent>
      </Card>
    )
  }

  // ── Zonas automáticas (2, 4, 5, 8, 10, 11) ───────────────────────────────
  return (
    <AutoZoneCard
      nombre={zonaNombre}
      resumen={estado.resumenZona.length > 0 ? estado.resumenZona : [`Procesando ${zonaNombre}…`]}
      onAvanzar={acciones.avanzarZona}
    />
  )
}
