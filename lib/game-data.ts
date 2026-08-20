// Datos del juego FinLuis (basado en FinanCity, de Momento Cero)
// Todos los valores provienen de las tarjetas y reglas originales.

export type CategoriaInversion = "Negocio" | "Educación"
export type TipoCompra = "Producto" | "Servicio" | "Actividad"
export type TipoImprevisto = "Positivo" | "Negativo" | "Neutral"

export interface Inversion {
  id: string
  nombre: string
  categoria: CategoriaInversion
  ingreso: number
  coste: number
}

export interface Compra {
  id: string
  nombre: string
  tipo: TipoCompra
  bienestar: number
  gastoAnual: number
  coste: number
  recurrente: boolean
  // Cuántas copias físicas existen de esta carta en el juego real (según el Excel de
  // referencia). La mayoría tiene 1; algunas tienen 2. Esto determina cuántas veces
  // puede salir esta misma carta en el mazo de Compras a lo largo de la partida.
  copias: number
}

export interface Hogar {
  numero: number
  ingresos: number
  gastos: number
}

// Valor de cada pagaré.
export const VALOR_PAGARE = 150
// Tope máximo de pagarés que un jugador puede tener.
export const MAX_PAGARES = 24
// A partir de esta cantidad de pagarés el jugador queda "sobre endeudado".
// Confirmado con el reglamento: 12 o menos pagarés NO es sobre-endeudado;
// recién con 13 o más lo es.
export const UMBRAL_SOBRE_ENDEUDADO = 13

// Mínimo de pagarés que se deben pagar cada año según cuántos se tengan.
// Tabla oficial del reglamento (página 4):
//   1–6  pagarés → pagar mínimo 1
//   7–12 pagarés → pagar mínimo 2
//  13–18 pagarés → pagar mínimo 3
//  19–24 pagarés → pagar mínimo 4
export function pagaresMinimosAPagar(pagares: number): number {
  if (pagares <= 0) return 0
  if (pagares <= 6) return 1
  if (pagares <= 12) return 2
  if (pagares <= 18) return 3
  return 4
}

export const HOGARES: Hogar[] = [
  { numero: 1, ingresos: 1000, gastos: 850 },
  { numero: 2, ingresos: 1010, gastos: 860 },
  { numero: 3, ingresos: 1020, gastos: 870 },
  { numero: 4, ingresos: 1030, gastos: 880 },
  { numero: 5, ingresos: 1040, gastos: 890 },
  { numero: 6, ingresos: 1050, gastos: 900 },
]

