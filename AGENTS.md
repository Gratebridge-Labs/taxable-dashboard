# Taxable Dashboard — Agent Guide

## Project Overview
Nigerian tax compliance app (PIT, PAYE, CIT, VAT/WHT).
Next.js 16 App Router, TypeScript strict, Tailwind CSS v4, React Compiler enabled.
Uses `--webpack` on Windows (Turbopack crashes with `0xc0000142` on PostCSS/lightningcss).

## Commands
```bash
npm run dev              # Dev server (next dev --webpack)
npm run build            # Production build
npm run lint             # ESLint (next/core-web-vitals + typescript)
npx tsc --noEmit         # TypeScript check (must pass with 0 errors)
```
No test framework is configured (no Jest, Vitest, Playwright). Pre-commit: `npm run lint && npx tsc --noEmit`.

## Architecture
```
src/app/           App Router pages + layout.tsx
                    (layout wraps: ErrorBoundary → Toaster → ToastProvider → UserProvider → ProfileProvider)
src/screens/       Page-level screen components (Auth/, Onboarding/, TaxFolders/)
src/components/    Shared UI (ui/ = shadcn + custom, OnboardingLayout, Toast, SetupSidebar, DashboardHeader)
src/contexts/      React Contexts (UserContext, ProfileContext, OnboardingContext)
src/hooks/         useApi (generic HTTP with AbortController), useTaxableApi (typed API wrappers)
src/lib/           taxable-api.ts, api-endpoints.ts, utils.ts (cn() = clsx + twMerge)
src/types/         API TypeScript types/interfaces
```

## Code Style

### General
- `'use client'` only on line 1 of interactive components. Pure utility files must NOT have it.
- `catch (err: unknown)` — always narrow with `err instanceof Error ? err.message : '...'`.
- No `console.log` or `console.warn` in production. `console.error` is acceptable.
- Never define a component inside another component. Extract to file-scope or separate file.
- Use `useCallback` for functions passed as props or used in dependency arrays.
- Prefix unused vars with `_` (e.g., `const _unused = ...`).
- Single quotes, semicolons required.

### Imports
Order (separated by blank lines):
1. React / Next.js (`'react'`, `'next/link'`, `'next/navigation'`)
2. Third-party (`'lucide-react'`, `'sonner'`, `'gsap'`)
3. Local (`@/components/...`, `@/hooks/...`, `@/contexts/...`, relative `'./...'`)
- `@/` alias maps to `src/`

### Components
- Screen components: `export default function SignIn()` — in `src/screens/Auth/`
- Route pages: thin wrappers that import and render the screen (e.g., `src/app/signin/page.tsx`)
- Shared UI components in `src/components/ui/` — use shadcn (`Input`, `Label`, `Button`) or custom (`PasswordInput`, `OtpInput`, `Spinner`)
- Props types: `interface` over `type` for object shapes

## Design System (Consolidated)

### Typography
- **Body text**: `text-2` (13px, `0.867rem`), `font-medium`, `tracking-[-0.01em]`, `text-neutral-400`
- **Headings**: `tracking-[-0.02em]` (-2% letter spacing)
- **Input labels**: `text-2 font-medium` (13px), `tracking-[-0.01em]` — via shadcn `Label`
- **Root font-size**: `html { font-size: 15px }` — all `rem` values scale from this
- **Font family**: Archivo local font (`/public/Archivo/Archivo-VariableFont_wdth,wght.ttf`)
- **`text-N` classes** (1–15) are plain CSS in `globals.css`, NOT Tailwind `@theme` tokens

### Spacing (standardized across all Auth screens)
| Transition | Value | Class |
|---|---|---|
| Header block → Input block | 40px | `mb-10` |
| Header → Subtext | 4px | `mb-1` |
| Label → Input | 4px | `gap-1` |
| Input block → CTA block | 40px | `space-y-10` or `gap-10` |
| CTA button → Secondary link | 12px | `gap-3` |

### Colors
- Body text / subtext: `text-neutral-400` (#a3a3a3)
- Text buttons / action links: `text-neutral-800` (#262626)
- Left panel subtext: `text-neutral-50` (#fafafa)
- Error messages: `text-red-500`
- Never use `gray-*` — use `neutral-*`. Never hardcoded hex colors.

### Buttons (plain `<button>`, not shadcn `Button`)
| Property | Value |
|---|---|
| Height | `h-12` (48px) |
| Text | `text-3 font-semibold` |
| Radius | `rounded-xl` |
| Hover | **none** — no hover effects on any button |
| Disabled | `disabled:bg-neutral-100 disabled:text-neutral-400` (button disabled until all required fields filled) |
| Loading | `<Spinner />` replaces text, button stays visually active (`bg-taxable-blue text-white`) |
| Active | `bg-taxable-blue text-white font-semibold` |

### Input Fields (shadcn `Input`)
| Property | Value |
|---|---|
| Height | `h-10` (40px) |
| Padding | `px-3` (12px) |
| Font | `text-sm font-medium` |
| Border | `border-neutral-200` |
| Focus | `focus-visible:ring-1 focus-visible:ring-neutral-800` |
| Error | `aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/20` |
| Background | `bg-white` |

### Password Input
Use the shared `PasswordInput` component (`src/components/ui/password-input.tsx`).
Wraps shadcn `InputGroup` with lucide `Eye`/`EyeOff` toggle.
Accepts `label`, `hint`, `error` props. Error state via `data-invalid` + `aria-invalid`.
Never build a custom password field inline.

### OTP Input
Use the shared `OtpInput` component (`src/components/ui/otp-input.tsx`).
6 individual shadcn `Input` components (`w-12 h-12`, md: `w-14 h-14`), `text-5 md:text-7 font-bold`.
Accepts `value`, `onChange`, `onComplete`, `error` props. Auto-focus, keyboard navigation.

### Layout
- Right panel background: `bg-white`
- Content max-width: `max-w-[420px]`
- Toast notifications: use `sonner` (`toast.success()`, `toast.error()`) — `<Toaster />` is in root layout.
- Never use custom modals for simple notifications.

## Verification
Before committing: `npm run lint && npx tsc --noEmit` — must pass with **0 errors**.
ESLint target: 0 errors. Warnings allowed for `react-hooks/exhaustive-deps` and `@next/next/no-img-element`.
`react/no-unescaped-entities` is disabled (apostrophes in JSX text are fine).

## Key Dependencies
- **shadcn (v4 base-nova)**: `Input`, `Label`, `Button`, `InputGroup*`, `Toaster`
- **sonner**: toast notifications (preferred over custom modals)
- **lucide-react**: icons (`Eye`, `EyeOff`, `Info`, `AlertTriangle`, `LoaderIcon`)
- **gsap** + **lenis**: animations (smooth scrolling)
- **framer-motion**: component animations
