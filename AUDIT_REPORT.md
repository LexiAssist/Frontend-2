# LexiAssist Frontend — Comprehensive Engineering Audit Report

**Audit Date:** 2026-04-20
**Auditor:** Frontend Developer Agent
**Guide Reference:** `engineering-frontend-developer.md`
**Scope:** Full codebase audit — no changes made

---

## Executive Summary

The LexiAssist frontend is a **modern Next.js 16 application** built with React 19, TypeScript, Tailwind CSS v4, and a shadcn/ui-inspired design system. It demonstrates **strong architectural decisions** in state management (Zustand + React Query), error handling, and component organization. However, the codebase has **critical gaps in testing infrastructure, image optimization, and CI/CD automation** that must be addressed before production scale.

| Category | Score | Status |
|----------|-------|--------|
| Component Architecture | 8/10 | Good |
| Performance Optimization | 5/10 | Needs Work |
| Accessibility (a11y) | 6/10 | Partial |
| Code Quality & TypeScript | 7/10 | Good |
| Testing & QA | 2/10 | Critical |
| CI/CD & Automation | 1/10 | Critical |
| Security & Error Handling | 7/10 | Good |

---

## 1. UI Implementation & Component Architecture

### What's Working Well

- **Framework:** Next.js 16.1.6 with App Router, React 19.2.3, Turbopack. Modern, cutting-edge stack.
- **Design System:** `src/components/ui/` contains ~50 shadcn/ui-style primitives using Radix UI, CVA (`class-variance-authority`), and `cn()` utility (`clsx` + `tailwind-merge`).
- **Component Patterns:**
  - Interface-driven props with HTML attribute extension (`React.ButtonHTMLAttributes`, `React.ComponentProps<"div">`)
  - `React.forwardRef` consistently used for composable primitives
  - Compound component pattern in `Card.tsx` (`CardHeader`, `CardContent`, etc.)
  - Barrel exports (`src/components/index.ts`, `src/components/ui/index.ts`)
- **Separation of Concerns:**
  - UI primitives → `components/ui/` (presentational only)
  - Feature components → `components/goals/`, `components/chat/`
  - Page logic → `app/(main)/*/page.tsx`
  - Data access → `src/hooks/`
- **State Management:** Clean dual-store architecture:
  - **Zustand** (`src/store/authStore.ts`) for client auth state with localStorage persistence
  - **React Query v5** (`@tanstack/react-query`) for server state with structured query keys and cache invalidation
- **Animation:** `framer-motion` used for entrance animations, hover effects, and layout transitions. Landing page respects `useReducedMotion()`.

### Issues & Risks

| Issue | Severity | Location |
|-------|----------|----------|
| No widespread `React.memo` usage | Low | Components rely on React Compiler (`reactCompiler: true`) for automatic memoization |
| `next/dynamic` only used for illustrations | Low | Limited code-splitting beyond Next.js defaults |
| Duplicate toast libraries | Low | Both `react-hot-toast` and `sonner` installed; `SyncProvider.tsx` imports from `react-hot-toast` while other areas may use `sonner` |

---

## 2. Performance Optimization

### Critical Findings

| # | Finding | Severity | Details |
|---|---------|----------|---------|
| 1 | **Images globally unoptimized** | 🔴 Critical | `next.config.ts` sets `images: { unoptimized: true }`. This disables Next.js built-in WebP/AVIF conversion, responsive sizing, and lazy loading. All `next/image` usage (~13 files, 400+ icons) bypasses optimization entirely. |
| 2 | **No bundle analyzer** | 🟡 Medium | `@next/bundle-analyzer` not installed. No visibility into bundle size bloat. |
| 3 | **No performance monitoring** | 🟡 Medium | `web-vitals` package not installed. No RUM, no `useReportWebVitals`, no `@vercel/speed-insights`. |
| 4 | **No PWA / Service Worker** | 🟡 Low | No offline support, no `manifest.json`, no `workbox`. |

### What's Working Well

