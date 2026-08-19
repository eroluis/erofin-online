export function dinero(n: number): string {
  return `$${Math.round(n).toLocaleString("es-CL")}`
}

export function numero(n: number): string {
  return Math.round(n).toLocaleString("es-CL")
}
