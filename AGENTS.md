# Taxable Dashboard — Agent Guide

## Project Overview

Nigerian tax compliance SaaS (PIT, PAYE, CIT, VAT/WHT).
Next.js 16 App Router, TypeScript strict mode, Tailwind CSS v4, React Compiler enabled (`reactCompiler: true` in `next.config.ts`).
Uses `--webpack` on Windows (Turbopack crashes with `0xc0000142` on PostCSS/lightningcss).

## Commands

```bash
npm run dev              # Dev server (next dev --webpack)
npm run build            # Production build
npx next build --webpack # Alternative build command if npm run build fails
npm run lint             # ESLint (9.x, flat config in eslint.config.mjs)
npx tsc --noEmit         # TypeScript strict check — must pass with 0 errors
npx shadcn@latest add <component>  # Install shadcn v4 components (e.g., accordion, attachment)
```

No test framework is configured. Pre-commit verification: `npm run lint && npx tsc --noEmit` — both must pass with 0 errors.

## CRITICAL — Git Workflow Rules

### NEVER use `git checkout -- <file>` or `git checkout <path>`

This command **permanently discards all uncommitted changes** in the specified file with no way to recover. If a file becomes corrupted during editing (broken JSX, syntax errors, truncation), instead:

1. **Read the file and manually fix the corrupted section** — the file content is recoverable line by line
2. **Use `git diff` to see what changed** and reverse the broken edits by hand
3. **Ask the user how they want to proceed** before running any destructive git command
4. If absolutely necessary to reference the committed version, use `git show HEAD:<file>` to print it without modifying the working tree (read-only command)

**Allowed git commands:** `git add`, `git commit`, `git push`, `git status`, `git diff`, `git log`, `git show`, `git stash push` (with user permission), `git stash pop` (with user permission). **Never** `git checkout --`, `git reset --hard`, `git clean -fd`.

## Architecture

```
src/
├── app/               App Router pages + root layout.tsx
│   ├── layout.tsx     (wraps: ErrorBoundary → Toaster → ToastProvider → UserProvider → ProfileProvider)
│   ├── page.tsx       Root — dispatches to /home or /signin based on auth
│   └── auth/          Auth pages (Signin, Signup, ForgotPassword)
├── screens/           Page-level screen components (Auth/, Home/, Onboarding/, TaxFolders/)
│   └── TaxFolders/    Business tax folder (CompanyInfo, PAYE, VAT/WHT, CIT, Review)
├── components/        Shared UI
│   └── ui/            shadcn v4 components (Input, Checkbox, Badge, Drawer, Table, Popover, etc.)
├── contexts/          React Contexts (UserContext, ProfileContext, OnboardingContext)
├── hooks/             useApi (generic HTTP with AbortController), useTaxableApi (typed API wrappers)
├── lib/               taxable-api.ts, api-endpoints.ts, utils.ts (cn() = clsx + twMerge)
└── types/             API TypeScript types/interfaces
```

### Routing patterns
- Route pages in `src/app/<route>/page.tsx` are thin wrappers that import and render a screen from `src/screens/`
- Routes with `useSearchParams()` must be wrapped in `<Suspense>` (Next.js 16 static bail-out)
- Screens needing auth protection wrap their export in `<RequireAuth>` from `@/components/RequireAuth`
- Root `/` reads `UserContext.isAuthenticated` and dispatches to `/home` or `/signin` via `router.replace()`

## Code Style Guidelines

### General Rules
- `'use client'` on line 1 of every interactive component. Utility/data files must NOT have it.
- All exports at the statement level: `export function ...` NOT `function ...; export { ... }`.
- Never define a React component inside another component. Extract to file-scope or separate file.
- Prefix unused variables/parameters with `_` (e.g., `const _unused = someValue; const [_state, _setState] = useState(...)`).
- Single quotes for all JS/TS strings. Semicolons required.
- No `console.log` or `console.warn`. `console.error` with `err instanceof Error` narrowing is acceptable.
- Files under 400 lines preferred. Extract large components into sibling files.

