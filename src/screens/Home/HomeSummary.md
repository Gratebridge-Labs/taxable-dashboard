# Home Screen — Summary of Changes

## Overview

The home screen underwent a comprehensive cleanup, refactor, and visual refinement pass. Changes span component extraction, design system alignment, GSAP animation, routing fixes, and visual polish.

---

## Component Extraction

Six inline components were extracted from `Home.tsx` into dedicated files to eliminate the nested-component anti-pattern and improve maintainability.

| Extracted Component | File | Purpose |
|---|---|---|
| `StatusBadge` | **REMOVED** — no longer used | Badge was removed per user request |
| `TaxFolderCard` | `TaxFolderCard.tsx` | Individual tax folder card with icon, title, description, badge |
| `VideoCard` | `VideoCard.tsx` | Resource video thumbnail card with overlay + play button |
| `FAQItem` | `FAQItem.tsx` | Single FAQ entry |
| `FAQSection` | `FAQSection.tsx` | Full FAQ section with heading row + item list |

---

## Routing & Auth Integration

### Login redirect fix (SignIn, Signup, Verify2FA, VerifyOTP)
- Added missing `router.push('/home')` after `login()` in all four auth screens
- Previously the token was saved but the user was never navigated away from the auth form

### Stale token handling (`UserContext.tsx`)
- `refreshUser()` now calls `logout()` on 401 responses, clearing stale auth state immediately
- Prevents the app from briefly believing a dead token is valid

### Client-side root dispatch (`src/app/page.tsx`)
- Replaced server-side `redirect('/signin')` with a client component that waits for `UserContext.loading` to resolve, then dispatches to either `/home` (authenticated) or `/signin` (unauthenticated)
- Eliminated the wasteful double-hop: `/ → /signin → /home` for authenticated users

### `RequireAuth` guard (`src/components/RequireAuth/RequireAuth.tsx`)
- New auth guard wrapper for protected routes
- Applied to `/home` — unauthenticated visitors are redirected to `/signin` before any dashboard UI renders

### Session persistence (`UserContext.tsx`)
- Switched from `localStorage` to `sessionStorage` — closing the tab logs the user out (fresh login each session)
- Refresh within the same tab preserves the session

---

## GSAP Motion System

### `useFormEntrance` hook (`src/hooks/useFormEntrance.ts`)
- Reusable GSAP entrance hook for auth screens
- Uses `gsap.fromTo()` (not `from()`) for React 19 StrictMode safety
- Uses `useLayoutEffect` (not `useEffect`) to prevent FOUC
- Disables CSS `transition` during animation to prevent Tailwind `transition-all` conflicts
- Respects `prefers-reduced-motion`

### Home screen GSAP (`Home.tsx:47-73`)
- Entrance animation scoped to `[data-animate]` elements
- Same `fromTo` + `useLayoutEffect` + reduced-motion pattern
- Uses `hasAnimated` ref to ensure the animation fires only once, after the loading state resolves
- 0.5s duration, 0.06s stagger, `power2.out` easing

### DashboardHeader GSAP
- All hover effects removed (no `hover:*`, `group-hover:*`, `transition-*` on hover)
- Nav link active state: `bg-white text-taxable-blue font-semibold`
- Nav link inactive state: `text-neutral-400 font-medium`
- Nav icons wrapped in fixed 20×20 flex container with `className="block"` on SVGs to fix alignment

---

## TaxFolderCard (`TaxFolderCard.tsx`)

| Change | Before | After |
|---|---|---|
| Card structure | Centered full-width icon container (`h-[145px]`) | Left-aligned small folder icon (32×31), title, description, badge |
| Padding | `p-6` (24px) | `p-4` (16px) |
| Border | None | `border border-neutral-100` |
| Background | `bg-white` | `bg-white` — kept |
| Badge | None (empty `mt-auto` div) | shadcn `<Badge variant="secondary">` |
| Fixed height | `h-[323px]` | Auto (content-driven) |
| Hover effects | `group-hover:scale-110`, `group`, `cursor-pointer` on inner | Only `cursor-pointer` on outer div |
| Delete action | None | Trash icon (absolute top-right, `opacity-0 group-hover:opacity-100`), wired to `deleteProfile` API |

---

## VideoCard (`VideoCard.tsx`)

