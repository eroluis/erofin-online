// Toda la lógica pura del juego (tipos, reducer, estado inicial, funciones auxiliares).
// A propósito NO tiene "use client": esto permite que tanto el navegador (a través de
// lib/use-game.ts y lib/use-game-remoto.ts) como el servidor (la API de sala, en
// app/api/sala/[codigo]/route.ts) puedan importar y ejecutar estas mismas funciones.
// Un archivo marcado "use client" no puede ser llamado como función normal desde el
// servidor — solo puede pasarse como prop a un componente — por eso esta separación.

import {
  type Inversion,
  type Compra,
  type Hogar,
  type Imprevisto,
  type Modificadores,
  HOGARES,
  INVERSIONES,
  COMPRAS,
  IMPREVISTOS,
  MODIFICADORES_VACIOS,
  VALOR_PAGARE,
  MAX_PAGARES,
  UMBRAL_SOBRE_ENDEUDADO,
  pagaresMinimosAPagar,
} from "./game-data"

export type { Inversion, Compra, Imprevisto, Modificadores, Hogar } from "./game-data"
export { VALOR_PAGARE, MAX_PAGARES, UMBRAL_SOBRE_ENDEUDADO, pagaresMinimosAPagar } from "./game-data"

export const TOTAL_ANIOS = 10
export const MIN_JUGADORES = 2
export const MAX_JUGADORES = 6

// Zonas donde un jugador puede colocar su ficha de hogar (Zona 1).
export type ZonaColocacion = 4 | 5 | 6 | 7 | 9 | "credito"
export const ZONAS_COLOCACION: ZonaColocacion[] = [4, 5, 6, 7, 9, "credito"]

export const NOMBRE_ZONA: Record<number, string> = {
  1: "Planificación",
  2: "Ingresos",
  3: "Ahorro",
  4: "Trabajos extra",
  5: "Tiempo libre",
  6: "Inversiones",
  7: "Compras",
  8: "Gastos",
  9: "Seguro",
  10: "Imprevistos",
  11: "Organización",
}

export const DESCRIPCION_ZONA_COLOCACION: Record<string, string> = {
  "4": "Trabajos extra · recibes $80 este año.",
  "5": "Tiempo libre · recibes 50 de bienestar este año.",
  "6": "Inversiones · puedes comprar 1 tarjeta de inversión.",
  "7": "Compras · puedes comprar 1 tarjeta de compra.",
  "9": "Seguro · protección ante imprevistos y puedes contratar un seguro.",
  credito: "Créditos · crédito más barato (5 pagarés en vez de 6) todo el año.",
}

// Zonas interactivas (requieren decisión del jugador) vs automáticas.
export function esZonaInteractiva(zona: number): boolean {
  return zona === 1 || zona === 3 || zona === 6 || zona === 7 || zona === 9
}

export interface Jugador {
  id: number
  nombre: string
  hogar: Hogar
  efectivo: number
  ahorro: number
  pagares: number
  bienestar: number
  inversiones: Inversion[]
  compras: Compra[]
  seguros: number
  zona: ZonaColocacion | null
  sobreEndeudado: boolean
  esBot: boolean // controlado por la app (decide al azar entre las opciones válidas)
  // control por año
  creditoBaratoUsado: boolean
  seguroCompradoEsteAnio: boolean
  ahorroUsadoEsteAnio: boolean
  donacionUsada: boolean
  comproEducacionEsteAnio: boolean // para "Becas de formación" (descuento condicional)
  // modificadores provenientes de imprevistos
  modPendiente: Modificadores
  modActivo: Modificadores
}

export interface ResultadoJugador {
  id: number
  nombre: string
  gano: boolean
  campeon: boolean
  puntaje: number
  metas: { texto: string; cumplida: boolean }[]
  // Detalle final del jugador, para mostrar en la pantalla de fin de partida.
  efectivo: number
  ahorro: number
  bienestar: number
  pagares: number
  inversiones: number
  compras: number
}

export type NivelCampeon = "principiante" | "avanzado"

export interface EstadoJuego {
  fase: "config" | "juego" | "terminado"
  anio: number
  zonaActual: number
  jugadores: Jugador[]
  primerJugador: number // índice en jugadores
  ordenTurno: number[] // índices de jugadores en orden de turno
  participantes: number[] // índices que participan en la zona interactiva actual
  indiceActivo: number // posición dentro de participantes
  ofertaInversiones: Inversion[]
  ofertaCompras: Compra[]
  mazoInversiones: Inversion[] // resto del mazo de Inversiones, ya barajado una sola vez al iniciar
  mazoCompras: Compra[] // resto del mazo de Compras, ya barajado una sola vez al iniciar (con instancias duplicadas para las cartas con 2 copias)
  imprevistoActual: Imprevisto | null
  saltarProximoImprevisto: boolean
  imprevistosRevelados: number
  mazoImprevistos: Imprevisto[] // las 10 cartas de la partida, armadas una sola vez al iniciar
  comprasRetiradas: string[] // ids de tarjetas de Producto retiradas del juego para siempre
  nivelCampeon: NivelCampeon
  resumenZona: string[]
  registro: string[]
  resultados: ResultadoJugador[] | null
}

export type Accion =
  | { tipo: "REINICIAR" }
  | { tipo: "INICIAR"; nombres: string[]; nivelCampeon: NivelCampeon; primerJugadorIndex: number; botFlags: boolean[] }
  | { tipo: "COLOCAR"; zona: ZonaColocacion }
  | { tipo: "DEPOSITAR"; monto: number }
  | { tipo: "RETIRAR"; jugadorId: number; monto: number }
  | { tipo: "CREDITO"; jugadorId: number }
  | { tipo: "PAGAR_PAGARES"; jugadorId: number; cantidad: number }
  | { tipo: "COMPRAR_INVERSION"; id: string }
  | { tipo: "COMPRAR_COMPRA"; id: string }
  | { tipo: "COMPRAR_SEGURO" }
  | { tipo: "SIGUIENTE_JUGADOR" }
  | { tipo: "AVANZAR_ZONA" }
  | { tipo: "TOGGLE_BOT"; jugadorId: number }
  | { tipo: "JUGAR_TURNO_BOT"; jugadorId: number }
  | { tipo: "VENDER_PRODUCTO"; vendedorId: number; compradorId: number; compraId: string; precio: number }
  | {
      tipo: "RESOLVER_IMPREVISTO"
      segurosUsados: number[]
      // Solo relevante para "Reparar el refrigerador": qué tarjeta de Producto pierde cada jugador.
      eleccionesProducto?: Record<number, string>
      // Solo relevante para "Elecciones": voto de cada jugador (true = saltar el próximo imprevisto).
      votoSaltar?: Record<number, boolean>
    }

function barajar<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function costeInversionConMod(inv: Inversion, mod: Modificadores): number {
  return Math.max(0, inv.coste + mod.inversionDelta)
}

export function costeCompraConMod(compra: Compra, mod: Modificadores): number {
  return Math.max(0, compra.coste + mod.comprasDelta)
}

