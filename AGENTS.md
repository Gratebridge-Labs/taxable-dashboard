# Taxable Dashboard — Agent Guide

## Project Overview

Nigerian tax compliance SaaS (PIT, PAYE, CIT, VAT/WHT).
Next.js 16 App Router, TypeScript strict mode, Tailwind CSS v4 + React Compiler enabled.
Uses `--webpack` on Windows (Turbopack crashes with `0xc0000142` on PostCSS/lightningcss).

## Commands

```bash
npm run dev              # Dev server (next dev --webpack)
npm run build            # Production build
npm run lint             # ESLint (9.x, flat config in eslint.config.mjs)
npx tsc --noEmit         # TypeScript strict check — must pass with 0 errors
npx shadcn@latest add <component>  # Install shadcn v4 components
```

No test framework is configured. Pre-commit verification: `npm run lint && npx tsc --noEmit`.

## CRITICAL — Git Workflow Rules

### NEVER use `git checkout -- <file>` or `git checkout <path>`

This command **permanently discards all uncommitted changes** in the specified file with no way to recover. If a file becomes corrupted during editing (broken JSX, syntax errors, truncation), instead:

1. **Read the file and manually fix the corrupted section** — the file content is recoverable line by line
2. **Use `git diff` to see what changed** and reverse the broken edits by hand
3. **Ask the user how they want to proceed** before running any destructive git command
4. If absolutely necessary to reference the committed version, use `git show HEAD:<file>` to print it without modifying the working tree

**Allowed git commands:** `git add`, `git commit`, `git push`, `git status`, `git diff`, `git log`, `git show`, `git stash push` (with user permission), `git stash pop` (with user permission). **Never** `git checkout --`, `git reset --hard`, `git clean -fd`.

## Architecture

```
src/app/           App Router pages + root layout.tsx
                    (layout wraps: ErrorBoundary → Toaster → ToastProvider → UserProvider → ProfileProvider)
src/screens/       Page-level screen components (Auth/, Onboarding/, TaxFolders/)
src/components/    Shared UI (ui/ = shadcn + custom, OnboardingLayout, Toast, SetupSidebar, DashboardHeader)
src/contexts/      React Contexts (UserContext, ProfileContext, OnboardingContext)
src/hooks/         useApi (generic HTTP with AbortController), useTaxableApi (typed API wrappers)
src/lib/           taxable-api.ts, api-endpoints.ts, utils.ts (cn() = clsx + twMerge)
src/types/         API TypeScript types/interfaces
```

### Key routing patterns
- Route pages in `src/app/<route>/page.tsx` are thin wrappers that import and render a screen from `src/screens/`
- Routes with `useSearchParams()` must be wrapped in `<Suspense>` (Next.js 16 static bail-out)
- Screens that need auth protection wrap their export in `<RequireAuth>` from `@/components/RequireAuth/RequireAuth`
- Root `/` reads `UserContext.isAuthenticated` and dispatches to `/home` or `/signin` via `router.replace()`

## Code Style Guidelines

### General Rules
- `'use client'` on line 1 of every interactive component. Utility/data files must NOT have it.
- All exports must be placed at the statement level (`export function ...` not `function ...; export { ... }`).
- Never define a React component inside another component. Extract to file-scope or a separate file.
- Prefix unused variables/parameters with `_` (e.g., `const _unused = someValue;`).
- Single quotes for all JS/TS strings. Semicolons required.
- No `console.log` or `console.warn` in production code. `console.error` with `err instanceof Error` narrowing is acceptable.

### File Recovery (when edits break a file)
- **NEVER use `git checkout -- <file>`** — this permanently discards ALL uncommitted changes in the file
- Instead, read the file, identify the specific malformed section, and fix it with targeted edits
- If the file is truncated or corrupted from a bad edit, restore only the corrupted lines by reading the surrounding context and reconstructing the missing parts
- Use `git diff HEAD -- <file>` to see what changed and manually revert only the broken portions

### Error Handling
```ts
catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong';
    console.error('[ComponentName] Failed to X:', message);
    setError(message);
}
```
- Always narrow `catch (err: unknown)` with `instanceof Error`. Never use `any`.
- API error responses are parsed in `handleResponse()` in `taxable-api.ts`. The `useApi` hook catches and re-throws.
- Show errors to users via `apiError` state rendered as `<p className="text-2 text-red-500 font-medium">`.
- For toast notifications, use `toast.success()` / `toast.error()` from `sonner` (not custom modals).
- JSON parse errors from API responses: read `response.text()` first, then `JSON.parse()`, not `response.json()`.

