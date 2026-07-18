# Taxable Dashboard — Agent Guide

Nigerian tax compliance SaaS (PIT, PAYE, CIT, VAT/WHT).  
Next.js 16 App Router, TypeScript strict, Tailwind CSS v4, React 19, React Compiler enabled.

## Commands

```bash
npm run dev            # Dev server (next dev --webpack). Turbopack crashes on Windows.
npm run build          # Production build
npx next build --webpack  # Fallback if npm run build fails
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
  app/               App Router pages + root layout.tsx + globals.css
  screens/           Page-level screens (Auth/, Home/, Onboarding/, TaxFolders/)
  components/ui/     shadcn v4 base-nova (Input, Checkbox, Badge, Drawer, Table, Stepper, Accordion, etc.)
  components/        DashboardHeader/, ErrorBoundary/, OnboardingLayout/, RequireAuth/, SetupSidebar/, Toast/
  contexts/          UserContext, ProfileContext, OnboardingContext
  hooks/             useApi.ts, useTaxableApi.ts, useFormEntrance.ts
  lib/               taxable-api.ts, utils.ts (cn()), api-endpoints.ts
  types/             api.ts
```

- Route pages (`src/app/<route>/page.tsx`) are thin wrappers importing from `src/screens/` — render exactly one screen component.
- Routes with `useSearchParams()` **must** be wrapped in `<Suspense>`.
- Screens needing auth wrap with `<RequireAuth>`.
- `@/` alias maps to `src/`. **Never** use relative imports for project files (only for co-located helpers like `./useWhtDeductions` or `./TaxFolderShared`).

## Style & Conventions

### Imports (grouped by blank line)
1. **React / Next.js**: `'react'`, `'next/navigation'`, `'next/image'`
2. **Third-party**: `'lucide-react'`, `'sonner'`, `'gsap'`, `'lenis'`, `'date-fns'`, `'@mingcute/react'`, `'framer-motion'`, `'react-dom'`
3. **Local `@/`**: `@/components/ui/*`, `@/hooks/*`, `@/contexts/*`, `@/lib/*`, `@/screens/*`
4. **Relative**: `./file`, `../other`

### Component Structure
- `'use client'` as **line 1** of every interactive component. NEVER in utility files.
- `export function ComponentName(...)` at statement level — never `function C() { }; export { C }`.
- `export default` only for standalone page wrapper components.
- **Never nest React components** — extract helpers/mappers to file scope.
- `interface` for object shapes (props, form state). `type` for unions and utilities.
- Prefix prop interfaces with component name: `ButtonProps`, `SignInProps`.

### Formatting
- Semicolons required on all statements.
- Single quotes for strings. Double quotes for JSX attributes.
- Unused vars prefixed with `_`: `const _unused = ...`. ESLint enforces this.

### Hooks
- Explicit dependency arrays on all hooks. `// eslint-disable-next-line react-hooks/exhaustive-deps` is allowed sparingly.
- Primitive values only in dependency arrays — never objects or arrays (stable refs are OK).

### Error Handling
```ts
catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Something went wrong';
    console.error('[ComponentName] message:', msg);
    setError(msg);
}
```
- **No** `console.log` / `console.warn`. Only `console.error` with `instanceof Error`.
- API: `response.text()` → `JSON.parse()` — **never** `response.json()` (server errors return non-JSON).
- User-facing errors via `toast.success()` / `toast.error()` from `sonner`.
- localStorage reads: wrap in try/catch with silent `{}` fallback.

### Types
- `Record<K, V>` over `object` or `{}`.
- `as const` for literal arrays: `const OPTIONS = [...] as const;`.
- `Set<number>` for filed months / completed steps — serialize via `Array.from()` for localStorage.
- `Omit<Type, 'field'>` for form state (exclude server-generated fields like `id`).

## React Compiler Workarounds

This project has `babel-plugin-react-compiler` enabled. The compiler aggressively auto-memoizes components and can break certain patterns:

### File Uploads
DO NOT use `<label><input hidden onChange={...}></label>` — the React Compiler breaks `onChange` on hidden inputs inside `<label>`.  
Instead, use **either**:

