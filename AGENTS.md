# Taxable Dashboard — Agent Guide

Nigerian tax compliance SaaS (PIT, PAYE, CIT, VAT/WHT).  
Next.js 16 App Router, TypeScript strict, Tailwind CSS v4, React 19, React Compiler enabled.

## Commands

```bash
npm run dev            # Dev server (next dev --webpack). Turbopack crashes on Windows.
npm run build          # Production build
npx next build --webpack  # Fallback
npm run lint           # ESLint 9.x flat config — 0 errors required
npx tsc --noEmit       # TypeScript strict — 0 errors required
# Pre-commit: lint + tsc must pass. No test framework.
```

## CRITICAL — Git Rules

**NEVER** `git checkout --`, `git reset --hard`, `git clean -fd`. Fix corrupt files by hand.  
Allowed: `add`, `commit`, `push`, `status`, `diff`, `log`, `show`, `stash push/pop` (with permission).  
Commit only when explicitly asked. No destructive operations without confirmation.

## Architecture

```
src/
  app/               App Router pages + layout.tsx + globals.css
  screens/           Page-level screens (Auth/, Home/, Onboarding/, TaxFolders/)
  components/ui/     shadcn v4 base-nova (Input, Drawer, Table, Stepper, Accordion, etc., 22 components)
  components/        DashboardHeader/, ErrorBoundary/, OnboardingLayout/, RequireAuth/, SetupSidebar/
  contexts/          UserContext, ProfileContext, OnboardingContext
  hooks/             useApi.ts, useTaxableApi.ts
  lib/               taxable-api.ts, utils.ts (cn()), api-endpoints.ts
  types/             api.ts
```

Route pages in `src/app/<route>/page.tsx` are thin wrappers importing from `src/screens/`.  
Routes with `useSearchParams()` must be wrapped in `<Suspense>`.  
`@/` alias maps to `src/`. Never relative imports for project files.

## Style & Conventions

**Imports** (grouped by blank line): 1. React/Next.js, 2. Third-party, 3. `@/` aliases, 4. Relative.

**Components**: `'use client'` as line 1 of interactive files. `export function Name(...)` — never `function; export {}`. Default exports only for page wrappers. Never nest React components. `interface` for props, `type` for unions. Prefix prop interfaces with component name.

**Formatting**: Semicolons required. Single quotes for strings, double for JSX. Unused vars prefixed `_`.

**Error handling**: `console.error` with `instanceof Error` only — no `console.log`/`warn`. API: `response.text()` → `JSON.parse()` never `response.json()`. User errors via `toast.error()` from `sonner`. localStorage reads in try/catch with `{}` fallback.

**Hooks**: Explicit dependency arrays. Primitive values only. `startTransition` wrapping required for multiple `setState` in `useEffect`.

## React Compiler Workarounds

The React Compiler auto-memoizes aggressively. Key patterns that break:

**File uploads**: Never `<label><input hidden onChange>`. Use `<button onClick={() => ref.current?.click()}>` + `<input ref={ref} hidden>` with native `addEventListener('change', handler)` in `useEffect`. Always reset `e.target.value = ''`.

**GSAP**: `gsap.context(() => {...}, containerRef)` in `useLayoutEffect`. Check `prefers-reduced-motion` first.

**Lenis**: Guard with `window.__lenis` to prevent duplicate instances.

**Modals in Lenis**: `createPortal(..., document.body)` — Lenis `transform` breaks `position: fixed`.

## Design System

**Typography** (never `text-sm/base/lg/[Npx]`):
- `text-1` (12px) / `text-2` (13px) / `text-3` (15px) / `text-5` (19px) / `text-6` (21px) / `text-7+` (24px+)
- Headings: `tracking-[-0.02em] font-semibold`. Font: Archivo Variable.

