# SPEC 01 — MVP visual de Arcade Vault

> **Status:** Aprobado
> **Depends on:** —
> **Date:** 2026-08-31
> **Objective:** Implementar en el App Router de Next.js las cinco pantallas del prototipo estático (`references/templates/`) —biblioteca, detalle, reproductor, salón de la fama y login— reproduciendo su diseño e interacciones visuales sin implementar ningún motor de juego real.

## Por qué existe este spec

El prototipo en `references/templates/` (HTML + React vía CDN) ya define el modelo de datos, el lenguaje visual neón/CRT y el flujo de navegación completo. Este spec traduce ese prototipo a la app real (Next.js 16 App Router, React 19, TypeScript estricto, Tailwind v4) manteniendo la fidelidad visual e interactiva, pero sin backend ni lógica de juego real: el "juego" en la pantalla de reproductor sigue siendo una simulación falsa (puntaje autoincremental), igual que en el prototipo.

## Scope

**In:**

- Rutas reales del App Router (en español) para las 5 pantallas del prototipo:
  - `/` — Biblioteca (grid de juegos, búsqueda, filtro por categoría).
  - `/juego/[id]` — Detalle del juego + tabla de mejores puntuaciones.
  - `/juego/[id]/jugar` — Reproductor: HUD, marco CRT, simulación de partida (puntaje/vidas/nivel falsos), pausa, modal de fin de juego con guardado de puntuación.
  - `/salon-de-la-fama` — Podio + tabla de puntuaciones por juego (tabs).
  - `/login` — Formulario de inicio de sesión / registro / invitado (sin backend).
- Navegación (`Nav`) y pie de página persistentes en el layout raíz, con estado activo por ruta y menú móvil (hamburguesa) igual que el prototipo.
- Sesión de usuario falsa persistida en `localStorage` (`av_user`), compartida entre pantallas vía un `AuthProvider` de React Context (reemplaza el estado a nivel de `App` del prototipo, que no aplica en App Router).
- Registro de puntuaciones falsas en `localStorage` (`av_scores`) al terminar una partida simulada.
- Migración del lenguaje visual completo de `styles.css` (colores, tipografías, animaciones, fondo con grid/scanlines/ruido, clases `.btn`/`.card`/`.chip`/etc.) a `app/globals.css`, expuesto como tokens de tema con `@theme` de Tailwind v4.
- Migración de los datos mock (`GAMES`, `CATS`, `PLAYERS`, `seededScores`) a `lib/data.ts`, tipados.
- Tipografías (Press Start 2P, JetBrains Mono, Courier Prime) cargadas con `next/font/google`.
- Diseño responsive (incluye los breakpoints y el panel móvil del prototipo).
- Elementos decorativos sin funcionalidad real (botones "GOOGLE"/"GITHUB", contador "CRÉDITOS · 03"), igual que en el prototipo.

**Out of scope (para specs futuros):**

- Cualquier motor de juego real (canvas, controles de teclado/táctiles, colisiones, niveles reales). La pantalla `/juego/[id]/jugar` sigue siendo una simulación visual, no un juego jugable.
- Backend, base de datos o API real. No hay validación de credenciales, hashing de contraseñas, ni providers OAuth reales para los botones sociales.
- Cálculo real de leaderboards a partir de partidas jugadas. Las tablas de puntuación siguen siendo datos mock generados por `seededScores`; `av_scores` se escribe pero no se vuelve a leer para pintar ninguna tabla (igual que en el prototipo).
- Sistema de créditos/monedas real.
- Internacionalización (la app queda en español, igual que el prototipo).
- Tests automatizados (no hay framework de testing configurado en el repo).
- Página 404 / not-found personalizada — un `id` de juego inexistente muestra un mensaje inline simple, no una ruta dedicada.

## Data model

```ts
// lib/data.ts
export interface Game {
  id: string;
  title: string;
  short: string;
  long: string;
  cat: "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
  cover: string; // nombre de clase CSS del cover art (p.ej. "cover-bricks")
  color: "cyan" | "magenta" | "yellow" | "green";
  best: number;
  plays: string;
}

export const GAMES: Game[]; // los 8 juegos del prototipo, mismos valores
export const CATS: string[]; // ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"]
export const PLAYERS: string[]; // nombres usados por seededScores

export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string; // "DD/MM/2026"
}

export function seededScores(seed: number, count?: number): ScoreRow[]; // idéntico al prototipo
```

```ts
// lib/storage.ts
export interface User {
  name: string;
}

export interface ScoreEntry {
  game: string; // Game.id
  score: number;
  name: string;
  at: number; // Date.now()
}

// Claves de localStorage: "av_user", "av_scores" (mismas que el prototipo)
export function getStoredUser(): User | null;
export function saveUser(user: User): void;
export function clearUser(): void;
export function addScore(entry: Omit<ScoreEntry, "at">): void;
```