// Decide la acción de un jugador-bot para la zona actual, evaluando SOLO las opciones
// válidas en este instante (oferta real, dinero disponible, etc.). Nunca pide crédito ni
// retira ahorro por su cuenta: eso queda para el sistema automático de Zona 8 si le falta
// dinero, igual que a cualquier jugador humano.
function decidirAccionBot(estado: EstadoJuego, jugador: Jugador): Accion | null {
  switch (estado.zonaActual) {
    case 1: {
      const opciones: ZonaColocacion[] = [4, 5, 6, 7, 9, "credito"]
      const elegida = opciones[Math.floor(Math.random() * opciones.length)]
      return { tipo: "COLOCAR", zona: elegida }
    }
    case 3: {
      if (jugador.sobreEndeudado || Math.random() < 0.5) return null
      const maxMultiplos = Math.floor(jugador.efectivo / 100)
      if (maxMultiplos <= 0) return null
      const multiplos = 1 + Math.floor(Math.random() * maxMultiplos)
      return { tipo: "DEPOSITAR", monto: multiplos * 100 }
    }
    case 6: {
      const asequibles = estado.ofertaInversiones.filter(
        (inv) => costeInversionConMod(inv, jugador.modActivo) <= jugador.efectivo,
      )
      if (asequibles.length === 0 || Math.random() < 0.35) return null
      const elegida = asequibles[Math.floor(Math.random() * asequibles.length)]
      return { tipo: "COMPRAR_INVERSION", id: elegida.id }
    }
    case 7: {
      const asequibles = estado.ofertaCompras.filter(
        (c) =>
          costeCompraConMod(c, jugador.modActivo) <= jugador.efectivo &&
          !(c.nombre === "Donación a ONG" && jugador.donacionUsada),
      )
      if (asequibles.length === 0 || Math.random() < 0.35) return null
      const elegida = asequibles[Math.floor(Math.random() * asequibles.length)]
      return { tipo: "COMPRAR_COMPRA", id: elegida.id }
    }
    case 9: {
      if (jugador.seguroCompradoEsteAnio || jugador.efectivo < 50 || Math.random() < 0.5) return null
      return { tipo: "COMPRAR_SEGURO" }
    }
    default:
      return null
  }
}

// ----- Mazos de Inversiones y Compras -----
// Igual que el mazo de Imprevistos, se arman UNA SOLA VEZ al iniciar la partida
// (barajados) y funcionan como una cola: se revela desde el frente, y las cartas que
// no se compran en el año vuelven al FINAL del mazo (no se descartan para siempre).
// Solo las cartas de Compras con 2 copias físicas (ver Excel) pueden volver a aparecer
// una vez ya compradas — cada copia es una instancia independiente con su propio id.

function construirMazoInversiones(): Inversion[] {
  // Ninguna carta de Inversión tiene más de 1 copia física.
  return barajar(INVERSIONES)
}

function construirMazoCompras(): Compra[] {
  const instancias: Compra[] = []
  for (const c of COMPRAS) {
    for (let copia = 1; copia <= c.copias; copia++) {
      instancias.push(c.copias > 1 ? { ...c, id: `${c.id}-${copia}` } : c)
    }
  }
  return barajar(instancias)
}

// Revela las primeras `cantidad` cartas del mazo (o menos, si el mazo tiene menos).
// No se vuelve a barajar: el mazo ya estaba barajado una sola vez al iniciar la partida.
function revelarDelMazo<T>(mazo: T[], cantidad: number): { revelado: T[]; resto: T[] } {
  const n = Math.max(0, Math.min(cantidad, mazo.length))
  return { revelado: mazo.slice(0, n), resto: mazo.slice(n) }
}

function log(estado: EstadoJuego, mensaje: string): string[] {
  return [`Año ${estado.anio} · ${NOMBRE_ZONA[estado.zonaActual] ?? ""} · ${mensaje}`, ...estado.registro].slice(0, 80)
}

// ----- utilidades sobre un jugador -----

function pedirCreditoJugador(j: Jugador): { jugador: Jugador; pagaresNuevos: number } {
  const enCredito = j.zona === "credito"
  const barato = enCredito && !j.creditoBaratoUsado
  const base = barato ? 5 : 6
  // Si el crédito completo (5 o 6 pagarés) no entra dentro del máximo de 24, se
  // rechaza por completo — nunca se entregan $600 a cambio de menos pagarés.
  if (j.pagares + base > MAX_PAGARES) return { jugador: j, pagaresNuevos: 0 }
  return {
    jugador: {
      ...j,
      efectivo: j.efectivo + 600,
      pagares: j.pagares + base,
      creditoBaratoUsado: j.creditoBaratoUsado || barato,
    },
    pagaresNuevos: base,
  }
}

// Cubre un gasto obligatorio usando efectivo, luego ahorro (multa 10%) y luego
// créditos automáticos. Devuelve el jugador y una lista de mensajes.
function cubrirGasto(j: Jugador, monto: number, mensajes: string[]): Jugador {
  if (monto <= 0) return j
  let jug = { ...j }
  if (jug.efectivo >= monto) {
    jug.efectivo -= monto
    return jug
  }
  let faltante = monto - jug.efectivo
  jug.efectivo = 0

  if (jug.ahorro > 0 && faltante > 0) {
    // El ahorro solo existe en tarjetas de $100/$500/$1000: el retiro automático
    // también tiene que ser un múltiplo de $100, igual que el retiro manual.
    const necesario = Math.ceil(faltante / 0.9)
    const retiro = Math.min(jug.ahorro, Math.ceil(necesario / 100) * 100)
    const recibido = Math.floor(retiro * 0.9)
    jug.ahorro -= retiro
    jug.efectivo += recibido
    mensajes.push(`${jug.nombre}: retiro de emergencia de $${retiro} de ahorro (recibe $${recibido}, multa 10%).`)
    if (jug.efectivo >= faltante) {
      jug.efectivo -= faltante
      return jug
    }
    faltante -= jug.efectivo
    jug.efectivo = 0
  }

  while (faltante > 0 && jug.pagares < MAX_PAGARES) {
    const { jugador, pagaresNuevos } = pedirCreditoJugador(jug)
    if (pagaresNuevos === 0) break // no entra un crédito completo: no se puede cubrir más
    jug = jugador
    mensajes.push(`${jug.nombre}: crédito automático (+$600, +${pagaresNuevos} pagarés) para cubrir gastos.`)
    if (jug.efectivo >= faltante) {
      jug.efectivo -= faltante
      faltante = 0
    } else {
      faltante -= jug.efectivo
      jug.efectivo = 0
    }
  }
  return jug
}

// ----- transiciones de zona -----

function nuevoJugador(id: number, nombre: string, hogar: Hogar, esBot: boolean): Jugador {
  return {
    id,
    nombre,
    hogar,
    efectivo: 0,
    ahorro: 0,
    pagares: 0,
    bienestar: 0,
    inversiones: [],
    compras: [],
    seguros: 0,
    zona: null,
    sobreEndeudado: false,
    esBot,
    creditoBaratoUsado: false,
    seguroCompradoEsteAnio: false,
    ahorroUsadoEsteAnio: false,
    donacionUsada: false,
    comproEducacionEsteAnio: false,
    modPendiente: { ...MODIFICADORES_VACIOS },
    modActivo: { ...MODIFICADORES_VACIOS },
  }
}