const inversionesRaw: Omit<Inversion, "id">[] = [
  { nombre: "Terapias holísticas", categoria: "Negocio", ingreso: 40, coste: 100 },
  { nombre: "Desarrollo de APP", categoria: "Educación", ingreso: 80, coste: 220 },
  { nombre: "Taller de peluquería", categoria: "Educación", ingreso: 70, coste: 200 },
  { nombre: "Carpintería", categoria: "Educación", ingreso: 60, coste: 180 },
  { nombre: "Computación", categoria: "Educación", ingreso: 40, coste: 120 },
  { nombre: "Mecánica de fórmula 1", categoria: "Educación", ingreso: 200, coste: 610 },
  { nombre: "Soluciones digitales", categoria: "Negocio", ingreso: 250, coste: 800 },
  { nombre: "Entrenamiento para astronautas", categoria: "Educación", ingreso: 270, coste: 900 },
  { nombre: "Capacitación en ventas", categoria: "Educación", ingreso: 60, coste: 220 },
  { nombre: "Diplomado en redes sociales", categoria: "Educación", ingreso: 150, coste: 600 },
  { nombre: "Comprar oro", categoria: "Negocio", ingreso: 60, coste: 250 },
  { nombre: "Ingeniería", categoria: "Educación", ingreso: 200, coste: 860 },
  { nombre: "Comprar acciones", categoria: "Negocio", ingreso: 160, coste: 700 },
  { nombre: "Servicios turísticos", categoria: "Negocio", ingreso: 100, coste: 450 },
  { nombre: "Restaurante gourmet", categoria: "Negocio", ingreso: 190, coste: 880 },
  { nombre: "Medicina", categoria: "Educación", ingreso: 190, coste: 880 },
  { nombre: "Diplomado en comunicaciones", categoria: "Educación", ingreso: 140, coste: 650 },
  { nombre: "Ventas por catálogo", categoria: "Negocio", ingreso: 40, coste: 190 },
  { nombre: "Diplomado en turismo", categoria: "Educación", ingreso: 130, coste: 640 },
  { nombre: "Panadería familiar", categoria: "Negocio", ingreso: 50, coste: 250 },
  { nombre: "Gastronomía", categoria: "Educación", ingreso: 120, coste: 600 },
  { nombre: "Arquitectura", categoria: "Educación", ingreso: 170, coste: 850 },
  { nombre: "Conducción submarina", categoria: "Educación", ingreso: 20, coste: 140 },
  { nombre: "Consultora", categoria: "Negocio", ingreso: 60, coste: 430 },
  { nombre: "Compañía ambiental", categoria: "Negocio", ingreso: 100, coste: 780 },
  { nombre: "Idiomas", categoria: "Educación", ingreso: 50, coste: 400 },
  { nombre: "Taxi", categoria: "Negocio", ingreso: 90, coste: 750 },
  { nombre: "Robótica", categoria: "Educación", ingreso: 80, coste: 700 },
  { nombre: "Flota de camiones", categoria: "Negocio", ingreso: 90, coste: 900 },
  { nombre: "Secretariado", categoria: "Educación", ingreso: 60, coste: 660 },
  { nombre: "Carrito de comida", categoria: "Negocio", ingreso: 20, coste: 220 },
  { nombre: "Franquicia", categoria: "Negocio", ingreso: 50, coste: 550 },
  { nombre: "Modelaje", categoria: "Educación", ingreso: 10, coste: 110 },
  { nombre: "Venta de ropa", categoria: "Negocio", ingreso: 30, coste: 330 },
  { nombre: "Doctorado en técnicas ninja", categoria: "Educación", ingreso: 80, coste: 880 },
  { nombre: "Granja", categoria: "Negocio", ingreso: 60, coste: 700 },
]

export const INVERSIONES: Inversion[] = inversionesRaw.map((c, i) => ({
  ...c,
  id: `inv-${i}`,
}))