- **React Compiler enabled** (`reactCompiler: true`) — automatic memoization without manual `useMemo`/`useCallback`.
- **Turbopack** configured as build system.
- **Standalone output** in production for optimized Docker deployments.
- **Dynamic imports** for heavy SVG illustrations in dashboard/reading-assistant with skeleton fallbacks.
- **React Query caching** with sensible defaults (`staleTime: 60s`, `refetchOnWindowFocus: false`).

### Recommendations (High Impact)

1. **Remove `unoptimized: true`** from `next.config.ts` — single biggest performance win.
2. **Add `@next/bundle-analyzer`** to identify large dependencies.
3. **Install `web-vitals`** and report Core Web Vitals to an analytics endpoint.
4. **Add `loading.tsx` and `error.tsx` boundaries** at route segments beyond root.
5. **Use `placeholder="blur"`** on above-the-fold images for better perceived performance.

---

## 3. Accessibility (a11y) Implementation

### What's Working Well

| Pattern | Location |
|---------|----------|
| Semantic HTML | `<main>`, `<nav>`, `<aside>`, `<header>`, `<footer>`, `<section>` used in layouts |
| ARIA in UI primitives | `sidebar.tsx` (`aria-label="Toggle Sidebar"`), `pagination.tsx` (`aria-current="page"`), `breadcrumb.tsx` (`aria-label="breadcrumb"`), `carousel.tsx` (`role="region"`, `aria-roledescription="carousel"`) |
| Focus management | Global `:focus-visible` styles in `globals.css` (outline: 2px solid primary-600) |
| Radix UI primitives | Dialog, Sheet, Select, NavigationMenu provide built-in focus trapping and restoration |
| Screen reader support | `sr-only` class used for hidden labels in Dialog, Sheet, Sidebar, Carousel, Pagination, Breadcrumb |
| Form accessibility | `htmlFor` + `id` label association, `aria-describedby`, `aria-invalid` in `form.tsx` |
| Reduced motion | `LandingPage.tsx` uses `framer-motion`'s `useReducedMotion()` with `<StaticLandingPage>` fallback |
| Touch targets | `.touch-target` utility enforces 44px minimum |

### Critical & Important Gaps

| # | Gap | Severity | Location |
|---|-----|----------|----------|
| 1 | **Upload drop zone not keyboard-accessible** | 🔴 Critical | `reading-assistant/page.tsx`: `motion.div` with `onClick`/`onDrop` but no `tabIndex`, `role="button"`, or `Enter`/`Space` handler |
| 2 | **`SidebarRail` has `tabIndex={-1}`** | 🔴 Critical | `src/components/ui/sidebar.tsx` line ~290: Interactive element is completely unreachable by keyboard |
| 3 | **No `prefers-reduced-motion` outside landing page** | 🟡 Medium | `framer-motion` used extensively in dashboard, chat, sidebar without `useReducedMotion()` checks |
| 4 | **Many icon-only buttons lack `aria-label`** | 🟡 Medium | `reading-assistant/page.tsx`, `chat-assistant/page.tsx` — screen readers announce nothing |
| 5 | **Custom dropdowns lack ARIA roles** | 🟡 Medium | `reading-assistant/page.tsx` font/difficulty/tint pickers need `role="listbox"`, `aria-expanded`, `aria-selected` |
| 6 | **`DimmedText` only responds to mouse** | 🟡 Medium | `reading-assistant/page.tsx`: `onMouseEnter`/`onMouseLeave` with no keyboard equivalent |
| 7 | **No automated a11y testing** | 🟡 Medium | No `jest-axe`, `axe-core`, or `@axe-core/react` installed |
| 8 | **Decorative icons not hidden** | 🟢 Low | `Icon.tsx` gives generic `alt` text to all icons; many should be `aria-hidden` |

### Recommendations