### Imports (order, separated by blank lines)
1. **React / Next.js**: `'react'`, `'next/link'`, `'next/navigation'`, `'next/image'`
2. **Third-party**: `'lucide-react'`, `'sonner'`, `'gsap'`, `'lenis'`, `'vaul'`, `'framer-motion'`, `'date-fns'`, `'@mingcute/react'`
3. **Local (`@/`)** : `@/components/...`, `@/hooks/...`, `@/contexts/...`, `@/lib/...`, `@/types/...`
4. **Relative**: `'./...'`, `'../...'`

`@/` alias maps to `src/`. Use `@/` for all project imports (never relative for project files).

### Types & Interfaces
- Use `interface` for object shapes (props, context types, form state). Use `type` for unions, mapped types, and utility types.
- Prefix component prop types with the component name: `SignInProps`, `TaxFolderCardProps`.
- API response types live in `src/types/api.ts` — import via `@/types/api`.
- Use `Record<K, V>` for dictionaries. Avoid `object` and `{}`.

### Error Handling
```ts
catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Something went wrong';
    console.error('[ComponentName] Failed to X:', message);
    setError(message);
}
```
- Always narrow `catch (err: unknown)` with `instanceof Error`. Never use `any`.
- API error responses parsed via `handleResponse()` in `taxable-api.ts`.
- Show errors via `apiError` state + `<p className="text-2 text-red-500 font-medium">`.
- Toast notifications: `toast.success()` / `toast.error()` from `sonner` — never custom modals for toasts.
- JSON parse from API: always `response.text()` then `JSON.parse()` — never `response.json()` directly (server errors return non-JSON).

### React Patterns
- `useState` for component-local state. `useCallback` for callbacks passed as props or used in dependency arrays.
- `useRef` for DOM refs and mutable values that shouldn't trigger re-renders.
- Hooks must have explicit dependency arrays. Primitive values only in deps — never objects/arrays.
- **GSAP**: Always use `gsap.context(() => {...}, containerRef)` scoped to a ref, with `gsap.fromTo()` (not `from()`), inside `useLayoutEffect` (not `useEffect`) — prevents React 19 StrictMode double-mount flash. Respect `prefers-reduced-motion` with early return + `gsap.set()`.
- **Lenis**: Check `window.matchMedia('(prefers-reduced-motion: reduce)')` before creating. Check for existing instance via `window.__lenis`. Clean up with `lenis.destroy()`.
- Use `startTransition` when calling multiple `setState` calls synchronously inside a `useEffect` to prevent cascading re-render warnings.

## Design System

### Typography — `text-1` through `text-15` scale (defined in `globals.css`)

| Class | rem | px | Typical use |
|---|---|---|---|
| `text-1` | 0.800rem | 12px | Labels, badges, sidebar captions |
| `text-2` | 0.867rem | 13px | **Body / subtext, sidebar items, input labels** |
| `text-3` | 1rem | 15px | Button text, body paragraphs |
| `text-4` | 1.133rem | 17px | — |
| `text-5` | 1.267rem | 19px | **Section headings, card titles** |
| `text-6` | 1.400rem | 21px | **Modal titles, sub-page headings** |
| `text-7` | 1.600rem | 24px | **Page titles** |
| `text-8` | 1.800rem | 27px | Large display |
| `text-9`–`text-15` | 2rem–3.333rem | 30px–50px | Hero/display |

**NEVER use** `text-sm`, `text-xs`, `text-base`, `text-lg`, `text-[Npx]`. Always use `text-1` through `text-15`.

- **Body / subtext**: `text-2`, `font-medium`, `text-neutral-400`
- **Action links**: `text-neutral-800`, `font-semibold`
- **Headings**: `text-7` / `text-6` / `text-5`, `tracking-[-0.02em]`, `font-semibold`
- **Input labels**: `text-2 font-medium`
- **Sidebar text**: `text-2` for all items and sub-items
- **Tooltip text**: `text-1`
- **Root**: `html { font-size: 15px }` — all rem values scale from 15px base
- **Font**: Archivo Variable Font (`/public/Archivo/Archivo-VariableFont_wdth,wght.ttf`)

