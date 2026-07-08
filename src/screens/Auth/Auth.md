# Auth Screens — Dashboard

## Overview

The auth flow handles sign-in, sign-up, password reset, and email/2FA verification. Each screen is a thin Next.js App Router page that imports a screen component from `src/screens/Auth/`.

| Route | Screen Component | Purpose |
|---|---|---|
| `/signin` | `SignIn.tsx` | Email + password login |
| `/signup` | `Signup.tsx` | Registration with name, email, phone, password |
| `/forgot-password` | `ForgotPassword.tsx` | Request password reset email |
| `/verify-otp` | `VerifyOTP.tsx` | Verify email OTP (signup or reset) |
| `/verify-2fa` | `Verify2FA.tsx` | Two-factor authentication code |
| `/create-new-password` | `CreateNewPassword.tsx` | Set new password after reset |

---

## Route Structure

Route files are in `src/app/`. They are thin wrappers that render the screen component. Screens that use `useSearchParams()` are wrapped in `<Suspense>`:

```
src/app/signin/page.tsx              → <SignIn />
src/app/signup/page.tsx              → <Signup />
src/app/forgot-password/page.tsx     → <ForgotPassword />
src/app/verify-otp/page.tsx          → <Suspense><VerifyOTP /></Suspense>
src/app/verify-2fa/page.tsx          → <Suspense><Verify2FA /></Suspense>
src/app/create-new-password/page.tsx → <Suspense><CreateNewPassword /></Suspense>
```

> **Why Suspense?** `useSearchParams()` triggers static rendering bail-out in Next.js. Suspense scopes the client-side rendering to just the component that depends on search params, so the layout shell can still be server-rendered.

---

## Screen Components

### `SignIn.tsx`
- **State:** `email`, `password`, `isLoading`
- **Hooks:** `useRouter`, `useUser` (`login`), `useApi` (`post`)
- **API:** `POST /auth/login` (no token)
- **Flow:** On success → redirects to 2FA if `user.twoFactorEnabled`, else calls `login()` which redirects to `/home`. On 2FA-required error → saves credentials to sessionStorage and navigates to `/verify-2fa`.
- **Edge cases:** Disabled button until both fields filled; `isLoading` blocks double-submit.

### `Signup.tsx`
- **State:** `formData` (firstName, lastName, email, phone, password, whatsappReminders), `isLoading`
- **Hooks:** `useUser` (`login`), `useApi` (`post`)
- **API:** `POST /auth/register` (no token)
- **Flow:** On success with token → calls `login()` which redirects to `/home`. On error → displays `apiError` below password field.
- **WhatsApp checkbox:** Toggles `whatsappReminders` boolean; custom checkbox (no shadcn switch/checkbox — inline SVG checkmark).

### `ForgotPassword.tsx`
- **State:** `email`
- **Hooks:** `useRouter`, `useApi` (`post`, `loading`, `error`)
- **API:** `POST /auth/forgot-password` (no token)
- **Flow:** On success → `toast.success` with message, then after 1.5s navigates to `/verify-otp?email=...&type=reset`.

### `VerifyOTP.tsx`
- **State:** `otp` (string[6]), `timer` (60s countdown), `isLoading`
- **Hooks:** `useRouter`, `useSearchParams`, `useUser` (`login`), `useApi` (`post`)
- **API:** `POST /auth/verify-otp` (signup) or `POST /auth/verify-reset-otp` (password reset) — determined by `type` search param.
- **Flow:** On verify → if `type=reset`, navigates to `/create-new-password` with the `resetToken`. If signup → calls `login()`. Timer counts down from 60; resend enabled at 0.

### `Verify2FA.tsx`
- **State:** `otp` (string[6]), `isLoading`
- **Hooks:** `useSearchParams`, `useUser` (`login`), `useApi` (`post`)
- **API:** `POST /auth/login` (with `twoFactorCode`) — no token
- **Flow:** Reads stored credentials from `sessionStorage` (`taxable_temp_email`, `taxable_temp_password`), sends with 2FA code. On success → `login()`. Clears sessionStorage.

