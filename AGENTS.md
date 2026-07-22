# Taxable Dashboard — Agent Guide

Nigerian tax compliance SaaS (PIT, PAYE, CIT, VAT/WHT).
Next.js 16 App Router, TypeScript strict, Tailwind CSS v4, React 19, React Compiler enabled.

## Commands

```bash
npm run dev              # Dev server (next dev --webpack). Turbopack crashes on Windows.
npm run build            # Production build
npx next build --webpack # Fallback if build fails
npm run lint             # ESLint 9.x flat config — 0 errors required
npx tsc --noEmit         # TypeScript strict — 0 errors required
```

No test framework. Pre-commit: both `npm run lint` and `npx tsc --noEmit` must pass with zero errors.

## CRITICAL — Git Rules

**NEVER** `git checkout --`, `git reset --hard`, `git clean -fd`. Fix corrupt files by hand.
Allowed: `add`, `commit`, `push`, `status`, `diff`, `log`, `show`, `stash push/pop` (with permission).
Commit only when explicitly asked. No destructive operations without confirmation.

## Architecture

```
src/
  app/               App Router pages + layout.tsx + globals.css
  screens/           Page-level screens (Auth/, Home/, Onboarding/, TaxFolders/)
  components/ui/     shadcn v4 base-nova (Input, Drawer, Table, Stepper, Accordion, etc.)
  components/        DashboardHeader/, ErrorBoundary/, OnboardingLayout/, RequireAuth/, SetupSidebar/
  contexts/          UserContext, ProfileContext, OnboardingContext
  hooks/             useApi.ts, useTaxableApi.ts
  lib/               taxable-api.ts, utils.ts (cn()), api-endpoints.ts
  types/             api.ts
```

Route pages in `src/app/<route>/page.tsx` are thin wrappers importing from `src/screens/`.
Routes with `useSearchParams()` must be wrapped in `<Suspense>`.
`@/` alias maps to `src/`. Never use relative imports for project files.

## File & Component Naming

- **Components**: `PascalCase.tsx` — file name matches the exported function name.
- **Route pages**: `page.tsx` inside `src/app/<route>/`.
- **Hooks**: `camelCase.ts` prefixed with `use`.
- **Contexts**: `PascalCaseContext.tsx` exporting `PascalCaseProvider` + `usePascalCase` hook.
- **Shared screen components**: Colocate in `src/screens/<Domain>/<Domain>Shared.tsx`.
- **Utility/lib files**: `camelCase.ts`.
- **Type files**: `PascalCase.ts` or a single `api.ts` barrel for domain types.

## Imports

Grouped by blank line in this exact order:
1. React / Next.js (`react`, `next/*`)
2. Third-party (`gsap`, `sonner`, `lucide-react`, `date-fns`, etc.)
3. `@/` aliases (`@/components/`, `@/hooks/`, `@/lib/`, `@/types/`)
4. Relative (`./Component`, `../utils`)

```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { toast } from 'sonner';

import { useUser } from '@/contexts/UserContext';
import { useApi } from '@/hooks/useApi';
import { API_BASE_URL } from '@/lib/api-endpoints';

import { SidebarItem } from './TaxFolderShared';
```

## Component Conventions

- `'use client'` as line 1 of every interactive file.
- Named exports only: `export function Name(...)` — never `export default function` (except page wrappers).
- Never nest React component definitions inside other components.
- Props: use `interface` prefixed with component name (`interface SidebarItemProps`).
- Type unions / aliases: use `type` (`type Section = 'personal-info' | 'income-deductions'`).
- Never `export type {}; export {};` barrel files.
- Default exports only for `src/app/**/page.tsx` wrappers.

## Formatting

- Semicolons required on every statement.
- Single quotes for JS/TS strings, double quotes for JSX attributes.
- Unused variables prefixed with `_` (`_loading`, `_error`). ESLint enforces this.
- No trailing commas in function signatures or type definitions.
- Max line length: prefer breaking at ~100 chars for readability.

## Error Handling

```tsx
// Logging — only console.error, never console.log or console.warn
try {
  // ...
} catch (err: unknown) {
  console.error('Context message:', err instanceof Error ? err.message : 'Unknown error');
}

// API responses — always response.text() → JSON.parse(), never response.json()
const text = await response.text();
const data = JSON.parse(text);

// User-facing errors — always via sonner toast
toast.error('Failed to save. Please try again.');

// localStorage — always try/catch with fallback
try {
  const stored = JSON.parse(localStorage.getItem('taxable_key')!);
} catch { return []; }

// useApi hook — auto-throws ApiError on non-2xx, auto-logs out on 401
const { get, post, put, del, upload, loading, error } = useApi();
```

## State & Hooks Patterns

- Explicit dependency arrays on all `useCallback` / `useEffect` / `useMemo`.
- Only primitive values in dependency arrays — never objects or arrays.
- Wrap multiple `setState` calls inside `useEffect` with `startTransition`.
- Ref-based initialization for one-time setup: `const initialized = useRef(false)`.
- Avoid early returns that clear auth/loading states — auth may still be loading on mount.

## React Compiler Workarounds

React Compiler auto-memoizes aggressively. These patterns break:

**File uploads**: Never `<label><input hidden onChange>`. Use `<button onClick={() => ref.current?.click()}>` + `<input ref={ref} hidden>` with native `addEventListener('change', handler)` in `useEffect`. Always reset `e.target.value = ''`.

**GSAP animations**: Always `gsap.context(() => {...}, containerRef)` in `useLayoutEffect`. Check `prefers-reduced-motion`. Use `data-animate` attribute for reveal animations. Section changes must re-trigger via `useEffect([activeSection])`.

