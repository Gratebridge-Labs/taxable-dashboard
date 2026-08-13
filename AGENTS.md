# Taxable — Agent Guide

Nigerian tax compliance SaaS. Two repos, sibling directories:

```
Taxable/
  taxable-dashboard/   Next.js 16 frontend (this repo — see AGENTS.md here)
  taxable-backend/     Node/Express + Mongoose API (jest tests)
```

## Commands

### Frontend (`taxable-dashboard`) — Next.js 16, TS strict, Tailwind v4, React 19, React Compiler

```bash
npm run dev              # Dev server (next dev --webpack). Turbopack crashes on Windows.
npm run build            # Production build (prerenders all routes; must pass)
npx next build --webpack # Fallback if build fails
npm run lint             # ESLint 9 flat config — 0 errors required (9.0.3)
npx tsc --noEmit         # TypeScript strict — 0 errors required
npx eslint <file>        # Lint a single file
npx tsc --noEmit         # Whole-project typecheck (no incremental)
```

**No test framework** in the frontend. Pre-commit gate: `npm run lint` AND `npx tsc --noEmit` both zero errors.

### Backend (`taxable-backend`) — Express + Mongoose, jest tests

```bash
npm install && cp .env.example .env   # needs MONGODB_URI + JWT_SECRET (not in repo)
npm run dev              # nodemon server.js
npm start                # production
npm test                 # run all jest tests (tests/*.test.js)
npx jest tests/whatsapp/simple.test.js        # run a single test file
npx jest -t "profile create" tests/...        # run one test by name
node --check server.js   # syntax-check a file without running
```

Backend env vars live in **Vercel** for production — never commit secrets; `.env` is gitignored.

## CRITICAL — Git Rules

**NEVER** `git checkout --`, `git reset --hard`, `git clean -fd`. Fix corrupt files by hand.
Allowed: `add`, `commit`, `push`, `status`, `diff`, `log`, `show`, `stash push/pop` (with permission).
Commit only when explicitly asked. Confirm before any destructive op or force-push.
On `git merge`, resolve conflicts by combining both sides; keep our design, fold in additive backend work. Do not use `git checkout -- <file>` to revert a merge conflict — edit by hand.

## Architecture (`taxable-dashboard/src`)

```
app/               App Router pages (thin wrappers) + layout.tsx + globals.css
screens/           Auth/, Home/, TaxFolders/ (PIT, Business, PAYE, VAT, WHT, CIT)
components/ui/     shadcn v4 base-nova (Input, Drawer, Table, Select, Checkbox, Stepper, Accordion)
components/        DashboardHeader/, OnboardingLayout/, SetupSidebar/, RequireAuth/, ErrorBoundary/
contexts/          UserContext, ProfileContext
hooks/             useApi.ts, useTaxableApi.ts
lib/               taxable-api.ts, utils.ts (cn()), api-endpoints.ts, nigeria-locations.ts,
                   file-upload.ts, profile-status.ts, paye-mappers.ts
types/             api.ts
screens/TaxFolders/  TaxFolderShared.tsx (shared buttons/labels), PITShared.ts (MONTHS/constants)
```

- `@/` maps to `src/` — never relative imports for project files.
- Route pages in `src/app/<route>/page.tsx` import from `src/screens/`. Routes using `useSearchParams()` must be wrapped in `<Suspense>`.
- `AGENTS.md` here; a `taxable-backend/AGENTS.md` may exist — mirror this structure.

## File & Component Naming

- **Components**: `PascalCase.tsx`, file name = exported function name.
- **Route pages**: `page.tsx` inside `src/app/<route>/`.
- **Hooks**: `camelCase.ts` prefixed `use`. **Contexts**: `PascalCaseContext.tsx` → `PascalCaseProvider` + `usePascalCase`.
- **Shared screen components**: colocate in `src/screens/<Domain>/<Domain>Shared.tsx`.
- **Utility/lib**: `camelCase.ts`. **Types**: `api.ts` barrel (no `export type {}` barrels).

## Imports