1. Add `tabIndex={0}`, `role="button"`, and `onKeyDown` to the upload drop zone.
2. Remove `tabIndex={-1}` from `SidebarRail` or make it non-interactive.
3. Wrap all `framer-motion` page transitions with `useReducedMotion()` checks.
4. Audit all `<button>` elements containing only icons and add `aria-label`.
5. Install `jest-axe` and add accessibility assertions to existing tests.

---

## 4. Code Quality, TypeScript & Error Handling

### What's Working Well

| Area | Assessment |
|------|------------|
| TypeScript Config | `strict: true`, `isolatedModules: true`, `moduleResolution: bundler` — excellent |
| Type Patterns | Explicit interfaces, `React.ComponentProps` passthrough, `forwardRef` typing |
| Error Architecture | `APIError` class with `statusCode`, `code`, `fieldErrors`, `retryAfter`. HTTP status mapping to user-friendly messages |
| Error Boundaries | `ErrorBoundary.tsx` class-based boundary with fallback UI, reset/reload buttons |
| Auth & Token Management | Proactive refresh (1-min interval + visibilitychange), request deduplication/queuing during refresh, session expiry redirect |
| Input Sanitization | `isomorphic-dompurify` and `sanitizeInput` utility present for XSS prevention |
| HTTP Client | `APIClient` class with exponential backoff retry (3 retries), dual timeout configs (30s / 5min for AI), token refresh queuing |

### Issues & Risks

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| 1 | **Two parallel HTTP abstractions** | 🟡 Medium | `services/http.ts` (`APIClient`) and `services/api.ts` (`fetchWithAuth`) both implement token refresh independently — risk of race conditions and duplication |
| 2 | **Auth pages don't use `react-hook-form`** | 🟡 Medium | Login/register use manual `useState` + `onChange` despite `react-hook-form` being in dependencies and UI kit |
| 3 | **`zod` only used for env validation** | 🟡 Medium | No runtime form schema validation with Zod; validation is regex-based in components |
| 4 | **Sentry placeholder without Sentry installed** | 🟢 Low | `ErrorBoundary.tsx` references `(window as any).Sentry` but Sentry is not in `package.json` |
| 5 | **`skipLibCheck: true`** | 🟢 Low | Hides potential type issues in dependencies |
| 6 | **`target: ES2017`** | 🟢 Low | Slightly dated; Next.js 16 supports newer targets |

---

## 5. Testing & Quality Assurance

### Critical Findings

| # | Finding | Severity |
|---|---------|----------|
| 1 | **No test runner installed** | 🔴 Critical | 8 test files exist but `vitest`, `@testing-library/react`, `jsdom` are NOT in `package.json`. Tests are completely un-runnable. |
| 2 | **No test scripts in package.json** | 🔴 Critical | No `"test"`, `"test:unit"`, `"test:integration"`, or `"test:e2e"` scripts. |
| 3 | **No E2E testing framework** | 🟡 Medium | No Playwright, Cypress, or Puppeteer. |
| 4 | **No component tests for 50+ UI primitives** | 🟡 Medium | Only integration-style hook tests and 1 session-management component test exist. |
| 5 | **No coverage reporting** | 🟡 Medium | No `c8` or `@vitest/coverage-v8` configured. |

### Test Files Inventory (Non-Functional)

| File | Type | Status |
|------|------|--------|
| `src/lib/__tests__/errorHandler.test.ts` | Unit | Unrunnable |
| `src/lib/__tests__/sanitize.test.ts` | Unit | Unrunnable |
| `src/services/__tests__/http.test.ts` | Unit | Unrunnable |
| `src/app/(main)/chat-assistant/__tests__/chat-integration.test.tsx` | Integration | Unrunnable |
| `src/app/(main)/dashboard/__tests__/analytics-integration.test.tsx` | Integration | Unrunnable |
| `src/app/(main)/settings/__tests__/profile-management.test.tsx` | Integration | Unrunnable |
| `src/app/(main)/settings/__tests__/session-management.test.tsx` | Component | Unrunnable |
| `src/app/(main)/text-to-speech/__tests__/tts-integration.test.tsx` | Integration | Unrunnable |

