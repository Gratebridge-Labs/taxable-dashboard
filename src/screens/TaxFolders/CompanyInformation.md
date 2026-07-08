# Company Information + PAYE — Summary

## File
`src/screens/TaxFolders/BusinessTaxDetails.tsx`

## Overview

The business tax workspace combines Company Information and PAYE (Pay As You Earn) filing. Users fill in company details before unlocking PAYE, VAT/WHT, and CIT sections via the sidebar.

The PAYE system supports per-month employee payroll data with copy-forward, add/view/edit/remove employee flows, and a filing sheet for submitting returns.

---

## Page Structure

```
Custom nav bar (Back + breadcrumb)
      │ 56px spacing
Main layout (3-column flex with justify-center)
├── Left sidebar (250px, border-neutral-50, p-3)
│   ├── "SELECT" label
│   ├── Company Information  ← always unlocked
│   ├── PAYE                ← locked until company info saved
│   ├── VAT/WHT             ← locked until company info saved
│   └── Company Income Tax  ← locked until company info saved
│
└── Main form area (flex-1, centered)
    └── [data-animate] sections (GSAP entrance)
        ├── Company Information (max-w-[400px], space-y-10)
        ├── PAYE
        │   ├── Month selector dropdown with badges (Filed/Draft)
        │   ├── First-time PAYE onboarding (entry options + starting month)
        │   ├── Copy from previous month flow
        │   ├── Employee Payroll table (11 columns, horizontal scroll)
        │   ├── Add Employee Drawer (add/view/edit/remove)
        │   └── Filing Sheet (filing options drawer)
        ├── VAT/WHT (via BusinessVATWHTContent)
        ├── CIT (via BusinessCITContent)
        └── Review (submit confirmation)
```

---

## State Management

### Company Info Fields
| Field | State | Type | Default |
|---|---|---|---|
| RC/BN number | `rcbn` | string | `'12345678901'` |
| Company name | `companyName` | string | `''` |
| Industry | `industry` | string | `''` |
| Date of incorporation | `incorporationDateObj` | `Date \| undefined` | `undefined` |
| Address | `address` | string | `''` |
| City | `city` | string | `''` |
| State | `state` | string | `''` |

### PAYE State
| State | Type | Purpose |
|---|---|---|
| `payeStaffByMonth` | `Record<string, PayeStaff[]>` | Per-month employee data |
| `filedMonths` | `Set<string>` | Months marked as filed |
| `activeMonth` | string | Currently selected month (default 'January') |
| `MONTHS` | string[] | `['January'..'December']` — all 12 months |
| `showPayeFilingModal` | boolean | Filing sheet drawer visibility |

### Derived State
```ts
// Company info
const companyInfoComplete = Boolean(
    rcbn && companyName && industry && incorporationDateObj && address && city && state
);
const [companyInfoSaved, setCompanyInfoSaved] = useState(false);

// PAYE — determines source month for copy-forward
const getSourceMonth = (currentMonth: string): string | null => {
    const currentIndex = MONTHS.indexOf(currentMonth);
    for (let i = currentIndex - 1; i >= 0; i--) {
        const month = MONTHS[i];
        if ((payeStaffByMonth[month] || []).length > 0) return month;
    }
    return null;
};
```

---

## Sidebar Locking Logic

All sidebar items (except Company Information) start locked. They unlock only after the user fills all 7 company fields and clicks "Save & Continue".

```tsx
locked={sec.key !== 'company-info' && !companyInfoSaved}
```

The `onClick` guard prevents navigation to locked sections:
```tsx
if (sec.key !== 'company-info' && !companyInfoSaved) return;
```

**Folder icons:**
- Locked sections: `/icons/folder-inactive.svg`
- Unlocked sections: `/icons/folder.svg`

PAYE is a flat sidebar item — no expandable month sub-nav. Month selection happens via a dropdown in the content area.

---

## Input Fields & Design System

| Component | Implementation |
|---|---|
| Text inputs | shadcn `<Input>` — `h-10`, `rounded-xl`, `border-neutral-200`, `bg-white`, `px-3`, `text-3 font-medium` |
| Dropdowns | Custom `SearchableSelect` — uses `<Input>` as trigger, filters options on type, keyboard navigable |
| Date picker | shadcn `<Popover>` + `<Calendar>` (react-day-picker) |
| Naira amount | `<Input>` with `₦` prefix (`text-neutral-500`, `pl-8`) + automatic comma formatting |
| Labels | `text-2 font-medium`, `text-neutral-700`, `mb-1` |