**Pattern A** (extracted child component with native listener — most reliable):
```tsx
function FileUploadSection({ label, accept }: { label: string; accept: string }) {
    const [files, setFiles] = useState<{ name: string }[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        const el = inputRef.current;
        if (!el) return;
        const handler = (e: Event) => {
            const fl = (e.target as HTMLInputElement).files;
            if (!fl) return;
            setFiles(prev => [...prev, ...Array.from(fl).map(f => ({ name: f.name }))]);
            (e.target as HTMLInputElement).value = '';
        };
        el.addEventListener('change', handler);
        return () => el.removeEventListener('change', handler);
    }, []);
    return (
        <div className="bg-white relative flex items-center justify-between ...">
            <span className="text-2 font-semibold text-taxable-blue pointer-events-none">Upload</span>
            <input ref={inputRef} type="file" accept={accept} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
        </div>
    );
}
```

**Pattern B** (inline button + ref):
```tsx
<button onClick={() => ref.current?.click()}>Upload</button>
<input ref={ref} type="file" hidden onChange={(e) => { /* handler */ e.target.value = ''; }} />
```

Always reset `e.target.value = ''` after file selection to allow re-uploading the same file.

### Multiple setState in useEffect
Wrap multiple `setState` calls inside `useEffect` with `startTransition(() => {...})`:
```tsx
useEffect(() => {
    startTransition(() => {
        setField1(val);
        setField2(val);
        setIsEditing(false);
    });
}, [deps]);
```

### GSAP + Lenis
```tsx
useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set('[data-animate]', { opacity: 1, y: 0, clearProps: 'all' });
        return;
    }
    const ctx = gsap.context(() => {
        gsap.fromTo('[data-animate]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'power2.out' });
    }, containerRef);
    return () => ctx.revert();
}, []);

useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if ((window as any).__lenis) return;
    const lenis = new Lenis({ lerp: 0.1 });
    (window as any).__lenis = lenis;
    const raf = (t: number) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    return () => { lenis.destroy(); (window as any).__lenis = undefined; };
}, []);
```

### createPortal for modals inside Lenis-scrolled containers
Lenis applies `transform` to its container, which breaks `position: fixed`. Use `createPortal(..., document.body)`:
```tsx
{showDeferModal && createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-6 max-w-[400px] w-full">...</div>
    </div>,
    document.body
)}
```

## Design System

### Typography (15px base in globals.css)
| Class | Px | Use |
|---|---|---|
| `text-1` | 12px | Labels, badges, sidebar captions, tooltips |
| `text-2` | 13px | Body, sidebar items, input labels |
| `text-3` | 15px | Button text, body paragraphs |
| `text-4` | 17px | — |
| `text-5` | 19px | Section headings, card titles |
| `text-6` | 21px | Modal titles, sub-page headings |
| `text-7`–`text-15` | 24px+ | Page titles, display |

**NEVER** `text-sm`, `text-base`, `text-lg`, `text-[Npx]`. Always use the scale.  
Headings: `tracking-[-0.02em] font-semibold`. Input labels: `text-2 font-medium`.  
Font: Archivo Variable (`/public/Archivo/...`).