### Colors
- Body text: `text-neutral-400` (#a3a3a3)
- Strong text / headings: `text-neutral-800` (#262626)
- Titles / active labels: `text-taxable-dark` (#0C0C0E)
- Primary action: `bg-taxable-blue` (#003787)
- Disabled / muted: `bg-neutral-100` / `text-neutral-400`
- Container backgrounds: `bg-neutral-50` (color50)
- Info tooltips: `InformationFill` from `@mingcute/react` with `color="#E5E5E5"`
- Error: `text-red-500`
- **Never `gray-*`** — always `neutral-*`. Never hardcoded hex. SVG strokes use `stroke="currentColor"` with `className="text-neutral-*"`.

### Buttons
- **Primary**: `h-12`, `text-3 font-semibold`, `rounded-xl`, `bg-taxable-blue text-white`
- **Secondary**: `h-12`, `text-3 font-semibold`, `rounded-xl`, `bg-white border border-neutral-100 text-taxable-dark`
- **PrimaryButtonSm**: `h-9`, `text-2 font-semibold`, `rounded-lg`, `bg-taxable-blue text-white`
- **SecondaryButtonSm**: `h-9`, `text-2 font-semibold`, `rounded-lg`, `bg-white border border-neutral-200 text-neutral-800`
- **No hover effects** — no `hover:*`, `group-hover:`, `transition-*`
- Disabled: `disabled:bg-neutral-100 disabled:text-neutral-400`
- Loading: `<Spinner />` replaces text while keeping button active

### Inputs & Selects
- Always use shadcn `<Input>` (`@/components/ui/input`). Never raw `<input>`.
- Read-only/disabled: `disabled` prop with default styling (handled by component).
- Custom `<select>`: use `<SearchableSelect>` from `@/components/ui/searchable-select` — accepts `options: string[]`, `value: string`, `onChange: (v) => void`, `placeholder`, `className`.
- `<FormFieldRow>`: `className="justify-between"` with `<FormLabel>` on left and input on right.
- `<FormLabel>`: built-in tooltip via `tip` prop. Icon uses `InformationFill` from mingcute.

### Spacing
| Adjacent | Class |
|---|---|
| Heading → Subtext | `mb-1` (4px) |
| Input block → Next block | `space-y-10` (40px) |
| Section → Section | `space-y-14` (56px) |
| Sidebar → Content | `gap-10` (40px) |
| Summary rows | `space-y-3` (12px) or `space-y-4` (16px) |
| Table rows | `gap-8` (32px) between cells |

### Shared Components (in `src/screens/TaxFolders/TaxFolderShared.tsx`)
- `SectionHeading`, `DescriptionText`, `PrimaryButton`, `SecondaryButton`, `PrimaryButtonSm`, `SecondaryButtonSm`
- `FormFieldRow`, `FormLabel`, `CardContainer`, `UploadContainer`, `FilingSheet`, `MonthList`, `HintIcon`

## Tax-Specific Patterns

### PAYE Calculation (2026 Nigeria Tax Act)
Function: `calculateAnnualPAYE(st: PayeStaff)` in `BusinessPAYEContent.tsx`
- Annual gross = `gross × 12`
- Deductions: Pension (8%), NHF (2.5%), HMO (5%), Rent Relief (20% of annual rent, capped at ₦500k)
- Taxable income = gross − deductions
- Progressive bands: 0% (₦0–800k), 15% (₦800k–3M), 18% (₦3M–12M), 21% (₦12M–25M), 23% (₦25M–50M), 25% (₦50M+)
- Monthly tax = annual tax ÷ 12

### Employee data model (`AddEmployeeDrawer.tsx`)
```ts
interface PayeStaff {
    firstName: string; lastName: string; email: string; phone: string;
    position: string; taxId: string; gross: number;
    pensionOn: boolean; nhfOn: boolean; hmoOn: boolean;
    annualRent: string; annualRentChecked: boolean;
}
```

### CIT Quarterly Flow
- File Q1–Q4 P&L → calculated CIT → FilingSheet → mark paid
- Summary shows: Revenue (Qx–Qy), Expenses, Net profit, CIT payable, Paid, Remaining, Quarters filed
- Table has: Quarter, Due Date, Revenue, Expenses, CIT, Status, View button
- "View" opens P&L Drawer with Revenue card (3 fields) + Expenses card (5 fields) + Receipts

## State Management

### UserContext (`src/contexts/UserContext.tsx`)
- `user`, `token`, `loading`, `isAuthenticated`, `login()`, `logout()`
- Token in `sessionStorage` (tab-scoped). On mount: reads token → calls `refreshUser()` (GET `/auth/me`). On 401: auto-clear.
- Check `useUser().loading` before consuming `isAuthenticated`.

### ProfileContext (`src/contexts/ProfileContext.tsx`)
- Manages current year, profileId, tax profile data.
- `profile`, `year`, `profileId`, `loading`, `switchProfile()`.

### OnboardingContext (`src/contexts/OnboardingContext.tsx`)
- Manages onboarding flow state (business type, income sources, etc.).

### useApi (`src/hooks/useApi.ts`)
- Returns `{ get, post, put, patch, del, upload, loading, error }`.
- On 401: auto calls `logout()` + redirects to `/signin`.
- Auth screens pass `{ useToken: false }` option.

### useTaxableApi (`src/hooks/useTaxableApi.ts`)
- Typed wrappers: `createProfile`, `completeProfile`, `getProfileList`, `deleteProfile`, etc.
- Reads token from `UserContext`. Sends `Authorization: Bearer {token}` automatically.
- `handleResponse()` reads `response.text()` then `JSON.parse()`.

## Local Development

### API Proxy
`next.config.ts` rewrites `/api/proxy/:path*` → `https://api.gettaxable.com/api/:path*`.
All API calls use `/api/proxy/...` URLs. No CORS issues. Restart dev server after `next.config.ts` changes.

### Lenis Smooth Scroll
Used on auth, home screen, and business tax pages. Pattern:
```ts
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
if ((window as any).__lenis) return;  // prevent duplicates
const lenis = new Lenis({...});
(window as any).__lenis = lenis;
// raf loop...
return () => { lenis.destroy(); (window as any).__lenis = undefined; };
```

### cn() Utility (`src/lib/utils.ts`)
- Custom `twMerge` extended with `text-1` through `text-15` as valid font-size values.
- Used via `cn(clsx(...inputs))` — prevents Tailwind class conflicts.
- Critical: `text-N` values are registered as font-size keys so `tailwind-merge` doesn't strip them when combined with `text-neutral-*`.

## Verification
- `npm run lint` — 0 errors. Pre-existing warnings allowed for `react-hooks/exhaustive-deps` and `@next/next/no-img-element`.
- `npx tsc --noEmit` — 0 errors (TypeScript strict mode).
- ESLint config: `react/no-unescaped-entities` disabled. Unused vars with `_` prefix allowed.
- Pre-commit: always run both.

## Key Dependencies
- **shadcn (v4 base-nova)**: `Input`, `Label`, `Button`, `InputGroup`, `Toaster`, `Drawer`, `RadioGroup`, `Checkbox`, `Badge`, `Skeleton`, `Select`, `Switch`, `Popover`, `Calendar`, `Table`, `Accordion`, `Attachment`
- **sonner**: toast notifications
- **lucide-react**: icons (`Eye`, `EyeOff`, `Info`, `AlertTriangle`, `FileTextIcon`, `XIcon`, `ChevronDown`)
- **@mingcute/react**: alternative icons (`InformationFill` for tooltip hints)
- **gsap** + **lenis**: entrance animations + smooth scrolling
- **framer-motion**: component micro-animations
- **vaul**: drawer primitive (used by shadcn `Drawer`)
- **base-ui**: Base UI React v1.x (used by shadcn v4 components)
- **date-fns** + **react-day-picker**: calendar/date picker

## File Organization
- `src/app/<route>/page.tsx` — thin route wrapper, imports screen from `src/screens/`
- `src/screens/<Area>/<Screen>.tsx` — UI and logic
- `src/screens/<Area>/Component.tsx` — extracted sub-components
- `src/components/ui/<name>.tsx` — shadcn CLI + custom (e.g., `searchable-select.tsx`)
- `src/contexts/<Name>Context.tsx` — React contexts
- `src/hooks/use<Name>.ts` — custom hooks
- `src/lib/` — utilities, API endpoints, helpers
- `src/types/api.ts` — shared API interfaces