### Imports (order, separated by blank lines)
1. React / Next.js (`'react'`, `'next/link'`, `'next/navigation'`, `'next/image'`)
2. Third-party (`'lucide-react'`, `'sonner'`, `'gsap'`, `'lenis'`, `'vaul'`, `'framer-motion'`)
3. Local (`@/components/...`, `@/hooks/...`, `@/contexts/...`, `@/lib/...`, `@/types/...`)
4. Relative (`'./...'`, `'../...'`)

`@/` alias maps to `src/`. Paths must use the `@/` alias for project imports.

### Types & Interfaces
- Use `interface` for object shapes (props, context types, API responses). Use `type` for unions, mapped types, and utility types.
- Prefix component prop types with the component name: `SignInProps`, `TaxFolderCardProps`.
- All API response types live in `src/types/api.ts`. Import via `@/types/api`.
- Use `Record<K, V>` for dictionaries. Avoid `object` and `{}` as types.

### React Patterns
- `useState` for component-local state. `useCallback` for any function passed as a prop or used in a dependency array.
- `useRef` for DOM refs and for mutable values that shouldn't trigger re-renders (e.g., `hasAnimated` guards for GSAP).
- Effects (`useEffect`, `useLayoutEffect`) must have explicit dependency arrays. Shallow-comparison primitives only; never put objects/arrays in deps.
- GSAP animations: always use `gsap.context()` scoped to a ref, with `gsap.fromTo()` (not `from()`), inside `useLayoutEffect` (not `useEffect`) to prevent React 19 StrictMode double-mount flash. Always respect `prefers-reduced-motion`.
- Use `startTransition` when calling multiple `setState` calls synchronously inside a `useEffect` to prevent cascading re-render warnings.

## Design System

### Typography
- **Body / subtext**: `text-2` (13px), `font-medium`, `text-neutral-400`
- **Action links**: `text-neutral-800`, `font-semibold`
- **Headings**: `text-7` (28px) / `text-6` (21px) / `text-5` (19px), `tracking-[-0.02em]`, `font-semibold`
- **Input labels**: `text-2 font-medium`, `tracking-[-0.01em]` via shadcn `<Label>`
- **Root**: `html { font-size: 15px }` — all `rem` values scale from 15px base
- **Font**: Archivo Variable Font (`/public/Archivo/Archivo-VariableFont_wdth,wght.ttf`)
- NEVER use `text-sm`, `text-xs`, `text-base`, `text-lg`, `text-[Npx]` — use `text-1` through `text-15` defined in `globals.css`
- Sidebar text: `text-2` (13px) for all sidebar items and sub-items

