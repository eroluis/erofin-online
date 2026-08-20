// Código de sala corto y fácil de dictar por teléfono o escribir en el celular: 5
// letras/números, sin caracteres que se confundan entre sí (0/O, 1/I/L). No depende de
// nada del servidor, así que se puede importar tanto desde componentes de cliente
// (pantalla de inicio) como desde el servidor.
const ALFABETO_CODIGO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"

export function generarCodigoSala(): string {
  let codigo = ""
  for (let i = 0; i < 5; i++) {
    codigo += ALFABETO_CODIGO[Math.floor(Math.random() * ALFABETO_CODIGO.length)]
  }
  return codigo
}