---

## PAYE Flow

### Month Selector

A shadcn `<Select>` dropdown beside the "Employee Payroll" heading. Each option shows the month name and a badge:

| Condition | Badge |
|---|---|
| Month is filed | `[Filed]` — green (`bg-green-50 text-green-600`) |
| Month has data but not filed | `[Draft]` — amber (`bg-amber-50 text-amber-600`) |
| No data | No badge |

The trigger also shows the badge for the active month. Styling: `w-fit min-w-[180px]`, `h-10`, `rounded-xl`, `bg-white`, `border-neutral-50`. Gap between text and badge: 8px. Gap between badge and chevron: 24px.

### First-Time PAYE Onboarding

When no data exists in any month (first-time user), the method selection screen appears:
- "How do you want to add payroll data?" header
- "Manual entry (add staff one by one)" — pre-selected
- "Upload CSV/Excel" — disabled
- "Connect payroll software" — disabled
- "Select starting month" dropdown — user picks which month to start with
- "Continue" → opens AddEmployeeDrawer → on save, data goes to the selected month

### Copy from Previous Month

When a month has no data but a previous month does (`sourceMonth !== null`):
- "Copy from {sourceMonth} 2026" — pre-selected
- "Manual entry" — also available as an option
- "Continue" button → either copies data or opens AddEmployeeDrawer

**Copy confirmation modal:** Appears with:
- "Copy payroll data?" header
- "This will copy all employees from {sourceMonth} to {activeMonth}. You can edit them independently."
- "Don't show this again" checkbox (uses `skipCopyConfirmation` state)
- Cancel / Copy buttons

### Employee Payroll Table

11-column shadcn `<Table>` with horizontal scroll (`overflow-x-auto`):

| Column | Content | Styling |
|---|---|---|
| Full Name | `firstName + lastName` | `font-medium text-neutral-600` |
| Gross Income | `₦{st.gross}` | `font-medium text-neutral-600` |
| HMO | Calculated 2.5% | `font-medium text-neutral-600` |
| Pension | Calculated 8% | `font-medium text-neutral-600` |
| NHF | Calculated 2.5% | `font-medium text-neutral-600` |
| Taxable Income | `gross - pension - nhf - hmo` | **`font-semibold text-neutral-800`** |
| JRB Tax ID | `st.taxId` | `font-medium text-neutral-600` |
| Job Position | `st.position` | `font-medium text-neutral-600` |
| Email Address | `st.email` | `font-medium text-neutral-600` |
| Phone Number | `st.phone` | `font-medium text-neutral-600` |
| Nationality | `st.nationality || 'Nigeria'` | `font-medium text-neutral-600` |

**Table specs:** Header: `bg-neutral-50`, rows: `border-neutral-50` dividers, padding: `px-6 py-4`. Clicking a row opens the employee view drawer.

### Add Employee Drawer

File: `src/screens/TaxFolders/AddEmployeeDrawer.tsx`

Three modes:

#### Add Mode
- Empty form, all fields editable
- Title: "Add Employee"
- Fields: First Name, Last Name, Email, Phone, Job Position, JRB Tax ID, Monthly Income (₦ prefixed), Nationality (dropdown)
- Deductions: Pension 8%, NHF (2.5%), HMO (2.5%) — shadcn Checkboxes
- CTAs: Cancel (secondary) | Add Employee (primary, disabled until valid)

#### View Mode
- Pre-filled fields, all disabled (`bg-neutral-50 text-neutral-300`)
- Title: "Employee Details"
- CTAs: Remove Staff (destructive, red) | Edit Details (primary, blue)
- "Edit Details" slides the form horizontally to reveal edit mode

#### Edit Mode
- Same pre-filled fields, now editable
- Title: employee's full name
- Slide transition: view form slides left (`-translate-x-full`), edit form slides in from right (`translate-x-0`), 300ms ease-in-out
- CTAs: Cancel (restores original values, slides back) | Save (calls `onSave`, closes drawer)