**Colors**: `text-neutral-400` body, `text-neutral-800` headings. `bg-taxable-blue` (#003787) primary. `bg-white border border-neutral-100` secondary. `bg-neutral-50` containers. Never `gray-*`, never hardcoded hex. SVG: `stroke="currentColor"` + `className="text-neutral-*"`.

**Buttons**: Primary `h-12 text-3 font-semibold rounded-xl bg-taxable-blue text-white`. Secondary `h-12 text-3 font-semibold rounded-xl bg-white border border-neutral-100 text-neutral-800`. No hover/transition effects. Disabled: `bg-neutral-100 text-neutral-400`.

**Inputs**: shadcn `<Input>` always. `<select>` → `<SearchableSelect>`. Monetary: `fmtInput(setter)`.

**Tables**: Container `bg-white border border-neutral-50 rounded-2xl overflow-hidden`. Header `bg-neutral-50 px-6 py-4 font-medium text-neutral-400`. Data cells `px-6 py-4 font-medium text-neutral-600`. shadcn `<Table>` wraps in `overflow-x-auto`.

**Spacing**: Heading→subtext `mb-1`. Input blocks `space-y-10`. Sections `space-y-12`. Sidebar→content `gap-10`.

## View / Edit / Add Slide Animation

Two patterns. Three states: add (blank editable), view (disabled), edit (sliding right).

**Pattern A** (grid, preferred for drawers):
```tsx
<div className="grid grid-cols-1 overflow-hidden">
    <div className={`col-start-1 row-start-1 transition-transform duration-300 ease-in-out ${isEditing ? '-translate-x-full' : 'translate-x-0'}`}>
        {editId !== null && <Form disabled readOnlyStyle="bg-neutral-50 text-neutral-400" />}
    </div>
    <div className={`col-start-1 row-start-1 transition-transform duration-300 ease-in-out ${isEditing ? 'translate-x-0' : 'translate-x-full'}`}>
        {isEditing && <Form disabled={false} readOnlyStyle="" />}
    </div>
</div>
```

Footer: `editId !== null && !isEditing ? [Remove] [Edit] : editId !== null && isEditing ? [Cancel] [Save] : [Cancel] [Add]`.

## localStorage Patterns

Keys prefixed `taxable_` and scoped: `taxable_vat_${profileId}_${taxYear}`, `taxable_wht_deductions_${profileId}_${taxYear}`, `taxable_cit_data_${profileId}`, `taxable_pit_income_${profileId}`. One-time migration from unscoped keys using `migKey` flag.

```ts
// Lazy init + auto-save pattern:
const [v, setV] = useState(() => { try { return JSON.parse(localStorage.getItem(key)!) || []; } catch { return []; } });
useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [v]);
```

## Tax-Specific Patterns

**Stepper**: `goForward` marks current step complete. `goBack` does not. `Set<number>` for completed steps, serialized via `Array.from()`.

**PAYE bands** (2026): 0% (₦0–800k), 15% (₦800k–3M), 18% (₦3M–12M), 21% (₦12M–25M), 23% (₦25M–50M), 25% (₦50M+). Deductions: Pension 8%, NHF 2.5%, HMO 5%, Rent Relief 20% capped ₦500k.

**VAT**: 5-step stepper. Brought-forward credit from prev month's net. Due 21st of next month. Output VAT @ 7.5% auto. `taxable_vat_${profileId}_${taxYear}`.

**CIT**: 20% (≤₦25M) / 30% (>₦25M) + 4% Development Levy. 4-step stepper. Capital allowances 10/20/25%.

**WHT**: Rate pills [5%] [10%]. File upload required. `taxable_wht_deductions_${profileId}_${taxYear}`.

## Shared Components

`src/screens/TaxFolders/TaxFolderShared.tsx`: `SectionHeading`, `PrimaryButton`, `SecondaryButton`, `FormFieldRow`, `FormLabel`, `FilingSheet`.

## State Management

**UserContext**: `{ user, token, loading, isAuthenticated, login(), logout() }`. Token in `sessionStorage`.  
**ProfileContext**: `{ currentProfile, profiles, fetchProfiles(), fetchProfile(id) }`.  
**useApi**: `{ get, post, put, del, upload, loading, error }`. Auto-logout on 401.  
**API**: `response.text()` → `JSON.parse()`. Base URL: `process.env.NEXT_PUBLIC_API_BASE_URL || '/api/proxy'`.

## Key Dependencies

Next.js 16.1, React 19.2, TypeScript strict. shadcn v4 (base-nova). GSAP 3.15 + Lenis 1.3. lucide-react + @mingcute/react. sonner + vaul. date-fns 4.4 + react-day-picker 10.0. tailwind-merge (in `cn()`).