const comprasRaw: Omit<Compra, "id">[] = [
  { nombre: "Escafandra", tipo: "Producto", bienestar: 20, gastoAnual: 10, coste: 30, recurrente: true, copias: 1 },
  { nombre: "Teléfono móvil", tipo: "Producto", bienestar: 50, gastoAnual: 20, coste: 90, recurrente: true, copias: 2 },
  { nombre: "Parrilla", tipo: "Producto", bienestar: 20, gastoAnual: 0, coste: 80, recurrente: true, copias: 2 },
  { nombre: "Fiesta", tipo: "Actividad", bienestar: 80, gastoAnual: 50, coste: 50, recurrente: true, copias: 2 },
  { nombre: "Joyas", tipo: "Producto", bienestar: 20, gastoAnual: 0, coste: 90, recurrente: true, copias: 2 },
  { nombre: "Gimnasio", tipo: "Servicio", bienestar: 50, gastoAnual: 30, coste: 0, recurrente: true, copias: 2 },
  { nombre: "Bicicleta", tipo: "Producto", bienestar: 30, gastoAnual: -30, coste: 250, recurrente: true, copias: 2 },
  { nombre: "Zapatillas", tipo: "Producto", bienestar: 10, gastoAnual: 0, coste: 40, recurrente: true, copias: 1 },
  { nombre: "Sembrar tomates", tipo: "Actividad", bienestar: 20, gastoAnual: -10, coste: 100, recurrente: true, copias: 2 },
  { nombre: "Sofá", tipo: "Producto", bienestar: 50, gastoAnual: 0, coste: 220, recurrente: true, copias: 2 },
  { nombre: "Paneles solares", tipo: "Producto", bienestar: 50, gastoAnual: -40, coste: 400, recurrente: true, copias: 2 },
  { nombre: "Juego de mesa", tipo: "Producto", bienestar: 20, gastoAnual: 0, coste: 30, recurrente: true, copias: 2 },
  { nombre: "Mesa de comedor", tipo: "Producto", bienestar: 70, gastoAnual: 0, coste: 300, recurrente: true, copias: 2 },
  { nombre: "Consola de videojuegos", tipo: "Producto", bienestar: 60, gastoAnual: 10, coste: 300, recurrente: true, copias: 2 },
  { nombre: "Libros", tipo: "Producto", bienestar: 30, gastoAnual: 0, coste: 60, recurrente: true, copias: 2 },
  { nombre: "Computador con Wi-Fi", tipo: "Producto", bienestar: 100, gastoAnual: 10, coste: 350, recurrente: true, copias: 2 },
  { nombre: "Donación a ONG", tipo: "Actividad", bienestar: 300, gastoAnual: 30, coste: 400, recurrente: false, copias: 2 },
  { nombre: "Lavadora", tipo: "Producto", bienestar: 80, gastoAnual: 0, coste: 320, recurrente: true, copias: 2 },
  { nombre: "Internet", tipo: "Servicio", bienestar: 40, gastoAnual: 30, coste: 0, recurrente: true, copias: 2 },
  { nombre: "Remodelar la casa", tipo: "Actividad", bienestar: 160, gastoAnual: 20, coste: 700, recurrente: true, copias: 2 },
  { nombre: "Mejora del jardín", tipo: "Actividad", bienestar: 70, gastoAnual: 10, coste: 230, recurrente: true, copias: 2 },
  { nombre: "Cena de aniversario", tipo: "Actividad", bienestar: 60, gastoAnual: 50, coste: 50, recurrente: true, copias: 1 },
  { nombre: "Pelota", tipo: "Producto", bienestar: 10, gastoAnual: 0, coste: 10, recurrente: true, copias: 1 },
  { nombre: "Clases de baile", tipo: "Servicio", bienestar: 60, gastoAnual: 50, coste: 50, recurrente: true, copias: 1 },
  { nombre: "Cuerda para escalar", tipo: "Producto", bienestar: 10, gastoAnual: 0, coste: 40, recurrente: true, copias: 1 },
  { nombre: "Reunión con amigos", tipo: "Actividad", bienestar: 30, gastoAnual: 20, coste: 0, recurrente: true, copias: 2 },
  { nombre: "Estufa", tipo: "Producto", bienestar: 60, gastoAnual: 20, coste: 120, recurrente: true, copias: 1 },
  { nombre: "Traje espacial", tipo: "Producto", bienestar: 60, gastoAnual: 20, coste: 120, recurrente: true, copias: 1 },
  { nombre: "Secador de pelo", tipo: "Producto", bienestar: 20, gastoAnual: 10, coste: 30, recurrente: true, copias: 1 },
  { nombre: "Llave hidráulica", tipo: "Producto", bienestar: 10, gastoAnual: 0, coste: 10, recurrente: true, copias: 1 },
]

export const COMPRAS: Compra[] = comprasRaw.map((c, i) => ({
  ...c,
  id: `com-${i}`,
}))

// Modificadores que un imprevisto puede aplicar al AÑO SIGUIENTE.
export interface Modificadores {
  gastoDelta: number // se suma a los gastos del próximo año (negativo = descuento), incondicional
  comprasDelta: number // se suma al coste de compras (negativo = descuento)
  inversionDelta: number // se suma al coste de inversiones
  trabajosDelta: number // se suma al bono de trabajos extra (solo si está en Zona 4 ese año)
  bienestarDelta: number // se aplica UNA sola vez al bienestar al iniciar el próximo año
  saltaImprevisto: boolean // el próximo año no hay imprevisto (efecto de "Elecciones")
  // --- Mecánicas condicionales especiales (se resuelven en el bloque de imprevistos) ---
  // "Becas de formación": el descuento de gasto SOLO se aplica si el jugador compra una
  // inversión nueva de categoría Educación en la Zona 6 del año en que rige el modificador.
  gastoEducCondicional: number
  // "No clasificamos": en vez de un -10 plano, se resta este monto POR CADA fuente de
  // bienestar que el jugador reciba ese año (cada compra recurrente con bienestar, el
  // bono de Tiempo Libre, el bienestar de una compra nueva, etc.). Falta terminar de
  // definir qué cuenta como "fuente" cuando implementemos el bloque de imprevistos.
  bienestarPorFuenteDelta: number
}

export const MODIFICADORES_VACIOS: Modificadores = {
  gastoDelta: 0,
  comprasDelta: 0,
  inversionDelta: 0,
  trabajosDelta: 0,
  bienestarDelta: 0,
  saltaImprevisto: false,
  gastoEducCondicional: 0,
  bienestarPorFuenteDelta: 0,
}

