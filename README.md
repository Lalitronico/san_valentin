# Pixel Love Adventure (San Valentín 2026)

Mini aventura web retro estilo monster-adventure, con arte, música y mecánicas originales.

## Mejoras de la versión actual

- Estilo visual más rico tipo retro "64-bit vibes" (más resolución y detalle).
- Pantalla mucho más grande y cómoda.
- Progresión guiada con objetivo visible en HUD (ya no te quedas bloqueado).
- Historia ampliada:
  - Ciudad Nocturna
  - Campus LSE-inspired
  - Londres Nocturno (Underground, Thames Walk, Red Bus Stop, Clock Tower View)
  - Reencuentro final en puente

## Características

- Controles:
  - `WASD` / flechas: mover
  - `E` / `Enter`: interactuar y avanzar diálogos
  - `Esc`: pausa
- Encuentros simbólicos: `Duda`, `Distancia`, `Extrañar` con elecciones.
- Love Meter + 6 recuerdos coleccionables.
- Guardado en `localStorage` (escena, final visto y progreso completo).
- Audio original con WebAudio:
  - música chiptune
  - pasos
  - confirmaciones
  - fanfarria

## Requisitos

- Node.js 18+
- npm 9+

## Cómo correr localmente

```bash
npm install
npm run dev
```

Luego abre la URL de Vite (normalmente `http://localhost:5173`).

## Build de producción

```bash
npm run build
npm run preview
```

## Personalización rápida

Edita `src/config.ts`:

- `girlfriendName`
- `myName`
- `anniversaryMessage`
- `insideJokes` (array)
- `dates.valentine`
- `dates.londonStart`
- `secretCode`

Valores por defecto incluidos (`Mi amor` y `Yo`).

## Estructura principal

- `src/main.ts`: configuración Phaser/Vite.
- `src/config.ts`: datos personalizables.
- `src/game/scenes/*`: escenas del juego.
- `src/game/ui/*`: UI RPG (diálogos, HUD, opciones).
- `src/game/systems/*`: audio, texturas, objetivos y datos de mundos.
- `src/game/save.ts`: persistencia localStorage.

## Despliegue fácil

### Vercel

1. Importa este repo en Vercel.
2. Build command: `npm run build`
3. Output directory: `dist`

### GitHub Pages

1. Ejecuta `npm run build`
2. Publica la carpeta `dist` con GitHub Actions o manualmente.

## Nota legal/creativa

Este proyecto es un homenaje retro original. No usa marcas, nombres, sprites, música ni assets de franquicias registradas.
