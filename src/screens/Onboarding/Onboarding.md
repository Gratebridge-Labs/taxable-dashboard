# Onboarding Flow — Summary of Changes

## Overview

The onboarding flow manages tax profile creation. It consists of two parallel paths:

1. **Legacy standalone pages**: `/onboarding/step1` through `/onboarding/step4` — served via `OnboardingLayout`, stepped through with `ProgressBar`.
2. **Active drawer flow**: `SetupSidebar` — a shadcn `Drawer` triggered from the home screen "Create new tax filing" button. This is the primary flow.

---

## Active Flow — SetupSidebar Drawer

### Architecture

```
Home screen "Create new tax filing" → SetupSidebar (Drawer)
├── Step 0: Filing setup (intent, type, Tax ID, business services, tax year)
│   ├── Stage 0: "What would you like to do?"          (radio: File returns / PAYE)
│   ├── Stage 1: "Who are you filing for?"              (radio: Individual / Business)
│   └── Stage 2: Everything else at once
│       ├── Tax ID input                                 (NIN for Individual, RC/BN for Business)
│       ├── [Business only] "What do you need to do?"    (checkboxes: PAYE / VAT/WHT / CIT)
│       └── Tax year                                     (radio: 2026 / 2025)
├── Step 1: Income sources                               (checkboxes: 6 options)
└── Step 2: Life questions                               (5 questions, radio yes/no per question)
    └── CTA "Get Started" → create + complete profile → LoadingScreen → redirect to PIT
```

### Progressive reveal (step 0)

Questions appear one at a time to reduce cognitive load:

| Stage | Content shown |
|---|---|
| 0 | Only "What would you like to do?" — no options pre-selected (`filingIntent` starts as `null`) |
| 1 | Previous question stays + "Who are you filing for?" appears |
| 2 | Both previous + all remaining fields appear at once (Tax ID, business services, tax year) |

The user cannot see future questions until they answer the current one. This ensures focused interaction without overwhelming the user.

### Drawer implementation