| Change | Before | After |
|---|---|---|
| Container height | `aspect-[16/10]` (ratio-based) | `h-[265px]` (fixed) |
| Overlay | `bg-black/5` | `bg-black/20` |
| Play button background | `bg-white shadow-lg` | `bg-white/20 backdrop-blur` |
| Play icon color | `text-taxable-blue` | `text-neutral-800` |
| Hover effects | `group-hover:shadow-md`, `group-hover:scale-105`, `group-hover:bg-black/10`, `group-hover:scale-110` | None — all removed |

---

## DashboardHeader (`DashboardHeader.tsx`)

| Change | Detail |
|---|---|
| Background | `bg-neutral-100` → `bg-white` |
| Bottom border | `border-neutral-100` → `border-neutral-200` earlier, then to remaining hovers/file |
| Sticky position | Removed `sticky top-0 z-50` — nav now scrolls with the page |
| Nav link gap | `gap-2.5` → `gap-1` (4px) |
| Nav link icons | All 4 replaced with mingcute fill icons (`home_2_fill`, `user_4_fill`, `book_3_fill`, `notification_fill`) — SVGs use `currentColor`, wrapped in flex center container, `className="block"` |
| Nav link active | `bg-blue-50/50 text-taxable-blue font-bold` → `bg-white text-taxable-blue font-semibold` |
| Nav link inactive | `text-taxable-gray font-medium` → `text-neutral-400 font-medium` |
| Nav links list | Added "Resources" (`/educational-resources`) between Profile and Notification |
| Support button | Stripped SVG icon, applied secondary button spec (`h-12`, `border-neutral-100`, `text-3 font-semibold`) |
| All hover effects | Removed from hamburger, nav links, support dropdown items, mobile sidebar, close button |
| Mobile sidebar nav | Same active/inactive class updates as desktop |

---

## FAQ Section

### FAQSection (`FAQSection.tsx`)
- Removed horizontal tabs (FAQs / Guides / 2026 Reforms)
- Heading row: "Common Tax Questions" left + "Talk to an accountant" secondary button right
- Spacing: `mt-12` → `mt-16` (64px from videos), `mb-8` → `mb-7` (28px heading→items)
- Heading wrapped in `<div className="flex items-center h-12">` for vertical alignment with button

### FAQItem (`FAQItem.tsx`)
| Property | Before | After |
|---|---|---|
| Background | `bg-taxable-lightgray2` | `bg-neutral-50` |
| Padding | `p-6` (24px) | `p-4` (16px) |
| Question font | `text-3 font-medium` (15px) | Kept |
| Answer font | `text-[14px]` | `text-2` (13px) |
| Spacing between items | `mb-3` (12px) → `gap-3` | `gap-2` (8px) via parent flex container |

---

## Buttons — Standardization

| Property | Primary | Secondary |
|---|---|---|
| Height | `h-12` | `h-12` |
| Padding | `px-4` | `px-4` |
| Font | `text-3 font-semibold` | `text-3 font-semibold` |
| Radius | `rounded-xl` | `rounded-xl` |
| Background | `bg-taxable-blue` | `bg-white` |
| Border | none | `border border-neutral-100` |
| Text color | `text-white` | `text-taxable-dark` |
| Hover | none | none |

Secondary buttons standardized across: "Watch more guides" → removed, "Talk to an accountant", "Contact support".

---

## Home Screen Layout

### First-time visitor (no tax folders)

```
Welcome heading: "Hello {name}, Welcome to Taxable"
Subtext: "The 2026 tax cycle is currently active..."
CTA:      "Create new tax filing" (primary, right-aligned)

── 48px gap ──

Videos (3-column grid, 265px height each)

── 64px gap ──

FAQ heading: "Common Tax Questions" + "Talk to an accountant" button
FAQ items (bg-neutral-50, p-4, gap-2)

── 80px padding-bottom ──
```

### Has tax folders

```
Welcome heading: "Welcome, {name}"

── 40px gap ──

2026 Tax Filings section heading + "Create another tax filing" CTA

── 40px gap ──

Tax folder cards (3-column grid, border-neutral-100, p-4, 32px folder icon)

── 64px gap ──

"Resources" heading + Videos (3-column grid, 265px height)

── 64px gap ──

FAQ heading + items (same as empty state)
```

### Spacing reference