Grouped by blank line: (1) React/Next (`react`, `next/*`), (2) third-party (`gsap`, `sonner`, `lucide-react`, `@mingcute/react`, `date-fns`, `vaul`, `framer-motion`), (3) `@/` aliases, (4) relative (`./TaxFolderShared`, `../lib`).

## Component Conventions

- `'use client'` as line 1 of every interactive file.
- Named exports only — `export function Name(...)`; **default export only for `src/app/**/page.tsx`**.
- Never nest component definitions inside other components.
- Props: `interface XProps`. Type unions/aliases: `type X = 'a' | 'b'`.
- Explicit dependency arrays on every `useCallback`/`useEffect`/`useMemo`. Only primitives in deps.

## Formatting

- Semicolons required. Single quotes for JS/TS strings; double quotes for JSX attributes.
- Unused variables prefixed `_` (`_loading`). No trailing commas in fn signatures or types. Break lines ~100 chars.

## Error Handling

```tsx
// Only console.error, never console.log/warn
catch (err: unknown) {
  console.error('Context:', err instanceof Error ? err.message : 'Unknown error');
}
// API responses: response.text() → JSON.parse(); never response.json()
const text = await response.text();
const data = JSON.parse(text);
// User-facing errors → sonner toast
toast.error('Failed to save. Please try again.');
// localStorage — always try/catch, no throw
try { const stored = JSON.parse(localStorage.getItem(key)!); } catch { return []; }
// useApi auto-throws ApiError on non-2xx, auto-logout on 401
const { get, post, put, del, upload, loading, error } = useApi();
```

## React Compiler Workarounds

React Compiler auto-memoizes aggressively — these break:

**File uploads**: Never `<label><input hidden onChange>`. Use `<button onClick={() => ref.current?.click()}>` + `<input ref={ref} hidden>` with native `addEventListener('change', handler)` in `useEffect`; always reset `e.target.value = ''`. Use `prepareUploadFile(file)` from `@/lib/file-upload` (4MB `validateFileSize` cap + image `compressImage`). Pass `uploadId` in the query string for `uploadFile` — the backend `resolveUploadForUpload` reads it before multer parses the multipart body.

**GSAP**: `gsap.context(() => {...}, containerRef)` in `useLayoutEffect`, check `prefers-reduced-motion`, use `data-animate` for reveals; re-trigger on section change via `useEffect([activeSection])`.

**Lenis**: guard `if (window.__lenis) return`. **Modals in Lenis**: `createPortal(..., document.body)` — Lenis `transform` breaks `position: fixed`.

**Drawer selects**: base-ui `Select` inside a vaul `Drawer` may fail to open (transform); prefer `shouldScaleBackground={false}` or a native control.

## Design System

**Typography** (never `text-sm`/`text-base`/`text-lg`/arbitrary `[Npx]` — except shared `Input` which uses `text-sm`):
- Scale: `text-0`(10px) → `text-1`(12px) → `text-2`(13px) → `text-3`(15px) → `text-5`(19px) → `text-6`(21px) → `text-7`(24px+).
- Fonts (local, next/font/local): Archivo (`--font-archivo`, body) + Merriweather (`--font-merriweather`, headings).
- Headers: `text-5 font-medium text-neutral-800 tracking-[-0.02em] font-[family-name:var(--font-merriweather)]`.
- Sizes: page headers `text-5`, section headings `text-3`, body `text-1`/`text-2`, buttons `text-2`.