export function estadoInicialVacio(): EstadoJuego {
  return {
    fase: "config",
    anio: 1,
    zonaActual: 1,
    jugadores: [],
    primerJugador: 0,
    ordenTurno: [],
    participantes: [],
    indiceActivo: 0,
    ofertaInversiones: [],
    ofertaCompras: [],
    mazoInversiones: [],
    mazoCompras: [],
    imprevistoActual: null,
    saltarProximoImprevisto: false,
    imprevistosRevelados: 0,
    mazoImprevistos: [],
    comprasRetiradas: [],
    nivelCampeon: "principiante",
    resumenZona: [],
    registro: [],
    resultados: null,
  }
}

function calcularOrden(primerJugador: number, total: number): number[] {
  return Array.from({ length: total }, (_, k) => (primerJugador + k) % total)
}

function iniciarPartida(
  nombres: string[],
  nivelCampeon: NivelCampeon,
  primerJugadorIndex: number,
  botFlags: boolean[],
): EstadoJuego {
  const hogares = barajar(HOGARES)
  const jugadores = nombres.map((nombre, i) =>
    nuevoJugador(i, nombre.trim() || `Jugador ${i + 1}`, hogares[i % hogares.length], !!botFlags[i]),
  )
  const base = estadoInicialVacio()
  // Según la regla, empieza el jugador de menor edad (o a quien el grupo elija).
  // Se valida el índice recibido por si quedó desincronizado con la cantidad de jugadores.
  const primerJugador =
    Number.isInteger(primerJugadorIndex) && primerJugadorIndex >= 0 && primerJugadorIndex < jugadores.length
      ? primerJugadorIndex
      : 0
  // Se barajan los tres mazos (Imprevistos, Inversiones, Compras) una sola vez al
  // iniciar la partida.
  const barajado = barajar(IMPREVISTOS)
  const mazoImprevistos = barajado.slice(6)
  const { revelado: ofertaInversiones, resto: mazoInversiones } = revelarDelMazo(construirMazoInversiones(), 2)
  const { revelado: ofertaCompras, resto: mazoCompras } = revelarDelMazo(construirMazoCompras(), 2)
  const estado: EstadoJuego = {
    ...base,
    fase: "juego",
    jugadores,
    primerJugador,
    ordenTurno: calcularOrden(primerJugador, jugadores.length),
    ofertaInversiones,
    mazoInversiones,
    ofertaCompras,
    mazoCompras,
    mazoImprevistos,
    nivelCampeon,
    registro: [`Comienza la partida con ${jugadores.length} jugadores. Nivel de campeón: ${nivelCampeon}.`],
  }
  return entrarZona(estado, 1)
}

// Participantes de una zona interactiva, en orden de turno.
function participantesDeZona(estado: EstadoJuego, zona: number): number[] {
  if (zona === 1 || zona === 3) return estado.ordenTurno
  if (zona === 6) return estado.ordenTurno.filter((i) => estado.jugadores[i].zona === 6)
  if (zona === 7) return estado.ordenTurno.filter((i) => estado.jugadores[i].zona === 7)
  if (zona === 9) return estado.ordenTurno.filter((i) => estado.jugadores[i].zona === 9)
  return []
}

// Entra a una zona: aplica efectos automáticos o prepara la interacción.
function entrarZona(estado: EstadoJuego, zona: number): EstadoJuego {
  if (zona > 11) return finDeAnio(estado)

  let e: EstadoJuego = { ...estado, zonaActual: zona, indiceActivo: 0, resumenZona: [] }

  switch (zona) {
    case 1: {
      // Colocación. Los sobre-endeudados quedan forzados a la zona 4.
      e.participantes = e.ordenTurno
      e.resumenZona = ["Cada jugador coloca su ficha de hogar en una zona de beneficio particular."]
      return e
    }
    case 2:
      return zonaIngresos(e)
    case 3:
      e.participantes = participantesDeZona(e, 3)
      e.resumenZona = ["Cada jugador puede depositar o retirar de su ahorro (múltiplos de $100)."]
      return e
    case 4:
      return zonaTrabajos(e)
    case 5:
      return zonaTiempoLibre(e)
    case 6: {
      const enZona = participantesDeZona(e, 6)
      // Confirmado: cartas en oferta = jugadores posicionados en esta zona + 1
      // (con piso de 2, que es la oferta base ya revelada en la Zona 11 del año
      // anterior / al iniciar la partida). Si hace falta más de 2, se revelan
      // cartas adicionales del mazo recién ahora — no se vuelve a barajar nada.
      const cantidad = Math.max(2, enZona.length + 1)
      const faltan = cantidad - e.ofertaInversiones.length
      if (faltan > 0) {
        const { revelado, resto } = revelarDelMazo(e.mazoInversiones, faltan)
        e.ofertaInversiones = [...e.ofertaInversiones, ...revelado]
        e.mazoInversiones = resto
      }
      e.participantes = enZona
      e.resumenZona = [
        enZona.length === 0
          ? "Ningún jugador se colocó en Inversiones."
          : `${enZona.length} jugador(es) en Inversiones · ${e.ofertaInversiones.length} tarjetas en oferta.`,
      ]
      return e
    }
    case 7: {
      const enZona = participantesDeZona(e, 7)
      // Misma fórmula que Inversiones: jugadores en la zona + 1 (piso de 2).
      const cantidad = Math.max(2, enZona.length + 1)
      const faltan = cantidad - e.ofertaCompras.length
      if (faltan > 0) {
        const { revelado, resto } = revelarDelMazo(e.mazoCompras, faltan)
        e.ofertaCompras = [...e.ofertaCompras, ...revelado]
        e.mazoCompras = resto
      }
      e.participantes = enZona
      e.resumenZona = [
        enZona.length === 0
          ? "Ningún jugador se colocó en Compras."
          : `${enZona.length} jugador(es) en Compras · ${e.ofertaCompras.length} tarjetas en oferta.`,
      ]
      return e
    }
    case 8:
      return zonaGastos(e)
    case 9: {
      const enZona = participantesDeZona(e, 9)
      e.participantes = enZona
      e.resumenZona = [
        enZona.length === 0
          ? "Ningún jugador se colocó en Seguro."
          : "Los jugadores en Seguro pueden contratar una ficha de seguro por $50.",
      ]
      return e
    }
    case 10:
      return zonaImprevisto(e)
    case 11:
      return zonaOrganizacion(e)
    default:
      return e
  }
}