### Colors
- Body text: `text-neutral-400` (#a3a3a3)
- Strong text / headings: `text-neutral-800` (#262626)
- Titles / active labels: `text-taxable-dark` (#0C0C0E)
- Primary action: `bg-taxable-blue` (#003787)
- Disabled / muted: `bg-neutral-100` / `text-neutral-400`
- Container backgrounds: `bg-neutral-50` (color50)
- Error: `text-red-500`
- **Never use `gray-*`** — always `neutral-*`. Never hardcoded hex colors. SVG stroke colors should use `stroke="currentColor"` with `className="text-neutral-*"`.

### Buttons
```html
<button className="h-12 px-4 bg-taxable-blue text-white font-semibold rounded-xl disabled:bg-neutral-100 disabled:text-neutral-400">
    {isLoading ? <Spinner /> : label}
</button>
```
- Height: `h-12` (48px). Text: `text-3 font-semibold`. Radius: `rounded-xl`.
- **No hover effects** — no `hover:*`, `group-hover:`, `transition-*`. Removed entirely from the design.
- Disabled: `disabled:bg-neutral-100 disabled:text-neutral-400`
- Loading: `<Spinner />` replaces button text while keeping the button visually active.
- Secondary buttons: same spec but `bg-white border border-neutral-100 text-taxable-dark`.

### Inputs & Selects
- Always use shadcn `<Input>` (`@/components/ui/input`). Never raw `<input>` elements.
- Focus style: `focus-visible:ring-1 focus-visible:ring-neutral-800` (built into the shadcn component).
- Error: `aria-invalid:border-destructive` — pass `aria-invalid` prop to the component.
- Read-only/disabled inputs: use `disabled` prop with `bg-neutral-50 text-neutral-300` classes.
- Custom `<select>` elements: use `<SearchableSelect>` from `@/components/ui/searchable-select` with `w-[150px]` for inline forms.
- FormFieldRow layout: `className="justify-between"` with label on left, input on right.

### Spacing
| Adjacent | Value | Class |
|---|---|---|
| Heading → Subtext | 4px | `mb-1` |
| Label → Input | 4px | `gap-1` |
| Input block → CTA | 40px | `space-y-10` |
| Section → Section (form) | 56px | `space-y-14` |
| Sidebar → Content | 40px | `gap-10` |
| Heading → First form field | 32px | `mt-8` |

## State Management

### UserContext (`src/contexts/UserContext.tsx`)
- Provides: `user`, `token`, `loading`, `isAuthenticated`, `login()`, `logout()`
- Token + user stored in `sessionStorage` (tab-scoped — closing tab logs out).
- On mount, reads stored token, calls `refreshUser()` (GET `/auth/me`). On 401, automatically clears auth state.
- Downstream consumers should check `useUser().loading` before using `isAuthenticated`.

### useApi (`src/hooks/useApi.ts`)
- Generic HTTP hook. Returns `{ get, post, put, patch, del, upload, loading, error }`.
- On 401, automatically calls `logout()` and redirects to `/signin`.
- Auth screens pass `{ useToken: false }` option (no Authorization header).
- API base URL: `/api/proxy` (rewritten by `next.config.ts` to `https://api.gettaxable.com/api/:path*`).

### useTaxableApi (`src/hooks/useTaxableApi.ts`)
- Typed API wrapper for domain operations (createProfile, completeProfile, getProfileList, deleteProfile, etc.).
- Reads `token` from `UserContext`. Sends `Authorization: Bearer {token}` header automatically.
- The `handleResponse` method reads `response.text()` first, then `JSON.parse()` to handle non-JSON error responses gracefully.

## Local Development

### API Proxy
`next.config.ts` rewrites `/api/proxy/:path*` → `https://api.gettaxable.com/api/:path*`.
All API calls use relative `/api/proxy/...` URLs, eliminating CORS issues. Restart the dev server after changing `next.config.ts`.

### Lenis Smooth Scroll
Used on auth screens (`OnboardingLayout.tsx`) and the home screen (`Home.tsx`) and business tax pages (`BusinessTaxDetails.tsx`).
The `useFormEntrance` hook uses `useLayoutEffect` + `gsap.fromTo()` for entrance animations, guarded by `prefers-reduced-motion`.

## Verification
- `npm run lint` — 0 errors required. Pre-existing warnings allowed for `react-hooks/exhaustive-deps` and `@next/next/no-img-element`.
- `npx tsc --noEmit` — 0 errors required (TypeScript strict mode).
- ESLint config in `eslint.config.mjs`: `react/no-unescaped-entities` is disabled (apostrophes allowed). Unused vars with `_` prefix are allowed.
- Pre-commit: always run both commands.

## Key Dependencies
- **shadcn (v4 base-nova)**: `Input`, `Label`, `Button`, `InputGroup*`, `Toaster`, `Drawer`, `RadioGroup`, `Checkbox`, `Badge`, `Skeleton`, `Select`, `Switch`, `Popover`, `Calendar`
- **sonner**: toast notifications (`toast.success()`, `toast.error()`)
- **lucide-react**: icons (`Eye`, `EyeOff`, `Info`, `AlertTriangle`, `LoaderIcon`, `ChevronDown`)
- **gsap** + **lenis**: entrance animations + smooth scrolling
- **framer-motion**: component micro-animations
- **vaul**: drawer primitive (used by shadcn `Drawer`)
- **base-ui**: Base UI React v1.x (used by shadcn v4 components)
- **mingcute_icon**: alternative icon set
- **date-fns**: date formatting (used with Calendar + Popover)
- **react-day-picker**: calendar component for date pickers

## File Organization Conventions
- `src/app/<route>/page.tsx` — route wrapper (thin, just imports and renders the screen)
- `src/screens/<Area>/<Screen>.tsx` — the actual UI and logic
- `src/screens/<Area>/Component.tsx` — extracted sub-components for that screen area
- `src/screens/<Area>/AreaSummary.md` — documentation file for the area (after refactoring passes)
- `src/components/ui/<name>.tsx` — shadcn components (installed via CLI) + custom shared UI (e.g., `searchable-select.tsx`)
- `src/contexts/<Name>Context.tsx` — React contexts
- `src/hooks/use<Name>.ts` — custom hooks
- `src/lib/` — utilities, API endpoints, type helpers
- `src/types/api.ts` — all shared API interfaces
