"use client"

import { use, useEffect, useState } from "react"
import { Coins, CalendarClock, RotateCcw, WifiOff, Copy, Check, UserRound } from "lucide-react"
import { TOTAL_ANIOS } from "@/lib/use-game"
import { useGameRemoto } from "@/lib/use-game-remoto"
import { leerIdentidad, guardarIdentidad, borrarIdentidad } from "@/lib/identidad"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { StatDashboard } from "@/components/stat-dashboard"
import { ZonePanel } from "@/components/zone-panel"
import { Market } from "@/components/market"
import { ActivityLog } from "@/components/activity-log"
import { EventModal } from "@/components/event-modal"
import { EndGameModal } from "@/components/end-game-modal"
import { RulesDialog } from "@/components/rules-dialog"
import { SetupScreen } from "@/components/setup-screen"
import { IdentidadDialog } from "@/components/identidad-dialog"

export default function SalaPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = use(params)
  const codigoNormalizado = codigo.toUpperCase()
  const {
    estado,
    acciones,
    listo,
    jugadorActivo,
    costeInversionConMod,
    costeCompraConMod,
    conectado,
    identidadesTomadas,
    marcarIdentidad,
  } = useGameRemoto(codigoNormalizado)
  const [copiado, setCopiado] = useState(false)
  const [miIdentidadId, setMiIdentidadId] = useState<number | null>(null)
  const [selectorAbierto, setSelectorAbierto] = useState(false)

  // Se lee una sola vez por sala (cada sala tiene su propia identidad guardada).
  useEffect(() => {
    setMiIdentidadId(leerIdentidad(codigoNormalizado))
  }, [codigoNormalizado])

  // Si la partida se reinicia, los ids de jugador se vuelven a asignar desde cero —
  // hay que olvidar la identidad vieja para no resaltar a la persona equivocada.
  useEffect(() => {
    if (estado.fase === "config" && miIdentidadId !== null) {
      borrarIdentidad(codigoNormalizado)
      setMiIdentidadId(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado.fase, codigoNormalizado])

  const jugadorElegido = miIdentidadId != null && miIdentidadId >= 0 ? estado.jugadores.find((j) => j.id === miIdentidadId) : null
  // Si a quien elegiste lo pasaron a modo bot, dejamos de resaltarlo (no tiene
  // sentido "ser" un jugador que ahora decide solo).
  const miJugadorId = jugadorElegido && !jugadorElegido.esBot ? jugadorElegido.id : undefined

  const elegirIdentidad = (jugadorId: number) => {
    guardarIdentidad(codigoNormalizado, jugadorId)
    setMiIdentidadId(jugadorId)
    setSelectorAbierto(false)
    marcarIdentidad(jugadorId)
  }
  const omitirIdentidad = () => {
    guardarIdentidad(codigoNormalizado, -1)
    setMiIdentidadId(-1)
    setSelectorAbierto(false)
  }

  const hayElegibles = estado.jugadores.some((j) => !j.esBot)
  const promptAutomatico = estado.fase === "juego" && miIdentidadId === null && hayElegibles

  const copiarLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopiado(true)
        setTimeout(() => setCopiado(false), 2000)
      })
    }
  }

  const banderaConexion = !conectado && (
    <div className="sticky top-0 z-40 bg-debt text-white text-center text-xs py-1.5 px-2 flex items-center justify-center gap-1.5">
      <WifiOff className="size-3.5" aria-hidden />
      Sin conexión — reintentando… tus últimas jugadas podrían no haberse guardado.
    </div>
  )

  // Pantalla de configuración inicial (todavía nadie inició la partida en esta sala)
  if (!listo || estado.fase === "config") {
    return (
      <>
        {banderaConexion}
        <div className="border-b border-border/60 bg-muted/30 px-3 py-2 text-center text-xs text-muted-foreground">
          Sala <span className="font-mono font-semibold text-foreground">{codigoNormalizado}</span> — comparte este link
          con quien vaya a jugar contigo.
          <Button variant="ghost" size="sm" className="h-6 ml-1.5 px-1.5" onClick={copiarLink}>
            {copiado ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </Button>
        </div>
        <SetupScreen
          onIniciar={(nombres, nivelCampeon, primerJugadorIndex, botFlags) => {
            acciones.iniciar(nombres, nivelCampeon, primerJugadorIndex, botFlags)
          }}
        />
      </>
    )
  }

  const progreso = (estado.anio / TOTAL_ANIOS) * 100
  const mostrarMercado =
    jugadorActivo !== null &&
    (estado.zonaActual === 1 || ((estado.zonaActual === 6 || estado.zonaActual === 7) && !jugadorActivo.esBot))

  return (
    <div className="min-h-dvh pb-4">
      {banderaConexion}
      {/* ── Cabecera ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Coins className="size-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold leading-none truncate">FinLuis</h1>
                <button onClick={copiarLink} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
                  Sala <span className="font-mono font-semibold">{codigoNormalizado}</span>
                  {copiado ? <Check className="size-3" /> : <Copy className="size-3" />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <RulesDialog />
              <Button variant="ghost" size="sm" onClick={acciones.reiniciar} className="gap-1.5">
                <RotateCcw className="size-4" aria-hidden />
                <span className="hidden sm:inline">Reiniciar</span>
              </Button>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap">
              <CalendarClock className="size-4 text-primary" aria-hidden />
              Año {estado.anio} <span className="text-muted-foreground font-normal">de {TOTAL_ANIOS}</span>
            </div>
            <Progress value={progreso} className="h-2" />
          </div>

          {(miJugadorId !== undefined || hayElegibles) && (
            <button
              onClick={() => setSelectorAbierto(true)}
              className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <UserRound className="size-3.5" aria-hidden />
              {miJugadorId !== undefined ? (
                <>
                  Jugando como <span className="font-medium text-foreground">{jugadorElegido?.nombre}</span> · cambiar
                </>
              ) : (
                "¿Cuál de estos jugadores eres tú?"
              )}
            </button>
          )}
        </div>
      </header>

      {/* ── Contenido principal ─────────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-3 sm:px-4 py-4">
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <StatDashboard
              estado={estado}
              jugadorActivoId={jugadorActivo?.id}
              miJugadorId={miJugadorId}
              onCredito={acciones.credito}
              onRetirar={acciones.retirar}
              onToggleBot={acciones.toggleBot}
              onPagarPagares={acciones.pagarPagares}
              onVenderProducto={acciones.venderProducto}
            />
            <ActivityLog registro={estado.registro} />
          </div>

          <div className="space-y-4 lg:col-span-3">
            <ZonePanel
              estado={estado}
              jugadorActivo={jugadorActivo}
              acciones={{
                colocar: acciones.colocar,
                depositar: acciones.depositar,
                comprarSeguro: acciones.comprarSeguro,
                siguienteJugador: acciones.siguienteJugador,
                avanzarZona: acciones.avanzarZona,
                jugarTurnoBot: acciones.jugarTurnoBot,
              }}
            />

            {mostrarMercado && jugadorActivo && (
              <Market
                estado={estado}
                jugadorActivo={jugadorActivo}
                costeInversion={costeInversionConMod}
                costeCompra={costeCompraConMod}
                onComprarInversion={acciones.comprarInversion}
                onComprarCompra={acciones.comprarCompra}
              />
            )}
          </div>
        </div>
      </main>

      {/* ── Modales ─────────────────────────────────────────────────────── */}
      <EventModal
        imprevisto={estado.imprevistoActual}
        jugadores={estado.jugadores}
        primerJugadorId={estado.jugadores[estado.primerJugador]?.id ?? null}
        onResolver={acciones.resolverImprevisto}
      />
      <EndGameModal resultados={estado.resultados} nivelCampeon={estado.nivelCampeon} onReiniciar={acciones.reiniciar} />
      <IdentidadDialog
        abierto={promptAutomatico || selectorAbierto}
        jugadores={estado.jugadores}
        identidadesTomadas={identidadesTomadas}
        onElegir={elegirIdentidad}
        onOmitir={omitirIdentidad}
        onCerrarSinCambiar={selectorAbierto && !promptAutomatico ? () => setSelectorAbierto(false) : undefined}
      />
    </div>
  )
}
