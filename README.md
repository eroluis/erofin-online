# FinLuis Multijugador

Esta es una versión aparte de FinLuis pensada para que varias personas jueguen la
misma partida desde sus propios celulares o computadoras, conectándose todos a
través de un código de sala.

**No toca ni reemplaza el proyecto original** (el de una sola pantalla compartida) —
es un repositorio y un proyecto de Vercel completamente separados.

## Qué cambia respecto al proyecto original

- `app/page.tsx`: ahora es la pantalla para crear una sala nueva o unirse a una con un código.
- `app/sala/[codigo]/page.tsx`: es la pantalla del juego en sí (igual a la versión original), pero conectada por red en vez de guardar todo en la memoria del navegador.
- `app/api/sala/[codigo]/route.ts`: recibe las jugadas de todos los jugadores y guarda la partida.
- `lib/sala.ts` / `lib/codigo-sala.ts`: manejo de la base de datos (Redis vía Upstash) y generación de códigos de sala.
- `lib/use-game-remoto.ts`: como `lib/use-game.ts`, pero mandando cada jugada por red en vez de aplicarla localmente.

## Qué hace falta para que funcione

Este proyecto necesita una base de datos Redis (gratis) conectada desde el panel de
Vercel — instrucciones completas en la conversación donde se armó este proyecto.

## Límite conocido

Cualquiera con el link de la sala puede tocar los botones de cualquier jugador (no
hay usuarios ni contraseñas) — pensado para jugar entre gente de confianza en la
misma partida, no para uso público.