function zonaIngresos(estado: EstadoJuego): EstadoJuego {
  const resumen: string[] = []
  const jugadores = estado.jugadores.map((j) => {
    const ingresoInv = j.inversiones.reduce((s, i) => s + i.ingreso, 0)
    // Cada tarjeta de ahorro de $100 reporta $10 de ingreso cada año (Fig. 6 del manual),
    // igual que una tarjeta de inversión — mientras se mantenga ahorrada.
    const ingresoAhorro = Math.floor(j.ahorro / 100) * 10
    // "No clasificamos": se resta por cada tarjeta de compra recurrente que aporte
    // bienestar (cada una es una "fuente" separada), no una sola vez.
    const porFuente = j.modActivo.bienestarPorFuenteDelta
    const bienestarRec = j.compras.reduce(
      (s, c) => (c.bienestar > 0 ? s + Math.max(0, c.bienestar + porFuente) : s + c.bienestar),
      0,
    )
    const ingreso = j.hogar.ingresos + ingresoInv + ingresoAhorro
    const deltaBienestar = bienestarRec + j.modActivo.bienestarDelta
    resumen.push(
      `${j.nombre}: +$${ingreso} (hogar $${j.hogar.ingresos}${ingresoInv ? ` + inversiones $${ingresoInv}` : ""}${
        ingresoAhorro ? ` + ahorro $${ingresoAhorro}` : ""
      })${deltaBienestar ? `, ${deltaBienestar >= 0 ? "+" : ""}${deltaBienestar} bienestar` : ""}.`,
    )
    return {
      ...j,
      efectivo: j.efectivo + ingreso,
      bienestar: Math.max(0, j.bienestar + deltaBienestar),
    }
  })
  return { ...estado, jugadores, resumenZona: resumen }
}

function zonaTrabajos(estado: EstadoJuego): EstadoJuego {
  const resumen: string[] = []
  const jugadores = estado.jugadores.map((j) => {
    if (j.zona !== 4) return j
    const bono = 80 + j.modActivo.trabajosDelta
    resumen.push(`${j.nombre}: +$${bono} por trabajos extra.`)
    return { ...j, efectivo: j.efectivo + bono }
  })
  if (resumen.length === 0) resumen.push("Ningún jugador se colocó en Trabajos extra.")
  return { ...estado, jugadores, resumenZona: resumen }
}

function zonaTiempoLibre(estado: EstadoJuego): EstadoJuego {
  const resumen: string[] = []
  const jugadores = estado.jugadores.map((j) => {
    if (j.zona !== 5) return j
    const bono = Math.max(0, 50 + j.modActivo.bienestarPorFuenteDelta)
    resumen.push(`${j.nombre}: +${bono} bienestar por tiempo libre.`)
    return { ...j, bienestar: j.bienestar + bono }
  })
  if (resumen.length === 0) resumen.push("Ningún jugador se colocó en Tiempo libre.")
  return { ...estado, jugadores, resumenZona: resumen }
}

function zonaGastos(estado: EstadoJuego): EstadoJuego {
  const mensajesLog: string[] = []
  const resumen: string[] = []
  const jugadores = estado.jugadores.map((j) => {
    let jug = { ...j }
    const gastosCompras = jug.compras.reduce((s, c) => s + c.gastoAnual, 0)
    // "Becas de formación": el descuento de $50 solo aplica si el jugador compró una
    // inversión de Educación en la Zona 6 de este mismo año.
    const descuentoBeca = jug.comproEducacionEsteAnio ? jug.modActivo.gastoEducCondicional : 0
    const gastos = Math.max(0, jug.hogar.gastos + gastosCompras + jug.modActivo.gastoDelta + descuentoBeca)
    // 1) Gastos obligatorios.
    const avisosGasto: string[] = []
    jug = cubrirGasto(jug, gastos, avisosGasto)
    // 2) Pagarés mínimos obligatorios.
    const minPagares = pagaresMinimosAPagar(jug.pagares)
    const avisosPagares: string[] = []
    let pagados = 0
    while (pagados < minPagares && jug.pagares > 0) {
      if (jug.efectivo >= VALOR_PAGARE) {
        jug.efectivo -= VALOR_PAGARE
        jug.pagares -= 1
        pagados += 1
      } else if (jug.pagares < UMBRAL_SOBRE_ENDEUDADO) {
        // No está sobre-endeudado: pide crédito para intentar cubrir el mínimo.
        const { jugador, pagaresNuevos } = pedirCreditoJugador(jug)
        if (pagaresNuevos === 0) break
        jug = jugador
        avisosPagares.push(`${jug.nombre}: crédito automático para pagar pagarés (+$600, +${pagaresNuevos} pagarés).`)
      } else {
        // Sobre-endeudado y sin efectivo: paga lo que puede.
        break
      }
    }
    resumen.push(
      `${jug.nombre}: paga $${gastos} de gastos y ${pagados} pagaré(s). Efectivo: $${jug.efectivo}, pagarés: ${jug.pagares}.`,
    )
    // Los avisos de retiro de emergencia de ahorro o crédito forzado se muestran aparte,
    // destacados, para que no pasen desapercibidos (no solo en el historial).
    for (const aviso of [...avisosGasto, ...avisosPagares]) {
      resumen.push(`⚠ ${aviso}`)
    }
    mensajesLog.push(`${jug.nombre}: paga $${gastos} de gastos y ${pagados} pagaré(s).`, ...avisosGasto, ...avisosPagares)
    return jug
  })
  return {
    ...estado,
    jugadores,
    resumenZona: resumen,
    registro: [...mensajesLog.map((m) => `Año ${estado.anio} · Gastos · ${m}`), ...estado.registro].slice(0, 80),
  }
}

function zonaImprevisto(estado: EstadoJuego): EstadoJuego {
  if (estado.saltarProximoImprevisto) {
    // La carta de este año se toma de la pila y se retira sin mirarla ni aplicarla.
    return {
      ...estado,
      saltarProximoImprevisto: false,
      imprevistoActual: null,
      imprevistosRevelados: estado.imprevistosRevelados + 1,
      resumenZona: ["Los jugadores votaron saltear el imprevisto de este año (carta retirada sin mirar)."],
    }
  }
  // El mazo de 10 cartas se armó una sola vez al iniciar la partida; se revela
  // la siguiente en orden, sin volver a barajar ni repetir cartas.
  const idx = estado.imprevistosRevelados
  const imp = estado.mazoImprevistos[idx]
  if (!imp) {
    // No debería pasar (10 años = 10 cartas), pero por las dudas no rompe el juego.
    return { ...estado, imprevistoActual: null, resumenZona: ["No quedan más cartas de imprevistos."] }
  }
  return { ...estado, imprevistoActual: imp, resumenZona: [`Imprevisto revelado: «${imp.nombre}».`] }
}