### `CreateNewPassword.tsx`
- **State:** `password`, `confirmPassword`, `isLoading`
- **Hooks:** `useSearchParams`, `useApi` (`post`)
- **API:** `POST /auth/reset-password` (with `email`, `resetToken`, `newPassword`)
- **Flow:** Validates password match; submits reset. On success → response; on error → displays apiError.

---

## Shared Layout — `OnboardingLayout`

File: `src/components/OnboardingLayout/OnboardingLayout.tsx`

All auth screens use `OnboardingLayout` as their shell. It provides:

- **Left panel** (45% / 40% width): Brand content — logo, headline, tagline. `bg-taxable-blue` with `overflow-hidden`.
- **Right panel** (55% / 60% width): The screen content. `overflow-y-auto` with `data-lenis-prevent` to allow native trackpad/touch scrolling.
- **Lenis smooth-scroll:** Initialized on mount (targets window). The right panel uses `data-lenis-prevent` so Lenis does not hijack wheel events inside the scrollable form area — this prevents the trackpad scroll being trapped (applied as a fix).

### Layout structure
```
min-h-screen md:h-screen md:overflow-hidden
├── Left (md:w-[45%])
│   ├── Logo
│   └── Tagline block
└── Right (md:w-[55%]) data-lenis-prevent overflow-y-auto
    └── {children}
```

### Breakpoints
- **Mobile (< md):** Stacked vertically, both panels `w-full`. No `overflow-hidden`, page scrolls naturally.
- **Desktop (≥ md):** Side-by-side. Left `w-[45%]`, right `w-[55%]`. At `≥ lg`: left `w-[40%]`, right `w-[60%]`.

---

## UI Components

### `Input` (`src/components/ui/input.tsx`)
Base input component (wraps `<input>`). Spec:
- Height: `h-10` (40px)
- Border (inactive): `border-neutral-200` (`#e5e5e5`)
- Border (focus): `border-neutral-800` with `ring-1 ring-neutral-800`
- Error: `aria-invalid:border-destructive` + `aria-invalid:ring-destructive/20`
- Text: `text-sm font-medium text-neutral-800`; placeholder: `text-neutral-300`
- Background: `bg-white`
- Padding: `px-3`
- Radius: `rounded-xl`

### `Label` (`src/components/ui/label.tsx`)
Wraps `@radix-ui/react-label`. Text: `text-2 font-medium text-neutral-800 leading-none`. See "Fixes" section for the `tailwind-merge text-2` regression.

### `PasswordInput` (`src/components/ui/password-input.tsx`)
Composed of `Label` + `InputGroup` (shadcn) with inline eye/eye-off toggle. Props: `label`, `hint`, `error`. Error state uses `data-invalid` + `aria-invalid`.

### `OtpInput` (`src/components/ui/otp-input.tsx`)
6-digit input, each digit a single-character `Input` (`w-12 h-12` / `md:w-14 md:h-14`, `text-5` / `md:text-7 font-bold`). Features: auto-focus next input on entry, backspace to previous, `onComplete` callback when all 6 digits entered.

### `Spinner`
Simple loading spinner icon, used as button child during loading. Replaces button text entirely when active.

### Button pattern (plain `<button>`, not shadcn `Button`)
- Height: `h-12` (48px)
- Text: `text-3 font-semibold`
- Radius: `rounded-xl`
- Active: `bg-taxable-blue text-white`
- Disabled: `disabled:bg-neutral-100 disabled:text-neutral-400`
- Loading: `<Spinner />` replaces text, button stays visually active

---

## Design System (Auth-specific)