**Lenis smooth scroll**: Guard with `if (window.__lenis) return` to prevent duplicate instances.

**Modals in Lenis context**: Use `createPortal(..., document.body)` — Lenis `transform` breaks `position: fixed`.

## Design System

**Typography** (never `text-sm`, `text-base`, `text-lg`, or arbitrary `[Npx]`):
- Scale: `text-1` (12px) → `text-2` (13px) → `text-3` (15px) → `text-5` (19px) → `text-6` (21px) → `text-7` (24px+)
- Headings: `tracking-[-0.02em] font-semibold`. Font: Archivo Variable (set in layout.tsx).

**Colors** — use only these:
- Body text: `text-neutral-400` (muted) / `text-neutral-500` / `text-neutral-600` / `text-neutral-700`
- Headings: `text-neutral-800`
- Primary button: `bg-taxable-blue` (#003787)
- Secondary: `bg-white border border-neutral-100`
- Containers: `bg-neutral-50`
- Never `gray-*`, never hardcoded hex values in className.
- SVG icons: `stroke="currentColor"` + `className="text-neutral-*"`

**Buttons**:
- Primary: `h-12 text-3 font-semibold rounded-xl bg-taxable-blue text-white disabled:bg-neutral-100 disabled:text-neutral-400`
- Secondary: `h-12 text-3 font-semibold rounded-xl bg-white border border-neutral-100 text-neutral-800`
- No hover or transition effects on buttons.

**Inputs**: Always shadcn `<Input>`. `<select>` → `<SearchableSelect>`. Monetary fields: `fmtInput(setter)`.

**Tables**: Container `bg-white border border-neutral-50 rounded-2xl overflow-hidden`. Header `bg-neutral-50 px-6 py-4 font-medium text-neutral-400`. Data cells `px-6 py-4 font-medium text-neutral-600`. Wrap in `overflow-x-auto`.

**Spacing**: Heading→subtext `mb-1`. Input blocks `space-y-10`. Sections `space-y-12`. Sidebar→content `gap-10`.

## Shared Components

`src/screens/TaxFolders/TaxFolderShared.tsx` contains reusable pieces used across tax screens:
`PrimaryButton`, `PrimaryButtonSm`, `SecondaryButton`, `SecondaryButtonSm`, `SectionHeading`,
`DescriptionText`, `FormLabel`, `FormFieldRow`, `SidebarItem`, `FilingSheet`.

## View / Edit / Add Slide Animation

Three states: add (blank editable), view (disabled), edit (sliding right).
Use grid-based overlap with `translate-x` transitions:

```tsx
<div className="grid grid-cols-1 overflow-hidden">
  <div className={`col-start-1 row-start-1 transition-transform duration-300 ${isEditing ? '-translate-x-full' : 'translate-x-0'}`}>
    {editId !== null && <Form disabled readOnlyStyle="bg-neutral-50 text-neutral-400" />}
  </div>
  <div className={`col-start-1 row-start-1 transition-transform duration-300 ${isEditing ? 'translate-x-0' : 'translate-x-full'}`}>
    {isEditing && <Form disabled={false} readOnlyStyle="" />}
  </div>
</div>
```

## localStorage Patterns

Keys prefixed `taxable_` and scoped by profile/year:
`taxable_vat_${profileId}_${taxYear}`, `taxable_wht_deductions_${profileId}_${taxYear}`,
`taxable_cit_data_${profileId}`, `taxable_pit_income_${profileId}`.

```ts
const [v, setV] = useState(() => {
  try { return JSON.parse(localStorage.getItem(key)!) || []; }
  catch { return []; }
});
useEffect(() => {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
}, [v]);
```

## Tax-Specific Patterns

**PAYE bands** (2026): 0% (₦0–800k), 15% (₦800k–3M), 18% (₦3M–12M), 21% (₦12M–25M), 23% (₦25M–50M), 25% (₦50M+).
Deductions: Pension 8%, NHF 2.5%, HMO 5%, Rent Relief 20% capped ₦500k.

**Stepper**: `goForward` marks current step complete. `goBack` does not. Use `Set<number>` serialized via `Array.from()`.

**VAT**: 5-step stepper. Brought-forward credit from prev month's net. Due 21st of next month. Output VAT @ 7.5%.

**CIT**: 20% (≤₦25M) / 30% (>₦25M) + 4% Development Levy. 4-step stepper. Capital allowances 10/20/25%.

**WHT**: Rate pills [5%] [10%]. File upload required.

## State Management

**UserContext**: `{ user, token, loading, isAuthenticated, login(), logout(), setUser(), refreshUser() }`. Token in `sessionStorage` (`taxable_token`, `taxable_user`).
**ProfileContext**: `{ currentProfile, profiles, fetchProfiles(), fetchProfile(id) }`.
**useApi**: `{ get, post, put, patch, del, upload, loading, error }`. Auto-logout on 401. Uses `response.text()` → `JSON.parse()`.
**API base**: `process.env.NEXT_PUBLIC_API_BASE_URL || '/api/proxy'` (proxied to `https://api.gettaxable.com/api/`).

## Key Dependencies

Next.js 16.1, React 19.2, TypeScript strict. shadcn v4 (base-nova). GSAP 3.15 + Lenis 1.3.
lucide-react + @mingcute/react (icons). sonner (toasts) + vaul (drawers).
date-fns 4.4 + react-day-picker 10.0. tailwind-merge 3.6 (in `cn()`). framer-motion 12.24.