// Aplica el efecto de un imprevisto a un jugador concreto.
// productoElegidoId: solo relevante para "Reparar el refrigerador" (imp-0) — qué
//   tarjeta de Producto elige perder el jugador (si no se especifica, se toma la primera).
// retiradosOut: acumula los ids de tarjetas de Producto que quedan retiradas del juego.
function aplicarImprevistoAJugador(
  j: Jugador,
  imp: Imprevisto,
  mensajes: string[],
  productoElegidoId: string | undefined,
  retiradosOut: string[],
): Jugador {
  let jug = { ...j, modPendiente: { ...j.modPendiente } }
  switch (imp.id) {
    case "imp-0": {
      // Reparar el refrigerador:
      // 1) Si tiene tarjeta(s) de Producto → pierde la elegida por el jugador
      //    (se retira del juego para siempre, no vuelve a la oferta de Compras).
      // 2) Si no tiene ninguna → pierde 50 de bienestar.
      // 3) Si tampoco tiene bienestar → paga $100.
      const tarjetasProducto = jug.compras.filter((c) => c.tipo === "Producto")
      if (tarjetasProducto.length > 0) {
        const perder = tarjetasProducto.find((c) => c.id === productoElegidoId) ?? tarjetasProducto[0]
        jug.compras = jug.compras.filter((c) => c.id !== perder.id)
        retiradosOut.push(perder.id)
        mensajes.push(`${jug.nombre}: pierde tarjeta de producto «${perder.nombre}» (retirada del juego para siempre).`)
      } else if (jug.bienestar > 0) {
        jug.bienestar = Math.max(0, jug.bienestar - 50)
        mensajes.push(`${jug.nombre}: sin tarjeta de producto, pierde 50 de bienestar.`)
      } else {
        jug = cubrirGasto(jug, 100, mensajes)
        mensajes.push(`${jug.nombre}: sin tarjeta ni bienestar, paga $100.`)
      }
      break
    }
    case "imp-1":
      jug.bienestar += 80
      mensajes.push(`${jug.nombre}: +80 bienestar.`)
      break
    case "imp-2":
      mensajes.push(`${jug.nombre}: pierde $${jug.efectivo} de efectivo.`)
      jug.efectivo = 0
      break
    case "imp-3": {
      const premio = Math.floor(jug.ahorro / 100) * 20
      jug.efectivo += premio
      mensajes.push(`${jug.nombre}: +$${premio} por su ahorro.`)
      break
    }
    case "imp-4":
      // Aumenta la contaminación:
      // Si tiene bienestar → pierde 100 (mínimo 0).
      // Si bienestar = 0 → paga $200 fijos.
      if (jug.bienestar > 0) {
        jug.bienestar = Math.max(0, jug.bienestar - 100)
        mensajes.push(`${jug.nombre}: −100 de bienestar.`)
      } else {
        jug = cubrirGasto(jug, 200, mensajes)
        mensajes.push(`${jug.nombre}: sin bienestar, paga $200.`)
      }
      break
    case "imp-5":
      jug.efectivo += 150
      mensajes.push(`${jug.nombre}: +$150.`)
      break
    case "imp-6":
      // Becas de formación: el descuento solo se hace efectivo si el jugador compra
      // una inversión nueva de Educación en la Zona 6 del año en que rige (ver Zona 8).
      jug.modPendiente.gastoEducCondicional -= 50
      mensajes.push(`${jug.nombre}: si el próximo año compra una inversión de Educación, paga $50 menos de gasto ese año.`)
      break
    case "imp-7": {
      const div = jug.inversiones.length * 50
      jug.efectivo += div
      mensajes.push(`${jug.nombre}: +$${div} por dividendos.`)
      break
    }
    case "imp-8": {
      const edu = jug.inversiones.filter((i) => i.categoria === "Educación").length
      const costo = edu * 60
      jug = cubrirGasto(jug, costo, mensajes)
      mensajes.push(`${jug.nombre}: paga $${costo} por revalidar títulos.`)
      break
    }
    case "imp-9":
      jug.modPendiente.inversionDelta += 60
      mensajes.push(`${jug.nombre}: invertir cuesta $60 más el próximo año.`)
      break
    case "imp-10":
      // No clasificamos: no es un -10 plano, se resta por cada fuente de bienestar
      // (ver Zona 2, Zona 5 y la compra inmediata en Zona 7).
      jug.modPendiente.bienestarPorFuenteDelta -= 10
      mensajes.push(`${jug.nombre}: el próximo año, −10 bienestar por cada fuente de bienestar que reciba.`)
      break
    case "imp-11":
      jug.modPendiente.gastoDelta -= 150
      mensajes.push(`${jug.nombre}: −$150 de gasto el próximo año.`)
      break
    case "imp-12":
      jug = cubrirGasto(jug, 200, mensajes)
      mensajes.push(`${jug.nombre}: paga $200 en reparaciones.`)
      break
    case "imp-13":
      jug.modPendiente.comprasDelta -= 50
      mensajes.push(`${jug.nombre}: compras −$50 el próximo año.`)
      break
    case "imp-14":
      jug.modPendiente.trabajosDelta += 100
      mensajes.push(`${jug.nombre}: trabajos +$100 el próximo año.`)
      break
    case "imp-15":
      // Efecto (saltar el próximo imprevisto) manejado aparte, según la votación.
      break
  }
  return jug
}

function zonaOrganizacion(estado: EstadoJuego): EstadoJuego {
  const resumen: string[] = []
  const jugadores = estado.jugadores.map((j) => {
    const jug = { ...j }
    // ¿Terminó sobre-endeudado?
    const sobre = jug.pagares >= UMBRAL_SOBRE_ENDEUDADO
    if (sobre) resumen.push(`${jug.nombre}: sobre-endeudado (${jug.pagares} pagarés) — el próximo año va a Trabajos extra.`)
    return { ...jug, sobreEndeudado: sobre }
  })
  if (resumen.length === 0) resumen.push("Se recuperan las fichas de hogar y se renuevan las ofertas.")
  // Las cartas de Inversiones/Compras que quedaron en la oferta sin comprar este año
  // no se pierden: van al final de su mazo (pueden volver a salir más adelante). Las
  // que sí se compraron ya salieron de la oferta al momento de comprarlas.
  return {
    ...estado,
    jugadores,
    resumenZona: resumen,
    ofertaInversiones: [],
    mazoInversiones: [...estado.mazoInversiones, ...estado.ofertaInversiones],
    ofertaCompras: [],
    mazoCompras: [...estado.mazoCompras, ...estado.ofertaCompras],
  }
}

// Cierra el año: fin del juego o preparación del próximo año.
function finDeAnio(estado: EstadoJuego): EstadoJuego {
  if (estado.anio >= TOTAL_ANIOS) {
    return { ...estado, fase: "terminado", resultados: evaluarResultados(estado.jugadores, estado.nivelCampeon) }
  }
  const nuevoAnio = estado.anio + 1
  const primerJugador = (estado.primerJugador + 1) % estado.jugadores.length
  const jugadores = estado.jugadores.map((j) => ({
    ...j,
    zona: null,
    creditoBaratoUsado: false,
    seguroCompradoEsteAnio: false,
    ahorroUsadoEsteAnio: false,
    comproEducacionEsteAnio: false,
    // los modificadores pendientes se activan este nuevo año
    modActivo: j.modPendiente,
    modPendiente: { ...MODIFICADORES_VACIOS },
  }))
  // La oferta base del nuevo año (2 cartas) se revela desde el mazo — el mismo mazo
  // que en la Zona 11 ya recibió de vuelta, al final, las cartas que quedaron sin
  // comprar el año anterior.
  const { revelado: ofertaInversiones, resto: mazoInversiones } = revelarDelMazo(estado.mazoInversiones, 2)
  const { revelado: ofertaCompras, resto: mazoCompras } = revelarDelMazo(estado.mazoCompras, 2)
  const e: EstadoJuego = {
    ...estado,
    anio: nuevoAnio,
    jugadores,
    primerJugador,
    ordenTurno: calcularOrden(primerJugador, jugadores.length),
    ofertaInversiones,
    mazoInversiones,
    ofertaCompras,
    mazoCompras,
    registro: [`Año ${nuevoAnio} · Comienza un nuevo año. Primer jugador: ${jugadores[primerJugador].nombre}.`, ...estado.registro].slice(0, 80),
  }
  return entrarZona(e, 1)
}