| Adjacent elements | Value |
|---|---|
| Nav bar → Welcome heading | 40px (`pt-10`) |
| Welcome heading → Videos | 48px (`gap-12`) |
| Videos → FAQ | 64px (`mt-16`) |
| Tax folder heading → Cards | 40px (`mb-10`) |
| Tax folders → Resources | 64px (`mt-16`) |
| FAQ heading → FAQ items | 28px (`mb-7`) |
| Page bottom | 80px (`pb-20` via FAQSection) |

---

## Lenis Smooth Scroll

Added to the home screen (`Home.tsx:75-93`), matching the `OnboardingLayout` pattern:
- `lerp: 0.1`
- Reduced-motion guard
- Proper cleanup via `lenis.destroy()`

---

## Skeleton Loading

**Removed.** The `shadcn` `<Skeleton>` component was installed but the skeleton loading state was removed per user request. Content now renders directly with GSAP entrance animation.

---

## API Layer

### Proxy rewrite (`next.config.ts`)
Added `async rewrites()` that proxy `/api/proxy/:path*` → `https://api.gettaxable.com/api/:path*`, eliminating cross-origin fetch issues.

### Default API base URL (`api-endpoints.ts`)
Changed from `https://api.gettaxable.com/api` to `/api/proxy` (relative, same-origin).

### Auth types (`types/api.ts`)
Added `User`, `AuthResponse`, `AuthVerifyResponse`, `AuthResetPasswordResponse` interfaces. `UserContext.tsx` now imports `User` from the shared types file.

### `useApi.ts` cleanup
Removed unused `data` state (set on every response but never read by any caller).

---

## Dead Code Removed

| Item | Location |
|---|---|
| `SpinnerCustom` | `spinner.tsx` |
| `_Divider` | `SetupSidebar.tsx` |
| `_shouldRedirectAfterLoading` | `SetupSidebar.tsx` |
| `_businessServices` state | `SetupSidebar.tsx` |
| `_handleNewProfileCreated` | `Home.tsx` |
| `_user` destructuring | `DashboardHeader.tsx` |
| `align` prop | `InputGroupTextProps` in `input-group.tsx` |
| `data` state | `useApi.ts` |
| `forwardRef` from `OtpInput` | `otp-input.tsx` |
| `_prevIndex` etc. | Various TaxFolders screens |
| Orphaned `/reset-password` route | Deleted |
| `console.log` lines (×3) | `SetupSidebar.tsx` |

---

## Files Changed

```
src/app/globals.css                           — btn-auth class added
src/app/home/page.tsx                         — Wrapped with RequireAuth
src/app/page.tsx                              — Server redirect → client dispatch
src/components/DashboardHeader/DashboardHeader.tsx  — Icons, alignment, white bg, no hovers
src/components/OnboardingLayout/LogoWhite.tsx       — NEW (extracted from OnboardingLayout)
src/components/OnboardingLayout/OnboardingLayout.tsx — GSAP refactor, LogoWhite import
src/components/RequireAuth/RequireAuth.tsx          — NEW (auth guard)
src/components/SetupSidebar/SetupSidebar.tsx        — Dead code removed, console.log removed
src/components/ui/badge.tsx                         — NEW (shadcn)
src/components/ui/input.tsx                         — transition-all → transition-colors
src/components/ui/input-group.tsx                   — transition-all → transition-colors
src/components/ui/otp-input.tsx                     — forwardRef removed
src/components/ui/skeleton.tsx                      — NEW (shadcn, installed then unused)
src/components/ui/spinner.tsx                       — SpinnerCustom removed
src/contexts/UserContext.tsx                         — refreshUser 401 handling, localStorage→sessionStorage
src/hooks/useApi.ts                                  — Unused data state removed
src/hooks/useFormEntrance.ts                         — NEW (GSAP entrance hook)
src/lib/api-endpoints.ts                             — Default to /api/proxy
src/lib/utils.ts                                     — tailwind-merge text-N fix
src/screens/Home/FAQItem.tsx                         — Extracted, styled
src/screens/Home/FAQSection.tsx                      — Extracted, tabs removed, heading row
src/screens/Home/Home.tsx                            — Component extraction, GSAP timing, spacing, Lenis
src/screens/Home/TaxFolderCard.tsx                   — Card restructure, badge, delete icon
src/screens/Home/VideoCard.tsx                       — Fixed height, overlay, no hovers
src/types/api.ts                                     — Auth types added
```