### Typography
| Element | Class | Size |
|---|---|---|
| Headings | `text-7 font-semibold tracking-[-0.02em]` | 24px |
| Subheadings (VerifyOTP) | `text-6 md:text-7 font-bold` | 21px / 24px |
| Body / subtext | `text-2 font-medium tracking-[-0.01em]` | 13px |
| Input labels | `text-2 font-medium` | 13px |
| Button text | `text-3 font-semibold` | 15px |
| Forgot-password link | `text-2 font-medium` | 13px |

### Spacing
| Between | Value | Class |
|---|---|---|
| Header block → Input block | 40px | `mb-10` |
| Heading → Subtext | 4px | `mb-1` |
| Label → Input | 4px | `gap-1` |
| Input blocks | 40px | `space-y-10` |
| CTA button group | 12px | `gap-3` |

### Colors
- Body text: `text-neutral-400` (`#a3a3a3`)
- Input text: `text-neutral-800` (`#262626`)
- Input label: `text-neutral-800`
- Links (secondary action): `text-neutral-800 font-bold` or `font-semibold`
- Primary CTA: `bg-taxable-blue text-white`
- Disabled CTA: `bg-neutral-100 text-neutral-400`
- Error: `text-red-500`

### Input border states
| State | Class | Color |
|---|---|---|
| Inactive (default) | `border-neutral-200` | `#e5e5e5` |
| Focus | `ring-neutral-800 border-neutral-800` | `#262626` |
| Error | `aria-invalid:border-destructive` | `oklch(0.577 0.245 27.325)` |

---

## State Management

### `UserContext` (`src/contexts/UserContext.tsx`)
Provides: `user`, `login(token, user)`, `logout()`, `isAuthenticated`. `login()` stores token in localStorage and user in state, then calls `router.push('/home')`.

### `useApi` (`src/hooks/useApi.ts`)
Generic HTTP hook. Returns `{ get, post, loading, error }`. Auto-handles 401 (calls `logout()`). Auth screens call with `{ useToken: false }` option since the user is not yet authenticated.

---

## Fixes Applied

### `text-2` stripped by `tailwind-merge`
**Date:** June 2026
**File:** `src/lib/utils.ts`
**Cause:** `tailwind-merge` v3 default config only accepts T-shirt size names (`xs/sm/md/lg/xl`) in the `text-*` font-size namespace. Bare `text-2` was classified as a text-COLOR utility, so `cn('text-2 font-medium text-neutral-800 ...')` stripped the `text-2` class, causing the label's font-size to fall back to the body default (15px). Labels were rendering at 15px instead of 13px.
**Fix:** Registered `text-1`..`text-15` as known font-size values via `extendTailwindMerge({ extend: { theme: { text: [...] } } })` in `utils.ts`. Labels now correctly render at 13px.

### Trackpad scroll blocked on sign-up
**Date:** June 2026
**File:** `src/components/OnboardingLayout/OnboardingLayout.tsx`
**Cause:** Lenis smooth-scroll instance hijacks wheel events on the window, but the layout's root has `md:overflow-hidden` (window can't scroll). The real scroll container (right panel, `overflow-y-auto`) was never given to Lenis, so Lenis consumed wheel events and did nothing. Two-finger trackpad scroll was inert at 100% zoom.
**Fix:** Added `data-lenis-prevent` attribute to the right-panel scroll container — Lenis ignores wheel events inside that element and native trackpad scrolling works. Matches the existing convention used in `BusinessVATWHT.tsx`.

### Input border color toggled
**Date:** June 2026
**File:** `src/components/ui/input.tsx`
**History:** Changed `border-neutral-200` → `border-neutral-100` → back to `border-neutral-200`.

---

## Related Files