### Colors
- **Text**: `text-neutral-400` (#a3a3a3) body. `text-neutral-800` (#262626) headings.
- **Primary action**: `bg-taxable-blue` (#003787). Secondary: `bg-white border border-neutral-100`.
- **Containers**: `bg-neutral-50`. Cards: `bg-white border border-neutral-200 rounded-2xl`.
- **Disabled**: `bg-neutral-100 text-neutral-400`.
- **Info icons**: `InformationFill` from `@mingcute/react` with `color="#E5E5E5"`.
- **NEVER** `gray-*`. NEVER hardcoded hex in JSX. SVG strokes: `stroke="currentColor"` + `className="text-neutral-*"`.

### Buttons
- **Primary**: `h-12 text-3 font-semibold rounded-xl bg-taxable-blue text-white`
- **Secondary**: `h-12 text-3 font-semibold rounded-xl bg-white border border-neutral-100 text-neutral-800`
- **PrimarySm**: `h-9 text-2 font-semibold rounded-lg bg-taxable-blue text-white`
- **SecondarySm**: `h-9 text-2 font-semibold rounded-lg bg-white border border-neutral-200 text-neutral-800`
- **No hover/transition effects**. Disabled: `disabled:bg-neutral-100 disabled:text-neutral-400`.
- **Loading**: `<Spinner />` replaces button text.

### Inputs & Layout
- Always shadcn `<Input>` — never raw `<input>`.
- `<select>` → `<SearchableSelect>` with `options: string[]`, `value`, `onChange`, `placeholder`.
- `<FormFieldRow className="justify-between">` + `<FormLabel tip="...">` on left, input on right.
- Monetary inputs: `fmtInput(setter)` helper (removes non-numeric, formats thousands with commas).
- Always `str.replace(/,/g, '')` before `Number()` conversion.

### Tables
- Container: `bg-white border border-neutral-50 rounded-2xl overflow-hidden`.
- Header: `bg-neutral-50`. Header cells: `px-6 py-4 font-medium text-neutral-400`.
- Data cells: `px-6 py-4 font-medium text-neutral-600`. Clickable rows: `cursor-pointer`.

### Spacing
| Context | Class |
|---|---|
| Heading → subtext | `mb-1` |
| Input → next block | `space-y-10` |
| Section → section | `space-y-12` or `mb-14` |
| Sidebar → content | `gap-10` |
| Summary rows | `space-y-3` or `space-y-4` |

## View / Edit / Add Slide Animation

Use one of two patterns. Both support three modes: add (blank editable form), view (disabled form), edit (enabled form sliding in from right).

**Pattern A** (grid overlay — preferred for drawers):
```tsx
<div className="grid grid-cols-1 overflow-hidden">
    <div className={`col-start-1 row-start-1 transition-transform duration-300 ease-in-out ${isEditing ? '-translate-x-full' : 'translate-x-0'}`}>
        {editId !== null && <Form disabled={true} readOnlyStyle="bg-neutral-50 text-neutral-400" />}
    </div>
    <div className={`col-start-1 row-start-1 transition-transform duration-300 ease-in-out ${isEditing ? 'translate-x-0' : 'translate-x-full'}`}>
        {isEditing && <Form disabled={false} readOnlyStyle="" />}
    </div>
</div>
```
The add flow (`editId === null`) renders OUTSIDE the grid wrapper entirely.

**Pattern B** (relative + absolute):
```tsx
<div className="relative overflow-hidden">
    <div className={`transition-transform ... ${isEditing ? '-translate-x-full' : 'translate-x-0'}`}>
        {editId !== null && <Form disabled />}
    </div>
    <div className={`absolute inset-0 transition-transform ... ${isEditing ? 'translate-x-0' : 'translate-x-full'}`}>
        {isEditing && <Form />}
    </div>
    {editId === null && <Form />}
</div>
```

### Footer buttons (3 states):
```tsx
{editId !== null && !isEditing ? (
    <RemoveButton /> <EditButton />
) : editId !== null && isEditing ? (
    <CancelButton /> <SaveButton />
) : (
    <DrawerClose asChild><SecondaryButton>Cancel</SecondaryButton></DrawerClose>
    <PrimaryButton onClick={handleSave}>Add</PrimaryButton>
)}
```

## localStorage Patterns

### Key naming
Every key is prefixed with `taxable_` and scoped to `profileId` and/or `taxYear`:
```ts
`taxable_vat_${profileId}_${taxYear}`
`taxable_wht_deductions_${profileId}_${taxYear}`
`taxable_cit_data_${profileId}`
`taxable_pit_income_${profileId}`
```

### One-time migration from unscoped keys
```ts
useEffect(() => {
    const migKey = `wht_migrated_${profileId}_${taxYear}`;
    if (!localStorage.getItem(migKey)) {
        const oldKeys = ['taxable_wht_deductions', 'taxable_wht_filed', 'taxable_wht_month'];
        for (const k of oldKeys) {
            const oldVal = localStorage.getItem(k);
            if (oldVal) { localStorage.setItem(k + '_' + profileId + '_' + taxYear, oldVal); localStorage.removeItem(k); }
        }
        localStorage.setItem(migKey, 'true');
    }
}, [profileId, taxYear]);
```

### Persistence lifecycle
```ts
// Lazy init (useState callback):
const [v, setV] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)!) || []; } catch { return []; }
});
// Auto-save (useEffect):
useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ }
}, [v, key]);
// Restore (startTransition for multiple setState):
useEffect(() => {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return;
        const saved = JSON.parse(raw);
        startTransition(() => {
            if (saved.field1) setField1(saved.field1);
            if (saved.field2) setField2(saved.field2);
        });
    } catch { /* ignore */ }
}, []);
```

## Tax-Specific Patterns

### Stepper state machine
```tsx
const [annualStep, setAnnualStep] = useState<'financials' | 'tax-adjustments' | 'wht-credits' | 'review'>('financials');
const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

const goForward = (target: StepType) => {
    const stepNum: Record<string, number> = { financials: 1, 'tax-adjustments': 2, 'wht-credits': 3, review: 4 };
    setCompletedSteps(prev => new Set([...prev, stepNum[annualStep]]));
    setAnnualStep(target);
};
const goBack = (target: StepType) => setAnnualStep(target);  // Does NOT mark complete
```
Past completed steps are clickable via the Stepper's `onValueChange` (the Stepper component shows checkmarks on completed items).

### PAYE bands (2026)
```
Band 1: ₦0–800k       @ 0%
Band 2: ₦800k–3M      @ 15%
Band 3: ₦3M–12M       @ 18%
Band 4: ₦12M–25M      @ 21%
Band 5: ₦25M–50M      @ 23%
Band 6: ₦50M+         @ 25%
```
Deductions: Pension (8%), NHF (2.5%), HMO (5%), Rent Relief (20% capped ₦500k).

### VAT (VAT @ 7.5%)
- 5-step stepper: Data Source → Output VAT → Input VAT → Adjustments → Review.
- Brought-forward credit auto-populates from previous month's net negative position.
- Due date: 21st of the following month.
- localStorage key: `taxable_vat_${profileId}_${taxYear}`.

### CIT Bracket
- 20% for turnover ≤ ₦25M, 30% above ₦25M.
- Plus 4% Development Levy on assessable profit.
- Final position = totalObligation − prepayments (WHT credits + quarterly payments).
- Class 1/2/3 capital allowances at 10/20/25%.

### WHT
- Rate pills [5%] [10%] toggle (no dropdown).
- File receipt upload required before save.
- localStorage keys scoped to `profileId` + `taxYear`.

## Shared Components (`src/screens/TaxFolders/TaxFolderShared.tsx`)
- `SectionHeading`, `DescriptionText`, `PrimaryButton`, `SecondaryButton`, `PrimaryButtonSm`, `SecondaryButtonSm`
- `FilingSheet` (Drawer with radio options for "Let Taxable file" vs "Accountant review")
- `FormFieldRow`, `FormLabel` (with info tooltip via `InformationFill`)

## State Management
- **UserContext**: `user`, `token`, `loading`, `isAuthenticated`, `login()`, `logout()`. Token in `sessionStorage`.
- **ProfileContext**: `currentProfile`, `profiles`, `fetchProfiles()`, `fetchProfile(id)`.
- **useApi**: `{ get, post, put, del, upload, loading, error }`. Auto-logout on 401.
- **useTaxableApi**: Typed wrappers for profile CRUD. Uses `handleResponse()` with `response.text()` → `JSON.parse()`.
- `API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/proxy'`.

## Key Dependencies
- Next.js 16.1, React 19.2, TypeScript strict
- shadcn v4 (base-nova): Input, Checkbox, Badge, Drawer, Table, Stepper, Accordion, Select, Switch, Popover, Calendar, RadioGroup
- GSAP 3.15 + Lenis 1.3 (animations + smooth scroll)
- lucide-react (icons), @mingcute/react (InformationFill)
- sonner (toasts), vaul (drawer primitive)
- date-fns 4.4 + react-day-picker 10.0 (date picker)
- tailwind-merge (in `cn()` utility)