- Replaced the original fixed right-side sidebar (`fixed inset-0 ... flex justify-end`) with a **shadcn `Drawer`** (`vaul` bottom-sheet)
- `DrawerOverlay` has `backdrop-blur-sm` for a polished blur effect
- Content centered with `max-w-[450px] mx-auto`
- Users can close by tapping the overlay or dragging down (Vaul's built-in gesture)
- `data-lenis-prevent` on the scroll container so native scrolling works inside the drawer

### Button behavior

| Aspect | Behavior |
|---|---|
| **Visibility** | Footer buttons are always visible (never hidden) |
| **Primary CTA** | Disabled (`disabled:bg-neutral-100 disabled:text-neutral-400`) until all required fields for the current step are filled |
| **Button text** | Step 0: "Continue" (Individual) / "Get Started" (Business) — Step 1: "Continue" — Step 2: "Get Started" |
| **Back button** | Step 0: closes the drawer — Step 1/2: navigates to the previous step |

### Business flow

- "Businesses & Organizations" option is now **enabled** (was previously `disabled={true}`)
- Business routing: selecting Business + "Get Started" routes directly to `/tax-folders/business`
- Business-specific checkboxes: PAYE, VAT/WHT, CIT — each with a description of the service

### Individual flow

- **Step 0**: Continue → **Step 1**: income sources → **Step 2**: life questions → **CTA**: Get Started
- **Profile creation and completion** moved from step 0 (`handleGetStarted`) to step 2 (`handleCreateAndSubmit`)
- Step 0 no longer calls the API — it simply advances the step
- On step 2 "Get Started": creates profile, completes it, fetches profiles, shows `LoadingScreen`, then redirects to PIT (`/tax-folders/pit`)

---

## Design System Standardization

### Buttons (SetupSidebar + Step1-Step4 + LoadingScreen)

| Property | Before | After |
|---|---|---|
| Height | `h-11` (44px) | `h-12` (48px) |
| Font weight | `font-bold` / `font-medium` | `font-semibold` |
| Radius | `rounded-lg` (8px) | `rounded-xl` (12px) |
| Hover effects | `hover:opacity-90`, `hover:bg-neutral-50` | None — all removed |
| Disabled state | `disabled:opacity-50`, `cursor-not-allowed` | `disabled:bg-neutral-100 disabled:text-neutral-400` |
| Shadows | `shadow-lg`, `shadow-taxable-blue/10` | None — removed |
| Transform | `active:scale-[0.99]`, `transition-transform` | None — removed |

### Typography

| Location | Before | After |
|---|---|---|
| Step headings | `text-lg` (~18px), `text-base` (~16px) | `text-7` (28px), `text-5` (19px) |
| Body text | `text-[14px]`, `text-xs`, `text-sm` | `text-2` (13px), `text-3` (15px) |
| Badge text | `text-[10px]` | `text-1` (12px) |

### Radio options & Checkboxes (SetupSidebar)

| Component | Before | After |
|---|---|---|
| Radio buttons | Custom `RadioOption` component with inline SVG circles | **shadcn `RadioGroup` + `RadioGroupItem`** |
| Checkboxes | Custom `CheckboxOption` with inline SVG + animations | **shadcn `Checkbox`** |
| Custom SVGs | Referenced `/icons/radio-active.svg` and `/icons/radio-inactive.svg` | Removed — shadcn handles the indicator |
| Layout | Replaced with shadcn Base UI v4 components | Consistent with the rest of the dashboard |

### Spacing

| Location | Before | After |
|---|---|---|
| Between question blocks (step 0) | `pt-4` (16px) | `pt-10` (40px) |
| Between question blocks (step 2) | `space-y-5 sm:space-y-6` (20px/24px) | `space-y-14` (56px) |
| RadioOption padding | `py-4` (16px) | Removed (0px internal padding, uses `gap-4` container) |
| Between radio options | `space-y-1` (4px) via parent | `flex-col gap-4` wrapper (16px) |
| "First question → Second question" spacing | `mt-5` (20px) | `mt-10` (40px) |

### `OptionCard` (legacy onboarding pages)

| Property | Before | After |
|---|---|---|
| Label | `text-sm` (14px) | `text-3` (15px) |
| Description | `text-xs` (12px) | `text-2` (13px) |
| Badge | `text-[10px]` | `text-1` (12px) |
| Hover on label | `hover:bg-neutral-50` | Removed |

### `OnboardingLayout` (legacy pages)

| Property | Before | After |
|---|---|---|
| Heading classes | `text-3xl md:text-5xl lg:text-5xl` | `text-7` |

### `ProgressBar` (legacy pages)
- No violations — proper use of design tokens (`bg-taxable-alert`, `bg-neutral-100`)

### `LoadingScreen`
- `text-lg` → `text-5`
- No other violations — serves as an overlay animation

---

## State Management

### `OnboardingContext`

| Change | Detail |
|---|---|
| **Added `lifeAnswers` field** | `OnboardingData` now includes `lifeAnswers: string[]` — previously Step3 selections were stored only in local state and lost on navigation |
| **Added `setLifeAnswers`** | New context method to persist life answers to both state and `localStorage` |
| **Step3 integration** | `Step3.tsx` now imports `useOnboarding` and calls `setLifeAnswers(selections)` before navigating to step 4 |

### `SetupSidebar` state changes

| State | Type | Default | Purpose |
|---|---|---|---|
| `subStep` | `number` | `0` | Controls progressive reveal (0 → 1 → 2 within step 0) |
| `filingIntent` | `'returns' \| 'paye' \| null` | `null` | No longer pre-selected — user must actively tap |
| `businessServices` | `string[]` | `[]` | Business-specific service checkboxes (PAYE, VAT/WHT, CIT) |
| `taxYear` | `'2026' \| '2025'` | `'2026'` | Defaults to current year |
| `taxId` | `string` | `''` | Tax ID / NIN / RC/BN |
| `filingType` | `'Individual' \| 'Business' \| null` | `null` | Unchanged |

---

## Key Files Changed

```
src/app/onboarding/step1/page.tsx       — Commented out (returns null)
src/app/onboarding/step2/page.tsx       — Thin wrapper (unchanged)
src/app/onboarding/step3/page.tsx       — Thin wrapper (unchanged)
src/app/onboarding/step4/page.tsx       — Thin wrapper (unchanged)
src/app/onboarding/loading/page.tsx     — Legacy loading screen (unchanged)
src/app/onboarding/layout.tsx            — OnboardingProvider wrapper (unchanged)

src/components/Onboarding/OptionCard.tsx         — Typography + hover removed
src/components/Onboarding/ProgressBar.tsx         — Unchanged (already clean)
src/components/OnboardingLayout/OnboardingLayout.tsx — Heading classes fixed
src/components/OnboardingLayout/LogoWhite.tsx     — Extracted (unchanged)

src/components/SetupSidebar/SetupSidebar.tsx      — Full rewrite (drawer, progressive reveal, shadcn components, button spec, business flow, spacing)
src/components/ui/radio-group.tsx                 — NEW (shadcn)
src/components/ui/checkbox.tsx                    — NEW (shadcn)
src/components/ui/drawer.tsx                       — backdrop-blur-sm added
src/components/ui/spinner.tsx                      — SpinnerCustom removed

src/contexts/OnboardingContext.tsx                 — Added lifeAnswers + setLifeAnswers
src/screens/Onboarding/Step1.tsx                   — Link→button, h-12, font-semibold, no hovers, headings fixed
src/screens/Onboarding/Step2.tsx                   — Same fixes + useRouter
src/screens/Onboarding/Step3.tsx                   — Same fixes + useOnboarding integration
src/screens/Onboarding/Step4.tsx                   — Same fixes + disabled state
src/screens/Onboarding/LoadingScreen.tsx            — text-lg→text-5

src/screens/Onboarding/Step1.tsx                   — Restored (was null in route)
src/screens/Onboarding/Step2.tsx                   — Active
src/screens/Onboarding/Step3.tsx                   — Active
src/screens/Onboarding/Step4.tsx                   — Active
```
