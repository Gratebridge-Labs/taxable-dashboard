# Taxable Dashboard — Agent Guide

## Project Overview

Nigerian tax compliance SaaS (PIT, PAYE, CIT, VAT/WHT).  
Next.js 16 App Router, TypeScript strict, Tailwind CSS v4, React 19, React Compiler enabled.  
Uses `--webpack` on Windows (Turbopack crashes).  
`client` directive on every interactive component. Semicolons required. Single quotes.  
Expressive components over concise — prefer readable, self-documenting code.

## Commands

```bash
npm run dev            # Dev server (next dev --webpack)
npm run build          # Production build
npx next build --webpack  # Alternative if npm run build fails
npm run lint           # ESLint 9.x flat config — must pass 0 errors
npx tsc --noEmit       # TypeScript strict check — must pass 0 errors
# Pre-commit: both lint && tsc must pass. No test framework configured.
```

## CRITICAL — Git Rules

**NEVER** `git checkout --`, `git reset --hard`, `git clean -fd`.  
If a file is corrupted, fix it by hand or ask the user.  
Allowed: `git add`, `commit`, `push`, `status`, `diff`, `log`, `show`, `stash push/pop` (with permission).  
Always ask before destructive operations. Commit only when explicitly asked.

## Architecture

```
src/
  app/               App Router pages + root layout.tsx
  screens/           Page-level screens (Auth/, Home/, Onboarding/, TaxFolders/)
  components/ui/     shadcn v4 base-nova components (Input, Checkbox, Badge, Drawer, Table, Stepper, Accordion, etc.)
  contexts/          UserContext, ProfileContext, OnboardingContext
  hooks/             useApi, useTaxableApi
  lib/               taxable-api.ts, utils.ts (cn() = clsx + twMerge)
  types/             api.ts
```

Route pages in `src/app/<route>/page.tsx` are thin wrappers importing from `src/screens/`.  
Routes with `useSearchParams()` must be wrapped in `<Suspense>`.  
Screens needing auth wrap with `<RequireAuth>`.  
`@/` alias maps to `src/`. Never relative imports for project files.

## Code Style

### Imports (grouped by newline)
1. React / Next.js (`'react'`, `'next/navigation'`, `'next/image'`)
2. Third-party (`'lucide-react'`, `'sonner'`, `'gsap'`, `'lenis'`, `'date-fns'`, `'@mingcute/react'`, `'framer-motion'`)
3. Local `@/` (`@/components/...`, `@/hooks/...`, `@/contexts/...`)
4. Relative (`./...`, `../...`)

### General
- `'use client'` as line 1 of every interactive component. Utility files must NOT have it.
- `export function` at statement level — never `function...; export {...}`.
- Never nest React components. Extract to file scope.
- Prefix unused vars with `_`. No `console.log`/`warn`. `console.error` with `instanceof Error`.
- Hooks need explicit dependency arrays. Primitive values only — never objects/arrays.

### Types
- `interface` for object shapes (props, form state). `type` for unions and utilities.
- Prefix prop interfaces with component name: `ButtonProps`, `SignInProps`.
- Prefer `Record<K, V>` over `object` or `{}`.

### Error Handling
```ts
catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Something went wrong';
    console.error('[Component] message:', msg);
    setError(msg);
}
```
- `response.text()` then `JSON.parse()` — never `response.json()` (server errors return non-JSON).
- Toast via `toast.success()` / `toast.error()` from `sonner`.

### React Compiler Workarounds
- File uploads: use `<button onClick={() => ref.current?.click()}>` + `<input ref={ref} hidden>` — the React Compiler breaks `onChange` on hidden file inputs inside `<label>`.
- Multiple `setState` inside `useEffect`: wrap in `startTransition(() => {...})`.
- GSAP: `gsap.context(() => {...}, containerRef)` + `gsap.fromTo()` inside `useLayoutEffect` — prevents StrictMode double-mount flash.
- Lenis: check `window.matchMedia('(prefers-reduced-motion: reduce)')` + `window.__lenis` guard before creating `new Lenis()`.

## Design System

### Typography (15px base in globals.css)