`components/auth-provider.tsx` expone un Context (`AuthProvider` + hook `useAuth()`) con `{ user: User | null; login: (u: User | null) => void; logout: () => void }`, que internamente usa `lib/storage.ts`. Reemplaza el estado `user`/`handleLogin`/`handleSignOut` que en el prototipo vivía en `App` — necesario porque en App Router no hay un componente raíz único que envuelva todas las rutas con `useState`.

## Implementation plan

1. **Tema y tipografías base.** Actualizar `app/layout.tsx` para cargar Press Start 2P, JetBrains Mono y Courier Prime con `next/font/google`, y portar `references/templates/styles.css` a `app/globals.css` (colores/fuentes vía `@theme`, resto de clases como CSS global tal cual el prototipo). Verificación manual: `pnpm dev` muestra el fondo oscuro con la tipografía correcta en la página placeholder existente.
2. **Datos mock tipados.** Crear `lib/data.ts` con `Game`, `ScoreRow`, `GAMES`, `CATS`, `PLAYERS`, `seededScores`, portando los valores exactos de `data.jsx`.
3. **Persistencia local.** Crear `lib/storage.ts` con `User`, `ScoreEntry` y las funciones de lectura/escritura en `localStorage` (con `try/catch` como en el prototipo, para no romper en modo privado).
4. **Sesión compartida.** Crear `components/auth-provider.tsx` (`AuthProvider`, `useAuth`) inicializado desde `getStoredUser()`. Envolver `children` con `AuthProvider` en `app/layout.tsx`.
5. **Chrome persistente.** Crear `components/app-background.tsx` (capas decorativas de grid/scanlines/ruido) y `components/nav.tsx` (client component: logo, links con estado activo por `usePathname()`, contador de créditos estático, botón de sesión usando `useAuth()`, menú móvil). Insertarlos en `app/layout.tsx` junto con el `<footer>` estático (mismo copy que el prototipo).
6. **Biblioteca (`/`).** Crear `components/game-card.tsx` (tarjeta con efecto tilt al mover el mouse, portado de `GameCard`) y `app/page.tsx` (client component: buscador, chips de categoría, grid filtrado, estado vacío "NO HAY RESULTADOS"). Las tarjetas enlazan con `next/link` a `/juego/[id]`.
7. **Detalle (`/juego/[id]`).** Crear `app/juego/[id]/page.tsx` como server component: `params` es `Promise<{ id: string }>` (se hace `await`), busca el juego en `GAMES`, llama a `notFound()` si no existe, y renderiza cover, tags, descripción, stat-strip y leaderboard (`seededScores`). Botones enlazan a `/juego/[id]/jugar` y a `/`.
8. **Reproductor (`/juego/[id]/jugar`).** Crear `app/juego/[id]/jugar/page.tsx` como client component (`useParams()` para el id). Portar el estado de `GamePlayer`: intervalo de puntaje falso, nivel derivado, vidas, pausa, fin de juego, modal con input de iniciales (precargado con `useAuth().user?.name` o `"INVITADO"`) y guardado vía `addScore()`. "SALIR" navega a `/juego/[id]`.
9. **Salón de la fama (`/salon-de-la-fama`).** Crear `app/salon-de-la-fama/page.tsx` como client component: tabs por juego (`useState`), podio (top 3), tabla completa vía `seededScores`, y fila "tu mejor marca" cuando `useAuth().user` existe (mismo cálculo ilustrativo que el prototipo).
10. **Login (`/login`).** Crear `app/login/page.tsx` como client component: tabs "Iniciar sesión"/"Crear cuenta", campos de formulario, botón "JUGAR COMO INVITADO", botones sociales decorativos. Al enviar el formulario o continuar como invitado, llama a `useAuth().login(...)` y navega a `/` con `useRouter().push("/")`.
11. **Pulido de navegación.** Revisar que `Nav` marque como activo `/` también cuando la ruta actual empieza con `/juego`, y `/salon-de-la-fama` cuando corresponde (equivalente al `isActive` del prototipo). Confirmar que el botón de sesión en `Nav` navegue a `/login` cuando no hay usuario y cierre sesión (sin navegar) cuando sí lo hay.
12. **QA manual y lint.** Recorrer las 5 rutas en el navegador (desktop y viewport móvil), probar login/invitado/logout, simular una partida completa (pausa, fin, guardar puntuación), cambiar de tab en el salón de la fama, y correr `pnpm lint` sin errores.

## Acceptance criteria