```
src/app/signin/page.tsx              — Route wrapper
src/app/signup/page.tsx              — Route wrapper
src/app/forgot-password/page.tsx     — Route wrapper
src/app/verify-otp/page.tsx          — Route wrapper (Suspense)
src/app/verify-2fa/page.tsx          — Route wrapper (Suspense)
src/app/create-new-password/page.tsx — Route wrapper (Suspense)
src/screens/Auth/SignIn.tsx
src/screens/Auth/Signup.tsx
src/screens/Auth/ForgotPassword.tsx
src/screens/Auth/VerifyOTP.tsx
src/screens/Auth/Verify2FA.tsx
src/screens/Auth/CreateNewPassword.tsx
src/components/OnboardingLayout/OnboardingLayout.tsx
src/components/OnboardingLayout/LogoWhite.tsx
src/components/ui/input.tsx
src/components/ui/label.tsx
src/components/ui/password-input.tsx
src/components/ui/otp-input.tsx
src/components/ui/spinner.tsx
src/lib/utils.ts
src/contexts/UserContext.tsx
src/hooks/useApi.ts
src/types/api.ts
```

---

## Changelog — Auth Refactor (June 2026)

### Critical Fixes
- **CreateNewPassword success feedback** — Added `toast.success()` + `router.push('/signin')` after successful password reset. Added `try/catch` error logging. Previously the user was left stranded on the form with no indication of success.
- **ForgotPassword error logging** — Added `try/catch` around the API call so network/server errors are logged to console.
- **Auth response types** — Added `User`, `AuthResponse`, `AuthVerifyResponse`, `AuthResetPasswordResponse` interfaces to `src/types/api.ts`. `UserContext.tsx` now imports `User` from the shared types file instead of defining it inline.
- **Orphaned route removed** — Deleted `/reset-password` (duplicate of `/create-new-password`, never linked from any auth screen).
- **2FA dead cleanup removed** — `sessionStorage.removeItem('taxable_temp_token')` in `Verify2FA.tsx` was clearing a key that was never written. Removed.

### Dead Code Removed
- `SpinnerCustom` — exported but never imported (`spinner.tsx`)
- `_Divider` component — defined in SetupSidebar but never used
- `_shouldRedirectAfterLoading` — state always `true`, never read
- `_businessServices` — state never read
- `_handleNewProfileCreated` — callback in Home.tsx, never called
- `_user` — destructured from `useUser()` in `DashboardHeader.tsx` but never used
- `align` prop — in `InputGroupTextProps`, destructured as `_align` and ignored
- `data` state — in `useApi.ts`, set on every response but never read by any caller
- `forwardRef` — removed misleading `forwardRef` on `OtpInput` (ref was never forwarded to DOM)

### Architecture
- **LogoWhite extracted** — Moved nested `LogoWhite` component from `OnboardingLayout.tsx` to a standalone file `src/components/OnboardingLayout/LogoWhite.tsx`, fixing the nested-component-definition pattern violation.
- **Console.log removed** — Three `console.log` calls removed from `SetupSidebar.tsx` (debug logging in production path).
- **Auto-redirect authenticated users** — `SignIn.tsx`, `Signup.tsx`, and `ForgotPassword.tsx` now redirect to `/home` via `useEffect` when `isAuthenticated` is already true.
- **API proxy** — `next.config.ts` now rewrites `/api/proxy/:path*` → `https://api.gettaxable.com/api/:path*`. Default `API_BASE_URL` switched to `/api/proxy` (relative, same-origin), eliminating cross-origin "Failed to fetch" errors.
- **Login redirects** — All four `login()` call sites (`SignIn`, `Signup`, `Verify2FA`, `VerifyOTP`) now call `router.push('/home')` after successful auth.

### Accessibility
- **`prefers-reduced-motion`** — Lenis smooth-scroll initialization in `OnboardingLayout.tsx` now checks `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and skips initialization entirely when the user prefers reduced motion.
- No other a11y changes in this pass (forms are semantic, labels use `<label>` with `htmlFor`, keyboard navigation works via native form controls).

### Lint & Verification
- `npm run lint`: 0 errors, 8 pre-existing warnings (all from TaxFolders screens, not auth).
- `npx tsc --noEmit`: 0 errors.
- No hydration warnings, no test regressions.