---

## 6. CI/CD, Linting & Automation

### Critical Findings

| # | Finding | Severity |
|---|---------|----------|
| 1 | **No CI/CD pipelines** | 🔴 Critical | No `.github/workflows/`, no `.gitlab-ci.yml`, no automation whatsoever. |
| 2 | **No Prettier config** | 🟡 Medium | No `.prettierrc`, `prettier.config.*`, or `.editorconfig`. |
| 3 | **No pre-commit hooks** | 🟡 Medium | No Husky, lint-staged, or custom git hooks. |
| 4 | **No `tsc` type-check script** | 🟡 Medium | Types only checked implicitly during `next build`. |
| 5 | **Minimal ESLint config** | 🟢 Low | Flat config with Next.js defaults only; no custom rules. |

### Docker Setup (Good)

- `Dockerfile`: Multi-stage build, Node 20 Alpine, standalone output, non-root user — well-structured.
- `docker-compose.yml`: Frontend service defined; backend/DB commented out.

---

## 7. Security

### What's Working Well

| Control | Implementation |
|---------|---------------|
| CSP Headers | Comprehensive `Content-Security-Policy` with different policies for dev vs production |
| Security Headers | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `X-XSS-Protection`, `Permissions-Policy` |
| Input Sanitization | `DOMPurify` via `isomorphic-dompurify` for HTML sanitization |
| Auth Token Security | `httpOnly` not applicable (frontend-only), but tokens are managed via `TokenManager` with proactive refresh |

### Recommendations

- Consider adding `Strict-Transport-Security` header in production.
- Verify CSP `connect-src` in production matches actual API domains.

---

## Prioritized Action Plan

### Phase 1: Critical Blockers (Do First)

1. **Install test dependencies:** `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`
2. **Add test scripts** to `package.json` (`test`, `test:unit`, `test:integration`, `type-check`)
3. **Remove `images.unoptimized: true`** from `next.config.ts`
4. **Add CI/CD pipeline** (GitHub Actions) with build, lint, type-check, and test steps
5. **Fix keyboard accessibility** in `reading-assistant/page.tsx` upload drop zone
6. **Fix `SidebarRail` keyboard access** — remove `tabIndex={-1}` or make non-interactive

### Phase 2: High Impact Improvements

7. **Add Prettier** with `.prettierrc` and `format` script
8. **Add Husky + lint-staged** for pre-commit quality gates
9. **Add `@next/bundle-analyzer`** to identify bundle bloat
10. **Install `web-vitals`** and set up Core Web Vitals reporting
11. **Add `aria-label` to all icon-only buttons**
12. **Unify HTTP client** — consolidate `services/http.ts` and `services/api.ts` token refresh logic
13. **Use `react-hook-form` + `zod`** for auth page forms instead of manual state

### Phase 3: Polish & Monitoring

14. **Respect `prefers-reduced-motion`** across all `framer-motion` usage (not just landing page)
15. **Add `jest-axe`** and accessibility assertions to tests
16. **Add `loading.tsx` and `error.tsx`** at feature route segments
17. **Add E2E tests** with Playwright for critical auth + study flows
18. **Add `placeholder="blur"`** to above-the-fold images

---

## Appendix: Key Configuration Files Reference

| File | Status | Notes |
|------|--------|-------|
| `package.json` | ✅ Good | Modern deps, but missing test/formatting tools |
| `tsconfig.json` | ✅ Good | Strict mode enabled; `skipLibCheck: true` |
| `next.config.ts` | 🟡 Mixed | Good compiler + standalone; bad image config |
| `eslint.config.mjs` | 🟡 Minimal | Next.js defaults only |
| `postcss.config.mjs` | ✅ Good | Tailwind CSS v4 |
| `src/app/globals.css` | ✅ Good | Design tokens, focus styles, iOS-safe utilities |
| `Dockerfile` | ✅ Good | Multi-stage, Alpine, non-root |

---

*End of Audit Report — No changes were made to the codebase during this audit.*