| Class | Px | Use |
|---|---|---|
| `text-1` | 12px | Labels, badges, sidebar captions |
| `text-2` | 13px | **Body, sidebar items, input labels** |
| `text-3` | 15px | Button text, body paragraphs |
| `text-4` | 17px | — |
| `text-5` | 19px | **Section headings, card titles** |
| `text-6` | 21px | **Modal titles, sub-page headings** |
| `text-7`–`text-15` | 24px+ | Page titles, display |

Never `text-sm`, `text-base`, `text-lg`, `text-[Npx]`. Always use the scale.  
Headings: `tracking-[-0.02em] font-semibold`. Input labels: `text-2 font-medium`. Tooltips: `text-1`.  
Font: Archivo Variable (`/public/Archivo/...`).

### Colors
- **Text**: `text-neutral-400` (#a3a3a3) for body. `text-neutral-800` (#262626) for headings.
- **Actions**: `bg-taxable-blue` (#003787) primary. `bg-white border border-neutral-100` secondary.
- **Containers**: `bg-neutral-50` (color50). Cards: `bg-white border border-neutral-200 rounded-2xl`.
- **Disabled**: `bg-neutral-100 text-neutral-400`.
- **Info icons**: `InformationFill` from `@mingcute/react` with `color="#E5E5E5"`.
- **Never** `gray-*`. Never hardcoded hex. SVG strokes: `stroke="currentColor"` + `className="text-neutral-*"`.

### Buttons
- **Primary**: `h-12 text-3 font-semibold rounded-xl bg-taxable-blue text-white`
- **Secondary**: `h-12 text-3 font-semibold rounded-xl bg-white border border-neutral-100 text-neutral-800`
- **PrimarySm**: `h-9 text-2 font-semibold rounded-lg bg-taxable-blue text-white`
- **SecondarySm**: `h-9 text-2 font-semibold rounded-lg bg-white border border-neutral-200 text-neutral-800`
- **No hover/transition effects** on buttons. Disabled: `disabled:bg-neutral-100 disabled:text-neutral-400`.
- Loading: `<Spinner />` replaces text.

### Inputs & Selects
- Always shadcn `<Input>`. Never raw `<input>`. Read-only via `disabled` prop.
- `<select>` → `<SearchableSelect>` with `options: string[]`, `value`, `onChange`, `placeholder`.
- `<FormFieldRow className="justify-between">` + `<FormLabel tip="...">` on left, input on right.

### Tables
- Container: `bg-white border border-neutral-50 rounded-2xl overflow-hidden`.
- Header row: `bg-neutral-50`. Header cells: `px-6 py-4 font-medium text-neutral-400`.
- Data cells: `px-6 py-4 font-medium text-neutral-600`. Clickable rows: `cursor-pointer`.

### Stepper (VAT, CIT Annual Returns)
```ts
const [annualStep, setAnnualStep] = useState<'a' | 'b'>('a');
const [completed, setCompleted] = useState<Set<number>>(new Set());
const goForward = (t) => { setCompleted(p => new Set([...p, stepNum[annualStep]])); setAnnualStep(t); };
const goBack = (t) => setAnnualStep(t);
```
`goForward` marks current step completed. `goBack` does not. Past completed steps are clickable.

### localStorage Persistence
```ts
// Lazy init + auto-save
const [v, setV] = useState(() => { try { return localStorage.getItem('k') || ''; } catch { return ''; } });
useEffect(() => { try { localStorage.setItem('k', v); } catch {} }, [v]);
// For complex state: JSON.stringify with startTransition on restore
```

### Drawer Slide Animation (View/Edit toggle)
```tsx
<div className="relative overflow-hidden">
  <div className={`transition-transform duration-300 ease-in-out ${isEditing ? '-translate-x-full' : 'translate-x-0'}`}>
    {editId !== null && <Form disabled />}
  </div>
  <div className={`absolute inset-0 ... ${isEditing ? 'translate-x-0' : 'translate-x-full'}`}>
    {isEditing && <Form />}
  </div>
  {editId === null && <Form />}
</div>
```

### Spacing
| Context | Class |
|---|---|
| Heading → subtext | `mb-1` |
| Input → next block | `space-y-10` |
| Section → section | `space-y-12` or `mb-14` |
| Sidebar → content | `gap-10` |
| Summary rows | `space-y-3` or `space-y-4` |

## Tax-Specific Patterns

### PAYE (`BusinessPAYEContent.tsx`)
- `calculateAnnualPAYE(staff)` uses 2026 progressive bands: 0% (₦0–800k), 15% (₦800k–3M), 18% (₦3M–12M), 21% (₦12M–25M), 23% (₦25M–50M), 25% (₦50M+).
- Deductions: Pension (8%), NHF (2.5%), HMO (5%), Rent Relief (20% of annual rent, capped at ₦500k).
- Monthly tax = annual tax ÷ 12.

### VAT (`BusinessVAT.tsx`)
- 5-step stepper: Data Source → Output VAT → Input VAT → Adjustments → Review.
- Monthly-only filing (periodMode removed). Cash-basis banner dismissible.
- Output VAT @ 7.5% auto-calculated. Brought-forward credit from previous month.
- localStorage: `monthData`, `filedMonths`, `activeMonth`.

### WHT (`BusinessWHT.tsx`)
- Method selector → drawer → table flow (PAYE-style).
- WHT rate pills [5%] [10%] instead of dropdown. File upload required for save.
- localStorage: `taxable_wht_deductions`, `taxable_wht_filed`, `taxable_wht_month`.
- View/edit drawer with horizontal slide animation. Table: Vendor name, Tax ID, Payment category, Gross, WHT rate, Amount to withhold, Receipt.

### CIT — Quarterly (`BusinessCIT.tsx`)
- Pay Q1–Q4 installments via FilingSheet. Table: Quarter, Due Date, Amount, Status (Paid/Pending/Deferred/Covered/Upcoming).
- Summary: Revenue, Profit margin, Estimated CIT (bracket 20% or 30%), Per quarter, Total paid, Remaining.
- "Edit Estimates" drawer syncs changes back to Company Information via callbacks.
- Paid quarters locked. "Deferred" postpones to year-end. Defer modal uses `createPortal` for backdrop fix.

### CIT — Annual Return (`BusinessCIT.tsx`)
- 4-step stepper: Financial Inputs → Tax Adjustments → WHT Credits → Review.
- Step 1: Revenue, COGS, OPEX (single-column FormFieldRow) + mandatory audited financials upload + optional trial balance.
- Step 2: Non-deductible expenses (Government fines, Accounting depreciation, General provisions) + Capital Allowances (Class 1/2/3 at 10/20/25%) + Adjusted Taxable Profit.
- Step 3: WHT credit notes via method selector → drawer → table (Payer name, TIN, Credit ref, Gross, Withheld amount + mandatory certificate upload).
- Step 4: Reconciliation matrix (4 cards), accordion data checklist (Accounting baseline, Legal adjustments, Prepaid taxes), legal declaration (2 checkboxes), dynamic CTA (shortfall/overpaid/zero).
- Derived calcs: `assessableProfit → baseCIT × bracketRate → developmentLevy (4%) → totalObligation − prepayments = finalPosition`.
- localStorage: `taxable_cit_data`, `taxable_cit_annual_filed`.

## Shared Components (`src/screens/TaxFolders/TaxFolderShared.tsx`)
- `SectionHeading`, `DescriptionText`, `PrimaryButton`, `SecondaryButton`, `PrimaryButtonSm`, `SecondaryButtonSm`
- `FilingSheet`, `FormFieldRow`, `FormLabel`

## State Management
- **UserContext**: `user`, `token`, `loading`, `isAuthenticated`, `login()`, `logout()`. Token in `sessionStorage`.
- **ProfileContext**: `profile`, `year`, `profileId`, `loading`, `switchProfile()`.
- **useApi**: `{ get, post, put, del, upload, loading, error }`. Auto-logout on 401.
- **useTaxableApi**: Typed wrappers for profile CRUD. Uses `handleResponse()` with `response.text()` → `JSON.parse()`.

## Key Dependencies
- **Next.js 16.1**, React 19.2, Typescript strict
- **shadcn v4 (base-nova)**: Input, Checkbox, Badge, Drawer, RadioGroup, Table, Stepper, Accordion, Select, Switch, Popover, Calendar
- **GSAP** + Lenis: animations + smooth scroll
- **lucide-react**: icons. **@mingcute/react**: `InformationFill` for tooltips
- **sonner**: toasts. **date-fns** + **react-day-picker**: date picker
- **tailwind-merge** (used by `cn()` utility). **vaul**: drawer primitive
