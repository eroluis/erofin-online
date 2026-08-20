# FinLuis — Réplica digital del juego de tablero

## Descripción
Implementación web del juego de tablero **FinanCity** (versión bilingüe), aquí renombrada **FinLuis**. Es un juego de estrategia financiera para 2–6 jugadores que simula 10 años de decisiones económicas: inversiones, compras, ahorro, crédito y eventos imprevistos.

## Stack tecnológico
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Lenguaje**: TypeScript 5.7
- **Estilos**: Tailwind CSS v4 + shadcn/ui (Base UI)
- **Estado del juego**: `useReducer` en `lib/use-game.ts`
- **Datos**: `lib/game-data.ts` (tarjetas de inversión, compra, hogares, imprevistos)
- **Package manager**: pnpm

## Cómo ejecutar
```
pnpm install && pnpm dev
```
La app corre en **puerto 5000** (`next dev -p 5000`).

## Estructura del proyecto
```
app/
  page.tsx           — Página principal del juego
  layout.tsx         — Layout raíz con globals.css
components/
  action-panel.tsx   — Acciones del jugador (ahorro, crédito, seguro)
  stat-dashboard.tsx — Stats: efectivo, ahorro, deuda, bienestar
  market.tsx         — Mercado de inversiones y compras
  portfolio.tsx      — Portafolio personal del jugador
  activity-log.tsx   — Historial de eventos
  event-modal.tsx    — Modal de imprevistos
  end-game-modal.tsx — Resultados finales
  rules-dialog.tsx   — Reglas del juego
  ui/                — Componentes base (shadcn/ui)
lib/
  use-game.ts        — Hook principal + reducer (lógica multijugador, 11 zonas)
  game-data.ts       — Datos de tarjetas y constantes del juego
  format.ts          — Utilidades de formato ($, números)
```

## Estado actual del código
El núcleo lógico (`use-game.ts` + `game-data.ts`) está implementado para un flujo **multijugador con 11 zonas por año**, pero los **componentes de UI quedaron de una versión anterior** (un solo jugador, estado plano). Hay varios desajustes de tipos que impiden que el juego funcione correctamente. Ver tareas de seguimiento.

## Reglas del juego (resumen)
- **Duración**: 10 años. Cada año = 11 zonas secuenciales.
- **Zonas**: Planificación → Ingresos → Ahorro → Trabajos Extra → Tiempo Libre → Inversiones → Compras → Gastos → Seguro → Imprevistos → Organización
- **Metas para ganar**: Bienestar ≥ 300 · Ahorro ≥ $500 · 0 pagarés · ≥ 1 inversión
- **Puntaje**: (Bienestar × 2) + Efectivo + Ahorro
- **Crédito**: +$600 / 6 pagarés (5 si está en zona de Crédito, una vez por año)
- **Ahorro**: rinde 10% al año. Retiro fuera de zona 3: multa 10%.
- **Imprevistos**: 16 cartas, 6 se retiran → 10 en juego (1 por año)

## Preferencias del usuario
- Comunicarse en **español**
- Trabajar **paso a paso**, sin cambios masivos de golpe
- No asumir reglas ambiguas: preguntar antes de codificar
- Mantener la estructura y el stack existentes