function evaluarResultados(jugadores: Jugador[], nivelCampeon: NivelCampeon): ResultadoJugador[] {
  const calc = jugadores.map((j) => {
    const metas = [
      { texto: "Bienestar ≥ 300", cumplida: j.bienestar >= 300 },
      { texto: "Ahorro ≥ $500", cumplida: j.ahorro >= 500 },
      { texto: "Sin pagarés", cumplida: j.pagares === 0 },
      { texto: "≥ 1 inversión", cumplida: j.inversiones.length >= 1 },
    ]
    const gano = metas.every((m) => m.cumplida)
    // Nivel avanzado: suma un cuarto del coste de las compras tipo Producto y de las
    // inversiones tipo Negocio que posea el jugador.
    const costoProductos = j.compras.filter((c) => c.tipo === "Producto").reduce((s, c) => s + c.coste, 0)
    const costoNegocios = j.inversiones.filter((i) => i.categoria === "Negocio").reduce((s, i) => s + i.coste, 0)
    const puntajeBase = j.bienestar * 2 + j.efectivo + j.ahorro
    const puntaje =
      nivelCampeon === "avanzado"
        ? puntajeBase + Math.floor(costoProductos / 4) + Math.floor(costoNegocios / 4)
        : puntajeBase
    return {
      id: j.id,
      nombre: j.nombre,
      gano,
      puntaje,
      metas,
      inversiones: j.inversiones.length,
      ahorro: j.ahorro,
      efectivo: j.efectivo,
      bienestar: j.bienestar,
      pagares: j.pagares,
      compras: j.compras.length,
    }
  })

  // Desempate oficial: más tarjetas de inversión y, si persiste, más dinero ahorrado.
  const comparar = (a: (typeof calc)[number], b: (typeof calc)[number]) =>
    b.puntaje - a.puntaje || b.inversiones - a.inversiones || b.ahorro - a.ahorro

  // El campeón sale SOLO de entre quienes cumplieron las 4 metas ("ganadores").
  const campeonId = calc.filter((r) => r.gano).sort(comparar)[0]?.id ?? null

  return calc
    .slice()
    .sort((a, b) => {
      if (a.gano !== b.gano) return a.gano ? -1 : 1
      return comparar(a, b)
    })
    .map((r) => ({
      id: r.id,
      nombre: r.nombre,
      gano: r.gano,
      campeon: r.id === campeonId,
      puntaje: r.puntaje,
      metas: r.metas,
      efectivo: r.efectivo,
      ahorro: r.ahorro,
      bienestar: r.bienestar,
      pagares: r.pagares,
      inversiones: r.inversiones,
      compras: r.compras,
    }))
}

// ----- reducer -----