**Colors**: body `text-neutral-400/500/600/700`; headings `text-neutral-800`; primary `bg-taxable-blue` (#003787); secondary `bg-white border border-neutral-100`; containers `bg-neutral-50`. Never `gray-*` or hardcoded hex. Icons `stroke="currentColor"`.

**Buttons**: Primary `h-12 text-2 font-semibold rounded-xl bg-taxable-blue text-white disabled:bg-neutral-100 disabled:text-neutral-400`; compact CTA `h-10 px-5`; Secondary `h-12 text-2 font-semibold rounded-xl bg-white border border-neutral-100 text-neutral-800`. **No hover/transition on buttons.**

**Layout**: header + main both `max-w-[1280px] mx-auto px-6 md:px-12`. Tax-form content columns `max-w-[500px]`.

**Cards (PIT income/deduction style)**: `bg-neutral-50 rounded-3xl p-5`, header `text-3 font-semibold`, rows `FormFieldRow justify-between` — label + `FormLabel tip` (tooltip) left, `Input placeholder="₦ 0.00"` right.

**Inputs**: always shadcn `<Input>`; monetary fields `fmtInput(setter)`; `<select>` → `SearchableSelect`; location selects via `@/lib/nigeria-locations` (`NIGERIA_STATES`, `getCitiesForState`, `getLgasForState`) — filter by state, clear city/LGA on state change.

**Spacing**: heading→subtext `mb-1`; input blocks `space-y-10`; sections `space-y-12`; sidebar→content `gap-10`.

## Shared Components (`screens/TaxFolders/TaxFolderShared.tsx`)

`PrimaryButton`, `PrimaryButtonSm`, `SecondaryButton`, `SecondaryButtonSm`, `SectionHeading`, `DescriptionText`, `FormLabel` (label + `InfoTooltip`), `FormFieldRow`, `SidebarItem` (folder icon, active/completed/locked states), `FilingSheet` ("How do you want to file?" drawer).

## Tax-Specific Patterns

**PAYE bands** (2026, band WIDTHS): 0% (₦0–800k), 15% (next 2.2M), 18% (next 9M), 21% (next 13M), 25M→23%, 50M+→25%. Loop must use `band.limit - prevLimit` (or widths) — cumulative-caps-as-widths over-taxes. Deductions monthly: Pension 8%, NHF 2.5%, HMO 5%, Rent Relief 20% of annual capped ₦500k ÷ 12.

**Stepper**: `goForward` marks step complete; `goBack` doesn't. Use `Set<number>` + `Array.from()`.

**VAT**: 5-step stepper; output @ 7.5%; brought-forward credit from prev month's net; due 21st of next month.

**CIT**: 20% (≤₦25M) / 30% (>₦25M) + 4% Development Levy (× 1.04). 4-step stepper; capital allowances 10/20/25%; quarterly installments prepay, annual reconciles via `finalPosition = obligation − WHT credits − quarterly paid`.

**WHT**: rate pills [5%] [10%]; receipt upload required (real upload, not name-only).

## State & Navigation Patterns

- **WHT/VAT step + active month** are **lifted to the parent** (`BusinessTaxDetails`) so section switches preserve progress — pass down as props.
- **Multiple folders per year/type** are allowed (index is non-unique); home cards get a `(n)` suffix for duplicates.
- **Business CIT sub-section** (quarterly vs annual) is parent state, synced to the `payQuarterly` flag.
- **Locked sections** (e.g. Income & Deductions before Personal Info saved): sidebar `locked` prop + onClick guard + a safety `useEffect` forcing `activeSection` back.
- **Save buttons** persist to `localStorage` with a toast; `Save & File` opens `FilingSheet`.
- View/Edit/Add slide animation: grid-based overlap with `translate-x` (`col-start-1 row-start-1`), as in AGENTS.md patterns.

## State Management

**UserContext**: `{ user, token, loading, isAuthenticated, login, logout, setUser, refreshUser }`. Token in `sessionStorage` (`taxable_token`, `taxable_user`).
**ProfileContext**: `{ currentProfile, profiles, fetchProfiles, fetchProfile }`. `getProfileStatusLabel` (lib/profile-status.ts) → In Progress / In Review / Ready to File / Filed + enabled business types.
**useApi**: `{ get, post, put, patch, del, upload, loading, error }`, `response.text()`→`JSON.parse()`, auto-logout on 401.
**API base**: `process.env.NEXT_PUBLIC_API_BASE_URL || '/api/proxy'` (proxied to `https://api.gettaxable.com/api/`).

## Key Dependencies

Next.js 16.1, React 19.2, TypeScript strict, shadcn v4 (base-nova), Tailwind v4. GSAP 3.15 + Lenis 1.3. lucide-react + @mingcute/react. sonner + vaul. date-fns 4.4 + react-day-picker 10.0. tailwind-merge (in `cn()`). framer-motion 12.24. Fonts: Archivo + Merriweather (local).