#### Remove Confirmation Modal
- Appears inside the Vaul Drawer portal (previously was outside, fixed)
- `backdrop-blur-sm bg-black/20`
- Warning icon + "Remove Employee?" + employee name
- "This action cannot be undone."
- Cancel (secondary) | Remove (destructive, `bg-red-600`)

### Filing Sheet

File: `src/screens/TaxFolders/TaxFolderShared.tsx` — `FilingSheet` component

- shadcn `<Drawer>` with filing options
- Title: "How do you want to file?"
- Two radio options with descriptions:
  1. "Let Taxable file for you (₦8,000)" — selected by default
  2. "Get accountant review first (₦25,000)"
- CTA: "Continue" (primary) — calls `onFile()` then closes
- "Back" (secondary) — closes drawer
- Payment integration placeholder — flow ends with file confirmation

---

## Button Specifications

| Button | Height | Font | Radius | Hover | Disabled state |
|---|---|---|---|---|---|
| Save & Continue | `h-12` | `text-3 font-semibold` | `rounded-xl` | none | `disabled:bg-neutral-100 disabled:text-neutral-400` |
| File {month} PAYE | `h-12` | `text-3 font-semibold` | `rounded-xl` | none | `disabled:bg-neutral-100 disabled:text-neutral-400` |
| Add employee | `h-12` | `text-3 font-semibold` | `rounded-xl` | none | N/A |
| Submit Annual Return | `h-12` | `text-3 font-semibold` | `rounded-xl` | none | N/A |
| Download Return | `h-12` | `text-3 font-semibold` | `rounded-xl` | none | N/A |
| Continue (method) | `h-12` | `text-3 font-semibold` | `rounded-xl` | none | N/A |
| Submit Tax Return | `h-12` | `text-3 font-semibold` | `rounded-xl` | none | N/A |
| Continue (filing sheet) | `h-12` | `text-3 font-semibold` | `rounded-xl` | none | N/A |
| Back (filing sheet) | `h-12` | `text-3 font-semibold` | `rounded-xl` | none | N/A |
| Remove Staff | `h-12` | `text-3 font-semibold` | `rounded-xl` | none | N/A |
| Edit Details | `h-12` | `text-3 font-semibold` | `rounded-xl` | none | N/A |
| Cancel (drawer) | `h-12` | `text-3 font-semibold` | `rounded-xl` | none | N/A |
| Save (drawer edit) | `h-12` | `text-3 font-semibold` | `rounded-xl` | none | N/A |
| Add Employee (drawer) | `h-12` | `text-3 font-semibold` | `rounded-xl` | none | `disabled:bg-neutral-100 disabled:text-neutral-400` |

**Loading state:** Buttons show `<Spinner />` while `submitting` or `loadingStep` is active.

---

## Motion System

### Lenis Smooth Scroll
```tsx
useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ lerp: 0.1 });
    // RAF loop + cleanup
}, []);
```

### GSAP Entrance Animations
```tsx
useLayoutEffect(() => {
    gsap.fromTo('[data-animate]', { opacity: 0, y: 16 }, {
        opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out',
        onStart: () => gsap.set('[data-animate]', { transition: 'none' }),
        onComplete: () => gsap.set('[data-animate]', { clearProps: 'transition' }),
    });
}, []);
```

Content sections with `[data-animate]`: Company Information form, PAYE monthly filing, PAYE Annual Returns, VAT/WHT, CIT, Review.

### Drawer Slide Transition (Employee Edit)
The view-to-edit transition uses CSS transforms:
```
view form:  translate-x-0  →  -translate-x-full (slides left)
edit form:  translate-x-full  →  translate-x-0 (slides in from right)
```
300ms ease-in-out, `relative overflow-hidden` container.

---

## Design System Compliance

### Typography (all converted)
| Old | New |
|---|---|
| `text-[11px]` | `text-1` |
| `text-[12px]` | `text-2` |
| `text-[13px]` / `text-[14px]` / `text-[15px]` | `text-3` |
| `text-base` (headings) | `text-5` |
| `text-[24px]` (display) | `text-7` |