- [ ] `pnpm dev` sirve `/`, `/juego/[id]` (para cada id de `GAMES`), `/juego/[id]/jugar`, `/salon-de-la-fama` y `/login` sin errores en consola.
- [ ] La página `/` muestra el grid de 8 juegos, filtra por texto y por categoría, y muestra el estado "NO HAY RESULTADOS" cuando no hay coincidencias.
- [ ] Click en una tarjeta o en su botón "JUGAR" navega a `/juego/[id]` del juego correspondiente.
- [ ] `/juego/[id]` muestra la info del juego y una tabla de 10 puntuaciones generada por `seededScores`; un `id` inexistente muestra el estado not-found.
- [ ] El botón "JUGAR AHORA" navega a `/juego/[id]/jugar`.
- [ ] En `/juego/[id]/jugar`, el puntaje sube automáticamente mientras no está en pausa ni terminado, "PAUSA" detiene el incremento, y "FIN" abre el modal de fin de juego con el puntaje final.
- [ ] Guardar la puntuación en el modal escribe una entrada en `localStorage["av_scores"]` y muestra el mensaje de confirmación.
- [ ] "SALIR" desde el reproductor vuelve a `/juego/[id]`.
- [ ] `/salon-de-la-fama` muestra tabs por cada juego; cambiar de tab actualiza podio y tabla con datos deterministas distintos.
- [ ] Con sesión iniciada, `/salon-de-la-fama` muestra la fila "tu mejor marca"; sin sesión, no aparece.
- [ ] En `/login`, enviar el formulario (con cualquier valor) o pulsar "JUGAR COMO INVITADO" crea sesión en `localStorage["av_user"]`, redirige a `/` y el `Nav` refleja el nombre de usuario (o "INVITADO").
- [ ] Cerrar sesión desde el `Nav` borra `localStorage["av_user"]` y el botón vuelve a mostrar "Iniciar Sesión".
- [ ] El `Nav` marca como activo el link correspondiente en las 5 rutas, y el menú hamburguesa funciona en viewport móvil (< 840px).
- [ ] La app conserva el lenguaje visual del prototipo: colores neón, tipografía Press Start 2P para títulos/labels, fondo con grid/scanlines, marco CRT en el reproductor.
- [ ] `pnpm lint` termina sin errores.

## Decisions

- **Sí:** rutas reales del App Router en español (`/`, `/juego/[id]`, `/juego/[id]/jugar`, `/salon-de-la-fama`, `/login`) en vez del router por hash del prototipo. Aprovecha la navegación nativa de Next.js y URLs compartibles.
- **Sí:** mantener la simulación de partida falsa (puntaje autoincremental, vidas, modal de guardado) en `/juego/[id]/jugar`. El pedido es "solo visual", y esa simulación es parte del diseño visual/interactivo del prototipo, no un juego real.
- **Sí:** sesión (`av_user`) y puntuaciones (`av_scores`) en `localStorage`, sin backend ni validación real — igual que el prototipo.
- **Sí:** portar `styles.css` casi tal cual a `app/globals.css`, usando `@theme` de Tailwind v4 solo para colores/fuentes. Reescribir todo a utilidades Tailwind sería mucho trabajo adicional sin beneficio para un MVP visual, y arriesga perder fidelidad en animaciones/efectos complejos (tilt de tarjetas, CRT, cover art generado por CSS).
- **Sí:** `lib/data.ts` tipado con TypeScript (el repo ya usa TS estricto en todo lo demás).
- **Sí:** tipografías vía `next/font/google` en vez de `<link>` a Google Fonts, para self-hosting automático y evitar layout shift — es el estándar del App Router.
- **Sí:** botones sociales y contador de créditos puramente decorativos, sin funcionalidad — consistente con "solo la parte visual".
- **Sí:** `AuthProvider` con React Context para compartir el usuario entre `Nav`, login, reproductor y salón de la fama. El prototipo resolvía esto con estado en el componente `App` de una SPA; el App Router no tiene ese componente raíz con estado, así que un Context client-side es el reemplazo más directo.
- **No:** página `not-found` dedicada para `id` de juego inexistente. Se usa `notFound()` de Next.js en el server component de detalle (cae al 404 por defecto) y un mensaje inline simple en el reproductor (client component) — suficiente para un MVP donde todos los ids vienen de `GAMES`.
- **No:** dividir cada pantalla en más subcomponentes de los que ya tiene el prototipo. Se respeta la misma granularidad (un componente principal por pantalla, más `Nav` y `GameCard` reutilizados).

## Risks

| Riesgo | Mitigación |
| --- | --- |
| `localStorage` no disponible (modo privado / navegador restrictivo) | Todas las lecturas/escrituras en `lib/storage.ts` van en `try/catch`; si falla, la sesión y las puntuaciones simplemente no persisten entre recargas, pero la UI sigue funcionando en memoria durante la sesión de navegación. |
| Desajuste entre `params` síncrono (patrón del prototipo) y `params` asíncrono de Next.js 16 | El plan de implementación usa explícitamente `await params` en el server component de detalle y `useParams()` en los client components, siguiendo la convención documentada en `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/dynamic-routes.md`. |

## What is **not** in this spec

- Ningún motor de juego real ni lógica jugable dentro del marco CRT.
- Backend, API, base de datos o autenticación real.
- Cálculo de leaderboards a partir de partidas reales.
- Sistema de créditos/monedas funcional.
- Tests automatizados.
- Página 404 personalizada.

Cada uno de estos, si se necesita, va en su propio spec.