export function reducer(estado: EstadoJuego, accion: Accion): EstadoJuego {
  switch (accion.tipo) {
    case "REINICIAR":
      return estadoInicialVacio()

    case "INICIAR":
      return iniciarPartida(accion.nombres, accion.nivelCampeon, accion.primerJugadorIndex, accion.botFlags)
  }

  if (estado.fase !== "juego") return estado

  const activoIdx = estado.participantes[estado.indiceActivo]
  const jugadorActivo = activoIdx != null ? estado.jugadores[activoIdx] : null

  const actualizarActivo = (fn: (j: Jugador) => Jugador, mensaje?: string): EstadoJuego => {
    if (activoIdx == null) return estado
    const jugadores = estado.jugadores.map((j, i) => (i === activoIdx ? fn(j) : j))
    return { ...estado, jugadores, registro: mensaje ? log(estado, mensaje) : estado.registro }
  }

  switch (accion.tipo) {
    case "TOGGLE_BOT": {
      // Puede activarse/desactivarse en cualquier momento de la partida.
      const jugadores = estado.jugadores.map((j) => (j.id === accion.jugadorId ? { ...j, esBot: !j.esBot } : j))
      const jugador = jugadores.find((j) => j.id === accion.jugadorId)
      return {
        ...estado,
        jugadores,
        registro: jugador ? log(estado, `${jugador.nombre}: ${jugador.esBot ? "pasa a ser controlado por bot 🤖" : "vuelve a control manual"}.`) : estado.registro,
      }
    }

    case "COLOCAR": {
      if (estado.zonaActual !== 1 || !jugadorActivo) return estado
      const zona = jugadorActivo.sobreEndeudado ? 4 : accion.zona
      const jugadores = estado.jugadores.map((j, i) => (i === activoIdx ? { ...j, zona } : j))
      const etiqueta = zona === "credito" ? "Créditos" : NOMBRE_ZONA[zona as number]
      let e: EstadoJuego = {
        ...estado,
        jugadores,
        registro: log(estado, `${jugadorActivo.nombre} se coloca en ${etiqueta}${jugadorActivo.sobreEndeudado ? " (forzado por sobre-endeudamiento)" : ""}.`),
      }
      // Revelado en tiempo real: apenas se posiciona un 2do (o siguiente) jugador en
      // Inversiones o Compras, se da vuelta de inmediato una tarjeta más del mazo — no
      // hace falta esperar a que se termine de colocar todo el mundo ni a entrar a la zona.
      if (zona === 6 || zona === 7) {
        const enEstaZona = jugadores.filter((j) => j.zona === zona).length
        const necesarias = enEstaZona + 1
        if (zona === 6 && necesarias > e.ofertaInversiones.length) {
          const { revelado, resto } = revelarDelMazo(e.mazoInversiones, necesarias - e.ofertaInversiones.length)
          e = { ...e, ofertaInversiones: [...e.ofertaInversiones, ...revelado], mazoInversiones: resto }
        }
        if (zona === 7 && necesarias > e.ofertaCompras.length) {
          const { revelado, resto } = revelarDelMazo(e.mazoCompras, necesarias - e.ofertaCompras.length)
          e = { ...e, ofertaCompras: [...e.ofertaCompras, ...revelado], mazoCompras: resto }
        }
      }
      // Beneficio inmediato de la zona de créditos: crédito barato disponible.
      if (estado.indiceActivo + 1 >= estado.participantes.length) {
        return entrarZona(e, 2)
      }
      return { ...e, indiceActivo: e.indiceActivo + 1 }
    }

    case "DEPOSITAR": {
      // El depósito ("pedir" una tarjeta de ahorro) solo está disponible en la
      // Zona 3, a diferencia del retiro y el crédito que son en cualquier momento.
      if (estado.zonaActual !== 3 || !jugadorActivo) return estado
      if (jugadorActivo.sobreEndeudado) return estado // no puede ahorrar
      const monto = Math.floor(accion.monto / 100) * 100
      if (monto <= 0 || monto > jugadorActivo.efectivo) return estado
      return actualizarActivo(
        (j) => ({ ...j, efectivo: j.efectivo - monto, ahorro: j.ahorro + monto, ahorroUsadoEsteAnio: true }),
        `${jugadorActivo.nombre} deposita $${monto} en ahorro.`,
      )
    }

    case "RETIRAR": {
      // Disponible para CUALQUIER jugador, en cualquier momento entre Planificación
      // (zona 1) e Imprevistos (zona 10) inclusive.
      if (estado.zonaActual < 1 || estado.zonaActual > 10) return estado
      const idx = estado.jugadores.findIndex((j) => j.id === accion.jugadorId)
      if (idx === -1) return estado
      const jugador = estado.jugadores[idx]
      const monto = Math.floor(accion.monto / 100) * 100
      if (monto <= 0 || monto > jugador.ahorro) return estado
      // En la Zona 3 no hay multa; fuera de ella, 10% menos.
      const conMulta = estado.zonaActual !== 3
      const recibido = conMulta ? Math.floor(monto * 0.9) : monto
      const jugadores = estado.jugadores.map((j, i) =>
        i === idx ? { ...j, ahorro: j.ahorro - monto, efectivo: j.efectivo + recibido } : j,
      )
      return {
        ...estado,
        jugadores,
        registro: log(estado, `${jugador.nombre} retira $${monto} de ahorro${conMulta ? ` (recibe $${recibido}, multa 10%)` : ""}.`),
      }
    }

    case "CREDITO": {
      // Disponible para CUALQUIER jugador, en cualquier momento entre Planificación
      // (zona 1) e Imprevistos (zona 10) inclusive.
      if (estado.zonaActual < 1 || estado.zonaActual > 10) return estado
      const idx = estado.jugadores.findIndex((j) => j.id === accion.jugadorId)
      if (idx === -1) return estado
      const jugador = estado.jugadores[idx]
      // Mientras esté sobre-endeudado, el manual solo permite recibir ingresos y
      // bienestar, retirar ahorros, pagar gastos y pagar pagarés — no pedir más crédito.
      if (jugador.sobreEndeudado) {
        return {
          ...estado,
          registro: log(estado, `${jugador.nombre}: crédito rechazado (sobre-endeudado, debe bajar de 13 pagarés primero).`),
        }
      }
      const enCredito = jugador.zona === "credito"
      const barato = enCredito && !jugador.creditoBaratoUsado
      const pagaresQueDaria = barato ? 5 : 6
      // Si el crédito completo no entra dentro del máximo de 24 pagarés, se rechaza
      // por completo (no se otorgan créditos parciales al pedirlo voluntariamente).
      if (jugador.pagares + pagaresQueDaria > MAX_PAGARES) {
        return {
          ...estado,
          registro: log(estado, `${jugador.nombre}: crédito rechazado (superaría el máximo de ${MAX_PAGARES} pagarés).`),
        }
      }
      const jugadores = estado.jugadores.map((j, i) =>
        i === idx
          ? {
              ...j,
              efectivo: j.efectivo + 600,
              pagares: j.pagares + pagaresQueDaria,
              creditoBaratoUsado: j.creditoBaratoUsado || barato,
            }
          : j,
      )
      return {
        ...estado,
        jugadores,
        registro: log(
          estado,
          `${jugador.nombre} pide un crédito: +$600, +${pagaresQueDaria} pagarés${barato ? " (tarifa de la zona de Crédito)" : ""}.`,
        ),
      }
    }

    case "PAGAR_PAGARES": {
      // "Siempre es posible adelantar el pago de las deudas, prepagando cuantos
      // pagarés quieras y puedas" — disponible en cualquier momento, cualquier jugador.
      if (estado.zonaActual < 1 || estado.zonaActual > 10) return estado
      const idx = estado.jugadores.findIndex((j) => j.id === accion.jugadorId)
      if (idx === -1) return estado
      const jugador = estado.jugadores[idx]
      const cantidad = Math.floor(accion.cantidad)
      if (cantidad <= 0) return estado
      const aPagar = Math.min(cantidad, jugador.pagares, Math.floor(jugador.efectivo / VALOR_PAGARE))
      if (aPagar <= 0) return estado
      const costo = aPagar * VALOR_PAGARE
      const jugadores2 = estado.jugadores.map((j, i) =>
        i === idx ? { ...j, efectivo: j.efectivo - costo, pagares: j.pagares - aPagar } : j,
      )
      return {
        ...estado,
        jugadores: jugadores2,
        registro: log(estado, `${jugador.nombre} adelanta el pago de ${aPagar} pagaré(s) (−$${costo}).`),
      }
    }

    case "COMPRAR_INVERSION": {
      if (estado.zonaActual !== 6 || !jugadorActivo) return estado
      const inv = estado.ofertaInversiones.find((i) => i.id === accion.id)
      if (!inv) return estado
      const coste = costeInversionConMod(inv, jugadorActivo.modActivo)
      if (jugadorActivo.efectivo < coste) return estado
      const jugadores = estado.jugadores.map((j, i) =>
        i === activoIdx
          ? {
              ...j,
              efectivo: j.efectivo - coste,
              inversiones: [...j.inversiones, inv],
              // "Becas de formación": queda marcado para que Zona 8 aplique el descuento condicional.
              comproEducacionEsteAnio: j.comproEducacionEsteAnio || inv.categoria === "Educación",
            }
          : j,
      )
      const eTrasInv: EstadoJuego = {
        ...estado,
        jugadores,
        ofertaInversiones: estado.ofertaInversiones.filter((i) => i.id !== inv.id),
        registro: log(estado, `${jugadorActivo.nombre} invierte en «${inv.nombre}» por ${coste} (+${inv.ingreso}/año).`),
      }
      // Auto-avanzar al siguiente jugador tras comprar (solo 1 inversión por turno).
      if (eTrasInv.indiceActivo + 1 >= eTrasInv.participantes.length) {
        return entrarZona(eTrasInv, eTrasInv.zonaActual + 1)
      }
      return { ...eTrasInv, indiceActivo: eTrasInv.indiceActivo + 1 }
    }

    case "COMPRAR_COMPRA": {
      if (estado.zonaActual !== 7 || !jugadorActivo) return estado
      const compra = estado.ofertaCompras.find((c) => c.id === accion.id)
      if (!compra) return estado
      if (compra.nombre === "Donación a ONG" && jugadorActivo.donacionUsada) return estado
      const coste = costeCompraConMod(compra, jugadorActivo.modActivo)
      if (jugadorActivo.efectivo < coste) return estado
      // "No clasificamos": la compra nueva también cuenta como una "fuente" de bienestar.
      const bienestarGanado =
        compra.bienestar > 0
          ? Math.max(0, compra.bienestar + jugadorActivo.modActivo.bienestarPorFuenteDelta)
          : compra.bienestar
      const jugadores = estado.jugadores.map((j, i) =>
        i === activoIdx
          ? {
              ...j,
              efectivo: j.efectivo - coste,
              bienestar: j.bienestar + bienestarGanado,
              compras: compra.recurrente ? [...j.compras, compra] : j.compras,
              donacionUsada: compra.nombre === "Donación a ONG" ? true : j.donacionUsada,
            }
          : j,
      )
      const eTrasCompra: EstadoJuego = {
        ...estado,
        jugadores,
        ofertaCompras: estado.ofertaCompras.filter((c) => c.id !== compra.id),
        registro: log(estado, `${jugadorActivo.nombre} compra «${compra.nombre}» por ${coste}: +${bienestarGanado} bienestar${compra.recurrente ? " (recurrente)" : ""}.`),
      }
      // Auto-avanzar al siguiente jugador tras comprar (solo 1 compra por turno).
      if (eTrasCompra.indiceActivo + 1 >= eTrasCompra.participantes.length) {
        return entrarZona(eTrasCompra, eTrasCompra.zonaActual + 1)
      }
      return { ...eTrasCompra, indiceActivo: eTrasCompra.indiceActivo + 1 }
    }

    case "COMPRAR_SEGURO": {
      if (estado.zonaActual !== 9 || !jugadorActivo) return estado
      if (jugadorActivo.seguroCompradoEsteAnio || jugadorActivo.efectivo < 50) return estado
      const eTrasSeguro = actualizarActivo(
        (j) => ({ ...j, efectivo: j.efectivo - 50, seguros: j.seguros + 1, seguroCompradoEsteAnio: true }),
        `${jugadorActivo.nombre} contrata un seguro por $50.`,
      )
      // Auto-avanzar al siguiente jugador tras comprar seguro.
      if (eTrasSeguro.indiceActivo + 1 >= eTrasSeguro.participantes.length) {
        return entrarZona(eTrasSeguro, eTrasSeguro.zonaActual + 1)
      }
      return { ...eTrasSeguro, indiceActivo: eTrasSeguro.indiceActivo + 1 }
    }

    case "JUGAR_TURNO_BOT": {
      if (!esZonaInteractiva(estado.zonaActual)) return estado
      if (!jugadorActivo || jugadorActivo.id !== accion.jugadorId || !jugadorActivo.esBot) return estado
      const accionBot = decidirAccionBot(estado, jugadorActivo)
      let e = accionBot ? reducer(estado, accionBot) : estado
      // La Zona 1 (Planificación) ya avanza el turno sola dentro de COLOCAR; el resto de
      // zonas interactivas necesita el paso explícito de "siguiente jugador".
      if (estado.zonaActual !== 1) {
        e = reducer(e, { tipo: "SIGUIENTE_JUGADOR" })
      }
      return e
    }

    case "SIGUIENTE_JUGADOR": {
      if (!esZonaInteractiva(estado.zonaActual)) return estado
      if (estado.indiceActivo + 1 >= estado.participantes.length) {
        return entrarZona(estado, estado.zonaActual + 1)
      }
      return { ...estado, indiceActivo: estado.indiceActivo + 1 }
    }

    case "AVANZAR_ZONA": {
      if (esZonaInteractiva(estado.zonaActual) || estado.imprevistoActual) return estado
      return entrarZona(estado, estado.zonaActual + 1)
    }

    case "VENDER_PRODUCTO": {
      // "Venta de productos": solo en la Zona 11 (Reorganización), solo tarjetas de
      // Compras tipo Producto (no Servicio ni Actividad), al precio que acuerden entre
      // el vendedor y el comprador. El comprador solo empieza a recibir el bienestar
      // recurrente de la tarjeta a partir de la siguiente ronda (ya cae así solo, porque
      // la Zona 2 de este año ya pasó).
      if (estado.zonaActual !== 11) return estado
      if (accion.vendedorId === accion.compradorId) return estado
      if (accion.precio < 0) return estado
      const idxVendedor = estado.jugadores.findIndex((j) => j.id === accion.vendedorId)
      const idxComprador = estado.jugadores.findIndex((j) => j.id === accion.compradorId)
      if (idxVendedor === -1 || idxComprador === -1) return estado
      const vendedor = estado.jugadores[idxVendedor]
      const comprador = estado.jugadores[idxComprador]
      const producto = vendedor.compras.find((c) => c.id === accion.compraId && c.tipo === "Producto")
      if (!producto) return estado
      if (comprador.efectivo < accion.precio) return estado
      const jugadores = estado.jugadores.map((j, i) => {
        if (i === idxVendedor) {
          return { ...j, efectivo: j.efectivo + accion.precio, compras: j.compras.filter((c) => c.id !== accion.compraId) }
        }
        if (i === idxComprador) {
          return { ...j, efectivo: j.efectivo - accion.precio, compras: [...j.compras, producto] }
        }
        return j
      })
      return {
        ...estado,
        jugadores,
        registro: log(
          estado,
          `${comprador.nombre} le compra «${producto.nombre}» a ${vendedor.nombre} por $${accion.precio} (recibirá el bienestar desde el próximo año).`,
        ),
      }
    }

    case "RESOLVER_IMPREVISTO": {
      const imp = estado.imprevistoActual
      if (!imp) return estado
      const mensajes: string[] = []
      const protegidos = new Set(accion.segurosUsados)
      const esNegativo = imp.tipo === "Negativo"
      const retirados: string[] = []

      const jugadores = estado.jugadores.map((j) => {
        // Los jugadores en Zona 9 están protegidos de imprevistos negativos.
        const enSeguroZona = j.zona === 9
        if (esNegativo && imp.asegurable && enSeguroZona) {
          mensajes.push(`${j.nombre}: protegido por estar en Seguro (sin efecto).`)
          return j
        }
        // Uso opcional de ficha de seguro.
        if (esNegativo && imp.asegurable && protegidos.has(j.id) && j.seguros > 0) {
          mensajes.push(`${j.nombre}: usa una ficha de seguro y evita el imprevisto.`)
          return { ...j, seguros: j.seguros - 1 }
        }
        return aplicarImprevistoAJugador(j, imp, mensajes, accion.eleccionesProducto?.[j.id], retirados)
      })

      // "Elecciones": votación por mayoría simple entre todos los jugadores.
      // En caso de empate, decide el voto del jugador con la ficha de primer jugador.
      let saltar = false
      if (imp.esVotacion) {
        const votos = accion.votoSaltar ?? {}
        let si = 0
        let no = 0
        for (const j of estado.jugadores) {
          if (votos[j.id]) si++
          else no++
        }
        const primerJugadorNombre = estado.jugadores[estado.primerJugador]?.nombre ?? ""
        if (si > no) saltar = true
        else if (no > si) saltar = false
        else saltar = !!votos[estado.jugadores[estado.primerJugador]?.id]
        mensajes.push(
          `Votación de Elecciones: ${si} a favor de saltear, ${no} en contra` +
            (si === no ? ` (empate, decide ${primerJugadorNombre})` : "") +
            `. Resultado: ${saltar ? "se saltea" : "no se saltea"} el imprevisto del próximo año.`,
        )
      }

      const e: EstadoJuego = {
        ...estado,
        jugadores,
        imprevistoActual: null,
        saltarProximoImprevisto: saltar,
        imprevistosRevelados: estado.imprevistosRevelados + 1,
        comprasRetiradas: [...estado.comprasRetiradas, ...retirados],
        registro: [...mensajes.map((m) => `Año ${estado.anio} · Imprevisto · ${m}`), ...estado.registro].slice(0, 80),
      }
      return entrarZona(e, 11)
    }

    default:
      return estado
  }
}