### Colors (all converted)
| Old | New |
|---|---|
| `stroke="#9CA3AF"` | `className="text-neutral-400"` |
| `#111827` (calendar) | `className="text-neutral-800"` |
| `#C9CDD6` (calendar) | `className="text-neutral-300"` |
| `bg-[#10B981]` / `#16A34A` | `bg-green-600` / `className="text-green-600"` |
| `bg-[#F3F4F6] text-[#111827]` | `bg-neutral-100 text-neutral-800` |

### Removed Hover Effects
All `hover:opacity-*`, `hover:bg-neutral-*`, `hover:text-*` removed from buttons, sidebar items, table rows, and navigation elements. Only `group-hover` tooltip effects on `HintIcon` remain.

### Removed Dead Code
- `_annualRevenue`, `_taxableProfit` (unused CIT state)
- `pathname` destructuring (replaced with `window.location.pathname`)
- `payeStep`, `payeMethod` (replaced by per-month data + sourceMonth logic)
- Inert `transition-colors` on table rows
- Inert `transition-opacity` on "View Breakdown" button
- Verified checkmark + "Verified" text below RC/BN input
- PAYE subnav month buttons in sidebar (replaced by dropdown selector)

---

## Key Components

### `PayeMonthlyFiling` (`BusinessPAYEContent.tsx`)
- Manages month selector, entry options (first-time vs copy), employee table, drawer open/close
- Receives `staff`, `sourceMonth`, `filedMonths`, `payeStaffByMonth` as props
- Handles copy confirmation modal with "Don't show again" checkbox

### `PayeAnnualReturns` (`BusinessPAYEContent.tsx`)
- Displays annual PAYE summary: employee count, months filed, total PAYE remitted, gross payroll
- "Download Return" and "Submit to LIRS" CTAs

### `AddEmployeeDrawer` (`AddEmployeeDrawer.tsx`)
- Three modes: Add, View (disabled), Edit (slide transition)
- Form fields in 2-column grid with shadcn Input + Checkbox
- Remove confirmation modal inside Vaul portal
- Shareable `PayeStaff` interface

### `FilingSheet` (`TaxFolderShared.tsx`)
- Filing options drawer with two radio choices
- "Let Taxable file" (₦8,000) or "Get accountant review" (₦25,000)
- Continue + Back buttons

### `SearchableSelect` (`src/components/ui/searchable-select.tsx`)
- Custom combobox using shadcn `<Input>` as trigger
- Filter-on-type, keyboard navigation, click-outside close

---

## Flow: Save & Continue (Company Info)

1. User fills all 7 company info fields → `companyInfoComplete` becomes `true`
2. User clicks "Save & Continue" → button shows `<Spinner />`, `submitting` set to `true`
3. `handleSaveAndContinue` runs:
   - Saves data to `sessionStorage` (persists across tab refreshes)
   - Sets `companyInfoSaved = true` (unlocks sidebar menus)
   - 500ms simulated delay
   - Advances `activeSection` to next section (PAYE)
   - Scrolls to top
4. Sidebar menus (PAYE, VAT/WHT, CIT) become unlocked with active folder icons
5. User can navigate freely between sections

## Flow: PAYE Filing

1. User navigates to PAYE → sees month selector + employee table or entry options
2. If first time: selects starting month → Add Employee → data stored per-month
3. If subsequent months: auto-detects `sourceMonth`, offers copy or manual entry
4. Table shows employees with calculated PAYE, Pension, NHF, HMO
5. Click row → view employee details → edit or remove
6. Click "File {month} PAYE" → Filing Sheet with filing options → Continue → marks month as `[Filed]`

---

## Files Touched During Implementation

```
src/screens/TaxFolders/BusinessTaxDetails.tsx    — Main page (company info + PAYE)
src/screens/TaxFolders/BusinessPAYEContent.tsx   — PayeMonthlyFiling + PayeAnnualReturns
src/screens/TaxFolders/AddEmployeeDrawer.tsx      — Employee add/view/edit/remove drawer
src/screens/TaxFolders/TaxFolderShared.tsx        — FilingSheet, PrimaryButton, SecondaryButton
src/components/ui/searchable-select.tsx           — Custom searchable dropdown
src/components/ui/popover.tsx                     — Date picker popover
src/components/ui/calendar.tsx                    — Date picker calendar
src/components/SetupSidebar/SetupSidebar.tsx      — Business profile creation during onboarding
```
