# Taxable Dashboard — Agent Guide

## Project Overview
Nigerian tax compliance app (PIT, PAYE, CIT, VAT/WHT).
Next.js 16 App Router, TypeScript strict, Tailwind CSS v4, React Compiler enabled.

## Commands
- `npm run dev` — Start dev server (Next.js 16 Turbopack)
- `npm run build` — Production build
- `npm run lint` — ESLint (next/core-web-vitals + typescript)
- `npx tsc --noEmit` — Type check (must pass clean)

## Architecture
- `src/app/` — App Router pages (layout.tsx wraps everything in ErrorBoundary → ToastProvider → UserProvider → ProfileProvider)
- `src/screens/` — Page-level screen components
- `src/components/` — Shared UI components (Toast, SetupSidebar, OnboardingLayout, DashboardHeader, ErrorBoundary)
- `src/contexts/` — React Contexts (UserContext, ProfileContext, OnboardingContext)
- `src/hooks/` — useApi (generic HTTP with AbortController), useTaxableApi (typed API wrappers)
- `src/lib/` — taxable-api.ts (API service class), api-endpoints.ts (URL builders), index.ts (barrel exports)
- `src/types/api.ts` — All TypeScript types/interfaces for API communication

## Design System
- **Never use `gray-*`** — use `neutral-*` instead
- **Never use hardcoded hex colors** — use tokens like `bg-taxable-blue`, `text-neutral-800`
- **Never use `text-[Npx]`** — use `text-1` through `text-15` scale
- Brand tokens: `taxable-blue`, `taxable-beige`, `taxable-dark`, `taxable-lightgray`, `taxable-gray`, `taxable-alert`, `taxable-light`

## Code Style
- `'use client'` only on line 1 of interactive components. Pure utility files must NOT have it.
- `catch (err: unknown)` — always narrow with `err instanceof Error ? err.message : '...'`
- No `console.log` or `console.warn` in production. `console.error` is acceptable.
- Never define a component inside another component's render function (React Compiler violation)
- Use `useCallback` for functions passed as props or used in dependency arrays
- Prefix unused vars with `_` (e.g., `const _unused = ...`)

## ESLint Config
- `react/no-unescaped-entities` is disabled (apostrophes in JSX text are fine)
- `test-dist/` and `verify-integration.js` are excluded from linting
- Target: 0 errors, warnings only for `react-hooks/exhaustive-deps` and `@next/next/no-img-element`

## Verification
Before committing: `npm run lint && npx tsc --noEmit` — must pass with 0 errors.