export interface Imprevisto {
  id: string
  nombre: string
  descripcion: string
  tipo: TipoImprevisto
  asegurable: boolean // si un seguro puede evitar su efecto negativo
  esVotacion?: boolean // "Elecciones": requiere votación de los jugadores antes de aplicarse
}

export const IMPREVISTOS: Imprevisto[] = [
  {
    id: "imp-0",
    nombre: "Reparar el refrigerador",
    descripcion:
      "Pierdes 1 tarjeta de Producto a tu elección (se retira del juego para siempre). Si no tienes ninguna, pierdes 50 de bienestar. Si tampoco tienes bienestar, pagas $100.",
    tipo: "Negativo",
    asegurable: true,
  },
  {
    id: "imp-1",
    nombre: "Se crean más plazas públicas",
    descripcion: "Todos los hogares reciben 80 puntos de bienestar.",
    tipo: "Positivo",
    asegurable: false,
  },
  {
    id: "imp-2",
    nombre: "Pérdida de la billetera",
    descripcion: "Pierdes todo tu efectivo disponible.",
    tipo: "Negativo",
    asegurable: true,
  },
  {
    id: "imp-3",
    nombre: "Premio al ahorro",
    descripcion: "Recibes $20 por cada $100 que tengas ahorrado.",
    tipo: "Positivo",
    asegurable: false,
  },
  {
    id: "imp-4",
    nombre: "Aumenta la contaminación",
    descripcion:
      "Pierdes 100 puntos de bienestar. Si no tienes bienestar suficiente, pagas $200 por costos médicos.",
    tipo: "Negativo",
    asegurable: true,
  },
  {
    id: "imp-5",
    nombre: "Premio al desempeño laboral",
    descripcion: "Recibes $150.",
    tipo: "Positivo",
    asegurable: false,
  },
  {
    id: "imp-6",
    nombre: "Becas de formación",
    descripcion:
      "El próximo año, SOLO si compras una inversión nueva de categoría Educación en la Zona 6, tu gasto de ese año se reduce en $50.",
    tipo: "Positivo",
    asegurable: false,
  },
  {
    id: "imp-7",
    nombre: "Llegan los dividendos",
    descripcion: "Recibes $50 por cada tarjeta de inversión que tengas.",
    tipo: "Positivo",
    asegurable: false,
  },
  {
    id: "imp-8",
    nombre: "Revalidar título académico",
    descripcion: "Pagas $60 por cada tarjeta de inversión de Educación que tengas.",
    tipo: "Negativo",
    asegurable: true,
  },
  {
    id: "imp-9",
    nombre: "Es más caro invertir",
    descripcion: "El próximo año, cada inversión cuesta $60 más.",
    tipo: "Negativo",
    asegurable: true,
  },
  {
    id: "imp-10",
    nombre: "No clasificamos",
    descripcion:
      "El próximo año restas 10 puntos de bienestar por cada carta o situación que te genere bienestar (no una sola vez).",
    tipo: "Negativo",
    asegurable: true,
  },
  {
    id: "imp-11",
    nombre: "Baja el precio del combustible",
    descripcion: "El próximo año, tu gasto total baja $150.",
    tipo: "Positivo",
    asegurable: false,
  },
  {
    id: "imp-12",
    nombre: "Reparaciones en casa",
    descripcion: "Pagas $200.",
    tipo: "Negativo",
    asegurable: true,
  },
  {
    id: "imp-13",
    nombre: "Temporada de ofertas",
    descripcion: "El próximo año, las tarjetas de compras cuestan $50 menos.",
    tipo: "Positivo",
    asegurable: false,
  },
  {
    id: "imp-14",
    nombre: "Aumenta el empleo",
    descripcion: "El próximo año, quienes estén en Trabajos Extra reciben $100 adicionales.",
    tipo: "Positivo",
    asegurable: false,
  },
  {
    id: "imp-15",
    nombre: "Elecciones",
    descripcion:
      "Los jugadores votan (mayoría simple) si quieren saltarse el imprevisto del próximo año. Empate lo decide el jugador con la ficha de primer jugador. Si gana el sí, la carta se retira sin mirarla y sin aplicar efecto.",
    tipo: "Neutral",
    asegurable: false,
    esVotacion: true,
  },
]
